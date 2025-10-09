// PATH: src/scripts/convertStateJsonToJs.js
// Converts src/data/stateTaxAndBenefits.js (even if it has comments/trailing commas)
// into a strict ESM module at src/data/stateTaxAndBenefits.js
import fs from "fs";

const SRC_JSON = "src/data/stateTaxAndBenefits.js";
const OUT_JS   = "src/data/stateTaxAndBenefits.js";

function read(path) {
  try { return fs.readFileSync(path, "utf8"); }
  catch (e) {
    console.error(`❌ Cannot read ${path}: ${e.message}`);
    process.exit(1);
  }
}

// Remove // line comments, /* block comments */, and trailing commas before } or ]
function sanitizeJsonLike(s) {
  // strip BOM
  s = s.replace(/^\uFEFF/, "");
  // block comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  // line comments
  s = s.replace(/(^|\s)\/\/.*$/gm, (m) => (m.startsWith("http") ? m : ""));
  // trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");
  return s.trim();
}

const raw = read(SRC_JSON);
const clean = sanitizeJsonLike(raw);

let obj;
try {
  obj = JSON.parse(clean);
} catch (e) {
  console.error("❌ Failed to parse stateTaxAndBenefits.js after sanitizing.");
  console.error(e.message);
  process.exit(1);
}

const header = `// PATH: ${OUT_JS}
// Auto-generated from ${SRC_JSON}. Do not edit by hand.
// If you need to modify data, edit the JSON and re-run: npm run fix:state-data

`;
const body = `const DATA = ${JSON.stringify(obj, null, 2)};

export default DATA;
`;

try {
  fs.writeFileSync(OUT_JS, header + body, "utf8");
  console.log(`✅ Wrote ${OUT_JS} (ESM export)`);
} catch (e) {
  console.error(`❌ Failed to write ${OUT_JS}: ${e.message}`);
  process.exit(1);
}
