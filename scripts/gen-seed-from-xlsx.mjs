import zlib from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";

// ---- minimal xlsx (zip) reader ----
function readZipEntries(buf) {
  // locate End Of Central Directory
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const cdOff = buf.readUInt32LE(eocd + 16);
  const count = buf.readUInt16LE(eocd + 10);
  const entries = {};
  let p = cdOff;
  for (let i = 0; i < count; i++) {
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commLen = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    // local header
    const lnameLen = buf.readUInt16LE(lho + 26);
    const lextraLen = buf.readUInt16LE(lho + 28);
    const method = buf.readUInt16LE(lho + 8);
    const compSize = buf.readUInt32LE(lho + 18);
    const dataStart = lho + 30 + lnameLen + lextraLen;
    const comp = buf.subarray(dataStart, dataStart + compSize);
    entries[name] = method === 0 ? comp : zlib.inflateRawSync(comp);
    p += 46 + nameLen + extraLen + commLen;
  }
  return entries;
}

const buf = readFileSync("12 бүртгэл (Autosaved).xlsx");
const z = readZipEntries(buf);
const xml = (name) => z[name].toString("utf8");

// shared strings
const ss = [];
{
  const s = xml("xl/sharedStrings.xml");
  const re = /<si>([\s\S]*?)<\/si>/g; let m;
  while ((m = re.exec(s))) {
    const texts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(x => x[1]);
    ss.push(texts.join("").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim());
  }
}
function colnum(ref){ const c=ref.match(/[A-Z]+/)[0]; let n=0; for(const ch of c) n=n*26+(ch.charCodeAt(0)-64); return n; }
function rownum(ref){ return parseInt(ref.match(/\d+/)[0],10); }

// parse sheet1 cells -> rows[row][col]=value
const rows = {};
{
  const s = xml("xl/worksheets/sheet1.xml");
  const re = /<c r="([A-Z]+\d+)"(?:[^>]*?\st="([^"]+)")?[^>]*>(?:<v>([\s\S]*?)<\/v>)?<\/c>/g;
  let m;
  while ((m = re.exec(s))) {
    const ref=m[1], t=m[2], v=m[3];
    if (v===undefined) continue;
    let val = t==="s" ? ss[parseInt(v,10)] : v;
    if (val===undefined || val==="") continue;
    const r=rownum(ref), c=colnum(ref);
    (rows[r] ??= {})[c]=val;
  }
}
const isNum = (v)=>/^\d+(\.\d+)?$/.test(String(v).trim());

// family blocks: [number, headCol, colLo, colHi, rowLo, rowHi]
const blocks = [
  // top (rows 2-35)
  [1, 2, 1, 6, 2, 35], [2, 7, 7, 11, 2, 35], [3, 12, 12, 15, 2, 35],
  [4, 16, 16, 19, 2, 35], [5, 20, 20, 23, 2, 35], [6, 24, 24, 26, 2, 35],
  // bottom (rows 39-52)
  [7, 2, 1, 5, 39, 52], [8, 6, 6, 9, 39, 52], [9, 10, 10, 13, 39, 52],
  [10, 14, 14, 17, 39, 52], [11, 18, 18, 21, 39, 52], [12, 22, 22, 26, 39, 52],
];

const persons = []; // {id, firstName, gender, parentIds[], spouseIds[]}
const add = (id, firstName, gender) => { const p={id,firstName,gender,parentIds:[],spouseIds:[]}; persons.push(p); return p; };
const link = (childId, parentId) => { persons.find(p=>p.id===childId).parentIds.push(parentId); };
const marry = (a,b)=>{ persons.find(p=>p.id===a).spouseIds.push(b); persons.find(p=>p.id===b).spouseIds.push(a); };

// root couple (Дээдэс) — screenshot-той адил дээд хос
const R_M = add("root_m", "Дээдэс", "male");
const R_F = add("root_f", "Дээдэс", "female");
marry("root_m","root_f");

for (const [num, headColGuess, lo, hi, rLo, rHi] of blocks) {
  // collect name cells in (row,col) order within block
  const names = [];
  for (let r=rLo; r<=rHi; r++){
    const rc = rows[r]; if(!rc) continue;
    for (let c=lo; c<=hi; c++){
      const v = rc[c];
      if (v===undefined) continue;
      if (isNum(v)) continue;           // бүртгэлийн дугаар → алгасна
      names.push({r,c,v:v.trim()});
    }
  }
  if (!names.length) continue;
  const headCol = Math.min(...names.map(n=>n.c));
  const lastAt = {};                    // depth -> personId
  let headId=null, spouseCount=0, idx=0;
  for (const n of names){
    const depth = n.c - headCol;
    const id = `f${num}_${idx++}`;
    if (depth===0){
      if (headId===null){ add(id, n.v, "male"); headId=id; link(id,"root_m"); link(id,"root_f"); lastAt[0]=id; }
      else { add(id, n.v, "female"); marry(headId,id); spouseCount++; } // хань
    } else {
      const parent = lastAt[depth-1] ?? headId;
      add(id, n.v, "male");
      if (parent) link(id, parent);
      lastAt[depth]=id;
      for (const k of Object.keys(lastAt)) if (Number(k)>depth) delete lastAt[k];
    }
  }
}

