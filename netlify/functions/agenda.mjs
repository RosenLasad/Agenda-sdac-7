import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

const SHARED_STATE_KEY = "state-v2-shared-sdac";
const SHARED_META_KEY = "state-v2-shared-sdac-meta";
const ALLOWED_ROLES = new Set(["admin", "socio", "docente"]);
const CURRENT_DATA_VERSION = 3;

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


function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function financePaymentComparable(payment) {
  const p = payment && typeof payment === "object" ? payment : {};
  return JSON.stringify({
    kind: String(p.kind || "payment"),
    amount: Math.max(0, Number(p.amount || 0) || 0),
    date: String(p.date || "").slice(0, 10),
    method: String(p.method || "").trim(),
    note: String(p.note || "").trim()
  });
}

function makeFinanceAuditEvent(type, actorEmail, actorRole, extra = {}) {
  return {
    id: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`,
    type,
    paymentId: String(extra.paymentId || ""),
    amount: Math.max(0, Number(extra.amount || 0) || 0),
    date: String(extra.date || "").slice(0, 10),
    detail: String(extra.detail || "").trim(),
    actorEmail: normalizeEmail(actorEmail),
    actorRole: String(actorRole || "").toLowerCase(),
    at: new Date().toISOString()
  };
}

function stampFinanceMutations(existingAcademy, incomingAcademy, user, role) {
  const incoming = incomingAcademy && typeof incomingAcademy === "object"
    ? cloneJson(incomingAcademy)
    : { activeYear:"2026/2027", years:{} };
  const existing = existingAcademy && typeof existingAcademy === "object" ? existingAcademy : { years:{} };
  const actorEmail = normalizeEmail(user?.email || "");
  const now = new Date().toISOString();

  for (const year of Object.keys(incoming.years || {})) {
    const incomingStudents = Array.isArray(incoming.years?.[year]?.students) ? incoming.years[year].students : [];
    const existingStudents = Array.isArray(existing.years?.[year]?.students) ? existing.years[year].students : [];
    const existingStudentById = new Map(existingStudents.map((st) => [String(st?.id || ""), st]));

    for (const student of incomingStudents) {
      const previousStudent = existingStudentById.get(String(student?.id || ""));
      const incomingEnrollments = student?.finance?.enrollments && typeof student.finance.enrollments === "object" ? student.finance.enrollments : {};
      const previousEnrollments = previousStudent?.finance?.enrollments && typeof previousStudent.finance.enrollments === "object" ? previousStudent.finance.enrollments : {};

      for (const courseId of Object.keys(incomingEnrollments)) {
        const enrollment = incomingEnrollments[courseId] && typeof incomingEnrollments[courseId] === "object" ? incomingEnrollments[courseId] : {};
        const previousEnrollment = previousEnrollments[courseId] && typeof previousEnrollments[courseId] === "object" ? previousEnrollments[courseId] : {};
        const previousPayments = Array.isArray(previousEnrollment.payments) ? previousEnrollment.payments : [];
        const incomingPayments = Array.isArray(enrollment.payments) ? enrollment.payments : [];
        const previousById = new Map(previousPayments.map((payment) => [String(payment?.id || ""), payment]));
        const incomingIds = new Set();
        const audit = Array.isArray(previousEnrollment.audit) ? cloneJson(previousEnrollment.audit).slice(-300) : [];

        enrollment.payments = incomingPayments.map((payment) => {
          const nextPayment = payment && typeof payment === "object" ? cloneJson(payment) : {};
          const paymentId = String(nextPayment.id || `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`);
          nextPayment.id = paymentId;
          incomingIds.add(paymentId);
          const previous = previousById.get(paymentId);

          if (!previous) {
            nextPayment.createdAt = now;
            nextPayment.updatedAt = now;
            nextPayment.createdBy = actorEmail;
            nextPayment.createdByRole = role;
            nextPayment.updatedBy = actorEmail;
            nextPayment.updatedByRole = role;
            audit.push(makeFinanceAuditEvent("payment_added", actorEmail, role, { paymentId, amount:nextPayment.amount, date:nextPayment.date, detail:String(nextPayment.kind || "payment") === "deposit" ? "Acconto registrato" : "Pagamento registrato" }));
            return nextPayment;
          }

          const changed = financePaymentComparable(previous) !== financePaymentComparable(nextPayment);
          nextPayment.createdAt = previous.createdAt || nextPayment.createdAt || now;
          nextPayment.createdBy = normalizeEmail(previous.createdBy || "");
          nextPayment.createdByRole = String(previous.createdByRole || "").toLowerCase();
          if (changed) {
            nextPayment.updatedAt = now;
            nextPayment.updatedBy = actorEmail;
            nextPayment.updatedByRole = role;
            audit.push(makeFinanceAuditEvent("payment_updated", actorEmail, role, { paymentId, amount:nextPayment.amount, date:nextPayment.date, detail:"Pagamento modificato" }));
          } else {
            nextPayment.updatedAt = previous.updatedAt || nextPayment.createdAt;
            nextPayment.updatedBy = normalizeEmail(previous.updatedBy || previous.createdBy || "");
            nextPayment.updatedByRole = String(previous.updatedByRole || previous.createdByRole || "").toLowerCase();
          }
          return nextPayment;
        });

        for (const previousPayment of previousPayments) {
          const paymentId = String(previousPayment?.id || "");
          if (paymentId && !incomingIds.has(paymentId)) {
            audit.push(makeFinanceAuditEvent("payment_deleted", actorEmail, role, { paymentId, amount:previousPayment.amount, date:previousPayment.date, detail:String(previousPayment.kind || "payment") === "deposit" ? "Acconto eliminato" : "Pagamento eliminato" }));
          }
        }

        const settingsChanged =
          Number(previousEnrollment.courseFee || 0) !== Number(enrollment.courseFee || 0) ||
          String(previousEnrollment.nextDueDate || "") !== String(enrollment.nextDueDate || "") ||
          String(previousEnrollment.nextDueNote || "") !== String(enrollment.nextDueNote || "") ||
          String(previousEnrollment.notes || "") !== String(enrollment.notes || "");
        if (settingsChanged && Object.keys(previousEnrollment).length) {
          audit.push(makeFinanceAuditEvent("finance_settings", actorEmail, role, { detail:"Quota/scadenza aggiornata" }));
        }

        enrollment.audit = audit.slice(-300);
      }
    }
  }

  return incoming;
}

function teacherCourseIds(academy, email) {
  const userEmail = normalizeEmail(email);
  const ids = new Set();
  const years = academy?.years && typeof academy.years === "object" ? academy.years : {};
  for (const year of Object.keys(years)) {
    for (const course of Array.isArray(years[year]?.courses) ? years[year].courses : []) {
      const emails = Array.isArray(course?.teacherEmails) ? course.teacherEmails.map(normalizeEmail) : [];
      if (userEmail && emails.includes(userEmail)) ids.add(String(course.id));
    }
  }
  return ids;
}

function projectAcademyForTeacher(academy, email) {
  const source = academy && typeof academy === "object" ? cloneJson(academy) : { activeYear:"2026/2027", years:{} };
  const allowed = teacherCourseIds(source, email);
  const projected = { activeYear: source.activeYear || "2026/2027", years:{} };
  for (const year of Object.keys(source.years || {})) {
    const y = source.years[year] || {};
    const courses = (Array.isArray(y.courses) ? y.courses : []).filter((c) => allowed.has(String(c.id)));
    const ids = new Set(courses.map((c) => String(c.id)));
    const students = (Array.isArray(y.students) ? y.students : [])
      .filter((st) => (Array.isArray(st.courseIds) ? st.courseIds : []).some((id) => ids.has(String(id))))
      .map((st) => ({
        id: st.id,
        firstName: st.firstName || "",
        lastName: st.lastName || "",
        email: "",
        phone: "",
        notes: "",
        courseIds: (Array.isArray(st.courseIds) ? st.courseIds : []).filter((id) => ids.has(String(id))),
        finance: { enrollments:{} },
        createdAt: st.createdAt || null,
        updatedAt: st.updatedAt || null
      }));
    projected.years[year] = { courses, students };
  }
  return projected;
}

function mergeAcademyForTeacher(existingAcademy, incomingAcademy, email) {
  const current = existingAcademy && typeof existingAcademy === "object" ? cloneJson(existingAcademy) : { activeYear:"2026/2027", years:{} };
  const incoming = incomingAcademy && typeof incomingAcademy === "object" ? incomingAcademy : { years:{} };
  const userEmail = normalizeEmail(email);
  for (const year of Object.keys(current.years || {})) {
    const currentCourses = Array.isArray(current.years[year]?.courses) ? current.years[year].courses : [];
    const incomingCourses = Array.isArray(incoming.years?.[year]?.courses) ? incoming.years[year].courses : [];
    const incomingById = new Map(incomingCourses.map((c) => [String(c.id), c]));
    current.years[year].courses = currentCourses.map((course) => {
      const courseEmails = Array.isArray(course?.teacherEmails) ? course.teacherEmails.map(normalizeEmail) : [];
      if (!userEmail || !courseEmails.includes(userEmail)) return course;
      const inc = incomingById.get(String(course.id));
      if (!inc) return course;
      // Un docente può scrivere il registro del proprio corso, ma non
      // modificare configurazione, iscrizioni, contatti o dati economici.
      return { ...course, lessons: Array.isArray(inc.lessons) ? cloneJson(inc.lessons) : (course.lessons || []) };
    });
  }
  return current;
}

function projectStateForRole(data, role, user) {
  if (!data || typeof data !== "object") return null;
  if (role === "admin") return cloneJson(data);
  if (role === "socio") {
    const projected = cloneJson(data);
    // Il Socio gestisce quote/pagamenti degli studenti, ma non riceve
    // le future voci amministrative generali (spese, altre entrate, bilancio).
    projected.administration = { expenses: [], otherIncome: [], notes: "" };
    return projected;
  }

  return {
    version: data.version || "v1-notes",
    dataVersion: Math.max(Number(data.dataVersion || 0), CURRENT_DATA_VERSION),
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
    contacts: [],
    academy: projectAcademyForTeacher(data.academy, user?.email || "")
  };
}

function mergeStateForRole(existing, incoming, role, user) {
  const current = existing && typeof existing === "object" ? cloneJson(existing) : {};
  const payload = incoming && typeof incoming === "object" ? cloneJson(incoming) : {};

  if (role === "admin") return payload;
  if (role === "socio") {
    return {
      ...payload,
      // Anche se il client del Socio invia un campo administration vuoto,
      // il server conserva sempre i dati generali riservati all'Admin.
      administration: cloneJson(current.administration || { expenses: [], otherIncome: [], notes: "" })
    };
  }

  // Il Docente puo modificare il Calendario, ma non puo leggere o
  // sovrascrivere Taccuino, Rubrica o future aree amministrative.
  return {
    ...current,
    version: current.version || payload.version || "v1-notes",
    dataVersion: Math.max(Number(current.dataVersion || 0), Number(payload.dataVersion || 0), CURRENT_DATA_VERSION),
    events: payload.events && typeof payload.events === "object" ? payload.events : (current.events || {}),
    academy: mergeAcademyForTeacher(current.academy, payload.academy, user?.email || "")
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
        data: projectStateForRole(shared.data, role, user),
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
            data: projectStateForRole(current, role, user)
          }, 409);
        }
      }

      const sanitizedPayload = cloneJson(payload);
      if (role === "admin" || role === "socio") {
        sanitizedPayload.academy = stampFinanceMutations(current?.academy, sanitizedPayload.academy, user, role);
      }
      const nextState = mergeStateForRole(current, sanitizedPayload, role, user);
      nextState.dataVersion = Math.max(Number(nextState.dataVersion || 0), CURRENT_DATA_VERSION);
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
