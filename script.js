import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    deleteDoc,
    query,
    where,
    updateDoc
} from './firebase-config.js';
import { getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to current button and corresponding pane
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Stop Loss Calculator functionality
    const marketRadios = document.querySelectorAll('input[name="market"]');
    const priceCurrencyLabel = document.getElementById('price-currency-label');
    const maxLossInput = document.getElementById('max-loss');
    const handlingFeeInput = document.getElementById('handling-fee');
    const buyingPriceInput = document.getElementById('buying-price');
    const stockQuantityInput = document.getElementById('stock-quantity');
    const calculateBtn = document.getElementById('calculate-btn');
    const stopLossResult = document.getElementById('stop-loss-result');
    const totalPriceHKD = document.getElementById('total-price-hkd');
    
    // Check if elements exist
    console.log("Element checks:");
    console.log("- maxLossInput:", maxLossInput);
    console.log("- handlingFeeInput:", handlingFeeInput);
    console.log("- buyingPriceInput:", buyingPriceInput);
    console.log("- stockQuantityInput:", stockQuantityInput);
    console.log("- calculateBtn:", calculateBtn);
    console.log("- stopLossResult:", stopLossResult);
    console.log("- totalPriceHKD:", totalPriceHKD);
    console.log("- priceCurrencyLabel:", priceCurrencyLabel);
    
    // Add a direct assignment to stopLossResult to confirm it works
    if (stopLossResult) {
        stopLossResult.textContent = "Ready for calculation";
    } else {
        console.error("stop-loss-result element not found!");
    }
    
    // Exchange rate (approximate, should be updated with real-time data in production)
    const usdToHkdRate = 7.8;
    
    // Currency conversion function
    function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount; // No conversion needed
        }
        
        if (fromCurrency === 'USD' && toCurrency === 'HKD') {
            return amount * usdToHkdRate; // Convert USD to HKD
        }
        
        if (fromCurrency === 'HKD' && toCurrency === 'USD') {
            return amount / usdToHkdRate; // Convert HKD to USD
        }
        
        return amount; // Default fallback
    }
    
    // First, add a simple direct function at the top level
    function updateTotalDirectly() {
        try {
            const priceInput = document.getElementById('buying-price');
            const quantityInput = document.getElementById('stock-quantity');
            const totalDisplay = document.getElementById('total-price-hkd');
            const isUS = document.getElementById('us-market').checked;
            
            if (!priceInput || !quantityInput || !totalDisplay) {
                console.error("Missing elements for direct update");
                return;
            }
            
            const price = parseFloat(priceInput.value) || 0;
            const quantity = parseInt(quantityInput.value) || 0;
            
            // Calculate total
            let total = price * quantity;
            if (isUS) {
                // Convert from USD to HKD (using fixed rate 7.8)
                total = total * 7.8;
            }
            
            // Force update the display
            totalDisplay.innerHTML = `HK$${total.toFixed(2)}`;
            totalDisplay.style.color = '#ff6b6b';
            
            console.log("DIRECT UPDATE:", {price, quantity, total, isUS});
        } catch (e) {
            console.error("Error in direct update:", e);
        }
    }
    
    // Add setup to the DOMContentLoaded event
    setTimeout(function() {
        try {
            console.log("Setting up total investment calculation");
            
            const buyingPrice = document.getElementById('buying-price');
            const stockQuantity = document.getElementById('stock-quantity');
            const usMarket = document.getElementById('us-market');
            const hkMarket = document.getElementById('hk-market');
            
            if (buyingPrice && stockQuantity) {
                console.log("Setting up inline event handlers");
                
                // Add explicit onclick and oninput attributes
                buyingPrice.setAttribute('oninput', 'updateTotalDirectly()');
                stockQuantity.setAttribute('oninput', 'updateTotalDirectly()');
                
                // Also try standard listeners
                buyingPrice.addEventListener('input', updateTotalDirectly);
                stockQuantity.addEventListener('input', updateTotalDirectly);
                
                // Add market change listeners
                if (usMarket && hkMarket) {
                    usMarket.addEventListener('change', updateTotalDirectly);
                    hkMarket.addEventListener('change', updateTotalDirectly);
                }
                
                console.log("Event handlers set up");
                
                // Try to update immediately
                updateTotalDirectly();
            } else {
                console.error("Could not find input elements");
            }
        } catch (error) {
            console.error("Error setting up total investment:", error);
        }
    }, 1000); // Wait 1 second to ensure DOM is fully loaded
    
    // Update currency labels based on market selection
    marketRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'US') {
                priceCurrencyLabel.textContent = 'USD';
            } else {
                priceCurrencyLabel.textContent = 'HKD';
            }
        });
    });
    
    // Verify the Calculate button has a click event handler
    if (calculateBtn) {
        console.log("Adding click event to Calculate button");
        
        // Add a simple immediate-feedback click handler
        calculateBtn.addEventListener('click', function() {
            console.log("Calculate button was clicked!");
            stopLossResult.textContent = "Calculating...";
            
            // Add a small delay to show the "Calculating..." message before proceeding
            setTimeout(performCalculation, 100);
        });
    } else {
        console.error("Calculate button element not found!");
    }
    
    // Separate the calculation logic to a function
    function performCalculation() {
        try {
            console.log("Performing calculation");
            
            // Get input values
            const selectedMarket = document.querySelector('input[name="market"]:checked').value;
            const maxLossHKD = parseFloat(maxLossInput.value); // This is just the maximum loss without handling fee
            const handlingFee = parseFloat(handlingFeeInput.value);
            const buyingPrice = parseFloat(buyingPriceInput.value);
            const stockQuantity = parseInt(stockQuantityInput.value);
            
            console.log("Input values:", {
                selectedMarket,
                maxLossHKD,
                handlingFee,
                buyingPrice,
                stockQuantity
            });
            
            // Validate inputs
            if (isNaN(maxLossHKD) || isNaN(handlingFee) || isNaN(buyingPrice) || isNaN(stockQuantity)) {
                console.log("Input validation failed - missing values");
                stopLossResult.textContent = 'Please fill in all fields with valid numbers';
                return;
            }
            
            if (stockQuantity <= 0) {
                console.log("Input validation failed - quantity must be > 0");
                stopLossResult.textContent = 'Number of shares must be greater than 0';
                return;
            }
            
            // Calculate stop loss using the formula: 
            // stop loss price = ((-maximum loss + handling fee) / buying stock no.) + buying stock price
            
            let stopLossPrice;
            
            if (selectedMarket === 'US') {
                // For US market:
                // 1. Convert maximum loss from HKD to USD
                const maxLossUSD = convertCurrency(maxLossHKD, 'HKD', 'USD');
                console.log("Maximum loss in USD:", maxLossUSD);
                
                // 2. Apply the formula with USD values
                stopLossPrice = ((-maxLossUSD + handlingFee) / stockQuantity) + buyingPrice;
                console.log("Stop loss price in USD:", stopLossPrice);
                
                // Display result
                if (stopLossPrice <= 0) {
                    stopLossResult.textContent = 'N/A (Stop loss price would be negative)';
                } else {
                    stopLossResult.textContent = `$${stopLossPrice.toFixed(4)}`;
                }
            } else {
                // For HK market:
                // 1. Convert handling fee from USD to HKD
                const handlingFeeHKD = convertCurrency(handlingFee, 'USD', 'HKD');
                console.log("Handling fee in HKD:", handlingFeeHKD);
                
                // 2. Apply the formula with HKD values
                stopLossPrice = ((-maxLossHKD + handlingFeeHKD) / stockQuantity) + buyingPrice;
                console.log("Stop loss price in HKD:", stopLossPrice);
                
                // Display result
                if (stopLossPrice <= 0) {
                    stopLossResult.textContent = 'N/A (Stop loss price would be negative)';
                } else {
                    stopLossResult.textContent = `HK$${stopLossPrice.toFixed(4)}`;
                }
            }
            
            console.log("Calculation completed successfully");
            
        } catch (error) {
            console.error("Error in calculate function:", error);
            stopLossResult.textContent = "Error in calculation. See console for details.";
        }
    }
    
    // Trade Recording functionality
    const saveTradeBtn = document.getElementById('save-trade-btn');
    const tradeSymbolInput = document.getElementById('trade-symbol');
    const tradeDateInput = document.getElementById('trade-date');
    const tradePriceInput = document.getElementById('trade-price');
    const tradeQuantityInput = document.getElementById('trade-quantity');
    const tradeFeeInput = document.getElementById('trade-fee');
    const tradeNotesInput = document.getElementById('trade-notes');
    const tradeHistoryBody = document.getElementById('trade-history-body');
    const noTradesMessage = document.getElementById('no-trades-message');
    const exportTradesBtn = document.getElementById('export-trades-btn');
    const clearTradesBtn = document.getElementById('clear-trades-btn');
    
    // Firestore collection reference for trades
    const getTradesCollection = () => {
        const user = getCurrentUser();
        if (!user) return null;
        return collection(db, 'users', user.uid, 'trades');
    };
    
    // Display trades from Firestore
    async function displayTrades() {
        try {
            const user = getCurrentUser();
            if (!user) return;
            
            const tradesCollection = getTradesCollection();
            const querySnapshot = await getDocs(tradesCollection);
            
            // Clear existing table
            tradeHistoryBody.innerHTML = '';
            
            if (querySnapshot.empty) {
                tradeHistoryBody.innerHTML = '';
                noTradesMessage.style.display = 'block';
                return;
            }
            
            noTradesMessage.style.display = 'none';
            
            querySnapshot.forEach(doc => {
                const trade = doc.data();
                const tradeId = doc.id;
                const row = document.createElement('tr');
                
                // Format the date
                const dateObj = new Date(trade.date);
                const formattedDate = dateObj.toLocaleDateString();
                
                // Calculate total
                const total = (trade.price * trade.quantity + trade.fee).toFixed(2);
                const priceFormatted = Number(trade.price).toFixed(2);
                const feeFormatted = Number(trade.fee).toFixed(2);
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${trade.symbol.toUpperCase()}</td>
                    <td class="${trade.type === 'buy' ? 'buy-type' : 'sell-type'}">${trade.type.toUpperCase()}</td>
                    <td>${priceFormatted}</td>
                    <td>${trade.quantity}</td>
                    <td>${total}</td>
                    <td>
                        <button class="delete-trade-btn" data-id="${tradeId}">Delete</button>
                    </td>
                `;
                
                tradeHistoryBody.appendChild(row);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-trade-btn').forEach(button => {
                button.addEventListener('click', async function() {
                    const tradeId = this.getAttribute('data-id');
                    await deleteTrade(tradeId);
                });
            });
            
        } catch (error) {
            console.error("Error displaying trades:", error);
        }
    }
    
    // Save trade to Firestore
    async function saveTrade() {
        try {
            const tradesCollection = getTradesCollection();
            if (!tradesCollection) {
                console.error("User not authenticated");
                return;
            }
            
            // Get trade values
            const symbol = tradeSymbolInput.value.trim();
            const type = document.querySelector('input[name="trade-type"]:checked').value;
            const date = tradeDateInput.value;
            const price = parseFloat(tradePriceInput.value);
            const quantity = parseInt(tradeQuantityInput.value);
            const fee = parseFloat(tradeFeeInput.value) || 0;
            const notes = tradeNotesInput.value.trim();
            
            // Validate inputs
            if (!symbol || !date || isNaN(price) || isNaN(quantity)) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Create trade object
            const trade = {
                symbol,
                type,
                date,
                price,
                quantity,
                fee,
                notes,
                timestamp: new Date().toISOString()
            };
            
            // Save to Firestore
            await addDoc(tradesCollection, trade);
            
            // Reset form
            tradeSymbolInput.value = '';
            tradePriceInput.value = '';
            tradeQuantityInput.value = '';
            tradeFeeInput.value = '';
            tradeNotesInput.value = '';
            
            // Set date to today if not already set
            if (!tradeDateInput.value) {
                const today = new Date().toISOString().split('T')[0];
                tradeDateInput.value = today;
            }
            
            // Display updated trades
            displayTrades();
            
        } catch (error) {
            console.error("Error saving trade:", error);
            alert('Error saving trade: ' + error.message);
        }
    }
    
    // Delete trade from Firestore
    async function deleteTrade(tradeId) {
        try {
            const user = getCurrentUser();
            if (!user) return;
            
            const tradeRef = doc(db, 'users', user.uid, 'trades', tradeId);
            await deleteDoc(tradeRef);
            
            // Update display
            displayTrades();
            
        } catch (error) {
            console.error("Error deleting trade:", error);
            alert('Error deleting trade: ' + error.message);
        }
    }
    
    // Export trades as CSV
    async function exportTradesCSV() {
        try {
            const user = getCurrentUser();
            if (!user) return;
            
            const tradesCollection = getTradesCollection();
            const querySnapshot = await getDocs(tradesCollection);
            
            if (querySnapshot.empty) {
                alert('No trades to export');
                return;
            }
            
            // Create CSV header
            let csv = 'Date,Symbol,Type,Price,Quantity,Fee,Total,Notes\n';
            
            // Add each trade as a row
            querySnapshot.forEach(doc => {
                const trade = doc.data();
                const total = (trade.price * trade.quantity + trade.fee).toFixed(2);
                
                // Format CSV row (handle commas in notes)
                csv += `${trade.date},${trade.symbol.toUpperCase()},${trade.type.toUpperCase()},${trade.price},${trade.quantity},${trade.fee},${total},"${trade.notes}"\n`;
            });
            
            // Create download link
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', 'trade_history.csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
        } catch (error) {
            console.error("Error exporting trades:", error);
            alert('Error exporting trades: ' + error.message);
        }
    }
    
    // Clear all trades
    async function clearAllTrades() {
        try {
            if (!confirm('Are you sure you want to delete ALL your trades? This cannot be undone.')) {
                return;
            }
            
            const user = getCurrentUser();
            if (!user) return;
            
            const tradesCollection = getTradesCollection();
            const querySnapshot = await getDocs(tradesCollection);
            
            // Delete each trade document
            const deletePromises = [];
            querySnapshot.forEach(document => {
                deletePromises.push(deleteDoc(doc(db, 'users', user.uid, 'trades', document.id)));
            });
            
            await Promise.all(deletePromises);
            
            // Update display
            displayTrades();
            
        } catch (error) {
            console.error("Error clearing trades:", error);
            alert('Error clearing trades: ' + error.message);
        }
    }
    
    // Set up event listeners
    if (saveTradeBtn) {
        saveTradeBtn.addEventListener('click', saveTrade);
    }
    
    if (exportTradesBtn) {
        exportTradesBtn.addEventListener('click', exportTradesCSV);
    }
    
    if (clearTradesBtn) {
        clearTradesBtn.addEventListener('click', clearAllTrades);
    }
    
    // Set today's date as default in the date input
    if (tradeDateInput) {
        const today = new Date().toISOString().split('T')[0];
        tradeDateInput.value = today;
    }
    
    // Initialize trade display when authentication state changes
    document.addEventListener('authStateChanged', () => {
        displayTrades();
    });
});