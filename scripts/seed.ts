import { runValidation } from "./validate.js";

/**
 * Seed verification and generator runner.
 * In Phase 1, verifies that the default synthetic example data is present,
 * complete, and ready for CI testing and demo usage.
 */
async function main() {
  console.log("🌱 Checking synthetic seed dataset...");
  const { success, stats } = await runValidation();

  if (!success) {
    console.error("Seed dataset is invalid.");
    process.exit(1);
  }

  console.log(`✨ Seed dataset verified successfully (${stats.filesChecked} files ready).`);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
