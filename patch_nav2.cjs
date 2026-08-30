const fs = require('fs');
let code = fs.readFileSync('src/components/navigation/Navbar.tsx', 'utf8');

// Ensure User icon is imported from lucide-react if not already
if (!code.includes('User,')) {
    code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, User, Settings } from 'lucide-react';");
}

const targetButton = `          {/* User Profile Switcher */}
          <button
            ref={profileBtn.ref}
            onClick={() => setIsProfileModalOpen(true)}
            className={\`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-all cursor-pointer \${
              profileBtn.isFocused
                ? 'bg-white text-zinc-950 scale-105 ring-2 ring-white'
                : 'hover:bg-zinc-800/60 text-zinc-200'
            }\`}
            data-focused={profileBtn.isFocused}
            aria-label="User Profile and Settings"
          >
            <img
              src={currentProfile.avatarUrl}
              alt={currentProfile.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-600"
            />
            <span className="text-xs font-semibold hidden md:inline">{currentProfile.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>`;

const replacementButton = `          {/* User Profile Switcher */}
          <button
            ref={profileBtn.ref}
            onClick={() => setIsProfileModalOpen(true)}
            className={\`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer \${
              profileBtn.isFocused
                ? 'bg-white text-zinc-950 scale-105 ring-2 ring-white'
                : 'bg-zinc-900/80 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-200'
            }\`}
            data-focused={profileBtn.isFocused}
            aria-label="Settings"
          >
            <User className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold hidden md:inline">Guest</span>
            <Settings className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>`;

code = code.replace(targetButton, replacementButton);
fs.writeFileSync('src/components/navigation/Navbar.tsx', code);
