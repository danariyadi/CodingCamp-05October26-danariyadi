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
            themeIcon.textContent = theme === THEMES.LIGHT ? 'MODE GELAP' : 'MODE TERANG';
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
   GreetingComponent
   ============================================ */
const GreetingComponent = (function() {
    const NAME_KEY = 'todo_dashboard_name'; let timeNode, dateNode, messageNode, nameNode, clockId;
    function updateTime() { const now = new Date(); if (timeNode) timeNode.textContent = now.toLocaleTimeString('id-ID', { hour12: false }); if (dateNode) dateNode.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); if (messageNode) { const h = now.getHours(); messageNode.textContent = h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : 'Selamat Malam'; } }
    function setName(name) { const value = String(name || '').trim().slice(0, 60); if (nameNode) nameNode.textContent = value; StorageManager.set(NAME_KEY, value); }
    function init() { timeNode = document.getElementById('time-display'); dateNode = document.getElementById('date-display'); messageNode = document.getElementById('greeting-message'); nameNode = document.getElementById('greeting-name'); if (nameNode) { nameNode.textContent = StorageManager.get(NAME_KEY) || ''; nameNode.contentEditable = 'true'; nameNode.setAttribute('role', 'textbox'); nameNode.setAttribute('aria-label', 'Nama Anda'); nameNode.addEventListener('blur', () => setName(nameNode.textContent)); nameNode.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nameNode.blur(); } }); } updateTime(); clearInterval(clockId); clockId = setInterval(updateTime, 1000); }
    return { init, updateTime, setName, getName: () => nameNode ? nameNode.textContent : '', getGreeting: () => messageNode ? messageNode.textContent : 'Selamat Datang' };
})();

