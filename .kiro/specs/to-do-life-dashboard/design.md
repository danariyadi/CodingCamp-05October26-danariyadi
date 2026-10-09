# Design Document: To-Do Life Dashboard

## Overview

To-Do Life Dashboard adalah aplikasi web single-page yang dibangun dengan vanilla JavaScript, tanpa framework atau library eksternal. Aplikasi ini menyediakan antarmuka dashboard produktivitas yang menggabungkan greeting personal, timer fokus Pomodoro, to-do list, dan quick links ke website favorit. Semua data pengguna disimpan secara lokal menggunakan Browser LocalStorage API.

### Tujuan Design

Design ini bertujuan untuk:
1. Menciptakan arsitektur modular yang mudah dipelihara tanpa framework
2. Memastikan performa optimal dengan direct DOM manipulation
3. Menyediakan data persistence yang reliable dengan error handling yang robust
4. Mengimplementasikan UI yang responsif dan accessible

### Teknologi Stack

- **HTML5**: Struktur markup semantik
- **CSS3**: Styling dengan CSS custom properties untuk theming
- **Vanilla JavaScript (ES6+)**: Logic aplikasi tanpa framework
- **LocalStorage API**: Data persistence di browser

### Prinsip Design

1. **Separation of Concerns**: Setiap komponen memiliki tanggung jawab yang jelas
2. **Progressive Enhancement**: Aplikasi tetap berfungsi meskipun fitur tertentu tidak tersedia
3. **Fail Gracefully**: Error handling untuk semua operasi I/O (LocalStorage)
4. **Mobile First**: Design responsif yang mengutamakan pengalaman mobile
5. **No Build Process**: Aplikasi dapat berjalan langsung dengan membuka file HTML

## Architecture

### High-Level Architecture

Aplikasi menggunakan **Module Pattern** dengan struktur berikut:

```
┌─────────────────────────────────────────────────┐
│              index.html (Entry Point)            │
└─────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐            ┌─────────▼──────────┐
│   styles.css    │            │     script.js       │
│  (css/ folder)  │            │   (js/ folder)      │
└────────────────┘            └──────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
            ┌───────▼────────┐  ┌──────▼──────┐   ┌───────▼────────┐
            │  StorageManager │  │    App      │   │  ThemeManager  │
            │    (Module)     │  │  (Module)   │   │    (Module)    │
            └────────────────┘  └──────────────┘   └────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┬──────────────────┐
                    │                   │                   │                  │
            ┌───────▼────────┐  ┌──────▼──────┐   ┌───────▼────────┐  ┌──────▼──────┐
            │GreetingComponent│  │TimerComponent│   │  TodoComponent │  │LinksComponent│
            │    (Module)     │  │   (Module)   │   │    (Module)    │  │   (Module)  │
            └────────────────┘  └──────────────┘   └────────────────┘  └──────────────┘
                    │                   │                   │                  │
                    └───────────────────┴───────────────────┴──────────────────┘
                                        │
                                ┌───────▼────────┐
                                │  LocalStorage  │
                                │   (Browser)    │
                                └────────────────┘
```

### Layer Architecture

1. **Presentation Layer** (HTML + CSS)
   - Struktur DOM semantic
   - Styling dengan CSS variables untuk theming
   - Responsive layout dengan Flexbox/Grid

2. **Application Layer** (JavaScript Modules)
   - **App Module**: Orchestrator utama, inisialisasi komponen
   - **Component Modules**: GreetingComponent, TimerComponent, TodoComponent, LinksComponent
   - **Service Modules**: StorageManager, ThemeManager

3. **Data Layer** (LocalStorage)
   - Persistence layer dengan error handling
   - JSON serialization/deserialization
   - Validation dan migration support

### Module Pattern Implementation

Setiap modul menggunakan **IIFE (Immediately Invoked Function Expression)** untuk encapsulation:

