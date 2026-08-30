const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target = `  // Initialize storage
  useEffect(() => {
    setWatchlistState(getStoredWatchlist());
    setContinueWatchingList(getStoredContinueWatching());

    const profileId = getStoredActiveProfileId();
    const found = USER_PROFILES.find(p => p === profileId);
    if (found) setCurrentProfileState(found);
  }, []);`;

// Actually let's just find the exact block using regex or string replace.
code = code.replace(/  \/\/ Initialize storage\n  useEffect\(\(\) => \{\n    setWatchlistState\(getStoredWatchlist\(\)\);\n    setContinueWatchingList\(getStoredContinueWatching\(\)\);\n\n    const profileId = getStoredActiveProfileId\(\);\n    const found = USER_PROFILES\.find\(p => p\.id === profileId\);\n    if \(found\) setCurrentProfileState\(found\);\n  \}, \[\]\);/g, `  // Initialize storage
  useEffect(() => {
    setWatchlistState(getStoredWatchlist());
    setContinueWatchingList(getStoredContinueWatching());

    const profileId = getStoredActiveProfileId();
    const found = USER_PROFILES.find(p => p.id === profileId);
    if (found) setCurrentProfileState(found);

    fetchAllMedia().then(setMediaCatalog).catch(console.error);
  }, []);`);

fs.writeFileSync('src/context/AppContext.tsx', code);
