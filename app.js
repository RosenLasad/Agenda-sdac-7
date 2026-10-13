(function(){
    "use strict";

    var START_YEAR = 2026;
    var CURRENT_DATA_VERSION = 3;
    var LEGACY_STORAGE_KEY = "sdac_agenda_2026_v1";
    var STORAGE_KEY_PREFIX = "sdac_agenda_2026_v2_";
    var THEME_KEY = "sdac_agenda_theme";
    var REMOTE_BASE_KEY_PREFIX = "sdac_agenda_cloud_base_v1_";
    var THEME_META_DARK = "#9f1020";
    var THEME_META_LIGHT = "#efe6d7";

    var MONTHS_IT = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
    var DOW_IT = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

    var CONTACT_CATEGORY_LABELS = {
  docenti: "Docenti",
  allievi: "Allievi",
  collaboratori: "Collaboratori",
  partner: "Partner",
  fornitori: "Fornitori",
  altro: "Altro"
};

    var EVENT_CATEGORY_LABELS = {
  appuntamenti: "Appuntamenti",
  corsi: "Corsi",
  riprese: "Riprese",
  attrezzatura: "Attrezzatura",
  montaggio: "Montaggio",
  riunione: "Riunione",
  comunicazione: "Comunicazione",
  social: "Social",
  youtube: "YouTube",
  other: "Altro"
};

    var NOTE_COLOR_LABELS = {
      cream: "Crema",
      blush: "Rosa",
      sage: "Salvia",
      sky: "Azzurro",
      gold: "Oro"
    };
    var NOTE_COLOR_ORDER = ["cream","blush","sage","sky","gold"];


    function $(sel){ return document.querySelector(sel); }
    function pad2(n){ return String(n).padStart(2,"0"); }
    function isoDate(d){ return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }
    function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
    function uid(){ return Math.random().toString(16).slice(2) + Date.now().toString(16); }
    function parseISO(s){
      var p = s.split("-").map(Number);
      return new Date(p[0], p[1]-1, p[2], 12,0,0,0);
    }

    function getMonthCursorDate(){
      return new Date(currentYear, currentMonth, 1, 12, 0, 0, 0);
    }

    function shiftCalendarMonth(delta){
      var base = getMonthCursorDate();
      base.setMonth(base.getMonth() + delta);
      currentYear = base.getFullYear();
      currentMonth = base.getMonth();
    }


    function normalizeEventCategory(value){
  var raw = String(value || "").trim().toLowerCase();
  var map = {
    appuntamenti: "appuntamenti",
    appuntamento: "appuntamenti",
    corsi: "corsi",
    corso: "corsi",
    lessons: "corsi",
    riprese: "riprese",
    ripresa: "riprese",
    shooting: "riprese",
    attrezzatura: "attrezzatura",
    attrezzi: "attrezzatura",
    equipment: "attrezzatura",
    gear: "attrezzatura",
    montaggio: "montaggio",
    editing: "montaggio",
    edit: "montaggio",
    riunione: "riunione",
    riunioni: "riunione",
    meeting: "riunione",
    comunicazione: "comunicazione",
    comunicazioni: "comunicazione",
    communication: "comunicazione",
    communications: "comunicazione",
    comms: "comunicazione",
    newsletter: "comunicazione",
    email: "comunicazione",
    mail: "comunicazione",
    social: "social",
    youtube: "youtube",
    yt: "youtube",
    work: "appuntamenti",
    lavoro: "appuntamenti",
    sdac: "corsi",
    other: "other",
    altro: "other",
    priv: "other",
    private: "other",
    privato: "other"
  };
  return map[raw] || "other";
}

    function eventCategoryLabel(value){
      return EVENT_CATEGORY_LABELS[normalizeEventCategory(value)] || "Altro";
    }

    function eventCategoryIcon(value){
      var key = normalizeEventCategory(value);
      var map = {
        appuntamenti: "🔴",
        corsi: "🎬",
        riprese: "🎥",
        attrezzatura: "🛠️",
        montaggio: "🖥️",
        riunione: "👥",
        comunicazione: "📣",
        social: "📱",
        youtube: "▶️",
        other: "⚪"
      };
      return map[key] || "⚪";
    }

    function normalizeContactCategory(value){
  var raw = String(value || "").trim().toLowerCase();
  var map = {
    docenti: "docenti",
    docente: "docenti",
    teachers: "docenti",
    allievi: "allievi",
    allievo: "allievi",
    studenti: "allievi",
    studente: "allievi",
    collaboratori: "collaboratori",
    collaboratore: "collaboratori",
    partner: "partner",
    partners: "partner",
    fornitori: "fornitori",
    fornitore: "fornitori",
    lavoro: "collaboratori",
    work: "collaboratori",
    amici: "partner",
    friends: "partner",
    famiglia: "altro",
    family: "altro",
    clienti: "partner",
    clients: "partner",
    suppliers: "fornitori",
    other: "altro",
    altro: "altro"
  };
  return map[raw] || "altro";
}

    function normalizeContact(contact){
      var c = contact && typeof contact === "object" ? contact : {};
      return {
        id: c.id || uid(),
        name: String(c.name || "").trim(),
        phone: String(c.phone || "").trim(),
        email: String(c.email || "").trim(),
        category: normalizeContactCategory(c.category),
        notes: String(c.notes || "").trim()
      };
    }

    function contactCategoryLabel(value){
      return CONTACT_CATEGORY_LABELS[normalizeContactCategory(value)] || "Altro";
    }

    function normalizeNoteColor(value){
      var raw = String(value || "").trim().toLowerCase();
      return NOTE_COLOR_LABELS[raw] ? raw : "cream";
    }

    function noteColorLabel(value){
      return NOTE_COLOR_LABELS[normalizeNoteColor(value)] || "Crema";
    }

    function createImportedLegacyNote(text){
      var nowISO = new Date().toISOString();
      return {
        id: uid(),
        title: "Nota importata",
        body: String(text || "").trim(),
        color: "cream",
        favorite: false,
        position: 0,
        createdAt: nowISO,
        updatedAt: nowISO
      };
    }

    function normalizeNote(note, index){
      var n = note && typeof note === "object" ? note : {};
      var fallbackPosition = typeof index === "number" ? index : 0;
      return {
        id: n.id || uid(),
        title: String(n.title || "").trim(),
        body: String(n.body || n.text || "").trim(),
        color: normalizeNoteColor(n.color),
        favorite: !!n.favorite,
        position: Number.isFinite ? (Number.isFinite(n.position) ? n.position : fallbackPosition) : (isFinite(n.position) ? Number(n.position) : fallbackPosition),
        createdAt: n.createdAt || new Date().toISOString(),
        updatedAt: n.updatedAt || n.createdAt || new Date().toISOString()
      };
    }

    function normalizeNotesState(raw){
      var base = {
        items: [],
        currentId: null,
        draftTitle: "",
        draftBody: "",
        listOpen: true,
        editorOpen: false,
        favoritesOnly: false
      };

      if(typeof raw === "string"){
        var legacy = String(raw || "").trim();
        if(legacy){
          var imported = createImportedLegacyNote(legacy);
          base.items = [imported];
          base.currentId = imported.id;
          base.draftTitle = imported.title;
          base.draftBody = imported.body;
          base.listOpen = true;
          base.editorOpen = false;
        }
        return base;
      }

      if(Array.isArray(raw)) raw = { items: raw };
      if(!raw || typeof raw !== "object") return base;

      var items = Array.isArray(raw.items) ? raw.items.map(function(item, index){ return normalizeNote(item, index); }) : [];
      items.forEach(function(item, index){
        item.position = index;
      });

      var currentId = raw.currentId && items.some(function(item){ return item.id === raw.currentId; }) ? raw.currentId : null;
      var draftTitle = typeof raw.draftTitle === "string" ? raw.draftTitle : "";
      var draftBody = typeof raw.draftBody === "string" ? raw.draftBody : "";
      var listOpen = raw.listOpen !== false;
      var editorOpen = !!raw.editorOpen;
      var favoritesOnly = !!raw.favoritesOnly;

      if(currentId && !draftTitle && !draftBody){
        var current = items.find(function(item){ return item.id === currentId; }) || null;
        if(current){
          draftTitle = current.title || "";
          draftBody = current.body || "";
        }
      }

      return {
        items: items,
        currentId: currentId,
        draftTitle: draftTitle,
        draftBody: draftBody,
        listOpen: listOpen,
        editorOpen: editorOpen,
        favoritesOnly: favoritesOnly
      };
    }



    var ACADEMIC_YEAR = "2026/2027";
    var DEFAULT_COURSE_DEFS = [
      { id:"regia", name:"Regia", icon:"🎬", fee:1500, weekday:4, startTime:"17:00", endTime:"19:00", firstDate:"2026-10-22" },
      { id:"regia-avanzata", name:"Regia Avanzata", icon:"🎬", fee:1000, weekday:5, startTime:"17:00", endTime:"19:00", firstDate:"2026-10-23" },
      { id:"sceneggiatura", name:"Sceneggiatura", icon:"✍️", fee:1000, weekday:2, startTime:"17:00", endTime:"19:00", firstDate:"2026-10-20" },
      { id:"operatore-dop", name:"Operatore + D.O.P.", icon:"📷", fee:1200, weekday:1, startTime:"17:00", endTime:"19:00", firstDate:"2026-10-19" },
      { id:"montaggio", name:"Montaggio", icon:"🖥️", fee:1000, weekday:3, startTime:"17:00", endTime:"19:00", firstDate:"2026-10-21" },
      { id:"colonne-sonore", name:"Colonne sonore", icon:"🎼", fee:1000, weekday:5, startTime:"15:00", endTime:"17:00", firstDate:"2026-10-23" },
      { id:"tecnico-suono", name:"Tecnico del suono", icon:"🎚️", fee:1000, weekday:5, startTime:"17:00", endTime:"19:00", firstDate:"2026-10-23" }
    ];

    function normalizeEmail(value){ return String(value || "").trim().toLowerCase(); }

    function defaultAcademyState(){
      return {
        activeYear: ACADEMIC_YEAR,
        years: {
          "2026/2027": {
            courses: DEFAULT_COURSE_DEFS.map(function(def){
              return {
                id:def.id,
                name:def.name,
                icon:def.icon,
                weekday:def.weekday,
                startTime:def.startTime,
                endTime:def.endTime,
                firstDate:def.firstDate,
                fee:def.fee,
                lessonTarget:null,
                teacherName:"",
                teacherEmails:[],
                lessons:[]
              };
            }),
            students:[]
          }
        }
      };
    }

    function normalizeAttendance(raw){
      var src = raw && typeof raw === "object" ? raw : {};
      var out = {};
      Object.keys(src).forEach(function(studentId){
        var value = String(src[studentId] || "present").toLowerCase();
        out[studentId] = value === "absent" || value === "late" || value === "unmarked" ? value : "present";
      });
      return out;
    }

    function normalizeLesson(raw){
      var l = raw && typeof raw === "object" ? raw : {};
      return {
        id:l.id || uid(),
        date:String(l.date || "").slice(0,10),
        startTime:String(l.startTime || ""),
        endTime:String(l.endTime || ""),
        topic:String(l.topic || "").trim(),
        notes:String(l.notes || "").trim(),
        attendance:normalizeAttendance(l.attendance),
        createdAt:l.createdAt || new Date().toISOString(),
        updatedAt:l.updatedAt || l.createdAt || new Date().toISOString()
      };
    }

    function normalizeCourse(raw, fallback){
      var c = raw && typeof raw === "object" ? raw : {};
      var f = fallback || {};
      var emails = Array.isArray(c.teacherEmails) ? c.teacherEmails : (c.teacherEmail ? [c.teacherEmail] : []);
      return {
        id:String(c.id || f.id || uid()),
        name:String(c.name || f.name || "Corso").trim(),
        icon:String(c.icon || f.icon || "🎓"),
        weekday:Number.isFinite(Number(c.weekday)) ? Number(c.weekday) : Number(f.weekday || 1),
        startTime:String(c.startTime || f.startTime || "17:00"),
        endTime:String(c.endTime || f.endTime || "19:00"),
        firstDate:String(c.firstDate || f.firstDate || "").slice(0,10),
        fee:Math.max(0, Number(c.fee !== undefined ? c.fee : (f.fee !== undefined ? f.fee : 1000)) || 0),
        lessonTarget:c.lessonTarget === null || c.lessonTarget === "" || typeof c.lessonTarget === "undefined" ? null : Math.max(0, Number(c.lessonTarget) || 0),
        teacherName:String(c.teacherName || "").trim(),
        teacherEmails:emails.map(normalizeEmail).filter(Boolean).filter(function(v,i,a){ return a.indexOf(v) === i; }),
        lessons:Array.isArray(c.lessons) ? c.lessons.map(normalizeLesson) : []
      };
    }

    function standardFeeForCourseId(courseId){
      var def = DEFAULT_COURSE_DEFS.find(function(item){ return item.id === String(courseId || ""); });
      return def ? Number(def.fee || 0) : 0;
    }

    function normalizeFinancePayment(raw){
      var p = raw && typeof raw === "object" ? raw : {};
      var nowISO = new Date().toISOString();
      var createdAt = p.createdAt || nowISO;
      var kind = String(p.kind || "payment").toLowerCase() === "deposit" ? "deposit" : "payment";
      return {
        id:String(p.id || uid()),
        kind:kind,
        amount:Math.max(0, Number(p.amount || 0) || 0),
        date:String(p.date || "").slice(0,10),
        method:String(p.method || "").trim(),
        note:String(p.note || "").trim(),
        createdAt:createdAt,
        updatedAt:p.updatedAt || createdAt,
        createdBy:normalizeEmail(p.createdBy || p.createdByEmail || ""),
        createdByRole:String(p.createdByRole || "").toLowerCase(),
        updatedBy:normalizeEmail(p.updatedBy || p.updatedByEmail || p.createdBy || p.createdByEmail || ""),
        updatedByRole:String(p.updatedByRole || p.createdByRole || "").toLowerCase()
      };
    }

    function normalizeFinanceAuditEvent(raw){
      var e = raw && typeof raw === "object" ? raw : {};
      return {
        id:String(e.id || uid()),
        type:String(e.type || "finance_update"),
        paymentId:String(e.paymentId || ""),
        amount:Math.max(0, Number(e.amount || 0) || 0),
        date:String(e.date || "").slice(0,10),
        detail:String(e.detail || "").trim(),
        actorEmail:normalizeEmail(e.actorEmail || e.email || ""),
        actorRole:String(e.actorRole || e.role || "").toLowerCase(),
        at:e.at || e.createdAt || new Date().toISOString()
      };
    }

    function normalizeFinanceEnrollment(raw, courseId){
      var f = raw && typeof raw === "object" ? raw : {};
      return {
        courseFee:Math.max(0, Number(f.courseFee !== undefined ? f.courseFee : standardFeeForCourseId(courseId)) || 0),
        depositAmount:Math.max(0, Number(f.depositAmount !== undefined ? f.depositAmount : 300) || 0),
        payments:Array.isArray(f.payments) ? f.payments.map(normalizeFinancePayment).filter(function(p){ return p.amount > 0; }) : [],
        nextDueDate:String(f.nextDueDate || "").slice(0,10),
        nextDueNote:String(f.nextDueNote || "").trim(),
        notes:String(f.notes || "").trim(),
        audit:Array.isArray(f.audit) ? f.audit.map(normalizeFinanceAuditEvent).slice(-300) : []
      };
    }

    function normalizeStudentFinance(raw, courseIds){
      var f = raw && typeof raw === "object" ? raw : {};
      var source = f.enrollments && typeof f.enrollments === "object" ? f.enrollments : {};
      var enrollments = {};
      Object.keys(source).forEach(function(courseId){ enrollments[String(courseId)] = normalizeFinanceEnrollment(source[courseId], courseId); });
      (courseIds || []).forEach(function(courseId){ if(!enrollments[courseId]) enrollments[courseId] = normalizeFinanceEnrollment(null, courseId); });

      // Migrazione morbida del vecchio finance globale, se esiste e lo studente ha un solo corso.
      if(!f.enrollments && (courseIds || []).length === 1 && (Number(f.totalFee || 0) || Number(f.paid || 0) || (Array.isArray(f.installments) && f.installments.length))){
        var cid = courseIds[0];
        var legacy = enrollments[cid];
        if(Number(f.totalFee || 0) > 0) legacy.courseFee = Number(f.totalFee);
        var legacyPayments = Array.isArray(f.installments) ? f.installments.map(function(item){
          return normalizeFinancePayment({ id:item.id, kind:item.kind || "payment", amount:item.amount || item.paid || 0, date:item.date || item.paidAt || "", method:item.method || "", note:item.note || "", createdAt:item.createdAt });
        }).filter(function(p){ return p.amount > 0; }) : [];
        if(!legacyPayments.length && Number(f.paid || 0) > 0) legacyPayments.push(normalizeFinancePayment({ kind:"payment", amount:Number(f.paid), note:"Importo migrato dalla versione precedente" }));
        legacy.payments = legacyPayments;
        legacy.notes = String(f.notes || "");
      }
      var shared = f.shared && typeof f.shared === "object" ? f.shared : {};
      var discount = shared.discount && typeof shared.discount === "object" ? shared.discount : {};
      return { enrollments:enrollments, shared:{
        agreedFee: shared.agreedFee === null || shared.agreedFee === undefined || shared.agreedFee === "" ? null : Math.max(0,Number(shared.agreedFee)||0),
        discountType: ["amount","percent"].indexOf(discount.type)>=0 ? discount.type : "amount",
        discountValue: Math.max(0,Number(discount.value)||0),
        discountReason: String(discount.reason||"").slice(0,250),
        dueDate: String(shared.dueDate||"2027-04-30").slice(0,10),
        payments: Array.isArray(shared.payments) ? shared.payments.map(normalizeFinancePayment).filter(function(p){return p.amount>0;}) : [],
        audit: Array.isArray(shared.audit) ? shared.audit.map(normalizeFinanceAuditEvent).slice(-300) : []
      }};
    }

    function normalizeStudent(raw){
      var st = raw && typeof raw === "object" ? raw : {};
      var courseIds = Array.isArray(st.courseIds) ? st.courseIds.map(String) : [];
      return {
        id:st.id || uid(),
        firstName:String(st.firstName || "").trim(),
        lastName:String(st.lastName || "").trim(),
        email:String(st.email || "").trim(),
        phone:String(st.phone || "").trim(),
        notes:String(st.notes || "").trim(),
        courseIds:courseIds,
        finance:normalizeStudentFinance(st.finance, courseIds),
        createdAt:st.createdAt || new Date().toISOString(),
        updatedAt:st.updatedAt || st.createdAt || new Date().toISOString()
      };
    }

    function normalizeAcademyState(raw){
      var base = defaultAcademyState();
      var src = raw && typeof raw === "object" ? raw : {};
      var activeYear = String(src.activeYear || ACADEMIC_YEAR);
      var sourceYears = src.years && typeof src.years === "object" ? src.years : {};
      var years = {};
      var allYears = Object.keys(sourceYears);
      if(allYears.indexOf(ACADEMIC_YEAR) === -1) allYears.unshift(ACADEMIC_YEAR);
      allYears.forEach(function(year){
        var y = sourceYears[year] && typeof sourceYears[year] === "object" ? sourceYears[year] : {};
        var hasExplicitCourses = Array.isArray(y.courses);
        var coursesRaw = hasExplicitCourses ? y.courses : [];
        if(year === ACADEMIC_YEAR){
          var byId = {};
          coursesRaw.forEach(function(c){ if(c && c.id) byId[String(c.id)] = c; });
          var normalizedCourses = hasExplicitCourses
            ? coursesRaw.map(function(c){
                var def = DEFAULT_COURSE_DEFS.find(function(item){ return item.id === String(c && c.id || ""); });
                return normalizeCourse(c, def);
              })
            : DEFAULT_COURSE_DEFS.map(function(def){ return normalizeCourse(null, def); });
          years[year] = {
            courses:normalizedCourses,
            students:Array.isArray(y.students) ? y.students.map(normalizeStudent) : []
          };
        }else{
          years[year] = { courses:coursesRaw.map(function(c){ return normalizeCourse(c); }), students:Array.isArray(y.students) ? y.students.map(normalizeStudent) : [] };
        }
      });
      if(!years[activeYear]) activeYear = ACADEMIC_YEAR;
      return { activeYear:activeYear, years:years };
    }

    function getAcademyYear(){
      if(!state.academy || typeof state.academy !== "object") state.academy = normalizeAcademyState(null);
      var year = state.academy.activeYear || ACADEMIC_YEAR;
      if(!state.academy.years[year]) state.academy.years[year] = { courses:[], students:[] };
      return state.academy.years[year];
    }

    function getCurrentUserEmail(){
      var user = getIdentityUser();
      return normalizeEmail(user && user.email);
    }

    function projectAcademyForTeacher(sourceAcademy, email){
      var academy = normalizeAcademyState(sourceAcademy);
      var userEmail = normalizeEmail(email);
      var projected = { activeYear:academy.activeYear, years:{} };
      Object.keys(academy.years).forEach(function(year){
        var y = academy.years[year];
        var courses = (y.courses || []).filter(function(course){ return userEmail && (course.teacherEmails || []).map(normalizeEmail).indexOf(userEmail) !== -1; });
        var ids = courses.map(function(c){ return c.id; });
        var students = (y.students || []).filter(function(st){ return (st.courseIds || []).some(function(id){ return ids.indexOf(id) !== -1; }); }).map(function(st){
          return { id:st.id, firstName:st.firstName, lastName:st.lastName, email:st.email || "", phone:st.phone || "", notes:"", courseIds:(st.courseIds || []).filter(function(id){ return ids.indexOf(id) !== -1; }), finance:{ enrollments:{} }, createdAt:st.createdAt, updatedAt:st.updatedAt };
        });
        projected.years[year] = { courses:courses, students:students };
      });
      return normalizeAcademyState(projected);
    }

    function normalizeAdministrationState(raw){
      var a = raw && typeof raw === "object" ? raw : {};
      return {
        expenses:Array.isArray(a.expenses) ? a.expenses : [],
        otherIncome:Array.isArray(a.otherIncome) ? a.otherIncome : [],
        notes:String(a.notes || "")
      };
    }

    function normalizeLoadedState(obj){
      var next = obj && typeof obj === "object" ? obj : {};
      if(!next.events) next.events = {};
      if(!Array.isArray(next.todos)) next.todos = [];
      next.notes = normalizeNotesState(next.notes);
      if(!Array.isArray(next.contacts)) next.contacts = [];
      next.academy = normalizeAcademyState(next.academy);
      next.administration = normalizeAdministrationState(next.administration);
      next.version = next.version || "v1-notes";
      next.dataVersion = CURRENT_DATA_VERSION;
      next.updatedAt = next.updatedAt || new Date().toISOString();
      return next;
    }

    function defaultState(){
      return {
        version:"v1-notes",
        dataVersion:CURRENT_DATA_VERSION,
        updatedAt:new Date().toISOString(),
        events:{},
        todos:[],
        notes: normalizeNotesState(null),
        contacts:[],
        academy: normalizeAcademyState(null),
        administration: normalizeAdministrationState(null)
      };
    }

    // Gli eventi Identity forniscono l'utente definitivo anche quando
    // currentUser() non e ancora aggiornato durante un cambio account.
    var identityEventUser = null;
    var identityEventReceived = false;
    function setIdentitySessionUser(user){
      identityEventReceived = true;
      identityEventUser = user || null;
    }
    function getIdentityUser(){
      if(identityEventReceived) return identityEventUser;
      try{
        return window.netlifyIdentity && window.netlifyIdentity.currentUser && window.netlifyIdentity.currentUser();
      }catch(e){
        return null;
      }
    }

    function getRoleFromUser(user){
      if(!user) return "guest";
      var appMeta = user.app_metadata || {};
      var roles = Array.isArray(appMeta.roles) ? appMeta.roles.map(function(role){ return String(role || "").toLowerCase(); }) : [];
      if(roles.indexOf("admin") !== -1) return "admin";
      if(roles.indexOf("socio") !== -1) return "socio";
      if(roles.indexOf("docente") !== -1) return "docente";
      if(roles.indexOf("studente") !== -1) return "studente";
      return "none";
    }

    function getCurrentAccessRole(){
      return getRoleFromUser(getIdentityUser());
    }

    function roleCanAccess(role, feature){
      if(role === "admin") return true;
      if(role === "socio") return feature === "calendar" || feature === "today" || feature === "notebook" || feature === "contacts" || feature === "courses" || feature === "students" || feature === "administration" || feature === "cloud";
      if(role === "docente") return feature === "today" || feature === "courses" || feature === "students" || feature === "cloud";
      if(role === "studente") return feature === "courses" || feature === "students" || feature === "cloud";
      return feature === "calendar" || feature === "today";
    }

    function hasAuthorizedCloudRole(){
      var role = getCurrentAccessRole();
      return role === "admin" || role === "socio" || role === "docente" || role === "studente";
    }

    function safeLocalUserKey(value){
      var key = String(value || "guest").toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 120);
      return key || "guest";
    }

    function getCurrentLocalUserKey(){
      var user = getIdentityUser();
      if(!user) return "guest";
      return safeLocalUserKey(user.id || user.sub || user.email || "user");
    }

    function getStorageKey(){
      return STORAGE_KEY_PREFIX + getCurrentLocalUserKey();
    }

    function projectAcademyForStudent(academy,email){
      var source = academy && typeof academy === "object" ? academy : {activeYear:ACADEMIC_YEAR,years:{}};
      var result = {activeYear:source.activeYear || ACADEMIC_YEAR,years:{}};
      var target=normalizeEmail(email);
      Object.keys(source.years||{}).forEach(function(year){
        var y=source.years[year]||{};
        var matches=target ? (y.students||[]).filter(function(st){return normalizeEmail(st.email)===target;}) : [];
        var student=matches.length===1?matches[0]:null;
        var ids=student?(student.courseIds||[]).map(String):[];
        var courses=(y.courses||[]).filter(function(c){return ids.indexOf(String(c.id))!==-1;}).map(function(c){return {
          id:c.id,name:c.name,icon:c.icon,weekday:c.weekday,startTime:c.startTime,endTime:c.endTime,firstDate:c.firstDate,
          lessonTarget:c.lessonTarget,teacherName:c.teacherName,
          lessons:(c.lessons||[]).map(function(l){return {date:l.date,startTime:l.startTime,endTime:l.endTime,topic:l.topic||"",notes:l.notes||""};})
        };});
        result.years[year]={courses:courses,students:student?[{id:student.id,firstName:student.firstName,lastName:student.lastName,
          email:student.email,phone:student.phone,notes:"",courseIds:ids,finance:{enrollments:{}}}]:[]};
      });
      return result;
    }

    function projectStateForRole(source, role, userEmail){
      var src = normalizeLoadedState(source && typeof source === "object" ? source : defaultState());
      if(role === "admin" || role === "socio") return src;
      var teacherAcademy = role === "docente" ? projectAcademyForTeacher(src.academy, userEmail || getCurrentUserEmail()) : role === "studente" ? projectAcademyForStudent(src.academy, userEmail || getCurrentUserEmail()) : normalizeAcademyState(null);
      if(role !== "docente" && role !== "studente") teacherAcademy.years[teacherAcademy.activeYear] = { courses:[], students:[] };
      return normalizeLoadedState({
        version: src.version || "v1-notes",
        dataVersion: src.dataVersion || CURRENT_DATA_VERSION,
        updatedAt: src.updatedAt,
        events: src.events || {},
        todos: [],
        notes: normalizeNotesState(null),
        contacts: [],
        academy: teacherAcademy
      });
    }

    function loadState(){
      try{
        var storageKey = getStorageKey();
        var raw = localStorage.getItem(storageKey);
        if(!raw){
          var legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
          if(legacyRaw){
            var legacyObj = JSON.parse(legacyRaw);
            if(legacyObj && typeof legacyObj === "object"){
              var migrated = projectStateForRole(legacyObj, getCurrentAccessRole(), getCurrentUserEmail());
              try{ localStorage.setItem(storageKey, JSON.stringify(migrated)); }catch(e){}
              return migrated;
            }
          }
          return defaultState();
        }
        var obj = JSON.parse(raw);
        if(!obj || typeof obj !== "object") return defaultState();
        var projected = projectStateForRole(obj, getCurrentAccessRole(), getCurrentUserEmail());
        // Persisti subito la forma normalizzata/migrata: gli ID generati per
        // entita legacy diventano stabili anche prima della prossima modifica.
        try{ localStorage.setItem(storageKey, JSON.stringify(projected)); }catch(e){}
        return projected;
      }catch(e){
        return defaultState();
      }
    }

    var state = loadState();
    Object.keys(state.events || {}).forEach(function(dateISO){
      state.events[dateISO] = (state.events[dateISO] || []).map(function(ev){
        if(!ev || typeof ev !== "object") return ev;
        ev.cat = normalizeEventCategory(ev.cat);
        return ev;
      });
    });
    var currentMonth = 0;
    var currentYear = START_YEAR;
    var selectedISO = null;
    var saveTimer = null;
    var liveTodayISO = isoDate(getTodayDate());
    var todayViewOffset = 0;
    var currentView = "calendar";
    var currentAccessRole = getCurrentAccessRole();

    // --- Navigazione interna / tasto Indietro mobile ---
    // Le sotto-pagine e i modali aggiungono un livello alla history del browser.
    // In una PWA Android il tasto fisico Indietro genera lo stesso popstate,
    // quindi chiude prima il livello interno piu recente invece di uscire dall'app.
    var INTERNAL_NAV_STATE_KEY = "sdacAgendaNav";
    var internalNavStack = [];
    var internalNavBackPending = false;
    var internalNavAfterPop = null;

    function internalNavState(depth, kind){
      var next = {};
      try{ Object.assign(next, window.history.state || {}); }catch(e){}
      next[INTERNAL_NAV_STATE_KEY] = {
        depth: Math.max(0, Number(depth) || 0),
        kind: kind || "base",
        view: currentView || "calendar"
      };
      return next;
    }

    function replaceInternalNavState(){
      if(internalNavBackPending) return;
      try{
        var top = internalNavStack.length ? internalNavStack[internalNavStack.length - 1] : null;
        window.history.replaceState(internalNavState(internalNavStack.length, top ? top.kind : "base"), "");
      }catch(e){}
    }

    function initInternalNavigation(){
      try{
        window.history.replaceState(internalNavState(0, "base"), "");
      }catch(e){}
    }

    function pushInternalNavLayer(kind, closeDirect){
      if(!kind || typeof closeDirect !== "function") return;
      var top = internalNavStack.length ? internalNavStack[internalNavStack.length - 1] : null;
      if(top && top.kind === kind) return;
      var layer = { kind:kind, closeDirect:closeDirect };
      internalNavStack.push(layer);
      try{ window.history.pushState(internalNavState(internalNavStack.length, kind), ""); }catch(e){}
    }

    function closeInternalNavLayer(kind, closeDirect){
      if(typeof closeDirect === "function") closeDirect();
      var top = internalNavStack.length ? internalNavStack[internalNavStack.length - 1] : null;
      if(top && top.kind === kind && !internalNavBackPending){
        internalNavBackPending = true;
        try{ window.history.back(); }catch(e){ internalNavBackPending = false; }
      }
    }

    function abandonInternalLayers(afterClose){
      var depth = internalNavStack.length;
      if(!depth){
        if(typeof afterClose === "function") afterClose();
        return;
      }
      if(internalNavBackPending){
        internalNavAfterPop = function(){ abandonInternalLayers(afterClose); };
        return;
      }
      var layers = internalNavStack.slice().reverse();
      internalNavStack.length = 0;
      layers.forEach(function(layer){ try{ layer.closeDirect(); }catch(e){} });
      internalNavAfterPop = typeof afterClose === "function" ? afterClose : null;
      internalNavBackPending = true;
      try{ window.history.go(-depth); }catch(e){
        internalNavBackPending = false;
        var fallback = internalNavAfterPop;
        internalNavAfterPop = null;
        if(fallback) fallback();
      }
    }

    function navigateMainView(view){
      if(internalNavStack.length || internalNavBackPending){
        abandonInternalLayers(function(){ setView(view); });
        return true;
      }
      return setView(view);
    }

    window.addEventListener("popstate", function(ev){
      internalNavBackPending = false;
      var nav = ev && ev.state && ev.state[INTERNAL_NAV_STATE_KEY];
      var targetDepth = nav && Number.isFinite(Number(nav.depth)) ? Math.max(0, Number(nav.depth)) : 0;

      // Back: chiudi tutti i livelli che non appartengono piu allo stato raggiunto.
      while(internalNavStack.length > targetDepth){
        var layer = internalNavStack.pop();
        try{ layer.closeDirect(); }catch(e){}
      }

      // Il tasto Avanti non deve riaprire modali con dati potenzialmente obsoleti:
      // normalizziamo semplicemente lo stato sulla UI attualmente visibile.
      if(targetDepth > internalNavStack.length) targetDepth = internalNavStack.length;

      var afterPop = internalNavAfterPop;
      internalNavAfterPop = null;
      if(afterPop) afterPop();
      if(!internalNavBackPending) replaceInternalNavState();
    });

    // --- Cloud sync (Netlify Identity + Functions + Blobs) ---
    var remoteSaveTimer = null;
    var remotePullTimer = null;
    var remoteSyncInFlight = false;
    var remoteSaveInFlight = false;
    var cloudSessionGeneration = 0;
    var cloudSessionVerified = false;
    var identityTransitionKey = null;
    var cloudSessionUserKey = null;
    var remotePollHandle = null;
    var remoteLastKnownUpdatedAt = null;
    var remoteLastCheckedAt = null;
    var remoteWriteLocked = false;
    var remoteWriteLockReason = null;
    var remoteConflictPending = false;
    var REMOTE_SYNC_DEBOUNCE_MS = 1200;
    var REMOTE_SYNC_POLL_MS = 10000;

    function isLoggedIn(){
      return !!getIdentityUser();
    }

    function formatCloudDateTime(value){
      if(!value) return "--";
      var d = value instanceof Date ? value : new Date(value);
      if(isNaN(d.getTime())) return "--";
      try{
        return new Intl.DateTimeFormat("it-IT", {
          day:"2-digit",
          month:"2-digit",
          year:"2-digit",
          hour:"2-digit",
          minute:"2-digit"
        }).format(d);
      }catch(e){
        return d.toLocaleString();
      }
    }

    function formatCloudTime(value){
      if(!value) return "";
      var d = value instanceof Date ? value : new Date(value);
      if(isNaN(d.getTime())) return "";
      try{
        return new Intl.DateTimeFormat("it-IT", {
          hour:"2-digit",
          minute:"2-digit"
        }).format(d);
      }catch(e){
        return d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
      }
    }

    function getCurrentCloudUserKey(){
      try{
        var user = getIdentityUser();
        var raw = user && (user.id || user.sub || user.email) ? (user.id || user.sub || user.email) : "shared";
        var key = String(raw).toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 120);
        return key || "shared";
      }catch(e){
        return "shared";
      }
    }

    function getRemoteBaseStorageKey(){
      return REMOTE_BASE_KEY_PREFIX + getCurrentCloudUserKey();
    }

    function getStoredRemoteBaseUpdatedAt(){
      try{
        return localStorage.getItem(getRemoteBaseStorageKey()) || null;
      }catch(e){
        return null;
      }
    }

    function setStoredRemoteBaseUpdatedAt(value){
      try{
        var key = getRemoteBaseStorageKey();
        if(value) localStorage.setItem(key, String(value));
        else localStorage.removeItem(key);
      }catch(e){}
    }

    function hasStoredLocalState(){
      try{
        return !!localStorage.getItem(getStorageKey());
      }catch(e){
        return false;
      }
    }

    function setCloudWriteLock(locked, reason){
      remoteWriteLocked = !!locked;
      remoteWriteLockReason = remoteWriteLocked ? (reason || remoteWriteLockReason || "sync") : null;
      try{
        document.body.classList.toggle("cloudSyncLocked", remoteWriteLocked);
      }catch(e){}
    }

    function setCloudButtonState(kind){
      if(!btnCloudRefresh) return;
      var icon = "\u2601\uFE0F";
      if(kind === "syncing" || kind === "pending" || kind === "locked") icon = "\uD83D\uDD04";
      if(kind === "ok") icon = "\u2601\uFE0F";
      if(kind === "conflict" || kind === "error") icon = "\u26A0\uFE0F";
      if(kind === "forbidden") icon = "\uD83D\uDEAB";
      var ico = btnCloudRefresh.querySelector(".ico");
      if(ico) ico.textContent = icon;
      btnCloudRefresh.setAttribute("data-cloud-state", kind || "idle");

      var label = "Controlla e sincronizza il cloud";
      if(kind === "ok") label = "Cloud aggiornato: controlla di nuovo la sincronizzazione";
      else if(kind === "syncing" || kind === "locked") label = "Sincronizzazione cloud in corso";
      else if(kind === "conflict") label = "Conflitto cloud: premi per caricare la versione cloud";
      else if(kind === "error") label = "Errore cloud: premi per riprovare";
      else if(kind === "forbidden") label = "Ruolo SDAC non autorizzato al Cloud";
      btnCloudRefresh.title = label;
      btnCloudRefresh.setAttribute("aria-label", label);
    }

    function setCloudStatus(kind, message){
      kind = kind || "idle";
      if(cloudSyncStatus){
        cloudSyncStatus.setAttribute("data-state", kind);

        var iconEl = cloudSyncStatus.querySelector(".cloudStatusIcon");
        var textEl = cloudSyncStatus.querySelector(".cloudStatusText");
        var metaEl = cloudSyncStatus.querySelector(".cloudStatusMeta");
        var icon = "\u2601\uFE0F";
        var text = "Non verificato";
        var statusMoment = Date.now();
        var meta = formatCloudTime(statusMoment);
        var detail = message || "";

        if(!isLoggedIn()){
          icon = "\u2601\uFE0F";
          text = "Cloud non attivo";
          detail = message || "Cloud non attivo. Effettua l'accesso per sincronizzare Agenda SDAC.";
        }else if(kind === "ok"){
          icon = "\u2705";
          text = "Aggiornato";
          meta = formatCloudTime(remoteLastCheckedAt || statusMoment);
          detail = "Cloud aggiornato. Ultimo controllo: " + formatCloudDateTime(remoteLastCheckedAt) + ". Ultima modifica: " + formatCloudDateTime(remoteLastKnownUpdatedAt || (state && state.updatedAt)) + ".";
        }else if(kind === "syncing"){
          icon = "\uD83D\uDD04";
          text = "Sincronizzazione";
          detail = message || "Sincronizzazione cloud in corso.";
        }else if(kind === "pending"){
          icon = "\u23F3";
          text = "Controllo richiesto";
          detail = message || "Controllo cloud necessario prima delle modifiche.";
        }else if(kind === "locked"){
          icon = "\uD83D\uDD04";
          text = remoteConflictPending ? "Conflitto da risolvere" : "Verifica cloud";
          detail = message || (remoteConflictPending ? "Risolvi il conflitto dal pulsante Cloud prima di continuare." : "Verifica cloud in corso prima di permettere modifiche.");
        }else if(kind === "conflict"){
          icon = "\u26A0\uFE0F";
          text = "Conflitto cloud";
          detail = message || "Nel cloud ci sono modifiche piu recenti. Premi Cloud per risolvere il conflitto.";
        }else if(kind === "error"){
          icon = "\u26A0\uFE0F";
          text = "Errore cloud";
          detail = message || "Aggiornamento cloud non riuscito. Premi Cloud per riprovare.";
        }else if(kind === "forbidden"){
          icon = "\uD83D\uDEAB";
          text = "Ruolo non autorizzato";
          detail = message || "Questo account non ha un ruolo SDAC valido. Assegna Admin, Socio o Docente da Netlify e accedi di nuovo.";
        }else{
          icon = "\u2601\uFE0F";
          text = "Non verificato";
          detail = message || "Cloud non verificato.";
        }

        if(iconEl && textEl && metaEl){
          iconEl.textContent = icon;
          textEl.textContent = text;
          metaEl.textContent = meta ? "\u00B7 " + meta : "";
          metaEl.hidden = !meta;
        }else{
          cloudSyncStatus.textContent = icon + " " + text + (meta ? " \u00B7 " + meta : "");
        }
        cloudSyncStatus.title = detail;
        cloudSyncStatus.setAttribute("aria-label", detail);
      }
      setCloudButtonState(kind);
    }

    function cloudSessionIsCurrent(generation, userKey){
      return generation === cloudSessionGeneration &&
        userKey === getCurrentCloudUserKey() && isLoggedIn();
    }

    function resetCloudSession(){
      cloudSessionGeneration++;
      cloudSessionVerified = false;
      cloudSessionUserKey = isLoggedIn() ? getCurrentCloudUserKey() : null;
      stopRemotePolling();
      if(remoteSaveTimer){ clearTimeout(remoteSaveTimer); remoteSaveTimer = null; }
      if(remotePullTimer){ clearTimeout(remotePullTimer); remotePullTimer = null; }
      remoteSyncInFlight = false;
      remoteSaveInFlight = false;
      remoteConflictPending = false;
      remoteLastKnownUpdatedAt = null;
      remoteLastCheckedAt = null;
      setCloudWriteLock(true, "sync");
    }

    async function cloudAuthorizationHeaders(){
      var user = getIdentityUser();
      if(!user || typeof user.jwt !== "function") throw new Error("Sessione Identity non disponibile");
      var token = await user.jwt();
      if(!token) throw new Error("Token Identity non disponibile");
      return { "Authorization": "Bearer " + token };
    }

    async function loadRemoteEnvelope(){
      var generation = cloudSessionGeneration;
      var headers = await cloudAuthorizationHeaders();
      if(generation !== cloudSessionGeneration) throw new Error("Sessione cambiata prima della richiesta cloud");
      var res = await fetch("/.netlify/functions/agenda", {
        method:"GET",
        credentials:"same-origin",
        headers:headers,
        cache:"no-store"
      });
      if(res.status === 401) return { ok:false, unauthorized:true, data:null };
      if(res.status === 403) return { ok:false, forbidden:true, data:null };
      if(!res.ok) throw new Error("Remote load failed");
      var obj = await res.json();
      return obj || { ok:true, data:null };
    }

    async function saveRemoteState(payload){
      var generation = cloudSessionGeneration;
      var headers = await cloudAuthorizationHeaders();
      if(generation !== cloudSessionGeneration || !cloudSessionVerified) throw new Error("Sessione non verificata per il salvataggio cloud");
      headers["content-type"] = "application/json";
      var res = await fetch("/.netlify/functions/agenda", {
        method:"PUT",
        credentials:"same-origin",
        headers: headers,
        body: JSON.stringify({
          state: payload,
          baseUpdatedAt: remoteLastKnownUpdatedAt || null
        })
      });

      var obj = null;
      try{ obj = await res.json(); }catch(e){ obj = null; }
      if(res.status === 401){
        var unauthorized = new Error("Sessione cloud scaduta: effettua nuovamente l'accesso.");
        unauthorized.unauthorized = true;
        throw unauthorized;
      }
      if(res.status === 403){
        var forbidden = new Error((obj && (obj.message || obj.error)) || "Ruolo SDAC non autorizzato");
        forbidden.forbidden = true;
        throw forbidden;
      }
      if(res.status === 409){
        var conflict = new Error((obj && (obj.message || obj.error)) || "Remote conflict");
        conflict.conflict = true;
        conflict.remoteUpdatedAt = obj && obj.remoteUpdatedAt;
        conflict.remoteData = obj && obj.data;
        throw conflict;
      }
      if(!res.ok) throw new Error((obj && (obj.message || obj.error)) || "Remote save failed");
      return obj || { ok:true };
    }

    function hasLocalData(s){
      try{
        var notesState = normalizeNotesState(s && s.notes);
        return !!(s && (
          Object.keys(s.events || {}).length ||
          (s.todos || []).length ||
          (s.contacts || []).length ||
          (s.academy && s.academy.years && Object.keys(s.academy.years).some(function(year){ var y=s.academy.years[year]||{}; return (y.students||[]).length || (y.courses||[]).some(function(c){ return (c.lessons||[]).length || (c.teacherEmails||[]).length || c.teacherName || c.lessonTarget; }); })) ||
          (notesState.items || []).length ||
          String(notesState.draftTitle || "").trim().length ||
          String(notesState.draftBody || "").trim().length
        ));
      }catch(e){ return false; }
    }

    function getStateUpdatedAt(s){
      var value = s && s.updatedAt ? Date.parse(s.updatedAt) : NaN;
      return isNaN(value) ? 0 : value;
    }

    function applyRemoteState(remote){
      if(!remote || typeof remote !== "object") return false;
      var remoteBaseUpdatedAt = remote.updatedAt || null;
      var needsSchemaUpgrade = Number(remote.dataVersion || 0) < CURRENT_DATA_VERSION;
      state = normalizeLoadedState(remote);
      remoteLastKnownUpdatedAt = remoteBaseUpdatedAt || state.updatedAt || remoteLastKnownUpdatedAt;
      if(remoteBaseUpdatedAt) setStoredRemoteBaseUpdatedAt(remoteBaseUpdatedAt);
      remoteConflictPending = false;
      if(needsSchemaUpgrade){
        // La normalizzazione puo aver creato ID mancanti o nuovi campi.
        // Diamo alla copia migrata un nuovo timestamp e salviamola sul cloud,
        // cosi tutti gli account condividono la stessa migrazione stabile.
        state.updatedAt = new Date().toISOString();
      }
      try{ localStorage.setItem(getStorageKey(), JSON.stringify(state)); }catch(e){}
      syncNotesUiFromState();
      renderAll();
      updateStorageStatus(true);
      // Le migrazioni di schema non devono mai fare PUT automatici al login.
      return true;
    }

    async function syncFromCloudOrSeed(forceRemoteApply, mandatory){
      if(!isLoggedIn()){
        remoteConflictPending = false;
        setCloudWriteLock(false);
        setCloudStatus("idle", "\u2601\uFE0F Cloud: non attivo");
        return;
      }
      if(!hasAuthorizedCloudRole()){
        remoteConflictPending = false;
        setCloudWriteLock(false);
        setCloudStatus("forbidden");
        return;
      }
      if(remoteSyncInFlight || remoteSaveInFlight){
        if(mandatory) setCloudStatus("locked");
        return;
      }

      var generation = cloudSessionGeneration;
      var userKey = getCurrentCloudUserKey();
      if(mandatory) setCloudWriteLock(true, remoteConflictPending ? "conflict" : "sync");
      remoteSyncInFlight = true;
      setCloudStatus(mandatory ? "locked" : "syncing");

      try{
        var envelope = await loadRemoteEnvelope();
        if(!cloudSessionIsCurrent(generation, userKey)) return;
        if(envelope && envelope.unauthorized){
          remoteConflictPending = false;
          cloudSessionVerified = false;
          setCloudWriteLock(true, "sync");
          setCloudStatus("locked", "Accesso scaduto: dati protetti, effettua un nuovo login.");
          return;
        }
        if(envelope && envelope.forbidden){
          remoteConflictPending = false;
          cloudSessionVerified = false;
          setCloudWriteLock(true, "sync");
          setCloudStatus("forbidden");
          return;
        }

        remoteLastCheckedAt = new Date().toISOString();
        var remote = envelope ? envelope.data : null;
        // In un nuovo accesso il server e la sola fonte autorevole.
        // Non inviare mai automaticamente un archivio locale al cloud.
        if(remote && typeof remote === "object"){
          remoteLastKnownUpdatedAt = remote.updatedAt || null;
          if(!hasLocalData(remote) && hasLocalData(state)){
            cloudSessionVerified = false;
            setCloudWriteLock(true, "sync");
            setCloudStatus("locked", "Il cloud risulta vuoto ma esiste una copia locale. Salvataggi disabilitati per sicurezza.");
            return;
          }
          applyRemoteState(remote);
          cloudSessionVerified = true;
          setCloudWriteLock(false);
          setCloudStatus("ok");
          return;
        }
        // Cloud assente: proteggere sia il server sia le copie locali.
        // Nessuna creazione automatica di un archivio vuoto.
        remoteLastKnownUpdatedAt = null;
        cloudSessionVerified = false;
        setCloudWriteLock(true, "sync");
        setCloudStatus("locked", "Archivio cloud non trovato. Salvataggio disabilitato: verificare il backup prima di procedere.");
      }catch(e){
        if(!cloudSessionIsCurrent(generation, userKey)) return;
        console.warn("Sync cloud fallita:", e);
        if(mandatory){
          setCloudWriteLock(true, remoteConflictPending ? "conflict" : "sync");
          setCloudStatus("locked", "\u26A0\uFE0F Cloud non verificato: premi il pulsante cloud prima di modificare.");
        }else{
          setCloudStatus("error");
        }
      }finally{
        if(generation === cloudSessionGeneration) remoteSyncInFlight = false;
      }
    }

    function scheduleRemoteSave(immediate, allowWhileLocked, unlockAfterSave){
      if(getCurrentAccessRole() === "studente" || !isLoggedIn() || !hasAuthorizedCloudRole()) return;
      if(!cloudSessionVerified || !remoteLastKnownUpdatedAt){
        setCloudWriteLock(true, "sync");
        setCloudStatus("locked", "Archivio cloud non verificato: salvataggio impedito per sicurezza.");
        return;
      }
      if(remoteConflictPending && !allowWhileLocked){
        setCloudWriteLock(true, "conflict");
        setCloudStatus("conflict", "\u26A0\uFE0F Salvataggio bloccato: aggiorna prima la versione cloud dal pulsante cloud.");
        return;
      }
      if(remoteWriteLocked && !allowWhileLocked){
        setCloudStatus("locked", "\uD83D\uDD04 Cloud: attendo l'aggiornamento iniziale prima di salvare.");
        return;
      }
      var generation = cloudSessionGeneration;
      var userKey = getCurrentCloudUserKey();
      if(remoteSaveTimer) clearTimeout(remoteSaveTimer);
      remoteSaveTimer = setTimeout(function(){
        if(!cloudSessionIsCurrent(generation, userKey)) return;
        remoteSaveTimer = null;
        var payload = normalizeLoadedState(JSON.parse(JSON.stringify(state)));
        payload.updatedAt = new Date().toISOString();
        state.updatedAt = payload.updatedAt;
        setCloudStatus("syncing", "\uD83D\uDD04 Cloud: salvataggio in corso...");
        remoteSaveInFlight = true;
        saveRemoteState(payload).then(function(result){
          if(!cloudSessionIsCurrent(generation, userKey)) return;
          var savedAt = (result && result.updatedAt) || payload.updatedAt;
          state.updatedAt = savedAt;
          remoteLastKnownUpdatedAt = savedAt;
          remoteLastCheckedAt = new Date().toISOString();
          remoteConflictPending = false;
          setStoredRemoteBaseUpdatedAt(savedAt);
          try{ localStorage.setItem(getStorageKey(), JSON.stringify(state)); }catch(e){}
          updateStorageStatus(true);
          if(unlockAfterSave) setCloudWriteLock(false);
          setCloudStatus("ok");
        }).catch(function(e){
          if(!cloudSessionIsCurrent(generation, userKey)) return;
          console.warn("Salvataggio cloud fallito:", e);
          if(e && e.forbidden){
            setCloudWriteLock(false);
            setCloudStatus("forbidden");
          }else if(e && e.conflict){
            if(e.remoteUpdatedAt) remoteLastKnownUpdatedAt = e.remoteUpdatedAt;
            remoteConflictPending = true;
            setCloudWriteLock(true, "conflict");
            setCloudStatus("conflict", "\u26A0\uFE0F Cloud piu recente su un altro dispositivo. Salvataggi bloccati: premi il pulsante cloud per aggiornare prima di continuare.");
            window.alert("Nel cloud ci sono modifiche piu recenti fatte da un altro dispositivo. I salvataggi cloud sono stati bloccati. Premi il pulsante cloud per caricare la versione piu recente prima di continuare.");
          }else{
            if(unlockAfterSave) setCloudWriteLock(false);
            setCloudStatus("error");
          }
        }).finally(function(){
          if(generation === cloudSessionGeneration) remoteSaveInFlight = false;
        });
      }, immediate ? 0 : REMOTE_SYNC_DEBOUNCE_MS);
    }

    function startRemotePolling(){
      stopRemotePolling();
      if(getCurrentAccessRole() === "studente" || !isLoggedIn() || !hasAuthorizedCloudRole()) return;
      remotePollHandle = setInterval(function(){
        if(document.visibilityState === "visible" && !remoteSyncInFlight && !remoteSaveInFlight && !remoteConflictPending && !remoteSaveTimer){
          scheduleRemoteRefresh(false, remoteWriteLocked);
        }
      }, REMOTE_SYNC_POLL_MS);
    }

    function stopRemotePolling(){
      if(remotePollHandle){
        clearInterval(remotePollHandle);
        remotePollHandle = null;
      }
    }

    function scheduleRemoteRefresh(forcePull, mandatory){
      if(getCurrentAccessRole() === "studente" || !isLoggedIn() || !hasAuthorizedCloudRole()) return;
      if(remotePullTimer) clearTimeout(remotePullTimer);
      remotePullTimer = setTimeout(function(){
        syncFromCloudOrSeed(!!forcePull, !!mandatory);
      }, mandatory ? 0 : 350);
    }

    function beginMandatoryCloudRefresh(){
      if(!isLoggedIn()){
        remoteConflictPending = false;
        setCloudWriteLock(false);
        setCloudStatus("idle", "\u2601\uFE0F Cloud: non attivo");
        return;
      }
      if(!hasAuthorizedCloudRole()){
        remoteConflictPending = false;
        setCloudWriteLock(false);
        setCloudStatus("forbidden");
        return;
      }
      setCloudWriteLock(true, "sync");
      setCloudStatus("locked");
      // Il controllo iniziale confronta le versioni: non forza piu il cloud
      // sopra una copia locale eventualmente piu recente.
      scheduleRemoteRefresh(false, true);
    }

    function handleManualCloudRefresh(){
      if(!isLoggedIn()){
        alert("Accedi prima al cloud SDAC.");
        return;
      }
      if(!hasAuthorizedCloudRole()){
        alert("Questo account non ha un ruolo SDAC valido. Assegna Admin, Socio o Docente da Netlify e accedi di nuovo.");
        setCloudStatus("forbidden");
        return;
      }
      if(remoteConflictPending){
        setCloudWriteLock(true, "conflict");
        setCloudStatus("locked", "\uD83D\uDD04 Cloud: risoluzione conflitto in corso...");
        // Dopo un conflitto esplicito il pulsante Cloud fa da risoluzione
        // intenzionale: carica la versione remota e sblocca i salvataggi.
        scheduleRemoteRefresh(true, true);
        return;
      }
      beginMandatoryCloudRefresh();
    }
    // --- /Cloud sync ---


    function getSavedTheme(){
      try{
        var stored = localStorage.getItem(THEME_KEY);
        return stored === "light" ? "light" : "dark";
      }catch(e){
        return "dark";
      }
    }

    function getThemeMeta(){
      return document.getElementById("themeColorMeta") || document.querySelector('meta[name="theme-color"]');
    }

    function updateThemeToggleUi(){
      if(!themeToggleBtn) return;
      var currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      var nextLabel = currentTheme === "light" ? "Passa alla modalità scura" : "Passa alla modalità chiara";
      if(themeToggleIcon) themeToggleIcon.textContent = currentTheme === "light" ? "🌙" : "☀️";
      themeToggleBtn.title = nextLabel;
      themeToggleBtn.setAttribute("aria-label", nextLabel);
      themeToggleBtn.setAttribute("aria-pressed", currentTheme === "light" ? "true" : "false");
    }

    function applyTheme(theme, persist){
      var normalizedTheme = theme === "light" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", normalizedTheme);
      document.documentElement.style.colorScheme = normalizedTheme;
      var meta = getThemeMeta();
      if(meta) meta.setAttribute("content", normalizedTheme === "light" ? THEME_META_LIGHT : THEME_META_DARK);
      if(persist !== false){
        try{ localStorage.setItem(THEME_KEY, normalizedTheme); }catch(e){}
      }
      updateThemeToggleUi();
    }

    function toggleTheme(){
      var currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      applyTheme(currentTheme === "light" ? "dark" : "light");
    }

    // DOM
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
    var viewCalendar = $("#view-calendar");
    var viewNotebook = $("#view-notebook");
    var viewToday = $("#view-today");
    var viewCourses = $("#view-courses");
    var viewStudents = $("#view-students");
    var viewAdministration = $("#view-administration");

    var calListGrid = $("#calListGrid");

    var monthTitle = $("#monthTitle");
    var prevMonth = $("#prevMonth");
    var nextMonth = $("#nextMonth");
    var jumpToday = $("#jumpToday");

    var storageStatus = $("#storageStatus");
    var cloudSyncStatus = $("#cloudSyncStatus");
    var themeToggleBtn = $("#themeToggleBtn");
    var themeToggleIcon = $("#themeToggleIcon");
    var agendaWeekCard = $("#agendaWeekCard");
    var todoMiniPanel = $("#todoMiniPanel");
    var toggleTodos = $("#toggleTodos");
    var openTodosBtn = $("#openTodosBtn");
    var todoActiveList = $("#todoActiveList");

    var agendaWeekCount = $("#agendaWeekCount");
    var agendaWeekList = $("#agendaWeekList");
    var notebookHeaderBtn = $("#notebookHeaderBtn");
    var sessionRoleBadgeHeader = $("#sessionRoleBadge");
    var settingsMenuWrap = $("#settingsMenuWrap");
    var settingsMenuBtn = $("#settingsMenuBtn");
    var settingsMenu = $("#settingsMenu");
    var btnExport = $("#btnExport");
    var btnImportTrigger = $("#btnImportTrigger");
    var importFile = $("#importFile");
    var btnReset = $("#btnReset");
    var btnCloudRefresh = $("#btnCloudRefresh");

    var todoSearch = $("#todoSearch");
    var todoFilter = $("#todoFilter");
    var todoText = $("#todoText");
    var todoPriority = $("#todoPriority");
    var todoTag = $("#todoTag");
    var addTodo = $("#addTodo");
    var todoTotalCount = $("#todoTotalCount");
    var todoList = $("#todoList");

    var quickNoteTitle = $("#quickNoteTitle");
    var quickNotes = $("#quickNotes");
    var btnSaveNote = $("#btnSaveNote");
    var btnNotesFavorites = $("#btnNotesFavorites");
    var btnOpenNoteEditor = $("#btnOpenNoteEditor");
    var notesListCard = $("#notesListCard");
    var notesEditorCard = $("#notesEditorCard");
    var notesList = $("#notesList");
    var notesCount = $("#notesCount");
    var notesEditorStatus = $("#notesEditorStatus");



    var courseGrid = $("#courseGrid");
    var courseDetailCard = $("#courseDetailCard");
    var courseDetailEyebrow = $("#courseDetailEyebrow");
    var courseDetailTitle = $("#courseDetailTitle");
    var courseDetailMeta = $("#courseDetailMeta");
    var closeCourseDetailBtn = $("#closeCourseDetailBtn");
    var coursesVisibleCount = $("#coursesVisibleCount");
    var coursesStudentCount = $("#coursesStudentCount");
    var coursesRoleHint = $("#coursesRoleHint");
    var courseSettingsCard = $("#courseSettingsCard");
    var courseTeacherName = $("#courseTeacherName");
    var courseTeacherEmail = $("#courseTeacherEmail");
    var courseWeekday = $("#courseWeekday");
    var courseStartTime = $("#courseStartTime");
    var courseEndTime = $("#courseEndTime");
    var courseFirstDate = $("#courseFirstDate");
    var courseLessonTarget = $("#courseLessonTarget");
    var saveCourseSettingsBtn = $("#saveCourseSettingsBtn");
    var courseRoster = $("#courseRoster");
    var courseRosterCount = $("#courseRosterCount");
    var lessonEditingId = $("#lessonEditingId");
    var lessonDate = $("#lessonDate");
    var lessonStartTime = $("#lessonStartTime");
    var lessonEndTime = $("#lessonEndTime");
    var lessonTopic = $("#lessonTopic");
    var lessonNotes = $("#lessonNotes");
    var lessonAttendanceEditor = $("#lessonAttendanceEditor");
    var markAllPresentBtn = $("#markAllPresentBtn");
    var saveLessonBtn = $("#saveLessonBtn");
    var cancelLessonEditBtn = $("#cancelLessonEditBtn");
    var courseLessonList = $("#courseLessonList");
    var courseLessonCount = $("#courseLessonCount");

    var addStudentBtn = $("#addStudentBtn");
    var studentSearch = $("#studentSearch");
    var studentCourseFilter = $("#studentCourseFilter");
    var studentList = $("#studentList");
    var studentListMeta = $("#studentListMeta");
    var studentOverlay = $("#studentOverlay");
    var studentModalTitle = $("#studentModalTitle");
    var studentEditingId = $("#studentEditingId");
    var studentFirstName = $("#studentFirstName");
    var studentLastName = $("#studentLastName");
    var studentEmail = $("#studentEmail");
    var studentPhone = $("#studentPhone");
    var studentCourseChecks = $("#studentCourseChecks");
    var studentNotes = $("#studentNotes");
    var studentAttendanceSummary = $("#studentAttendanceSummary");
    var saveStudentBtn = $("#saveStudentBtn");
    var deleteStudentBtn = $("#deleteStudentBtn");
    var closeStudentBtn = $("#closeStudentBtn");
    var selectedCourseId = null;
    var coursesListScrollY = null;

    var administrationAcademicYear = $("#administrationAcademicYear");
    var administrationRoleHint = $("#administrationRoleHint");
    var administrationExpectedTotal = $("#administrationExpectedTotal");
    var administrationPaidTotal = $("#administrationPaidTotal");
    var administrationBalanceTotal = $("#administrationBalanceTotal");
    var administrationOverdueCount = $("#administrationOverdueCount");
    var administrationSectionTabs = $("#administrationSectionTabs");
    var administrationOverviewPanel = $("#administrationOverviewPanel");
    var administrationFeesPanel = $("#administrationFeesPanel");
    var administrationDeadlinesPanel = $("#administrationDeadlinesPanel");
    var administrationCourseSummary = $("#administrationCourseSummary");
    var administrationSearch = $("#administrationSearch");
    var administrationCourseFilter = $("#administrationCourseFilter");
    var administrationStatusFilter = $("#administrationStatusFilter");
    var administrationFeesMeta = $("#administrationFeesMeta");
    var administrationFeeList = $("#administrationFeeList");
    var administrationDeadlineList = $("#administrationDeadlineList");
    var financeOverlay = $("#financeOverlay");
    var financeModalCourse = $("#financeModalCourse");
    var financeModalTitle = $("#financeModalTitle");
    var financeStudentId = $("#financeStudentId");
    var financeCourseId = $("#financeCourseId");
    var financeFeeDisplay = $("#financeFeeDisplay");
    var financePaidDisplay = $("#financePaidDisplay");
    var financeBalanceDisplay = $("#financeBalanceDisplay");
    var financeStatusDisplay = $("#financeStatusDisplay");
    var financeCourseFee = $("#financeCourseFee");
    var financeNextDueDate = $("#financeNextDueDate");
    var financeNextDueNote = $("#financeNextDueNote");
    var saveFinanceSettingsBtn = $("#saveFinanceSettingsBtn");
    var financePaymentList = $("#financePaymentList");
    var financePaymentKind = $("#financePaymentKind");
    var financePaymentAmount = $("#financePaymentAmount");
    var financePaymentDate = $("#financePaymentDate");
    var financePaymentMethod = $("#financePaymentMethod");
    var financePaymentNote = $("#financePaymentNote");
    var addFinancePaymentBtn = $("#addFinancePaymentBtn");
    var closeFinanceBtn = $("#closeFinanceBtn");
    var administrationActiveSection = null;
    var administrationFocusStudentId = null;

    var todayPrevBtn = $("#todayPrevBtn");
    var todayNextBtn = $("#todayNextBtn");
    var topTodayLine = $("#todayLine");

    function roleDisplayName(role){
      if(role === "admin") return "Admin";
      if(role === "socio") return "Socio";
      if(role === "docente") return "Docente";
      if(role === "none") return "account senza ruolo";
      return "utente non autenticato";
    }

    function canCurrentRoleAccess(feature){
      return roleCanAccess(currentAccessRole, feature);
    }

    function roleRestrictionMessage(feature){
      var label = feature === "notebook" ? "Taccuino" : feature === "contacts" ? "Rubrica" : feature === "courses" ? "Corsi" : feature === "students" ? "Studenti" : feature === "administration" ? "Amministrazione" : feature === "settings" ? "Impostazioni" : "Questa area";
      if(currentAccessRole === "guest") return label + " richiede un account SDAC autorizzato.";
      if(currentAccessRole === "none") return label + " non è disponibile finché all'account non viene assegnato un ruolo SDAC.";
      return label + " non è disponibile per il ruolo " + roleDisplayName(currentAccessRole) + ".";
    }

    function setRoleLockedElement(el, locked, message){
      if(!el) return;
      el.classList.toggle("isRoleLocked", !!locked);
      el.setAttribute("aria-disabled", locked ? "true" : "false");
      if(!el.getAttribute("data-role-title")) el.setAttribute("data-role-title", el.getAttribute("title") || "");
      el.setAttribute("title", locked ? message : (el.getAttribute("data-role-title") || ""));
    }

    function applyRolePermissions(user){
      var resolvedUser = arguments.length ? user : getIdentityUser();
      currentAccessRole = getRoleFromUser(resolvedUser);
      try{ document.body.setAttribute("data-sdac-role", currentAccessRole); }catch(e){}

      var notebookAllowed = canCurrentRoleAccess("notebook");
      var settingsAllowed = canCurrentRoleAccess("settings");
      var coursesAllowed = canCurrentRoleAccess("courses");
      var studentsAllowed = canCurrentRoleAccess("students");
      var administrationAllowed = canCurrentRoleAccess("administration");

      tabs.forEach(function(tab){
        var view = tab.getAttribute("data-view");
        if(view === "calendar") { tab.classList.toggle("roleFeatureHidden", !canCurrentRoleAccess("calendar")); setRoleLockedElement(tab, !canCurrentRoleAccess("calendar"), roleRestrictionMessage("calendar")); }
        else if(view === "notebook") setRoleLockedElement(tab, !notebookAllowed, roleRestrictionMessage("notebook"));
        else if(view === "courses") setRoleLockedElement(tab, !coursesAllowed, roleRestrictionMessage("courses"));
        else if(view === "students") setRoleLockedElement(tab, !studentsAllowed, roleRestrictionMessage("students"));
        else if(view === "administration") { tab.classList.toggle("roleFeatureHidden", !administrationAllowed); setRoleLockedElement(tab, !administrationAllowed, roleRestrictionMessage("administration")); }
        else setRoleLockedElement(tab, false, "");
      });

      setRoleLockedElement(settingsMenuBtn, !settingsAllowed, roleRestrictionMessage("settings"));
      if(notebookHeaderBtn) notebookHeaderBtn.hidden = !notebookAllowed;
      if(sessionRoleBadgeHeader){
        sessionRoleBadgeHeader.tabIndex = settingsAllowed ? 0 : -1;
        sessionRoleBadgeHeader.classList.toggle("adminSettingsTrigger", settingsAllowed);
        sessionRoleBadgeHeader.setAttribute("aria-haspopup", settingsAllowed ? "menu" : "false");
        sessionRoleBadgeHeader.setAttribute("title", settingsAllowed ? "Admin · Apri Impostazioni" : "Ruolo attivo: " + currentAccessRole);
      }
      if(!settingsAllowed && typeof setSettingsMenuOpen === "function") setSettingsMenuOpen(false);

      var todoPanelCard = todoMiniPanel && todoMiniPanel.closest ? todoMiniPanel.closest(".todoPanelCard") : null;
      if(todoPanelCard) todoPanelCard.classList.toggle("roleFeatureHidden", !notebookAllowed);

      if((currentView === "calendar" && (currentAccessRole === "docente" || currentAccessRole === "studente")) || (currentView === "notebook" && !notebookAllowed) || (currentView === "courses" && !coursesAllowed) || (currentView === "students" && !studentsAllowed) || (currentView === "administration" && !administrationAllowed)){
        setView((currentAccessRole === "docente" || currentAccessRole === "studente") ? "courses" : "calendar", true);
      }
      if(addStudentBtn) addStudentBtn.hidden = (currentAccessRole === "docente" || currentAccessRole === "studente");
      var studentTab=document.querySelector('[data-view="students"] .tabText');
      if(studentTab) studentTab.textContent=currentAccessRole === "studente" ? "La mia scheda" : "Studenti";
      if(currentView === "courses") renderCourses();
      if(currentView === "students") renderStudents();
      if(currentView === "administration") renderAdministration();
    }

    function getNotesState(){
      if(!state.notes || typeof state.notes !== "object") state.notes = normalizeNotesState(state.notes);
      return state.notes;
    }

    function getSortedNotes(){
      return getNotesState().items.slice().sort(function(a,b){
        if(!!a.favorite !== !!b.favorite) return a.favorite ? -1 : 1;
        if((a.position || 0) !== (b.position || 0)) return (a.position || 0) - (b.position || 0);
        return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
      });
    }

    function getNoteById(id){
      return getNotesState().items.find(function(item){ return item.id === id; }) || null;
    }

    function getNextNotePosition(){
      var items = getNotesState().items;
      if(!items.length) return 0;
      return items.reduce(function(max, item){
        return Math.max(max, typeof item.position === "number" ? item.position : 0);
      }, 0) + 1;
    }

    function syncNotesUiFromState(){
      var notesState = getNotesState();
      if(quickNoteTitle) quickNoteTitle.value = notesState.draftTitle || "";
      if(quickNotes) quickNotes.value = notesState.draftBody || "";
      if(typeof setCollapsed === "function"){
        if(notesListCard) setCollapsed(notesListCard, !notesState.listOpen);
        if(notesEditorCard) setCollapsed(notesEditorCard, !notesState.editorOpen);
      }
      if(btnNotesFavorites){
        btnNotesFavorites.classList.toggle("isActive", !!notesState.favoritesOnly);
        btnNotesFavorites.setAttribute("aria-pressed", notesState.favoritesOnly ? "true" : "false");
      }
    }

    function updateNotesEditorStatus(){
      if(!notesEditorStatus) return;
      var current = getNoteById(getNotesState().currentId);
      if(current){
        notesEditorStatus.textContent = "Modifica: " + (current.title || "Nota senza titolo");
      }else{
        notesEditorStatus.textContent = "Nuova nota";
      }
    }

    function buildNotePreview(note){
      var body = String((note && note.body) || "").trim();
      if(!body) return "Nota vuota.";
      if(body.length > 140) return body.slice(0, 139) + "…";
      return body;
    }

    function renderNotes(){
      if(!notesList) return;

      syncNotesUiFromState();
      updateNotesEditorStatus();

      var notesState = getNotesState();
      var allItems = getSortedNotes();
      var items = notesState.favoritesOnly ? allItems.filter(function(note){ return !!note.favorite; }) : allItems;

      if(notesCount){
        if(!allItems.length){
          notesCount.textContent = "Nessuna nota";
        }else if(notesState.favoritesOnly){
          notesCount.textContent = items.length ? (items.length === 1 ? "1 preferita" : items.length + " preferite") : "Nessuna preferita";
        }else{
          notesCount.textContent = allItems.length === 1 ? "1 nota" : allItems.length + " note";
        }
      }
      notesList.innerHTML = "";

      if(!notesState.listOpen) return;

      if(!items.length){
        var empty = document.createElement("div");
        empty.className = "emptyState";
        empty.textContent = notesState.favoritesOnly ? "Nessuna nota preferita." : "Nessuna nota salvata.";
        notesList.appendChild(empty);
        return;
      }

      items.forEach(function(note, index){
        var item = document.createElement("div");
        item.className = "item noteItem noteColor--" + normalizeNoteColor(note.color) + (notesState.currentId === note.id ? " active" : "");
        item.setAttribute("role", "button");
        item.tabIndex = 0;
        item.title = "Apri nota";

        function openNote(){
          notesState.currentId = note.id;
          notesState.draftTitle = note.title || "";
          notesState.draftBody = note.body || "";
          notesState.editorOpen = true;
          notesState.listOpen = true;
          syncNotesUiFromState();
          updateNotesEditorStatus();
          renderNotes();
          try{ quickNoteTitle.focus(); }catch(e){}
        }

        item.addEventListener("click", function(e){
          if(e.target && e.target.closest && e.target.closest(".noteItemActions")) return;
          openNote();
        });
        item.addEventListener("keydown", function(e){
          if(e.key === "Enter" || e.key === " "){
            e.preventDefault();
            openNote();
          }
        });

        var main = document.createElement("div");
        main.className = "noteItemMain";

        var head = document.createElement("div");
        head.className = "noteItemHead";

        var title = document.createElement("div");
        title.className = "noteItemTitle";

        var titleText = document.createElement("span");
        titleText.textContent = note.title || "Nota senza titolo";
        title.appendChild(titleText);

        var actions = document.createElement("div");
        actions.className = "noteItemActions";

        function makeBtn(text, titleText, onClick, extraClass, disabled){
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "smallBtn noteActionBtn" + (extraClass ? " " + extraClass : "");
          btn.textContent = text;
          btn.title = titleText;
          btn.setAttribute("aria-label", titleText);
          if(disabled){
            btn.disabled = true;
            btn.classList.add("isDisabled");
          }
          btn.addEventListener("click", function(e){
            e.stopPropagation();
            if(disabled) return;
            onClick();
          });
          return btn;
        }

        var prev = items[index - 1] || null;
        var next = items[index + 1] || null;
        var canMoveUp = !!(prev && !!prev.favorite === !!note.favorite);
        var canMoveDown = !!(next && !!next.favorite === !!note.favorite);

        actions.appendChild(makeBtn(note.favorite ? "★" : "☆", note.favorite ? "Togli dai preferiti" : "Aggiungi ai preferiti", function(){
          note.favorite = !note.favorite;
          note.updatedAt = new Date().toISOString();
          touchAndSave();
          renderNotes();
        }, note.favorite ? "isActive" : ""));

        actions.appendChild(makeBtn("◉", "Cambia colore: " + noteColorLabel(note.color), function(){
          var currentIndex = NOTE_COLOR_ORDER.indexOf(normalizeNoteColor(note.color));
          note.color = NOTE_COLOR_ORDER[(currentIndex + 1) % NOTE_COLOR_ORDER.length];
          note.updatedAt = new Date().toISOString();
          touchAndSave();
          renderNotes();
        }));

        actions.appendChild(makeBtn("↑", "Sposta su", function(){
          moveNote(note.id, -1);
        }, "", !canMoveUp));

        actions.appendChild(makeBtn("↓", "Sposta giù", function(){
          moveNote(note.id, 1);
        }, "", !canMoveDown));

        actions.appendChild(makeBtn("✕", "Elimina nota", function(){
          deleteNote(note.id);
        }, "danger"));

        head.appendChild(title);
        head.appendChild(actions);

        var preview = document.createElement("div");
        preview.className = "noteItemPreview";
        preview.textContent = buildNotePreview(note);

        main.appendChild(head);
        main.appendChild(preview);

        item.appendChild(main);
        notesList.appendChild(item);
      });
    }

    function moveNote(id, direction){
      var items = getSortedNotes();
      var index = items.findIndex(function(item){ return item.id === id; });
      if(index < 0) return;
      var targetIndex = index + direction;
      if(targetIndex < 0 || targetIndex >= items.length) return;

      var current = items[index];
      var target = items[targetIndex];
      if(!!current.favorite !== !!target.favorite) return;

      var currentPosition = current.position || 0;
      current.position = target.position || 0;
      target.position = currentPosition;
      current.updatedAt = new Date().toISOString();
      target.updatedAt = new Date().toISOString();

      touchAndSave();
      renderNotes();
    }

    function deleteNote(id){
      var note = getNoteById(id);
      if(!note) return;
      if(!window.confirm('Vuoi eliminare "' + (note.title || "questa nota") + '"?')) return;

      var notesState = getNotesState();
      notesState.items = notesState.items.filter(function(item){ return item.id !== id; });

      if(notesState.currentId === id){
        notesState.currentId = null;
        notesState.draftTitle = "";
        notesState.draftBody = "";
      }

      notesState.items.forEach(function(item, index){
        item.position = index;
      });

      touchAndSave();
      renderNotes();
    }

    function saveCurrentNote(){
      var notesState = getNotesState();
      var title = String((quickNoteTitle && quickNoteTitle.value) || "").trim();
      var body = String((quickNotes && quickNotes.value) || "").trim();

      if(!title){
        if(quickNoteTitle) quickNoteTitle.focus();
        return;
      }

      var current = getNoteById(notesState.currentId);
      if(current){
        current.title = title;
        current.body = body;
        current.updatedAt = new Date().toISOString();
      }else{
        var nowISO = new Date().toISOString();
        current = normalizeNote({
          id: uid(),
          title: title,
          body: body,
          color: "cream",
          favorite: false,
          position: getNextNotePosition(),
          createdAt: nowISO,
          updatedAt: nowISO
        }, getNextNotePosition());
        notesState.items.push(current);
        notesState.currentId = current.id;
      }

      notesState.draftTitle = current.title;
      notesState.draftBody = current.body;
      notesState.listOpen = true;
      notesState.editorOpen = false;

      touchAndSave();
      renderNotes();
    }

    function startNewNote(){
      var notesState = getNotesState();
      notesState.currentId = null;
      notesState.draftTitle = "";
      notesState.draftBody = "";
      notesState.editorOpen = true;
      notesState.listOpen = true;
      syncNotesUiFromState();
      updateNotesEditorStatus();
      renderNotes();
      try{ quickNoteTitle.focus(); }catch(e){}
      touchAndSave();
    }

    function toggleNotesList(){
      var notesState = getNotesState();
      notesState.listOpen = !notesState.listOpen;
      syncNotesUiFromState();
      renderNotes();
      touchAndSave();
    }

    function toggleNotesFavorites(){
      var notesState = getNotesState();
      notesState.favoritesOnly = !notesState.favoritesOnly;
      notesState.listOpen = true;
      syncNotesUiFromState();
      renderNotes();
      touchAndSave();
    }

    function openNotesEditorFromList(ev){
      if(ev){
        ev.preventDefault();
        ev.stopPropagation();
      }
      startNewNote();
    }

    // Contacts
    var contactSearch = $("#contactSearch");
    var contactCategoryFilter = $("#contactCategoryFilter");
    var openContactBtn = $("#openContactBtn");
    var contactList = $("#contactList");
    var contactsMeta = $("#contactsMeta");

    var contactOverlay = $("#contactOverlay");
    var contactModalTitle = $("#contactModalTitle");
    var closeContactBtn = $("#closeContactBtn");
    var saveContactBtn = $("#saveContactBtn");
    var contactName = $("#contactName");
    var contactPhone = $("#contactPhone");
    var contactEmail = $("#contactEmail");
    var contactCategory = $("#contactCategory");
    var contactNotes = $("#contactNotes");

    var editingContactId = null;
    var expandedContactId = null;

    // Day modal
    var overlay = $("#dayOverlay");
    var dayTitle = $("#dayTitle");
    var dayEventsList = $("#dayEventsList");
    var btnCloseDay = $("#btnCloseDay");
    var btnPrintDay = $("#btnPrintDay");

    var evTime = $("#evTime");
    var evTitle = $("#evTitle");
    var evNotes = $("#evNotes");
    var evWhere = $("#evWhere");
    var evCat = $("#evCat");
    var btnAddEvent = $("#btnAddEvent");
    var btnCancelEventEdit = $("#btnCancelEventEdit");
    var addEventTitle = $("#addEventTitle");
    var editingEventId = null;