```javascript
const ModuleName = (function() {
    // Private variables
    let privateVar = null;
    
    // Private functions
    function privateFunction() {
        // ...
    }
    
    // Public API
    return {
        publicMethod() {
            // ...
        }
    };
})();
```

Keuntungan pendekatan ini:
- **Encapsulation**: Private state tidak bisa diakses dari luar
- **No Global Pollution**: Hanya satu global variable per module
- **Clear API**: Public methods eksplisit di return statement
- **No Build Tools**: Bekerja langsung di browser tanpa transpiling

## Components and Interfaces

### 1. StorageManager Module

**Tanggung Jawab**: Mengelola semua operasi LocalStorage dengan error handling

**Public Interface**:
```javascript
StorageManager = {
    // Cek apakah LocalStorage tersedia
    isAvailable(): boolean
    
    // Simpan data dengan key
    set(key: string, value: any): boolean
    
    // Ambil data dari key
    get(key: string): any | null
    
    // Hapus data dari key
    remove(key: string): boolean
    
    // Hapus semua data
    clear(): boolean
    
    // Get storage size (untuk monitoring)
    getSize(): number
}
```

**Implementasi Detail**:
- Try-catch wrapper untuk semua operasi localStorage
- Automatic JSON serialization/deserialization
- Deteksi QuotaExceededError dan private browsing mode
- Fallback ke in-memory storage jika localStorage tidak tersedia
- Validation untuk corrupted data

**Error Handling Strategy**:
```javascript
// QuotaExceededError handling
try {
    localStorage.setItem(key, value);
} catch (e) {
    if (e.name === 'QuotaExceededError') {
        // Bersihkan data lama atau tampilkan warning
        showStorageWarning();
    } else if (e.name === 'SecurityError') {
        // Private browsing mode
        useInMemoryStorage();
    }
}
```

### 2. ThemeManager Module

**Tanggung Jawab**: Mengelola light/dark mode theme switching

**Public Interface**:
```javascript
ThemeManager = {
    // Initialize theme dari localStorage atau default
    init(): void
    
    // Set theme (light/dark)
    setTheme(theme: string): void
    
    // Get current theme
    getTheme(): string
    
    // Toggle between themes
    toggle(): void
}
```

**Implementasi Detail**:
- Menggunakan CSS custom properties (CSS variables) untuk theme colors
- Apply theme dengan menambah/menghapus class di `<body>`
- Smooth transition antar theme dengan CSS transitions
- Persist theme preference ke localStorage
- Load theme sebelum DOM ready untuk menghindari flash

**CSS Variables Strategy**:
```css
:root {
    --bg-primary: #ffffff;
    --text-primary: #333333;
    /* ... */
}

[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --text-primary: #f0f0f0;
    /* ... */
}
```

### 3. GreetingComponent Module

**Tanggung Jawab**: Menampilkan waktu real-time, tanggal, dan greeting personal

**Public Interface**:
```javascript
GreetingComponent = {
    // Initialize component
    init(containerSelector: string): void
    
    // Update time display (called every second)
    updateTime(): void
    
    // Set/update custom name
    setName(name: string): void
    
    // Get current name
    getName(): string
    
    // Get greeting based on time
    getGreeting(): string
}
```

**Implementasi Detail**:
- `setInterval` untuk update waktu setiap 1 detik
- Format tanggal: "Senin, 13 Januari 2025"
- Greeting logic berdasarkan jam:
  - 05:00-11:59: "Selamat Pagi"
  - 12:00-17:59: "Selamat Siang"
  - 18:00-21:59: "Selamat Malam"
  - 22:00-04:59: "Selamat Tidur"
- Custom name editable dengan click-to-edit interaction
- Auto-save name ke localStorage saat berubah

**Time Update Pattern**:
```javascript
// Prevent timer drift dengan recalculation setiap update
function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Update DOM
    updateDisplay(hours, minutes, seconds);
    
    // Calculate next exact second
    const delay = 1000 - now.getMilliseconds();
    setTimeout(updateClock, delay);
}
```

