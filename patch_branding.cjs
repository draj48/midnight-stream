const fs = require('fs');

const replaceInFile = (file, replacements) => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        for (const [search, replace] of replacements) {
            content = content.replace(search, replace);
        }
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    } catch (e) {
        console.log(`Failed to update ${file}:`, e.message);
    }
};

// 1. App.tsx
replaceInFile('src/App.tsx', [
    [/CINE<span className="text-red-500">STREAM<\/span>/g, 'MIDNIGHT<span className="text-red-500">PLAY</span>'],
    [/CineStream Originals/g, 'MidnightPlay Originals'],
    [/CineStream Inc/g, 'MidnightPlay Inc']
]);

// 2. Navbar.tsx
replaceInFile('src/components/navigation/Navbar.tsx', [
    [/CineStream Home/g, 'MidnightPlay Home'],
    [/CINE<span className="text-zinc-100 font-sans font-black">STREAM<\/span>/g, 'MIDNIGHT<span className="text-zinc-100 font-sans font-black">PLAY</span>']
]);

// 3. DetailsModal.tsx
replaceInFile('src/components/media/DetailsModal.tsx', [
    [/CineStream Studios/g, 'MidnightPlay Studios']
]);

// 4. index.html
replaceInFile('index.html', [
    [/CineStream TV & Web/g, 'MidnightPlay TV & Web'],
    [/CineStream TV & Web/g, 'MidnightPlay TV & Web']
]);

// 5. metadata.json
replaceInFile('metadata.json', [
    [/"CineStream TV & Web"/g, '"MidnightPlay TV & Web"']
]);

// 6. ProfileModal.tsx (Optional: clear continue watching local storage key from cinestream -> midnightplay)
replaceInFile('src/components/profile/ProfileModal.tsx', [
    [/cinestream_continue_watching_v1/g, 'midnightplay_continue_watching_v1']
]);

// 7. storage.ts (Need to check if it exists)
