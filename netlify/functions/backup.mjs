import { getStore } from "@netlify/blobs";

const SHARED_STATE_KEY = "state-v2-shared-sdac";

export default async () => {
  const store = getStore({ name: "sdac-agenda", consistency: "strong" });

  // Il nuovo archivio e condiviso tra tutti gli account SDAC autorizzati.
  // Finche non e avvenuta la prima migrazione, manteniamo un fallback
  // alla vecchia chiave owner-meta per non interrompere i backup.
  let stateKey = SHARED_STATE_KEY;
  let state = await store.get(stateKey, { type: "json" });

  if (!state) {
    const legacyMeta = await store.get("owner-meta", { type: "json" });
    stateKey = legacyMeta?.key || null;
    if (!stateKey) return;
    state = await store.get(stateKey, { type: "json" });
  }

  if (!state) return;

  const d = new Date();
  const ymd = d.toISOString().slice(0, 10);
  const backupKey = `backups/${ymd}.json`;

  await store.setJSON(backupKey, {
    backedUpAtUTC: d.toISOString(),
    stateKey,
    state
  });
};

// Eseguita quotidianamente dal cron Netlify (UTC).
export const config = {
  schedule: "@daily"
};
