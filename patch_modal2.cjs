const fs = require('fs');
let code = fs.readFileSync('src/components/profile/ProfileModal.tsx', 'utf8');

code = code.replace(/<div className="border-t border-zinc-800 pt-6 space-y-5">/, '<div className="pt-6 space-y-5">');

fs.writeFileSync('src/components/profile/ProfileModal.tsx', code);
