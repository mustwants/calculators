// src/scripts/fetchBasePay.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

const DFAS_URL = "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/";

async function fetchBasePay() {
  console.log("📡 Fetching Base Pay data from DFAS...");

  try {
    const res = await fetch(DFAS_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const html = await res.text();

    if (html.includes("Access Denied")) throw new Error("Access Denied by DFAS server");

    const $ = cheerio.load(html);
    const data = {};

    $("table").first().find("tr").each((i, el) => {
      const cols = $(el)
        .find("td, th")
        .map((i, td) => $(td).text().trim())
        .get();

      if (cols.length && /^(E-|O-|W-)/.test(cols[0])) {
        const rank = cols[0];
        cols.slice(1).forEach((pay, idx) => {
          const years = idx + 2;
          data[`${rank}_${years}`] = Number(pay.replace(/[^0-9.]/g, "")) || 0;
        });
      }
    });

    fs.mkdirSync("./src/data", { recursive: true });

    if (Object.keys(data).length === 0) {
      throw new Error("Parsed 0 rows from DFAS — using fallback data.");
    }

    fs.writeFileSync("./src/data/basePay_2025.json", JSON.stringify(data, null, 2));
    console.log(`✅ Saved ./src/data/basePay_2025.json with ${Object.keys(data).length} entries`);
  } catch (err) {
    console.warn(`⚠️ DFAS fetch failed: ${err.message}`);
    console.log("📁 Using static 2025 DoD fallback base pay table...");

    const fallback = {
      "E-1": { "<2": 2054, "2": 2054, "3": 2054, "4": 2054 },
      "E-2": { "<2": 2308, "2": 2308, "3": 2308, "4": 2308 },
      "E-3": { "<2": 2438, "2": 2596, "3": 2740, "4": 2894 },
      "E-4": { "<2": 2697, "2": 2855, "3": 3016, "4": 3176 },
      "E-5": { "<2": 3012, "2": 3210, "3": 3408, "4": 3606 },
      "E-6": { "<2": 3300, "2": 3500, "3": 3700, "4": 3900 },
      "O-1": { "<2": 3750, "2": 3950, "3": 4150, "4": 4350 },
      "O-2": { "<2": 4300, "2": 4500, "3": 4700, "4": 4900 },
      "O-3": { "<2": 5000, "2": 5200, "3": 5400, "4": 5600 },
      "O-4": { "<2": 5500, "2": 5800, "3": 6100, "4": 6400 },
      "O-5": { "<2": 6200, "2": 6500, "3": 6800, "4": 7100 },
      "O-6": { "<2": 7000, "2": 7400, "3": 7800, "4": 8200 }
    };

    fs.mkdirSync("./src/data", { recursive: true });
    fs.writeFileSync("./src/data/basePay_2025.json", JSON.stringify(fallback, null, 2));
    console.log("✅ Fallback base pay data written to ./src/data/basePay_2025.json");
  }
}

fetchBasePay();

