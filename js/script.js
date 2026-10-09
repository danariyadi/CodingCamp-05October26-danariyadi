/**
 * To-Do Life Dashboard
 * Vanilla JavaScript application using Module Pattern with IIFE
 * All modules are encapsulated and communicate through public interfaces
 */

/* ============================================
   StorageManager Module
   Handles all LocalStorage operations with error handling
   ============================================ */
const StorageManager = (function() {
    // Private variables
    let isLocalStorageAvailable = false;
    let inMemoryStorage = {};
    
    /**
     * Check if localStorage is available and accessible
     * Tests for QuotaExceededError, SecurityError, and private browsing mode
     */
    function checkLocalStorageAvailability() {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            // Handle QuotaExceededError, SecurityError, or any other storage error
            console.warn('LocalStorage not available:', e.name);
            return false;
        }
    }
    
    /**
     * Initialize storage availability check
     */
    function init() {
        isLocalStorageAvailable = checkLocalStorageAvailability();
        
        if (!isLocalStorageAvailable) {
            console.warn('LocalStorage unavailable. Using in-memory fallback storage.');
        }
    }
    
    /**
     * Get storage backend based on availability
     */
    function getStorage() {
        return isLocalStorageAvailable ? localStorage : inMemoryStorage;
    }
    
    /**
     * Set item in storage with proper handling
     */
    function setItem(key, value) {
        if (isLocalStorageAvailable) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.error('Storage quota exceeded. Unable to save data.');
                    throw new Error('Storage quota exceeded');
                } else if (e.name === 'SecurityError') {
                    console.error('Security error: Unable to access localStorage.');
                    // Fallback to in-memory storage
                    isLocalStorageAvailable = false;
                    inMemoryStorage[key] = value;
                } else {
                    throw e;
                }
            }
        } else {
            inMemoryStorage[key] = value;
        }
    }
    
    /**
     * Get item from storage with proper handling
     */
    function getItem(key) {
        if (isLocalStorageAvailable) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return null;
            }
        } else {
            return inMemoryStorage[key] || null;
        }
    }
    
    /**
     * Remove item from storage
     */
    function removeItem(key) {
        if (isLocalStorageAvailable) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Error removing from localStorage:', e);
            }
        } else {
            delete inMemoryStorage[key];
        }
    }
    
    /**
     * Clear all items from storage
     */
    function clearStorage() {
        if (isLocalStorageAvailable) {
            try {
                localStorage.clear();
            } catch (e) {
                console.error('Error clearing localStorage:', e);
            }
        } else {
            inMemoryStorage = {};
        }
    }
    
    /**
     * Calculate approximate storage size in bytes
     */
    function calculateSize() {
        let size = 0;
        
        if (isLocalStorageAvailable) {
            try {
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        size += key.length + localStorage[key].length;
                    }
                }
            } catch (e) {
                console.error('Error calculating storage size:', e);
                return 0;
            }
        } else {
            for (let key in inMemoryStorage) {
                if (inMemoryStorage.hasOwnProperty(key)) {
                    size += key.length + (inMemoryStorage[key] || '').length;
                }
            }
        }
        
        // Return size in bytes (each character is ~2 bytes in UTF-16)
        return size * 2;
    }
    
    // Initialize on module load
    init();
    
    // Public API
    return {
        /**
         * Check if LocalStorage is available
         * @returns {boolean} True if LocalStorage is available and accessible
         */
        isAvailable: function() {
            return isLocalStorageAvailable;
        },
        
        /**
         * Set value in storage with JSON serialization
         * @param {string} key - Storage key
         * @param {any} value - Value to store (will be JSON serialized)
         * @returns {boolean} True if successful, false otherwise
         */
        set: function(key, value) {
            try {
                // Validate key
                if (!key || typeof key !== 'string') {
                    console.error('Invalid storage key');
                    return false;
                }
                
                // Serialize value to JSON
                const serializedValue = JSON.stringify(value);
                
                // Store with error handling
                setItem(key, serializedValue);
                return true;
            } catch (e) {
                console.error('Error setting storage value:', e);
                return false;
            }
        },
        
        /**
         * Get value from storage with JSON deserialization and validation
         * @param {string} key - Storage key
         * @returns {any} Deserialized value or null if not found/invalid
         */
        get: function(key) {
            try {
                // Validate key
                if (!key || typeof key !== 'string') {
                    console.error('Invalid storage key');
                    return null;
                }
                
                // Get serialized value
                const serializedValue = getItem(key);
                
                if (serializedValue === null) {
                    return null;
                }
                
                // Deserialize and validate JSON
                try {
                    return JSON.parse(serializedValue);
                } catch (parseError) {
                    console.error('Invalid JSON data for key:', key);
                    // Remove corrupted data
                    this.remove(key);
                    return null;
                }
            } catch (e) {
                console.error('Error getting storage value:', e);
                return null;
            }
        },
        
        /**
         * Remove value from storage
         * @param {string} key - Storage key
         * @returns {boolean} True if successful, false otherwise
         */
        remove: function(key) {
            try {
                // Validate key
                if (!key || typeof key !== 'string') {
                    console.error('Invalid storage key');
                    return false;
                }
                
                removeItem(key);
                return true;
            } catch (e) {
                console.error('Error removing storage value:', e);
                return false;
            }
        },
        
        /**
         * Clear all storage
         * @returns {boolean} True if successful, false otherwise
         */
        clear: function() {
            try {
                clearStorage();
                return true;
            } catch (e) {
                console.error('Error clearing storage:', e);
                return false;
            }
        },
        
        /**
         * Get approximate storage size in bytes
         * @returns {number} Size in bytes
         */
        getSize: function() {
            try {
                return calculateSize();
            } catch (e) {
                console.error('Error calculating storage size:', e);
                return 0;
            }
        }
    };
})();

