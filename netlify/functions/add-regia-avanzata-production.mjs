import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

const CONTEXT = process.env.CONTEXT || process.env.NETLIFY_CONTEXT || "";
const STORE_NAME = "sdac-agenda";
const STATE_KEY = "state-v2-shared-sdac";
const COURSE = Object.freeze({
  id: "regia-avanzata", name: "Regia Avanzata", icon: "🎬",
  weekday: 5, startTime: "17:00", endTime: "19:00",
  firstDate: "2026-10-23", fee: 1000, lessonTarget: 10,
  teacherName: "Alessandro Bellagamba",
  teacherEmails: ["alessandro.bellagamba@live.it"], lessons: []
});
function respond(data, status=200) {
  return new Response(JSON.stringify(data), {status, headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
}
function contextUser(ctx) {
  try {
    const raw=ctx?.clientContext?.custom?.netlify;
    if(raw) return JSON.parse(Buffer.from(raw,"base64").toString("utf8"))?.user || null;
  } catch {}
  return ctx?.clientContext?.user || null;
}
function roles(user) {
  const raw=user?.app_metadata?.roles || user?.appMetadata?.roles || user?.roles || [];
  return Array.isArray(raw)?raw.map(r=>String(r).toLowerCase()):[];
}
function summary(state) {
  const year=state?.academy?.years?.["2026/2027"];
  const courses=Array.isArray(year?.courses)?year.courses:[];
  const students=Array.isArray(year?.students)?year.students:[];
  return {year:"2026/2027",courses:courses.length,students:students.length,
    alreadyPresent:courses.some(c=>c?.id===COURSE.id),
    existingCourse:courses.find(c=>c?.id===COURSE.id)||null,
    updatedAt:state?.updatedAt||null};
}
export default async (req,ctx) => {
  const runtimeContext = String(ctx?.deploy?.context || CONTEXT).toLowerCase();
  if(runtimeContext!=="production") return respond({ok:false,error:"Operazione consentita esclusivamente in produzione.",context:runtimeContext||"unknown"},403);
  const user=(await getUser().catch(()=>null))||contextUser(ctx);
  if(!user) return respond({ok:false,error:"Accesso richiesto."},401);
  if(!roles(user).includes("admin")) return respond({ok:false,error:"Solo Admin."},403);
  if(!["GET","POST"].includes(req.method)) return respond({ok:false,error:"Metodo non consentito."},405);
  try {
    const store=getStore({name:STORE_NAME,consistency:"strong"});
    const entry=await store.getWithMetadata(STATE_KEY,{type:"json",consistency:"strong"});
    const current=entry?.data;
    if(!current || !entry?.etag || !current?.academy?.years?.["2026/2027"] || !Array.isArray(current.academy.years["2026/2027"].courses)) {
      return respond({ok:false,error:"Archivio ufficiale non inizializzato o struttura inattesa. Nessuna modifica effettuata."},409);
    }
    if(req.method==="GET") return respond({ok:true,environment:"PRODUZIONE",...summary(current),proposed:COURSE});
    const body=await req.json().catch(()=>null);
    if(body?.confirmation!=="AGGIUNGI REGIA AVANZATA PRODUZIONE" || body?.baseUpdatedAt!==current.updatedAt)
      return respond({ok:false,error:"Conferma o versione non valida: riesegui la verifica prima di procedere."},409);
    if(summary(current).alreadyPresent) return respond({ok:true,alreadyPresent:true,message:"Corso già presente. Nessuna modifica effettuata.",...summary(current)});
    const now=new Date().toISOString();
    const backupKey=`course-updates/production-before-regia-avanzata-${now.replace(/[:.]/g,"-")}-${crypto.randomUUID()}.json`;
    const token=crypto.randomUUID();
    await store.setJSON(backupKey,{token,savedAtUTC:now,state:current});
    const saved=await store.get(backupKey,{type:"json",consistency:"strong"});
    if(saved?.token!==token || JSON.stringify(saved.state)!==JSON.stringify(current))
      return respond({ok:false,error:"Backup preventivo non verificato; nessuna modifica effettuata."},500);
    const next=structuredClone(current);
    next.academy.years["2026/2027"].courses.push({...COURSE,teacherEmails:[...COURSE.teacherEmails],lessons:[]});
    next.updatedAt=now;
    const result=await store.setJSON(STATE_KEY,next,{onlyIfMatch:entry.etag});
    // Netlify may omit or vary the `modified` flag; verify the stored content instead.
    // An explicit false means the ETag condition failed: do not claim a successful write.
    if(result?.modified===false) return respond({ok:false,error:"L'archivio ufficiale è cambiato durante l'operazione. Nessuna sostituzione eseguita: ripeti Verifica archivio.",backupKey},409);
    const verify=await store.get(STATE_KEY,{type:"json",consistency:"strong"});
    const beforeIds=current.academy.years["2026/2027"].students.map(s=>s.id).sort();
    const afterIds=(verify?.academy?.years?.["2026/2027"]?.students||[]).map(s=>s.id).sort();
    const expectedRest=structuredClone(current);
    const actualRest=structuredClone(verify||{});
    delete expectedRest.updatedAt; delete actualRest.updatedAt;
    delete expectedRest.academy.years["2026/2027"].courses;
    if(actualRest.academy?.years?.["2026/2027"]) delete actualRest.academy.years["2026/2027"].courses;
    const previousCourses=current.academy.years["2026/2027"].courses;
    const restoredCourses=verify?.academy?.years?.["2026/2027"]?.courses||[];
    if(!verify || verify.updatedAt!==now || !summary(verify).alreadyPresent || summary(verify).students!==summary(current).students || summary(verify).courses!==summary(current).courses+1 || JSON.stringify(beforeIds)!==JSON.stringify(afterIds) || JSON.stringify(restoredCourses.filter(c=>c.id!==COURSE.id))!==JSON.stringify(previousCourses) || JSON.stringify(expectedRest)!==JSON.stringify(actualRest))
      return respond({ok:false,error:"Verifica successiva al salvataggio non superata: controllare l'archivio ufficiale prima di ulteriori azioni.",backupKey},500);
    return respond({ok:true,added:true,backupKey,...summary(verify)});
  } catch(e) { return respond({ok:false,error:"Operazione interrotta: "+String(e?.message||e)},500); }
};
