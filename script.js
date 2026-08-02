/**
 * Auxiliary Script File (script.js)
 * Core utility functions for API data fetching, odds calculation, security,
 * and currency formatting across the betting platform.
 */

const Utilities = {
    /**
     * Escape unsafe string characters to prevent Cross-Site Scripting (XSS)
     * @param {string} str - Raw input string
     * @returns {string} Sanitized safe string
     */
    escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    },

    /**
     * Standard JSON fetch wrapper with custom authorization headers
     * @param {string} url - API Endpoint
     * @param {object} options - Fetch configuration options
     */
    async fetchData(url, options = {}) {
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Inject JWT token if available in local storage
        const token = localStorage.getItem('bet_auth_token');
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server returned status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[API Fetch Error]:', error.message);
            throw error;
        }
    },

    /**
     * Formats numbers into standardized currency strings
     * @param {number} amount - Numerical monetary value
     * @param {string} currency - Currency code (e.g., 'KSh', 'USD', 'EUR')
     * @returns {string} Formatted string (e.g., "KSh 1,250.00")
     */
    formatCurrency(amount, currency = 'KSh') {
        const val = parseFloat(amount) || 0;
        return `${currency} ${val.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    /**
     * Calculates total odds for an Accumulator / Multi-Bet selection
     * @param {Array<number>} oddsArray - Array of individual decimal odds
     * @returns {number} Combined multiplier rounded to 2 decimal places
     */
    calculateAccumulatorOdds(oddsArray) {
        if (!Array.isArray(oddsArray) || oddsArray.length === 0) return 0.00;
        const totalMultiplier = oddsArray.reduce((acc, odds) => acc * parseFloat(odds), 1);
        return parseFloat(totalMultiplier.toFixed(2));
    },

    /**
     * Calculates potential payout based on total odds and stake
     * @param {number} stake - User bet stake
     * @param {number} totalOdds - Combined odds multiplier
     * @returns {number} Total potential return
     */
    calculatePotentialPayout(stake, totalOdds) {
        const s = parseFloat(stake) || 0;
        const o = parseFloat(totalOdds) || 0;
        return parseFloat((s * o).toFixed(2));
    },

    /**
     * Converts Decimal odds to Fractional or American format
     * @param {number} decimalOdds - Decimal odds (e.g., 2.50)
     * @param {string} targetFormat - 'american' | 'fractional'
     * @returns {string} Formatted odds string
     */
    convertOddsFormat(decimalOdds, targetFormat = 'decimal') {
        const odds = parseFloat(decimalOdds);
        if (isNaN(odds) || odds <= 1) return '1.00';

        if (targetFormat === 'american') {
            if (odds >= 2.0) {
                const american = Math.round((odds - 1) * 100);
                return `+${american}`;
            } else {
                const american = Math.round(-100 / (odds - 1));
                return `${american}`;
            }
        }

        if (targetFormat === 'fractional') {
            // Approximation for display
            const numerator = Math.round((odds - 1) * 100);
            const denominator = 100;
            
            const gcd = (a, b) => b ? gcd(b, a % b) : a;
            const divisor = gcd(numerator, denominator);
            
            return `${numerator / divisor}/${denominator / divisor}`;
        }

        return odds.toFixed(2); // Default Decimal
    },

    /**
     * Formats kickoff timestamp into readable Match Time
     * @param {string|Date} dateInput 
     * @returns {string} e.g. "Today, 20:45" or "14 Aug, 16:00"
     */
    formatMatchTime(dateInput) {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        if (isToday) {
            return `Today, ${timeStr}`;
        }

        const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return `${dateStr}, ${timeStr}`;
    }
};

// Expose Utilities to window object for global script access
window.Utilities = Utilities;