### 4. TimerComponent Module

**Tanggung Jawab**: Implementasi Pomodoro timer dengan countdown

**Public Interface**:
```javascript
TimerComponent = {
    // Initialize component
    init(containerSelector: string): void
    
    // Start countdown
    start(): void
    
    // Stop/pause countdown
    stop(): void
    
    // Reset to initial duration
    reset(): void
    
    // Set custom duration (in minutes)
    setDuration(minutes: number): void
    
    // Get remaining time
    getTimeRemaining(): number
}
```

**Implementasi Detail**:
- Default duration: 25 menit (1500 detik)
- Display format: MM:SS
- `setInterval` untuk countdown setiap 1 detik
- State management: 'idle', 'running', 'paused'
- Button state management (disable start saat running, dll)
- Audio/visual notification saat timer selesai
- Persist custom duration ke localStorage
- Load duration dari localStorage saat init

**Timer State Machine**:
```
     ┌──────┐
     │ IDLE │
     └───┬──┘
         │ start()
         ▼
    ┌─────────┐
    │ RUNNING │◄──┐
    └────┬────┘   │
         │        │
         │ stop() │ start()
         ▼        │
    ┌────────┐   │
    │ PAUSED ├───┘
    └───┬────┘
        │ reset()
        ▼
     ┌──────┐
     │ IDLE │
     └──────┘
```

**Countdown Algorithm**:
```javascript
function startCountdown() {
    intervalId = setInterval(() => {
        remainingSeconds--;
        
        if (remainingSeconds <= 0) {
            // Timer complete
            stop();
            showNotification();
            playSound();
            remainingSeconds = duration;
        }
        
        updateDisplay();
    }, 1000);
}
```

### 5. TodoComponent Module

**Tanggung Jawab**: Mengelola to-do list (CRUD operations)

**Public Interface**:
```javascript
TodoComponent = {
    // Initialize component
    init(containerSelector: string): void
    
    // Add new task
    addTask(text: string): boolean
    
    // Edit existing task
    editTask(id: string, newText: string): boolean
    
    // Toggle task completion
    toggleTask(id: string): void
    
    // Delete task
    deleteTask(id: string): void
    
    // Get all tasks
    getTasks(): Array<Task>
    
    // Render tasks to DOM
    render(): void
}
```

**Implementasi Detail**:
- Task ID generation: timestamp-based unique ID
- Input validation: reject empty/whitespace-only text
- Edit mode: inline editing dengan contenteditable atau input replacement
- Checkbox untuk toggle completion status
- Visual indicator untuk completed tasks (strikethrough)
- Delete dengan confirmation untuk UX safety
- Persist tasks array ke localStorage setiap perubahan
- Load tasks dari localStorage saat init
- Event delegation untuk efficient event handling

**Task Operations Flow**:
```
User Action → Validate Input → Update Data Model → Update LocalStorage → Re-render UI
```

**Event Delegation Pattern**:
```javascript
// Satu event listener untuk semua tasks
todoList.addEventListener('click', (e) => {
    const target = e.target;
    const taskId = target.closest('.task-item')?.dataset.id;
    
    if (target.matches('.task-checkbox')) {
        toggleTask(taskId);
    } else if (target.matches('.task-edit-btn')) {
        editTask(taskId);
    } else if (target.matches('.task-delete-btn')) {
        deleteTask(taskId);
    }
});
```

### 6. LinksComponent Module

**Tanggung Jawab**: Mengelola quick links ke website favorit

**Public Interface**:
```javascript
LinksComponent = {
    // Initialize component
    init(containerSelector: string): void
    
    // Add new link
    addLink(name: string, url: string): boolean
    
    // Delete link
    deleteLink(id: string): void
    
    // Validate URL format
    validateUrl(url: string): boolean
    
    // Get all links
    getLinks(): Array<Link>
    
    // Render links to DOM
    render(): void
}
```

