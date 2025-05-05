// =====================================================================
//  Constants & State Variables
// =====================================================================
const NOTES_STORAGE_KEY = 'startNotesData_v2';
const TEMPLATES_STORAGE_KEY = 'startNoteTemplates';
const NOTEBOOKS_STORAGE_KEY = 'startNoteNotebooks';
const TODOS_STORAGE_KEY = 'flexiNoteTodos'; // NEW: ToDo storage key
const THEME_NAME_KEY = 'startNotesThemeName';
const ACCENT_COLOR_KEY = 'startNotesAccentColor';
const FONT_FAMILY_KEY = 'startNotesFontFamily';
const FONT_SIZE_SCALE_KEY = 'startNotesFontSizeScale';
const LAST_CUSTOM_THEME_KEY = 'startNotesLastCustomTheme';
const SUGGESTION_BOX_ID = 'tag-suggestion-box';
const MOVE_NOTE_MENU_ID = 'move-note-menu';
const DEBOUNCE_DELAY = 1500;

let notes = [];
let templates = [];
let notebooks = [];
let todos = []; // NEW: ToDo state variable
let isViewingArchived = false; // Specific to Notes module
let isViewingTrash = false; // Specific to Notes module
let currentNotebookId = 'all'; // Specific to Notes module
let currentActiveModule = 'notes'; // NEW: Track active module
let sortableInstance = null;
let activeTagInputElement = null;
let activeMoveMenu = null;

const DEFAULT_NOTEBOOK_ID = 'all'; // Specific to Notes module
const DEFAULT_MODULE = 'notes'; // NEW: Default module on load

const NOTE_COLORS = [
    { name: 'Default', value: null, hex: 'transparent' },
    { name: 'Yellow', value: 'note-color-yellow', hex: '#fff9c4' },
    { name: 'Blue', value: 'note-color-blue', hex: '#bbdefb' },
    { name: 'Green', value: 'note-color-green', hex: '#c8e6c9' },
    { name: 'Red', value: 'note-color-red', hex: '#ffcdd2' },
    { name: 'Purple', value: 'note-color-purple', hex: '#e1bee7' },
    { name: 'Grey', value: 'note-color-grey', hex: '#e0e0e0' },
];

const VALID_THEMES = [
    'light', 'dark', 'sepia',
    'solarized-light', 'solarized-dark',
    'nord', 'gruvbox-dark', 'gruvbox-light', 'dracula', 'monochrome'
];
const DEFAULT_THEME = 'light';
const DEFAULT_FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const DEFAULT_FONT_SIZE_SCALE = 1;
const DEFAULT_ACCENT_COLOR = 'default';
const DARK_THEME_NAMES = [
    'dark', 'solarized-dark',
    'nord', 'gruvbox-dark', 'dracula'
];

// =====================================================================
//  DOM References
// =====================================================================

// --- Layout & Sidebar ---
const bodyElement = document.body;
const appSidebar = document.querySelector('.app-sidebar');
const sidebarNav = appSidebar?.querySelector('.sidebar-nav');
const sidebarSettingsBtn = document.getElementById('sidebar-settings-btn'); // Moved
const sidebarThemeToggleBtn = document.getElementById('sidebar-theme-toggle-btn'); // Moved
const themeToggleText = document.getElementById('theme-toggle-text'); // Span inside theme toggle button

// --- Main Content & Header ---
const mainContent = document.querySelector('.main-content');
const mainHeader = mainContent?.querySelector('.main-header');
const headerActions = mainHeader?.querySelector('.header-actions');
const searchInput = document.getElementById('search-input'); // Moved to main header
const exportNotesBtn = document.getElementById('export-notes-btn'); // Keep for now, might become export all
const importNotesBtn = document.getElementById('import-notes-btn'); // Keep for now, might become import all
const importFileInput = document.getElementById('import-file-input');

// --- Module Containers ---
const moduleContainer = document.getElementById('module-container');
const notesModule = document.getElementById('notes-module');
const todoModule = document.getElementById('todo-module');
// Placeholders for other modules (get references if/when implemented)
// const goalsModule = document.getElementById('goals-module');
// const habitsModule = document.getElementById('habits-module');
// const skillsModule = document.getElementById('skills-module');

// --- Notes Module Specific ---
const manageNotebooksBtn = document.getElementById('manage-notebooks-btn');
const manageTemplatesBtn = document.getElementById('manage-templates-btn');
const viewArchiveBtn = document.getElementById('view-archive-btn');
const archiveStatusIndicator = document.getElementById('archive-status-indicator');
const viewTrashBtn = document.getElementById('view-trash-btn');
const trashStatusIndicator = document.getElementById('trash-status-indicator');
const emptyTrashBtn = document.getElementById('empty-trash-btn');
const notebookTabsContainer = document.getElementById('notebook-tabs-container');
const addNotebookTabBtn = document.getElementById('add-notebook-tab-btn');
const addNotePanel = document.getElementById('add-note-panel');
const newNoteTitle = document.getElementById('new-note-title');
const newNoteText = document.getElementById('new-note-text');
const newNoteTags = document.getElementById('new-note-tags');
const templateSelect = document.getElementById('template-select');
const addNoteBtn = document.getElementById('add-note-btn');
const closeAddPanelBtn = document.getElementById('close-add-panel-btn');
const showAddPanelBtn = document.getElementById('show-add-panel-btn'); // FAB
const notesContainer = document.getElementById('notes-container');

// --- ToDo Module Specific (NEW) ---
const addTodoPanel = document.getElementById('add-todo-panel');
const newTodoInput = document.getElementById('new-todo-input');
const newTodoPriority = document.getElementById('new-todo-priority');
const newTodoDueDate = document.getElementById('new-todo-duedate');
const addTodoBtn = document.getElementById('add-todo-btn'); // Button inside todo panel
const todoListContainer = document.getElementById('todo-list-container');
const todoSortSelect = document.getElementById('todo-sort-select');

// --- Modals (Keep existing references) ---
// Template Modal
const templateModal = document.getElementById('template-modal');
const closeTemplateModalBtn = document.getElementById('close-template-modal-btn');
const templateListContainer = document.getElementById('template-list-container');
const templateListSection = document.getElementById('template-list-section');
const showAddTemplatePanelBtn = document.getElementById('show-add-template-panel-btn');
const templateEditPanel = document.getElementById('template-edit-panel');
const templateEditTitle = document.getElementById('template-edit-title');
const templateEditId = document.getElementById('template-edit-id');
const templateEditName = document.getElementById('template-edit-name');
const templateEditTitleInput = document.getElementById('template-edit-title-input');
const templateEditText = document.getElementById('template-edit-text');
const templateEditTags = document.getElementById('template-edit-tags');
const saveTemplateBtn = document.getElementById('save-template-btn');
const cancelEditTemplateBtn = document.getElementById('cancel-edit-template-btn');
// Notebook Modal
const notebookModal = document.getElementById('notebook-modal');
const closeNotebookModalBtn = document.getElementById('close-notebook-modal-btn');
const notebookListContainer = document.getElementById('notebook-list-container');
const notebookListSection = document.getElementById('notebook-list-section');
const showAddNotebookPanelBtn = document.getElementById('show-add-notebook-panel-btn');
const notebookEditPanel = document.getElementById('notebook-edit-panel');
const notebookEditTitle = document.getElementById('notebook-edit-title');
const notebookEditId = document.getElementById('notebook-edit-id');
const notebookEditName = document.getElementById('notebook-edit-name');
const saveNotebookBtn = document.getElementById('save-notebook-btn');
const cancelEditNotebookBtn = document.getElementById('cancel-edit-notebook-btn');
// Settings Modal
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
const themeOptionsContainer = settingsModal?.querySelector('.theme-options');
const accentColorOptionsContainer = settingsModal?.querySelector('.accent-color-options');
const fontFamilySelect = document.getElementById('font-family-select');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeValueSpan = document.getElementById('font-size-value');
const resetFontSizeBtn = document.getElementById('reset-font-size-btn');


