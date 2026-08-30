const fs = require('fs');
let code = fs.readFileSync('src/components/search/SearchView.tsx', 'utf8');

code = code.replace(
  "<span>{searchQuery ? `Results for \"${searchQuery}\"` : 'Explore All Titles'}</span>",
  "<span>{searchQuery ? `Results for \"${searchQuery}\"` : 'Explore All Titles'}</span>\n          {isSearching && <span className=\"ml-2 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block\"></span>}"
);

fs.writeFileSync('src/components/search/SearchView.tsx', code);
