const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(/cinestream_/g, 'midnightplay_');

fs.writeFileSync('src/lib/storage.ts', code);
