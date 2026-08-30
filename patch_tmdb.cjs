const fs = require('fs');
let code = fs.readFileSync('src/services/tmdb.ts', 'utf8');

const replacement = `export const fetchMediaDetails = async (mediaId: string, type: 'movie' | 'tv'): Promise<Partial<MediaItem>> => {
  const tmdbId = mediaId.replace('tmdb-', '');
  
  try {
    const details = await fetchFromTMDB(\`/\${type}/\${tmdbId}\`, { append_to_response: 'credits' });
    const cast = details.credits?.cast?.slice(0, 6).map((c: any) => c.name) || [];
    const director = details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown';
    const creators = details.created_by?.map((c: any) => c.name) || [];
    
    const update: Partial<MediaItem> = {
      cast,
      director,
      creators,
      description: details.overview || 'No description available.',
      duration: type === 'movie' && details.runtime ? \`\${Math.floor(details.runtime / 60)}h \${details.runtime % 60}m\` : (type === 'tv' ? \`\${details.number_of_seasons || 1} Seasons\` : undefined),
    };

    // If TV, fetch season 1 real episodes
    if (type === 'tv' && details.number_of_seasons > 0) {
      try {
        const season1 = await fetchFromTMDB(\`/tv/\${tmdbId}/season/1\`);
        if (season1 && season1.episodes) {
          update.seasons = [
            {
              seasonNumber: 1,
              title: season1.name || 'Season 1',
              episodes: season1.episodes.map((ep: any) => ({
                id: \`ep-\${ep.id}\`,
                seasonNumber: 1,
                episodeNumber: ep.episode_number,
                title: ep.name,
                description: ep.overview || 'No episode description.',
                thumbnailUrl: ep.still_path ? \`https://image.tmdb.org/t/p/w500\${ep.still_path}\` : (details.backdrop_path ? \`https://image.tmdb.org/t/p/w500\${details.backdrop_path}\` : ''),
                duration: \`\${ep.runtime || 45}m\`,
                streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              }))
            }
          ];
        }
      } catch (e) {
        console.error('Error fetching season details', e);
      }
    }
    
    return update;
  } catch (error) {
    console.error('Error fetching media details:', error);
    return {};
  }
};`;

code = code.replace(/export const fetchMediaDetails = async[\s\S]*?;\n\s*\n\};/, replacement);
fs.writeFileSync('src/services/tmdb.ts', code);
