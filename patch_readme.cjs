const fs = require('fs');
let code = fs.readFileSync('README.md', 'utf8');

code = code.replace(/CineStream/g, 'MidnightPlay');
code = code.replace(/cinestream/g, 'midnightplay');

fs.writeFileSync('README.md', code);