// =====================================================================
//  Utility Functions (Keep existing)
// =====================================================================
const parseTags = (tagString) => { if (!tagString) return []; return tagString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== ''); };
const debounce = (func, delay) => { let timeoutId; return function(...args) { clearTimeout(timeoutId); timeoutId = setTimeout(() => { func.apply(this, args); }, delay); }; };
const escapeRegExp = (string) => { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const formatTimestamp = (timestamp) => { if (!timestamp) return ''; return new Date(timestamp).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }); }
const escapeHTML = (str) => { if (!str) return ''; const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return str.replace(/[&<>"']/g, m => map[m]); }

// =====================================================================
//  Theme & Appearance Management (Adjust button references)
// =====================================================================
const getStoredPreference = (key, defaultValue) => { return localStorage.getItem(key) ?? defaultValue; };
const applyAllAppearanceSettings = () => { const savedTheme = getStoredPreference(THEME_NAME_KEY, DEFAULT_THEME); applyTheme(VALID_THEMES.includes(savedTheme) ? savedTheme : DEFAULT_THEME); const savedAccentColor = getStoredPreference(ACCENT_COLOR_KEY, DEFAULT_ACCENT_COLOR); applyAccentColor(savedAccentColor); const savedFontFamily = getStoredPreference(FONT_FAMILY_KEY, DEFAULT_FONT_FAMILY); applyFontFamily(savedFontFamily); const savedFontSizeScale = parseFloat(getStoredPreference(FONT_SIZE_SCALE_KEY, DEFAULT_FONT_SIZE_SCALE.toString())); applyFontSize(isNaN(savedFontSizeScale) ? DEFAULT_FONT_SIZE_SCALE : savedFontSizeScale); };
const applyTheme = (themeName) => {
    if (!VALID_THEMES.includes(themeName)) {
        console.warn(`Invalid theme name "${themeName}". Falling back to default.`);
        themeName = DEFAULT_THEME;
    }
    // Remove existing theme classes from body
    VALID_THEMES.forEach(theme => bodyElement.classList.remove(`theme-${theme}`));
    bodyElement.classList.remove('dark-mode', 'light-mode');

    // Add new theme class (unless it's the default light theme)
    if (themeName !== 'light') {
        bodyElement.classList.add(`theme-${themeName}`);
    }

    // Add dark-mode/light-mode class for general styling
    const isDark = DARK_THEME_NAMES.includes(themeName);
    bodyElement.classList.add(isDark ? 'dark-mode' : 'light-mode');

    // Update the theme toggle button text in the sidebar
    if (sidebarThemeToggleBtn && themeToggleText) {
        if (isDark) {
            themeToggleText.textContent = 'Chế độ Sáng'; // Text to switch TO light
            sidebarThemeToggleBtn.title = 'Chuyển sang chế độ Sáng';
        } else {
            themeToggleText.textContent = 'Chế độ Tối'; // Text to switch TO dark
            sidebarThemeToggleBtn.title = 'Chuyển sang chế độ Tối';
        }
    }

    updateThemeSelectionUI(themeName);
    // Re-apply accent color as default might change based on theme
    const currentAccent = getStoredPreference(ACCENT_COLOR_KEY, DEFAULT_ACCENT_COLOR);
    applyAccentColor(currentAccent);
};
const updateThemeSelectionUI = (selectedTheme) => { if (!themeOptionsContainer) return; themeOptionsContainer.querySelectorAll('.theme-option-btn').forEach(btn => { const isActive = btn.dataset.theme === selectedTheme; btn.classList.toggle('active', isActive); btn.setAttribute('aria-checked', isActive ? 'true' : 'false'); }); };
const applyAccentColor = (colorValue) => { const lightDefaultAccent = '#007bff'; const darkDefaultAccent = '#0d6efd'; const currentTheme = getStoredPreference(THEME_NAME_KEY, DEFAULT_THEME); const isDarkThemeActive = DARK_THEME_NAMES.includes(currentTheme); const actualDefaultColor = isDarkThemeActive ? darkDefaultAccent : lightDefaultAccent; const actualColor = (colorValue === DEFAULT_ACCENT_COLOR || !colorValue?.startsWith('#')) ? actualDefaultColor : colorValue; document.documentElement.style.setProperty('--primary-color', actualColor); // Define RGB version for focus/active states
    const rgb = actualColor.match(/\w\w/g)?.map(x => parseInt(x, 16));
    if (rgb && rgb.length === 3) {
        document.documentElement.style.setProperty('--rgb-primary-color', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);
    } else {
         // Fallback for default colors or invalid hex
         const defaultRgb = isDarkThemeActive ? '13, 110, 253' : '0, 123, 255';
         document.documentElement.style.setProperty('--rgb-primary-color', defaultRgb);
    }
    updateAccentColorSelectionUI(colorValue);
};
const updateAccentColorSelectionUI = (selectedColorValue) => { if (!accentColorOptionsContainer) return; accentColorOptionsContainer.querySelectorAll('.accent-swatch').forEach(swatch => { const isSelected = swatch.dataset.color === selectedColorValue; swatch.classList.toggle('selected', isSelected); swatch.setAttribute('aria-checked', isSelected ? 'true' : 'false'); if(swatch.dataset.color === 'default'){ const lightDefaultAccent = '#007bff'; const darkDefaultAccent = '#0d6efd'; const currentTheme = getStoredPreference(THEME_NAME_KEY, DEFAULT_THEME); const isDarkThemeActive = DARK_THEME_NAMES.includes(currentTheme); swatch.style.backgroundColor = isDarkThemeActive ? darkDefaultAccent : lightDefaultAccent; swatch.style.borderColor = isDarkThemeActive ? darkDefaultAccent : lightDefaultAccent; swatch.style.color = '#fff'; swatch.innerHTML = ''; } }); };
const applyFontFamily = (fontFamilyString) => { document.documentElement.style.setProperty('--content-font-family', fontFamilyString); updateFontFamilySelectionUI(fontFamilyString); };
const updateFontFamilySelectionUI = (selectedFontFamily) => { if (fontFamilySelect) { fontFamilySelect.value = selectedFontFamily; } };
const applyFontSize = (scale) => { const clampedScale = Math.max(0.8, Math.min(1.5, scale)); document.documentElement.style.setProperty('--font-size-scale', clampedScale); updateFontSizeUI(clampedScale); };
const updateFontSizeUI = (scale) => { if (fontSizeSlider) { fontSizeSlider.value = scale; } if (fontSizeValueSpan) { fontSizeValueSpan.textContent = `${Math.round(scale * 100)}%`; } };
const quickToggleTheme = () => { const currentTheme = getStoredPreference(THEME_NAME_KEY, DEFAULT_THEME); const lastCustomTheme = getStoredPreference(LAST_CUSTOM_THEME_KEY, null); let targetTheme; const isCurrentDark = DARK_THEME_NAMES.includes(currentTheme); if (isCurrentDark) { targetTheme = 'light'; // Always toggle between light/dark for simplicity now
        // Optional: Restore last non-dark theme if needed
        // if (lastCustomTheme && !DARK_THEME_NAMES.includes(lastCustomTheme)) {
        //     targetTheme = lastCustomTheme;
        // } else {
        //     targetTheme = 'light';
        // }
    } else { targetTheme = 'dark'; } applyTheme(targetTheme); localStorage.setItem(THEME_NAME_KEY, targetTheme); };

// =====================================================================
//  Module Switching Logic (NEW)
// =====================================================================
const setActiveModule = (moduleName) => {
    if (!moduleName || currentActiveModule === moduleName) return;

    console.log(`Switching to module: ${moduleName}`);
    currentActiveModule = moduleName;

    // 1. Update body attribute for CSS targeting
    bodyElement.dataset.activeModule = moduleName;

    // 2. Update sidebar link active state
    sidebarNav?.querySelectorAll('a').forEach(link => {
        link.classList.toggle('active', link.dataset.module === moduleName);
    });

    // 3. Show/Hide module content containers
    moduleContainer?.querySelectorAll('.module').forEach(moduleEl => {
        moduleEl.classList.toggle('active-module', moduleEl.id === `${moduleName}-module`);
    });

    // 4. Reset search input when switching modules
    if (searchInput) searchInput.value = '';

    // 5. Call display function for the newly active module
    switch (moduleName) {
        case 'notes':
            // Reset notes view state if needed
            isViewingArchived = false;
            isViewingTrash = false;
            currentNotebookId = DEFAULT_NOTEBOOK_ID;
            displayNotes(); // Display notes with default view
            break;
        case 'todo':
            displayTodos(); // Display todos
            break;
        // Add cases for other modules when implemented
        // case 'goals': displayGoals(); break;
        // case 'habits': displayHabits(); break;
        // case 'skills': displaySkills(); break;
        default:
            console.warn(`No display function defined for module: ${moduleName}`);
    }

     // 6. Hide add panels/edit states from other modules
     hideAddPanel(); // Hide note add panel if open
     // Add similar hide functions for other modules' panels/edit states
};

// =====================================================================
//  Notebook Data Management (Keep existing - Specific to Notes Module)
// =====================================================================
const saveNotebooks = () => { try { localStorage.setItem(NOTEBOOKS_STORAGE_KEY, JSON.stringify(notebooks)); } catch (e) { console.error("Lỗi lưu sổ tay vào localStorage:", e); alert("Đã xảy ra lỗi khi cố gắng lưu danh sách sổ tay."); } };
const loadNotebooks = () => { const storedNotebooks = localStorage.getItem(NOTEBOOKS_STORAGE_KEY); if (storedNotebooks) { try { notebooks = JSON.parse(storedNotebooks).map(nb => ({ id: nb.id || Date.now(), name: nb.name || `Sổ tay ${nb.id || Date.now()}` })); } catch (e) { console.error("Lỗi đọc dữ liệu sổ tay từ localStorage:", e); alert("Lỗi khi đọc dữ liệu Sổ tay đã lưu. Dữ liệu có thể bị lỗi."); notebooks = []; } } else { notebooks = []; } };
const addOrUpdateNotebook = () => { const name = notebookEditName.value.trim(); const id = notebookEditId.value ? parseInt(notebookEditId.value) : null; if (!name) { alert("Vui lòng nhập Tên Sổ tay!"); notebookEditName.focus(); return; } const existingNotebook = notebooks.find(nb => nb.name.toLowerCase() === name.toLowerCase() && nb.id !== id); if (existingNotebook) { alert(`Sổ tay với tên "${name}" đã tồn tại. Vui lòng chọn tên khác.`); notebookEditName.focus(); return; } if (id) { const index = notebooks.findIndex(nb => nb.id === id); if (index !== -1) { notebooks[index].name = name; } else { console.error("Không tìm thấy sổ tay để cập nhật với ID:", id); alert("Lỗi: Không tìm thấy sổ tay để cập nhật."); return; } } else { const newNotebook = { id: Date.now(), name: name }; notebooks.push(newNotebook); } saveNotebooks(); renderNotebookList(); renderNotebookTabs(); hideNotebookEditPanel(); };
const deleteNotebook = (id) => { const index = notebooks.findIndex(nb => nb.id === id); if (index !== -1) { const notebookName = notebooks[index].name; const notesInNotebook = notes.filter(note => note.notebookId === id && !note.deleted && !note.archived).length; let confirmMessage = `Bạn chắc chắn muốn xóa sổ tay "${escapeHTML(notebookName)}"?`; if (notesInNotebook > 0) { confirmMessage += `\n\nCẢNH BÁO: Có ${notesInNotebook} ghi chú trong sổ tay này. Việc xóa sổ tay sẽ chuyển các ghi chú này về "Tất cả Ghi chú" (không thuộc sổ tay nào).`; } if (confirm(confirmMessage)) { notebooks.splice(index, 1); saveNotebooks(); let notesUpdated = false; notes.forEach(note => { if (note.notebookId === id) { note.notebookId = null; notesUpdated = true; } }); if (notesUpdated) { saveNotes(); } renderNotebookList(); renderNotebookTabs(); if (currentNotebookId === id) { currentNotebookId = DEFAULT_NOTEBOOK_ID; if (currentActiveModule === 'notes') displayNotes(); // Only update if notes module is active } if (!notebookEditPanel.classList.contains('hidden') && parseInt(notebookEditId.value) === id) { hideNotebookEditPanel(); } } } else { console.error("Không tìm thấy sổ tay để xóa với ID:", id); alert("Lỗi: Không tìm thấy sổ tay để xóa."); } };

// =====================================================================
//  Note Data Management (Keep existing - Specific to Notes Module)
// =====================================================================
const saveNotes = () => { try { const notesToSave = notes.map(note => ({ id: note.id, title: note.title || '', text: note.text || '', tags: note.tags || [], pinned: note.pinned || false, lastModified: note.lastModified || note.id, archived: note.archived || false, color: note.color || null, deleted: note.deleted || false, deletedTimestamp: note.deletedTimestamp || null, notebookId: note.notebookId || null })); localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesToSave)); } catch (e) { console.error("Lỗi lưu ghi chú vào localStorage:", e); if (e.name === 'QuotaExceededError') { alert("Lỗi: Dung lượng lưu trữ cục bộ đã đầy. Không thể lưu ghi chú."); } else { alert("Đã xảy ra lỗi khi cố gắng lưu ghi chú."); } } };
const loadNotes = () => { const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY); if (storedNotes) { try { notes = JSON.parse(storedNotes).map(note => ({ id: note.id, title: note.title || '', text: note.text || '', tags: note.tags || [], pinned: note.pinned || false, lastModified: note.lastModified || note.id, archived: note.archived || false, color: note.color || null, deleted: note.deleted || false, deletedTimestamp: note.deletedTimestamp || null, notebookId: note.notebookId || null })); } catch (e) { console.error("Lỗi đọc dữ liệu ghi chú từ localStorage:", e); alert("Lỗi khi đọc dữ liệu ghi chú đã lưu. Dữ liệu có thể bị lỗi. Sử dụng dữ liệu mặc định."); notes = []; } } else { const oldStoredNotes = localStorage.getItem('startNotesData'); if (oldStoredNotes) { console.log("Đang chuyển đổi dữ liệu ghi chú cũ..."); try { notes = JSON.parse(oldStoredNotes).map(note => ({ id: note.id, title: note.title || '', text: note.text || '', tags: note.tags || [], pinned: note.pinned || false, lastModified: note.lastModified || note.id, archived: note.archived || false, color: note.color || null, deleted: note.deleted || false, deletedTimestamp: note.deletedTimestamp || null, notebookId: null })); saveNotes(); localStorage.removeItem('startNotesData'); console.log("Chuyển đổi dữ liệu cũ thành công."); } catch(e) { console.error("Lỗi chuyển đổi dữ liệu ghi chú cũ:", e); notes = []; } } else { notes = []; } } };
const addNote = () => { // This function is triggered by the note add panel
    const noteTitle = newNoteTitle.value.trim();
    const noteText = newNoteText.value;
    const tagString = newNoteTags.value;

    if (!noteText.trim() && !noteTitle) {
         alert("Vui lòng nhập Tiêu đề hoặc Nội dung cho ghi chú!");
         newNoteText.focus();
         return;
    }

    const tags = parseTags(tagString);
    const now = Date.now();
    // Assign to current notebook ONLY if we are in the notes module and not in archive/trash/all
    const assignedNotebookId = (currentActiveModule === 'notes' && currentNotebookId !== 'all' && !isViewingArchived && !isViewingTrash)
                               ? parseInt(currentNotebookId)
                               : null;

    const newNote = {
        id: now,
        title: noteTitle,
        text: noteText,
        tags: tags,
        pinned: false,
        lastModified: now,
        archived: false,
        color: null,
        deleted: false,
        deletedTimestamp: null,
        notebookId: assignedNotebookId
    };

    notes.unshift(newNote);
    saveNotes();

    // If we were viewing archive/trash, switch back to normal notes view
    if (isViewingArchived || isViewingTrash) {
        isViewingArchived = false;
        isViewingTrash = false;
        if (searchInput) searchInput.value = '';
        // Ensure notes module is active if it wasn't
        setActiveModule('notes');
    } else if (currentActiveModule === 'notes') {
        // Only re-render notes if the notes module is active
        renderNotebookTabs(); // Update counts potentially
        displayNotes(searchInput?.value || '');
    }
    hideAddPanel();
};


// =====================================================================
//  Template Data Management (Keep existing - Specific to Notes Module)
// =====================================================================
const saveTemplates = () => { try { localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates)); } catch (e) { console.error("Lỗi lưu mẫu vào localStorage:", e); alert("Đã xảy ra lỗi khi cố gắng lưu các mẫu ghi chú."); } };
const loadTemplates = () => { const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY); if (storedTemplates) { try { templates = JSON.parse(storedTemplates).map(t => ({ id: t.id || Date.now(), name: t.name || `Mẫu ${t.id || Date.now()}`, title: t.title || '', text: t.text || '', tags: Array.isArray(t.tags) ? t.tags.map(String).filter(tag => tag.trim() !== '') : [], })); } catch (e) { console.error("Lỗi đọc dữ liệu mẫu từ localStorage:", e); alert("Lỗi khi đọc dữ liệu Mẫu đã lưu. Dữ liệu có thể bị lỗi."); templates = []; } } else { templates = []; } };
const addOrUpdateTemplate = () => { const name = templateEditName.value.trim(); const title = templateEditTitleInput.value.trim(); const text = templateEditText.value; const tags = parseTags(templateEditTags.value); const id = templateEditId.value ? parseInt(templateEditId.value) : null; if (!name) { alert("Vui lòng nhập Tên Mẫu!"); templateEditName.focus(); return; } if (id) { const index = templates.findIndex(t => t.id === id); if (index !== -1) { templates[index] = { ...templates[index], name, title, text, tags }; } else { console.error("Không tìm thấy mẫu để cập nhật với ID:", id); alert("Lỗi: Không tìm thấy mẫu để cập nhật."); return; } } else { const newTemplate = { id: Date.now(), name, title, text, tags }; templates.push(newTemplate); } saveTemplates(); renderTemplateList(); populateTemplateDropdown(); hideTemplateEditPanel(); };
const deleteTemplate = (id) => { const index = templates.findIndex(t => t.id === id); if (index !== -1) { const templateName = templates[index].name; if (confirm(`Bạn chắc chắn muốn xóa mẫu "${escapeHTML(templateName)}"?`)) { templates.splice(index, 1); saveTemplates(); renderTemplateList(); populateTemplateDropdown(); if (!templateEditPanel.classList.contains('hidden') && parseInt(templateEditId.value) === id) { hideTemplateEditPanel(); } } } else { console.error("Không tìm thấy mẫu để xóa với ID:", id); alert("Lỗi: Không tìm thấy mẫu để xóa."); } };

// =====================================================================
//  ToDo Data Management (NEW)
// =====================================================================
const saveTodos = () => {
    try {
        localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
        console.error("Lỗi lưu công việc vào localStorage:", e);
        if (e.name === 'QuotaExceededError') {
            alert("Lỗi: Dung lượng lưu trữ cục bộ đã đầy. Không thể lưu công việc.");
        } else {
            alert("Đã xảy ra lỗi khi cố gắng lưu công việc.");
        }
    }
};

const loadTodos = () => {
    const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
    if (storedTodos) {
        try {
            // Basic validation for loaded todos
            todos = JSON.parse(storedTodos).map(todo => ({
                id: todo.id || Date.now(),
                content: todo.content || '',
                completed: todo.completed || false,
                priority: ['high', 'medium', 'low'].includes(todo.priority) ? todo.priority : 'medium',
                dueDate: todo.dueDate || null, // Store as YYYY-MM-DD string or null
                createdAt: todo.createdAt || todo.id,
                lastModified: todo.lastModified || todo.createdAt || todo.id
            })).filter(todo => todo.content.trim() !== ''); // Filter out empty todos
        } catch (e) {
            console.error("Lỗi đọc dữ liệu công việc từ localStorage:", e);
            alert("Lỗi khi đọc dữ liệu Công việc đã lưu. Dữ liệu có thể bị lỗi.");
            todos = [];
        }
    } else {
        todos = [];
    }
};

const addTodo = () => {
    const content = newTodoInput.value.trim();
    const priority = newTodoPriority.value;
    const dueDate = newTodoDueDate.value || null; // Get YYYY-MM-DD or null

    if (!content) {
        alert("Vui lòng nhập nội dung công việc!");
        newTodoInput.focus();
        return;
    }

    const now = Date.now();
    const newTodo = {
        id: now,
        content: content,
        completed: false,
        priority: priority,
        dueDate: dueDate,
        createdAt: now,
        lastModified: now
    };

    todos.unshift(newTodo); // Add to the beginning
    saveTodos();
    displayTodos(); // Re-render the todo list

    // Clear input fields
    newTodoInput.value = '';
    newTodoPriority.value = 'medium'; // Reset priority
    newTodoDueDate.value = ''; // Clear date
    newTodoInput.focus();
};

const toggleTodoComplete = (todoId) => {
    const todoIndex = todos.findIndex(todo => todo.id === todoId);
    if (todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        todos[todoIndex].lastModified = Date.now();
        saveTodos();
        displayTodos(); // Re-render to show visual change
    }
};

// Placeholder functions for future implementation
const editTodo = (todoId) => { console.log("Edit ToDo:", todoId); /* TODO */ };
const deleteTodo = (todoId) => {
     const todoIndex = todos.findIndex(todo => todo.id === todoId);
     if (todoIndex !== -1) {
        const todoContent = todos[todoIndex].content;
        if (confirm(`Bạn chắc chắn muốn xóa công việc "${escapeHTML(todoContent)}"?`)) {
            todos.splice(todoIndex, 1);
            saveTodos();
            displayTodos();
        }
     }
};
const sortTodos = (criteria) => {
    console.log("Sorting Todos by:", criteria);
    // TODO: Implement sorting logic based on criteria ('priority', 'dueDate', 'createdAt', 'default')
    // Remember to handle priorities (high > medium > low) and dates correctly.
    // 'default' might be reverse createdAt or a mix.
    displayTodos(); // Re-render after sorting
};


// =====================================================================
//  Helper Functions & Event Handlers (Keep existing, adjust context)
// =====================================================================
const hideTagSuggestions = () => { /* Keep as is */ const suggestionBox = document.getElementById(SUGGESTION_BOX_ID); if (suggestionBox) { suggestionBox.remove(); } if(activeTagInputElement) { activeTagInputElement.removeAttribute('aria-activedescendant'); activeTagInputElement.removeAttribute('aria-controls'); } activeTagInputElement = null; document.removeEventListener('mousedown', handleClickOutsideSuggestions); };
const handleClickOutsideSuggestions = (event) => { /* Keep as is */ const suggestionBox = document.getElementById(SUGGESTION_BOX_ID); if (suggestionBox && !suggestionBox.contains(event.target) && activeTagInputElement && !activeTagInputElement.contains(event.target)) { hideTagSuggestions(); } };
const handleNotePin = (noteId, noteIndex) => { /* Keep as is - Note specific */ if (notes[noteIndex]) { notes[noteIndex].pinned = !notes[noteIndex].pinned; notes[noteIndex].lastModified = Date.now(); saveNotes(); displayNotes(searchInput.value); } };
const handleNoteDelete = (noteId, noteIndex) => { /* Keep as is - Note specific */ if (notes[noteIndex]) { if (confirm('Bạn chắc chắn muốn chuyển ghi chú này vào thùng rác?')) { notes[noteIndex].deleted = true; notes[noteIndex].deletedTimestamp = Date.now(); notes[noteIndex].pinned = false; notes[noteIndex].archived = false; saveNotes(); displayNotes(searchInput.value); } } };
const handleNoteRestore = (noteId, noteIndex) => { /* Keep as is - Note specific */ if (notes[noteIndex]) { notes[noteIndex].deleted = false; notes[noteIndex].deletedTimestamp = null; notes[noteIndex].lastModified = Date.now(); saveNotes(); displayNotes(searchInput.value); } };
const handleNoteDeletePermanent = (noteId, noteIndex) => { /* Keep as is - Note specific */ if (notes[noteIndex]) { const noteTitle = notes[noteIndex].title || 'Ghi chú không tiêu đề'; if (confirm(`Bạn chắc chắn muốn xóa vĩnh viễn "${escapeHTML(noteTitle)}"? Hành động này không thể hoàn tác.`)) { notes.splice(noteIndex, 1); saveNotes(); displayNotes(searchInput.value); } } };
const handleEmptyTrash = () => { /* Keep as is - Note specific */ const trashNotesCount = notes.filter(note => note.deleted).length; if (trashNotesCount === 0) { alert("Thùng rác đang trống."); return; } if (confirm(`Bạn chắc chắn muốn xóa vĩnh viễn ${trashNotesCount} ghi chú trong thùng rác? Hành động này không thể hoàn tác.`)) { notes = notes.filter(note => !note.deleted); saveNotes(); displayNotes(searchInput.value); } };
const handleNoteArchive = (noteId, noteIndex) => { /* Keep as is - Note specific */ if (notes[noteIndex]) { notes[noteIndex].archived = true; notes[noteIndex].pinned = false; notes[noteIndex].lastModified = Date.now(); saveNotes(); displayNotes(searchInput.value); } };
const handleNoteUnarchive = (noteId, noteIndex) => { /* Keep as is - Note specific */ if (notes[noteIndex]) { notes[noteIndex].archived = false; notes[noteIndex].lastModified = Date.now(); saveNotes(); displayNotes(searchInput.value); } };
const updateNoteData = (noteIndex, newData) => { /* Keep as is - Note specific */
    if (noteIndex < 0 || noteIndex >= notes.length) return false;
    const note = notes[noteIndex];
    if (!note) return false;
    const { title, text, tags, color, notebookId } = newData; // Include notebookId
    let changed = false;

    const cleanTitle = title?.trim() ?? '';
    const cleanText = text ?? '';
    const cleanColor = (color === '' || color === null || color === 'null' || color === 'default') ? null : color;
    const cleanTags = Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(t => t) : [];
    const cleanNotebookId = (notebookId === 'none' || notebookId === null || typeof notebookId === 'undefined')
                           ? null
                           : parseInt(notebookId);

    if (note.title !== cleanTitle) { note.title = cleanTitle; changed = true; }
    if (note.text !== cleanText) { note.text = cleanText; changed = true; }
    if (note.color !== cleanColor) { note.color = cleanColor; changed = true; }
    // Check if notebookId actually changed (only if provided in newData)
    if (newData.hasOwnProperty('notebookId') && note.notebookId !== cleanNotebookId) {
        note.notebookId = cleanNotebookId; changed = true;
    }

    const currentTags = note.tags || [];
    const tagsChanged = !(currentTags.length === cleanTags.length && currentTags.slice().sort().every((value, index) => value === cleanTags.slice().sort()[index]));
    if (tagsChanged) { note.tags = cleanTags; changed = true; }

    if (changed) {
        note.lastModified = Date.now();
        saveNotes();
        return true;
    }
    return false;
};
const debouncedAutoSave = debounce((noteElement, noteIndex) => { /* Keep as is - Note specific */ const editTitleInputCheck = noteElement.querySelector('input.edit-title-input'); const editInputCheck = noteElement.querySelector('textarea.edit-input'); const editTagsInputCheck = noteElement.querySelector('input.edit-tags-input'); if (!editTitleInputCheck || !editInputCheck || !editTagsInputCheck || !noteElement.isConnected) { return; } const newTitle = editTitleInputCheck.value; const newText = editInputCheck.value; const newTagString = editTagsInputCheck.value; const newTags = parseTags(newTagString); const selectedColorValue = noteElement.dataset.selectedColor ?? notes[noteIndex]?.color; const newColor = selectedColorValue; const wasPreviouslyEmpty = !notes[noteIndex]?.title?.trim() && !notes[noteIndex]?.text?.trim(); const isNowEmpty = !newTitle.trim() && !newText.trim(); if (!wasPreviouslyEmpty && isNowEmpty) { return; } const saved = updateNoteData(noteIndex, { title: newTitle, text: newText, tags: newTags, color: newColor }); if (saved) { noteElement.classList.add('note-autosaved'); setTimeout(() => { noteElement?.classList.remove('note-autosaved'); }, 600); } }, DEBOUNCE_DELAY);
const handleNoteEdit = (noteElement, noteId, noteIndex) => { /* Keep as is - Note specific */ if (isViewingArchived || isViewingTrash) return; const currentlyEditing = notesContainer.querySelector('.note .edit-input'); if (currentlyEditing && currentlyEditing.closest('.note') !== noteElement) { alert("Vui lòng Lưu hoặc Hủy thay đổi ở ghi chú đang sửa trước khi sửa ghi chú khác."); currentlyEditing.closest('.note').querySelector('textarea.edit-input')?.focus(); return; } hideTagSuggestions(); if (sortableInstance) sortableInstance.option('disabled', true); showAddPanelBtn?.classList.add('hidden'); const noteData = notes[noteIndex]; if (!noteData) return; const actionsElementOriginal = noteElement.querySelector('.note-actions'); let originalActionsHTML = ''; if (actionsElementOriginal) { originalActionsHTML = Array.from(actionsElementOriginal.children).filter(btn => !btn.classList.contains('save-edit-btn')).map(btn => btn.outerHTML).join(''); } const editTitleInput = document.createElement('input'); editTitleInput.type = 'text'; editTitleInput.classList.add('edit-title-input'); editTitleInput.placeholder = 'Tiêu đề...'; editTitleInput.value = noteData.title || ''; const editInput = document.createElement('textarea'); editInput.classList.add('edit-input'); editInput.value = noteData.text; editInput.rows = 5; const editTagsInput = document.createElement('input'); editTagsInput.type = 'text'; editTagsInput.classList.add('edit-tags-input'); editTagsInput.placeholder = 'Tags (cách nhau bằng dấu phẩy)...'; editTagsInput.value = (noteData.tags || []).join(', '); editTagsInput.autocomplete = 'off'; const colorSelectorContainer = document.createElement('div'); colorSelectorContainer.classList.add('color-selector-container'); colorSelectorContainer.setAttribute('role', 'radiogroup'); colorSelectorContainer.setAttribute('aria-label', 'Chọn màu ghi chú'); noteElement.dataset.selectedColor = noteData.color || ''; NOTE_COLORS.forEach(color => { const swatchBtn = document.createElement('button'); swatchBtn.type = 'button'; swatchBtn.classList.add('color-swatch-btn'); swatchBtn.dataset.colorValue = color.value || ''; swatchBtn.title = color.name; swatchBtn.setAttribute('role', 'radio'); const isCurrentColor = (noteData.color === color.value) || (!noteData.color && !color.value); swatchBtn.setAttribute('aria-checked', isCurrentColor ? 'true' : 'false'); if (isCurrentColor) swatchBtn.classList.add('selected'); if (color.value) { swatchBtn.style.backgroundColor = color.hex; } else { swatchBtn.classList.add('default-color-swatch'); swatchBtn.innerHTML = '&#x2715;'; swatchBtn.setAttribute('aria-label', 'Màu mặc định'); } swatchBtn.addEventListener('click', () => { const selectedValue = swatchBtn.dataset.colorValue; noteElement.dataset.selectedColor = selectedValue; colorSelectorContainer.querySelectorAll('.color-swatch-btn').forEach(btn => { const isSelected = btn === swatchBtn; btn.classList.toggle('selected', isSelected); btn.setAttribute('aria-checked', isSelected ? 'true' : 'false'); }); applyNoteColor(noteElement, { ...noteData, color: selectedValue }); debouncedAutoSave(noteElement, noteIndex); }); colorSelectorContainer.appendChild(swatchBtn); }); const saveBtn = document.createElement('button'); saveBtn.classList.add('save-edit-btn', 'modal-button', 'primary'); saveBtn.textContent = 'Lưu'; saveBtn.title = 'Lưu thay đổi (Ctrl+S)'; const bookmarkIcon = noteElement.querySelector('.pinned-bookmark-icon'); noteElement.innerHTML = ''; if (bookmarkIcon) { noteElement.appendChild(bookmarkIcon); bookmarkIcon.style.display = 'inline-block'; } noteElement.appendChild(editTitleInput); noteElement.appendChild(editInput); noteElement.appendChild(editTagsInput); noteElement.appendChild(colorSelectorContainer); const editActionsContainer = document.createElement('div'); editActionsContainer.classList.add('note-actions'); editActionsContainer.innerHTML = originalActionsHTML; editActionsContainer.appendChild(saveBtn); noteElement.appendChild(editActionsContainer); const triggerAutoSave = () => debouncedAutoSave(noteElement, noteIndex); editTitleInput.addEventListener('input', triggerAutoSave); editInput.addEventListener('input', triggerAutoSave); editTagsInput.addEventListener('input', (event) => { handleTagInput(event); triggerAutoSave(); }); editTagsInput.addEventListener('blur', handleTagInputBlur, true); editTagsInput.addEventListener('keydown', handleTagInputKeydown); editTitleInput.focus(); editTitleInput.setSelectionRange(editTitleInput.value.length, editTitleInput.value.length); };
const handleNoteSaveEdit = (noteElement, noteId, noteIndex) => { /* Keep as is - Note specific */ const editTitleInput = noteElement.querySelector('input.edit-title-input'); const editInput = noteElement.querySelector('textarea.edit-input'); const editTagsInput = noteElement.querySelector('input.edit-tags-input'); if (!editTitleInput || !editInput || !editTagsInput) { console.error("Lỗi lưu: Không tìm thấy các thành phần sửa ghi chú."); displayNotes(searchInput.value); return; } const newTitle = editTitleInput.value; const newText = editInput.value; const newTagString = editTagsInput.value; const newTags = parseTags(newTagString); const selectedColorValue = noteElement.dataset.selectedColor ?? notes[noteIndex]?.color; const newColor = selectedColorValue; const wasInitiallyEmpty = !notes[noteIndex]?.title?.trim() && !notes[noteIndex]?.text?.trim(); const isNowEmpty = !newTitle.trim() && !newText.trim(); if (!wasInitiallyEmpty && isNowEmpty) { if (!confirm("Ghi chú gần như trống. Bạn vẫn muốn lưu?")) { return; } } updateNoteData(noteIndex, { title: newTitle, text: newText, tags: newTags, color: newColor }); const updatedNoteData = notes[noteIndex]; const bookmarkIcon = noteElement.querySelector('.pinned-bookmark-icon'); noteElement.innerHTML = ''; if (bookmarkIcon) noteElement.appendChild(bookmarkIcon); applyNoteColor(noteElement, updatedNoteData); applyPinnedStatus(noteElement, updatedNoteData, isViewingArchived, isViewingTrash); const titleEl = createNoteTitleElement(updatedNoteData, searchInput.value); if(titleEl) noteElement.appendChild(titleEl); const contentEl = createNoteContentElement(updatedNoteData, searchInput.value, noteElement); if(contentEl) noteElement.appendChild(contentEl); const tagsEl = createNoteTagsElement(updatedNoteData); if(tagsEl) noteElement.appendChild(tagsEl); const timestampEl = createNoteTimestampElement(updatedNoteData); if(timestampEl) noteElement.appendChild(timestampEl); const actionsEl = createNoteActionsElement(updatedNoteData); if(actionsEl) noteElement.appendChild(actionsEl); delete noteElement.dataset.selectedColor; hideTagSuggestions(); if (sortableInstance) sortableInstance.option('disabled', false); if (addNotePanel?.classList.contains('hidden')) showAddPanelBtn?.classList.remove('hidden'); noteElement.classList.add('note-saved-flash'); setTimeout(() => { noteElement?.classList.remove('note-saved-flash'); }, 600); };
const showFullNoteModal = (title, noteText) => { /* Keep as is - Note specific */ const existingModal = document.querySelector('.note-modal'); if (existingModal) { existingModal.remove(); } const modal = document.createElement('div'); modal.classList.add('note-modal', 'modal', 'hidden'); modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'note-modal-title'); const modalContent = document.createElement('div'); modalContent.classList.add('modal-content'); const modalHeader = document.createElement('div'); modalHeader.classList.add('modal-header'); const modalTitle = document.createElement('h2'); modalTitle.id = 'note-modal-title'; modalTitle.textContent = title || 'Ghi chú'; const closeModalBtn = document.createElement('button'); closeModalBtn.classList.add('close-modal-btn'); closeModalBtn.innerHTML = '&times;'; closeModalBtn.title = 'Đóng (Esc)'; closeModalBtn.setAttribute('aria-label', 'Đóng cửa sổ xem ghi chú'); modalHeader.appendChild(modalTitle); modalHeader.appendChild(closeModalBtn); const modalBody = document.createElement('div'); modalBody.classList.add('modal-body'); modalBody.textContent = noteText || ''; modalContent.appendChild(modalHeader); modalContent.appendChild(modalBody); modal.appendChild(modalContent); document.body.appendChild(modal); requestAnimationFrame(() => { modal.classList.add('visible'); modal.classList.remove('hidden'); }); closeModalBtn.focus(); const closeFunc = () => { modal.classList.remove('visible'); modal.addEventListener('transitionend', () => { modal.remove(); document.removeEventListener('keydown', handleThisModalKeyDown); }, { once: true }); }; const handleThisModalKeyDown = (event) => { if (!modal.classList.contains('visible')) { document.removeEventListener('keydown', handleThisModalKeyDown); return; } if (event.key === 'Escape') { closeFunc(); } if (event.key === 'Tab') { const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'); if (focusableElements.length === 0) return; const firstElement = focusableElements[0]; const lastElement = focusableElements[focusableElements.length - 1]; if (event.shiftKey) { if (document.activeElement === firstElement) { lastElement.focus(); event.preventDefault(); } } else { if (document.activeElement === lastElement) { firstElement.focus(); event.preventDefault(); } } } }; closeModalBtn.addEventListener('click', closeFunc); modal.addEventListener('click', (event) => { if (event.target === modal) closeFunc(); }); document.addEventListener('keydown', handleThisModalKeyDown); };

// =====================================================================
//  Note Element Rendering Helper Functions (Keep existing - Note specific)
// =====================================================================
function applyNoteColor(noteElement, note) { NOTE_COLORS.forEach(color => { if (color.value) noteElement.classList.remove(color.value); }); const noteColor = note?.color; if (noteColor && NOTE_COLORS.some(c => c.value === noteColor)) { noteElement.classList.add(noteColor); } const colorData = NOTE_COLORS.find(c => c.value === noteColor); noteElement.style.borderLeftColor = colorData?.hex && colorData.value ? colorData.hex : 'transparent'; noteElement.style.borderColor = ''; }
function applyPinnedStatus(noteElement, note, isViewingArchived, isViewingTrash) { const isPinned = note?.pinned ?? false; const shouldShowPin = isPinned && !isViewingArchived && !isViewingTrash && currentNotebookId === 'all'; const existingBookmark = noteElement.querySelector('.pinned-bookmark-icon'); noteElement.classList.toggle('pinned-note', shouldShowPin); if (shouldShowPin) { if (!existingBookmark) { const bookmarkIcon = document.createElement('span'); bookmarkIcon.classList.add('pinned-bookmark-icon'); bookmarkIcon.innerHTML = '&#128278;'; bookmarkIcon.setAttribute('aria-hidden', 'true'); noteElement.insertBefore(bookmarkIcon, noteElement.firstChild); } else { existingBookmark.style.display = 'inline-block'; } } else { if (existingBookmark) { existingBookmark.style.display = 'none'; } } }
function createNoteTitleElement(note, filter) { const title = note?.title?.trim(); if (!title) return null; const titleElement = document.createElement('h3'); titleElement.classList.add('note-title'); let titleHTML = escapeHTML(title); const lowerCaseFilter = (filter || '').toLowerCase().trim(); const isTagSearch = lowerCaseFilter.startsWith('#'); if (currentActiveModule === 'notes' && !isTagSearch && lowerCaseFilter) { try { const highlightRegex = new RegExp(`(${escapeRegExp(lowerCaseFilter)})`, 'gi'); titleHTML = titleHTML.replace(highlightRegex, '<mark>$1</mark>'); } catch(e) { console.warn("Lỗi highlight tiêu đề:", e); } } titleElement.innerHTML = titleHTML; return titleElement; }
function createNoteContentElement(note, filter, noteElementForOverflowCheck) { const textContent = note?.text ?? ''; const contentElement = document.createElement('div'); contentElement.classList.add('note-content'); let displayHTML = escapeHTML(textContent); const lowerCaseFilter = (filter || '').toLowerCase().trim(); const isTagSearchContent = lowerCaseFilter.startsWith('#'); if (currentActiveModule === 'notes' && !isTagSearchContent && lowerCaseFilter) { try { const highlightRegexContent = new RegExp(`(${escapeRegExp(lowerCaseFilter)})`, 'gi'); displayHTML = displayHTML.replace(highlightRegexContent, '<mark>$1</mark>'); } catch (e) { console.warn("Lỗi highlight nội dung:", e); } } displayHTML = displayHTML.replace(/\n/g, '<br>'); contentElement.innerHTML = displayHTML; requestAnimationFrame(() => { if (!noteElementForOverflowCheck || !noteElementForOverflowCheck.isConnected) return; const currentContentEl = noteElementForOverflowCheck.querySelector('.note-content'); if (!currentContentEl) return; const existingBtn = noteElementForOverflowCheck.querySelector('.read-more-btn'); if (existingBtn) existingBtn.remove(); const hasOverflow = currentContentEl.scrollHeight > currentContentEl.clientHeight + 2; currentContentEl.classList.toggle('has-overflow', hasOverflow); if (hasOverflow) { const readMoreBtn = document.createElement('button'); readMoreBtn.textContent = 'Xem thêm'; readMoreBtn.classList.add('read-more-btn'); readMoreBtn.type = 'button'; readMoreBtn.title = 'Xem toàn bộ nội dung ghi chú'; readMoreBtn.addEventListener('click', (e) => { e.stopPropagation(); showFullNoteModal(note.title, note.text); }); noteElementForOverflowCheck.insertBefore(readMoreBtn, currentContentEl.nextSibling); } }); return contentElement; }
function createNoteTagsElement(note) { const tags = note?.tags; if (!tags || tags.length === 0) return null; const tagsElement = document.createElement('div'); tagsElement.classList.add('note-tags'); tags.forEach(tag => { const tagBadge = document.createElement('button'); tagBadge.classList.add('tag-badge'); tagBadge.textContent = `#${tag}`; tagBadge.dataset.tag = tag; tagBadge.type = 'button'; tagBadge.title = `Lọc theo tag: ${tag}`; tagsElement.appendChild(tagBadge); }); return tagsElement; }
function createNoteTimestampElement(note) { const timestampElement = document.createElement('small'); timestampElement.classList.add('note-timestamp'); const creationDate = formatTimestamp(note.id); let timestampText = `Tạo: ${creationDate}`; if (note.lastModified && note.lastModified > note.id + 60000) { const modifiedDate = formatTimestamp(note.lastModified); timestampText += ` (Sửa: ${modifiedDate})`; } if (isViewingTrash && note.deletedTimestamp) { const deletedDate = formatTimestamp(note.deletedTimestamp); timestampText += ` (Xóa: ${deletedDate})`; } timestampElement.textContent = timestampText; return timestampElement; }
function createMainViewNoteActions(note) { /* Keep as is - Note specific */
    const fragment = document.createDocumentFragment();
    const moveBtn = document.createElement('button'); moveBtn.classList.add('move-note-btn'); moveBtn.innerHTML = '&#128194;'; moveBtn.title = 'Di chuyển đến Sổ tay'; moveBtn.setAttribute('aria-label', 'Di chuyển ghi chú'); fragment.appendChild(moveBtn);
    const pinBtn = document.createElement('button'); pinBtn.classList.add('pin-btn'); pinBtn.innerHTML = '&#128204;'; pinBtn.title = note.pinned ? "Bỏ ghim" : "Ghim ghi chú"; pinBtn.setAttribute('aria-label', note.pinned ? "Bỏ ghim ghi chú" : "Ghim ghi chú"); pinBtn.setAttribute('aria-pressed', note.pinned ? 'true' : 'false'); if (note.pinned) pinBtn.classList.add('pinned'); if(currentNotebookId !== 'all') pinBtn.style.display = 'none'; fragment.appendChild(pinBtn);
    const editBtn = document.createElement('button'); editBtn.classList.add('edit-btn'); editBtn.textContent = 'Sửa'; editBtn.title = 'Sửa ghi chú'; editBtn.setAttribute('aria-label', 'Sửa ghi chú'); fragment.appendChild(editBtn);
    const archiveBtn = document.createElement('button'); archiveBtn.classList.add('archive-btn'); archiveBtn.innerHTML = '&#128451;'; archiveBtn.title = 'Lưu trữ ghi chú'; archiveBtn.setAttribute('aria-label', 'Lưu trữ ghi chú'); fragment.appendChild(archiveBtn);
    const deleteBtn = document.createElement('button'); deleteBtn.classList.add('delete-btn'); deleteBtn.textContent = 'Xóa'; deleteBtn.title = 'Chuyển vào thùng rác'; deleteBtn.setAttribute('aria-label', 'Chuyển vào thùng rác'); fragment.appendChild(deleteBtn);
    return fragment;
}
function createArchiveViewNoteActions(note) { /* Keep as is - Note specific */ const fragment = document.createDocumentFragment(); const unarchiveBtn = document.createElement('button'); unarchiveBtn.classList.add('unarchive-btn'); unarchiveBtn.innerHTML = '&#x1F5C4;&#xFE0F;'; unarchiveBtn.title = 'Khôi phục từ Lưu trữ'; unarchiveBtn.setAttribute('aria-label', 'Khôi phục từ Lưu trữ'); fragment.appendChild(unarchiveBtn); const deleteBtn = document.createElement('button'); deleteBtn.classList.add('delete-btn'); deleteBtn.textContent = 'Xóa'; deleteBtn.title = 'Chuyển vào thùng rác'; deleteBtn.setAttribute('aria-label', 'Chuyển vào thùng rác'); fragment.appendChild(deleteBtn); return fragment; }
function createTrashViewNoteActions(note) { /* Keep as is - Note specific */ const fragment = document.createDocumentFragment(); const restoreBtn = document.createElement('button'); restoreBtn.classList.add('restore-btn'); restoreBtn.innerHTML = '&#x21A9;&#xFE0F;'; restoreBtn.title = 'Khôi phục ghi chú'; restoreBtn.setAttribute('aria-label', 'Khôi phục ghi chú'); fragment.appendChild(restoreBtn); const deletePermanentBtn = document.createElement('button'); deletePermanentBtn.classList.add('delete-permanent-btn'); deletePermanentBtn.textContent = 'Xóa VV'; deletePermanentBtn.title = 'Xóa ghi chú vĩnh viễn'; deletePermanentBtn.setAttribute('aria-label', 'Xóa ghi chú vĩnh viễn'); fragment.appendChild(deletePermanentBtn); return fragment; }
function createNoteActionsElement(note) { /* Keep as is - Note specific */ const actionsElement = document.createElement('div'); actionsElement.classList.add('note-actions'); let actionButtonsFragment; if (isViewingTrash) { actionButtonsFragment = createTrashViewNoteActions(note); } else if (isViewingArchived) { actionButtonsFragment = createArchiveViewNoteActions(note); } else { actionButtonsFragment = createMainViewNoteActions(note); } actionsElement.appendChild(actionButtonsFragment); return actionsElement; }

// =====================================================================
//  Core Note Rendering Function (Keep existing - Note specific)
// =====================================================================
const renderNoteElement = (note) => { const noteElement = document.createElement('div'); noteElement.classList.add('note'); noteElement.dataset.id = note.id; applyNoteColor(noteElement, note); applyPinnedStatus(noteElement, note, isViewingArchived, isViewingTrash); const titleEl = createNoteTitleElement(note, searchInput.value); if(titleEl) noteElement.appendChild(titleEl); const contentEl = createNoteContentElement(note, searchInput.value, noteElement); if(contentEl) noteElement.appendChild(contentEl); const tagsEl = createNoteTagsElement(note); if(tagsEl) noteElement.appendChild(tagsEl); const timestampEl = createNoteTimestampElement(note); if(timestampEl) noteElement.appendChild(timestampEl); const actionsEl = createNoteActionsElement(note); if(actionsEl) noteElement.appendChild(actionsEl); return noteElement; };

// =====================================================================
//  ToDo Element Rendering Function (NEW)
// =====================================================================
const renderTodoElement = (todo) => {
    const todoElement = document.createElement('div');
    todoElement.classList.add('todo-item');
    todoElement.dataset.id = todo.id;
    if (todo.completed) {
        todoElement.classList.add('completed');
    }

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.title = todo.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành';
    checkbox.addEventListener('change', () => toggleTodoComplete(todo.id));
    todoElement.appendChild(checkbox);

    // Details Wrapper (Content + Meta)
    const detailsWrapper = document.createElement('div');
    detailsWrapper.classList.add('todo-details');

    // Content
    const contentEl = document.createElement('span');
    contentEl.classList.add('todo-content');
    contentEl.textContent = todo.content;
    detailsWrapper.appendChild(contentEl);

    // Meta Wrapper (Priority + Due Date)
    const metaWrapper = document.createElement('div');
    metaWrapper.classList.add('todo-meta');

    // Priority Tag
    const priorityEl = document.createElement('span');
    priorityEl.classList.add('todo-priority');
    priorityEl.dataset.priority = todo.priority;
    priorityEl.textContent = todo.priority === 'high' ? 'Cao' : todo.priority === 'low' ? 'Thấp' : 'TB'; // Abbreviate Medium
    metaWrapper.appendChild(priorityEl);

    // Due Date (with warning)
    if (todo.dueDate) {
        const dueDateEl = document.createElement('span');
        dueDateEl.classList.add('todo-due-date');
        dueDateEl.textContent = `Hạn: ${formatTimestamp(new Date(todo.dueDate + 'T23:59:59'))}`; // Add time to ensure correct date comparison

        // Add due soon/overdue classes (logic needs refinement)
        const today = new Date(); today.setHours(0,0,0,0);
        const dueDate = new Date(todo.dueDate + 'T00:00:00'); // Compare start of day
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (!todo.completed) {
            if (daysDiff < 0) {
                dueDateEl.classList.add('overdue');
                dueDateEl.title = `Quá hạn ${Math.abs(daysDiff)} ngày`;
            } else if (daysDiff <= 7) { // Example: due within 7 days
                dueDateEl.classList.add('due-soon');
                 dueDateEl.title = `Còn ${daysDiff} ngày`;
            }
        }
        metaWrapper.appendChild(dueDateEl);
    }
    detailsWrapper.appendChild(metaWrapper);
    todoElement.appendChild(detailsWrapper);


    // Actions
    const actionsEl = document.createElement('div');
    actionsEl.classList.add('todo-actions');

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-todo-btn');
    editBtn.innerHTML = '✏️'; // Pencil icon
    editBtn.title = 'Sửa công việc';
    editBtn.addEventListener('click', (e) => { e.stopPropagation(); editTodo(todo.id); });
    actionsEl.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-todo-btn');
    deleteBtn.innerHTML = '🗑️'; // Trash icon
    deleteBtn.title = 'Xóa công việc';
    deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteTodo(todo.id); });
    actionsEl.appendChild(deleteBtn);

    todoElement.appendChild(actionsEl);

    return todoElement;
};


// =====================================================================
//  Drag & Drop (Keep existing - Note specific)
// =====================================================================
const handleDragEnd = (evt) => { if (currentActiveModule !== 'notes' || isViewingArchived || isViewingTrash) return; const newOrderIds = Array.from(notesContainer.children) .map(el => el.classList.contains('note') ? parseInt(el.dataset.id) : null) .filter(id => id !== null); const currentViewNotes = notes.filter(note => !note.deleted && !note.archived && (currentNotebookId === 'all' || note.notebookId === parseInt(currentNotebookId)) ); const currentViewNoteMap = new Map(currentViewNotes.map(note => [note.id, note])); const reorderedCurrentViewNotes = newOrderIds .map(id => currentViewNoteMap.get(id)) .filter(Boolean); const otherNotes = notes.filter(note => note.deleted || note.archived || (currentNotebookId !== 'all' && note.notebookId !== parseInt(currentNotebookId)) ); notes = [...reorderedCurrentViewNotes, ...otherNotes]; saveNotes(); };
const initSortable = () => { if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } const canInitSortable = typeof Sortable === 'function' && notesContainer && notesContainer.children.length > 0 && !notesContainer.querySelector('.empty-state') && currentActiveModule === 'notes' && !isViewingArchived && !isViewingTrash; if (canInitSortable) { sortableInstance = new Sortable(notesContainer, { animation: 150, handle: '.note', filter: 'input, textarea, button, .tag-badge, .note-content a, .read-more-btn, .color-swatch-btn', preventOnFilter: true, ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen', dragClass: 'sortable-drag', onEnd: handleDragEnd, delay: 50, delayOnTouchOnly: true }); } else if (typeof Sortable !== 'function' && currentActiveModule === 'notes' && !isViewingArchived && !isViewingTrash && notes.some(n => !n.archived && !n.deleted)) { console.warn("Thư viện Sortable.js chưa được tải."); } };


// =====================================================================
//  Tag Handling (Keep existing - Note specific)
// =====================================================================
const getAllUniqueTags = () => { const allTags = notes.reduce((acc, note) => { if (!note.deleted && !note.archived && note.tags && note.tags.length > 0) { const validTags = note.tags.map(t => t.trim()).filter(t => t); acc.push(...validTags); } return acc; }, []); return [...new Set(allTags)].sort((a, b) => a.localeCompare(b)); };
const showTagSuggestions = (inputElement, currentTagFragment, suggestions) => { hideTagSuggestions(); if (suggestions.length === 0 || !currentTagFragment) return; activeTagInputElement = inputElement; const suggestionBox = document.createElement('div'); suggestionBox.id = SUGGESTION_BOX_ID; suggestionBox.classList.add('tag-suggestions'); suggestionBox.setAttribute('role', 'listbox'); inputElement.setAttribute('aria-controls', SUGGESTION_BOX_ID); suggestions.forEach((tag, index) => { const item = document.createElement('div'); item.classList.add('suggestion-item'); item.textContent = tag; item.setAttribute('role', 'option'); item.id = `suggestion-${index}`; item.tabIndex = -1; item.addEventListener('mousedown', (e) => { e.preventDefault(); const currentValue = inputElement.value; const lastCommaIndex = currentValue.lastIndexOf(','); let baseValue = ''; if (lastCommaIndex !== -1) { baseValue = currentValue.substring(0, lastCommaIndex + 1).trimStart() + (currentValue[lastCommaIndex+1] === ' ' ? '' : ' '); } inputElement.value = baseValue + tag + ', '; hideTagSuggestions(); inputElement.focus(); inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length); inputElement.dispatchEvent(new Event('input', { bubbles: true })); }); suggestionBox.appendChild(item); }); const inputRect = inputElement.getBoundingClientRect(); document.body.appendChild(suggestionBox); suggestionBox.style.position = 'absolute'; suggestionBox.style.top = `${inputRect.bottom + window.scrollY}px`; suggestionBox.style.left = `${inputRect.left + window.scrollX}px`; suggestionBox.style.minWidth = `${inputRect.width}px`; suggestionBox.style.width = 'auto'; setTimeout(() => { document.addEventListener('mousedown', handleClickOutsideSuggestions); }, 0); };
const handleTagInput = (event) => { const inputElement = event.target; const value = inputElement.value; const cursorPosition = inputElement.selectionStart; const lastCommaIndexBeforeCursor = value.substring(0, cursorPosition).lastIndexOf(','); const currentTagFragment = value.substring(lastCommaIndexBeforeCursor + 1, cursorPosition).trim().toLowerCase(); if (currentTagFragment.length >= 1) { const allTags = getAllUniqueTags(); const precedingTagsString = value.substring(0, lastCommaIndexBeforeCursor + 1); const currentEnteredTags = parseTags(precedingTagsString); const filteredSuggestions = allTags.filter(tag => tag.toLowerCase().startsWith(currentTagFragment) && !currentEnteredTags.includes(tag) ); showTagSuggestions(inputElement, currentTagFragment, filteredSuggestions); } else { hideTagSuggestions(); } };
const handleTagInputBlur = (event) => { setTimeout(() => { const suggestionBox = document.getElementById(SUGGESTION_BOX_ID); if (event.relatedTarget && suggestionBox && suggestionBox.contains(event.relatedTarget)) { return; } hideTagSuggestions(); }, 150); };
const handleTagInputKeydown = (event) => { const suggestionBox = document.getElementById(SUGGESTION_BOX_ID); const inputElement = event.target; if (suggestionBox && suggestionBox.children.length > 0) { const items = Array.from(suggestionBox.children); let currentFocusIndex = items.findIndex(item => item === document.activeElement); switch (event.key) { case 'ArrowDown': event.preventDefault(); currentFocusIndex = (currentFocusIndex + 1) % items.length; items[currentFocusIndex].focus(); inputElement.setAttribute('aria-activedescendant', items[currentFocusIndex].id); break; case 'ArrowUp': event.preventDefault(); currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length; items[currentFocusIndex].focus(); inputElement.setAttribute('aria-activedescendant', items[currentFocusIndex].id); break; case 'Enter': if (document.activeElement?.classList.contains('suggestion-item')) { event.preventDefault(); document.activeElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); } else { hideTagSuggestions(); } break; case 'Escape': event.preventDefault(); hideTagSuggestions(); break; case 'Tab': if (document.activeElement?.classList.contains('suggestion-item')) { event.preventDefault(); document.activeElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); } else { hideTagSuggestions(); } break; } } };


// =====================================================================
//  Template UI Handlers (Keep existing - Note specific)
// =====================================================================
const renderTemplateList = () => { templateListContainer.innerHTML = ''; if (templates.length === 0) { templateListContainer.innerHTML = `<p class="empty-state">Chưa có mẫu nào.</p>`; return; } templates.sort((a, b) => a.name.localeCompare(b.name)).forEach(template => { const item = document.createElement('div'); item.classList.add('template-list-item'); item.innerHTML = `<span>${escapeHTML(template.name)}</span><div class="template-item-actions"><button class="edit-template-btn modal-button secondary small-button" data-id="${template.id}" title="Sửa mẫu ${escapeHTML(template.name)}">Sửa</button><button class="delete-template-btn modal-button danger small-button" data-id="${template.id}" title="Xóa mẫu ${escapeHTML(template.name)}">Xóa</button></div>`; item.querySelector('.edit-template-btn').addEventListener('click', () => showTemplateEditPanel(template.id)); item.querySelector('.delete-template-btn').addEventListener('click', () => deleteTemplate(template.id)); templateListContainer.appendChild(item); }); };
const showTemplateEditPanel = (templateId = null) => { templateListSection.classList.add('hidden'); templateEditPanel.classList.remove('hidden'); if (templateId !== null) { const template = templates.find(t => t.id === templateId); if (template) { templateEditTitle.textContent = "Sửa Mẫu"; templateEditId.value = template.id; templateEditName.value = template.name; templateEditTitleInput.value = template.title; templateEditText.value = template.text; templateEditTags.value = (template.tags || []).join(', '); } else { console.error("Không tìm thấy mẫu để sửa ID:", templateId); hideTemplateEditPanel(); return; } } else { templateEditTitle.textContent = "Tạo Mẫu Mới"; templateEditId.value = ''; templateEditName.value = ''; templateEditTitleInput.value = ''; templateEditText.value = ''; templateEditTags.value = ''; } templateEditName.focus(); };
const hideTemplateEditPanel = () => { templateEditPanel.classList.add('hidden'); templateListSection.classList.remove('hidden'); templateEditId.value = ''; templateEditName.value = ''; templateEditTitleInput.value = ''; templateEditText.value = ''; templateEditTags.value = ''; };
const showTemplateModal = () => { renderTemplateList(); hideTemplateEditPanel(); templateModal.classList.add('visible'); templateModal.classList.remove('hidden'); showAddTemplatePanelBtn.focus(); };
const hideTemplateModal = () => { templateModal.classList.remove('visible'); templateModal.addEventListener('transitionend', (e) => { if (e.target === templateModal) templateModal.classList.add('hidden'); }, { once: true }); };
const populateTemplateDropdown = () => { const currentSelection = templateSelect.value; templateSelect.innerHTML = '<option value="">-- Không dùng mẫu --</option>'; templates.sort((a, b) => a.name.localeCompare(b.name)).forEach(template => { const option = document.createElement('option'); option.value = template.id; option.textContent = escapeHTML(template.name); templateSelect.appendChild(option); }); if (templates.some(t => t.id === parseInt(currentSelection))) templateSelect.value = currentSelection; else templateSelect.value = ""; };
const applyTemplate = () => { const selectedId = templateSelect.value ? parseInt(templateSelect.value) : null; if (selectedId) { const template = templates.find(t => t.id === selectedId); if (template) { newNoteTitle.value = template.title; newNoteText.value = template.text; newNoteTags.value = (template.tags || []).join(', '); newNoteText.focus(); } } };


// =====================================================================
//  Notebook UI Handlers (Keep existing - Note specific)
// =====================================================================
const renderNotebookList = () => { notebookListContainer.innerHTML = ''; if (notebooks.length === 0) { notebookListContainer.innerHTML = `<p class="empty-state">Chưa có sổ tay nào.</p>`; return; } notebooks.sort((a, b) => a.name.localeCompare(b.name)).forEach(notebook => { const item = document.createElement('div'); item.classList.add('notebook-list-item'); item.innerHTML = ` <span>${escapeHTML(notebook.name)}</span> <div class="notebook-item-actions"> <button class="edit-notebook-btn modal-button secondary small-button" data-id="${notebook.id}" title="Sửa sổ tay ${escapeHTML(notebook.name)}">Sửa</button> <button class="delete-notebook-btn modal-button danger small-button" data-id="${notebook.id}" title="Xóa sổ tay ${escapeHTML(notebook.name)}">Xóa</button> </div> `; item.querySelector('.edit-notebook-btn').addEventListener('click', () => showNotebookEditPanel(notebook.id)); item.querySelector('.delete-notebook-btn').addEventListener('click', () => deleteNotebook(notebook.id)); notebookListContainer.appendChild(item); }); };
const showNotebookEditPanel = (notebookId = null) => { notebookListSection.classList.add('hidden'); notebookEditPanel.classList.remove('hidden'); if (notebookId !== null) { const notebook = notebooks.find(nb => nb.id === notebookId); if (notebook) { notebookEditTitle.textContent = "Sửa Sổ tay"; notebookEditId.value = notebook.id; notebookEditName.value = notebook.name; } else { console.error("Không tìm thấy sổ tay để sửa ID:", notebookId); hideNotebookEditPanel(); return; } } else { notebookEditTitle.textContent = "Tạo Sổ tay Mới"; notebookEditId.value = ''; notebookEditName.value = ''; } notebookEditName.focus(); };
const hideNotebookEditPanel = () => { notebookEditPanel.classList.add('hidden'); notebookListSection.classList.remove('hidden'); notebookEditId.value = ''; notebookEditName.value = ''; };
const showNotebookModal = () => { renderNotebookList(); hideNotebookEditPanel(); notebookModal.classList.add('visible'); notebookModal.classList.remove('hidden'); showAddNotebookPanelBtn.focus(); };
const hideNotebookModal = () => { notebookModal.classList.remove('visible'); notebookModal.addEventListener('transitionend', (e) => { if (e.target === notebookModal) notebookModal.classList.add('hidden'); }, { once: true }); };

// =====================================================================
//  Notebook Tab Rendering (Keep existing - Note specific)
// =====================================================================
const renderNotebookTabs = () => { if (!notebookTabsContainer || currentActiveModule !== 'notes') return; // Only render if notes module active
    const addButton = notebookTabsContainer.querySelector('#add-notebook-tab-btn');
    notebookTabsContainer.innerHTML = ''; // Clear existing tabs

    // "All Notes" Tab
    const allNotesTab = document.createElement('button');
    allNotesTab.classList.add('tab-button');
    allNotesTab.dataset.notebookId = 'all';
    allNotesTab.textContent = 'Tất cả Ghi chú';
    if (currentNotebookId === 'all' && !isViewingArchived && !isViewingTrash) {
        allNotesTab.classList.add('active');
    }
    notebookTabsContainer.appendChild(allNotesTab);

    // Individual Notebook Tabs
    notebooks.sort((a, b) => a.name.localeCompare(b.name)).forEach(notebook => {
        const tab = document.createElement('button');
        tab.classList.add('tab-button');
        tab.dataset.notebookId = notebook.id;
        tab.textContent = escapeHTML(notebook.name);
        // Only mark active if not viewing archive/trash
        if (currentNotebookId === notebook.id && !isViewingArchived && !isViewingTrash) {
            tab.classList.add('active');
        }
        notebookTabsContainer.appendChild(tab);
    });

    // Add "+" Button
    const finalAddButton = addButton || document.createElement('button');
    if (!addButton) { // If the button didn't exist before (e.g., first render)
        finalAddButton.id = 'add-notebook-tab-btn';
        finalAddButton.classList.add('add-tab-button');
        finalAddButton.title = 'Thêm Sổ tay mới';
        finalAddButton.textContent = '+';
        // Add listener only once
        finalAddButton.addEventListener('click', () => {
            showNotebookModal();
            showNotebookEditPanel(); // Directly show edit panel
        });
    }
    notebookTabsContainer.appendChild(finalAddButton);
};


// =====================================================================
//  Other Panel/Import/Export (Adjust context)
// =====================================================================
const showAddPanel = () => { // Specifically for Notes Add Panel
    if (currentActiveModule !== 'notes') return; // Don't show if not in notes module
    const currentlyEditing = notesContainer?.querySelector('.note .edit-input');
    if (currentlyEditing) { alert("Vui lòng Lưu hoặc Hủy thay đổi ở ghi chú đang sửa trước khi thêm ghi chú mới."); currentlyEditing.closest('.note').querySelector('textarea.edit-input')?.focus(); return; }
    hideTagSuggestions();
    addNotePanel?.classList.remove('hidden');
    showAddPanelBtn?.classList.add('hidden'); // Hide FAB
    templateSelect.value = "";
    newNoteTitle.focus();
};
const hideAddPanel = () => { // Specifically for Notes Add Panel
    hideTagSuggestions();
    addNotePanel?.classList.add('hidden');
    // Show FAB only if notes module is active and no note is being edited
    if (currentActiveModule === 'notes' && !notesContainer?.querySelector('.note .edit-input')) {
        showAddPanelBtn?.classList.remove('hidden');
    }
    // Clear note fields
    if(newNoteTitle) newNoteTitle.value = '';
    if(newNoteText) newNoteText.value = '';
    if(newNoteTags) newNoteTags.value = '';
    if(templateSelect) templateSelect.value = "";
};
const exportNotes = () => { // TODO: Modify to export ALL data (notes, todos, etc.)
    if (notes.length === 0 && templates.length === 0 && notebooks.length === 0 && todos.length === 0) {
        alert("Không có dữ liệu (ghi chú, mẫu, sổ tay, công việc) nào để xuất.");
        return;
    }
    try {
        const dataToExport = {
            notes: notes.map(note => ({ id: note.id, title: note.title || '', text: note.text || '', tags: note.tags || [], pinned: note.pinned || false, lastModified: note.lastModified || note.id, archived: note.archived || false, color: note.color || null, deleted: note.deleted || false, deletedTimestamp: note.deletedTimestamp || null, notebookId: note.notebookId || null })),
            templates: templates.map(template => ({ id: template.id, name: template.name, title: template.title || '', text: template.text || '', tags: template.tags || [] })),
            notebooks: notebooks.map(notebook => ({ id: notebook.id, name: notebook.name })),
            todos: todos.map(todo => ({ // Include todos
                 id: todo.id, content: todo.content, completed: todo.completed,
                 priority: todo.priority, dueDate: todo.dueDate,
                 createdAt: todo.createdAt, lastModified: todo.lastModified
            }))
            // Add other modules here when implemented (goals, habits, skills)
        };
        const jsonData = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
        a.download = `flexinote-backup-${timestamp}.json`; // Updated filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Lỗi xuất dữ liệu:", error);
        alert("Đã xảy ra lỗi khi xuất dữ liệu.");
    }
};
const importNotes = (file) => { // TODO: Modify to import ALL data
    if (!file) { alert("Vui lòng chọn một file JSON hợp lệ."); return; }
    if (!confirm("CẢNH BÁO:\nThao tác này sẽ THAY THẾ TOÀN BỘ dữ liệu hiện tại (ghi chú, mẫu, sổ tay, công việc,...) bằng nội dung từ file đã chọn.\nDữ liệu cũ sẽ bị mất.\n\nBạn chắc chắn muốn tiếp tục?")) { importFileInput.value = null; return; }
    const reader = new FileReader();
    reader.onload = (event) => {
        let importedNotesCount = 0;
        let importedTemplatesCount = 0;
        let importedNotebooksCount = 0;
        let importedTodosCount = 0; // NEW
        // Add counts for other modules

        try {
            const importedData = JSON.parse(event.target.result);
            if (typeof importedData !== 'object' || importedData === null) throw new Error("Dữ liệu trong file không phải là một đối tượng JSON.");

            let tempNotes = [];
            let tempTemplates = [];
            let tempNotebooks = [];
            let tempTodos = []; // NEW
            // Add temp arrays for other modules

            // Import Notebooks first (for validation)
            if (importedData.notebooks && Array.isArray(importedData.notebooks)) {
                tempNotebooks = importedData.notebooks.map((nb, index) => { if (typeof nb !== 'object' || nb === null) return null; const validId = typeof nb.id === 'number' ? nb.id : Date.now() + index + 2000; const validName = typeof nb.name === 'string' && nb.name.trim() ? nb.name.trim() : `Sổ tay import ${validId}`; return { id: validId, name: validName }; }).filter(Boolean);
                importedNotebooksCount = tempNotebooks.length;
            }
            const validNotebookIds = new Set(tempNotebooks.map(nb => nb.id));

            // Import Notes
            if (importedData.notes && Array.isArray(importedData.notes)) {
                tempNotes = importedData.notes.map((note, index) => { if (typeof note !== 'object' || note === null) return null; const validId = typeof note.id === 'number' ? note.id : Date.now() + index; const validLastModified = typeof note.lastModified === 'number' ? note.lastModified : validId; const validNotebookId = typeof note.notebookId === 'number' && validNotebookIds.has(note.notebookId) ? note.notebookId : null; return { id: validId, title: typeof note.title === 'string' ? note.title : '', text: typeof note.text === 'string' ? note.text : '', tags: Array.isArray(note.tags) ? note.tags.map(String).map(t => t.trim().toLowerCase()).filter(t => t) : [], pinned: typeof note.pinned === 'boolean' ? note.pinned : false, lastModified: validLastModified, archived: typeof note.archived === 'boolean' ? note.archived : false, color: typeof note.color === 'string' && NOTE_COLORS.some(c => c.value === note.color) ? note.color : null, deleted: typeof note.deleted === 'boolean' ? note.deleted : false, deletedTimestamp: typeof note.deletedTimestamp === 'number' ? note.deletedTimestamp : null, notebookId: validNotebookId }; }).filter(Boolean);
                importedNotesCount = tempNotes.length;
            }

            // Import Templates
            if (importedData.templates && Array.isArray(importedData.templates)) {
                tempTemplates = importedData.templates.map((template, index) => { if (typeof template !== 'object' || template === null) return null; const validId = typeof template.id === 'number' ? template.id : Date.now() + index + 1000; const validName = typeof template.name === 'string' && template.name.trim() ? template.name.trim() : `Mẫu import ${validId}`; return { id: validId, name: validName, title: typeof template.title === 'string' ? template.title : '', text: typeof template.text === 'string' ? template.text : '', tags: Array.isArray(template.tags) ? template.tags.map(String).map(t => t.trim().toLowerCase()).filter(t => t) : [] }; }).filter(Boolean);
                importedTemplatesCount = tempTemplates.length;
            }

            // Import ToDos (NEW)
            if (importedData.todos && Array.isArray(importedData.todos)) {
                tempTodos = importedData.todos.map((todo, index) => {
                    if (typeof todo !== 'object' || todo === null) return null;
                    const validId = typeof todo.id === 'number' ? todo.id : Date.now() + index + 3000;
                    const validCreatedAt = typeof todo.createdAt === 'number' ? todo.createdAt : validId;
                    const validLastModified = typeof todo.lastModified === 'number' ? todo.lastModified : validCreatedAt;
                    return {
                        id: validId,
                        content: typeof todo.content === 'string' ? todo.content : '',
                        completed: typeof todo.completed === 'boolean' ? todo.completed : false,
                        priority: ['high', 'medium', 'low'].includes(todo.priority) ? todo.priority : 'medium',
                        dueDate: typeof todo.dueDate === 'string' ? todo.dueDate : null, // Assuming YYYY-MM-DD string
                        createdAt: validCreatedAt,
                        lastModified: validLastModified
                    };
                }).filter(todo => todo.content.trim() !== '');
                importedTodosCount = tempTodos.length;
            }

            // TODO: Add import logic for Goals, Habits, Skills

            // Handle old format (array of notes only)
            if (importedNotesCount === 0 && importedTemplatesCount === 0 && importedNotebooksCount === 0 && importedTodosCount === 0 && Array.isArray(importedData)) {
                console.log("Attempting to import old format (array of notes)...");
                tempNotes = importedData.map((note, index) => { if (typeof note !== 'object' || note === null) return null; const validId = typeof note.id === 'number' ? note.id : Date.now() + index; const validLastModified = typeof note.lastModified === 'number' ? note.lastModified : validId; return { id: validId, title: typeof note.title === 'string' ? note.title : '', text: typeof note.text === 'string' ? note.text : '', tags: Array.isArray(note.tags) ? note.tags.map(String).map(t => t.trim().toLowerCase()).filter(t => t) : [], pinned: typeof note.pinned === 'boolean' ? note.pinned : false, lastModified: validLastModified, archived: typeof note.archived === 'boolean' ? note.archived : false, color: typeof note.color === 'string' && NOTE_COLORS.some(c => c.value === note.color) ? note.color : null, deleted: typeof note.deleted === 'boolean' ? note.deleted : false, deletedTimestamp: typeof note.deletedTimestamp === 'number' ? note.deletedTimestamp : null, notebookId: null }; }).filter(Boolean);
                tempTemplates = []; tempNotebooks = []; tempTodos = [];
                importedNotesCount = tempNotes.length;
                if (importedNotesCount === 0) throw new Error("File JSON là một mảng nhưng không chứa dữ liệu ghi chú hợp lệ.");
            } else if (importedNotesCount === 0 && importedTemplatesCount === 0 && importedNotebooksCount === 0 && importedTodosCount === 0 /* && other counts === 0 */) {
                throw new Error("File JSON không chứa key dữ liệu hợp lệ (notes, templates, notebooks, todos,...) hoặc không phải là mảng dữ liệu cũ.");
            }

            // Assign imported data
            notes = tempNotes;
            templates = tempTemplates;
            notebooks = tempNotebooks;
            todos = tempTodos;
            // Assign other modules data

            // Save all data
            saveNotes();
            saveTemplates();
            saveNotebooks();
            saveTodos();
            // Save other modules

            // Reset UI to default state (Notes module)
            setActiveModule(DEFAULT_MODULE); // Switch to default module view
            populateTemplateDropdown(); // Update dropdown

            alert(`Đã nhập thành công ${importedNotesCount} ghi chú, ${importedTemplatesCount} mẫu, ${importedNotebooksCount} sổ tay, và ${importedTodosCount} công việc!`); // Update message

        } catch (error) {
            console.error("Lỗi nhập file:", error);
            alert(`Lỗi nhập file: ${error.message}\n\nVui lòng kiểm tra xem file có đúng định dạng JSON và cấu trúc dữ liệu hợp lệ không.`);
        } finally {
            if(importFileInput) importFileInput.value = null; // Clear file input
        }
    };
    reader.onerror = (event) => {
        console.error("Lỗi đọc file:", event.target.error);
        alert("Không thể đọc được file đã chọn.");
        if(importFileInput) importFileInput.value = null;
    };
    reader.readAsText(file);
};


// =====================================================================
//  Note Filtering and Sorting Logic (Keep existing - Note specific)
// =====================================================================
const getFilteredNotes = (allNotes, filter) => { let viewFilteredNotes = allNotes.filter(note => { if (isViewingTrash) { return note.deleted; } else if (isViewingArchived) { return note.archived && !note.deleted; } else { return !note.deleted && !note.archived && (currentNotebookId === 'all' || note.notebookId === parseInt(currentNotebookId)); } }); if (filter) { const lowerCaseFilter = filter.toLowerCase().trim(); const isTagSearch = lowerCaseFilter.startsWith('#'); const tagSearchTerm = isTagSearch ? lowerCaseFilter.substring(1) : null; viewFilteredNotes = viewFilteredNotes.filter(note => { if (isTagSearch) { if (!tagSearchTerm) return true; return note.tags && note.tags.some(tag => tag.toLowerCase() === tagSearchTerm); } else { const noteTitleLower = (note.title || '').toLowerCase(); const noteTextLower = (note.text || '').toLowerCase(); const titleMatch = noteTitleLower.includes(lowerCaseFilter); const textMatch = noteTextLower.includes(lowerCaseFilter); const tagMatch = note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerCaseFilter)); return titleMatch || textMatch || tagMatch; } }); } return viewFilteredNotes; };
const sortNotes = (filteredNotes) => { if (isViewingTrash) { return filteredNotes.sort((a, b) => (b.deletedTimestamp || b.lastModified) - (a.deletedTimestamp || a.lastModified)); } else if (isViewingArchived) { return filteredNotes.sort((a, b) => (b.lastModified || b.id) - (a.lastModified || a.id)); } else { return filteredNotes.sort((a, b) => { if (currentNotebookId === 'all' && a.pinned !== b.pinned) { return b.pinned - a.pinned; } return (b.lastModified || b.id) - (a.lastModified || a.id); }); } };

