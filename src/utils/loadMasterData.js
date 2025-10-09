// PATH: src/utils/loadMasterData.js
export async function loadMasterData() {
  const res = await fetch("/data/masterData.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load masterData.json: ${res.status}`);
  return res.json();
}
