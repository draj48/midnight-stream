const fs = require('fs');
let code = fs.readFileSync('src/data/mockMedia.ts', 'utf8');

const target = `export const USER_PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Alex (Main)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isKids: false,
  },
  {
    id: 'user-2',
    name: 'Sarah',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isKids: false,
  },
  {
    id: 'user-3',
    name: 'Kids Zone',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
    isKids: true,
  },
  {
    id: 'user-4',
    name: 'Cinema 4K',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    isKids: false,
  }
];`;

const replacement = `export const USER_PROFILES: UserProfile[] = [
  {
    id: 'guest',
    name: 'Guest',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isKids: false,
  }
];`;

code = code.replace(target, replacement);
fs.writeFileSync('src/data/mockMedia.ts', code);