**Implementasi Detail**:
- Link ID generation: timestamp-based
- URL validation: regex untuk http:// atau https://
- Auto-prepend http:// jika missing protocol
- Default name: gunakan URL jika name kosong
- Open link di new tab dengan `target="_blank"` dan `rel="noopener noreferrer"`
- Delete dengan confirmation
- Persist links array ke localStorage
- Load links dari localStorage saat init

**URL Validation**:
```javascript
function validateUrl(url) {
    // Basic URL pattern
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return pattern.test(url);
}

function normalizeUrl(url) {
    // Prepend http:// jika tidak ada protocol
    if (!/^https?:\/\//i.test(url)) {
        return 'http://' + url;
    }
    return url;
}
```

### 7. App Module

**Tanggung Jawab**: Main application orchestrator

**Public Interface**:
```javascript
App = {
    // Initialize entire application
    init(): void
}
```

**Implementasi Detail**:
- Check browser compatibility
- Initialize StorageManager
- Initialize ThemeManager
- Initialize all components in correct order
- Setup global event listeners
- Setup error handling
- Check LocalStorage availability dan tampilkan warning jika perlu

**Initialization Sequence**:
```javascript
function init() {
    try {
        // 1. Check dependencies
        checkBrowserSupport();
        
        // 2. Initialize storage
        StorageManager.init();
        
        // 3. Initialize theme (before render untuk avoid flash)
        ThemeManager.init();
        
        // 4. Initialize components
        GreetingComponent.init('#greeting-section');
        TimerComponent.init('#timer-section');
        TodoComponent.init('#todo-section');
        LinksComponent.init('#links-section');
        
        // 5. Setup global handlers
        setupErrorHandlers();
        setupKeyboardShortcuts();
        
    } catch (error) {
        handleCriticalError(error);
    }
}
```

## Data Models

### LocalStorage Schema

Semua data disimpan sebagai JSON strings dalam LocalStorage dengan keys berikut:

#### 1. Tasks Data
**Key**: `todo_dashboard_tasks`

**Schema**:
```json
{
    "tasks": [
        {
            "id": "1705123456789",
            "text": "Belajar JavaScript",
            "completed": false,
            "createdAt": "2025-01-13T10:30:00.000Z"
        }
    ]
}
```

**TypeScript Interface** (for reference):
```typescript
interface Task {
    id: string;           // Timestamp-based unique ID
    text: string;         // Task description (non-empty)
    completed: boolean;   // Completion status
    createdAt: string;    // ISO 8601 timestamp
}

interface TasksData {
    tasks: Task[];
}
```

#### 2. Links Data
**Key**: `todo_dashboard_links`

**Schema**:
```json
{
    "links": [
        {
            "id": "1705123456790",
            "name": "GitHub",
            "url": "https://github.com",
            "createdAt": "2025-01-13T10:30:00.000Z"
        }
    ]
}
```

**TypeScript Interface** (for reference):
```typescript
interface Link {
    id: string;           // Timestamp-based unique ID
    name: string;         // Display name
    url: string;          // Valid URL with protocol
    createdAt: string;    // ISO 8601 timestamp
}

interface LinksData {
    links: Link[];
}
```

#### 3. User Preferences
**Key**: `todo_dashboard_preferences`

**Schema**:
```json
{
    "customName": "Dany",
    "theme": "dark",
    "timerDuration": 25,
    "version": "1.0.0"
}
```

**TypeScript Interface** (for reference):
```typescript
interface UserPreferences {
    customName?: string;     // Custom greeting name (optional)
    theme: 'light' | 'dark'; // Theme preference
    timerDuration: number;   // Timer duration in minutes
    version: string;         // Data schema version for migration
}
```

### Data Validation

