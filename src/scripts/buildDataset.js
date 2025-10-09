// PATH: src/scripts/buildDataset.js
import fs from "fs";

function readJSON(path, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

(async function run() {
  console.log("🧩 Building master dataset...");

  ensureDir("./public/data");

  const basePay = readJSON("./public/data/basePay_2025.json", {});
  const disability = readJSON("./public/data/disabilityRates_2025.json", []);

  const dataset = {
    version: "2025.1",
    lastUpdated: new Date().toISOString(),
    basePay,
    disability,
    sbpGuidance: {
      premiumRate: "6.5%",
      paidUpAfter: "30 years AND age 70 (both conditions must be met)",
      survivorBenefit: "55% of covered base amount"
    }
  };

  const tmp = "./public/data/masterData.tmp.json";
  const out = "./public/data/masterData.json";
  fs.writeFileSync(tmp, JSON.stringify(dataset, null, 2));
  fs.renameSync(tmp, out);
  console.log("✅ Built ./public/data/masterData.json");
})();

