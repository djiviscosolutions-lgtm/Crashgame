/**
 * Main Application Logic (app.js)
 * Manages UI interactions, Theme persistence, Counter State, and Form Events.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        theme: localStorage.getItem('app_theme') || 'light',
        counter: 0
    };

    // --- DOM Elements ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const actionBtn = document.getElementById('action-btn');
    const actionFeedback = document.getElementById('action-feedback');
    const incrementBtn = document.getElementById('increment-btn');
    const decrementBtn = document.getElementById('decrement-btn');
    const counterValue = document.getElementById('counter-value');
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    // --- 1. Theme Controller ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            if (themeToggleBtn) themeToggleBtn.textContent = 'Light Mode';
        } else {
            document.body.removeAttribute('data-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = 'Toggle Mode';
        }
    }

    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(state.theme);
        localStorage.setItem('app_theme', state.theme);
    }

    // Initialize Theme
    applyTheme(state.theme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // --- 2. Hero Action Button ---
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (actionFeedback) {
                actionFeedback.textContent = '🚀 Action triggered! Everything is running smoothly.';
                actionFeedback.className = 'feedback-message success';
                
                setTimeout(() => {
                    actionFeedback.textContent = '';
                }, 4000);
            }
        });
    }

    // --- 3. Counter Logic ---
    function updateCounterDisplay() {
        if (counterValue) {
            counterValue.textContent = state.counter;
        }
    }

    if (incrementBtn) {
        incrementBtn.addEventListener('click', () => {
            state.counter++;
            updateCounterDisplay();
        });
    }

    if (decrementBtn) {
        decrementBtn.addEventListener('click', () => {
            state.counter--;
            updateCounterDisplay();
        });
    }

    // --- 4. Form Validation Handler ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username-input').value.trim();
            const email = document.getElementById('email-input').value.trim();

            if (username.length < 2) {
                showFormFeedback('Please enter a valid name.', 'error');
                return;
            }

            if (!email.includes('@')) {
                showFormFeedback('Please enter a valid email address.', 'error');
                return;
            }

            showFormFeedback(`Thanks for reaching out, ${username}! We received your message.`, 'success');
            contactForm.reset();
        });
    }

    function showFormFeedback(message, type) {
        if (!formFeedback) return;
        formFeedback.textContent = message;
        formFeedback.className = `feedback-message ${type}`;

        setTimeout(() => {
            formFeedback.textContent = '';
            formFeedback.className = 'feedback-message';
        }, 5000);
    }
});