Setiap kali data dibaca dari LocalStorage, lakukan validation:

```javascript
function validateTasksData(data) {
    if (!data || !Array.isArray(data.tasks)) {
        return { tasks: [] }; // Return default
    }
    
    // Validate each task
    const validTasks = data.tasks.filter(task => {
        return task.id &&
               typeof task.text === 'string' &&
               task.text.trim() !== '' &&
               typeof task.completed === 'boolean';
    });
    
    return { tasks: validTasks };
}
```

### Data Migration Strategy

Support untuk schema version changes:

```javascript
function migrateData(data, fromVersion, toVersion) {
    let migrated = data;
    
    // Example: v1.0.0 -> v1.1.0
    if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
        // Add new fields with defaults
        migrated.tasks.forEach(task => {
            if (!task.createdAt) {
                task.createdAt = new Date().toISOString();
            }
        });
    }
    
    migrated.version = toVersion;
    return migrated;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Property-Based Testing Not Applicable

**Validates: Requirements 1-10** (All requirements - testing strategy decision)

After analyzing the requirements and feature characteristics of To-Do Life Dashboard, **Property-Based Testing (PBT) is NOT applicable** to this application.

**Rationale:**

This application falls into multiple categories where PBT is explicitly not recommended:

**1. UI Rendering & Layout Dominance**
- Primary features: greeting display, timer countdown display, task list rendering, link buttons rendering
- No universal properties across input variations for visual presentation
- Testing concerns: visual correctness, layout responsiveness, user interaction feedback
- **Alternative**: Snapshot tests, visual regression tests, manual testing with checklist

**2. Simple CRUD Operations Without Complex Logic**
- Task operations: add, edit, delete, toggle completion (straightforward state mutations)
- Link operations: add, delete (basic list management)
- No complex business rules or data transformations requiring property validation
- **Alternative**: Example-based unit tests with representative scenarios

**3. Configuration & State Management**
- Theme switching (binary state: light/dark)
- Timer state machine (idle/running/paused)
- Preference persistence (key-value storage)
- These are discrete state transitions, not continuous input spaces
- **Alternative**: Example-based tests for specific state transitions

**4. Side-Effect Only Operations**
- LocalStorage writes (no return value to assert properties on)
- Timer notifications (visual/audio feedback)
- DOM updates (imperative mutations)
- Clock updates (setInterval side effects)
- **Alternative**: Mock-based unit tests to verify correct calls

**5. External Service Dependencies**
- Browser APIs: LocalStorage, Date, setInterval, setTimeout
- DOM APIs: manipulation and event handling
- Cannot control or generate inputs for these external dependencies
- **Alternative**: Integration tests with real browser environment

**Testing Approaches for This Application:**

Given the nature of this application, the following testing approaches are appropriate:

**1. Pure Function Unit Tests**
Test utility functions with example-based tests:
- `formatTime(seconds: number): string` - test with 0, 61, 1500, 3599, 3600
- `validateUrl(url: string): boolean` - test with valid/invalid URLs
- `calculateGreeting(hour: number): string` - test boundary hours 5, 11, 12, 17, 18, 21, 22, 4
- `normalizeUrl(url: string): string` - test URLs with/without protocol
- `sanitizeInput(text: string): string` - test with whitespace, special chars

**2. Component Integration Tests**
Test component behavior with specific scenarios:
- Timer: start → countdown → notification flow
- Todo: add → edit → toggle → delete flow
- Links: add → validate → open → delete flow
- Storage: write → read → validate → recover from error

**3. Manual Testing Checklist**
Comprehensive checklist covering:
- All user interactions (clicks, edits, toggles)
- Visual design and responsiveness (desktop, tablet, mobile)
- Error states and user feedback
- Cross-browser compatibility
- Performance with realistic data volumes

**4. Smoke Tests**
One-time initialization checks:
- Application loads successfully
- LocalStorage is available (or graceful fallback)
- All components initialize correctly
- Browser compatibility check

**Decision Matrix: Properties vs Examples**

For reference, here's why each acceptance criterion maps to examples rather than properties:

| Criterion | Type | Reasoning |
|-----------|------|-----------|
| Timer countdown accuracy | Example | Test with specific duration (25 min), not infinite durations |
| Task validation (empty/whitespace) | Example | Test specific cases: "", "   ", "a", not all strings |
| URL validation | Example | Test known valid/invalid patterns, not all possible strings |
| Greeting time ranges | Example | Test boundary hours (5, 11, 12, etc.), not all 24 hours |
| Theme switching | Example | Test light→dark and dark→light, not properties of all themes |
| Storage operations | Integration | Test read/write cycles with browser LocalStorage |
| UI rendering | Manual | Visual inspection, cannot assert properties programmatically |

**Conclusion:**

This application requires **practical, example-based testing** focused on:
- Correctness of specific scenarios
- Integration with browser APIs
- Visual design and UX validation
- Error handling and edge cases

Property-based testing would add complexity without proportional value, as there are no meaningful universal properties to validate across large input spaces in this UI-focused application.

## Error Handling

### Error Categories

1. **Storage Errors**
   - QuotaExceededError: Storage limit reached
   - SecurityError: Private browsing mode
   - InvalidStateError: Storage corrupted

2. **Validation Errors**
   - Empty input
   - Invalid URL format
   - Corrupted JSON data

3. **Runtime Errors**
   - DOM element not found
   - Event handler errors
   - Timer/interval errors

### Error Handling Strategy

**1. Try-Catch Wrapping**:
```javascript
function safeStorageOperation(operation) {
    try {
        return operation();
    } catch (error) {
        console.error('Storage operation failed:', error);
        
        if (error.name === 'QuotaExceededError') {
            showNotification('Storage penuh. Hapus data lama.', 'warning');
        } else if (error.name === 'SecurityError') {
            showNotification('LocalStorage tidak tersedia. Data tidak akan tersimpan.', 'error');
        }
        
        return null;
    }
}
```

**2. Input Validation**:
```javascript
function addTask(text) {
    // Validate before processing
    if (!text || text.trim() === '') {
        showNotification('Task tidak boleh kosong', 'error');
        return false;
    }
    
    if (text.length > 500) {
        showNotification('Task terlalu panjang (max 500 karakter)', 'error');
        return false;
    }
    
    // Process valid input
    // ...
}
```

**3. Graceful Degradation**:
```javascript
// Fallback ke in-memory storage jika LocalStorage tidak tersedia
const storage = {
    data: {},
    
    setItem(key, value) {
        if (StorageManager.isAvailable()) {
            localStorage.setItem(key, value);
        } else {
            this.data[key] = value;
        }
    },
    
    getItem(key) {
        if (StorageManager.isAvailable()) {
            return localStorage.getItem(key);
        } else {
            return this.data[key] || null;
        }
    }
};
```

**4. User Feedback**:
```javascript
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove setelah 3 detik
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
```

### Critical Error Handling

Untuk error yang membuat aplikasi tidak bisa berfungsi:

```javascript
function handleCriticalError(error) {
    console.error('Critical error:', error);
    
    // Tampilkan error message di UI
    const errorDiv = document.getElementById('error-container');
    errorDiv.innerHTML = `
        <div class="critical-error">
            <h2>Oops! Terjadi kesalahan</h2>
            <p>${error.message}</p>
            <button onclick="location.reload()">Refresh Halaman</button>
        </div>
    `;
    errorDiv.style.display = 'block';
}

