/**
 * Bet Slip Engine (betslip.js)
 * Handles odds selection, slip drawer state, accumulator calculations,
 * stake chip controls, local storage persistence, and bet placement.
 */

class BetSlipManager {
    constructor() {
        // Core state
        this.selections = []; // Array of selected outcome objects
        this.stake = 0;
        this.minStake = 10;
        this.maxStake = 50000;

        // Default mock initial balance if not set in localStorage
        this.defaultBalance = 2500;

        // Cache persistent DOM Elements
        this.dom = {
            drawer: document.getElementById('betslip-drawer'),
            itemsContainer: document.getElementById('betslip-items'),
            countBadge: document.getElementById('slip-count-badge'),
            clearBtn: document.getElementById('clear-slip-btn'),
            stakeInput: document.getElementById('stake-amount'),
            totalOddsVal: document.getElementById('total-odds-val'),
            potentialPayout: document.getElementById('potential-payout'),
            placeBetBtn: document.getElementById('place-bet-btn'),
            quickStakeBtns: document.querySelectorAll('.stake-chip'),
            userBalanceDisplay: document.getElementById('user-balance')
        };

        this.init();
    }

    init() {
        // Load saved selections and wallet balance from LocalStorage
        this.loadFromStorage();
        this.syncBalanceDisplay();

        // Bind global event listeners
        this.bindOddsButtonListeners();
        this.bindControlListeners();

        // Initial UI Render
        this.render();
    }

    /* ==========================================================================
       1. SELECTION & ODDS MANAGEMENT
       ========================================================================== */

    bindOddsButtonListeners() {
        // Delegate click handler to document to support dynamically added odds
        document.addEventListener('click', (e) => {
            const oddsBtn = e.target.closest('.odds-btn');
            if (!oddsBtn) return;

            e.preventDefault();

            const matchId = oddsBtn.getAttribute('data-match-id');
            const outcome = oddsBtn.getAttribute('data-outcome');
            const odds = parseFloat(oddsBtn.getAttribute('data-odds'));

            // Extract team/match information from parent card
            const matchCard = oddsBtn.closest('.match-card');
            const league = matchCard ? matchCard.querySelector('.league')?.textContent.trim() : 'Sports Event';
            const teamRows = matchCard ? matchCard.querySelectorAll('.team-name') : [];
            const homeTeam = teamRows[0] ? teamRows[0].textContent.trim() : 'Home Team';
            const awayTeam = teamRows[1] ? teamRows[1].textContent.trim() : 'Away Team';

            const selectionData = {
                matchId: matchId || `m_${Date.now()}`,
                homeTeam,
                awayTeam,
                league,
                outcome, // '1', 'X', or '2'
                odds: isNaN(odds) ? 1.00 : odds
            };

            this.toggleSelection(selectionData);
        });
    }

    toggleSelection(selection) {
        // Check if this match is already in the slip
        const existingIndex = this.selections.findIndex(s => s.matchId === selection.matchId);

        if (existingIndex > -1) {
            const existingSelection = this.selections[existingIndex];
            
            // If user clicked the same outcome, remove it (toggle off)
            if (existingSelection.outcome === selection.outcome) {
                this.selections.splice(existingIndex, 1);
            } else {
                // If user clicked a different outcome on same match, replace it
                this.selections[existingIndex] = selection;
            }
        } else {
            // New match selection
            this.selections.push(selection);
        }

        this.saveToStorage();
        this.render();
    }

    removeSelection(matchId) {
        this.selections = this.selections.filter(s => s.matchId !== matchId);
        this.saveToStorage();
        this.render();
    }

    clearAllSelections() {
        this.selections = [];
        this.saveToStorage();
        this.render();
    }

    /* ==========================================================================
       2. MATH & PAYOUT CALCULATIONS
       ========================================================================== */

    calculateTotalOdds() {
        if (this.selections.length === 0) return 0;
        
        // Accumulator math: Multiply all odds together
        const total = this.selections.reduce((acc, item) => acc * item.odds, 1);
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    }

