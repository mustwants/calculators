// src/scripts/buildDataset.js
import fs from "fs";

console.log("🧩 Building master dataset...");

try {
  // Ensure the data folder exists
  fs.mkdirSync("./src/data", { recursive: true });

  // Load input data
  const basePay = JSON.parse(fs.readFileSync("./src/data/basePay_2025.json"));
  const disability = JSON.parse(fs.readFileSync("./src/data/disabilityRates_2025.json"));

  // Build unified dataset
  const dataset = {
    version: "2025.1",
    lastUpdated: new Date().toISOString(),
    basePay,
    disability,
    sbpGuidance: {
      PremiumRate: "6.5%",
      PaidUpAfter: "30 years or age 70, whichever later",
      SurvivorBenefit: "55% of base pay for life"
    }
  };

  // Write combined data file
  fs.writeFileSync("./src/data/masterData.json", JSON.stringify(dataset, null, 2));

  console.log("✅ Built ./src/data/masterData.json successfully");
} catch (err) {
  console.error("❌ Error building master dataset:", err.message);
}