// =====================================================================
//  ToDo Filtering and Sorting Logic (NEW - Basic Placeholder)
// =====================================================================
const getFilteredTodos = (allTodos, filter) => {
    // Basic filter by content for now
    let filtered = allTodos; // Start with all non-deleted/archived todos (if applicable later)
    if (filter) {
        const lowerCaseFilter = filter.toLowerCase().trim();
        filtered = filtered.filter(todo =>
            (todo.content || '').toLowerCase().includes(lowerCaseFilter)
        );
    }
    return filtered;
};

const sortTodosLogic = (filteredTodos, criteria = 'default') => {
    // Basic sorting implementation
    const priorityMap = { high: 3, medium: 2, low: 1 };
    return filteredTodos.sort((a, b) => {
        switch (criteria) {
            case 'priority':
                // Sort by priority (desc), then by creation date (desc)
                const priorityDiff = (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
                return priorityDiff !== 0 ? priorityDiff : (b.createdAt || 0) - (a.createdAt || 0);
            case 'dueDate':
                // Sort by due date (asc, nulls last), then by priority (desc)
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                const dateDiff = dateA - dateB;
                if (dateDiff !== 0) return dateDiff;
                return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
            case 'createdAt':
                // Sort by creation date (desc)
                return (b.createdAt || 0) - (a.createdAt || 0);
            case 'default':
            default:
                 // Default: Incomplete first, then by priority (desc), then creation (desc)
                 const completedDiff = a.completed - b.completed;
                 if (completedDiff !== 0) return completedDiff;
                 const priorityDiffDefault = (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
                 return priorityDiffDefault !== 0 ? priorityDiffDefault : (b.createdAt || 0) - (a.createdAt || 0);
        }
    });
};


// =====================================================================
//  Core Display Functions (Updated for Modules)
// =====================================================================
const displayNotes = (filter = '') => {
    if (currentActiveModule !== 'notes' || !notesContainer) return; // Only run if notes module is active

    hideTagSuggestions();
    const scrollY = window.scrollY; // Preserve scroll position
    notesContainer.innerHTML = ''; // Clear current notes

    // Filter and sort notes based on current view (all, notebook, archive, trash)
    const filteredNotes = getFilteredNotes(notes, filter.toLowerCase().trim());
    const notesToDisplay = sortNotes(filteredNotes);

    // Update UI elements specific to Notes view (archive/trash buttons, indicators)
    viewArchiveBtn?.classList.toggle('viewing-archive', isViewingArchived);
    viewTrashBtn?.classList.toggle('viewing-trash', isViewingTrash);
    viewArchiveBtn.textContent = isViewingArchived ? 'Xem Ghi chú' : 'Xem Lưu trữ';
    viewTrashBtn.textContent = isViewingTrash ? 'Xem Ghi chú' : 'Xem Thùng rác';
    archiveStatusIndicator?.classList.toggle('hidden', !isViewingArchived);
    trashStatusIndicator?.classList.toggle('hidden', !isViewingTrash);
    emptyTrashBtn?.classList.toggle('hidden', !(isViewingTrash && notesToDisplay.length > 0));

    renderNotebookTabs(); // Re-render tabs to reflect active state/counts

    if (notesToDisplay.length === 0) {
        let emptyMessage = '';
        if (isViewingTrash) { emptyMessage = filter ? 'Không tìm thấy ghi chú rác nào khớp.' : 'Thùng rác trống.'; }
        else if (isViewingArchived) { emptyMessage = filter ? 'Không tìm thấy ghi chú lưu trữ nào khớp.' : 'Lưu trữ trống.'; }
        else if (currentNotebookId === 'all') { emptyMessage = filter ? 'Không tìm thấy ghi chú nào khớp.' : 'Chưa có ghi chú nào. Nhấn "+" để thêm.'; }
        else { const currentNotebook = notebooks.find(nb => nb.id === parseInt(currentNotebookId)); const notebookName = currentNotebook ? escapeHTML(currentNotebook.name) : 'sổ tay này'; emptyMessage = filter ? `Không tìm thấy ghi chú nào khớp trong ${notebookName}.` : `Sổ tay "${notebookName}" trống. Nhấn "+" để thêm.`; }
        notesContainer.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
        if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; }
    } else {
        notesToDisplay.forEach(note => {
            const noteElement = renderNoteElement(note);
            notesContainer.appendChild(noteElement);
        });
        initSortable(); // Initialize or re-initialize drag and drop
    }

    window.scrollTo({ top: scrollY, behavior: 'instant' }); // Restore scroll position
};

const displayTodos = (filter = '') => {
    if (currentActiveModule !== 'todo' || !todoListContainer) return; // Only run if todo module is active

    const scrollY = window.scrollY;
    todoListContainer.innerHTML = ''; // Clear current todos

    const sortCriteria = todoSortSelect?.value || 'default';
    const filtered = getFilteredTodos(todos, filter.toLowerCase().trim());
    const todosToDisplay = sortTodosLogic(filtered, sortCriteria);

    if (todosToDisplay.length === 0) {
        const emptyMessage = filter ? 'Không tìm thấy công việc nào khớp.' : 'Chưa có công việc nào. Thêm công việc ở trên.';
        todoListContainer.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    } else {
        todosToDisplay.forEach(todo => {
            const todoElement = renderTodoElement(todo);
            todoListContainer.appendChild(todoElement);
        });
    }

    window.scrollTo({ top: scrollY, behavior: 'instant' });
};


// =====================================================================
//  Modal Handling Functions (Adjust button references)
// =====================================================================
const showSettingsModal = () => { const currentTheme = getStoredPreference(THEME_NAME_KEY, DEFAULT_THEME); const currentAccent = getStoredPreference(ACCENT_COLOR_KEY, DEFAULT_ACCENT_COLOR); const currentFont = getStoredPreference(FONT_FAMILY_KEY, DEFAULT_FONT_FAMILY); const currentSizeScale = parseFloat(getStoredPreference(FONT_SIZE_SCALE_KEY, DEFAULT_FONT_SIZE_SCALE.toString())); updateThemeSelectionUI(currentTheme); updateAccentColorSelectionUI(currentAccent); updateFontFamilySelectionUI(currentFont); updateFontSizeUI(isNaN(currentSizeScale) ? DEFAULT_FONT_SIZE_SCALE : currentSizeScale); settingsModal.classList.add('visible'); settingsModal.classList.remove('hidden'); closeSettingsModalBtn.focus(); };
const hideSettingsModal = () => { settingsModal.classList.remove('visible'); settingsModal.addEventListener('transitionend', (e) => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); }, { once: true }); };

