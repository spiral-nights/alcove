class NetscapeParser {
    parse(htmlString) {
        const bookmarks = [];
        const categories = new Set();
        const categoryMap = new Map(); // Track current category based on DOM hierarchy

        if (!htmlString) return { bookmarks, categories: [] };

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        
        // Find all DL elements which contain DT elements
        const rootDl = doc.querySelector('dl');
        if (!rootDl) return { bookmarks, categories: [] };

        this._traverse(rootDl, null, bookmarks, categories);

        return {
            bookmarks,
            categories: Array.from(categories).map(name => ({ name }))
        };
    }

    _traverse(dl, currentCategory, bookmarks, categories) {
        const items = dl.children;
        for (const item of items) {
            if (item.tagName === 'DT') {
                const h3 = item.querySelector('h3');
                const a = item.querySelector('a');
                const nextDl = item.querySelector('dl');

                if (h3) {
                    const categoryName = h3.textContent.trim();
                    categories.add(categoryName);
                    // If there's a DL immediately following or inside this DT, it's a sub-folder
                    // In Netscape format, it's usually <DT><H3>...</H3><DL>...
                    const siblingDl = item.querySelector('dl') || (item.nextElementSibling && item.nextElementSibling.tagName === 'DL' ? item.nextElementSibling : null);
                    if (siblingDl) {
                        this._traverse(siblingDl, categoryName, bookmarks, categories);
                    }
                } else if (a) {
                    const name = a.textContent.trim();
                    const url = a.getAttribute('href');
                    const tagsStr = a.getAttribute('tags') || '';
                    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];
                    
                    bookmarks.push({
                        name,
                        url,
                        categoryName: currentCategory,
                        tags
                    });
                }
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NetscapeParser };
}
