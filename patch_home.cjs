const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

code = code.replace(/import \{ HERO_FEATURED_ITEM \} from '..\/..\/data\/mockMedia';\n/g, '');
code = code.replace(/<HeroBanner media=\{HERO_FEATURED_ITEM\} \/>/g, `{mediaCatalog.length > 0 && <HeroBanner media={mediaCatalog[0]} />}`);

fs.writeFileSync('src/components/views/HomeView.tsx', code);