// --- Move Note Menu Functions (Keep as is - Note specific) ---
const closeMoveNoteMenu = () => { if (activeMoveMenu) { activeMoveMenu.remove(); activeMoveMenu = null; document.removeEventListener('click', handleOutsideMoveMenuClick, true); } };
const handleOutsideMoveMenuClick = (event) => { if (activeMoveMenu && !activeMoveMenu.contains(event.target) && !event.target.closest('.move-note-btn')) { closeMoveNoteMenu(); } };
const handleMoveNote = (noteId, targetNotebookId) => { const noteIndex = notes.findIndex(note => note.id === noteId); if (noteIndex !== -1) { const newNotebookId = targetNotebookId === 'none' ? null : parseInt(targetNotebookId); if (notes[noteIndex].notebookId !== newNotebookId) { notes[noteIndex].notebookId = newNotebookId; notes[noteIndex].lastModified = Date.now(); saveNotes(); displayNotes(searchInput.value); } } else { console.error("Không tìm thấy ghi chú để di chuyển:", noteId); } closeMoveNoteMenu(); };
const showMoveNoteMenu = (noteId, moveBtnElement) => { closeMoveNoteMenu(); const note = notes.find(n => n.id === noteId); if (!note) return; const menu = document.createElement('div'); menu.id = MOVE_NOTE_MENU_ID; menu.classList.add('move-note-menu'); const noNotebookBtn = document.createElement('button'); noNotebookBtn.textContent = '-- Không thuộc sổ tay nào --'; noNotebookBtn.dataset.targetNotebookId = 'none'; if (note.notebookId === null) { noNotebookBtn.classList.add('current-notebook'); noNotebookBtn.disabled = true; } noNotebookBtn.addEventListener('click', () => handleMoveNote(noteId, 'none')); menu.appendChild(noNotebookBtn); if (notebooks.length > 0) { menu.appendChild(document.createElement('hr')); } notebooks.sort((a, b) => a.name.localeCompare(b.name)).forEach(notebook => { const notebookBtn = document.createElement('button'); notebookBtn.textContent = escapeHTML(notebook.name); notebookBtn.dataset.targetNotebookId = notebook.id; if (note.notebookId === notebook.id) { notebookBtn.classList.add('current-notebook'); notebookBtn.disabled = true; } notebookBtn.addEventListener('click', () => handleMoveNote(noteId, notebook.id)); menu.appendChild(notebookBtn); }); document.body.appendChild(menu); activeMoveMenu = menu; const btnRect = moveBtnElement.getBoundingClientRect(); menu.style.position = 'absolute'; requestAnimationFrame(() => { const finalMenuHeight = menu.offsetHeight; const spaceAbove = btnRect.top; const spaceBelow = window.innerHeight - btnRect.bottom; if (spaceBelow >= finalMenuHeight + 10 || spaceBelow >= spaceAbove) { menu.style.top = `${btnRect.bottom + window.scrollY + 5}px`; } else { menu.style.top = `${btnRect.top + window.scrollY - finalMenuHeight - 5}px`; } menu.style.left = `${btnRect.left + window.scrollX}px`; if (btnRect.left + menu.offsetWidth > window.innerWidth - 10) { menu.style.left = `${window.innerWidth - menu.offsetWidth - 10 + window.scrollX}px`; } }); setTimeout(() => { document.addEventListener('click', handleOutsideMoveMenuClick, true); }, 0); };


