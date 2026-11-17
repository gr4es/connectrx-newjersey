// Builds data/nj-legislators.json: each NJ legislative district's State Senator and
// two Assembly members, with their official @njleg.org email addresses.
//
// Source: Open States current legislators for New Jersey (public domain)
//   https://data.openstates.org/people/current/nj.csv
// Re-run after elections, appointments, or resignations:
//   curl -o nj.csv https://data.openstates.org/people/current/nj.csv
//   node scripts/build-legislators.mjs nj.csv
// Then spot-check a few districts against https://www.njleg.gov/legislative-roster

import { readFileSync, writeFileSync } from "node:fs";

const [csvPath] = process.argv.slice(2);
if (!csvPath) {
  console.error("Usage: node scripts/build-legislators.mjs <nj.csv>");
  process.exit(1);
}

// Minimal RFC 4180 CSV parser (quoted fields may contain commas, quotes, newlines).
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

const people = parseCsv(readFileSync(csvPath, "utf8"));
const districts = {};
for (const p of people) {
  const d = Number(p.current_district);
  if (!d) continue;
  districts[d] ??= { senator: null, assembly: [] };
  const person = {
    name: p.name,
    email: p.email.toLowerCase(),
    // Official title: NJ Assembly emails use asm (Assemblyman) / asw (Assemblywoman).
    gender: p.email.startsWith("asw") || p.gender === "Female" ? "f" : "m",
  };
  if (p.current_chamber === "upper") districts[d].senator = person;
  else if (p.current_chamber === "lower") districts[d].assembly.push(person);
}

const problems = [];
for (let d = 1; d <= 40; d++) {
  const x = districts[d];
  if (!x || !x.senator || x.assembly.length !== 2) problems.push(d);
  else x.assembly.sort((a, b) => a.name.split(" ").at(-1).localeCompare(b.name.split(" ").at(-1)));
}
if (problems.length) {
  console.error(`Incomplete districts (vacancy or data gap): ${problems.join(", ")}`);
  process.exit(1);
}

writeFileSync(
  new URL("../data/nj-legislators.json", import.meta.url),
  JSON.stringify(
    {
      source: "Open States (data.openstates.org/people/current/nj.csv)",
      generated: new Date().toISOString().slice(0, 10),
      districts,
    },
    null,
    2,
  ) + "\n",
);
console.log(`wrote data/nj-legislators.json: ${people.length} legislators in 40 districts`);
