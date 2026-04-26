import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

function safeKey(s) {
  return String(s || "").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function getIdentityUserFromContext(context) {
  try {
    const rawNetlifyContext = context?.clientContext?.custom?.netlify;
    if (rawNetlifyContext) {
      const decoded = JSON.parse(Buffer.from(rawNetlifyContext, "base64").toString("utf-8"));
      if (decoded && decoded.user) return decoded.user;
    }
  } catch (e) {}

  return context?.clientContext?.user || null;
}

function buildUserAliases(user) {
  const raw = [
    user?.sub || "",
    user?.id || "",
    user?.email || "",
    user?.email ? String(user.email).toLowerCase() : ""
  ];

  const seen = new Set();
  const aliases = [];
  for (const value of raw) {
    const key = safeKey(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    aliases.push(key);
  }

  if (!aliases.length) aliases.push("user");
  return aliases;
}

function getUpdatedAtMillis(obj) {
  const value = obj && obj.updatedAt ? Date.parse(obj.updatedAt) : NaN;
  return Number.isFinite(value) ? value : 0;
}

async function loadBestState(store, aliases, canonicalKey, canonicalAlias) {
  const loaded = await Promise.all(
    aliases.map(async (alias) => {
      const key = `state-v1-${alias}`;
      const data = await store.get(key, {
        type: "json",
        consistency: "strong"
      });
      return { alias, key, data };
    })
  );

  const found = loaded
    .filter((entry) => entry && entry.data && typeof entry.data === "object")
    .sort((a, b) => getUpdatedAtMillis(b.data) - getUpdatedAtMillis(a.data));

  return found[0] || { alias: canonicalAlias, key: canonicalKey, data: null };
}

export default async (req, context) => {
  const user = (await getUser().catch(() => null)) || getIdentityUserFromContext(context);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const store = getStore("sdac-agenda");
  const aliases = buildUserAliases(user);
  const canonicalAlias = aliases[0];
  const canonicalKey = `state-v1-${canonicalAlias}`;

  try {
    if (req.method === "GET") {
      const best = await loadBestState(store, aliases, canonicalKey, canonicalAlias);

      return json({
        ok: true,
        data: best.data,
        updatedAt: best.data?.updatedAt || null,
        key: best.key,
        usedAlias: best.alias,
        aliasesChecked: aliases,
        email: user.email || null
      });
    }

    if (req.method === "PUT") {
      let body;
      try {
        body = await req.json();
      } catch {
        return json({ ok: false, error: "Invalid JSON body" }, 400);
      }

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return json({ ok: false, error: "Invalid state payload" }, 400);
      }

      const hasConflictToken = Object.prototype.hasOwnProperty.call(body, "baseUpdatedAt");
      const baseUpdatedAt = hasConflictToken ? body.baseUpdatedAt : undefined;
      const payload = body.state && typeof body.state === "object" && !Array.isArray(body.state)
        ? body.state
        : body;

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return json({ ok: false, error: "Invalid state payload" }, 400);
      }

      if (hasConflictToken) {
        const best = await loadBestState(store, aliases, canonicalKey, canonicalAlias);
        const remoteMillis = getUpdatedAtMillis(best.data);
        const baseMillis = baseUpdatedAt ? Date.parse(baseUpdatedAt) : 0;
        const normalizedBaseMillis = Number.isFinite(baseMillis) ? baseMillis : 0;

        if (remoteMillis > normalizedBaseMillis) {
          return json({
            ok: false,
            conflict: true,
            error: "Remote state is newer than the client base state",
            message: "Il cloud contiene modifiche piu recenti. Aggiorna prima di salvare.",
            remoteUpdatedAt: best.data?.updatedAt || null,
            key: best.key,
            data: best.data
          }, 409);
        }
      }

      payload.updatedAt = new Date().toISOString();

      await Promise.all(
        aliases.map((alias) => store.setJSON(`state-v1-${alias}`, payload))
      );

      await store.setJSON("owner-meta", {
        key: canonicalKey,
        aliases,
        email: user.email || null,
        updatedAtUTC: payload.updatedAt
      });

      return json({ ok: true, updatedAt: payload.updatedAt, key: canonicalKey, aliases });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
};