// =====================================================================
//  Event Listener Setup Functions (UPDATED)
// =====================================================================
const setupThemeAndAppearanceListeners = () => {
    // Use sidebar buttons now
    sidebarThemeToggleBtn?.addEventListener('click', quickToggleTheme);
    sidebarSettingsBtn?.addEventListener('click', showSettingsModal);

    // Settings Modal listeners (remain the same)
    closeSettingsModalBtn?.addEventListener('click', hideSettingsModal);
    settingsModal?.addEventListener('click', (event) => { if (event.target === settingsModal) hideSettingsModal(); });
    themeOptionsContainer?.addEventListener('click', (event) => { const targetButton = event.target.closest('.theme-option-btn'); if (targetButton?.dataset.theme) { const selectedTheme = targetButton.dataset.theme; if (VALID_THEMES.includes(selectedTheme)) { applyTheme(selectedTheme); localStorage.setItem(THEME_NAME_KEY, selectedTheme); if (selectedTheme !== 'light' && selectedTheme !== 'dark') { localStorage.setItem(LAST_CUSTOM_THEME_KEY, selectedTheme); } } else { console.warn(`Attempted to apply invalid theme: ${selectedTheme}`); } } });
    accentColorOptionsContainer?.addEventListener('click', (event) => { const targetSwatch = event.target.closest('.accent-swatch'); if (targetSwatch?.dataset.color) { const selectedColor = targetSwatch.dataset.color; applyAccentColor(selectedColor); localStorage.setItem(ACCENT_COLOR_KEY, selectedColor); } });
    fontFamilySelect?.addEventListener('change', (event) => { const selectedFont = event.target.value; applyFontFamily(selectedFont); localStorage.setItem(FONT_FAMILY_KEY, selectedFont); });
    const debouncedSaveFontSize = debounce((scale) => { localStorage.setItem(FONT_SIZE_SCALE_KEY, scale.toString()); }, 500);
    fontSizeSlider?.addEventListener('input', (event) => { const scale = parseFloat(event.target.value); if (!isNaN(scale)) { applyFontSize(scale); debouncedSaveFontSize(scale); } });
    resetFontSizeBtn?.addEventListener('click', () => { const defaultScale = DEFAULT_FONT_SIZE_SCALE; applyFontSize(defaultScale); localStorage.setItem(FONT_SIZE_SCALE_KEY, defaultScale.toString()); if (fontSizeSlider) fontSizeSlider.value = defaultScale; });
};

