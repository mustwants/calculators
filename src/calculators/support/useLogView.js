import { supabase } from "../../supabaseClient";

export async function logCalcView(slug) {
  try {
    await supabase.from("calc_views").insert({ slug, viewed_at: new Date().toISOString() });
  } catch {}
}
