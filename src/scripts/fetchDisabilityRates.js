// PATH: src/scripts/fetchDisabilityRates.js
import fetch from "node-fetch";
import fs from "fs";

const API_KEY = "8jEwOTajB5KpQ5Go3r5cYLFMPhGS2U7X";
const ENDPOINT = "https://sandbox-api.va.gov/services/benefits-reference-data/v1/disability-ratings";

// 2025 fallback simplified schedule. Replace with full table if needed.
const FALLBACK = [
  { rating: 10, monthly: 171 },
  { rating: 20, monthly: 338 },
  { rating: 30, monthly: 524 },
  { rating: 40, monthly: 755 },
  { rating: 50, monthly: 1075 },
  { rating: 60, monthly: 1361 },
  { rating: 70, monthly: 1716 },
  { rating: 80, monthly: 1995 },
  { rating: 90, monthly: 2242 },
  { rating: 100, monthly: 3737 }
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function run() {
  console.log("📡 Fetching VA Disability Rates from Sandbox API...");
  ensureDir("./public/data");

  try {
    const res = await fetch(ENDPOINT, {
      headers: { apikey: API_KEY, Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();

    fs.writeFileSync("./public/data/disabilityRates_2025.json", JSON.stringify(data, null, 2));
    console.log("✅ Saved ./public/data/disabilityRates_2025.json");
  } catch (e) {
    console.log(`❌ Failed to fetch VA disability rates: ${e.message}`);
    console.log("⚠️ Using fallback disability rates (static 2025 table).");
    fs.writeFileSync("./public/data/disabilityRates_2025.json", JSON.stringify(FALLBACK, null, 2));
    console.log("✅ Fallback saved ./public/data/disabilityRates_2025.json");
  }
}

await run();


