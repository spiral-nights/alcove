const { UI } = require('../ui.js');

describe('Modal Component', () => {
    let ui;
    let modalElement;

    beforeEach(async () => {
        document.body.innerHTML = `
            <div id="modal" class="hidden">
                <div id="modal-content"></div>
            </div>
            <input id="search-input" type="text">
            <div id="results"></div>
        `;
        
        const dbMock = {
            getCategories: jest.fn().mockResolvedValue([]),
            getBookmarks: jest.fn().mockResolvedValue([])
        };

        ui = new UI(dbMock, 'search-input', 'results', 'modal');
        await ui.init();
        modalElement = document.getElementById('modal');
    });

    test('modal is hidden by default', () => {
        expect(modalElement.classList.contains('hidden')).toBe(true);
    });

    test('can show modal with content', () => {
        ui.showModal('<h1>Test Modal</h1>');
        expect(modalElement.classList.contains('hidden')).toBe(false);
        expect(document.getElementById('modal-content').innerHTML).toBe('<h1>Test Modal</h1>');
    });

    test('can hide modal', () => {
        ui.showModal('Test');
        ui.hideModal();
        expect(modalElement.classList.contains('hidden')).toBe(true);
    });

    test('closes modal on Esc key', () => {
        ui.showModal('Test');
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(event);
        expect(modalElement.classList.contains('hidden')).toBe(true);
    });
});
