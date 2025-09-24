import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://p4b7ht5p18-dsn.algolia.net/1/indexes/songs_prod/query";
const HEADERS = {
  "x-algolia-api-key": process.env.ALGOLIA_API_KEY,
  "x-algolia-application-id": process.env.ALGOLIA_APP_ID,
  "Referer": process.env.REFERER,
  "Content-Type": "application/json"
};

let totalGlobal = 0;

const songTypes = [
  "Ending", "Insert", "Opening", "OST", "Character Song",
  "Music Video", "Vocal Album", "Theme song", "Image Song",
  "Other", "PV Song"
];

async function getSeasons() {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      facets: ["season"],
      maxValuesPerFacet: 1000,
      query: ""
    })
  });

  const data = await res.json();
  return Object.keys(data.facets.season || {});
}

async function fetchHits(season, songType) {
  const filters = songType ? [`season:${season}`, `song_type:${songType}`] : [`season:${season}`];

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      query: "",
      hitsPerPage: 1000,
      page: 0,
      facetFilters: filters
    })
  });

  const data = await res.json();
  return { hits: data.hits || [], nbHits: data.nbHits || 0 };
}

async function scrapeSeason(season) {
  let allHits = [];
  const seen = new Set();

  const { hits, nbHits } = await fetchHits(season);

  if (nbHits <= 1000) {
    hits.forEach(h => seen.add(h.objectID));
    allHits = hits;
    console.log(`✅ Save ${season} (${hits.length} hits)`);
  } else {
    console.log(`⚠️ ${season} has ${nbHits} hits, splitting by song_type...`);
    for (const type of songTypes) {
      const { hits: subHits } = await fetchHits(season, type);
      let newHits = 0;
      for (const h of subHits) {
        if (!seen.has(h.objectID)) {
          seen.add(h.objectID);
          allHits.push(h);
          newHits++;
        }
      }
      if (newHits > 0) {
        console.log(`   ➕ ${season} + ${type}: ${newHits} new hits`);
      }
    }
    console.log(`✅ Save ${season} (${allHits.length} unique hits)`);
  }

  const safeName = season.replace(/\s+/g, "_");
  fs.writeFileSync(
    path.join("./output", `${safeName}.json`),
    JSON.stringify(allHits, null, 2)
  );

  totalGlobal += allHits.length;
}

(async () => {
  if (!fs.existsSync("./output")) fs.mkdirSync("./output");

  const seasons = await getSeasons();
  console.log("Seasons found:", seasons);

  for (const season of seasons) {
    await scrapeSeason(season);
  }

  console.log(`\n-->Total global de hits: ${totalGlobal}`);
})();
