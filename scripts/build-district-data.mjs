// Builds data/nj-districts.json: NJ ZIP code → towns → legislative district.
//
// Sources (all U.S. Census Bureau, public domain):
//   1. Gazetteer county subdivisions for NJ (towns + interior points)
//      https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_gaz_cousubs_34.txt
//   2. 2020 ZCTA ↔ county subdivision relationship file (which towns each ZIP covers)
//      https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_cousub20_natl.txt
//   3. Census Geocoder, current State Legislative Districts layer (district at a point)
//      https://geocoding.geo.census.gov/geocoder/
//
// NJ legislative districts are built from whole municipalities; the state constitution
// only allows splitting a town larger than one fortieth of the state (Newark, Jersey City).
// So each town gets one district from its interior point, and those two cities are sampled
// on a grid to find every district they touch.
//
// Usage: node scripts/build-district-data.mjs <gazetteer.txt> <zcta_cousub.txt>

import { readFileSync, writeFileSync } from "node:fs";

const [gazPath, relPath] = process.argv.slice(2);
if (!gazPath || !relPath) {
  console.error("Usage: node scripts/build-district-data.mjs <gazetteer.txt> <zcta_cousub.txt>");
  process.exit(1);
}

const COUNTIES = {
  "001": "Atlantic", "003": "Bergen", "005": "Burlington", "007": "Camden", "009": "Cape May",
  "011": "Cumberland", "013": "Essex", "015": "Gloucester", "017": "Hudson", "019": "Hunterdon",
  "021": "Mercer", "023": "Middlesex", "025": "Monmouth", "027": "Morris", "029": "Ocean",
  "031": "Passaic", "033": "Salem", "035": "Somerset", "037": "Sussex", "039": "Union", "041": "Warren",
};
const SPLIT_CITIES = ["Newark city", "Jersey City city"];

// "Absecon city" → "Absecon City"; "Atlantic City city" → "Atlantic City"; "Princeton municipality" → "Princeton"
function displayName(namelsad) {
  const m = namelsad.match(/^(.*) (city|township|borough|town|village|municipality)$/);
  if (!m) return namelsad;
  const [, base, type] = m;
  if (type === "municipality") return base;
  const Type = type[0].toUpperCase() + type.slice(1);
  return base.endsWith(` ${Type}`) ? base : `${base} ${Type}`;
}

// ---- 1. Towns --------------------------------------------------------------
const towns = readFileSync(gazPath, "utf8")
  .split("\n")
  .slice(1)
  .map((l) => l.split("\t").map((s) => s.trim()))
  .filter((c) => c[1] && !c[3].startsWith("County subdivisions not defined"))
  .map((c) => ({
    id: c[1],
    namelsad: c[3],
    name: displayName(c[3]),
    county: COUNTIES[c[1].slice(2, 5)],
    lat: Number(c[9]),
    lon: Number(c[10]),
    aland: Number(c[5]),
  }));
console.log(`towns: ${towns.length}`);

// ---- 2. District per town ---------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function lookup(lat, lon, tries = 4) {
  const url =
    `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}` +
    `&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(String(res.status));
      const g = (await res.json()).result.geographies;
      const key = Object.keys(g).find((k) => /State Legislative Districts - Upper/.test(k));
      const sld = key && g[key][0];
      const cousub = g["County Subdivisions"]?.[0];
      return { district: sld ? Number(sld.BASENAME) : null, cousub: cousub?.GEOID ?? null };
    } catch {
      await sleep(1000 * (i + 1));
    }
  }
  return { district: null, cousub: null };
}

async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

let done = 0;
await pool(towns, 8, async (t) => {
  const { district } = await lookup(t.lat, t.lon);
  t.districts = district ? [district] : [];
  if (++done % 50 === 0) console.log(`  ${done}/${towns.length}`);
});

// Split cities: sample a grid around the interior point, keep points inside the city.
for (const t of towns.filter((x) => SPLIT_CITIES.includes(x.namelsad))) {
  const found = new Set(t.districts);
  const span = 0.09; // degrees; both cities fit well inside this box
  const pts = [];
  for (let a = -span; a <= span + 1e-9; a += span / 6)
    for (let b = -span; b <= span + 1e-9; b += span / 6) pts.push([t.lat + a, t.lon + b]);
  await pool(pts, 8, async ([la, lo]) => {
    const r = await lookup(la.toFixed(6), lo.toFixed(6));
    if (r.cousub === t.id && r.district) found.add(r.district);
  });
  t.districts = [...found].sort((a, b) => a - b);
  console.log(`  ${t.name}: districts ${t.districts.join(", ")}`);
}

const missing = towns.filter((t) => !t.districts.length);
if (missing.length) console.warn(`WARNING: no district for ${missing.map((t) => t.name).join(", ")}`);

// ---- 3. ZIP → towns ---------------------------------------------------------
const townIds = new Set(towns.map((t) => t.id));
const townById = Object.fromEntries(towns.map((t) => [t.id, t]));
const zips = {};
for (const line of readFileSync(relPath, "utf8").split("\n").slice(1)) {
  const c = line.split("|");
  const zip = c[1], cousub = c[9];
  if (!zip || !townIds.has(cousub)) continue;
  const zipLand = Number(c[3]), part = Number(c[16]);
  const town = townById[cousub];
  // Ignore boundary slivers: keep a town if it is a meaningful share of the ZIP or of the town.
  if (part / (zipLand || 1) < 0.03 && part / (town.aland || 1) < 0.2) continue;
  (zips[zip] ??= []).push(cousub);
}
console.log(`zips: ${Object.keys(zips).length}`);

const out = {
  source: "U.S. Census Bureau: 2024 Gazetteer, 2020 ZCTA-county subdivision relationship file, Census Geocoder (current State Legislative Districts)",
  generated: new Date().toISOString().slice(0, 10),
  towns: Object.fromEntries(
    towns
      .filter((t) => t.districts.length)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((t) => [t.id, { name: t.name, county: t.county, districts: t.districts }]),
  ),
  zips,
};
writeFileSync(new URL("../data/nj-districts.json", import.meta.url), JSON.stringify(out));
console.log("wrote data/nj-districts.json");
