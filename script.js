/**
 * ==============================================================================
 * MAIN APPLICATION SCRIPT (script.js)
 * Covers: DOM Operations, Async Fetch, Form Validation, LocalStorage, & UI State
 * ==============================================================================
 */

// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    // Initialize application modules
    App.init();
});

/**
 * Main Application Module
 */
const App = {
    // --- State Management ---
    state: {
        theme: localStorage.getItem('app_theme') || 'light',
        users: [],
        counter: 0
    },

    // --- DOM Cache ---
    elements: {
        themeToggleBtn: document.getElementById('theme-toggle'),
        userForm: document.getElementById('user-form'),
        usernameInput: document.getElementById('username-input'),
        emailInput: document.getElementById('email-input'),
        formFeedback: document.getElementById('form-feedback'),
        fetchDataBtn: document.getElementById('fetch-data-btn'),
        dataContainer: document.getElementById('data-container'),
        counterValue: document.getElementById('counter-value'),
        counterGroup: document.getElementById('counter-group')
    },

    // --- Initialization ---
    init() {
        this.applyTheme(this.state.theme);
        this.bindEvents();
        console.log('Application initialized successfully.');
    },

    // --- Event Listeners Binding ---
    bindEvents() {
        // Theme Switcher
        if (this.elements.themeToggleBtn) {
            this.elements.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Form Submission with Validation
        if (this.elements.userForm) {
            this.elements.userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Async API Request
        if (this.elements.fetchDataBtn) {
            this.elements.fetchDataBtn.addEventListener('click', () => this.fetchPosts());
        }

        // Event Delegation for Counter (handles increment/decrement buttons)
        if (this.elements.counterGroup) {
            this.elements.counterGroup.addEventListener('click', (e) => this.handleCounterClick(e));
        }
    },

    // --- 1. Theme Toggle & LocalStorage Module ---
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.state.theme);
        localStorage.setItem('app_theme', this.state.theme);
    },

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    },

    // --- 2. Form Validation & Submission ---
    handleFormSubmit(event) {
        event.preventDefault(); // Stop page reload

        const username = this.elements.usernameInput.value.trim();
        const email = this.elements.emailInput.value.trim();

        // Simple Validation Checks
        if (username.length < 3) {
            this.showFeedback('Username must be at least 3 characters long.', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showFeedback('Please enter a valid email address.', 'error');
            return;
        }

        // Processing Valid Input
        const newUser = { id: Date.now(), username, email };
        this.state.users.push(newUser);
        
        this.showFeedback(`User ${username} successfully registered!`, 'success');
        this.elements.userForm.reset(); // Clear inputs
        console.log('Current Registered Users:', this.state.users);
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    showFeedback(message, type) {
        if (!this.elements.formFeedback) return;
        this.elements.formFeedback.textContent = message;
        this.elements.formFeedback.className = `feedback ${type}`;
    },

    // --- 3. Async API Handler (Fetch API with Async/Await) ---
    async fetchPosts() {
        if (!this.elements.dataContainer) return;

        // UI Loading State
        this.elements.dataContainer.innerHTML = '<p class="loading">Loading data...</p>';

        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
            
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const data = await response.json();
            this.renderPosts(data);
        } catch (error) {
            console.error('Fetch Error:', error);
            this.elements.dataContainer.innerHTML = `<p class="error">Failed to load data: ${error.message}</p>`;
        }
    },

    renderPosts(posts) {
        // Construct HTML safely using map
        const postsHTML = posts.map(post => `
            <article class="post-card" data-id="${post.id}">
                <h4>${this.escapeHTML(post.title)}</h4>
                <p>${this.escapeHTML(post.body)}</p>
            </article>
        `).join('');

        this.elements.dataContainer.innerHTML = postsHTML;
    },

    // Sanitizes strings to prevent XSS attacks when rendering HTML dynamically
    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    },

    // --- 4. Event Delegation Counter Logic ---
    handleCounterClick(event) {
        const action = event.target.dataset.action;

        if (action === 'increment') {
            this.state.counter++;
        } else if (action === 'decrement') {
            this.state.counter--;
        } else {
            return; // Clicked outside action buttons
        }

        this.updateCounterUI();
    },

    updateCounterUI() {
        if (this.elements.counterValue) {
            this.elements.counterValue.textContent = this.state.counter;
        }
    }
};

