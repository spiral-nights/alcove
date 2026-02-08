const { UI } = require('../ui.js');

describe('UI Logic', () => {
    let dbMock;
    let ui;
    let searchInput;
    let resultsContainer;

    beforeEach(async () => {
        document.body.innerHTML = `
            <div id="modal" class="hidden"><div id="modal-content"></div></div>
            <div class="flex gap-2">
                <input id="search-input" type="text">
                <button onclick="ui.showModal(ui.generateBookmarkForm())" title="Add Bookmark (CMD+I)">Add</button>
                <button id="import-btn" title="Import Bookmarks (.html)">Import</button>
                <button id="export-btn" title="Export Bookmarks (.html)">Export</button>
                <input type="file" id="import-input" accept=".html">
            </div>
            <div id="results"></div>
        `;
        
        searchInput = document.getElementById('search-input');
        resultsContainer = document.getElementById('results');

        dbMock = {
            getCategories: jest.fn().mockResolvedValue([{ id: 1, name: 'Work', color: '#ff0000' }]),
            getBookmarks: jest.fn().mockResolvedValue([
                { id: 1, name: 'Google', url: 'https://google.com', categoryId: 1, tags: ['search'] },
                { id: 2, name: 'GitHub', url: 'https://github.com', categoryId: 1, tags: ['code'] }
            ]),
            deleteBookmark: jest.fn()
        };

        ui = new UI(dbMock, 'search-input', 'results', 'modal');
    });

    test('renders bookmarks on init', async () => {
        await ui.init();
        expect(resultsContainer.children.length).toBe(2);
        expect(resultsContainer.innerHTML).toContain('Google');
        expect(resultsContainer.innerHTML).toContain('GitHub');
    });

    test('filters results on search', async () => {
        await ui.init();
        ui.handleSearch('google');
        expect(resultsContainer.children.length).toBe(1);
        expect(resultsContainer.innerHTML).toContain('Google');
        expect(resultsContainer.innerHTML).not.toContain('GitHub');
    });

    test('navigates results with arrow keys', async () => {
        await ui.init();
        ui.handleSearch(''); // show all
        
        expect(ui.selectedIndex).toBe(-1); // No initial selection while typing
        
        const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        
        window.dispatchEvent(eventDown);
        expect(ui.selectedIndex).toBe(0);
        expect(resultsContainer.children[0].classList.contains('ring-1')).toBe(true);
        
        window.dispatchEvent(eventDown);
        expect(ui.selectedIndex).toBe(1);
        expect(resultsContainer.children[1].classList.contains('ring-1')).toBe(true);
        
        window.dispatchEvent(eventUp);
        expect(ui.selectedIndex).toBe(0);
    });

    test('opens selected bookmark on Enter', async () => {
        await ui.init();
        ui.handleSearch('google'); 
        ui.selectedIndex = 0;
        
        const navigateSpy = jest.spyOn(ui, 'navigate').mockImplementation(() => {});
        
        const eventEnter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        window.dispatchEvent(eventEnter);
        
        expect(navigateSpy).toHaveBeenCalledWith('https://google.com');
        navigateSpy.mockRestore();
    });

    test('focuses search on CMD+K', async () => {
        await ui.init();
        searchInput.blur();
        expect(document.activeElement).not.toBe(searchInput);
        
        const eventK = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
        window.dispatchEvent(eventK);
        
        expect(document.activeElement).toBe(searchInput);
    });

    test('opens add bookmark modal on CMD+I', async () => {
        await ui.init();
        const eventI = new KeyboardEvent('keydown', { key: 'i', metaKey: true });
        window.dispatchEvent(eventI);
        
        expect(document.getElementById('modal').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('modal-content').innerHTML).toContain('Add Bookmark');
    });

    test('opens edit modal on E shortcut', async () => {
        await ui.init();
        ui.selectedIndex = 0; // Select Google
        
        const eventE = new KeyboardEvent('keydown', { key: 'e' });
        window.dispatchEvent(eventE);
        
        expect(document.getElementById('modal').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('modal-content').innerHTML).toContain('Edit Bookmark');
        expect(document.getElementById('modal-content').innerHTML).toContain('value="Google"');
    });

    test('triggers delete on D shortcut', async () => {
        await ui.init();
        ui.selectedIndex = 1; // Select GitHub
        
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
        const deleteSpy = jest.spyOn(ui.db, 'deleteBookmark').mockResolvedValue(true);
        
        const eventD = new KeyboardEvent('keydown', { key: 'd' });
        window.dispatchEvent(eventD);
        
        expect(confirmSpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalledWith(2);
        confirmSpy.mockRestore();
    });

    test('has export button', () => {
        const exportBtn = document.querySelector('button[title*="Export"]');
        expect(exportBtn).toBeTruthy();
    });

    test('opens export modal on Export button click', async () => {
        await ui.init();
        const exportBtn = document.querySelector('button[title*="Export"]');
        const modalSpy = jest.spyOn(ui, 'showExportModal').mockImplementation(() => {});
        exportBtn.click();
        expect(modalSpy).toHaveBeenCalled();
        modalSpy.mockRestore();
    });

    test('triggers file download with correct content', () => {
        const createElementSpy = jest.spyOn(document, 'createElement');
        const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
        
        ui._downloadFile('test.html', '<h1>Test</h1>');
        
        const link = createElementSpy.mock.results.find(r => r.value.tagName === 'A').value;
        expect(link.getAttribute('download')).toBe('test.html');
        expect(link.getAttribute('href')).toContain(encodeURIComponent('<h1>Test</h1>'));
        expect(appendChildSpy).toHaveBeenCalledWith(link);
        expect(removeChildSpy).toHaveBeenCalledWith(link);
        
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });
});
