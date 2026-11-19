// Chez Odette — serveur multijoueur (v1). Aucune dépendance : Node 18 ou plus suffit.
//   PORT=8787 DATA=./data SECRET=une-longue-phrase node server.js
// Principe : un magasin de petits documents. Chaque joueur n'écrit que les siens (sa fiche, son bistrot, sa confrérie) ;
// tout le monde lit ceux des autres. Les changements partent en direct vers les joueurs connectés (flux d'événements).
'use strict';
const http=require('http'), fs=require('fs'), path=require('path'), crypto=require('crypto');
const PORT=+process.env.PORT||8787, DATA=process.env.DATA||path.join(__dirname,'data'), FILE=path.join(DATA,'db.json');
let SECRET=process.env.SECRET||'';
fs.mkdirSync(DATA,{recursive:true});
if(!SECRET){ const f=path.join(DATA,'secret'); try{ SECRET=fs.readFileSync(f,'utf8'); }catch(e){ SECRET=crypto.randomBytes(32).toString('hex'); fs.writeFileSync(f,SECRET); } }
// ---------- magasin ----------
const SHARED=['players','guilds','bistros'], MAXDOC=96*1024, MAXPLAYERS=+process.env.MAXPLAYERS||120;   // une ville compte 120 emplacements (6 quartiers de 20)
let DB={}; try{ DB=JSON.parse(fs.readFileSync(FILE,'utf8'))||{}; }catch(e){}
let dirty=false; function persist(){ if(!dirty) return; dirty=false; const tmp=FILE+'.tmp'; fs.writeFile(tmp,JSON.stringify(DB),err=>{ if(err) return console.error('écriture',err.message); fs.rename(tmp,FILE,()=>{}); }); }
setInterval(persist,2000);
const listOf=c=>{ const pre=c+'/', out=[]; for(const p in DB) if(p.startsWith(pre)&&p.indexOf('/',pre.length)<0) out.push({id:p.slice(pre.length),d:DB[p]}); return out; };
// ---------- identité : un secret gardé par l'appareil donne toujours le même joueur ----------
const hm=s=>crypto.createHmac('sha256',SECRET).update(s).digest('hex');
const uidOf=secret=>'u'+hm('uid:'+secret).slice(0,18), tokOf=uid=>uid+'.'+hm('tok:'+uid).slice(0,32);
function whoIs(req,url){ const h=req.headers.authorization||'', t=h.startsWith('Bearer ')?h.slice(7):(url.searchParams.get('t')||''), i=t.indexOf('.'); if(i<1) return null; const uid=t.slice(0,i); return tokOf(uid)===t?uid:null; }
// ---------- règles : qui lit, qui écrit ----------
const okPath=p=>typeof p==='string'&&p.length<200&&/^[A-Za-z0-9_.~:@+-]+(\/[A-Za-z0-9_.~:@+-]+)+$/.test(p);
function canRead(uid,p){ const s=p.split('/'); if(SHARED.includes(s[0])&&s.length===2) return true; return s[0]==='private'&&s[1]===uid&&s.length===3; }
function canWrite(uid,p){ const s=p.split('/'); if(SHARED.includes(s[0])&&s.length===2) return s[1]===uid; return s[0]==='private'&&s[1]===uid&&s.length===3; }
// garde-fous : une fiche de joueur reste raisonnable, et les points de la semaine ne s'envolent pas d'un coup
function clean(uid,p,d){ if(!d||typeof d!=='object'||Array.isArray(d)) return null; const s=p.split('/');
 if(s[0]==='players'){ const old=DB[p]; if(typeof d.p!=='number'||!(d.p>=0)) d.p=0; d.p=Math.floor(d.p); if(old&&old.wk===d.wk&&d.p>(old.p||0)+900) d.p=(old.p||0)+900; if(!old&&d.p>900) d.p=900; d.on=Date.now(); }
 return d; }
