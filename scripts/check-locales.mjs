// Verifies every locale file has exactly the same keys (and array lengths) as en.json.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "locales");
const load = (f) => JSON.parse(readFileSync(join(dir, f), "utf8"));

function shape(node, path = "", out = new Map()) {
  if (Array.isArray(node)) {
    out.set(path, `array(${node.length})`);
    node.forEach((v, i) => shape(v, `${path}[${i}]`, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) shape(v, path ? `${path}.${k}` : k, out);
  } else {
    out.set(path, typeof node);
  }
  return out;
}

function placeholders(node, path = "", out = new Map()) {
  if (typeof node === "string") out.set(path, [...node.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(","));
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) placeholders(v, path ? `${path}.${k}` : k, out);
  return out;
}

const en = load("en.json");
const ref = shape(en);
const refPh = placeholders(en);
let failed = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "en.json")) {
  const data = load(file);
  const s = shape(data);
  const ph = placeholders(data);
  const problems = [];
  for (const [k, v] of ref) {
    if (!s.has(k)) problems.push(`missing ${k}`);
    else if (s.get(k) !== v) problems.push(`type mismatch ${k}: ${s.get(k)} vs ${v}`);
  }
  for (const k of s.keys()) if (!ref.has(k)) problems.push(`extra ${k}`);
  for (const [k, v] of refPh) if (ph.has(k) && ph.get(k) !== v) problems.push(`placeholder mismatch ${k}: {${ph.get(k)}} vs {${v}}`);
  if (problems.length) {
    failed = true;
    console.error(`✗ ${file}\n  ${problems.join("\n  ")}`);
  } else {
    console.log(`✓ ${file}`);
  }
}

process.exit(failed ? 1 : 0);
