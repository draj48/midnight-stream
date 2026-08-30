const fs = require('fs');

const protectHero = (file) => {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/<HeroBanner media=\{heroShow\} \/>/g, '{heroShow && <HeroBanner media={heroShow} />}');
    code = code.replace(/<HeroBanner media=\{heroMovie\} \/>/g, '{heroMovie && <HeroBanner media={heroMovie} />}');
    fs.writeFileSync(file, code);
};

protectHero('src/components/views/ShowsView.tsx');
protectHero('src/components/views/MoviesView.tsx');
