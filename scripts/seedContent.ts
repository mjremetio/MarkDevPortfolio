import { seedContentFromDefaults } from "../server/seedContent";

const replaceExisting = process.argv.includes("--force");

seedContentFromDefaults({ replaceExisting })
  .then(({ inserted, updated }) => {
    console.log(
      `[seed:script] Completed. Inserted: ${inserted}, Updated: ${updated}`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("[seed:script] Failed:", error);
    process.exit(1);
  });
