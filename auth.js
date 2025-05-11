// Auth handling
import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    googleProvider,
    signInWithPopup
} from './firebase-config.js';

// DOM elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const userStatus = document.getElementById('user-status');
const userEmail = document.getElementById('user-email');

// Auth tabs
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

// Login form elements
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');

// Signup form elements
const signupForm = document.getElementById('signup-form');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirm = document.getElementById('signup-confirm');
const signupButton = document.getElementById('signup-button');
const signupError = document.getElementById('signup-error');

// Google auth buttons
const googleLoginButton = document.getElementById('google-login-button');
const googleSignupButton = document.getElementById('google-signup-button');

// Logout
const logoutButton = document.getElementById('logout-button');

// Tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and forms
        authTabs.forEach(t => t.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        
        // Add active class to current tab
        tab.classList.add('active');
        
        // Show the corresponding form
        const formId = tab.getAttribute('data-tab') + '-form';
        document.getElementById(formId).classList.add('active');
    });
});

// Login handler
loginButton.addEventListener('click', async () => {
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    if (!email || !password) {
        loginError.textContent = 'Please enter email and password';
        return;
    }
    
    try {
        loginError.textContent = '';
        await signInWithEmailAndPassword(auth, email, password);
        // Auth state listener will handle UI updates
    } catch (error) {
        loginError.textContent = error.message;
    }
});

// Google sign-in handler
async function signInWithGoogle() {
    try {
        // Clear any previous error messages
        loginError.textContent = '';
        signupError.textContent = '';
        
        // Sign in with Google popup
        await signInWithPopup(auth, googleProvider);
        // Auth state listener will handle UI updates
    } catch (error) {
        console.error("Google sign-in error:", error);
        loginError.textContent = error.message;
        signupError.textContent = error.message;
    }
}

// Add click handlers for Google buttons
if (googleLoginButton) {
    googleLoginButton.addEventListener('click', signInWithGoogle);
}

if (googleSignupButton) {
    googleSignupButton.addEventListener('click', signInWithGoogle);
}

// Signup handler
signupButton.addEventListener('click', async () => {
    const email = signupEmail.value;
    const password = signupPassword.value;
    const confirm = signupConfirm.value;
    
    if (!email || !password || !confirm) {
        signupError.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password !== confirm) {
        signupError.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    try {
        signupError.textContent = '';
        await createUserWithEmailAndPassword(auth, email, password);
        // Auth state listener will handle UI updates
    } catch (error) {
        signupError.textContent = error.message;
    }
});

// Logout handler
logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // Auth state listener will handle UI updates
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Auth state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        userStatus.style.display = 'flex';
        userEmail.textContent = user.email || user.displayName || "User";
        
        // Reset forms
        loginEmail.value = '';
        loginPassword.value = '';
        signupEmail.value = '';
        signupPassword.value = '';
        signupConfirm.value = '';
    } else {
        // User is signed out
        authContainer.style.display = 'flex';
        appContainer.style.display = 'none';
        userStatus.style.display = 'none';
    }
});

// Export current user for other modules
export const getCurrentUser = () => {
    return auth.currentUser;
}; 