var addEventCard = document.getElementById("addEventCard");
var eventsCard   = document.getElementById("eventsCard");
var todoAddCard  = document.getElementById("todoAddCard");
var todoListCard = document.getElementById("todoListCard");

function setCollapsed(card, collapsed){
  if(!card) return;
  card.classList.toggle("collapsed", collapsed);
  var header = card.querySelector(".collapsibleHeader");
  if(header) header.setAttribute("aria-expanded", collapsed ? "false" : "true");
}

function wireCollapse(card){
  if(!card) return;
  var header = card.querySelector(".collapsibleHeader");
  if(!header) return;

  function toggle(){
    var isCollapsed = card.classList.contains("collapsed");
    setCollapsed(card, !isCollapsed);
    var isNowOpen = !card.classList.contains("collapsed");

    if(card.id === "notesListCard"){
  var notesState = getNotesState();
  notesState.listOpen = isNowOpen;
  renderNotes();
  touchAndSave();
}

    if(card.id === "notesEditorCard"){
      var editorState = getNotesState();
      editorState.editorOpen = isNowOpen;
      touchAndSave();
    }

    // Se sto aprendo "Aggiungi evento", metto il focus sul titolo
    if(card.id === "addEventCard" && isCollapsed){
      setTimeout(function(){
        try{ evTitle.focus(); }catch(e){}
      }, 60);
    }

    if(card.id === "todoAddCard" && isCollapsed){
      setTimeout(function(){
        try{ todoText.focus(); }catch(e){}
      }, 60);
    }

    if(card.id === "todoListCard" && isCollapsed){
      setTimeout(function(){
        try{ todoSearch.focus(); }catch(e){}
      }, 60);
    }

    if(card.id === "notesEditorCard" && isCollapsed){
      setTimeout(function(){
        try{ quickNoteTitle.focus(); }catch(e){}
      }, 60);
    }
  }

  header.addEventListener("click", function(e){
  if(e.target && e.target.closest && e.target.closest("button")) return;
  toggle();
  });
  
  header.addEventListener("keydown", function(e){
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      toggle();
    }
  });
}

