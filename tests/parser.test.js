const { NetscapeParser } = require('../parser.js');

describe('NetscapeParser', () => {
    const sampleHtml = `
        <!DOCTYPE NETSCAPE-Bookmark-file-1>
        <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
        <TITLE>Bookmarks</TITLE>
        <H1>Bookmarks</H1>
        <DL><p>
            <DT><H3 ADD_DATE="1644336000" LAST_MODIFIED="1644336000">Work</H3>
            <DL><p>
                <DT><A HREF="https://google.com" ADD_DATE="1644336000" ICON="data:image/png;base64,...">Google</A>
                <DT><A HREF="https://github.com" ADD_DATE="1644336000" TAGS="code,repo">GitHub</A>
            </DL><p>
            <DT><A HREF="https://twitter.com" ADD_DATE="1644336000">Twitter</A>
        </DL><p>
    `;

    test('parses nested categories and bookmarks', () => {
        const parser = new NetscapeParser();
        const results = parser.parse(sampleHtml);

        expect(results.categories).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Work' })
        ]));

        expect(results.bookmarks).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Google', url: 'https://google.com', categoryName: 'Work' }),
            expect.objectContaining({ name: 'GitHub', url: 'https://github.com', categoryName: 'Work', tags: ['code', 'repo'] }),
            expect.objectContaining({ name: 'Twitter', url: 'https://twitter.com', categoryName: null })
        ]));
    });

    test('handles empty or malformed HTML', () => {
        const parser = new NetscapeParser();
        const results = parser.parse('');
        expect(results.bookmarks.length).toBe(0);
        expect(results.categories.length).toBe(0);
    });
});