// Global error handler
window.addEventListener('error', (event) => {
    handleCriticalError(event.error);
});
```

## Testing Strategy

### Unit Testing Approach

Meskipun aplikasi ini tidak menggunakan framework testing formal, implementasi harus dirancang agar testable:

**1. Pure Function Design**:
```javascript
// ✅ GOOD - Pure function, mudah ditest
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${pad(minutes)}:${pad(secs)}`;
}

// ❌ BAD - Side effects, sulit ditest
function updateTimer() {
    const seconds = parseInt(timerElement.dataset.seconds);
    timerElement.textContent = `${Math.floor(seconds/60)}:${seconds%60}`;
}
```

**2. Dependency Injection**:
```javascript
// Inject dependencies untuk memudahkan testing
function TodoComponent(storageManager, notificationService) {
    // Use injected dependencies
    // ...
}
```

**3. Manual Testing Checklist**:

**Greeting Component**:
- [ ] Waktu update setiap detik dengan akurat
- [ ] Tanggal format benar (hari, tanggal bulan tahun)
- [ ] Greeting berubah sesuai waktu (pagi/siang/malam/tidur)
- [ ] Custom name bisa diset dan persisted
- [ ] Click-to-edit interaction berfungsi

**Timer Component**:
- [ ] Timer countdown akurat (tidak drift)
- [ ] Start/stop/reset buttons berfungsi
- [ ] Button states correct (start disabled saat running, dll)
- [ ] Display format MM:SS benar
- [ ] Notification muncul saat timer selesai
- [ ] Custom duration disimpan dan dimuat
- [ ] Timer berfungsi di background tab (atau pause dengan proper feedback)

