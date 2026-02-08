class Database {
    constructor(dbName = 'alcove') {
        this.dbName = dbName;
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('bookmarks')) {
                    const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
                    bookmarkStore.createIndex('name', 'name', { unique: false });
                    bookmarkStore.createIndex('categoryId', 'categoryId', { unique: false });
                }

                if (!db.objectStoreNames.contains('categories')) {
                    const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                    categoryStore.createIndex('name', 'name', { unique: true });
                }
            };
        });
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async addCategory(category) {
        return this._perform('categories', 'readwrite', (store) => store.add(category));
    }

    async getCategories() {
        return this._perform('categories', 'readonly', (store) => store.getAll());
    }

    async updateCategory(category) {
        const existing = await this._perform('categories', 'readonly', (store) => store.get(category.id));
        const updated = { ...existing, ...category };
        return this._perform('categories', 'readwrite', (store) => store.put(updated));
    }

    async deleteCategory(id) {
        return this._perform('categories', 'readwrite', (store) => store.delete(id));
    }

    async addBookmark(bookmark) {
        return this._perform('bookmarks', 'readwrite', (store) => store.add(bookmark));
    }

    async getBookmarks() {
        return this._perform('bookmarks', 'readonly', (store) => store.getAll());
    }

    async updateBookmark(bookmark) {
        const existing = await this._perform('bookmarks', 'readonly', (store) => store.get(bookmark.id));
        const updated = { ...existing, ...bookmark };
        return this._perform('bookmarks', 'readwrite', (store) => store.put(updated));
    }

    async deleteBookmark(id) {
        return this._perform('bookmarks', 'readwrite', (store) => store.delete(id));
    }

    async importData(data) {
        const { categories, bookmarks } = data;
        
        // 1. Ensure categories exist and get their IDs
        const categoryMap = new Map(); // name -> id
        const existingCategories = await this.getCategories();
        existingCategories.forEach(c => categoryMap.set(c.name, c.id));

        for (const cat of categories) {
            if (!categoryMap.has(cat.name)) {
                const id = await this.addCategory({ name: cat.name, color: '#3b82f6' }); // Default color
                categoryMap.set(cat.name, id);
            }
        }

        // 2. Add bookmarks
        for (const bm of bookmarks) {
            const categoryId = bm.categoryName ? categoryMap.get(bm.categoryName) : null;
            await this.addBookmark({
                name: bm.name,
                url: bm.url,
                categoryId,
                tags: bm.tags || [],
                visitCount: 0,
                lastVisited: Date.now()
            });
        }
    }

    async seed() {
        const categories = [
            { name: 'Social', color: '#3b82f6' },
            { name: 'Dev', color: '#10b981' },
            { name: 'Search', color: '#f59e0b' }
        ];

        for (const cat of categories) {
            await this.addCategory(cat);
        }

        const cats = await this.getCategories();
        const findCatId = (name) => cats.find(c => c.name === name).id;

        const bookmarks = [
            { name: 'Google', url: 'https://google.com', categoryId: findCatId('Search'), tags: ['search', 'engine'], visitCount: 10, lastVisited: Date.now() },
            { name: 'GitHub', url: 'https://github.com', categoryId: findCatId('Dev'), tags: ['code', 'repo'], visitCount: 25, lastVisited: Date.now() },
            { name: 'Twitter', url: 'https://twitter.com', categoryId: findCatId('Social'), tags: ['social', 'news'], visitCount: 5, lastVisited: Date.now() },
            { name: 'Tailwind CSS', url: 'https://tailwindcss.com', categoryId: findCatId('Dev'), tags: ['css', 'framework'], visitCount: 15, lastVisited: Date.now() }
        ];

        for (const bm of bookmarks) {
            await this.addBookmark(bm);
        }
    }

    async _perform(storeName, mode, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = callback(store);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Database };
}
