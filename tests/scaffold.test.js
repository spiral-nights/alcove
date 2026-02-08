const fs = require('fs');
const path = require('path');

describe('Index HTML Scaffolding', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');

    test('index.html exists', () => {
        expect(fs.existsSync(htmlPath)).toBe(true);
    });

    test('contains local Tailwind CSS output', () => {
        const html = fs.readFileSync(htmlPath, 'utf8');
        expect(html).toContain('href="dist/output.css"');
    });

    test('contains embedded Icons utility', () => {
        const html = fs.readFileSync(htmlPath, 'utf8');
        expect(html).toContain('const Icons = {');
    });

    test('contains a web manifest', () => {
        const html = fs.readFileSync(htmlPath, 'utf8');
        expect(html).toContain('rel="manifest"');
    });

    test('contains a favicon', () => {
        const html = fs.readFileSync(htmlPath, 'utf8');
        expect(html).toContain('rel="icon"');
    });

    test('registers a service worker', () => {
        const html = fs.readFileSync(htmlPath, 'utf8');
        expect(html).toContain("navigator.serviceWorker.register('sw.js')");
    });
});
