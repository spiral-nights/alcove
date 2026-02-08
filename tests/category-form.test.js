const { UI } = require('../ui.js');

describe('Category Form Logic', () => {
    let ui;

    beforeEach(async () => {
        document.body.innerHTML = `
            <div id="modal" class="hidden"><div id="modal-content"></div></div>
            <input id="search-input" type="text">
            <div id="results"></div>
        `;
        
        const dbMock = {
            getCategories: jest.fn().mockResolvedValue([]),
            getBookmarks: jest.fn().mockResolvedValue([]),
            addCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn()
        };

        ui = new UI(dbMock, 'search-input', 'results', 'modal');
        await ui.init();
    });

    test('generates category form HTML', () => {
        const formHtml = ui.generateCategoryForm();
        expect(formHtml).toContain('name="cat-name"');
        expect(formHtml).toContain('name="cat-color"');
    });

    test('pre-fills form for editing', () => {
        const category = { id: 1, name: 'Work', color: '#ff0000' };
        const formHtml = ui.generateCategoryForm(category);
        expect(formHtml).toContain('value="Work"');
        expect(formHtml).toContain('value="#ff0000"');
    });

    test('validates form data', () => {
        document.getElementById('modal-content').innerHTML = ui.generateCategoryForm();
        
        // Empty fields
        expect(ui.validateCategoryForm()).toBe(false);

        // Valid fields
        document.querySelector('[name="cat-name"]').value = 'New Cat';
        expect(ui.validateCategoryForm()).toBe(true);
    });

    test('gathers form data', () => {
        document.getElementById('modal-content').innerHTML = ui.generateCategoryForm();
        document.querySelector('[name="cat-name"]').value = 'Life';
        document.querySelector('[name="cat-color"]').value = '#00ff00';

        const data = ui.gatherCategoryFormData();
        expect(data).toEqual({
            name: 'Life',
            color: '#00ff00'
        });
    });

    test('saves category and refreshes list', async () => {
        document.getElementById('modal-content').innerHTML = ui.generateCategoryForm();
        document.querySelector('[name="cat-name"]').value = 'New Cat';
        
        const saveSpy = jest.spyOn(ui.db, 'addCategory').mockResolvedValue(123);
        const refreshSpy = jest.spyOn(ui, 'refresh');
        
        await ui.handleCategorySubmit(new Event('submit'));
        
        expect(saveSpy).toHaveBeenCalled();
        expect(refreshSpy).toHaveBeenCalled();
    });

    test('updates existing category', async () => {
        const category = { id: 1, name: 'Old', color: '#000000' };
        document.getElementById('modal-content').innerHTML = ui.generateCategoryForm(category);
        document.querySelector('[name="cat-name"]').value = 'Updated';
        
        const updateSpy = jest.spyOn(ui.db, 'updateCategory').mockResolvedValue(true);
        const refreshSpy = jest.spyOn(ui, 'refresh').mockResolvedValue();
        
        await ui.handleCategorySubmit(new Event('submit'));
        
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            id: 1,
            name: 'Updated'
        }));
        expect(refreshSpy).toHaveBeenCalled();
    });

    test('deletes category', async () => {
        const deleteSpy = jest.spyOn(ui.db, 'deleteCategory').mockResolvedValue(true);
        const refreshSpy = jest.spyOn(ui, 'refresh').mockResolvedValue();
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        
        await ui.handleDeleteCategory(789);
        
        expect(deleteSpy).toHaveBeenCalledWith(789);
        expect(refreshSpy).toHaveBeenCalled();
    });
});
