const { NetscapeGenerator } = require('../generator.js');

describe('NetscapeGenerator', () => {
    const categories = [
        { id: 1, name: 'Work', color: '#ff0000' },
        { id: 2, name: 'Social', color: '#0000ff' }
    ];
    const bookmarks = [
        { id: 1, name: 'Google', url: 'https://google.com', categoryId: 1, tags: ['search'] },
        { id: 2, name: 'Facebook', url: 'https://fb.com', categoryId: 2, tags: ['social'] },
        { id: 3, name: 'Twitter', url: 'https://twitter.com', categoryId: null, tags: [] }
    ];

    test('generates valid Netscape HTML', () => {
        const generator = new NetscapeGenerator();
        const html = generator.generate(bookmarks, categories);

        expect(html).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
        expect(html).toContain('<H3>Work</H3>');
        expect(html).toMatch(/<A HREF="https:\/\/google\.com" ADD_DATE="\d+" TAGS="search">Google<\/A>/);
        expect(html).toContain('<H3>Social</H3>');
        expect(html).toMatch(/<A HREF="https:\/\/fb\.com" ADD_DATE="\d+" TAGS="social">Facebook<\/A>/);
        expect(html).toMatch(/<A HREF="https:\/\/twitter\.com" ADD_DATE="\d+" TAGS="">Twitter<\/A>/);
    });

    test('handles empty data', () => {
        const generator = new NetscapeGenerator();
        const html = generator.generate([], []);
        expect(html).toContain('<DL><p>\n</DL><p>');
    });
});
