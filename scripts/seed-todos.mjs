// Seeds Dad's default daily todos into the Supabase database.
// Usage: npm run seed:todos
// Safe to run multiple times — skips silently if todos already exist.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const DEFAULT_TODOS = [
  {
    title: "Morning\nmedication",
    short_title: "Morning medication",
    description: "Take your morning tablets with a full glass of water. Best taken first thing before breakfast.",
    hint: "About 2 minutes",
    category_label: "Morning",
    icon: "pill",
    scheduled_time: "08:00",
    recurrence_days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    sort_order: 0,
  },
  {
    title: "Vitamin D",
    short_title: "Vitamin D",
    description: "Take your Vitamin D supplement — best absorbed with a little food or a healthy fat like a handful of nuts.",
    hint: "Just a moment",
    category_label: "Morning",
    icon: "pill",
    scheduled_time: "08:30",
    recurrence_days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    sort_order: 1,
  },
  {
    title: "Eat a\nbanana",
    short_title: "Eat a banana",
    description: "A banana a day is great for your heart and muscles — packed with potassium. A perfect mid-morning snack.",
    hint: "Quick and easy",
    category_label: "Nourishment",
    icon: "bowl",
    scheduled_time: "10:30",
    recurrence_days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    sort_order: 2,
  },
  {
    title: "Short\nwalk",
    short_title: "Short walk",
    description: "Even ten minutes outside does wonders — fresh air, gentle movement, better mood. Take it at your own pace.",
    hint: "At your own pace",
    category_label: "Movement",
    icon: "walk",
    scheduled_time: "14:00",
    recurrence_days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    sort_order: 3,
  },
];

const { count } = await supabase
  .from("todos")
  .select("id", { count: "exact", head: true })
  .eq("active", true);

if (count > 0) {
  console.log(`Todos already exist (${count} active). Skipping seed to avoid duplicates.`);
  console.log("If you want to replace them, delete all todos in Care Admin first, then run this again.");
  process.exit(0);
}

const { error } = await supabase.from("todos").insert(
  DEFAULT_TODOS.map((t) => ({ ...t, active: true }))
);

if (error) {
  console.error("Failed to seed todos:", error.message);
  process.exit(1);
}

console.log(`✓ Seeded ${DEFAULT_TODOS.map((t) => t.short_title).join(", ")}`);
console.log("Open Care Admin → Daily Todos to see and edit them.");
