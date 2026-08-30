import { MediaCategory, MediaItem, UserProfile } from '../types/media';

export const USER_PROFILES: UserProfile[] = [
  {
    id: 'guest',
    name: 'Guest',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isKids: false,
  }
];

export const CATEGORIES: MediaCategory[] = [
  { id: 'all', label: 'All Categories', description: 'Browse the entire catalog' },
  { id: 'action', label: 'Action & Adventure', description: 'High-octane blockbusters & adrenaline-filled epics' },
  { id: 'scifi', label: 'Sci-Fi & Cyberpunk', description: 'Futuristic worlds, AI anomalies & space odysseys' },
  { id: 'thriller', label: 'Crime & Thriller', description: 'Gripping mysteries, heists & psychological suspense' },
  { id: 'drama', label: 'Drama & Romance', description: 'Emotionally resonant, award-winning narratives' },
  { id: 'anime', label: 'Anime & Animation', description: 'Masterclass animation, fantasy worlds & series' },
  { id: 'comedy', label: 'Comedy', description: 'Laugh-out-loud sitcoms, satire & feel-good cinema' },
  { id: 'documentary', label: 'Documentaries', description: 'Exploration of nature, cosmos, tech & true stories' },
];

const STANDARD_AUDIO_TRACKS = [
  { id: 'en-51', label: 'English [Original] (Dolby Atmos 5.1)', language: 'en', isDefault: true },
  { id: 'es-51', label: 'Español (5.1)', language: 'es' },
  { id: 'fr-51', label: 'Français (5.1)', language: 'fr' },
  { id: 'ja-51', label: '日本語 (Japanese 5.1)', language: 'ja' },
  { id: 'de-51', label: 'Deutsch (5.1)', language: 'de' },
];

const STANDARD_SUBTITLES = [
  { id: 'off', label: 'Off', language: 'none', isOff: true },
  { id: 'en-cc', label: 'English [CC]', language: 'en' },
  { id: 'es-sub', label: 'Español', language: 'es' },
  { id: 'fr-sub', label: 'Français', language: 'fr' },
  { id: 'ja-sub', label: '日本語', language: 'ja' },
  { id: 'de-sub', label: 'Deutsch', language: 'de' },
];

// High reliability stream clips (Blender Foundation 4K/HD open cinematic streams + trailer MP4s)
const STREAM_LINKS = {
  tearsOfSteel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  bigBuckBunny: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  sintel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  elephantsDream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  weAreGoingOnBullrun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  forBiggerBlazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  forBiggerEscapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  forBiggerFun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  forBiggerJoyrides: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  forBiggerMeltdowns: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
};