const setupAddNotePanelListeners = () => { // Note specific
    addNoteBtn?.addEventListener('click', addNote);
    showAddPanelBtn?.addEventListener('click', showAddPanel); // FAB button
    closeAddPanelBtn?.addEventListener('click', hideAddPanel);
    newNoteTitle?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (newNoteText.value.trim() === '' && newNoteTitle.value.trim() !== '') { addNoteBtn.click(); } else { newNoteText.focus(); } } });
    templateSelect?.addEventListener('change', applyTemplate); // Moved from template listeners
};

const setupHeaderActionListeners = () => { // Global / Note specific actions in header
    exportNotesBtn?.addEventListener('click', exportNotes); // Now exports all data
    importNotesBtn?.addEventListener('click', () => importFileInput.click());
    importFileInput?.addEventListener('change', (e) => { if(e.target.files && e.target.files[0]) { importNotes(e.target.files[0]); } e.target.value = null; });

    // Note specific view buttons
    viewArchiveBtn?.addEventListener('click', () => {
        if (currentActiveModule !== 'notes' || isViewingArchived) { // If already viewing or not in notes, switch to normal notes
             setActiveModule('notes'); // This will reset isViewingArchived/Trash
        } else {
             isViewingArchived = true;
             isViewingTrash = false;
             currentNotebookId = 'archive'; // Special ID for archive view
             if(searchInput) searchInput.value = '';
             displayNotes();
        }
    });
    viewTrashBtn?.addEventListener('click', () => {
         if (currentActiveModule !== 'notes' || isViewingTrash) { // If already viewing or not in notes, switch to normal notes
             setActiveModule('notes'); // This will reset isViewingArchived/Trash
        } else {
            isViewingTrash = true;
            isViewingArchived = false;
            currentNotebookId = 'trash'; // Special ID for trash view
            if(searchInput) searchInput.value = '';
            displayNotes();
        }
    });
    emptyTrashBtn?.addEventListener('click', handleEmptyTrash);
};

