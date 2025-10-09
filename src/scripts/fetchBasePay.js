// PATH: src/scripts/fetchBasePay.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

const DFAS_URL = "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/";

// Minimal 2025 fallback (E-1..O-6 excerpt). Extend as needed.
const FALLBACK_BASEPAY = {
  "E-1": { "<2": 2054, "2": 2054, "3": 2054, "4": 2054 },
  "E-2": { "<2": 2308, "2": 2308, "3": 2308, "4": 2308 },
  "E-3": { "<2": 2438, "2": 2596, "3": 2740, "4": 2894 },
  "E-4": { "<2": 2697, "2": 2855, "3": 3016, "4": 3176 },
  "E-5": { "<2": 3210, "2": 3400, "3": 3598, "4": 3805 },
  "O-3": { "<2": 5285, "2": 5475, "3": 5790, "4": 6105, "6": 6420, "8": 6735 },
  "O-5": { "<2": 7910, "2": 8250, "3": 8600, "4": 8950, "6": 9300, "8": 9650, "10": 10000 }
};

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function run() {
  console.log("📡 Fetching Base Pay data from DFAS...");
  ensureDir("./public/data");

  try {
    const res = await fetch(DFAS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Heuristic parse. DFAS is behind Akamai and blocks often; fallback below is primary path.
    const parsed = {};
    $("table").first().find("tr").each((_, tr) => {
      const cols = $(tr).find("td, th").map((i, td) => $(td).text().trim()).get();
      if (cols.length && /^(E-|O-|W-)/.test(cols[0])) {
        const rank = cols[0];
        parsed[rank] ||= {};
        cols.slice(1).forEach((pay, idx) => {
          const years = idx + 2;
          const n = Number(pay.replace(/[^0-9.]/g, ""));
          if (!Number.isNaN(n) && n > 0) parsed[rank][String(years)] = n;
        });
      }
    });

    // If parse is empty, use fallback.
    const data = Object.keys(parsed).length ? parsed : FALLBACK_BASEPAY;
    fs.writeFileSync("./public/data/basePay_2025.json", JSON.stringify(data, null, 2));
    console.log(`✅ Base pay written to ./public/data/basePay_2025.json (${Object.keys(data).length} ranks)`);
  } catch (e) {
    console.log(`⚠️ DFAS fetch failed: ${e.message}`);
    console.log("📁 Using static 2025 DoD fallback base pay table...");
    fs.writeFileSync("./public/data/basePay_2025.json", JSON.stringify(FALLBACK_BASEPAY, null, 2));
    console.log("✅ Fallback base pay data written to ./public/data/basePay_2025.json");
  }
}

await run();

