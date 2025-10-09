// src/scripts/fetchDisabilityRates.js
import fetch from "node-fetch";
import fs from "fs";

const API_KEY = "8jEwOTajB5KpQ5Go3r5cYLFMPhGS2U7X";
const ENDPOINT = "https://sandbox-api.va.gov/services/benefits-reference-data/v1/disability-ratings";

async function fetchDisabilityRates() {
  console.log("📡 Fetching VA Disability Rates from Sandbox API...");

  try {
    const res = await fetch(ENDPOINT, {
      headers: {
        apikey: API_KEY,
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      const msg = `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`Failed to fetch VA disability rates (${msg})`);
    }

    const data = await res.json();

    // Create output folder and write file
    fs.mkdirSync("./src/data", { recursive: true });
    fs.writeFileSync(
      "./src/data/disabilityRates_2025.json",
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Saved ./src/data/disabilityRates_2025.json with ${Array.isArray(data) ? data.length : Object.keys(data).length} entries`);
  } catch (err) {
    console.error("❌ Failed to fetch VA disability rates:", err.message);

    // Fallback static dataset (guarantees your build works)
    const fallback = [
      { rating: 10, monthly: 171 },
      { rating: 20, monthly: 338 },
      { rating: 30, monthly: 524 },
      { rating: 40, monthly: 755 },
      { rating: 50, monthly: 1075 },
      { rating: 60, monthly: 1361 },
      { rating: 70, monthly: 1716 },
      { rating: 80, monthly: 1995 },
      { rating: 90, monthly: 2241 },
      { rating: 100, monthly: 3737 }
    ];

    fs.mkdirSync("./src/data", { recursive: true });
    fs.writeFileSync(
      "./src/data/disabilityRates_2025.json",
      JSON.stringify(fallback, null, 2)
    );

    console.log("⚠️ Used fallback disability rates (static 2025 table).");
  }
}

fetchDisabilityRates();


