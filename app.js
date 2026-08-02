// --- DOM Elements ---
const themeToggleBtn = document.getElementById('theme-toggle');
const actionBtn = document.getElementById('action-btn');
const incrementBtn = document.getElementById('increment-btn');
const decrementBtn = document.getElementById('decrement-btn');
const counterValue = document.getElementById('counter-value');

// --- State Variables ---
let count = 0;

// --- Dark Mode Toggle Logic ---
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', 'dark');
    }
});

// --- Hero Action Button Event ---
actionBtn.addEventListener('click', () => {
    alert('Button clicked! Your JavaScript file is properly linked and working.');
});

// --- Counter Logic ---
function updateCounterDisplay() {
    counterValue.textContent = count;
}

incrementBtn.addEventListener('click', () => {
    count++;
    updateCounterDisplay();
});

decrementBtn.addEventListener('click', () => {
    count--;
    updateCounterDisplay();
});

