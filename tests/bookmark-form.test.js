const { UI } = require('../ui.js');

describe('Bookmark Form Logic', () => {
    let ui;

    beforeEach(async () => {
        document.body.innerHTML = `
            <div id="modal" class="hidden"><div id="modal-content"></div></div>
            <input id="search-input" type="text">
            <div id="results"></div>
        `;
        
        const dbMock = {
            getCategories: jest.fn().mockResolvedValue([{ id: 1, name: 'Work', color: '#ff0000' }]),
            getBookmarks: jest.fn().mockResolvedValue([]),
            addBookmark: jest.fn(),
            updateBookmark: jest.fn(),
            deleteBookmark: jest.fn()
        };

        ui = new UI(dbMock, 'search-input', 'results', 'modal');
        await ui.init();
    });

    test('generates bookmark form HTML', async () => {
        const formHtml = ui.generateBookmarkForm();
        expect(formHtml).toContain('name="bm-name"');
        expect(formHtml).toContain('name="bm-url"');
        expect(formHtml).toContain('name="bm-category"');
        expect(formHtml).toContain('name="bm-tags"');
        expect(formHtml).toContain('Work');
    });

    test('pre-fills form for editing', () => {
        const bookmark = { id: 123, name: 'Test', url: 'http://test.com', categoryId: 1, tags: ['a', 'b'] };
        const formHtml = ui.generateBookmarkForm(bookmark);
        expect(formHtml).toContain('value="Test"');
        expect(formHtml).toContain('value="http://test.com"');
        expect(formHtml).toContain('value="a, b"');
    });

    test('validates form data', () => {
        document.getElementById('modal-content').innerHTML = ui.generateBookmarkForm();
        
        // Empty fields
        expect(ui.validateBookmarkForm()).toBe(false);

        // Valid fields
        document.querySelector('[name="bm-name"]').value = 'New BM';
        document.querySelector('[name="bm-url"]').value = 'https://google.com';
        expect(ui.validateBookmarkForm()).toBe(true);
    });

    test('gathers form data', () => {
        document.getElementById('modal-content').innerHTML = ui.generateBookmarkForm();
        document.querySelector('[name="bm-name"]').value = 'My App';
        document.querySelector('[name="bm-url"]').value = 'http://localhost:3000';
        document.querySelector('[name="bm-category"]').value = '1';
        document.querySelector('[name="bm-tags"]').value = 'tag1, tag2';

        const data = ui.gatherBookmarkFormData();
        expect(data).toEqual({
            name: 'My App',
            url: 'http://localhost:3000',
            categoryId: 1,
            tags: ['tag1', 'tag2']
        });
    });

    test('saves bookmark and refreshes list', async () => {
        document.getElementById('modal-content').innerHTML = ui.generateBookmarkForm();
        document.querySelector('[name="bm-name"]').value = 'New Site';
        document.querySelector('[name="bm-url"]').value = 'https://new.com';
        
        const saveSpy = jest.spyOn(ui.db, 'addBookmark').mockResolvedValue(123);
        const refreshSpy = jest.spyOn(ui, 'refresh'); // init was refactored to refresh
        
        await ui.handleBookmarkSubmit(new Event('submit'));
        
        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Site',
            url: 'https://new.com'
        }));
        expect(refreshSpy).toHaveBeenCalled();
        expect(document.getElementById('modal').classList.contains('hidden')).toBe(true);
    });

    test('updates existing bookmark and refreshes list', async () => {
        const bookmark = { id: 123, name: 'Old', url: 'http://old.com' };
        document.getElementById('modal-content').innerHTML = ui.generateBookmarkForm(bookmark);
        document.querySelector('[name="bm-name"]').value = 'Updated';
        
        const updateSpy = jest.spyOn(ui.db, 'updateBookmark').mockResolvedValue(true);
        const refreshSpy = jest.spyOn(ui, 'refresh');
        
        await ui.handleBookmarkSubmit(new Event('submit'));
        
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            id: 123,
            name: 'Updated'
        }));
        expect(refreshSpy).toHaveBeenCalled();
    });

    test('deletes bookmark and refreshes list', async () => {
        const deleteSpy = jest.spyOn(ui.db, 'deleteBookmark').mockResolvedValue(true);
        const refreshSpy = jest.spyOn(ui, 'refresh');
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
        
        await ui.handleDeleteBookmark(456);
        
        expect(deleteSpy).toHaveBeenCalledWith(456);
        expect(refreshSpy).toHaveBeenCalled();
        confirmSpy.mockRestore();
    });
});
