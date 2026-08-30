const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

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