// ---------- débit : pas plus de 90 écritures par minute et par joueur ----------
const rate=new Map(); function allowed(uid){ const now=Date.now(), r=rate.get(uid)||{t:now,n:0}; if(now-r.t>60000){ r.t=now; r.n=0; } r.n++; rate.set(uid,r); return r.n<=90; }
// ---------- direct : flux d'événements ----------
const subs=new Set(); function push(c,id,d){ const msg='event: chg\ndata: '+JSON.stringify({id,d})+'\n\n'; for(const s of subs) if(s.c===c){ try{ s.res.write(msg); }catch(e){} } }
setInterval(()=>{ for(const s of subs){ try{ s.res.write(': .\n\n'); }catch(e){} } },25000);
// ---------- ménage : les fiches muettes depuis 45 jours disparaissent ----------
setInterval(()=>{ const lim=Date.now()-45*864e5; for(const p in DB){ if(p.startsWith('players/')&&(DB[p].on||0)<lim){ const id=p.slice(8); for(const c of SHARED){ if(DB[c+'/'+id]){ delete DB[c+'/'+id]; push(c,id,null); } } dirty=true; } } },3600e3);
// ---------- service ----------
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, PUT, POST, DELETE, OPTIONS','Access-Control-Max-Age':'86400'};
const send=(res,code,obj)=>{ const b=JSON.stringify(obj); res.writeHead(code,Object.assign({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},CORS)); res.end(b); };
function body(req,max){ return new Promise((ok,ko)=>{ let n=0; const ch=[]; req.on('data',c=>{ n+=c.length; if(n>max){ ko(new Error('trop gros')); req.destroy(); } else ch.push(c); }); req.on('end',()=>{ try{ ok(ch.length?JSON.parse(Buffer.concat(ch).toString('utf8')):null); }catch(e){ ko(e); } }); req.on('error',ko); }); }
const server=http.createServer(async(req,res)=>{ let url; try{ url=new URL(req.url,'http://x'); }catch(e){ return send(res,400,{error:'adresse'}); }
 if(req.method==='OPTIONS'){ res.writeHead(204,CORS); return res.end(); }
 try{
  if(url.pathname==='/'||url.pathname==='/api'){ return send(res,200,{jeu:'Chez Odette',serveur:'multijoueur v1',joueurs:listOf('players').length,confreries:listOf('guilds').length}); }
  if(url.pathname==='/api/auth'&&req.method==='POST'){ const b=await body(req,2048); if(!b||typeof b.secret!=='string'||b.secret.length<16||b.secret.length>128) return send(res,400,{error:'secret'}); const uid=uidOf(b.secret); if(!DB['players/'+uid]&&listOf('players').length>=MAXPLAYERS) return send(res,503,{error:'ville pleine'}); return send(res,200,{uid,token:tokOf(uid)}); }
  const uid=whoIs(req,url); if(!uid) return send(res,401,{error:'identité'});
  if(url.pathname==='/api/doc'){ const p=url.searchParams.get('p'); if(!okPath(p)) return send(res,400,{error:'chemin'});
   if(req.method==='GET'){ return send(res,200,{d:canRead(uid,p)?(DB[p]||null):null}); }
   if(!canWrite(uid,p)) return send(res,403,{error:'ce document n’est pas à toi'}); if(!allowed(uid)) return send(res,429,{error:'doucement'});
   if(req.method==='PUT'){ const d=clean(uid,p,await body(req,MAXDOC)); if(!d) return send(res,400,{error:'document'}); DB[p]=d; dirty=true; const s=p.split('/'); if(SHARED.includes(s[0])) push(s[0],s[1],d); return send(res,200,{ok:true}); }
   if(req.method==='DELETE'){ if(DB[p]){ delete DB[p]; dirty=true; const s=p.split('/'); if(SHARED.includes(s[0])) push(s[0],s[1],null); } return send(res,200,{ok:true}); } }
  if(url.pathname==='/api/list'&&req.method==='GET'){ const c=url.searchParams.get('c'); if(!SHARED.includes(c)) return send(res,400,{error:'collection'}); return send(res,200,{docs:listOf(c)}); }
  if(url.pathname==='/api/watch'&&req.method==='GET'){ const c=url.searchParams.get('c'); if(!SHARED.includes(c)) return send(res,400,{error:'collection'});
   res.writeHead(200,Object.assign({'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store','Connection':'keep-alive','X-Accel-Buffering':'no'},CORS));
   res.write('retry: 5000\n\nevent: init\ndata: '+JSON.stringify(listOf(c))+'\n\n'); const s={c,res}; subs.add(s); req.on('close',()=>subs.delete(s)); return; }
  send(res,404,{error:'inconnu'});
 }catch(e){ try{ send(res,400,{error:String(e&&e.message||e)}); }catch(e2){} } });
server.listen(PORT,()=>console.log('Chez Odette — serveur multijoueur prêt sur le port '+PORT+' ('+listOf('players').length+' joueurs)'));
process.on('SIGTERM',()=>{ dirty=true; try{ fs.writeFileSync(FILE,JSON.stringify(DB)); }catch(e){} process.exit(0); });
process.on('SIGINT',()=>{ try{ fs.writeFileSync(FILE,JSON.stringify(DB)); }catch(e){} process.exit(0); });
