import { ingestRecentCompetitiveMatches } from "@/lib/ingestion";

const limit = Number(process.argv[2] ?? 20);

ingestRecentCompetitiveMatches(limit)
  .then((run) => {
    console.log(`Ingestion ${run.status}: imported=${run.imported} skipped=${run.skipped}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