function resetEventForm(){
  editingEventId = null;
  if(addEventTitle) addEventTitle.textContent = "Aggiungi evento";
  if(btnAddEvent) btnAddEvent.textContent = "Aggiungi";
  if(btnCancelEventEdit) btnCancelEventEdit.hidden = true;
  if(evTime) evTime.value = "";
  if(evTitle) evTitle.value = "";
  if(evNotes) evNotes.value = "";
  if(evWhere) evWhere.value = "";
  if(evCat) evCat.value = "other";
}

function startEventEdit(ev){
  if(!ev) return;
  editingEventId = ev.id || null;
  if(addEventTitle) addEventTitle.textContent = "Modifica evento";
  if(btnAddEvent) btnAddEvent.textContent = "Salva modifiche";
  if(btnCancelEventEdit) btnCancelEventEdit.hidden = false;
  if(evTime) evTime.value = ev.time || "";
  if(evTitle) evTitle.value = ev.title || "";
  if(evNotes) evNotes.value = ev.notes || "";
  if(evWhere) evWhere.value = ev.where || "";
  if(evCat) evCat.value = normalizeEventCategory(ev.cat);

  setCollapsed(addEventCard, false);
  setCollapsed(eventsCard, false);

  setTimeout(function(){
    try{ evTitle.focus(); }catch(e){}
  }, 30);
}