    calculatePotentialPayout() {
        const totalOdds = this.calculateTotalOdds();
        if (totalOdds === 0 || this.stake <= 0) return 0;
        
        return Math.round(totalOdds * this.stake * 100) / 100;
    }

    /* ==========================================================================
       3. UI CONTROLS & STAKE HANDLERS
       ========================================================================== */

    bindControlListeners() {
        // Clear all button
        if (this.dom.clearBtn) {
            this.dom.clearBtn.addEventListener('click', () => this.clearAllSelections());
        }

        // Stake input change handler
        if (this.dom.stakeInput) {
            this.dom.stakeInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.stake = isNaN(val) ? 0 : val;
                this.updatePayoutDisplay();
                this.validateBetStatus();
            });
        }

        // Quick stake preset chip buttons (+100, +500, +1000, MAX)
        if (this.dom.quickStakeBtns) {
            this.dom.quickStakeBtns.forEach(chip => {
                chip.addEventListener('click', () => {
                    const valueAttr = chip.getAttribute('data-stake');

                    if (valueAttr === 'max') {
                        this.stake = this.getUserBalance();
                    } else {
                        const increment = parseFloat(valueAttr) || 0;
                        this.stake = (this.stake || 0) + increment;
                    }

                    if (this.dom.stakeInput) {
                        this.dom.stakeInput.value = this.stake > 0 ? this.stake : '';
                    }

                    this.updatePayoutDisplay();
                    this.validateBetStatus();
                });
            });
        }

        // Place bet button
        if (this.dom.placeBetBtn) {
            this.dom.placeBetBtn.addEventListener('click', () => this.placeBet());
        }
    }

    getUserBalance() {
        try {
            const savedBalance = localStorage.getItem('betbrand_user_balance');
            if (savedBalance !== null) {
                return parseFloat(savedBalance);
            }
        } catch (e) {
            console.warn('Unable to read balance from localStorage', e);
        }
        return this.defaultBalance;
    }

    updateUserBalance(newBalance) {
        try {
            localStorage.setItem('betbrand_user_balance', newBalance.toString());
        } catch (e) {
            console.warn('Unable to save balance to localStorage', e);
        }
        this.syncBalanceDisplay();
    }

    syncBalanceDisplay() {
        const currentBalance = this.getUserBalance();
        if (this.dom.userBalanceDisplay) {
            this.dom.userBalanceDisplay.textContent = `KSh ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    }

    validateBetStatus() {
        if (!this.dom.placeBetBtn) return;

        const totalOdds = this.calculateTotalOdds();
        const userBalance = this.getUserBalance();

        let isValid = true;
        let btnText = 'Place Bet';

        if (this.selections.length === 0) {
            isValid = false;
            btnText = 'Select Odds First';
        } else if (this.stake < this.minStake) {
            isValid = false;
            btnText = `Min Stake KSh ${this.minStake}`;
        } else if (this.stake > userBalance) {
            isValid = false;
            btnText = 'Insufficient Balance';
        }

        this.dom.placeBetBtn.disabled = !isValid;
        if (isValid) {
            this.dom.placeBetBtn.textContent = `Place Bet (KSh ${this.stake.toLocaleString()})`;
        } else {
            this.dom.placeBetBtn.textContent = btnText;
        }
    }

    /* ==========================================================================
       4. RENDER ENGINE
       ========================================================================== */

    render() {
        this.renderOddsButtonStates();
        this.renderItemsList();
        this.renderBadgeAndHeader();
        this.updatePayoutDisplay();
        this.validateBetStatus();
    }

    renderOddsButtonStates() {
        // Reset all active odds buttons on page
        document.querySelectorAll('.odds-btn').forEach(btn => {
            btn.classList.remove('selected', 'active');
        });

        // Highlight active picks
        this.selections.forEach(sel => {
            const targetBtn = document.querySelector(`.odds-btn[data-match-id="${sel.matchId}"][data-outcome="${sel.outcome}"]`);
            if (targetBtn) {
                targetBtn.classList.add('selected', 'active');
            }
        });
    }

    renderBadgeAndHeader() {
        const count = this.selections.length;

        if (this.dom.countBadge) {
            this.dom.countBadge.textContent = count;
        }

        if (this.dom.clearBtn) {
            this.dom.clearBtn.style.display = count > 0 ? 'block' : 'none';
        }
    }

    renderItemsList() {
        if (!this.dom.itemsContainer) return;

        if (this.selections.length === 0) {
            this.dom.itemsContainer.innerHTML = `
                <div class="empty-slip-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    <p>Your bet slip is empty.</p>
                    <span>Click on any odds to place a bet.</span>
                </div>
            `;
            return;
        }

        let html = '';
        this.selections.forEach(item => {
            const outcomeLabel = item.outcome === '1' ? 'Home Win (1)' : (item.outcome === '2' ? 'Away Win (2)' : 'Draw (X)');

            html += `
                <div class="slip-item" data-match-id="${item.matchId}">
                    <div class="slip-item-header">
                        <span class="slip-league">${item.league}</span>
                        <button class="slip-remove-btn" data-remove-id="${item.matchId}" aria-label="Remove pick">&times;</button>
                    </div>
                    <div class="slip-match-teams">${item.homeTeam} vs ${item.awayTeam}</div>
                    <div class="slip-pick-row">
                        <span class="slip-market-label">1X2: <strong>${outcomeLabel}</strong></span>
                        <strong class="slip-odds-val">${item.odds.toFixed(2)}</strong>
                    </div>
                </div>
            `;
        });

        this.dom.itemsContainer.innerHTML = html;

        // Bind remove actions on list items
        this.dom.itemsContainer.querySelectorAll('.slip-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const matchId = e.currentTarget.getAttribute('data-remove-id');
                this.removeSelection(matchId);
            });
        });
    }

    updatePayoutDisplay() {
        const totalOdds = this.calculateTotalOdds();
        const payout = this.calculatePotentialPayout();

        if (this.dom.totalOddsVal) {
            this.dom.totalOddsVal.textContent = totalOdds.toFixed(2);
        }

        if (this.dom.potentialPayout) {
            this.dom.potentialPayout.textContent = `KSh ${payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    }

    /* ==========================================================================
       5. BET PLACEMENT & STORAGE PERSISTENCE
       ========================================================================== */

    placeBet() {
        if (this.selections.length === 0 || this.stake < this.minStake) return;

        const currentBalance = this.getUserBalance();
        if (this.stake > currentBalance) {
            alert('Insufficient funds! Please deposit to complete your bet.');
            return;
        }

        const totalOdds = this.calculateTotalOdds();
        const payout = this.calculatePotentialPayout();

        // Process deduction and update storage
        const newBalance = currentBalance - this.stake;
        this.updateUserBalance(newBalance);

        // Feedback alert
        alert(`✅ Bet Placed Successfully!\n\nSelections: ${this.selections.length} Pick(s)\nTotal Odds: ${totalOdds.toFixed(2)}\nStake: KSh ${this.stake.toLocaleString()}\nEst. Payout: KSh ${payout.toLocaleString()}`);

        // Reset slip
        this.stake = 0;
        if (this.dom.stakeInput) this.dom.stakeInput.value = '';
        this.clearAllSelections();
    }

    saveToStorage() {
        try {
            localStorage.setItem('betbrand_slip_selections', JSON.stringify(this.selections));
        } catch (e) {
            console.warn('Unable to save betslip to localStorage.', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('betbrand_slip_selections');
            if (saved) {
                this.selections = JSON.parse(saved);
            }
        } catch (e) {
            this.selections = [];
        }
    }
}

// Initialize BetSlip Manager on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    window.betSlipApp = new BetSlipManager();
});
