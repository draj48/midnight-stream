import { fetchAllMedia } from './src/services/tmdb.ts';
async function test() {
  try {
    const data = await fetchAllMedia();
    console.log("Data length:", data.length);
    if (data.length === 0) console.log("Empty data!");
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
