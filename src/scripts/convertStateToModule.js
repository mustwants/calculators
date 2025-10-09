// PATH: src/scripts/convertStateToModule.js
// Makes sure src/data/stateTaxAndBenefits.js is a valid ESM module exporting DATA.
// If only JSON exists (with comments/trailing commas), it sanitizes and converts.

import fs from "fs";
import path from "path";

const JSON_PATH = "src/data/stateTaxAndBenefits.js";
const JS_PATH   = "src/data/stateTaxAndBenefits.js";

function readIfExists(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}
function sanitizeJsonLike(s) {
  s = s.replace(/^\uFEFF/, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");     // block comments
  s = s.replace(/(^|[^:])\/\/.*$/gm, "$1");   // line comments (not URLs in values)
  s = s.replace(/,\s*([}\]])/g, "$1");        // trailing comma
  return s.trim();
}
function writeModule(obj) {
  const header = `// PATH: ${JS_PATH}
// Auto-generated. Edit the source JSON/JS and re-run: npm run fix:state-data

`;
  const body = `const DATA = ${JSON.stringify(obj, null, 2)};

export default DATA;
`;
  fs.writeFileSync(JS_PATH, header + body, "utf8");
  console.log(`✅ Wrote ${JS_PATH}`);
}

const jsonRaw = readIfExists(JSON_PATH);
if (jsonRaw !== null) {
  const clean = sanitizeJsonLike(jsonRaw);
  const obj = JSON.parse(clean);
  writeModule(obj);
  process.exit(0);
}

// If no JSON, try JS that is actually raw JSON text
const jsRaw = readIfExists(JS_PATH);
if (jsRaw === null) {
  console.error(`❌ Neither ${JSON_PATH} nor ${JS_PATH} found.`);
  process.exit(1);
}

// If file already looks like an ESM export, keep it.
if (/export\s+default\s+/.test(jsRaw) || /const\s+DATA\s*=/.test(jsRaw)) {
  console.log(`ℹ️ ${JS_PATH} already looks like an ESM module. No changes.`);
  process.exit(0);
}

// Otherwise try to parse as JSON-like and wrap.
try {
  const clean = sanitizeJsonLike(jsRaw);
  const obj = JSON.parse(clean);
  writeModule(obj);
} catch (e) {
  console.error(`❌ ${JS_PATH} is not valid JSON-like and lacks an export.\n` +
                `Open it and ensure it exports: "export default { ... }".`);
  process.exit(1);
}