function cancelEventEdit(){
  resetEventForm();
  setCollapsed(addEventCard, true);
  setCollapsed(eventsCard, false);
}

function handleEventSubmit(){
  if(editingEventId) updateEvent();
  else addEvent();
}

function iconSvg(name){
  if(name === "edit") return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>';
  if(name === "trash") return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
  return "";
}

wireCollapse(addEventCard);
wireCollapse(eventsCard);
wireCollapse(agendaWeekCard);
wireCollapse(todoAddCard);
wireCollapse(todoListCard);
wireCollapse(notesListCard);
wireCollapse(notesEditorCard);
resetEventForm();
    function setView(view, silent){
      if((view === "calendar" && !canCurrentRoleAccess("calendar")) || (view === "notebook" && !canCurrentRoleAccess("notebook")) || (view === "courses" && !canCurrentRoleAccess("courses")) || (view === "students" && !canCurrentRoleAccess("students")) || (view === "administration" && !canCurrentRoleAccess("administration"))){
        if(!silent) window.alert(roleRestrictionMessage(view));
        return false;
      }
      currentView = view;
      tabs.forEach(function(t){ t.classList.toggle("active", t.getAttribute("data-view") === view); });
      if(viewCalendar) viewCalendar.classList.toggle("hidden", view !== "calendar");
      if(viewNotebook) viewNotebook.classList.toggle("hidden", view !== "notebook");
      if(viewToday) viewToday.classList.toggle("hidden", view !== "today");
      if(topTodayLine){
        topTodayLine.classList.toggle("isActive", view === "today");
        if(view === "today") topTodayLine.setAttribute("aria-current", "page");
        else topTodayLine.removeAttribute("aria-current");
      }
      if(viewCourses) viewCourses.classList.toggle("hidden", view !== "courses");
      if(viewStudents) viewStudents.classList.toggle("hidden", view !== "students");
      if(viewAdministration) viewAdministration.classList.toggle("hidden", view !== "administration");

      if(view === "calendar") renderSummary();
      if(view === "notebook"){
        renderTodos();
        renderNotes();
        renderContacts();
      }
      if(view === "today") renderTodayPanel();
      if(view === "courses") renderCourses();
      if(view === "students") renderStudents();
      if(view === "administration") renderAdministration();
      if(!internalNavStack.length) replaceInternalNavState();
      return true;
    }

function getTodayViewDate(){
  var base = getTodayDate();
  base.setDate(base.getDate() + todayViewOffset);
  return base;
}

function renderTodayPanel(){
  if(window.renderTodayView) window.renderTodayView(getTodayViewDate(), { offset: todayViewOffset });
}

function openNotebookToAddTodo(){
  if(!setView("notebook")) return;
  if(todoAddCard) setCollapsed(todoAddCard, false);
  setTimeout(function(){
    try{
      todoText.scrollIntoView({ behavior:"smooth", block:"center" });
      todoText.focus();
    }catch(e){}
  }, 50);
}


function getContactExcerpt(contact){
  var raw = String((contact && contact.notes) || "").trim();
  if(!raw) raw = String((contact && contact.phone) || (contact && contact.email) || "").trim();
  if(!raw) raw = "Nessun dettaglio aggiunto.";
  if(raw.length > 88) raw = raw.slice(0, 87) + "…";
  return raw;
}

function filteredContacts(){
  var q = String((contactSearch && contactSearch.value) || "").trim().toLowerCase();
  var cat = String((contactCategoryFilter && contactCategoryFilter.value) || "all");
  var items = (state.contacts || []).map(normalizeContact);

  if(q){
    items = items.filter(function(contact){
      return [contact.name, contact.phone, contact.email, contact.notes].some(function(value){
        return String(value || "").toLowerCase().indexOf(q) !== -1;
      });
    });
  }

  if(cat !== "all") items = items.filter(function(contact){ return contact.category === cat; });

  items.sort(function(a,b){
    return (a.name || "").localeCompare((b.name || ""), "it", { sensitivity:"base" });
  });

  return items;
}

function openContactModal(contactId){
  if(!contactOverlay) return;

  var contact = null;
  if(contactId){
    contact = (state.contacts || []).find(function(item){ return item.id === contactId; }) || null;
  }

  editingContactId = contact ? contact.id : null;
  contactModalTitle.textContent = contact ? "Modifica contatto" : "Aggiungi contatto";
  saveContactBtn.textContent = contact ? "Salva modifiche" : "Salva";

  contactName.value = contact ? (contact.name || "") : "";
  contactPhone.value = contact ? (contact.phone || "") : "";
  contactEmail.value = contact ? (contact.email || "") : "";
  contactCategory.value = contact ? normalizeContactCategory(contact.category) : "altro";
  contactNotes.value = contact ? (contact.notes || "") : "";

  contactOverlay.style.display = "flex";
  contactOverlay.setAttribute("aria-hidden", "false");
  pushInternalNavLayer("contact", closeContactModalDirect);

  setTimeout(function(){
    try{ contactName.focus(); }catch(e){}
  }, 30);
}

function closeContactModalDirect(){
  if(!contactOverlay) return;
  contactOverlay.style.display = "none";
  contactOverlay.setAttribute("aria-hidden", "true");
  editingContactId = null;
}

function closeContactModal(){
  closeInternalNavLayer("contact", closeContactModalDirect);
}

function saveContact(){
  if(!contactName) return;

  var payload = normalizeContact({
    id: editingContactId || uid(),
    name: contactName.value,
    phone: contactPhone.value,
    email: contactEmail.value,
    category: contactCategory.value,
    notes: contactNotes.value
  });

  if(!payload.name){
    contactName.focus();
    return;
  }

  if(!Array.isArray(state.contacts)) state.contacts = [];

  var existingIndex = state.contacts.findIndex(function(item){ return item.id === payload.id; });
  if(existingIndex >= 0) state.contacts[existingIndex] = payload;
  else state.contacts.unshift(payload);

  expandedContactId = payload.id;
  touchAndSave();
  closeContactModal();
  renderContacts();
  setView("notebook");
}

function deleteContact(id){
  var contact = (state.contacts || []).find(function(item){ return item.id === id; });
  if(!contact) return;

  if(!window.confirm('Vuoi eliminare "' + (contact.name || 'questo contatto') + '"?')) return;

  state.contacts = (state.contacts || []).filter(function(item){ return item.id !== id; });
  if(expandedContactId === id) expandedContactId = null;
  touchAndSave();
  renderContacts();
}

function renderContacts(){
  if(!contactList || !contactsMeta) return;

  var total = (state.contacts || []).length;
  var items = filteredContacts();
  contactList.innerHTML = "";

  if(total === 0){
    contactsMeta.textContent = "Nessun contatto salvato.";
    var emptyState = document.createElement("div");
    emptyState.className = "emptyState";
    emptyState.innerHTML = '<div>Nessun contatto salvato.</div><div style="margin-top:6px">Tocca “Aggiungi nuovo” per creare il primo contatto.</div>';
    contactList.appendChild(emptyState);
    return;
  }

  contactsMeta.textContent = items.length + " visibili · " + total + " totali";

  if(items.length === 0){
    var noMatch = document.createElement("div");
    noMatch.className = "emptyState";
    noMatch.textContent = "Nessun contatto corrisponde ai filtri attivi.";
    contactList.appendChild(noMatch);
    return;
  }

  items.forEach(function(contact){
    var item = document.createElement("div");
    item.className = "item contactItem" + (expandedContactId === contact.id ? " expanded" : "");
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.title = expandedContactId === contact.id ? "Chiudi dettagli" : "Apri dettagli";

    function toggle(){
      expandedContactId = expandedContactId === contact.id ? null : contact.id;
      renderContacts();
    }

    item.addEventListener("click", toggle);
    item.addEventListener("keydown", function(e){
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        toggle();
      }
    });

    var body = document.createElement("div");
    body.className = "itemText";

    var head = document.createElement("div");
    head.className = "contactHead";

    var left = document.createElement("div");
    left.style.minWidth = "0";

    var name = document.createElement("div");
    name.className = "contactName";
    name.textContent = contact.name || "Senza nome";

    var excerpt = document.createElement("div");
    excerpt.className = "contactExcerpt";
    excerpt.textContent = getContactExcerpt(contact);

    left.appendChild(name);
    left.appendChild(excerpt);

    var badge = document.createElement("span");
    badge.className = "badge contactCategory";
    badge.textContent = contactCategoryLabel(contact.category);

    head.appendChild(left);
    head.appendChild(badge);
    body.appendChild(head);

    var details = document.createElement("div");
    details.className = "contactDetails";

    function appendDetail(label, valueNode){
      var row = document.createElement("div");
      row.className = "contactDetailRow";
      var lab = document.createElement("div");
      lab.className = "contactDetailLabel";
      lab.textContent = label;
      var val = document.createElement("div");
      val.className = "contactDetailValue";
      if(typeof valueNode === "string") val.textContent = valueNode;
      else if(valueNode) val.appendChild(valueNode);
      row.appendChild(lab);
      row.appendChild(val);
      details.appendChild(row);
    }

    if(contact.phone){
      var phoneLink = document.createElement("a");
      phoneLink.href = "tel:" + contact.phone.replace(/\s+/g, "");
      phoneLink.textContent = contact.phone;
      phoneLink.addEventListener("click", function(e){ e.stopPropagation(); });
      appendDetail("Telefono", phoneLink);
    }

    if(contact.email){
      var emailLink = document.createElement("a");
      emailLink.href = "mailto:" + contact.email;
      emailLink.textContent = contact.email;
      emailLink.addEventListener("click", function(e){ e.stopPropagation(); });
      appendDetail("Email", emailLink);
    }

    if(contact.notes){
      appendDetail("Note", contact.notes);
    }

    if(!contact.phone && !contact.email && !contact.notes){
      appendDetail("Dettagli", "Nessun dettaglio aggiunto.");
    }

    var actions = document.createElement("div");
    actions.className = "contactActions";

    if(contact.phone){
      var callBtn = document.createElement("a");
      callBtn.className = "smallBtn actionBtnLink";
      callBtn.href = "tel:" + contact.phone.replace(/\s+/g, "");
      callBtn.textContent = "Chiama";
      callBtn.addEventListener("click", function(e){ e.stopPropagation(); });
      actions.appendChild(callBtn);
    }

    if(contact.email){
      var mailBtn = document.createElement("a");
      mailBtn.className = "smallBtn actionBtnLink";
      mailBtn.href = "mailto:" + contact.email;
      mailBtn.textContent = "Email";
      mailBtn.addEventListener("click", function(e){ e.stopPropagation(); });
      actions.appendChild(mailBtn);
    }

    var editBtn = document.createElement("button");
    editBtn.className = "smallBtn";
    editBtn.type = "button";
    editBtn.textContent = "Modifica";
    editBtn.addEventListener("click", function(e){
      e.stopPropagation();
      openContactModal(contact.id);
    });
    actions.appendChild(editBtn);

    var delBtn = document.createElement("button");
    delBtn.className = "smallBtn danger";
    delBtn.type = "button";
    delBtn.textContent = "Elimina";
    delBtn.addEventListener("click", function(e){
      e.stopPropagation();
      deleteContact(contact.id);
    });
    actions.appendChild(delBtn);

    details.appendChild(actions);
    body.appendChild(details);
    item.appendChild(body);
    contactList.appendChild(item);
  });
}

function syncTodoMiniPanelAria(){
  if(!toggleTodos || !todoMiniPanel) return;
  toggleTodos.setAttribute("aria-expanded", String(!todoMiniPanel.classList.contains("collapsed")));
}

function toggleTodoMiniPanel(){
  if(!todoMiniPanel) return;
  todoMiniPanel.classList.toggle("collapsed");
  syncTodoMiniPanelAria();
}

if(toggleTodos){
  toggleTodos.addEventListener("click", toggleTodoMiniPanel);
  toggleTodos.addEventListener("keydown", function(e){
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      toggleTodoMiniPanel();
    }
  });
}