/* ============================================
   ThemeManager Module
   Manages light/dark mode theme switching
   ============================================ */
const ThemeManager = (function() {
    // Private variables
    const STORAGE_KEY = 'todo_dashboard_theme';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };
    let currentTheme = THEMES.LIGHT;

    /**
     * Get theme from localStorage with fallback to 'light'
     * @private
     * @returns {string} Theme name ('light' or 'dark')
     */
    function loadThemeFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
                return stored;
            }
        } catch (error) {
            console.warn('Failed to load theme from localStorage:', error);
        }
        return THEMES.LIGHT; // Default fallback
    }

    /**
     * Save theme to localStorage
     * @private
     * @param {string} theme - Theme name to save
     */
    function saveThemeToStorage(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (error) {
            console.error('Failed to save theme to localStorage:', error);
        }
    }

    /**
     * Apply theme to DOM by manipulating data-theme attribute
     * @private
     * @param {string} theme - Theme name to apply
     */
    function applyTheme(theme) {
        const body = document.body;
        
        if (theme === THEMES.DARK) {
            body.setAttribute('data-theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
        }
        
        // Update theme toggle icon
        updateThemeIcon(theme);
        
        currentTheme = theme;
    }

    /**
     * Update theme toggle button icon
     * @private
     * @param {string} theme - Current theme
     */
    function updateThemeIcon(theme) {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            // Moon icon for light mode (clicking will go to dark)
            // Sun icon for dark mode (clicking will go to light)
            themeIcon.textContent = theme === THEMES.LIGHT ? '🌙' : '☀️';
        }
    }

    /**
     * Initialize theme manager
     * Loads theme from localStorage and applies it before DOM ready to avoid flash
     * @public
     */
    function init() {
        // Load theme from storage
        const savedTheme = loadThemeFromStorage();
        currentTheme = savedTheme;
        
        // Apply theme immediately (before DOM ready to avoid flash)
        applyTheme(currentTheme);
        
        // Setup theme toggle button event listener when DOM is ready
        const setupToggleButton = function() {
            const toggleButton = document.getElementById('theme-toggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', toggle);
            } else {
                console.warn('Theme toggle button not found');
            }
        };

        // If DOM is already loaded, setup immediately
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupToggleButton);
        } else {
            setupToggleButton();
        }
    }

    /**
     * Set theme explicitly
     * @public
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    function setTheme(theme) {
        if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) {
            console.warn(`Invalid theme: ${theme}. Using 'light' as fallback.`);
            theme = THEMES.LIGHT;
        }
        
        applyTheme(theme);
        saveThemeToStorage(theme);
    }

    /**
     * Get current theme
     * @public
     * @returns {string} Current theme name
     */
    function getTheme() {
        return currentTheme;
    }

    /**
     * Toggle between light and dark themes
     * @public
     */
    function toggle() {
        const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        setTheme(newTheme);
    }

    // Public API
    return {
        init: init,
        setTheme: setTheme,
        getTheme: getTheme,
        toggle: toggle
    };
})();

/* ============================================
   GreetingComponent Module
   Displays real-time clock, date, and personalized greeting
   ============================================ */
const GreetingComponent = (function() {
    // Module implementation will be added in Task 5.1
    return {
        init: function(containerSelector) {},
        updateTime: function() {},
        setName: function(name) {},
        getName: function() { return null; },
        getGreeting: function() { return 'Selamat Datang'; }
    };
})();

/* ============================================
   TimerComponent Module
   Implements Pomodoro timer with countdown functionality
   ============================================ */
const TimerComponent = (function() {
    // Module implementation will be added in Task 6.1
    return {
        init: function(containerSelector) {},
        start: function() {},
        stop: function() {},
        reset: function() {},
        setDuration: function(minutes) {},
        getTimeRemaining: function() { return 0; }
    };
})();

/* ============================================
   TodoComponent Module
   Manages to-do list CRUD operations
   ============================================ */
const TodoComponent = (function() {
    // Module implementation will be added in Task 8.1
    return {
        init: function(containerSelector) {},
        addTask: function(text) { return false; },
        editTask: function(id, newText) { return false; },
        toggleTask: function(id) {},
        deleteTask: function(id) {},
        getTasks: function() { return []; },
        render: function() {}
    };
})();

/* ============================================
   LinksComponent Module
   Manages quick links to favorite websites
   ============================================ */
const LinksComponent = (function() {
    // Module implementation will be added in Task 9.1
    return {
        init: function(containerSelector) {},
        addLink: function(name, url) { return false; },
        deleteLink: function(id) {},
        validateUrl: function(url) { return false; },
        getLinks: function() { return []; },
        render: function() {}
    };
})();

/* ============================================
   App Module
   Main application orchestrator
   ============================================ */
const App = (function() {
    // Module implementation will be added in Task 11.1
    return {
        init: function() {
            console.log('To-Do Life Dashboard - Ready for implementation');
            console.log('Modules initialized (skeleton only)');
        }
    };
})();

/* ============================================
   Application Entry Point
   Initialize ThemeManager BEFORE DOM ready to avoid flash
   Initialize other modules when DOM is ready
   ============================================ */

// Initialize theme immediately to avoid flash of unstyled content
ThemeManager.init();

// Initialize other modules when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        App.init();
    });
} else {
    App.init();
}