const TimerComponent = (function() {
    let display, durationInput, startButton, stopButton, intervalId = null, remaining = 1500;
    function paint() { if (display) display.textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`; }
    function stop() { if (intervalId !== null) clearInterval(intervalId); intervalId = null; if (startButton) startButton.disabled = false; if (stopButton) stopButton.disabled = true; }
    function setDuration(minutes) { const n = Number(minutes); if (!Number.isFinite(n) || n < 1 || n > 120) return false; stop(); remaining = Math.round(n) * 60; if (durationInput) durationInput.value = String(Math.round(n)); paint(); return true; }
    function start() { if (intervalId !== null) return; if (remaining <= 0) setDuration(durationInput ? durationInput.value : 25); intervalId = setInterval(() => { remaining = Math.max(0, remaining - 1); paint(); if (!remaining) { stop(); NotificationManager.show('Waktu fokus selesai!', 'success'); } }, 1000); if (startButton) startButton.disabled = true; if (stopButton) stopButton.disabled = false; }
    function reset() { stop(); setDuration(durationInput ? durationInput.value : 25); }
    function init() { display = document.getElementById('timer-display'); durationInput = document.getElementById('timer-duration'); startButton = document.getElementById('timer-start'); stopButton = document.getElementById('timer-stop'); startButton?.addEventListener('click', start); stopButton?.addEventListener('click', stop); document.getElementById('timer-reset')?.addEventListener('click', reset); durationInput?.addEventListener('change', () => { if (!setDuration(durationInput.value)) { durationInput.value = String(Math.max(1, Math.min(120, Number(durationInput.value) || 25))); setDuration(durationInput.value); } }); paint(); }
    return { init, start, stop, reset, setDuration, getTimeRemaining: () => remaining };
})();

const TodoComponent = (function() {
    const KEY = 'todo_dashboard_tasks'; let list, tasks = [];
    function persist() { StorageManager.set(KEY, tasks); }
    function render() { if (!list) return; list.replaceChildren(); tasks.forEach(task => { const li = document.createElement('li'); li.className = `todo-item${task.completed ? ' completed' : ''}`; const check = document.createElement('input'); check.type = 'checkbox'; check.className = 'todo-checkbox'; check.checked = task.completed; check.setAttribute('aria-label', 'Tandai selesai'); check.addEventListener('change', () => toggleTask(task.id)); const text = document.createElement('span'); text.className = 'todo-text'; text.textContent = task.text; const actions = document.createElement('div'); actions.className = 'todo-actions'; const edit = document.createElement('button'); edit.className = 'btn btn-secondary btn-icon'; edit.type = 'button'; edit.textContent = '✎'; edit.setAttribute('aria-label', 'Edit task'); edit.addEventListener('click', () => { const value = window.prompt('Edit task:', task.text); if (value !== null) editTask(task.id, value); }); const del = document.createElement('button'); del.className = 'btn btn-secondary btn-icon'; del.type = 'button'; del.textContent = '×'; del.setAttribute('aria-label', 'Hapus task'); del.addEventListener('click', () => deleteTask(task.id)); actions.append(edit, del); li.append(check, text, actions); list.append(li); }); }
    function addTask(text) { const value = String(text || '').trim(); if (!value) return false; tasks.push({ id: `${Date.now()}-${Math.random()}`, text: value.slice(0, 500), completed: false }); persist(); render(); return true; }
    function editTask(id, text) { const value = String(text || '').trim(), task = tasks.find(t => t.id === id); if (!task || !value) return false; task.text = value.slice(0, 500); persist(); render(); return true; }
    function toggleTask(id) { const task = tasks.find(t => t.id === id); if (task) { task.completed = !task.completed; persist(); render(); } }
    function deleteTask(id) { tasks = tasks.filter(t => t.id !== id); persist(); render(); }
    function init() { list = document.getElementById('todo-list'); const input = document.getElementById('todo-input'); const add = () => { if (addTask(input.value)) input.value = ''; input.focus(); }; document.getElementById('todo-add')?.addEventListener('click', add); input?.addEventListener('keydown', e => { if (e.key === 'Enter') add(); }); const saved = StorageManager.get(KEY); tasks = Array.isArray(saved) ? saved.filter(t => t && typeof t.text === 'string').map(t => ({ id: t.id || `${Date.now()}-${Math.random()}`, text: t.text, completed: Boolean(t.completed) })) : []; render(); }
    return { init, addTask, editTask, toggleTask, deleteTask, getTasks: () => tasks.slice(), render };
})();

const LinksComponent = (function() {
    const KEY = 'todo_dashboard_links'; let grid, links = [];
    function validateUrl(value) { try { const u = new URL(String(value).trim()); return u.protocol === 'http:' || u.protocol === 'https:'; } catch (_) { return false; } }
    function render() { if (!grid) return; grid.replaceChildren(); links.forEach(link => { const card = document.createElement('article'); card.className = 'link-card'; const a = document.createElement('a'); a.href = link.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; const name = document.createElement('div'); name.className = 'link-name'; name.textContent = link.name; const url = document.createElement('div'); url.className = 'link-url'; url.textContent = link.url; a.append(name, url); const actions = document.createElement('div'); actions.className = 'link-actions'; const del = document.createElement('button'); del.type = 'button'; del.className = 'btn btn-secondary btn-icon'; del.textContent = '×'; del.setAttribute('aria-label', `Hapus ${link.name}`); del.addEventListener('click', () => deleteLink(link.id)); actions.append(del); card.append(a, actions); grid.append(card); }); }
    function addLink(name, url) { const label = String(name || '').trim(), address = String(url || '').trim(); if (!label || !validateUrl(address)) return false; links.push({ id: `${Date.now()}-${Math.random()}`, name: label.slice(0, 100), url: address }); StorageManager.set(KEY, links); render(); return true; }
    function deleteLink(id) { links = links.filter(l => l.id !== id); StorageManager.set(KEY, links); render(); }
    function init() { grid = document.getElementById('links-grid'); const name = document.getElementById('link-name'), url = document.getElementById('link-url'); const add = () => { if (!addLink(name.value, url.value)) { NotificationManager.show('Isi nama dan URL http/https yang valid.', 'warning'); return; } name.value = ''; url.value = ''; name.focus(); }; document.getElementById('link-add')?.addEventListener('click', add); [name, url].forEach(i => i?.addEventListener('keydown', e => { if (e.key === 'Enter') add(); })); const saved = StorageManager.get(KEY); links = Array.isArray(saved) ? saved.filter(l => l && l.name && validateUrl(l.url)) : []; render(); }
    return { init, addLink, deleteLink, validateUrl, getLinks: () => links.slice(), render };
})();

const NotificationManager = (function() { function show(message, type = 'info') { const box = document.getElementById('notification-container'); if (!box) return; const node = document.createElement('div'); node.className = `notification notification-${type}`; node.textContent = message; box.append(node); setTimeout(() => node.remove(), 3500); } return { show }; })();
const App = (function() { function init() { GreetingComponent.init(); TimerComponent.init(); TodoComponent.init(); LinksComponent.init(); } return { init }; })();
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
