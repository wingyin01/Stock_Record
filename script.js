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
    
    // Set default value for maximum loss - removed as per user's request
    // maxLossInput.value = "500";
    
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
    const tradeSymbolInput = document.getElementById('trade-symbol');
    const tradeDateInput = document.getElementById('trade-date');
    const tradePriceInput = document.getElementById('trade-price');
    const tradeQuantityInput = document.getElementById('trade-quantity');
    const tradeFeeInput = document.getElementById('trade-fee');
    const tradeNotesInput = document.getElementById('trade-notes');
    const saveTradeBtn = document.getElementById('save-trade-btn');
    const tradeHistoryBody = document.getElementById('trade-history-body');
    const noTradesMessage = document.getElementById('no-trades-message');
    const exportTradesBtn = document.getElementById('export-trades-btn');
    const clearTradesBtn = document.getElementById('clear-trades-btn');
    
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);
    tradeDateInput.value = formattedDate;
    
    // Load trades from local storage
    let trades = JSON.parse(localStorage.getItem('stockTrades')) || [];
    
    // Display trades
    function displayTrades() {
        if (trades.length === 0) {
            tradeHistoryBody.innerHTML = '';
            noTradesMessage.style.display = 'block';
            return;
        }
        
        noTradesMessage.style.display = 'none';
        tradeHistoryBody.innerHTML = '';
        
        trades.forEach((trade, index) => {
            const row = document.createElement('tr');
            
            // Format date
            const tradeDate = new Date(trade.date);
            const formattedDate = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}-${String(tradeDate.getDate()).padStart(2, '0')}`;
            
            // Calculate total value
            const total = (trade.price * trade.quantity).toFixed(2);
            const typeClass = trade.type === 'buy' ? 'buy-type' : 'sell-type';
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${trade.symbol.toUpperCase()}</td>
                <td class="${typeClass}">${trade.type.toUpperCase()}</td>
                <td>$${parseFloat(trade.price).toFixed(2)}</td>
                <td>${trade.quantity}</td>
                <td>$${total}</td>
                <td>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            
            tradeHistoryBody.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                trades.splice(index, 1);
                localStorage.setItem('stockTrades', JSON.stringify(trades));
                displayTrades();
            });
        });
    }
    
    // Save trade
    saveTradeBtn.addEventListener('click', function() {
        const symbol = tradeSymbolInput.value.trim();
        const type = document.querySelector('input[name="trade-type"]:checked').value;
        const date = tradeDateInput.value;
        const price = parseFloat(tradePriceInput.value);
        const quantity = parseInt(tradeQuantityInput.value);
        const fee = parseFloat(tradeFeeInput.value) || 0;
        const notes = tradeNotesInput.value.trim();
        
        // Validate inputs
        if (!symbol || !date || isNaN(price) || isNaN(quantity)) {
            alert('Please fill in all required fields with valid values');
            return;
        }
        
        if (quantity <= 0) {
            alert('Number of shares must be greater than 0');
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
            timestamp: new Date().getTime()
        };
        
        // Add to trades array
        trades.push(trade);
        
        // Save to local storage
        localStorage.setItem('stockTrades', JSON.stringify(trades));
        
        // Clear form
        tradeSymbolInput.value = '';
        tradePriceInput.value = '';
        tradeQuantityInput.value = '';
        tradeFeeInput.value = '';
        tradeNotesInput.value = '';
        
        // Display trades
        displayTrades();
        
        // Show success message
        alert('Trade saved successfully!');
    });
    
    // Export trades
    exportTradesBtn.addEventListener('click', function() {
        if (trades.length === 0) {
            alert('No trades to export');
            return;
        }
        
        const csv = [
            'Date,Symbol,Type,Price,Quantity,Fee,Total,Notes'
        ];
        
        trades.forEach(trade => {
            const total = (trade.price * trade.quantity).toFixed(2);
            csv.push(
                `${trade.date},${trade.symbol},${trade.type},${trade.price},${trade.quantity},${trade.fee},${total},"${trade.notes}"`
            );
        });
        
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'stock_trades.csv');
        a.click();
    });
    
    // Clear trades
    clearTradesBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete all trades? This action cannot be undone.')) {
            trades = [];
            localStorage.setItem('stockTrades', JSON.stringify(trades));
            displayTrades();
        }
    });
    
    // Initialize display
    displayTrades();
    
    // Currency Converter functionality
    const amountToConvertInput = document.getElementById('amount-to-convert');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const swapCurrenciesBtn = document.getElementById('swap-currencies');
    const convertBtn = document.getElementById('convert-btn');
    const convertedAmountSpan = document.getElementById('converted-amount');
    
    // Swap currencies with animation
    swapCurrenciesBtn.addEventListener('click', function() {
        const tempCurrency = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tempCurrency;
        
        // Add pulse animation class
        this.classList.add('pulse-animation');
        
        // If there's a value, update the conversion
        if (amountToConvertInput.value.trim() !== '') {
            updateConvertedAmount();
        }
        
        // Remove animation class after animation completes
        setTimeout(() => {
            this.classList.remove('pulse-animation');
        }, 1500);
    });
    
    // Function to update converted amount
    function updateConvertedAmount() {
        const amountStr = amountToConvertInput.value;
        if (amountStr === "") {
            convertedAmountSpan.textContent = "-";
            return;
        }
        
        const amount = parseFloat(amountStr);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        
        if (isNaN(amount)) {
            convertedAmountSpan.textContent = 'Please enter a valid amount';
            return;
        }
        
        const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);
        const currencySymbol = toCurrency === 'USD' ? '$' : 'HK$';
        convertedAmountSpan.textContent = `${currencySymbol}${convertedAmount.toFixed(2)}`;
    }
    
    // Add event listeners for live updates
    convertBtn.addEventListener('click', updateConvertedAmount);
    amountToConvertInput.addEventListener('input', updateConvertedAmount);
    fromCurrencySelect.addEventListener('change', updateConvertedAmount);
    toCurrencySelect.addEventListener('change', updateConvertedAmount);
    
    // Function to fetch stock data (for future implementation with API key)
    async function fetchStockData(symbol) {
        try {
            // This is a placeholder for future implementation with a real API key
            // For now, we'll just return a mock response
            console.log(`Fetching data for ${symbol}...`);
            return {
                symbol: symbol,
                price: 0,
                change: 0,
                changePercent: 0
            };
            
            // When you have an API key, you can use the fetch MCP like this:
            // const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=YOUR_API_KEY`);
            // const data = await response.json();
            // return data;
        } catch (error) {
            console.error('Error fetching stock data:', error);
            return null;
        }
    }
});