// ---- autoArrange (lib/autoArrange.ts-ийн хувилбар) ----
const W=140, SPOUSE_GAP=36, SIB_GAP=44, ROOT_GAP=96, ROW=264, TOP=48, LEFT=48;
const byId = new Map(persons.map(p=>[p.id,p]));
const hasParents = p => p.parentIds.some(id=>byId.has(id));
const attachedOf=new Map(), attachedSet=new Set();
for (const p of persons){
  if (attachedSet.has(p.id)||attachedOf.has(p.id)) continue;
  for (const sid of p.spouseIds){ const s=byId.get(sid); if(!s||attachedSet.has(sid))continue; if(!hasParents(s)){attachedOf.set(p.id,sid);attachedSet.add(sid);break;} }
}
const childrenOf=new Map();
for (const p of persons){
  const present=p.parentIds.filter(id=>byId.has(id)); if(!present.length)continue;
  const primary=present.find(id=>!attachedSet.has(id))??present[0];
  (childrenOf.get(primary)??childrenOf.set(primary,[]).get(primary)).push(p.id);
}
const roots=persons.filter(p=>!hasParents(p)&&!attachedSet.has(p.id)).map(p=>p.id);
const memoW=new Map(), computing=new Set();
const coupleWidth=id=>attachedOf.has(id)?W*2+SPOUSE_GAP:W;
function widthOf(id){ const c=memoW.get(id); if(c!==undefined)return c; if(computing.has(id))return coupleWidth(id); computing.add(id); const cw=coupleWidth(id); const kids=childrenOf.get(id)??[]; let w=cw; if(kids.length){const cwid=kids.reduce((s,k)=>s+widthOf(k),0)+(kids.length-1)*SIB_GAP; w=Math.max(cw,cwid);} computing.delete(id); memoW.set(id,w); return w; }
const positions={}, visited=new Set();
function assign(id,leftX,depth){ if(visited.has(id))return; visited.add(id); const w=widthOf(id); const cw=coupleWidth(id); const kids=(childrenOf.get(id)??[]).filter(k=>!visited.has(k)); const y=TOP+depth*ROW; let coupleLeft; if(!kids.length){coupleLeft=leftX+(w-cw)/2;}else{const cwid=kids.reduce((s,k)=>s+widthOf(k),0)+(kids.length-1)*SIB_GAP; let cx=leftX+(w-cwid)/2; const centers=[]; for(const k of kids){const kw=widthOf(k); assign(k,cx,depth+1); centers.push(cx+kw/2); cx+=kw+SIB_GAP;} const center=(centers[0]+centers[centers.length-1])/2; coupleLeft=Math.min(Math.max(center-cw/2,leftX),leftX+w-cw);} positions[id]={x:Math.round(coupleLeft),y}; const sp=attachedOf.get(id); if(sp){positions[sp]={x:Math.round(coupleLeft+W+SPOUSE_GAP),y}; visited.add(sp);} }
let cursor=LEFT; for(const r of roots){assign(r,cursor,0); cursor+=widthOf(r)+ROOT_GAP;}
for(const p of persons){ if(visited.has(p.id))continue; assign(p.id,cursor,0); cursor+=widthOf(p.id)+ROOT_GAP; }

for(const p of persons){ p.position = positions[p.id] ?? {x:0,y:0}; }

console.log("persons:", persons.length, "roots:", roots.length);
// overlap check
let ov=0; for(let i=0;i<persons.length;i++)for(let j=i+1;j<persons.length;j++){const a=persons[i].position,b=persons[j].position; if(Math.abs(a.x-b.x)<W&&Math.abs(a.y-b.y)<158)ov++;}
console.log("overlaps:", ov);

// ---- emit lib/sampleData.ts ----
const esc=s=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"');
const lines = persons.map(p=>{
  const parts=[`id: "${p.id}"`,`firstName: "${esc(p.firstName)}"`,`gender: "${p.gender}"`,`position: { x: ${p.position.x}, y: ${p.position.y} }`];
  if(p.parentIds.length) parts.push(`parentIds: [${p.parentIds.map(i=>`"${i}"`).join(", ")}]`);
  if(p.spouseIds.length) parts.push(`spouseIds: [${p.spouseIds.map(i=>`"${i}"`).join(", ")}]`);
  return "  { "+parts.join(", ")+" },";
}).join("\n");

const out = `// Жинхэнэ ургийн мод — "12 бүртгэл.xlsx"-аас үүсгэсэн seed өгөгдөл.
// Дээд талд "Дээдэс" хос, доор нь 12 өрхийн удам. Нэр/он/хүйс зэргийг Admin-аас засна.
// (Энэ файлыг scripts/gen-seed-from-xlsx.mjs автоматаар үүсгэсэн.)

import type { FamilyTree, Person } from "./types";

type Seed = Omit<Person, "parentIds" | "spouseIds"> & {
  parentIds?: string[];
  spouseIds?: string[];
};

function person(s: Seed): Person {
  return { parentIds: [], spouseIds: [], ...s };
}

const seeds: Seed[] = [
${lines}
];

export function sampleTree(): FamilyTree {
  const persons: Record<string, Person> = {};
  for (const s of seeds) persons[s.id] = person(s);
  return {
    id: "tree_seed_12",
    title: "Гэр бүлийн мод",
    subtitle: "12 өрхийн нэгдсэн ураг",
    persons,
    updatedAt: 0,
  };
}
`;
writeFileSync("lib/sampleData.ts", out);
console.log("wrote lib/sampleData.ts");