**Todo Component**:
- [ ] Task bisa ditambah dengan text valid
- [ ] Task kosong/whitespace ditolak dengan feedback
- [ ] Task bisa di-edit dengan text valid
- [ ] Edit dengan text kosong dibatalkan
- [ ] Task bisa ditandai complete/incomplete
- [ ] Completed task menampilkan strikethrough
- [ ] Task bisa dihapus
- [ ] Tasks persisted ke LocalStorage
- [ ] Tasks dimuat dari LocalStorage saat refresh
- [ ] Urutan tasks preserved

**Links Component**:
- [ ] Link bisa ditambah dengan URL valid
- [ ] URL invalid ditolak dengan error message
- [ ] URL tanpa protocol auto-prepend http://
- [ ] Link tanpa name menggunakan URL sebagai name
- [ ] Link membuka di new tab dengan rel="noopener noreferrer"
- [ ] Link bisa dihapus
- [ ] Links persisted ke LocalStorage
- [ ] Links dimuat dari LocalStorage saat refresh

**Theme Switching**:
- [ ] Default theme adalah light mode
- [ ] Toggle ke dark mode mengubah semua colors
- [ ] Toggle smooth tanpa flicker
- [ ] Theme preference persisted
- [ ] Theme loaded before render (no flash)
- [ ] Visual indicator untuk active theme

**Storage & Error Handling**:
- [ ] Aplikasi berfungsi saat LocalStorage tidak tersedia
- [ ] Warning ditampilkan jika storage quota exceeded
- [ ] Corrupted data di-handle dengan fallback ke default
- [ ] Error messages jelas dan helpful
- [ ] Critical errors ditampilkan dengan proper UI

**Responsiveness**:
- [ ] Layout rapi di desktop (1024px+)
- [ ] Layout rapi di tablet (768px-1023px)
- [ ] Layout rapi di mobile (375px-767px)
- [ ] No horizontal scrolling
- [ ] Touch targets minimal 44x44px
- [ ] Font size readable (min 14px body text)

**Browser Compatibility**:
- [ ] Berfungsi di Chrome latest
- [ ] Berfungsi di Firefox latest
- [ ] Berfungsi di Safari latest
- [ ] Berfungsi di Edge latest

**Performance**:
- [ ] Load time < 2 detik
- [ ] Interaksi responsive < 100ms
- [ ] Smooth dengan 100 tasks
- [ ] Smooth dengan 50 links
- [ ] No memory leaks (check DevTools Memory)

