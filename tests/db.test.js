require('fake-indexeddb/auto');
if (typeof structuredClone === 'undefined') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
const { Database } = require('../db.js');

describe('IndexedDB Wrapper', () => {
    let db;

    beforeEach(async () => {
        db = new Database('alcove_test');
        await db.init();
    });

    afterEach(async () => {
        if (db) {
            db.close();
        }
        return new Promise((resolve) => {
            const req = indexedDB.deleteDatabase('alcove_test');
            req.onsuccess = resolve;
            req.onerror = resolve; // Continue even if delete fails
        });
    });

    test('initializes categories and bookmarks stores', async () => {
        expect(db.db.objectStoreNames.contains('bookmarks')).toBe(true);
        expect(db.db.objectStoreNames.contains('categories')).toBe(true);
    });

    test('can add and get a category', async () => {
        const category = { name: 'Work', color: '#ff0000' };
        const id = await db.addCategory(category);
        const categories = await db.getCategories();
        expect(categories.length).toBe(1);
        expect(categories[0].name).toBe('Work');
        expect(categories[0].id).toBe(id);
    });

    test('can add and get a bookmark', async () => {
        const bookmark = { 
            name: 'Google', 
            url: 'https://google.com', 
            categoryId: 1, 
            tags: ['search'],
            visitCount: 0,
            lastVisited: Date.now()
        };
        const id = await db.addBookmark(bookmark);
        const bookmarks = await db.getBookmarks();
        expect(bookmarks.length).toBe(1);
        expect(bookmarks[0].name).toBe('Google');
        expect(bookmarks[0].id).toBe(id);
    });

    test('can update a bookmark', async () => {
        const bookmark = { name: 'Google', url: 'https://google.com' };
        const id = await db.addBookmark(bookmark);
        await db.updateBookmark({ id, name: 'Alphabet' });
        const bookmarks = await db.getBookmarks();
        expect(bookmarks[0].name).toBe('Alphabet');
    });

    test('can delete a bookmark', async () => {
        const bookmark = { name: 'Google', url: 'https://google.com' };
        const id = await db.addBookmark(bookmark);
        await db.deleteBookmark(id);
        const bookmarks = await db.getBookmarks();
        expect(bookmarks.length).toBe(0);
    });

    test('can seed database with initial data', async () => {
        await db.seed();
        const categories = await db.getCategories();
        const bookmarks = await db.getBookmarks();
        expect(categories.length).toBeGreaterThan(0);
        expect(bookmarks.length).toBeGreaterThan(0);
    });

    test('can import multiple bookmarks and categories', async () => {
        const data = {
            categories: [{ name: 'News' }, { name: 'Social' }],
            bookmarks: [
                { name: 'CNN', url: 'https://cnn.com', categoryName: 'News', tags: ['news'] },
                { name: 'Facebook', url: 'https://fb.com', categoryName: 'Social', tags: ['social'] }
            ]
        };

        await db.importData(data);

        const categories = await db.getCategories();
        const bookmarks = await db.getBookmarks();

        expect(categories).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'News' }),
            expect.objectContaining({ name: 'Social' })
        ]));

        expect(bookmarks).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'CNN', url: 'https://cnn.com' }),
            expect.objectContaining({ name: 'Facebook', url: 'https://fb.com' })
        ]));
    });
});
