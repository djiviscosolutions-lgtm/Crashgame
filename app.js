/**
 * Main Sportsbook Application Logic (app.js)
 * Controls User Authentication UI, Search Modal, Dynamic Live Odds Flashes,
 * and Responsive Layout Navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    const appState = {
        user: {
            isLoggedIn: true, // Set to false to test guest header state
            username: 'Alex',
            balance: 2500.00,
            currency: 'KSh'
        },
        searchOpen: false,
        matches: [
            { id: '101', home: 'Arsenal', away: 'Chelsea', homeScore: 2, awayScore: 1, minute: "64'", odds: { 1: 1.85, X: 3.40, 2: 4.20 } },
            { id: '102', home: 'Real Madrid', away: 'Barcelona', homeScore: 0, awayScore: 0, minute: "12'", odds: { 1: 2.10, X: 3.20, 2: 3.10 } },
            { id: '103', home: 'LA Lakers', away: 'Golden State', homeScore: 104, awayScore: 98, minute: "Q4", odds: { 1: 1.55, X: 15.00, 2: 2.45 } }
        ]
    };

    // --- DOM Elements ---
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userBalanceEl = document.getElementById('user-balance');
    const searchToggleBtn = document.getElementById('search-toggle-btn');
    const searchModal = document.getElementById('search-modal');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const betslipDrawer = document.getElementById('betslip-drawer');
    const betslipHeader = document.querySelector('.betslip-header');

    // --- 1. User Authentication & Wallet Header Controller ---
    function initUserHeader() {
        if (!authButtons || !userProfile) return;

        if (appState.user.isLoggedIn) {
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
            if (userBalanceEl) {
                userBalanceEl.textContent = `${appState.user.currency} ${appState.user.balance.toFixed(2)}`;
            }
        } else {
            authButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }

    // --- 2. Universal Search Overlay Modal ---
    function openSearch() {
        if (!searchModal) return;
        appState.searchOpen = true;
        searchModal.style.display = 'flex';
        if (searchInput) {
            searchInput.focus();
            searchInput.value = '';
        }
        if (searchResults) searchResults.innerHTML = '<p class="text-muted" style="padding: 1rem 0;">Type a team or league name...</p>';
    }

    function closeSearch() {
        if (!searchModal) return;
        appState.searchOpen = false;
        searchModal.style.display = 'none';
    }

    function handleSearchInput(e) {
        const query = e.target.value.toLowerCase().trim();
        if (!searchResults) return;

        if (query.length < 2) {
            searchResults.innerHTML = '<p class="text-muted" style="padding: 1rem 0;">Type a team or league name...</p>';
            return;
        }

        const filtered = appState.matches.filter(m => 
            m.home.toLowerCase().includes(query) || 
            m.away.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            searchResults.innerHTML = `<p style="padding: 1rem 0;">No matches found matching "${query}"</p>`;
            return;
        }

        searchResults.innerHTML = filtered.map(m => `
            <div class="search-result-item" style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${m.home} vs ${m.away}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${m.minute}</div>
                </div>
                <a href="/match/${m.id}" class="btn btn-sm btn-secondary">View Markets</a>
            </div>
        `).join('');
    }

    // Search Event Listeners
    if (searchToggleBtn) searchToggleBtn.addEventListener('click', openSearch);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
    if (searchInput) searchInput.addEventListener('input', handleSearchInput);

    // Close Modal on Overlay Click or ESC key
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) closeSearch();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && appState.searchOpen) {
            closeSearch();
        }
    });

    // --- 3. Dynamic Live Odds Flash Simulator ---
    // Periodically shifts odds values up or down to simulate live socket updates
    function simulateLiveOddsUpdates() {
        setInterval(() => {
            const oddsButtons = document.querySelectorAll('.odds-btn');
            if (oddsButtons.length === 0) return;

            // Pick a random odds button to fluctuate
            const randomIndex = Math.floor(Math.random() * oddsButtons.length);
            const targetBtn = oddsButtons[randomIndex];
            const oddsValEl = targetBtn.querySelector('.odds-value');
            
            if (!oddsValEl) return;

            let currentOdds = parseFloat(oddsValEl.textContent);
            const delta = (Math.random() > 0.5 ? 0.05 : -0.05);
            let newOdds = Math.max(1.05, parseFloat((currentOdds + delta).toFixed(2)));

            // Visual indicator of flash
            const flashColor = delta > 0 ? '#16a34a' : '#ef4444';
            oddsValEl.style.color = flashColor;
            oddsValEl.textContent = newOdds.toFixed(2);
            targetBtn.setAttribute('data-odds', newOdds.toFixed(2));

            // Reset text color after flash
            setTimeout(() => {
                oddsValEl.style.color = '';
            }, 1000);

        }, 4000);
    }

    // --- 4. Mobile Bet Slip Collapsible Drawer ---
    function initMobileBetslipToggle() {
        if (!betslipHeader || !betslipDrawer) return;

        betslipHeader.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                betslipDrawer.classList.toggle('expanded');
            }
        });
    }

    // --- Initialize Logic ---
    initUserHeader();
    simulateLiveOddsUpdates();
    initMobileBetslipToggle();
});