if(openTodosBtn){
  openTodosBtn.addEventListener("click", function(e){
    e.stopPropagation();
    openNotebookToAddTodo();
  });
}


    function touchAndSave(){
      if(!isLoggedIn() || !hasAuthorizedCloudRole() || !cloudSessionVerified || remoteWriteLocked){
        if(remoteConflictPending || remoteWriteLockReason === "conflict"){
          setCloudStatus("conflict", "\u26A0\uFE0F Salvataggi bloccati: premi il pulsante cloud per risolvere il conflitto.");
          window.alert("C'e un conflitto con una versione cloud piu recente. Premi il pulsante cloud per aggiornarla prima di continuare.");
        }else{
          setCloudStatus("locked", "\uD83D\uDD04 Cloud: attendo l'aggiornamento iniziale prima di salvare.");
          window.alert("Agenda SDAC sta aggiornando il cloud. Aspetta che compaia 'Cloud aggiornato', poi modifica di nuovo.");
        }
        return;
      }
      state.updatedAt = new Date().toISOString();
      if(saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function(){
        try{
          localStorage.setItem(getStorageKey(), JSON.stringify(state));
          updateStorageStatus(true);
          // se loggato, salva anche online (debounce separato)
          if(isLoggedIn()) scheduleRemoteSave();
        }catch(e){
          updateStorageStatus(false);
        }
      }, 120);
    }

    function updateStorageStatus(ok){
      if(!storageStatus) return;
      try{
        var raw = localStorage.getItem(getStorageKey()) || "";
        var size = raw.length;
        storageStatus.textContent = (ok !== false ? "ok" : "errore") + " · " + Math.round(size/1024) + " KB";
      }catch(e){
        storageStatus.textContent = "errore storage";
      }
    }

    function renderCalendar(){
      monthTitle.textContent = MONTHS_IT[currentMonth] + " " + currentYear;

      // Layout stile screenshot: righe = giorni settimana, colonne = settimane del mese
      calListGrid.innerHTML = "";

      var first = new Date(currentYear, currentMonth, 1, 12);
      var last = new Date(currentYear, currentMonth+1, 0, 12);
      var daysInMonth = last.getDate();

      // JS getDay: 0 Sun..6 Sat -> Monday-based 0..6 (Mon..Sun)
      var firstDowMon0 = (first.getDay() + 6) % 7;

      // quante "colonne settimana" servono (4/5/6 a seconda del mese)
      var weeksCount = Math.ceil((firstDowMon0 + daysInMonth) / 7);

      // Imposta griglia: 1 colonna etichette + settimane
      // (Larghezza fissa per i nomi dei giorni, poi colonne elastiche)
      calListGrid.style.gridTemplateColumns = "max-content repeat(" + weeksCount + ", 1fr)";


      // Matrice [7][weeksCount] con gli ISO date
      var matrix = [];
      for (var r=0; r<7; r++){
        matrix[r] = new Array(weeksCount).fill("");
      }

      for (var dayIndex=1; dayIndex<=daysInMonth; dayIndex++){
        var offset = firstDowMon0 + (dayIndex - 1);
        var row = offset % 7; // 0..6
        var col = Math.floor(offset / 7); // 0..weeksCount-1
        var d = new Date(currentYear, currentMonth, dayIndex, 12);
        matrix[row][col] = isoDate(d);
      }

      var now = new Date();
      var todayISO = isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0));

      // Nomi lunghi per la colonna sinistra
      var DOW_FULL = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

      for (var r2=0; r2<7; r2++){
        // Etichetta giorno
        var lab = document.createElement("div");
        lab.className = "wlabel";
        lab.textContent = DOW_FULL[r2];
        calListGrid.appendChild(lab);

        // Celle settimane
        for (var c2=0; c2<weeksCount; c2++){
          var iso = matrix[r2][c2];

          if (!iso){
            var empty = document.createElement("div");
            empty.className = "cellEmpty";
            calListGrid.appendChild(empty);
            continue;
          }

          var el = document.createElement("div");
          el.className = "day";

          var dayNum = parseISO(iso).getDate();
          el.innerHTML = '<div class="dayNum">'+dayNum+'</div>';

          if (todayISO && iso === todayISO){
            var b = document.createElement("div");
            b.className = "today";
            b.textContent = "oggi";
            el.appendChild(b);
          }

          var list = sortedEventsFor(iso);
          var evCount = list.length;
          if (evCount > 0){
            var prev = document.createElement("div");
            prev.className = "evPreview";

            var maxLines = 2;
            var maxChars = 18;

            for (var i=0; i<Math.min(maxLines, evCount); i++){
              var line = document.createElement("div");
              var ckey = normalizeEventCategory(list[i].cat);
              line.className = "evLine cat-" + ckey;
              var txt = (list[i].title || "");
              if (txt.length > maxChars) txt = txt.slice(0, maxChars-1) + "…";
              line.textContent = txt;
              prev.appendChild(line);
            }

            if (evCount > maxLines){
              var more = document.createElement("div");
              more.className = "evMore";
              more.textContent = "+" + (evCount - maxLines);
              prev.appendChild(more);
            }

            el.appendChild(prev);
          }

          (function(dateISO){
            el.addEventListener("click", function(){ openDay(dateISO); });
          })(iso);

          calListGrid.appendChild(el);
        }
      }
    }

    function sortedEventsFor(dateISO){
      var arr = (state.events[dateISO] || []).slice();
      arr.sort(function(a,b){
        var at = a.time || "";
        var bt = b.time || "";
        if(at !== bt) return at.localeCompare(bt);
        return String(a.createdAt||"").localeCompare(String(b.createdAt||""));
      });
      return arr;
    }

    function openDay(dateISO){
      selectedISO = dateISO;
      var d = parseISO(dateISO);
      var title = DOW_IT[(d.getDay()+6)%7] + " " + d.getDate() + " " + MONTHS_IT[d.getMonth()] + " " + d.getFullYear();
      dayTitle.textContent = title;

      resetEventForm();

setCollapsed(addEventCard, true);   // Aggiungi evento chiuso
setCollapsed(eventsCard, false);    // Eventi aperto


      renderDayEvents();
      overlay.style.display = "flex";
      overlay.setAttribute("aria-hidden","false");
      pushInternalNavLayer("day", closeDayDirect);
setTimeout(function(){ try{ btnCloseDay.focus(); }catch(e){} }, 30);
    }

    function closeDayDirect(){
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden","true");
      selectedISO = null;
      resetEventForm();
    }

    function closeDay(){
      closeInternalNavLayer("day", closeDayDirect);
    }

    function renderDayEvents(){
      var iso = selectedISO;
      if(!iso) return;

      var events = sortedEventsFor(iso);
      dayEventsList.innerHTML = "";

      if(events.length === 0){
        var empty = document.createElement("div");
        empty.className = "hint";
        empty.textContent = "Nessun evento per questo giorno.";
        dayEventsList.appendChild(empty);
        return;
      }

      events.forEach(function(ev){
        var item = document.createElement("div");
        item.className = "item";

        var left = document.createElement("div");
        left.className = "itemMain";

        var text = document.createElement("div");
        text.className = "itemText";

        var t = document.createElement("div");
        t.className = "t";
        t.textContent = (ev.time ? ev.time + " · " : "") + (ev.title || "");

        var catKey = normalizeEventCategory(ev.cat);
        var catLabel = eventCategoryLabel(catKey);
        var badge = document.createElement("span");
        badge.className = "badge cat " + catKey;
        badge.textContent = catLabel;
        badge.style.marginRight = "8px";
        t.prepend(badge);

        var s = document.createElement("div");
        s.className = "s";
        s.textContent = ev.notes || "";

        text.appendChild(t);

        if(ev.where){
          var meta = document.createElement("div");
          meta.className = "eventMetaRow";
          var whereChip = document.createElement("span");
          whereChip.className = "eventMetaChip";
          whereChip.textContent = ev.where;
          meta.appendChild(whereChip);
          text.appendChild(meta);
        }

        if(ev.notes) text.appendChild(s);

        left.appendChild(text);

        var actions = document.createElement("div");
        actions.className = "itemActions";

        var edit = document.createElement("button");
        edit.className = "smallBtn iconBtn";
        edit.type = "button";
        edit.title = "Modifica evento";
        edit.setAttribute("aria-label", "Modifica evento");
        edit.innerHTML = iconSvg("edit");
        edit.addEventListener("click", function(){ startEventEdit(ev); });

        var del = document.createElement("button");
        del.className = "smallBtn danger iconBtn";
        del.type = "button";
        del.title = "Elimina evento";
        del.setAttribute("aria-label", "Elimina evento");
        del.innerHTML = iconSvg("trash");
        del.addEventListener("click", function(){ deleteEvent(iso, ev.id); });

        actions.appendChild(edit);
        actions.appendChild(del);

        item.appendChild(left);
        item.appendChild(actions);
        dayEventsList.appendChild(item);
      });
    }

    function addEvent(){
      var iso = selectedISO;
      if(!iso) return;

      var title = (evTitle.value || "").trim();
      if(!title){ evTitle.focus(); return; }

      var cat = normalizeEventCategory((evCat && evCat.value) ? evCat.value : "other");

      var obj = {
        id: uid(),
        time: evTime.value || "",
        title: title,
        notes: (evNotes.value || "").trim(),
        where: (evWhere && evWhere.value ? evWhere.value : "").trim(),
        cat: cat,
        createdAt: new Date().toISOString()
      };

      if(!state.events[iso]) state.events[iso] = [];
      state.events[iso].push(obj);

      touchAndSave();
      renderCalendar();
      renderDayEvents();
      renderSummary();

      resetEventForm();

// chiudi come “Chiudi” e resta sul calendario
closeDay();
setView("calendar");

    }

    function updateEvent(){
      var iso = selectedISO;
      if(!iso || !editingEventId) return;

      var title = (evTitle.value || "").trim();
      if(!title){ evTitle.focus(); return; }

      var arr = state.events[iso] || [];
      var target = null;
      for(var i=0; i<arr.length; i++){
        if(arr[i].id === editingEventId){
          target = arr[i];
          break;
        }
      }

      if(!target){
        cancelEventEdit();
        renderDayEvents();
        return;
      }

      target.time = evTime.value || "";
      target.title = title;
      target.notes = (evNotes.value || "").trim();
      target.where = (evWhere && evWhere.value ? evWhere.value : "").trim();
      target.cat = normalizeEventCategory((evCat && evCat.value) ? evCat.value : "other");
      target.updatedAt = new Date().toISOString();

      touchAndSave();
      renderCalendar();
      renderDayEvents();
      renderSummary();

      cancelEventEdit();
    }

    function deleteEvent(dateISO, eventId){
      var arr = state.events[dateISO] || [];
      var next = arr.filter(function(e){ return e.id !== eventId; });
      if(next.length === 0) delete state.events[dateISO];
      else state.events[dateISO] = next;

      touchAndSave();
      renderCalendar();
      renderDayEvents();
      renderSummary();
    }

    function escapeHtml(str){
      return String(str)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
    }

    function printDay(){
      var iso = selectedISO;
      if(!iso) return;

      var d = parseISO(iso);
      var title = DOW_IT[(d.getDay()+6)%7] + " " + d.getDate() + " " + MONTHS_IT[d.getMonth()] + " " + d.getFullYear();
      var events = sortedEventsFor(iso);

      var html = '<html><head><meta charset="utf-8"><title>'+escapeHtml(title)+'</title>' +
        '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;padding:18px}h1{font-size:18px;margin:0 0 10px}.e{border:1px solid #ddd;border-radius:10px;padding:10px;margin:8px 0}.t{font-weight:700}.n{white-space:pre-wrap;margin-top:6px;color:#444}.muted{color:#666}</style>' +
        '</head><body><h1>'+escapeHtml(title)+'</h1>';

      if(events.length){
        events.forEach(function(ev){
          html += '<div class="e"><div class="t">'+escapeHtml("[" + eventCategoryLabel(ev.cat) + "] " + ((ev.time ? ev.time+" · " : "") + (ev.title||"")))+'</div>';
          if(ev.where){ html += '<div class="muted">'+escapeHtml(ev.where)+'</div>'; }
          html += ev.notes ? '<div class="n">'+escapeHtml(ev.notes)+'</div>' : '<div class="muted">—</div>';
          html += '</div>';
        });
      }else{
        html += '<div class="muted">Nessun evento.</div>';
      }

      html += '<script>window.print();<\/script></body></html>';

      var w = window.open("", "_blank");
      if(w){ w.document.open(); w.document.write(html); w.document.close(); }
    }

    // Todos
    function addTodoItem(){
      var text = (todoText.value || "").trim();
      if(!text){ todoText.focus(); return; }

      var obj = {
        id: uid(),
        text: text,
        priority: todoPriority.value || "med",
        tag: (todoTag.value || "").trim(),
        done: false,
        createdAt: new Date().toISOString(),
        doneAt: ""
      };

      state.todos.unshift(obj);
      todoText.value = "";
      todoTag.value = "";
      todoPriority.value = "med";

      touchAndSave();
renderTodos();
renderSummary();

// torna “a casa”
setView("calendar");
window.scrollTo({ top: 0, behavior: "smooth" });

    }

    function toggleTodo(id, done){
      var t = state.todos.find(function(x){ return x.id === id; });
      if(!t) return;
      t.done = !!done;
      t.doneAt = t.done ? new Date().toISOString() : "";
      touchAndSave();
      renderTodos();
      renderSummary();
    }

    function deleteTodo(id){
      state.todos = state.todos.filter(function(x){ return x.id !== id; });
      touchAndSave();
      renderTodos();
      renderSummary();
    }

    function renderTodos(){
      var q = (todoSearch.value || "").trim().toLowerCase();
      var filter = todoFilter.value;

      var items = state.todos.slice();

      if(q){
        items = items.filter(function(t){
          return String(t.text||"").toLowerCase().indexOf(q) !== -1 ||
                 String(t.tag||"").toLowerCase().indexOf(q) !== -1;
        });
      }
      if(filter === "active") items = items.filter(function(t){ return !t.done; });
      if(filter === "done") items = items.filter(function(t){ return !!t.done; });

      todoList.innerHTML = "";
      todoTotalCount.textContent = items.length + " visibili · " + state.todos.length + " totali";

      if(items.length === 0){
        var empty = document.createElement("div");
        empty.className = "hint";
        empty.textContent = "Nessuna attività corrisponde ai filtri attivi.";
        todoList.appendChild(empty);
        return;
      }

      items.forEach(function(t){
        var item = document.createElement("div");
        item.className = "item";

        var left = document.createElement("div");
        left.className = "itemMain";

        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "checkbox";
        cb.checked = !!t.done;
        cb.addEventListener("change", function(){ toggleTodo(t.id, cb.checked); });

        var text = document.createElement("div");
        text.className = "itemText";

        var title = document.createElement("div");
        title.className = "t";
        title.textContent = t.text || "";
        if(t.done) title.style.textDecoration = "line-through";

        var meta = document.createElement("div");
        meta.style.display = "flex";
        meta.style.gap = "8px";
        meta.style.flexWrap = "wrap";

        var p = document.createElement("span");
        p.className = "badge " + (t.priority || "med");
        p.textContent = (t.priority === "high") ? "priorità alta" : (t.priority === "low") ? "priorità bassa" : "priorità media";
        meta.appendChild(p);

        if(t.tag){
          var tag = document.createElement("span");
          tag.className = "badge";
          tag.textContent = "#" + t.tag;
          meta.appendChild(tag);
        }

        text.appendChild(title);
        text.appendChild(meta);

        left.appendChild(cb);
        left.appendChild(text);

        var actions = document.createElement("div");
        var del = document.createElement("button");
        del.className = "smallBtn danger";
        del.textContent = "Elimina";
        del.addEventListener("click", function(){ deleteTodo(t.id); });

        actions.appendChild(del);

        item.appendChild(left);
        item.appendChild(actions);
        todoList.appendChild(item);
      });
    }

    // Summary
    function renderSummary(){
      renderActiveTodosMini();
      renderAgendaWeek();
    }

    function getTodayDate(){
      var now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
    }

    function getAgendaDayLabel(date, offset){
      if(offset === 0) return "Oggi";
      if(offset === 1) return "Domani";
      return DOW_IT[(date.getDay()+6)%7];
    }

    function getAgendaDayDateLabel(date){
      return new Intl.DateTimeFormat("it-IT", {
        weekday: "short",
        day: "numeric",
        month: "short"
      }).format(date).replace(/\./g, "");
    }

    function renderAgendaWeek(){
      if(!agendaWeekList) return;

      var start = getTodayDate();

      agendaWeekList.innerHTML = "";

      for(var offset=0; offset<7; offset++){
        var dayDate = new Date(start);
        dayDate.setDate(start.getDate() + offset);
        var iso = isoDate(dayDate);
        var events = sortedEventsFor(iso);

        var dayEl = document.createElement("div");
        dayEl.className = "agendaWeekDay" + (offset === 0 ? " isToday" : "");
        dayEl.setAttribute("role", "button");
        dayEl.setAttribute("tabindex", "0");
        dayEl.setAttribute("aria-label", "Apri " + getAgendaDayLabel(dayDate, offset) + ", " + getAgendaDayDateLabel(dayDate));

        var head = document.createElement("div");
        head.className = "agendaWeekHead";

        var meta = document.createElement("div");
        meta.className = "agendaWeekMeta";

        var title = document.createElement("div");
        title.className = "agendaWeekTitle" + (offset === 0 ? " isTodayLabel" : "");
        title.textContent = getAgendaDayLabel(dayDate, offset);

        var dateLabel = document.createElement("div");
        dateLabel.className = "agendaWeekDate";
        dateLabel.textContent = getAgendaDayDateLabel(dayDate);

        meta.appendChild(title);
        meta.appendChild(dateLabel);

        var badge = document.createElement("div");
        badge.className = "agendaWeekBadge" + (events.length ? " hasEvents" : "");
        badge.textContent = events.length ? (events.length === 1 ? "1 evento" : events.length + " eventi") : "Libero";

        head.appendChild(meta);
        head.appendChild(badge);
        dayEl.appendChild(head);

        if(events.length){
          var eventsWrap = document.createElement("div");
          eventsWrap.className = "agendaWeekEvents";

          events.forEach(function(ev){
            var catKey = normalizeEventCategory(ev.cat);
            var line = document.createElement("div");
            line.className = "agendaWeekEvent cat-" + catKey;

            var icon = document.createElement("span");
            icon.className = "agendaWeekEventIcon cat-" + catKey;
            icon.textContent = eventCategoryIcon(catKey);
            icon.setAttribute("aria-hidden", "true");
            icon.title = eventCategoryLabel(catKey);

            var time = document.createElement("span");
            time.className = "agendaWeekEventTime";
            time.textContent = ev.time || "—";

            var text = document.createElement("span");
            text.className = "agendaWeekEventText";
            text.textContent = ev.title || "Senza titolo";
            text.title = eventCategoryLabel(catKey) + " · " + (ev.title || "Senza titolo");

            line.appendChild(icon);
            line.appendChild(time);
            line.appendChild(text);
            eventsWrap.appendChild(line);
          });

          dayEl.appendChild(eventsWrap);
        }else{
          var empty = document.createElement("div");
          empty.className = "agendaWeekEmpty";
          empty.textContent = "Nessun evento — tocca per aggiungere.";
          dayEl.appendChild(empty);
        }

        (function(dateISO, el){
          function handleOpen(){ openDay(dateISO); }
          el.addEventListener("click", handleOpen);
          el.addEventListener("keydown", function(ev){
            if(ev.key === "Enter" || ev.key === " "){
              ev.preventDefault();
              handleOpen();
            }
          });
        })(iso, dayEl);

        agendaWeekList.appendChild(dayEl);
      }

    }

    function renderActiveTodosMini(){
      var active = state.todos.filter(function(t){ return !t.done; });

      todoActiveList.innerHTML = "";
      if(active.length === 0){
        var empty = document.createElement("div");
        empty.className = "hint";
        empty.textContent = "Nessun todo attivo.";
        todoActiveList.appendChild(empty);
        return;
      }

      var show = active.slice(0,6);
      show.forEach(function(t){
        var item = document.createElement("div");
        item.className = "item";

        var left = document.createElement("div");
        left.className = "itemMain";

        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "checkbox";
        cb.checked = false;
        cb.title = "Segna come fatto";
        cb.addEventListener("change", function(){ toggleTodo(t.id, true); });

        // Rendi l'intera riga cliccabile (mobile-friendly)
        item.setAttribute("role","button");
        item.tabIndex = 0;
        item.title = "Segna come fatto";
        item.addEventListener("click", function(e){
          // se tocchi la checkbox, lascia che gestisca lei
          if(e && e.target === cb) return;
          toggleTodo(t.id, true);
        });
        item.addEventListener("keydown", function(e){
          if(e.key === "Enter" || e.key === " "){
            e.preventDefault();
            toggleTodo(t.id, true);
          }
        });

        var text = document.createElement("div");
        text.className = "itemText";

        var title = document.createElement("div");
        title.className = "t";
        title.textContent = t.text || "";

        var meta = document.createElement("div");
        meta.style.display = "flex";
        meta.style.gap = "8px";
        meta.style.flexWrap = "wrap";

        var p = document.createElement("span");
        p.className = "badge " + (t.priority || "med");
        p.textContent = (t.priority === "high") ? "alta" : (t.priority === "low") ? "bassa" : "media";
        meta.appendChild(p);

        if(t.tag){
          var tag = document.createElement("span");
          tag.className = "badge";
          tag.textContent = "#" + t.tag;
          meta.appendChild(tag);
        }

        text.appendChild(title);
        text.appendChild(meta);

        left.appendChild(text);

item.appendChild(left);
item.appendChild(cb);   // checkbox a destra, in fondo alla riga
todoActiveList.appendChild(item);

      });

      if(active.length > show.length){
        var more = document.createElement("div");
        more.className = "hint";
        more.textContent = "... e altri " + (active.length - show.length);
        todoActiveList.appendChild(more);
      }
    }

    // Menu Impostazioni
    function isSettingsMenuOpen(){
      return !!(settingsMenu && !settingsMenu.hidden);
    }

    function setSettingsMenuOpen(open, focusFirst){
      if(!settingsMenu || !settingsMenuBtn) return;
      if(open && !canCurrentRoleAccess("settings")) return;
      var shouldOpen = !!open;
      settingsMenu.hidden = !shouldOpen;
      settingsMenuBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      settingsMenuBtn.setAttribute("aria-label", shouldOpen ? "Chiudi Impostazioni" : "Apri Impostazioni");
      if(shouldOpen && focusFirst){
        var firstItem = settingsMenu.querySelector(".settingsMenuItem");
        if(firstItem) firstItem.focus();
      }
    }

    function toggleSettingsMenu(){
      if(!canCurrentRoleAccess("settings")){
        window.alert(roleRestrictionMessage("settings"));
        return;
      }
      setSettingsMenuOpen(!isSettingsMenuOpen(), false);
    }

    // Export / Import / Reset
    function exportJSON(){
      if(!canCurrentRoleAccess("settings")){
        window.alert(roleRestrictionMessage("settings"));
        return;
      }
      try{
        var normalizedState=normalizeLoadedState(state);
        var backup={
          backupFormat:"sdac-agenda",
          backupVersion:1,
          dataVersion:CURRENT_DATA_VERSION,
          exportedAt:new Date().toISOString(),
          state:normalizedState
        };
        var data = JSON.stringify(backup, null, 2);
        var blob = new Blob([data], { type:"application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        var stamp = new Date().toISOString().slice(0,19).replace(/:/g,"-");
        a.href = url;
        a.download = "agenda-backup-"+stamp+".json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 250);
      }catch(e){}
    }

    function importJSON(e){
      if(!canCurrentRoleAccess("settings")){
        if(e && e.target) e.target.value = "";
        window.alert(roleRestrictionMessage("settings"));
        return;
      }
      var file = e.target.files && e.target.files[0];
      if(!file) return;

      var reader = new FileReader();
      reader.onload = function(){
        try{
          var obj = JSON.parse(String(reader.result || ""));
          if(!obj || typeof obj !== "object") throw new Error("invalid");
          var importedState = obj.backupFormat === "sdac-agenda" && obj.state && typeof obj.state === "object" ? obj.state : obj;
          var looksLikeAgenda = importedState && typeof importedState === "object" && (importedState.events || importedState.todos || importedState.notes || importedState.contacts || importedState.academy || importedState.administration || importedState.version);
          if(!looksLikeAgenda) throw new Error("not-an-agenda-backup");
          var importedDataVersion=Number(importedState.dataVersion || obj.dataVersion || 0) || 0;
          if(importedDataVersion>CURRENT_DATA_VERSION) throw new Error("newer-data-version");

          state = normalizeLoadedState(importedState);
          state.updatedAt = new Date().toISOString();

          localStorage.setItem(getStorageKey(), JSON.stringify(state));
          syncNotesUiFromState();

          renderAll();
          updateStorageStatus(true);
          if(isLoggedIn()) scheduleRemoteSave();
        }catch(err){
          updateStorageStatus(false);
          if(err && err.message === "newer-data-version") alert("Questo backup e stato creato con una versione piu recente di SDAC Agenda. Aggiorna prima l'app e riprova.");
          else alert("Import fallito: file non valido o corrotto.");
        }finally{
          importFile.value = "";
        }
      };
      reader.readAsText(file);
    }

    function resetAll(){
      if(!canCurrentRoleAccess("settings")){
        window.alert(roleRestrictionMessage("settings"));
        return;
      }
      if(!isLoggedIn() || !hasAuthorizedCloudRole() || !cloudSessionVerified || remoteWriteLocked){
        if(remoteConflictPending || remoteWriteLockReason === "conflict"){
          window.alert("Prima di azzerare l'agenda, risolvi il conflitto dal pulsante cloud. In questo modo il Reset non rischia di sovrascrivere modifiche piu recenti.");
        }else{
          window.alert("Il cloud e in aggiornamento. Aspetta che compaia 'Cloud aggiornato' prima di usare Reset.");
        }
        return;
      }
      exportJSON();
      state = defaultState();
      state.updatedAt = new Date().toISOString();
      try{ localStorage.setItem(getStorageKey(), JSON.stringify(state)); }catch(e){}
      syncNotesUiFromState();
      var now = new Date();
      currentYear = now.getFullYear();
      currentMonth = now.getMonth();
      renderAll();
      updateStorageStatus(true);
      // Il Reset e una modifica reale dello stato: se il cloud e attivo,
      // propagala subito invece di lasciare online la vecchia agenda.
      if(isLoggedIn()) scheduleRemoteSave(true);
    }



    function weekdayLabel(value){
      return ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"][Number(value)] || "—";
    }

    function formatSchoolDate(iso){
      if(!iso) return "—";
      var d = new Date(iso + "T12:00:00");
      if(isNaN(d.getTime())) return iso;
      try{ return new Intl.DateTimeFormat("it-IT", { day:"2-digit", month:"short", year:"numeric" }).format(d); }catch(e){ return iso; }
    }

    function fullStudentName(student){
      return [student.firstName, student.lastName].filter(Boolean).join(" ").trim() || "Studente senza nome";
    }

    function getCourseById(id){ return (getAcademyYear().courses || []).find(function(c){ return c.id === id; }) || null; }
    function getStudentById(id){ return (getAcademyYear().students || []).find(function(st){ return st.id === id; }) || null; }
    function enrolledStudents(courseId){ return (getAcademyYear().students || []).filter(function(st){ return (st.courseIds || []).indexOf(courseId) !== -1; }).sort(function(a,b){ return fullStudentName(a).localeCompare(fullStudentName(b), "it"); }); }
    function canEditCourseRegister(course){
      if(currentAccessRole === "admin" || currentAccessRole === "socio") return true;
      if((currentAccessRole !== "docente" && currentAccessRole !== "studente") || !course) return false;
      return (course.teacherEmails || []).map(normalizeEmail).indexOf(getCurrentUserEmail()) !== -1;
    }

    function courseNextLesson(course){
      var nowIso = isoDate(getTodayDate());
      return (course.lessons || []).slice().filter(function(l){ return l.date >= nowIso; }).sort(function(a,b){ return (a.date+a.startTime).localeCompare(b.date+b.startTime); })[0] || null;
    }

    function renderCourses(){
      if(!courseGrid) return;
      var year = getAcademyYear();
      var courses = year.courses || [];
      courseGrid.innerHTML = "";
      if(coursesVisibleCount) coursesVisibleCount.textContent = String(courses.length);
      if(coursesStudentCount) coursesStudentCount.textContent = String((year.students || []).length);
      if(coursesRoleHint){
        coursesRoleHint.textContent = (currentAccessRole === "docente" || currentAccessRole === "studente") ? "Vedi solo i corsi associati alla tua email docente." : "Seleziona un corso per aprire registro, iscritti e lezioni.";
      }
      if(!courses.length){
        courseGrid.innerHTML = '<div class="schoolEmptyState">Nessun corso associato a questo account. Chiedi a un Admin o Socio di inserire la tua email nella configurazione del corso.</div>';
        if(viewCourses) viewCourses.classList.remove("course-detail-open");
        if(courseDetailCard) courseDetailCard.classList.add("hidden");
        return;
      }
      courses.forEach(function(course){
        var students = enrolledStudents(course.id);
        var next = courseNextLesson(course);
        var card = document.createElement("button");
        card.type = "button";
        card.className = "schoolCourseCard" + (selectedCourseId === course.id ? " active" : "");
        card.innerHTML = '<span class="schoolCourseIcon">'+escapeHtml(course.icon || "🎓")+'</span>'+
          '<span class="schoolCourseCardMain"><strong>'+escapeHtml(course.name)+'</strong><span>'+escapeHtml(weekdayLabel(course.weekday))+" · "+escapeHtml(course.startTime)+"–"+escapeHtml(course.endTime)+'</span><span class="schoolCourseTeacher">'+escapeHtml(course.teacherName || "Docente da configurare")+'</span></span>'+
          '<span class="schoolCourseCardSide"><strong>'+students.length+'</strong><span>iscritti</span><small>'+(next ? "Prossima: "+escapeHtml(formatSchoolDate(next.date)) : "Registro vuoto")+'</small></span>';
        card.addEventListener("click", function(){
          var detailWasOpen = !!(selectedCourseId && courseDetailCard && !courseDetailCard.classList.contains("hidden"));
          if(!detailWasOpen){
            coursesListScrollY = window.scrollY || window.pageYOffset || 0;
          }
          selectedCourseId = course.id;
          renderCourses();
          renderCourseDetail({ focusTop: !detailWasOpen });
          if(!detailWasOpen) pushInternalNavLayer("course", closeCourseDetailDirect);
        });
        courseGrid.appendChild(card);
      });
      if(selectedCourseId && !getCourseById(selectedCourseId)) selectedCourseId = null;
      if(selectedCourseId) renderCourseDetail();
    }

    function closeCourseDetailDirect(){
      var restoreY = coursesListScrollY;
      selectedCourseId = null;
      if(viewCourses) viewCourses.classList.remove("course-detail-open");
      if(courseDetailCard) courseDetailCard.classList.add("hidden");
      renderCourses();
      coursesListScrollY = null;
      if(Number.isFinite(Number(restoreY))){
        requestAnimationFrame(function(){
          try{ window.scrollTo({ top: Math.max(0, Number(restoreY) || 0), behavior: "auto" }); }catch(e){ window.scrollTo(0, Math.max(0, Number(restoreY) || 0)); }
        });
      }
    }

    function closeCourseDetail(){
      closeInternalNavLayer("course", closeCourseDetailDirect);
    }

    function renderCourseDetail(options){
      if(!courseDetailCard) return;
      options = options || {};
      var course = getCourseById(selectedCourseId);
      if(!course){
        if(viewCourses) viewCourses.classList.remove("course-detail-open");
        courseDetailCard.classList.add("hidden");
        return;
      }
      if(viewCourses) viewCourses.classList.add("course-detail-open");
      courseDetailCard.classList.remove("hidden");
      courseDetailEyebrow.textContent = ACADEMIC_YEAR + " · " + weekdayLabel(course.weekday);
      courseDetailTitle.textContent = (course.icon || "🎓") + " " + course.name;
      courseDetailMeta.textContent = course.startTime + "–" + course.endTime + " · " + (course.teacherName || "Docente da configurare");
      var canManage = currentAccessRole === "admin" || currentAccessRole === "socio";
      if(courseSettingsCard) courseSettingsCard.classList.toggle("hidden", !canManage);
      if(courseRoster && courseRoster.parentElement) courseRoster.parentElement.classList.toggle("hidden", currentAccessRole === "studente");
      var composer=document.getElementById("lessonComposerCard"); if(composer) composer.classList.toggle("hidden", currentAccessRole === "studente");
      if(canManage){
        courseTeacherName.value = course.teacherName || "";
        courseTeacherEmail.value = (course.teacherEmails || []).join(", ");
        courseWeekday.value = String(course.weekday);
        courseStartTime.value = course.startTime || "";
        courseEndTime.value = course.endTime || "";
        courseFirstDate.value = course.firstDate || "";
        courseLessonTarget.value = course.lessonTarget === null ? "" : String(course.lessonTarget);
      }
      renderCourseRoster(course);
      resetLessonEditor(course, true);
      renderCourseLessons(course);
      if(options.focusTop){
        requestAnimationFrame(function(){
          try{ courseDetailCard.scrollIntoView({ behavior: "auto", block: "start" }); }catch(e){}
        });
      }
    }

    function renderCourseRoster(course){
      if(!courseRoster) return;
      var students = enrolledStudents(course.id);
      courseRosterCount.textContent = students.length === 1 ? "1 studente" : students.length + " studenti";
      courseRoster.innerHTML = "";
      if(!students.length){ courseRoster.innerHTML = '<div class="schoolEmptyState compact">Nessuno studente iscritto.</div>'; return; }
      students.forEach(function(st){
        var row = document.createElement("div"); row.className="schoolRosterRow";
        row.innerHTML = '<span class="schoolAvatar">'+escapeHtml((st.firstName||st.lastName||"S").charAt(0).toUpperCase())+'</span><span><strong>'+escapeHtml(fullStudentName(st))+'</strong><small>'+escapeHtml((currentAccessRole === "docente" || currentAccessRole === "studente") ? "Studente del corso" : (st.email || st.phone || "Nessun contatto"))+'</small></span>';
        courseRoster.appendChild(row);
      });
    }

    function nextCourseDate(course){
      var dates=(course.lessons||[]).map(function(l){return l.date;}).filter(Boolean).sort();
      if(!dates.length) return course.firstDate || "";
      var d=new Date(dates[dates.length-1]+"T12:00:00"); d.setDate(d.getDate()+7); return isoDate(d);
    }

    function resetLessonEditor(course, clearTopic){
      if(!course || !lessonDate) return;
      lessonEditingId.value="";
      lessonDate.value=nextCourseDate(course);
      lessonStartTime.value=course.startTime || "";
      lessonEndTime.value=course.endTime || "";
      if(clearTopic !== false){ lessonTopic.value=""; lessonNotes.value=""; }
      cancelLessonEditBtn.classList.add("hidden");
      saveLessonBtn.textContent="Salva lezione";
      renderAttendanceEditor(course, null);
    }

    function renderAttendanceEditor(course, lesson){
      if(!lessonAttendanceEditor) return;
      var students=enrolledStudents(course.id);
      lessonAttendanceEditor.innerHTML="";
      if(!students.length){ lessonAttendanceEditor.innerHTML='<div class="schoolEmptyState compact">Aggiungi studenti al corso per registrare le presenze.</div>'; return; }
      students.forEach(function(st){
        var hasRecorded = !!(lesson && lesson.attendance && lesson.attendance[st.id]);
        var value = lesson ? (hasRecorded ? lesson.attendance[st.id] : "unmarked") : "present";
        var row=document.createElement("label"); row.className="schoolAttendanceRow";
        row.innerHTML='<span>'+escapeHtml(fullStudentName(st))+'</span><select data-attendance-student="'+escapeHtml(st.id)+'"><option value="present">✅ Presente</option><option value="absent">❌ Assente</option><option value="late">🟡 Ritardo</option><option value="unmarked">— Non registrato</option></select>';
        row.querySelector("select").value=value;
        lessonAttendanceEditor.appendChild(row);
      });
    }

    function collectAttendance(){
      var out={};
      if(!lessonAttendanceEditor) return out;
      Array.prototype.forEach.call(lessonAttendanceEditor.querySelectorAll("select[data-attendance-student]"), function(sel){ out[sel.getAttribute("data-attendance-student")]=sel.value; });
      return out;
    }

    function canMutateSchoolData(){
      if(currentAccessRole === "studente") return false;
      if(!isLoggedIn() || !hasAuthorizedCloudRole() || !cloudSessionVerified || remoteWriteLocked){ touchAndSave(); return false; }
      return true;
    }

    function saveCourseSettings(){
      var course=getCourseById(selectedCourseId); if(!course || !canMutateSchoolData()) return;
      if(!(currentAccessRole === "admin" || currentAccessRole === "socio")){ alert(roleRestrictionMessage("courses")); return; }
      course.teacherName=String(courseTeacherName.value||"").trim();
      course.teacherEmails=String(courseTeacherEmail.value||"").split(/[,;]+/).map(normalizeEmail).filter(Boolean).filter(function(v,i,a){ return a.indexOf(v)===i; });
      course.weekday=Number(courseWeekday.value); course.startTime=courseStartTime.value||""; course.endTime=courseEndTime.value||""; course.firstDate=courseFirstDate.value||course.firstDate||"";
      course.lessonTarget=courseLessonTarget.value === "" ? null : Math.max(0, Number(courseLessonTarget.value)||0);
      touchAndSave(); renderCourses(); renderCourseDetail();
    }

    function saveLesson(){
      var course=getCourseById(selectedCourseId); if(!course || !canEditCourseRegister(course) || !canMutateSchoolData()) return;
      if(!lessonDate.value){ alert("Inserisci la data della lezione."); return; }
      var id=lessonEditingId.value;
      var existing=id ? (course.lessons||[]).find(function(l){return l.id===id;}) : null;
      var payload=normalizeLesson({
        id: existing ? existing.id : uid(), date:lessonDate.value, startTime:lessonStartTime.value, endTime:lessonEndTime.value,
        topic:lessonTopic.value, notes:lessonNotes.value, attendance:collectAttendance(), createdAt:existing ? existing.createdAt : new Date().toISOString(), updatedAt:new Date().toISOString()
      });
      if(existing){ var i=course.lessons.indexOf(existing); course.lessons[i]=payload; } else course.lessons.push(payload);
      touchAndSave(); resetLessonEditor(course, true); renderCourseLessons(course); renderCourses();
    }

    function editLesson(id){
      var course=getCourseById(selectedCourseId); if(!course) return;
      var l=(course.lessons||[]).find(function(x){return x.id===id;}); if(!l) return;
      lessonEditingId.value=l.id; lessonDate.value=l.date; lessonStartTime.value=l.startTime; lessonEndTime.value=l.endTime; lessonTopic.value=l.topic; lessonNotes.value=l.notes;
      renderAttendanceEditor(course,l); saveLessonBtn.textContent="Salva modifiche"; cancelLessonEditBtn.classList.remove("hidden");
      try{ document.getElementById("lessonComposerCard").scrollIntoView({behavior:"smooth",block:"start"}); }catch(e){}
    }

    function deleteLesson(id){
      var course=getCourseById(selectedCourseId); if(!course || !canEditCourseRegister(course) || !canMutateSchoolData()) return;
      if(!confirm("Eliminare questa lezione dal registro?")) return;
      course.lessons=(course.lessons||[]).filter(function(l){return l.id!==id;}); touchAndSave(); resetLessonEditor(course,true); renderCourseLessons(course); renderCourses();
    }

    function renderCourseLessons(course){
      if(!courseLessonList) return;
      var lessons=(course.lessons||[]).slice().sort(function(a,b){return (b.date+b.startTime).localeCompare(a.date+a.startTime);});
      courseLessonCount.textContent=lessons.length ? (lessons.length===1 ? "1 lezione" : lessons.length+" lezioni") : "Nessuna lezione";
      courseLessonList.innerHTML="";
      if(!lessons.length){ courseLessonList.innerHTML='<div class="schoolEmptyState">Il registro è pronto. Inserisci la prima lezione quando vuoi.</div>'; return; }
      var editable=canEditCourseRegister(course);
      lessons.forEach(function(l){
        var roster=enrolledStudents(course.id); var counts={present:0,absent:0,late:0}; roster.forEach(function(st){ var v=(l.attendance||{})[st.id]; if(v && v !== "unmarked") counts[v]=(counts[v]||0)+1; });
        var card=document.createElement("div"); card.className="schoolLessonCard";
        card.innerHTML='<div class="schoolLessonDate"><strong>'+escapeHtml(formatSchoolDate(l.date))+'</strong><span>'+escapeHtml((l.startTime||course.startTime)+"–"+(l.endTime||course.endTime))+'</span></div><div class="schoolLessonMain"><strong>'+escapeHtml(l.topic||"Lezione")+'</strong>'+(l.notes?'<p>'+escapeHtml(l.notes)+'</p>':'')+'<div class="schoolAttendanceChips"><span>✅ '+counts.present+'</span><span>❌ '+counts.absent+'</span><span>🟡 '+counts.late+'</span></div></div>';
        if(editable){ var actions=document.createElement("div"); actions.className="schoolLessonActions"; var e=document.createElement("button"); e.className="smallBtn"; e.textContent="Modifica"; e.onclick=function(){editLesson(l.id);}; var d=document.createElement("button"); d.className="smallBtn danger"; d.textContent="Elimina"; d.onclick=function(){deleteLesson(l.id);}; actions.append(e,d); card.appendChild(actions); }
        courseLessonList.appendChild(card);
      });
    }

    function populateStudentCourseFilter(){
      if(!studentCourseFilter) return;
      var current=studentCourseFilter.value||"all"; studentCourseFilter.innerHTML='<option value="all">Tutti i corsi</option>';
      (getAcademyYear().courses||[]).forEach(function(c){ var o=document.createElement("option"); o.value=c.id; o.textContent=c.name; studentCourseFilter.appendChild(o); });
      studentCourseFilter.value = Array.prototype.some.call(studentCourseFilter.options,function(o){return o.value===current;}) ? current : "all";
    }

    function attendanceStatsForStudent(student){
      var stats={present:0,absent:0,late:0,total:0};
      (getAcademyYear().courses||[]).forEach(function(course){ if((student.courseIds||[]).indexOf(course.id)===-1) return; (course.lessons||[]).forEach(function(l){ var v=(l.attendance||{})[student.id]; if(!v || v === "unmarked") return; stats.total++; stats[v]=(stats[v]||0)+1; }); });
      return stats;
    }

    function formatEuro(value){
      var n = Number(value || 0);
      try{ return new Intl.NumberFormat("it-IT", { style:"currency", currency:"EUR", minimumFractionDigits:Number.isInteger(n)?0:2, maximumFractionDigits:2 }).format(n); }
      catch(e){ return "€ " + n.toFixed(Number.isInteger(n)?0:2); }
    }

    function getStudentFinanceEnrollment(student, courseId, create){
      if(!student) return null;
      if(!student.finance || typeof student.finance !== "object") student.finance = normalizeStudentFinance(null, student.courseIds || []);
      if(!student.finance.enrollments || typeof student.finance.enrollments !== "object") student.finance.enrollments = {};
      var cid = String(courseId || "");
      if(!student.finance.enrollments[cid] && create) student.finance.enrollments[cid] = normalizeFinanceEnrollment(null, cid);
      return student.finance.enrollments[cid] || null;
    }

    function paymentTotal(enrollment){
      return (enrollment && Array.isArray(enrollment.payments) ? enrollment.payments : []).reduce(function(sum,p){ return sum + Math.max(0, Number(p.amount || 0) || 0); }, 0);
    }

    function financeMetrics(enrollment){
      var fee=Math.max(0,Number(enrollment && enrollment.courseFee || 0) || 0);
      var paid=paymentTotal(enrollment);
      return { fee:fee, paid:paid, balance:Math.max(0,fee-paid), overpaid:Math.max(0,paid-fee) };
    }

    function currentAuditActor(){
      return { email:getCurrentUserEmail(), role:getCurrentAccessRole(), at:new Date().toISOString() };
    }

    function appendFinanceAudit(enrollment, raw){
      if(!enrollment) return;
      if(!Array.isArray(enrollment.audit)) enrollment.audit=[];
      var actor=currentAuditActor();
      enrollment.audit.push(normalizeFinanceAuditEvent({
        id:uid(),
        type:raw && raw.type || "finance_update",
        paymentId:raw && raw.paymentId || "",
        amount:raw && raw.amount || 0,
        date:raw && raw.date || "",
        detail:raw && raw.detail || "",
        actorEmail:actor.email,
        actorRole:actor.role,
        at:actor.at
      }));
      if(enrollment.audit.length>300) enrollment.audit=enrollment.audit.slice(-300);
    }

    function financeStatus(enrollment){
      var metrics = financeMetrics(enrollment);
      var fee = metrics.fee;
      var paid = metrics.paid;
      var balance = metrics.balance;
      var today = isoDate(getTodayDate());
      if(fee > 0 && balance <= 0.009) return { key:"settled", icon:"✅", label:"Saldato" };
      if(enrollment && enrollment.nextDueDate && enrollment.nextDueDate < today && balance > 0) return { key:"overdue", icon:"🔴", label:"Scaduto" };
      if(paid <= 0) return { key:"unpaid", icon:"⚪", label:"Da iniziare" };
      return { key:"ok", icon:"🟢", label:"In regola" };
    }

    function studentFinanceSummary(student){
      var total=0,paid=0,balance=0,overdue=false,settledCount=0,count=0;
      (student.courseIds||[]).forEach(function(cid){
        var e=getStudentFinanceEnrollment(student,cid,true); if(!e)return; var fee=Number(e.courseFee||0), coursePaid=paymentTotal(e); count++; total+=fee; paid+=coursePaid; balance+=Math.max(0,fee-coursePaid); var status=financeStatus(e); if(status.key==="overdue")overdue=true; if(status.key==="settled")settledCount++;
      });
      var key = overdue ? "overdue" : (count && settledCount===count ? "settled" : (paid>0 ? "ok" : "unpaid"));
      var map={settled:{icon:"✅",label:"Saldato"},overdue:{icon:"🔴",label:"Rata scaduta"},ok:{icon:"🟢",label:"In regola"},unpaid:{icon:"⚪",label:"Da iniziare"}};
      return {total:total,paid:paid,balance:balance,status:{key:key,icon:map[key].icon,label:map[key].label}};
    }

    function openAdministrationForStudent(studentId, courseId){
      if(!canCurrentRoleAccess("administration")){ window.alert(roleRestrictionMessage("administration")); return; }
      administrationFocusStudentId = studentId || null;
      administrationActiveSection = "fees";
      if(administrationSearch){ var st=getStudentById(studentId); administrationSearch.value=st?fullStudentName(st):""; }
      if(courseId && administrationCourseFilter){ populateAdministrationCourseFilter(); administrationCourseFilter.value=courseId; }
      setView("administration");
    }

    function renderStudents(){
      if(!studentList || !canCurrentRoleAccess("students")) return;
      populateStudentCourseFilter();
      var q=String(studentSearch && studentSearch.value || "").trim().toLowerCase(); var filter=studentCourseFilter ? studentCourseFilter.value : "all";
      var all=(getAcademyYear().students||[]).slice().sort(function(a,b){return fullStudentName(a).localeCompare(fullStudentName(b),"it");});
      var visible=all.filter(function(st){ if(filter!=="all" && (st.courseIds||[]).indexOf(filter)===-1) return false; if(!q) return true; return [fullStudentName(st),st.email,st.phone,st.notes].join(" ").toLowerCase().indexOf(q)!==-1; });
      studentListMeta.textContent=visible.length+" visibili · "+all.length+" totali"; studentList.innerHTML="";
      if(!visible.length){ studentList.innerHTML='<div class="schoolEmptyState">'+(currentAccessRole === "studente" ? "La tua scheda non è ancora disponibile. Contatta la segreteria SDAC." : "Nessuno studente corrisponde ai filtri.")+'</div>'; return; }
      visible.forEach(function(st){
        var courses=(st.courseIds||[]).map(getCourseById).filter(Boolean); var card=document.createElement("div"); card.className="schoolStudentCard";
        var openBtn=document.createElement("button"); openBtn.type="button"; openBtn.className="schoolStudentOpenBtn";
        openBtn.innerHTML='<span class="schoolAvatar large">'+escapeHtml((st.firstName||st.lastName||"S").charAt(0).toUpperCase())+'</span><span class="schoolStudentCardMain"><strong>'+escapeHtml(fullStudentName(st))+'</strong><span>'+escapeHtml([st.email,st.phone].filter(Boolean).join(' · ') || 'Contatti non inseriti')+'</span><span class="schoolStudentCourses">'+courses.map(function(c){return escapeHtml(c.icon+" "+c.name);}).join(" · ")+'</span></span>';
        openBtn.addEventListener("click",function(){openStudentModal(st.id);}); card.appendChild(openBtn);
        if(false && canCurrentRoleAccess("administration")){
          var financeBtn=document.createElement("button"); financeBtn.type="button"; financeBtn.className="schoolStudentFinance"; financeBtn.title="Apri la situazione economica in Amministrazione";
          financeBtn.innerHTML='<span class="schoolFinanceStatus" data-status="'+summary.status.key+'">'+summary.status.icon+' '+escapeHtml(summary.status.label)+'</span><span class="schoolStudentFinanceAmounts">'+escapeHtml(formatEuro(summary.paid))+' / '+escapeHtml(formatEuro(summary.total))+' · residuo '+escapeHtml(formatEuro(summary.balance))+'</span>';
          financeBtn.addEventListener("click",function(){ openAdministrationForStudent(st.id, filter!=="all"?filter:null); }); card.appendChild(financeBtn);
        }
        studentList.appendChild(card);
      });
    }

    function renderStudentCourseChecks(student){
      if(!studentCourseChecks) return; studentCourseChecks.innerHTML=""; var selected=student ? student.courseIds||[] : [];
      (getAcademyYear().courses||[]).forEach(function(c){ var label=document.createElement("label"); label.className="schoolCheckPill"; label.innerHTML='<input type="checkbox" value="'+escapeHtml(c.id)+'"> <span>'+escapeHtml(c.icon+" "+c.name)+'</span>'; label.querySelector("input").checked=selected.indexOf(c.id)!==-1; studentCourseChecks.appendChild(label); });
    }

    function renderStudentAttendanceSummary(student){
      if(!studentAttendanceSummary) return; if(!student){ studentAttendanceSummary.innerHTML=""; return; }
      var stats=attendanceStatsForStudent(student); var pct=stats.total ? Math.round((stats.present+stats.late)/stats.total*100) : 0;
      var financeLink = false && canCurrentRoleAccess("administration") ? '<div class="studentFinanceModalLink"><button class="btn" id="studentOpenAdministrationBtn" type="button">💼 Apri situazione economica</button></div>' : '';
      studentAttendanceSummary.innerHTML='<div class="schoolEyebrow">Presenze registrate</div><div class="schoolAttendanceSummaryGrid"><div><strong>'+stats.present+'</strong><span>Presenti</span></div><div><strong>'+stats.absent+'</strong><span>Assenze</span></div><div><strong>'+stats.late+'</strong><span>Ritardi</span></div><div><strong>'+pct+'%</strong><span>Frequenza</span></div></div>'+financeLink;
      var financeBtn=studentAttendanceSummary.querySelector("#studentOpenAdministrationBtn"); if(financeBtn) financeBtn.addEventListener("click",function(){ closeStudentModal(); openAdministrationForStudent(student.id,null); });
    }

    function openStudentModal(id){
      if(!canCurrentRoleAccess("students")) return;
      var st=id?getStudentById(id):null; studentEditingId.value=st?st.id:""; studentModalTitle.textContent= currentAccessRole === "studente" ? "La mia scheda" : (currentAccessRole === "docente") ? "Scheda studente" : (st?"Modifica studente":"Nuovo studente");
      var readOnly = (currentAccessRole === "docente" || currentAccessRole === "studente");
      [studentFirstName,studentLastName,studentEmail,studentPhone,studentNotes].forEach(function(field){ if(field) field.readOnly=readOnly; });
      if(studentCourseChecks) studentCourseChecks.classList.toggle("roleReadOnly",readOnly);
      if(saveStudentBtn) saveStudentBtn.hidden=readOnly;
      studentFirstName.value=st?st.firstName:""; studentLastName.value=st?st.lastName:""; studentEmail.value=st?st.email:""; studentPhone.value=st?st.phone:""; studentNotes.value=st?st.notes:"";
      renderStudentCourseChecks(st);
      Array.prototype.forEach.call(studentCourseChecks.querySelectorAll("input"),function(el){el.disabled=readOnly;});
      renderStudentAttendanceSummary(st); deleteStudentBtn.classList.toggle("hidden",!st || readOnly); studentOverlay.style.display="flex"; studentOverlay.classList.add("open"); studentOverlay.setAttribute("aria-hidden","false");
      pushInternalNavLayer("student", closeStudentModalDirect);
      setTimeout(function(){try{studentFirstName.focus();}catch(e){}},30);
    }
    function closeStudentModalDirect(){ if(!studentOverlay)return; studentOverlay.style.display="none"; studentOverlay.classList.remove("open"); studentOverlay.setAttribute("aria-hidden","true"); }
    function closeStudentModal(){ closeInternalNavLayer("student", closeStudentModalDirect); }
    function saveStudent(){
      if((currentAccessRole === "docente" || currentAccessRole === "studente") || !canCurrentRoleAccess("students") || !canMutateSchoolData()) return; var first=String(studentFirstName.value||"").trim(), last=String(studentLastName.value||"").trim(); if(!first && !last){alert("Inserisci almeno nome o cognome.");return;}
      var id=studentEditingId.value; var existing=id?getStudentById(id):null; var checked=Array.prototype.slice.call(studentCourseChecks.querySelectorAll('input[type="checkbox"]:checked')).map(function(x){return x.value;});
      var payload=normalizeStudent({id:existing?existing.id:uid(),firstName:first,lastName:last,email:studentEmail.value,phone:studentPhone.value,notes:studentNotes.value,courseIds:checked,finance:existing?existing.finance:null,createdAt:existing?existing.createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
      var arr=getAcademyYear().students; if(existing){var i=arr.indexOf(existing);arr[i]=payload;}else arr.push(payload); touchAndSave(); closeStudentModal(); renderStudents(); renderCourses(); if(selectedCourseId) renderCourseDetail();
    }
    function deleteStudent(){
      if((currentAccessRole === "docente" || currentAccessRole === "studente") || !canCurrentRoleAccess("students") || !canMutateSchoolData())return; var id=studentEditingId.value; var st=getStudentById(id); if(!st)return; if(!confirm("Eliminare "+fullStudentName(st)+" dall'anno accademico?"))return;
      getAcademyYear().students=getAcademyYear().students.filter(function(x){return x.id!==id;}); (getAcademyYear().courses||[]).forEach(function(c){(c.lessons||[]).forEach(function(l){if(l.attendance)delete l.attendance[id];});}); touchAndSave(); closeStudentModal(); renderStudents(); renderCourses(); if(selectedCourseId) renderCourseDetail();
    }

    function populateAdministrationCourseFilter(){
      if(!administrationCourseFilter) return;
      var current=administrationCourseFilter.value||"all";
      administrationCourseFilter.innerHTML='<option value="all">Tutti i corsi</option>';
      (getAcademyYear().courses||[]).forEach(function(c){ var o=document.createElement("option"); o.value=c.id; o.textContent=c.name; administrationCourseFilter.appendChild(o); });
      administrationCourseFilter.value=Array.prototype.some.call(administrationCourseFilter.options,function(o){return o.value===current;})?current:"all";
    }

    function financeEntries(){
      var entries=[];
      (getAcademyYear().students||[]).forEach(function(st){
        (st.courseIds||[]).forEach(function(cid){
          var course=getCourseById(cid); if(!course)return;
          var enrollment=getStudentFinanceEnrollment(st,cid,true);
          var metrics=financeMetrics(enrollment);
          entries.push({student:st,course:course,enrollment:enrollment,paid:metrics.paid,fee:metrics.fee,balance:metrics.balance,overpaid:metrics.overpaid,status:financeStatus(enrollment)});
        });
      });
      return entries;
    }

    function renderAdministrationStats(entries){
      var total=0,paid=0,balance=0,overdue=0;
      entries.forEach(function(e){total+=e.fee;paid+=e.paid;balance+=e.balance;if(e.status.key==="overdue")overdue++;});
      if(administrationExpectedTotal) administrationExpectedTotal.textContent=formatEuro(total);
      if(administrationPaidTotal) administrationPaidTotal.textContent=formatEuro(paid);
      if(administrationBalanceTotal) administrationBalanceTotal.textContent=formatEuro(balance);
      if(administrationOverdueCount) administrationOverdueCount.textContent=String(overdue);
    }

    function setAdministrationSection(section){
      if(currentAccessRole === "socio" && section === "overview") section="fees";
      if(section !== "overview" && section !== "fees" && section !== "deadlines") section="fees";
      administrationActiveSection=section;
      if(administrationSectionTabs) Array.prototype.forEach.call(administrationSectionTabs.querySelectorAll("[data-admin-section]"),function(btn){btn.classList.toggle("active",btn.getAttribute("data-admin-section")===section);});
      if(administrationOverviewPanel) administrationOverviewPanel.classList.toggle("hidden",section!=="overview");
      if(administrationFeesPanel) administrationFeesPanel.classList.toggle("hidden",section!=="fees");
      if(administrationDeadlinesPanel) administrationDeadlinesPanel.classList.toggle("hidden",section!=="deadlines");
    }

    function renderAdministrationOverview(entries){
      if(!administrationCourseSummary)return;
      administrationCourseSummary.innerHTML="";
      (getAcademyYear().courses||[]).forEach(function(course){
        var list=entries.filter(function(e){return e.course.id===course.id;}); var total=0,paid=0,balance=0; list.forEach(function(e){total+=e.fee;paid+=e.paid;balance+=e.balance;}); var pct=total?Math.min(100,Math.round(paid/total*100)):0;
        var card=document.createElement("div"); card.className="administrationCourseCard";
        card.innerHTML='<div class="administrationCourseCardHead"><strong>'+escapeHtml(course.icon+" "+course.name)+'</strong><span>'+list.length+' iscritti</span></div><div class="administrationCourseProgress"><i style="width:'+pct+'%"></i></div><div class="administrationCourseTotals"><span>'+escapeHtml(formatEuro(paid))+' incassati</span><span>'+escapeHtml(formatEuro(balance))+' residui</span></div>';
        administrationCourseSummary.appendChild(card);
      });
    }

    function dueDescription(entry){
      if(!entry.enrollment.nextDueDate || entry.balance<=0) return "Nessuna scadenza impostata";
      var overdue=entry.enrollment.nextDueDate<isoDate(getTodayDate());
      return (overdue?"Scaduta ":"Scadenza ")+formatSchoolDate(entry.enrollment.nextDueDate);
    }

    // Fase A: un riepilogo in sola lettura, senza migrazione o scrittura dei pagamenti.
    // I pagamenti storici restano nei singoli corsi; i nuovi sono nel registro condiviso.
    function sharedFinanceFor(student){
      if(!student.finance || !student.finance.shared) student.finance=normalizeStudentFinance(student.finance,student.courseIds||[]);
      return student.finance.shared;
    }
    function proposedFinanceFee(parts){
      var prices=parts.map(function(e){return e.fee;}).sort(function(a,b){return a-b;});
      var sum=prices.reduce(function(a,b){return a+b;},0),n=prices.length;
      return n===2?sum-prices[0]*0.5:n===3?sum-prices[0]:n===4?3000:sum;
    }
    function financeAggregateState(student,parts){
      var shared=sharedFinanceFor(student),gross=parts.reduce(function(a,e){return a+e.fee;},0),suggested=proposedFinanceFee(parts);
      var extra=shared.discountType==='percent'?suggested*Math.min(100,shared.discountValue)/100:shared.discountValue;
      var suggestedAfter=Math.max(0,suggested-extra),fee=shared.agreedFee===null?suggestedAfter:shared.agreedFee;
      var historical=parts.reduce(function(a,e){return a+e.paid;},0),sharedPaid=(shared.payments||[]).reduce(function(a,p){return a+Number(p.amount||0);},0);
      return {shared:shared,gross:gross,suggested:suggested,suggestedAfter:suggestedAfter,fee:fee,paid:historical+sharedPaid,sharedPaid:sharedPaid,balance:fee-historical-sharedPaid,confirmed:shared.agreedFee!==null};
    }
    function studentAggregatedFinance(student, entries){
      var parts=entries.filter(function(e){return e.student.id===student.id;});
      var totals=financeAggregateState(student,parts),dates=[],payments=[];
      parts.forEach(function(e){
        if(e.enrollment.nextDueDate && e.balance>0) dates.push(e.enrollment.nextDueDate);
        (e.enrollment.payments||[]).forEach(function(p){payments.push({payment:p,course:e.course});});
      });
      totals.shared.payments.forEach(function(p){payments.push({payment:p,course:null});});
      if(totals.shared.dueDate && totals.balance>0)dates.push(totals.shared.dueDate);
      var overdue=totals.confirmed && dates.some(function(d){return d<isoDate(getTodayDate());});
      var key=totals.confirmed && totals.fee>=0&&totals.balance<=0.009?"settled":overdue?"overdue":totals.paid<=0?"unpaid":"ok";
      var labels={settled:["✅","Saldato"],overdue:["🔴","Scaduto"],unpaid:["⚪","Da iniziare"],ok:["🟢","In regola"]};
      return {student:student,entries:parts,fee:totals.fee,gross:totals.gross,paid:totals.paid,balance:totals.balance,payments:payments,status:{key:key,icon:labels[key][0],label:labels[key][1]},dueDates:dates,totals:totals};
    }

    function renderAdministrationFees(entries){
      if(!administrationFeeList)return;
      populateAdministrationCourseFilter();
      var q=String(administrationSearch&&administrationSearch.value||"").trim().toLowerCase();
      var courseFilter=administrationCourseFilter?administrationCourseFilter.value:"all";
      var statusFilter=administrationStatusFilter?administrationStatusFilter.value:"all";
      var students=(getAcademyYear().students||[]).map(function(st){return studentAggregatedFinance(st,entries);});
      var visible=students.filter(function(s){
        if(!s.entries.length)return false;
        if(courseFilter!=="all"&&!s.entries.some(function(e){return e.course.id===courseFilter;}))return false;
        if(statusFilter!=="all"&&s.status.key!==statusFilter)return false;
        if(!q)return true;
        return (fullStudentName(s.student)+" "+s.student.email+" "+s.entries.map(function(e){return e.course.name;}).join(" ")).toLowerCase().indexOf(q)!==-1;
      }).sort(function(a,b){return fullStudentName(a.student).localeCompare(fullStudentName(b.student),"it");});
      if(administrationFeesMeta) administrationFeesMeta.textContent=visible.length+" studenti visibili · "+students.filter(function(s){return s.entries.length;}).length+" totali";
      administrationFeeList.innerHTML="";
      if(!visible.length){administrationFeeList.innerHTML='<div class="schoolEmptyState">Nessuno studente corrisponde ai filtri.</div>';return;}
      visible.forEach(function(s){
        var row=document.createElement("div");row.className="administrationFeeRow administrationFeeRow--student";
        var progress=s.fee>0?Math.max(0,Math.min(100,Math.round(s.paid/s.fee*100))):0;
        var courseNames=s.entries.map(function(e){return e.course.icon+" "+e.course.name;}).join(" · ");
        row.innerHTML='<div class="administrationFeeHeader"><div class="administrationFeePerson"><strong>'+escapeHtml(fullStudentName(s.student))+'</strong><span class="administrationStudentCourses">'+escapeHtml(courseNames)+'</span></div><div class="administrationFeeActions"><span class="financeStatusBadge" data-status="'+s.status.key+'">'+s.status.icon+' '+escapeHtml(s.status.label)+'</span><button class="btn administrationOpenBtn" type="button">Apri ›</button></div></div><div class="administrationAmounts"><span><strong>'+escapeHtml(formatEuro(s.fee))+'</strong><small>Quota proposta / concordata</small></span><span><strong>'+escapeHtml(formatEuro(s.paid))+'</strong><small>Pagato</small></span><span><strong>'+escapeHtml(formatEuro(s.balance))+'</strong><small>Residuo complessivo</small></span></div><div class="administrationPaymentProgress" role="progressbar" aria-label="Quote pagate" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progress+'"><i style="width:'+progress+'%"></i></div>';
        row.querySelector("button").addEventListener("click",function(){openAggregatedFinanceModal(s.student.id);});
        administrationFeeList.appendChild(row);
      });
    }

    function openAggregatedFinanceModal(studentId){
      if(!canCurrentRoleAccess("administration"))return;
      var student=getStudentById(studentId);if(!student)return;
      var summary=studentAggregatedFinance(student,financeEntries());
      var overlay=document.getElementById("financeAggregateOverlay");if(!overlay)return;
      var name=overlay.querySelector("#financeAggregateTitle");name.textContent=fullStudentName(student);
      var courseButtons=overlay.querySelector("#financeAggregateCourses");courseButtons.replaceChildren();
      summary.entries.forEach(function(e){
        var button=document.createElement("button");button.type="button";button.className="financeAggregateCourseLink";
        button.textContent=e.course.icon+" "+e.course.name+" ›";
        button.title="Apri dettaglio economico del corso "+e.course.name;
        button.addEventListener("click",function(){closeAggregatedFinanceModal();openFinanceModal(student.id,e.course.id);});
        courseButtons.appendChild(button);
      });
      overlay.querySelector("#financeAggregateFee").textContent=formatEuro(summary.fee);
      overlay.querySelector("#financeAggregatePaid").textContent=formatEuro(summary.paid);
      overlay.querySelector("#financeAggregateBalance").textContent=formatEuro(summary.balance);
      overlay.querySelector("#financeAggregateFeeLabel").textContent=summary.totals.confirmed?"Quota concordata":"Quota proposta (da confermare)";
      overlay.querySelector("#financeAggregateAgreementHint").textContent=summary.totals.confirmed?"Quota confermata e salvata.":"Nessuna quota complessiva concordata salvata. La proposta non sostituisce gli accordi esistenti.";
      if(summary.entries.length>=5)overlay.querySelector("#financeAggregateAgreementHint").textContent+=" Per cinque o più corsi, la quota deve essere concordata manualmente.";
      setFinanceAggregateDiscountMode(overlay,summary.totals.shared.discountType,false);
      overlay.querySelector("#financeAggregateDiscountValue").value=String(summary.totals.shared.discountValue);
      overlay.querySelector("#financeAggregateDiscountReason").value=summary.totals.shared.discountReason;
      overlay.querySelector("#financeAggregateAgreed").value=summary.totals.confirmed?String(summary.totals.fee):"";
      overlay.querySelector("#financeAggregateDueDate").value=summary.totals.shared.dueDate||"2027-04-30";
      overlay.dataset.studentId=student.id;
      var paymentList=overlay.querySelector("#financeAggregatePayments");paymentList.innerHTML="";
      var sorted=summary.payments.slice().sort(function(a,b){return String(b.payment.date||b.payment.createdAt||"").localeCompare(String(a.payment.date||a.payment.createdAt||""));});
      if(!sorted.length)paymentList.innerHTML='<div class="schoolEmptyState compact">Nessun pagamento registrato.</div>';
      sorted.forEach(function(entry){
        var pay=entry.payment, item=document.createElement("div");item.className="financeAggregatePayment";
        item.innerHTML='<strong>'+escapeHtml(formatEuro(pay.amount))+'</strong><div><span>'+escapeHtml((pay.date?formatSchoolDate(pay.date):"Data non indicata")+' · '+(pay.kind==="deposit"?"Acconto":"Pagamento")+(pay.method?" · "+pay.method:""))+'</span><small>'+escapeHtml((entry.course?entry.course.name:"Pagamento condiviso")+(pay.note?" · "+pay.note:""))+'</small></div>';
        paymentList.appendChild(item);
      });
      overlay.style.display="flex";overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");
    }
    function setFinanceAggregateDiscountMode(overlay,mode,clearValue){
      if(!overlay)return;
      var type=overlay.querySelector("#financeAggregateDiscountType"),toggle=overlay.querySelector("#financeAggregateDiscountToggle"),value=overlay.querySelector("#financeAggregateDiscountValue");
      mode=mode==="percent"?"percent":"amount";
      type.value=mode;
      toggle.classList.toggle("isPercent",mode==="percent");
      toggle.setAttribute("aria-pressed",mode==="percent"?"true":"false");
      toggle.setAttribute("aria-label",mode==="percent"?"Disattiva sconto in percentuale e usa euro":"Attiva sconto in percentuale");
      toggle.title=mode==="percent"?"Percentuale attiva: clicca per usare euro":"Importo in euro: clicca per usare percentuale";
      value.placeholder=mode==="percent"?"Percentuale":"Importo in euro";
      value.max=mode==="percent"?"100":"";
      if(clearValue)value.value="";
    }
    function saveAggregatedFinanceSettings(){
      if(!canCurrentRoleAccess("administration")||!canMutateSchoolData())return;
      var overlay=document.getElementById("financeAggregateOverlay"),student=getStudentById(overlay.dataset.studentId);if(!student)return;
      var shared=sharedFinanceFor(student),agreedText=overlay.querySelector("#financeAggregateAgreed").value.trim();
      var agreed=agreedText===""?null:Number(agreedText),discountValue=Number(overlay.querySelector("#financeAggregateDiscountValue").value);
      if((agreed!==null&&(!Number.isFinite(agreed)||agreed<0))||!Number.isFinite(discountValue)||discountValue<0){alert("Controlla gli importi inseriti.");return;}
      var discountType=overlay.querySelector("#financeAggregateDiscountType").value;
      if(discountType==="percent"&&discountValue>100){alert("La percentuale non può superare 100.");return;}
      shared.agreedFee=agreed;shared.discountType=discountType;shared.discountValue=discountValue;
      shared.discountReason=overlay.querySelector("#financeAggregateDiscountReason").value.trim().slice(0,250);
      shared.dueDate=overlay.querySelector("#financeAggregateDueDate").value||"2027-04-30";
      shared.audit.push(normalizeFinanceAuditEvent({type:"shared_settings",detail:"Quota e agevolazioni aggiornate",actorEmail:getCurrentUserEmail(),actorRole:getCurrentAccessRole()}));
      student.updatedAt=new Date().toISOString();touchAndSave();renderAdministration();openAggregatedFinanceModal(student.id);
    }
    function addSharedFinancePayment(){
      if(!canCurrentRoleAccess("administration")||!canMutateSchoolData())return;
      var overlay=document.getElementById("financeAggregateOverlay"),student=getStudentById(overlay.dataset.studentId);if(!student)return;
      var amount=Number(overlay.querySelector("#sharedPaymentAmount").value);
      if(!Number.isFinite(amount)||amount<=0){alert("Inserisci un importo positivo.");return;}
      var actor=currentAuditActor(),shared=sharedFinanceFor(student);
      var pay=normalizeFinancePayment({kind:overlay.querySelector("#sharedPaymentKind").value,amount:amount,date:overlay.querySelector("#sharedPaymentDate").value||isoDate(getTodayDate()),method:overlay.querySelector("#sharedPaymentMethod").value,note:overlay.querySelector("#sharedPaymentNote").value.trim(),createdBy:actor.email,createdByRole:actor.role,createdAt:actor.at});
      shared.payments.push(pay);
      shared.audit.push(normalizeFinanceAuditEvent({type:"payment_added",paymentId:pay.id,amount:pay.amount,date:pay.date,detail:"Pagamento condiviso",actorEmail:actor.email,actorRole:actor.role}));
      student.updatedAt=new Date().toISOString();touchAndSave();renderAdministration();openAggregatedFinanceModal(student.id);
      overlay.querySelector("#sharedPaymentAmount").value="";overlay.querySelector("#sharedPaymentNote").value="";
    }
    function closeAggregatedFinanceModal(){
      var overlay=document.getElementById("financeAggregateOverlay");if(!overlay)return;
      overlay.style.display="none";overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true");
    }

    function renderAdministrationDeadlines(entries){
      if(!administrationDeadlineList)return;
      var list=entries.filter(function(e){return e.balance>0&&e.enrollment.nextDueDate;}).sort(function(a,b){return a.enrollment.nextDueDate.localeCompare(b.enrollment.nextDueDate);});
      administrationDeadlineList.innerHTML="";
      if(!list.length){administrationDeadlineList.innerHTML='<div class="schoolEmptyState">Nessuna prossima scadenza impostata. Puoi aggiungerla nella scheda economica dello studente senza indicare un importo.</div>';return;}
      list.forEach(function(e){
        var overdue=e.enrollment.nextDueDate<isoDate(getTodayDate()); var row=document.createElement("div"); row.className="administrationDeadlineRow";
        row.innerHTML='<div class="administrationDeadlineDate"><strong>'+escapeHtml(formatSchoolDate(e.enrollment.nextDueDate))+'</strong><span>'+(overdue?'🔴 Scaduta':'🟡 Da seguire')+'</span></div><div class="administrationDeadlineMain"><strong>'+escapeHtml(fullStudentName(e.student))+' · '+escapeHtml(e.course.name)+'</strong><span>'+escapeHtml(e.enrollment.nextDueNote||("Residuo "+formatEuro(e.balance)))+'</span></div><button class="btn" type="button">Apri</button>';
        row.querySelector("button").addEventListener("click",function(){openFinanceModal(e.student.id,e.course.id);}); administrationDeadlineList.appendChild(row);
      });
    }

    function renderAdministration(){
      if(!viewAdministration||!canCurrentRoleAccess("administration"))return;
      if(administrationAcademicYear)administrationAcademicYear.textContent=state.academy&&state.academy.activeYear||ACADEMIC_YEAR;
      if(administrationRoleHint)administrationRoleHint.textContent=currentAccessRole==="socio"?"Gestisci quote, pagamenti e scadenze degli studenti. Le future voci generali della scuola resteranno riservate all'Admin.":"Quote studenti oggi; in futuro qui confluiranno spese, altre entrate e bilancio della scuola.";
      if(!administrationActiveSection) administrationActiveSection=currentAccessRole==="admin"?"overview":"fees";
      if(currentAccessRole==="socio"&&administrationActiveSection==="overview")administrationActiveSection="fees";
      var entries=financeEntries(); renderAdministrationStats(entries); renderAdministrationOverview(entries); renderAdministrationFees(entries); renderAdministrationDeadlines(entries); setAdministrationSection(administrationActiveSection);
    }

    function refreshFinanceModal(){
      if(!financeStudentId||!financeCourseId)return;
      var st=getStudentById(financeStudentId.value), course=getCourseById(financeCourseId.value); if(!st||!course)return;
      var e=getStudentFinanceEnrollment(st,course.id,true); var metrics=financeMetrics(e), paid=metrics.paid, fee=metrics.fee, balance=metrics.balance, status=financeStatus(e);
      financeModalTitle.textContent=fullStudentName(st); financeModalCourse.textContent=course.icon+" "+course.name;
      financeFeeDisplay.textContent=formatEuro(fee); financePaidDisplay.textContent=formatEuro(paid); financeBalanceDisplay.textContent=formatEuro(balance); financeStatusDisplay.textContent=status.icon+" "+status.label; financeStatusDisplay.setAttribute("data-status",status.key);
      financeCourseFee.value=String(fee); financeNextDueDate.value=e.nextDueDate||""; financeNextDueNote.value=e.nextDueNote||"";
      financePaymentList.innerHTML="";
      var payments=(e.payments||[]).slice().sort(function(a,b){return String(b.date||b.createdAt).localeCompare(String(a.date||a.createdAt));});
      if(!payments.length)financePaymentList.innerHTML="<div class=\"schoolEmptyState compact\">Nessun pagamento registrato. L'acconto standard è 300 €, ma puoi registrare l'importo realmente versato.</div>";
      payments.forEach(function(p){
        var row=document.createElement("div"); row.className="financePaymentRow"; var kind=p.kind==="deposit"?"Acconto":"Pagamento";
        row.innerHTML='<span class="financePaymentKind">'+kind+'</span><span class="financePaymentAmount">'+escapeHtml(formatEuro(p.amount))+'</span><span class="financePaymentMeta"><span>'+escapeHtml(p.date?formatSchoolDate(p.date):"Data non indicata")+(p.method?' · '+escapeHtml(p.method):'')+'</span>'+(p.note?'<span>'+escapeHtml(p.note)+'</span>':'')+'</span><button class="smallBtn danger" type="button" title="Elimina pagamento">Elimina</button>';
        row.querySelector("button").addEventListener("click",function(){
          if(!canMutateSchoolData())return;
          var paymentDate=p.date?formatSchoolDate(p.date):"data non indicata";
          var message="Eliminare il pagamento di "+formatEuro(p.amount)+" del "+paymentDate+" per "+fullStudentName(st)+" · "+course.name+"?\n\nQuesta operazione aggiornera subito il residuo e verra annotata nel registro tecnico delle modifiche.";
          if(!confirm(message))return;
          appendFinanceAudit(e,{type:"payment_deleted",paymentId:p.id,amount:p.amount,date:p.date,detail:(p.kind==="deposit"?"Acconto":"Pagamento")+" eliminato"});
          e.payments=e.payments.filter(function(x){return x.id!==p.id;});
          st.updatedAt=new Date().toISOString();
          touchAndSave(); refreshFinanceModal(); renderAdministration(); renderStudents();
        });
        financePaymentList.appendChild(row);
      });
      var noPayments=!(e.payments||[]).length; financePaymentKind.value=noPayments?"deposit":"payment"; if(noPayments&&!financePaymentAmount.value)financePaymentAmount.value="300";
    }

    function openFinanceModal(studentId,courseId){
      if(!canCurrentRoleAccess("administration"))return;
      var st=getStudentById(studentId),course=getCourseById(courseId);if(!st||!course)return;
      financeStudentId.value=st.id;financeCourseId.value=course.id;financePaymentAmount.value="";financePaymentDate.value=isoDate(getTodayDate());financePaymentMethod.value="";financePaymentNote.value="";
      financeOverlay.style.display="flex";financeOverlay.classList.add("open");financeOverlay.setAttribute("aria-hidden","false");
      pushInternalNavLayer("finance", closeFinanceModalDirect);
      refreshFinanceModal();
    }
    function closeFinanceModalDirect(){if(!financeOverlay)return;financeOverlay.style.display="none";financeOverlay.classList.remove("open");financeOverlay.setAttribute("aria-hidden","true");}
    function closeFinanceModal(){closeInternalNavLayer("finance", closeFinanceModalDirect);}
    function saveFinanceSettings(){
      if(!canCurrentRoleAccess("administration")||!canMutateSchoolData())return;
      var st=getStudentById(financeStudentId.value),course=getCourseById(financeCourseId.value);if(!st||!course)return;
      var e=getStudentFinanceEnrollment(st,course.id,true);var fee=Number(financeCourseFee.value);if(!Number.isFinite(fee)||fee<0){alert("Inserisci una quota corso valida.");return;}
      var nextDate=String(financeNextDueDate.value||"").slice(0,10), nextNote=String(financeNextDueNote.value||"").trim();
      var changed=Number(e.courseFee||0)!==fee || String(e.nextDueDate||"")!==nextDate || String(e.nextDueNote||"")!==nextNote;
      if(changed) appendFinanceAudit(e,{type:"finance_settings",detail:"Quota/scadenza aggiornata"});
      e.courseFee=fee;e.nextDueDate=nextDate;e.nextDueNote=nextNote;st.updatedAt=new Date().toISOString();touchAndSave();refreshFinanceModal();renderAdministration();renderStudents();
    }
    function addFinancePayment(){
      if(!canCurrentRoleAccess("administration")||!canMutateSchoolData())return;
      var st=getStudentById(financeStudentId.value),course=getCourseById(financeCourseId.value);if(!st||!course)return;var e=getStudentFinanceEnrollment(st,course.id,true);var amount=Number(financePaymentAmount.value);if(!Number.isFinite(amount)||amount<=0){alert("Inserisci l'importo realmente pagato.");return;}
      var actor=currentAuditActor();
      var payment=normalizeFinancePayment({kind:financePaymentKind.value,amount:amount,date:financePaymentDate.value||isoDate(getTodayDate()),method:financePaymentMethod.value,note:financePaymentNote.value,createdAt:actor.at,updatedAt:actor.at,createdBy:actor.email,createdByRole:actor.role,updatedBy:actor.email,updatedByRole:actor.role});
      e.payments.push(payment);
      appendFinanceAudit(e,{type:"payment_added",paymentId:payment.id,amount:payment.amount,date:payment.date,detail:payment.kind==="deposit"?"Acconto registrato":"Pagamento registrato"});
      st.updatedAt=new Date().toISOString();financePaymentAmount.value="";financePaymentNote.value="";financePaymentKind.value="payment";touchAndSave();refreshFinanceModal();renderAdministration();renderStudents();
    }

    function renderAll(){
      renderCalendar();
      renderTodos();
      renderNotes();
      renderSummary();
      renderContacts();
      renderTodayPanel();
      renderCourses();
      renderStudents();
      renderAdministration();
    }

    var discountToggle=document.getElementById("financeAggregateDiscountToggle");
    if(discountToggle)discountToggle.addEventListener("click",function(){
      var overlay=document.getElementById("financeAggregateOverlay");
      var current=overlay.querySelector("#financeAggregateDiscountType").value;
      setFinanceAggregateDiscountMode(overlay,current==="percent"?"amount":"percent",true);
      overlay.querySelector("#financeAggregateDiscountValue").focus();
    });
    var aggregateCloseButton=document.getElementById("closeFinanceAggregateBtn");
    if(aggregateCloseButton) aggregateCloseButton.addEventListener("click",closeAggregatedFinanceModal);
    var aggregateOverlay=document.getElementById("financeAggregateOverlay");
    if(aggregateOverlay) aggregateOverlay.addEventListener("click",function(e){if(e.target===aggregateOverlay)closeAggregatedFinanceModal();});

    var saveAggregate=document.getElementById("saveFinanceAggregateBtn"),addShared=document.getElementById("addSharedPaymentBtn");
    if(saveAggregate)saveAggregate.addEventListener("click",saveAggregatedFinanceSettings);
    if(addShared)addShared.addEventListener("click",addSharedFinancePayment);
    var dateShared=document.getElementById("sharedPaymentDate");if(dateShared)dateShared.value=isoDate(getTodayDate());

    // Wire
    tabs.forEach(function(t){
      function activateTab(){ navigateMainView(t.getAttribute("data-view")); }
      t.addEventListener("click", activateTab);
      t.addEventListener("keydown", function(ev){
        if(ev.key === "Enter" || ev.key === " "){
          ev.preventDefault();
          activateTab();
        }
      });
    });

    if(topTodayLine){
      topTodayLine.addEventListener("click", function(){
        if(currentView === "today") return;
        var openToday = function(){
          var previousView = currentView;
          todayViewOffset = 0;
          pushInternalNavLayer("today", function(){
            todayViewOffset = 0;
            setView(previousView, true);
          });
          if(setView("today")) renderTodayPanel();
        };
        if(internalNavStack.length || internalNavBackPending) abandonInternalLayers(openToday);
        else openToday();
      });
    }

    if(todayPrevBtn){
      todayPrevBtn.addEventListener("click", function(){
        todayViewOffset -= 1;
        renderTodayPanel();
      });
    }

    if(todayNextBtn){
      todayNextBtn.addEventListener("click", function(){
        todayViewOffset += 1;
        renderTodayPanel();
      });
    }

    prevMonth.addEventListener("click", function(){ shiftCalendarMonth(-1); renderCalendar(); });
    nextMonth.addEventListener("click", function(){ shiftCalendarMonth(1); renderCalendar(); });

    jumpToday.addEventListener("click", function(){
      var now = new Date();
      currentYear = now.getFullYear();
      currentMonth = now.getMonth();
      renderCalendar();
    });

    overlay.addEventListener("click", function(ev){ if(ev.target === overlay) closeDay(); });
    btnCloseDay.addEventListener("click", closeDay);
    document.addEventListener("keydown", function(ev){
      if(ev.key !== "Escape") return;
      if(isSettingsMenuOpen()){
        setSettingsMenuOpen(false);
        if(settingsMenuBtn) settingsMenuBtn.focus();
        return;
      }
      if(window.AgendaAccount && window.AgendaAccount.isOpen && window.AgendaAccount.isOpen()) return;
      if(financeOverlay && financeOverlay.style.display === "flex") closeFinanceModal();
      else if(studentOverlay && studentOverlay.style.display === "flex") closeStudentModal();
      else if(contactOverlay && contactOverlay.style.display === "flex") closeContactModal();
      else closeDay();
    });

    btnAddEvent.addEventListener("click", handleEventSubmit);
    if(btnCancelEventEdit) btnCancelEventEdit.addEventListener("click", cancelEventEdit);
    btnPrintDay.addEventListener("click", printDay);

    if(notebookHeaderBtn) notebookHeaderBtn.addEventListener("click", function(){ setView("notebook"); });
    if(sessionRoleBadgeHeader){
      sessionRoleBadgeHeader.addEventListener("click", function(ev){ if(canCurrentRoleAccess("settings")){ ev.stopPropagation(); toggleSettingsMenu(); } });
      sessionRoleBadgeHeader.addEventListener("keydown", function(ev){ if(canCurrentRoleAccess("settings") && (ev.key === "Enter" || ev.key === " ")){ ev.preventDefault(); ev.stopPropagation(); toggleSettingsMenu(); } });
    }
    if(settingsMenuBtn){
      settingsMenuBtn.addEventListener("click", function(ev){
        ev.stopPropagation();
        toggleSettingsMenu();
      });
    }
    if(settingsMenuWrap){
      settingsMenuWrap.addEventListener("click", function(ev){ ev.stopPropagation(); });
    }
    document.addEventListener("click", function(){
      if(isSettingsMenuOpen()) setSettingsMenuOpen(false);
    });

    btnExport.addEventListener("click", function(){
      setSettingsMenuOpen(false);
      exportJSON();
    });
    if(btnImportTrigger){
      btnImportTrigger.addEventListener("click", function(){
        if(!canCurrentRoleAccess("settings")){
          window.alert(roleRestrictionMessage("settings"));
          return;
        }
        if(importFile) importFile.click();
      });
    }
    importFile.addEventListener("change", function(ev){
      setSettingsMenuOpen(false);
      importJSON(ev);
    });
    btnReset.addEventListener("click", function(){
      setSettingsMenuOpen(false);
      resetAll();
    });

    addTodo.addEventListener("click", addTodoItem);
    todoText.addEventListener("keydown", function(ev){ if(ev.key === "Enter") addTodoItem(); });

    todoSearch.addEventListener("input", renderTodos);
    todoFilter.addEventListener("change", renderTodos);

    if(contactSearch) contactSearch.addEventListener("input", renderContacts);
    if(contactCategoryFilter) contactCategoryFilter.addEventListener("change", renderContacts);
    if(openContactBtn) openContactBtn.addEventListener("click", function(){ openContactModal(); });
    if(saveContactBtn) saveContactBtn.addEventListener("click", saveContact);
    if(closeContactBtn) closeContactBtn.addEventListener("click", closeContactModal);
    if(contactOverlay) contactOverlay.addEventListener("click", function(ev){ if(ev.target === contactOverlay) closeContactModal(); });
    if(contactName) contactName.addEventListener("keydown", function(ev){ if(ev.key === "Enter") saveContact(); });

    if(btnSaveNote) btnSaveNote.addEventListener("click", saveCurrentNote);
    if(btnNotesFavorites) btnNotesFavorites.addEventListener("click", toggleNotesFavorites);
    if(btnOpenNoteEditor) btnOpenNoteEditor.addEventListener("click", openNotesEditorFromList);

    if(quickNoteTitle){
      quickNoteTitle.addEventListener("input", function(){
        var notesState = getNotesState();
        notesState.draftTitle = quickNoteTitle.value;
        touchAndSave();
        updateNotesEditorStatus();
      });
      quickNoteTitle.addEventListener("keydown", function(ev){
        if(ev.key === "Enter"){
          ev.preventDefault();
          saveCurrentNote();
        }
      });
    }

    if(quickNotes){
      quickNotes.addEventListener("input", function(){
        var notesState = getNotesState();
        notesState.draftBody = quickNotes.value;
        touchAndSave();
      });
    }



    if(closeCourseDetailBtn) closeCourseDetailBtn.addEventListener("click", closeCourseDetail);
    if(saveCourseSettingsBtn) saveCourseSettingsBtn.addEventListener("click", saveCourseSettings);
    if(saveLessonBtn) saveLessonBtn.addEventListener("click", saveLesson);
    if(cancelLessonEditBtn) cancelLessonEditBtn.addEventListener("click", function(){ var c=getCourseById(selectedCourseId); if(c) resetLessonEditor(c,true); });
    if(markAllPresentBtn) markAllPresentBtn.addEventListener("click", function(){ if(!lessonAttendanceEditor)return; Array.prototype.forEach.call(lessonAttendanceEditor.querySelectorAll("select"),function(sel){sel.value="present";}); });
    if(addStudentBtn) addStudentBtn.addEventListener("click", function(){ openStudentModal(null); });
    if(studentSearch) studentSearch.addEventListener("input", renderStudents);
    if(studentCourseFilter) studentCourseFilter.addEventListener("change", renderStudents);
    if(saveStudentBtn) saveStudentBtn.addEventListener("click", saveStudent);
    if(deleteStudentBtn) deleteStudentBtn.addEventListener("click", deleteStudent);
    if(closeStudentBtn) closeStudentBtn.addEventListener("click", closeStudentModal);
    if(studentOverlay) studentOverlay.addEventListener("click", function(ev){ if(ev.target===studentOverlay) closeStudentModal(); });

    if(administrationSectionTabs) administrationSectionTabs.addEventListener("click",function(ev){ var btn=ev.target.closest&&ev.target.closest("[data-admin-section]");if(!btn||btn.disabled)return;setAdministrationSection(btn.getAttribute("data-admin-section")); });
    if(administrationSearch) administrationSearch.addEventListener("input",function(){administrationFocusStudentId=null;renderAdministration();});
    if(administrationCourseFilter) administrationCourseFilter.addEventListener("change",renderAdministration);
    if(administrationStatusFilter) administrationStatusFilter.addEventListener("change",renderAdministration);
    if(closeFinanceBtn) closeFinanceBtn.addEventListener("click",closeFinanceModal);
    if(financeOverlay) financeOverlay.addEventListener("click",function(ev){if(ev.target===financeOverlay)closeFinanceModal();});
    if(saveFinanceSettingsBtn) saveFinanceSettingsBtn.addEventListener("click",saveFinanceSettings);
    if(addFinancePaymentBtn) addFinancePaymentBtn.addEventListener("click",addFinancePayment);
    if(financePaymentKind) financePaymentKind.addEventListener("change",function(){if(financePaymentKind.value==="deposit"&&!financePaymentAmount.value)financePaymentAmount.value="300";});

    // Init
    applyTheme(getSavedTheme(), false);
    var now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    syncNotesUiFromState();
    renderAll();
    syncTodoMiniPanelAria();
    updateStorageStatus();
    initInternalNavigation();
    setView("calendar");

    
var installBtn = document.getElementById("installBtn");
var deferredInstallPrompt = null;

function updateTodayLine(){
  var el = document.getElementById("todayLine");
  if(!el) return;

  var d = new Date();
  var s = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(d);

  s = s.charAt(0).toUpperCase() + s.slice(1);
  el.textContent = s;

  var nextTodayISO = isoDate(getTodayDate());
  if(nextTodayISO !== liveTodayISO){
    liveTodayISO = nextTodayISO;
    renderCalendar();
    renderSummary();
    renderTodayPanel();
  }
}

function isStandaloneMode(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosInstallable(){
  var ua = String(window.navigator.userAgent || "");
  var isIOS = /iphone|ipad|ipod/i.test(ua);
  var isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  return isIOS && isSafari && !isStandaloneMode();
}

function updateInstallButton(){
  if(!installBtn) return;

  if(isStandaloneMode()) {
    installBtn.classList.add("hidden");
    return;
  }

  if(deferredInstallPrompt){
    installBtn.textContent = "Installa";
    installBtn.classList.remove("hidden");
    return;
  }

  if(isIosInstallable()) {
    installBtn.textContent = "Installa";
    installBtn.classList.remove("hidden");
    return;
  }

  installBtn.classList.add("hidden");
}

async function handleInstallClick(){
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    try{
      await deferredInstallPrompt.userChoice;
    }catch(e){}
    deferredInstallPrompt = null;
    updateInstallButton();
    return;
  }

  if(isIosInstallable()){
    window.alert("Per installare SDAC Agenda su iPhone o iPad: tocca Condividi in Safari e poi 'Aggiungi a Home'.");
  }
}

updateTodayLine();
setInterval(updateTodayLine, 60 * 1000);
updateInstallButton();

window.addEventListener("beforeinstallprompt", function(ev){
  ev.preventDefault();
  deferredInstallPrompt = ev;
  updateInstallButton();
});

window.addEventListener("appinstalled", function(){
  deferredInstallPrompt = null;
  updateInstallButton();
});

if(installBtn){
  installBtn.addEventListener("click", handleInstallClick);
}

if(btnCloudRefresh){
  btnCloudRefresh.addEventListener("click", handleManualCloudRefresh);
}
applyRolePermissions(getIdentityUser());
setCloudStatus("idle");

if(themeToggleBtn){
  themeToggleBtn.addEventListener("click", toggleTheme);
  updateThemeToggleUi();
}

if("serviceWorker" in navigator){
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("./service-worker.js").catch(function(err){
      console.warn("Service worker non registrato:", err);
    });
  });
}

function switchStateForCurrentSession(){
  try{
    // Mai riutilizzare la vista rimasta attiva per l'account precedente.
    // La navigazione completa viene ricostruita dopo l'applicazione del ruolo.
    currentView = "calendar";
    todayViewOffset = 0;
    administrationActiveSection = null;
    state = loadState();
    syncNotesUiFromState();
    renderAll();
    setView("calendar", true);
    updateStorageStatus(true);
  }catch(e){
    console.warn("Cambio sessione non riuscito:", e);
  }
}

window.AgendaApp = {
  onIdentityInit: function(user){
    identityTransitionKey = user ? String(user.id || user.sub || user.email || "") + ":" + getRoleFromUser(user) : null;
    setIdentitySessionUser(user);
    resetCloudSession();
    applyRolePermissions(user);
    switchStateForCurrentSession();
    applyRolePermissions(user);
    if(user && hasAuthorizedCloudRole()){
      startRemotePolling();
      beginMandatoryCloudRefresh();
    }else{
      stopRemotePolling();
      remoteConflictPending = false;
      remoteLastKnownUpdatedAt = null;
      remoteLastCheckedAt = null;
      setCloudWriteLock(false);
      setCloudStatus(user ? "forbidden" : "idle", user ? undefined : "\u2601\uFE0F Cloud: non attivo");
    }
  },
  onIdentityLogin: function(user){
    if(!user) return;
    var nextIdentityKey = String(user.id || user.sub || user.email || "") + ":" + getRoleFromUser(user);
    if(identityTransitionKey === nextIdentityKey && isLoggedIn()) return;
    identityTransitionKey = nextIdentityKey;
    setIdentitySessionUser(user);
    resetCloudSession();
    applyRolePermissions(user);
    switchStateForCurrentSession();
    applyRolePermissions(user);
    if(hasAuthorizedCloudRole()){
      startRemotePolling();
      beginMandatoryCloudRefresh();
    }else{
      stopRemotePolling();
      setCloudWriteLock(false);
      setCloudStatus("forbidden");
    }
  },
  onIdentityLogout: function(){
    identityTransitionKey = null;
    setIdentitySessionUser(null);
    resetCloudSession();
    remoteConflictPending = false;
    remoteLastKnownUpdatedAt = null;
    remoteLastCheckedAt = null;
    setCloudWriteLock(false);
    applyRolePermissions(null);
    switchStateForCurrentSession();
    applyRolePermissions(null);
    setCloudStatus("idle", "\u2601\uFE0F Cloud: non attivo");
  },
  requestSoftSync: function(){
    if(hasAuthorizedCloudRole()) scheduleRemoteRefresh(false, remoteWriteLocked && !remoteConflictPending);
    else if(isLoggedIn()) setCloudStatus("forbidden");
  }
};

if (window.netlifyIdentity) {
  window.addEventListener("online", function(){
    scheduleRemoteRefresh(false, false);
  });

  window.addEventListener("focus", function(){
    scheduleRemoteRefresh(false, false);
  });

  window.addEventListener("pageshow", function(){
    scheduleRemoteRefresh(false, false);
  });

  document.addEventListener("visibilitychange", function(){
    if(document.visibilityState === "visible") scheduleRemoteRefresh(false, false);
  });
}


  })();