const setupSearchListener = () => {
    const debouncedSearch = debounce((filterVal) => {
        // Call the appropriate display function based on the active module
        switch (currentActiveModule) {
            case 'notes':
                displayNotes(filterVal);
                break;
            case 'todo':
                displayTodos(filterVal);
                break;
            // Add cases for other modules
            default:
                console.log(`Search not implemented for module: ${currentActiveModule}`);
        }
    }, 300);
    searchInput?.addEventListener('input', (e) => debouncedSearch(e.target.value));
};

const setupNoteActionListeners = () => { // Note specific actions on note cards
    notesContainer?.addEventListener('click', (event) => {
        if (currentActiveModule !== 'notes') return; // Only handle clicks if notes module is active

        const target = event.target;
        const noteElement = target.closest('.note');
        if (!noteElement) return;

        const noteId = parseInt(noteElement.dataset.id);
        const noteIndex = notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) { console.error("Không tìm thấy data cho note ID:", noteId); return; }

        const tagButton = target.closest('.tag-badge');
        if (tagButton?.dataset.tag) { event.preventDefault(); event.stopPropagation(); searchInput.value = `#${tagButton.dataset.tag}`; searchInput.dispatchEvent(new Event('input', { bubbles: true })); searchInput.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

        const readMoreButton = target.closest('.read-more-btn');
        if (readMoreButton) { event.stopPropagation(); const note = notes[noteIndex]; if (note) showFullNoteModal(note.title, note.text); return; }

        const isEditingThisNote = noteElement.querySelector('textarea.edit-input');
        if (isEditingThisNote) {
             if (target.closest('.save-edit-btn')) { handleNoteSaveEdit(noteElement, noteId, noteIndex); }
             else if (target.closest('.pin-btn') && currentNotebookId === 'all') { handleNotePin(noteId, noteIndex); const pinBtn = target.closest('.pin-btn'); if (pinBtn) { const isPinned = notes[noteIndex].pinned; pinBtn.title = isPinned ? "Bỏ ghim" : "Ghim ghi chú"; pinBtn.setAttribute('aria-label', isPinned ? "Bỏ ghim ghi chú" : "Ghim ghi chú"); pinBtn.setAttribute('aria-pressed', isPinned ? 'true' : 'false'); pinBtn.classList.toggle('pinned', isPinned); } }
             return; // Prevent other actions while editing
        }

        const moveButton = target.closest('.move-note-btn');
        if (moveButton && !isViewingArchived && !isViewingTrash) { event.stopPropagation(); showMoveNoteMenu(noteId, moveButton); return; }

        if (target.closest('.pin-btn') && !isViewingArchived && !isViewingTrash && currentNotebookId === 'all') handleNotePin(noteId, noteIndex);
        else if (target.closest('.delete-btn')) handleNoteDelete(noteId, noteIndex);
        else if (target.closest('.archive-btn') && !isViewingTrash && !isViewingArchived) handleNoteArchive(noteId, noteIndex);
        else if (target.closest('.unarchive-btn') && isViewingArchived) handleNoteUnarchive(noteId, noteIndex);
        else if (target.closest('.restore-btn') && isViewingTrash) handleNoteRestore(noteId, noteIndex);
        else if (target.closest('.delete-permanent-btn') && isViewingTrash) handleNoteDeletePermanent(noteId, noteIndex);
        else if (target.closest('.edit-btn') && !isViewingArchived && !isViewingTrash) handleNoteEdit(noteElement, noteId, noteIndex);
    });
};

