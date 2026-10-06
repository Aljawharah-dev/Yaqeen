import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
let quranCache;
const norm = s => String(s || '').normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const overlap = (a,b) => { const aa=norm(a).split(' ').filter(x=>x.length>1), bb=norm(b).split(' ').filter(x=>x.length>1); if(!aa.length||!bb.length)return 0; const set=new Set(bb); return aa.filter(x=>set.has(x)).length/Math.max(aa.length,bb.length); };
async function quran(){
 if(quranCache) return quranCache;
 const r=await fetch('https://api.quranpedia.net/v1/mushafs/1',{headers:{'User-Agent':'YaqeenVerify/1.0 (Quran text matching)'}});
 if(!r.ok) throw new Error(`Quranpedia API returned ${r.status}`);
 const data=await r.json(); quranCache=(data.surahs||[]).flatMap(s=>(s.ayahs||[]).map(a=>({text:a.text,surah:s.id,name:s.name,ayah:a.number}))); return quranCache;
}
async function checkQuran(text){
 const rows=await quran(); const query=norm(text); if(query.length<12) return null;
 // Exact normalized matches are authoritative; fuzzy candidates are suggestions only.
 const exact=rows.find(x=>norm(x.text)===query);
 if(exact) return {status:'quran_exact',label:'مطابق لنص المصحف',text:exact.text,reference:`سورة ${exact.name}، الآية ${exact.ayah}`,url:`https://quranpedia.net/surah/${exact.surah}?ayah=${exact.ayah}`,confidence:1};
 let best=null; for(const row of rows){const score=overlap(query,row.text); if(!best||score>best.confidence)best={...row,confidence:score};}
 if(best&&best.confidence>=0.55) return {status:'quran_variant',label:'أقرب آية محتملة — راجع النص',text:best.text,reference:`سورة ${best.name}، الآية ${best.ayah}`,url:`https://quranpedia.net/surah/${best.surah}?ayah=${best.ayah}`,confidence:best.confidence};
 return null;
}
function cleanText(s){return String(s||'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
function parseDorar(data){
 const ah=data?.ahadith; const html=Array.isArray(ah)?ah.map(x=>x?.th||'').join(''):(ah?.result||'');
 const fields=[['narrator','الراوي'],['scholar','المحدث'],['book','المصدر'],['page','الصفحة أو الرقم'],['ruling','خلاصة حكم المحدث']];
 return html.split(/<div[^>]*class=["'][^"']*\bhadith\b[^"']*["'][^>]*>/i).slice(1).map(block=>{
  const pieces=block.split(/<div[^>]*class=["'][^"']*\bhadith-info\b[^"']*["'][^>]*>/i), text=cleanText(pieces.shift()||'').replace(/^\d+\s*-\s*/,''); const info=cleanText(pieces.join(' ')); const row={text};
  fields.forEach(([key,label],i)=>{const stop=fields.slice(i+1).map(([,next])=>next.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');const re=new RegExp(label+'\\s*:\\s*(.*?)(?=\\s*-?\\s*(?:'+stop+' )\\s*:|$)'); const m=info.match(re); row[key]=m?.[1]?.replace(/\s*-$/,'').trim()||''});
  return row;
 }).filter(x=>x.text);
}
function gradeClass(ruling){const t=norm(ruling);if(!t)return'unknown';if(/موضوع|مكذوب|كذب|باطل|لا اصل له|ليس له اصل/.test(t))return'fabricated';if(/ضعيف|منكر|شاذ|واه|معلول|مضطرب|مرسل|منقطع|معضل|لا يصح|لا يثبت|ليس بثابت/.test(t))return'weak';if(/صحيح|حسن|متفق عليه|ثابت|رجاله ثقات/.test(t))return'authentic';return'unknown'}
async function checkHadith(text){
 const query=text.split(/\s+/).filter(Boolean).slice(0,12).join(' '); const url='https://dorar.net/dorar_api.json?skey='+encodeURIComponent(query);
 const r=await fetch(url,{headers:{'User-Agent':'YaqeenVerify/1.0'}}); if(!r.ok) throw new Error(`Dorar API returned ${r.status}`);
 const data=await r.json(); const hits=parseDorar(data); if(!hits.length)return null;
 const rows=hits.map(item=>({item,hadith:item.text,score:overlap(text,item.text)})).sort((a,b)=>b.score-a.score);
 const hit=rows[0]; if(!hit.hadith)return null;
 if(hit.score<0.3)return null;
 const likely=rows.filter(x=>x.score>=Math.max(0.6,hit.score-0.06)); const rulings=[...new Map(likely.filter(x=>x.item.ruling).map(x=>{const key=[x.item.scholar,x.item.ruling,x.item.book,x.item.page].join('|');return[key,`${x.item.scholar||'العالم غير مذكور'}: ${x.item.ruling}${x.item.book?` — ${x.item.book}`:''}${x.item.page?`، ${x.item.page}`:''}`]})).values()];
 const grades=new Set(likely.map(x=>gradeClass(x.item.ruling)).filter(x=>x!=='unknown')); let status='hadith_review',label='يحتاج إلى تحقق';
 if(grades.has('authentic')&&(grades.has('weak')||grades.has('fabricated'))){status='hadith_disputed';label='وردت أحكام مختلفة في المصدر'}
 else if(grades.has('fabricated')||grades.has('weak')){status='hadith_weak';label='وُصف بالضعف في الحكم المنقول'}
 else if(grades.has('authentic')&&hit.score>=0.88){status='hadith_match';label='حديث ثابت بحسب الحكم المنقول'}
 else if(grades.has('authentic')){status='hadith_variant';label='ورد بلفظ مختلف مع حكم بالثبوت'}
 else if(hit.score>=0.88){status='hadith_review';label='مطابق في نتائج الدرر؛ الحكم غير واضح'}
 const reference=rulings.length?rulings.join(' | '):'لم يظهر حكم واضح في تفاصيل النتيجة';
 return {status,label,text:hit.hadith,reference,url:`https://dorar.net/hadith/search?q=${encodeURIComponent(query)}`,confidence:hit.score};
}
async function api(req,res){
 if(req.method!=='POST'||req.url!=='/api/check'){res.writeHead(404);res.end(JSON.stringify({error:'Not found'}));return;}
 let body=''; for await(const chunk of req) body+=chunk; if(body.length>6_000_000){res.writeHead(413);res.end(JSON.stringify({error:'الملف أكبر من الحد المسموح'}));return;}
 try{const input=JSON.parse(body), text=String(input.text||'').trim(); if(!text)throw new Error('اكتب نصًا أو استخرج النص من صورة أولًا');
  let result, quranUnavailable=false, hadithUnavailable=false; try{result=await checkQuran(text)}catch(error){quranUnavailable=true;console.error('Quran source:',error.message)}
  if(!result){try{result=await checkHadith(text)}catch(error){hadithUnavailable=true;console.error('Dorar source:',error.message)}}
  if(!result && (quranUnavailable || hadithUnavailable)){res.writeHead(502,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:'تعذر الوصول لبعض المصادر الآن. لم نعتبر النص غير موجود؛ جرّب بعد قليل.'}));return}
  if(!result) result={status:'not_found',label:'لم نعثر على مصدر مطابق',text:'لم يظهر تطابق موثوق في المصادر المتصلة. هذه النتيجة لا تثبت أن النص غير صحيح.',reference:'مصدر القرآن: Quranpedia — مصدر الحديث: الدرر السنية',url:'https://dorar.net/hadith',confidence:0};
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(result));
 }catch(error){res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:error.message||'تعذر إكمال التحقق'}));}
}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{if(req.url.startsWith('/api/'))return api(req,res);const pathname=decodeURIComponent((req.url||'/').split('?')[0]);const file=pathname==='/'?'index.html':path.basename(pathname);try{const data=await readFile(path.join(root,'public',file));res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(port,()=>console.log(`Yaqeen is running on http://localhost:${port}`));

