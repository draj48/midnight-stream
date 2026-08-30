const fs = require('fs');
let code = fs.readFileSync('src/data/mockMedia.ts', 'utf8');

// Remove everything after the CATEGORIES array
const endOfCategories = code.indexOf('export const MOCK_MEDIA_ITEMS');
if (endOfCategories !== -1) {
    code = code.substring(0, endOfCategories);
}
fs.writeFileSync('src/data/mockMedia.ts', code);
