/**
 * Auxiliary Script File (script.js)
 * Helper functions for API fetching and security utils.
 */

const Utilities = {
    // Escape unsafe string characters to prevent XSS
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

    // Standard JSON fetch wrapper
    async fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            throw error;
        }
    }
};