const setupTemplateModalListeners = () => { // Note specific
    manageTemplatesBtn?.addEventListener('click', showTemplateModal); // Button is now in main header
    closeTemplateModalBtn?.addEventListener('click', hideTemplateModal);
    templateModal?.addEventListener('click', (event) => { if (event.target === templateModal && templateEditPanel.classList.contains('hidden')) { hideTemplateModal(); } });
    showAddTemplatePanelBtn?.addEventListener('click', () => showTemplateEditPanel());
    cancelEditTemplateBtn?.addEventListener('click', hideTemplateEditPanel);
    saveTemplateBtn?.addEventListener('click', addOrUpdateTemplate);
    // templateSelect listener moved to setupAddNotePanelListeners
};

const setupNotebookListeners = () => { // Note specific
    manageNotebooksBtn?.addEventListener('click', showNotebookModal); // Button is now in main header
    closeNotebookModalBtn?.addEventListener('click', hideNotebookModal);
    notebookModal?.addEventListener('click', (event) => { if (event.target === notebookModal && notebookEditPanel.classList.contains('hidden')) { hideNotebookModal(); } });
    showAddNotebookPanelBtn?.addEventListener('click', () => showNotebookEditPanel());
    cancelEditNotebookBtn?.addEventListener('click', hideNotebookEditPanel);
    saveNotebookBtn?.addEventListener('click', addOrUpdateNotebook);

    // Notebook Tab switching
    notebookTabsContainer?.addEventListener('click', (event) => {
        if (currentActiveModule !== 'notes') return; // Only handle if notes module is active
        const target = event.target;
        if (target.matches('.tab-button') && target.dataset.notebookId) {
            const selectedNotebookId = target.dataset.notebookId === 'all' ? 'all' : parseInt(target.dataset.notebookId);
            // Only switch if ID changed OR if switching away from archive/trash
            if (selectedNotebookId !== currentNotebookId || isViewingArchived || isViewingTrash) {
                currentNotebookId = selectedNotebookId;
                isViewingArchived = false; // Switching tab resets archive/trash view
                isViewingTrash = false;
                if(searchInput) searchInput.value = '';
                displayNotes(); // Re-render notes for the selected notebook
            }
        } else if (target.matches('#add-notebook-tab-btn')) {
            // Listener for add button is now attached directly in renderNotebookTabs
        }
    });
};

const setupTagInputListeners = () => { // Note specific
    newNoteTags?.addEventListener('input', handleTagInput);
    newNoteTags?.addEventListener('blur', handleTagInputBlur, true);
    newNoteTags?.addEventListener('keydown', handleTagInputKeydown);
    notesContainer?.addEventListener('input', (e) => { if (e.target.matches('.edit-tags-input')) handleTagInput(e); });
    notesContainer?.addEventListener('blur', (e) => { if (e.target.matches('.edit-tags-input')) handleTagInputBlur(e); }, true);
    notesContainer?.addEventListener('keydown', (e) => { if (e.target.matches('.edit-tags-input')) handleTagInputKeydown(e); });
};

const setupTodoListeners = () => { // NEW: Listeners for ToDo module
    addTodoBtn?.addEventListener('click', addTodo);
    newTodoInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    todoSortSelect?.addEventListener('change', (e) => {
        sortTodos(e.target.value);
    });

    // Add listener for actions within the todo list (using event delegation)
    todoListContainer?.addEventListener('click', (event) => {
        const target = event.target;
        const todoItem = target.closest('.todo-item');
        if (!todoItem) return;

        const todoId = parseInt(todoItem.dataset.id);

        if (target.matches('input[type="checkbox"]')) {
            // Already handled by toggleTodoComplete via change listener added in render
        } else if (target.closest('.edit-todo-btn')) {
             event.stopPropagation();
             editTodo(todoId);
        } else if (target.closest('.delete-todo-btn')) {
             event.stopPropagation();
             deleteTodo(todoId);
        }
    });
};


const setupSidebarListeners = () => { // NEW: Listener for sidebar navigation
    sidebarNav?.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-module]');
        if (link && link.dataset.module) {
            event.preventDefault();
            const moduleName = link.dataset.module;
            setActiveModule(moduleName);
        }
    });
};

const setupGlobalListeners = () => { // Keep existing, might need context checks later
     document.addEventListener('mousedown', (event) => {
        // Close move note menu if clicking outside
        if (activeMoveMenu && !activeMoveMenu.contains(event.target) && !event.target.closest('.move-note-btn')) {
            closeMoveNoteMenu();
        }
        // Close tag suggestions if clicking outside
        const suggestionBox = document.getElementById(SUGGESTION_BOX_ID);
        if (suggestionBox && !suggestionBox.contains(event.target) && activeTagInputElement && !activeTagInputElement.contains(event.target)) {
             hideTagSuggestions();
        }
     }, true);
     setupGlobalKeydownListeners(); // Setup keyboard shortcuts
};

const setupGlobalKeydownListeners = () => { // Adjust for active module context
    document.addEventListener('keydown', (event) => {
        const activeElement = document.activeElement;
        const isTypingInInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
        const isTypingInSearch = activeElement === searchInput;
        const isTypingInNoteEdit = activeElement?.closest('.note')?.querySelector('.edit-input, .edit-title-input, .edit-tags-input') === activeElement;
        const isTypingInTodoAdd = addTodoPanel?.contains(activeElement); // Check if typing in todo add panel
        // Add checks for other module inputs when implemented

        const isAnyModalOpen = !!document.querySelector('.modal.visible'); // Simplified check
        const isSuggestionBoxOpen = !!document.getElementById(SUGGESTION_BOX_ID);
        const isMoveMenuOpen = !!activeMoveMenu;

        // Escape key handling
        if (event.key === 'Escape') {
             if (isMoveMenuOpen) closeMoveNoteMenu();
             else if (isSuggestionBoxOpen) hideTagSuggestions();
             else if (isAnyModalOpen) {
                 // Try closing the visible modal generically
                 const visibleModal = document.querySelector('.modal.visible');
                 const closeBtn = visibleModal?.querySelector('.close-modal-btn, #cancel-edit-notebook-btn, #cancel-edit-template-btn, #close-add-panel-btn'); // Add relevant close/cancel buttons
                 closeBtn?.click();
             }
             // Close note add panel if open and notes module active
             else if (currentActiveModule === 'notes' && !addNotePanel.classList.contains('hidden')) hideAddPanel();
             // Cancel note editing if active
             else if (currentActiveModule === 'notes' && isTypingInNoteEdit) {
                 const editingNoteElement = activeElement.closest('.note');
                 if (editingNoteElement && confirm("Bạn có muốn hủy bỏ các thay đổi và đóng chỉnh sửa ghi chú không?")) {
                     displayNotes(searchInput.value); // Re-render notes
                     if (addNotePanel.classList.contains('hidden')) showAddPanelBtn?.classList.remove('hidden'); // Show FAB
                     if (sortableInstance) sortableInstance.option('disabled', false); // Re-enable drag
                 }
             }
             // Clear search if focused and has value
             else if (activeElement === searchInput && searchInput.value !== '') {
                 searchInput.value = '';
                 // Trigger search based on active module
                 if (currentActiveModule === 'notes') displayNotes();
                 else if (currentActiveModule === 'todo') displayTodos();
                 // Add other modules
             }
             event.preventDefault(); event.stopPropagation(); return;
        }

        // Prevent shortcuts if a modal is open (unless it's a save shortcut within an edit panel)
        const isEditingTemplate = templateEditPanel?.contains(activeElement);
        const isEditingNotebook = notebookEditPanel?.contains(activeElement);
        const allowSaveInModal = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's' && (isEditingTemplate || isEditingNotebook);
        if (isAnyModalOpen && !allowSaveInModal) return;
        if (isMoveMenuOpen || isSuggestionBoxOpen) return; // Prevent shortcuts when menus are open

        // Prevent shortcuts if typing in most inputs (except search)
        if (isTypingInInput && !isTypingInSearch && !isTypingInNoteEdit /* && !isTypingInOtherModuleEdit */) return;


        const isCtrlOrCmd = event.metaKey || event.ctrlKey;

        // Ctrl/Cmd + N: Add new item (context-dependent)
        if (isCtrlOrCmd && event.key.toLowerCase() === 'n') {
            event.preventDefault();
            if (currentActiveModule === 'notes' && addNotePanel?.classList.contains('hidden') && !notesContainer?.querySelector('.note .edit-input')) {
                showAddPanel(); // Show note add panel
            } else if (currentActiveModule === 'todo') {
                newTodoInput?.focus(); // Focus the todo input
            }
            // Add cases for other modules
        }
        // Ctrl/Cmd + S: Save item (context-dependent)
        else if (isCtrlOrCmd && event.key.toLowerCase() === 's') {
            if (currentActiveModule === 'notes') {
                if (isTypingInNoteEdit) { event.preventDefault(); activeElement.closest('.note')?.querySelector('.save-edit-btn')?.click(); }
                else if (addNotePanel?.contains(activeElement)) { event.preventDefault(); addNoteBtn?.click(); }
                else if (isEditingTemplate) { event.preventDefault(); saveTemplateBtn?.click(); }
                else if (isEditingNotebook) { event.preventDefault(); saveNotebookBtn?.click(); }
            } else if (currentActiveModule === 'todo') {
                 if (isTypingInTodoAdd) { event.preventDefault(); addTodoBtn?.click(); }
                 // Add save logic for editing todo later
            }
             // Add cases for other modules
        }
        // Ctrl/Cmd + F: Focus search
        else if (isCtrlOrCmd && event.key.toLowerCase() === 'f') {
            event.preventDefault();
            searchInput?.focus();
            searchInput?.select();
        }
    });
};

// =====================================================================
//  Main Event Listener Setup Function (UPDATED)
// =====================================================================
const setupEventListeners = () => {
    setupSidebarListeners(); // NEW
    setupThemeAndAppearanceListeners(); // Uses sidebar buttons now
    setupHeaderActionListeners(); // Global/Note specific buttons in header
    setupAddNotePanelListeners(); // Note specific
    setupSearchListener(); // Handles search for active module
    setupNoteActionListeners(); // Note specific
    setupTemplateModalListeners(); // Note specific
    setupNotebookListeners(); // Note specific
    setupTagInputListeners(); // Note specific
    setupTodoListeners(); // NEW
    setupGlobalListeners(); // Handles Esc, clicks outside, keyboard shortcuts
};


// =====================================================================
//  Initial Load Function (UPDATED)
// =====================================================================
const loadNotesAndInit = () => {
     loadNotes();
     loadTemplates();
     loadNotebooks();
     loadTodos(); // NEW: Load todos
     // Load other module data here

     applyAllAppearanceSettings();

     // Set initial active module (e.g., from localStorage or default)
     // For now, default to notes
     setActiveModule(DEFAULT_MODULE);

     // Initial rendering specific to the default module (Notes)
     // renderNotebookTabs(); // Called within displayNotes now
     // displayNotes(); // Called within setActiveModule now
     populateTemplateDropdown(); // Still relevant for notes

     setupEventListeners(); // Setup all listeners after initial load
};

// =====================================================================
//  Start the application
// =====================================================================
loadNotesAndInit();
```

**Những thay đổi và bổ sung chính trong JavaScript:**

1.  **DOM References:** Thêm các tham chiếu cho sidebar, các nút trong sidebar, container module, và các phần tử của module ToDo. Cập nhật tham chiếu cho các nút đã chuyển vào sidebar.
2.  **State:** Thêm biến `todos = []` và `currentActiveModule = 'notes'`. Thêm hằng số `TODOS_STORAGE_KEY`.
3.  **Module Switching (`setActiveModule`):** Hàm mới để xử lý việc thay đổi giao diện khi chuyển module (cập nhật `<body>` attribute, class `active` trên link sidebar và container module, gọi hàm hiển thị tương ứng).
4.  **ToDo Logic:** Thêm các hàm `loadTodos`, `saveTodos`, `addTodo`, `renderTodoElement`, `displayTodos`, `toggleTodoComplete`, `getFilteredTodos`, `sortTodosLogic`, và các hàm placeholder `editTodo`, `deleteTodo`.
5.  **Event Listeners:**
    * Thêm `setupSidebarListeners` để xử lý click trên navigation sidebar.
    * Thêm `setupTodoListeners` để xử lý các sự kiện trong module ToDo.
    * Cập nhật `setupThemeAndAppearanceListeners` để dùng các nút trong sidebar.
    * Cập nhật `setupHeaderActionListeners` cho các nút còn lại trong header chính.
    * Cập nhật `setupSearchListener` để gọi hàm hiển thị phù hợp với module đang hoạt động.
    * Cập nhật `setupGlobalKeydownListeners` để các phím tắt (Ctrl+N, Ctrl+S) hoạt động tùy theo ngữ cảnh module.
    * Đảm bảo các listener cũ (Note, Template, Notebook) chỉ hoạt động khi module Notes đang active hoặc khi modal tương ứng được mở.
6.  **Initialization (`loadNotesAndInit`):** Gọi `loadTodos` và `setActiveModule(DEFAULT_MODULE)` để khởi tạo trạng thái ban đầu.
7.  **Điều chỉnh Hàm Hiện có:**
    * `addNote`: Chỉ gán `notebookId` nếu module 'notes' đang hoạt động. Chuyển về module 'notes' nếu đang ở archive/trash.
    * `displayNotes`: Chỉ chạy nếu module 'notes' đang hoạt động. Gọi `renderNotebookTabs` bên trong.
    * `renderNotebookTabs`: Chỉ chạy nếu module 'notes' đang hoạt động.
    * `exportNotes`/`importNotes`: Cập nhật để bao gồm cả dữ liệu `todos`.
    * `showAddPanel`/`hideAddPanel`: Chỉ hoạt động khi module 'notes' đang active.

Bạn hãy thử nghiệm với 3 file HTML, CSS, JS mới này. Giờ đây bạn sẽ có sidebar, có thể chuyển đổi giữa module "Ghi chú" và "Công việc". Module "Công việc" đã có chức năng thêm và hiển thị cơ b
