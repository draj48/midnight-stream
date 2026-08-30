const fs = require('fs');
let code = fs.readFileSync('src/components/profile/ProfileModal.tsx', 'utf8');

const targetHeader = `<div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Who's Watching?</h2>
            <span className="text-xs text-zinc-400">Manage Profiles & TV Settings</span>
          </div>`;
          
const replacementHeader = `<div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <span className="text-xs text-zinc-400">TV Display & Playback Preferences</span>
          </div>`;

code = code.replace(targetHeader, replacementHeader);

const targetGrid = `        {/* Profile Grid */}
        <div className="my-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {USER_PROFILES.map(profile => {
              const isActive = currentProfile.id === profile.id;
              return (
                <div
                  key={profile.id}
                  onClick={() => setCurrentProfile(profile)}
                  className={\`group flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 \${
                    isActive
                      ? 'bg-red-600/15 border-red-500 scale-105 shadow-lg shadow-red-950/40 ring-2 ring-red-500'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                  }\`}
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      {profile.name}
                    </h4>
                    {profile.isKids && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded">
                        KIDS
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>`;

code = code.replace(targetGrid, '');

fs.writeFileSync('src/components/profile/ProfileModal.tsx', code);
