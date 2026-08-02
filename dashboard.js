/**
 * User Dashboard Engine (dashboard.js)
 * Fetches and renders user account metrics, active open bets, and financial history logs.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Mock authenticated user state
    const accountState = {
        user: {
            name: "Alex M.",
            phone: "+254 712 *** 789",
            mainBalance: 2500.00,
            bonusBalance: 500.00,
            currency: "KSh"
        },
        openBetsCount: 2,
        dailyDepositLimit: { used: 1000, total: 5000 }
    };

    // DOM Elements
    const dashMainBalance = document.getElementById('dash-main-balance');
    const dashBonusBalance = document.getElementById('dash-bonus-balance');
    const headerBalance = document.getElementById('header-user-balance');
    const cashoutButtons = document.querySelectorAll('.btn-cashout');
    const logoutBtn = document.getElementById('logout-btn');

    // 1. Populate Account Balances
    function populateMetrics() {
        if (dashMainBalance) {
            dashMainBalance.textContent = Utilities.formatCurrency(accountState.user.mainBalance, accountState.user.currency);
        }
        if (dashBonusBalance) {
            dashBonusBalance.textContent = Utilities.formatCurrency(accountState.user.bonusBalance, accountState.user.currency);
        }
        if (headerBalance) {
            headerBalance.textContent = Utilities.formatCurrency(accountState.user.mainBalance, accountState.user.currency);
        }
    }

    // 2. Handle Live Cash-Out Trigger
    function initCashoutHandlers() {
        cashoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.getAttribute('data-cashout-val');
                const confirmCashout = confirm(`Are you sure you want to cash out ${Utilities.formatCurrency(amount)} now?`);
                
                if (confirmCashout) {
                    accountState.user.mainBalance += parseFloat(amount);
                    populateMetrics();
                    
                    // Remove bet card from open list
                    const card = e.target.closest('.dash-bet-card');
                    if (card) {
                        card.style.opacity = '0.5';
                        e.target.replaceWith(document.createTextNode('Cashed Out ✅'));
                    }
                }
            });
        });
    }

    // 3. Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to log out?")) {
                localStorage.removeItem('bet_auth_token');
                window.location.href = '/login';
            }
        });
    }

    // Initialize Page
    populateMetrics();
    initCashoutHandlers();
});

