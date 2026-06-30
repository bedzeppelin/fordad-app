import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Unauthenticated on purpose: the login screen shows "Manage {patientName}'s
// daily care plan" before the admin is signed in. Only the patient's first
// name is exposed here — nothing sensitive.
export async function GET() {
  const { data } = await supabaseAdmin.from("admin_settings").select("patient_name").eq("id", 1).maybeSingle();
  return NextResponse.json({ patient_name: data?.patient_name ?? "Dad" });
}
