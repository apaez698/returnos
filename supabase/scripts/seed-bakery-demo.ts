#!/usr/bin/env node
/**
 * Bakery Demo Seed Script
 *
 * Usage:
 *   npm run seed:bakery
 *
 * Environment Variables:
 *   Loads from .env.local automatically
 *   - NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 *
 * This script seeds the bakery demo dataset idempotently.
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { seedBakeryDemo } from "../../services/demo/seed-bakery-demo";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function main() {
  // Load environment variables (support both NEXT_PUBLIC_ and plain prefixes)
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Error: Missing required environment variables SUPABASE_URL or SUPABASE_ANON_KEY",
    );
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // Run seed
  const summary = await seedBakeryDemo(supabase);

  // Print detailed results
  console.log(
    "\n═══════════════════════════════════════════════════════════════",
  );
  console.log("                   SEED OPERATION SUMMARY");
  console.log(
    "═══════════════════════════════════════════════════════════════\n",
  );

  console.log(`Status: ${summary.success ? "✓ SUCCESS" : "✗ FAILED"}`);
  console.log(`Timestamp: ${summary.timestamp}`);
  console.log(`Total New Records: ${summary.totalRecords}`);

  console.log("\nOperations Breakdown:");
  console.log("─────────────────────────────────────────────────────────────");

  const tables = Object.entries(summary.operations) as Array<
    [string, (typeof summary.operations)[keyof typeof summary.operations]]
  >;

  for (const [tableName, operation] of tables) {
    console.log(`\n${tableName.replace(/_/g, " ").toUpperCase()}:`);
    console.log(`  Inserted: ${operation.inserted}`);
    console.log(`  Skipped:  ${operation.skipped}`);

    if (operation.errors && operation.errors.length > 0) {
      console.log(`  Errors:   ${operation.errors.length}`);
      for (const error of operation.errors) {
        console.log(`    • ${error}`);
      }
    }
  }

  // Print global errors if any
  if (summary.errors.length > 0) {
    console.log(
      "\n─────────────────────────────────────────────────────────────",
    );
    console.log("Global Errors:");
    for (const error of summary.errors) {
      console.log(`  • ${error}`);
    }
  }

  console.log(
    "\n═══════════════════════════════════════════════════════════════\n",
  );

  // Exit with appropriate code
  process.exit(summary.success ? 0 : 1);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
