class NetscapeGenerator {
    generate(bookmarks, categories) {
        let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and interpreted by browser bookmark managers. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

        // 1. Group bookmarks by category
        const categorized = new Map(); // categoryId -> [bookmarks]
        const uncategorized = [];

        bookmarks.forEach(bm => {
            if (bm.categoryId) {
                if (!categorized.has(bm.categoryId)) categorized.set(bm.categoryId, []);
                categorized.get(bm.categoryId).push(bm);
            } else {
                uncategorized.push(bm);
            }
        });

        // 2. Generate folders for each category
        categories.forEach(cat => {
            const bms = categorized.get(cat.id) || [];
            if (bms.length > 0) {
                html += `    <DT><H3>${cat.name}</H3>
    <DL><p>
`;
                bms.forEach(bm => {
                    html += `        <DT>${this._generateLink(bm)}
`;
                });
                html += `    </DL><p>
`;
            }
        });

        // 3. Add uncategorized links
        uncategorized.forEach(bm => {
            html += `    <DT>${this._generateLink(bm)}
`;
        });

        html += `</DL><p>`;
        return html;
    }

    _generateLink(bm) {
        const tags = (bm.tags || []).join(',');
        return `<A HREF="${bm.url}" ADD_DATE="${Math.floor(Date.now() / 1000)}" TAGS="${tags}">${bm.name}</A>`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NetscapeGenerator };
}
