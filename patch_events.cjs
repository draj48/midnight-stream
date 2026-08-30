const fs = require('fs');

const replaceInFile = (file, search, replace) => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(search, replace);
        fs.writeFileSync(file, content);
    } catch (e) {
        console.log("Failed to update " + file + ":", e.message);
    }
};

replaceInFile('src/context/SpatialNavigationContext.tsx', /cinestream-back/g, 'midnightplay-back');
replaceInFile('src/context/AppContext.tsx', /cinestream-back/g, 'midnightplay-back');
