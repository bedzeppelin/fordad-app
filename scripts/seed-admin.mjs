// Sets (or resets) the Care Admin password and patient name.
// Usage: npm run seed:admin -- --password "yourPassword" [--name "Dad"]
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

function getArg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const password = getArg("--password", null);
const patientName = getArg("--name", "Dad");

if (!password) {
  console.error('Usage: npm run seed:admin -- --password "yourPassword" [--name "Dad"]');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

const hash = await bcrypt.hash(password, 12);

const { error } = await supabase
  .from("admin_settings")
  .upsert({ id: 1, admin_password_hash: hash, patient_name: patientName }, { onConflict: "id" });

if (error) {
  console.error("Failed to set admin password:", error.message);
  process.exit(1);
}

console.log(`Admin password set. Patient name: "${patientName}". You can now log in at /admin/login.`);
