const { UI, Icons } = require('../ui.js');

describe('Icons Utility', () => {
    test('Icons object contains all required path data', () => {
        const requiredIcons = ['search', 'plus', 'upload', 'download', 'x', 'edit-3', 'trash-2'];
        requiredIcons.forEach(name => {
            expect(Icons[name]).toBeDefined();
            expect(typeof Icons[name]).toBe('string');
        });
    });

    test('UI.renderIcon returns valid SVG string', () => {
        const dbMock = {};
        const ui = new UI(dbMock);
        const svg = ui.renderIcon('search', 'w-5 h-5 custom-class');
        
        expect(svg).toContain('<svg');
        expect(svg).toContain('viewBox="0 0 24 24"');
        expect(svg).toContain('class="w-5 h-5 custom-class"');
        expect(svg).toContain(Icons['search']);
    });

    test('UI.renderIcon handles missing icon gracefully', () => {
        const dbMock = {};
        const ui = new UI(dbMock);
        const svg = ui.renderIcon('non-existent');
        expect(svg).toBe('');
    });
});
