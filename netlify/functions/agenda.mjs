import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

const SHARED_STATE_KEY = "state-v2-shared-sdac";
const SHARED_META_KEY = "state-v2-shared-sdac-meta";
const ALLOWED_ROLES = new Set(["admin", "socio", "docente"]);

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

function getUserRoles(user) {
  const raw = user?.roles
    || user?.app_metadata?.roles
    || user?.appMetadata?.roles
    || [];

  return Array.isArray(raw)
    ? raw.map((role) => String(role || "").toLowerCase())
    : [];
}

function resolveRole(user) {
  const roles = getUserRoles(user);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("socio")) return "socio";
  if (roles.includes("docente")) return "docente";
  return null;
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
  return aliases;
}

function getUpdatedAtMillis(obj) {
  const value = obj && obj.updatedAt ? Date.parse(obj.updatedAt) : NaN;
  return Number.isFinite(value) ? value : 0;
}

function cloneJson(value) {
  return value && typeof value === "object"
    ? JSON.parse(JSON.stringify(value))
    : value;
}

function projectStateForRole(data, role) {
  if (!data || typeof data !== "object") return null;
  if (role === "admin" || role === "socio") return cloneJson(data);

  return {
    version: data.version || "v1-notes",
    updatedAt: data.updatedAt || null,
    events: cloneJson(data.events || {}),
    todos: [],
    notes: {
      items: [],
      currentId: null,
      draftTitle: "",
      draftBody: "",
      listOpen: true,
      editorOpen: false,
      favoritesOnly: false
    },
    contacts: []
  };
}

function mergeStateForRole(existing, incoming, role) {
  const current = existing && typeof existing === "object" ? cloneJson(existing) : {};
  const payload = incoming && typeof incoming === "object" ? cloneJson(incoming) : {};

  if (role === "admin" || role === "socio") return payload;

  // Il Docente puo modificare il Calendario, ma non puo leggere o
  // sovrascrivere Taccuino, Rubrica o future aree amministrative.
  return {
    ...current,
    version: current.version || payload.version || "v1-notes",
    events: payload.events && typeof payload.events === "object" ? payload.events : (current.events || {})
  };
}

async function getJsonIfPresent(store, key) {
  if (!key) return null;
  try {
    const data = await store.get(key, { type: "json", consistency: "strong" });
    return data && typeof data === "object" ? data : null;
  } catch (e) {
    return null;
  }
}

async function loadSharedOrMigrate(store, user) {
  const shared = await getJsonIfPresent(store, SHARED_STATE_KEY);
  if (shared) return { data: shared, key: SHARED_STATE_KEY, migratedFrom: null };

  const candidates = [];
  const ownerMeta = await getJsonIfPresent(store, "owner-meta");
  if (ownerMeta?.key) candidates.push(ownerMeta.key);
  if (Array.isArray(ownerMeta?.aliases)) {
    ownerMeta.aliases.forEach((alias) => candidates.push(`state-v1-${safeKey(alias)}`));
  }
  buildUserAliases(user).forEach((alias) => candidates.push(`state-v1-${alias}`));

  const uniqueKeys = [...new Set(candidates.filter(Boolean))];
  const loaded = await Promise.all(
    uniqueKeys.map(async (key) => ({ key, data: await getJsonIfPresent(store, key) }))
  );
  const best = loaded
    .filter((entry) => entry.data)
    .sort((a, b) => getUpdatedAtMillis(b.data) - getUpdatedAtMillis(a.data))[0];

  if (!best) return { data: null, key: SHARED_STATE_KEY, migratedFrom: null };

  await store.setJSON(SHARED_STATE_KEY, best.data);
  await store.setJSON(SHARED_META_KEY, {
    migratedFrom: best.key,
    migratedAtUTC: new Date().toISOString(),
    updatedAtUTC: best.data?.updatedAt || null
  });

  return { data: best.data, key: SHARED_STATE_KEY, migratedFrom: best.key };
}

export default async (req, context) => {
  const user = (await getUser().catch(() => null)) || getIdentityUserFromContext(context);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const role = resolveRole(user);
  if (!role || !ALLOWED_ROLES.has(role)) {
    return json({
      ok: false,
      error: "Forbidden",
      message: "Account autenticato ma senza un ruolo SDAC autorizzato."
    }, 403);
  }

  const store = getStore("sdac-agenda");

  try {
    if (req.method === "GET") {
      const shared = await loadSharedOrMigrate(store, user);
      return json({
        ok: true,
        data: projectStateForRole(shared.data, role),
        updatedAt: shared.data?.updatedAt || null,
        key: SHARED_STATE_KEY,
        shared: true,
        role,
        migratedFrom: shared.migratedFrom,
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

      const shared = await loadSharedOrMigrate(store, user);
      const current = shared.data;

      if (hasConflictToken) {
        const remoteMillis = getUpdatedAtMillis(current);
        const baseMillis = baseUpdatedAt ? Date.parse(baseUpdatedAt) : 0;
        const normalizedBaseMillis = Number.isFinite(baseMillis) ? baseMillis : 0;

        if (remoteMillis > normalizedBaseMillis) {
          return json({
            ok: false,
            conflict: true,
            error: "Remote state is newer than the client base state",
            message: "Il cloud contiene modifiche piu recenti. Aggiorna prima di salvare.",
            remoteUpdatedAt: current?.updatedAt || null,
            key: SHARED_STATE_KEY,
            data: projectStateForRole(current, role)
          }, 409);
        }
      }

      const nextState = mergeStateForRole(current, payload, role);
      nextState.updatedAt = new Date().toISOString();

      await store.setJSON(SHARED_STATE_KEY, nextState);
      await store.setJSON(SHARED_META_KEY, {
        key: SHARED_STATE_KEY,
        shared: true,
        lastEditorEmail: user.email || null,
        lastEditorRole: role,
        updatedAtUTC: nextState.updatedAt
      });

      return json({
        ok: true,
        updatedAt: nextState.updatedAt,
        key: SHARED_STATE_KEY,
        shared: true,
        role
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
};
