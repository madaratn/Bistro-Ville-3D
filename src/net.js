// ===================== RÉSEAU (v0.99) : une seule façon de parler aux autres joueurs, trois façons d'y arriver =====================
// Tout le multijoueur repose sur de petits documents partagés : chacun n'écrit QUE les siens (sa fiche, son bistrot, sa confrérie),
// tout le reste (classements, quartiers, messages, entraide) se déduit en lisant les fiches des autres. Pas de compteur commun,
// donc pas d'écritures qui se marchent dessus, et personne ne peut modifier la fiche d'un autre.
//   claude : la base partagée de la page publiée sur claude.ai (propriétaire, membres, invités).
//   http   : le serveur à héberger soi-même (dossier server/), pour la version web libre et l'application Android.
//   local  : hors ligne. La ville tourne quand même, avec ses voisins fictifs.
/*BV_SERVER*/
const NET={kind:'local',uid:null,ready:false,busy:false,can:true,err:'',drv:null,last:{},pend:{},fly:{},bad:{},hold:0,url:''};
function netServer(){ try{ return (localStorage.getItem('bv_server')||window.BV_SERVER||'').replace(/\/+$/,''); }catch(e){ return ''; } }
function netLocal(){ const K='bv_mp_local'; let D={}; try{ D=JSON.parse(localStorage.getItem(K)||'{}')||{}; }catch(e){} const W=[], sv=()=>{ try{ localStorage.setItem(K,JSON.stringify(D)); }catch(e){} }, fire=c=>{ for(const w of W) if(w.c===c) try{ w.cb(lst(c)); }catch(e){} }, lst=c=>Object.keys(D).filter(p=>p.startsWith(c+'/')&&p.split('/').length===c.split('/').length+1).map(p=>Object.assign({id:p.split('/').pop()},D[p]));
 return {uid:'moi', get:async p=>D[p]||null, set:async(p,o)=>{ D[p]=o; sv(); fire(p.split('/').slice(0,-1).join('/')); }, del:async p=>{ delete D[p]; sv(); fire(p.split('/').slice(0,-1).join('/')); },
  list:async c=>lst(c), watch:(c,cb)=>{ const w={c,cb}; W.push(w); setTimeout(()=>{ try{ cb(lst(c)); }catch(e){} },0); return ()=>{ const i=W.indexOf(w); if(i>=0) W.splice(i,1); }; }, pget:async k=>D['private/'+k]||null, pset:async(k,o)=>{ D['private/'+k]=o; sv(); } }; }
async function netClaude(){ let emb=false; try{ emb=window.parent!==window; }catch(e){ emb=true; }
 if(emb) for(let k=0;k<16&&!(window.claude&&typeof window.claude.use==='function');k++) await new Promise(r=>setTimeout(r,250));
 if(!window.claude||typeof window.claude.use!=='function') return null; let db=null, user=null;
 try{ const r=await Promise.race([Promise.all([window.claude.use('db'),window.claude.use('user')]),new Promise(res=>setTimeout(()=>res([null,null]),11000))]); db=r[0]; user=r[1]; }catch(e){}
 if(!db||!user) return null; const lim=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))]); let uid=NET.lateUid||null, idP=null; if(!uid){ idP=Promise.resolve().then(()=>user.id()); try{ uid=await lim(idP,8000); }catch(e){} }
 if(!uid){ idP.then(u=>{ if(u&&typeof u==='string'&&!NET.lateUid){ NET.lateUid=u; if(NET.kind!=='claude'&&typeof NET.onLate==='function') NET.onLate(); } },()=>{}); return null; }
 let can=true; try{ const c=await lim(user.can('data.write'),4000); if(c===false) can=false; }catch(e){}
 const row=d=>Object.assign({id:d.id},d.data());
 return {uid,can, get:async p=>{ const s=await db.doc(p).get(); return s.exists?s.data():null; }, set:(p,o)=>db.doc(p).set(o), del:p=>db.doc(p).delete(),
  list:async c=>{ const q=await db.collection(c).limit(1000).get(); return q.docs.map(row); },
  watch:(c,cb,er)=>db.collection(c).limit(1000).onSnapshot(q=>{ try{ cb(q.docs.map(row)); }catch(e){ console.warn(e); } },e=>{ if(er) er(e); }),
  pget:async k=>{ const s=await db.doc('data/users/'+uid+'/'+k).get(); return s.exists?s.data():null; }, pset:(k,o)=>db.doc('data/users/'+uid+'/'+k).set(o) }; }
async function netHttp(url){ if(!url) return null; let sec=''; try{ sec=localStorage.getItem('bv_mp_secret')||''; if(!sec){ const a=new Uint8Array(18); crypto.getRandomValues(a); sec=Array.from(a,x=>x.toString(16).padStart(2,'0')).join(''); localStorage.setItem('bv_mp_secret',sec); } }catch(e){ return null; }
 const call=async(m,path,body,tok)=>{ const ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),9000); try{ const r=await fetch(url+path,{method:m,headers:Object.assign({'Content-Type':'application/json'},tok?{Authorization:'Bearer '+tok}:{}),body:body===undefined?undefined:JSON.stringify(body),signal:ctl.signal}); if(!r.ok) throw new Error('http '+r.status); return await r.json(); } finally{ clearTimeout(tm); } };
 let A=null; try{ A=await call('POST','/api/auth',{secret:sec}); }catch(e){ if(/http 503/.test(String(e&&e.message))) NET.full=true; return null; } if(!A||!A.uid||!A.token) return null; const T=A.token, q=encodeURIComponent;
 return {uid:A.uid,can:true, get:async p=>(await call('GET','/api/doc?p='+q(p),undefined,T)).d||null, set:(p,o)=>call('PUT','/api/doc?p='+q(p),o,T), del:p=>call('DELETE','/api/doc?p='+q(p),undefined,T),
  list:async c=>(await call('GET','/api/list?c='+q(c),undefined,T)).docs.map(x=>Object.assign({id:x.id},x.d)),
  watch:(c,cb,er)=>{ let es=null, tm=null, dead=false; const M=new Map(), out=()=>{ try{ cb(Array.from(M,([id,d])=>Object.assign({id},d))); }catch(e){ console.warn(e); } }, poll=async()=>{ if(dead) return; try{ const L=(await call('GET','/api/list?c='+q(c),undefined,T)).docs; M.clear(); for(const x of L) M.set(x.id,x.d); out(); }catch(e){} tm=setTimeout(poll,15000); };
   try{ es=new EventSource(url+'/api/watch?c='+q(c)+'&t='+q(T)); es.addEventListener('init',e=>{ M.clear(); for(const x of JSON.parse(e.data)) M.set(x.id,x.d); out(); }); es.addEventListener('chg',e=>{ const x=JSON.parse(e.data); if(x.d) M.set(x.id,x.d); else M.delete(x.id); out(); }); es.onerror=()=>{ if(es&&es.readyState===2&&!dead&&!tm){ es=null; poll(); } }; }catch(e){ poll(); }
   return ()=>{ dead=true; if(es) es.close(); clearTimeout(tm); }; },
  pget:async k=>(await call('GET','/api/doc?p='+q('private/'+A.uid+'/'+k),undefined,T)).d||null, pset:(k,o)=>call('PUT','/api/doc?p='+q('private/'+A.uid+'/'+k),o,T) }; }
// une seule mise en route, relançable depuis les options (changement d'adresse de serveur)
async function netInit(force){ if(NET.busy) return NET.kind; if(NET.ready&&!force) return NET.kind; NET.busy=true; NET.err=''; let d=null, kind='local';
 try{ d=await netClaude(); if(d) kind='claude'; }catch(e){ console.warn('net',e); }
 if(!d){ const u=netServer(); NET.url=u; NET.full=false; if(u){ try{ d=await netHttp(u); if(d) kind='http'; else NET.err=NET.full?'Cette ville est complète':'Serveur injoignable'; }catch(e){ NET.err='Serveur injoignable'; } } }
 if(!d){ d=netLocal(); kind='local'; }
 NET.drv=d; NET.kind=kind; NET.uid=d.uid; NET.can=d.can!==false; NET.ready=true; NET.busy=false; NET.last={}; NET.pend={}; NET.fly={}; NET.bad={}; NET.hold=0; NET.wrote=false; return kind; }
// écrire un document : seulement s'il a changé, et jamais deux écritures en même temps sur le même.
// key : ce qui compte comme « changé » (par défaut tout le document) ; un refus est rangé selon son code, jamais relancé en boucle.
function netFail(path,e){ const c=(e&&e.code)||'', m=String((e&&e.message)||e||''), h=/^http (\d+)/.exec(m), st=h?+h[1]:0;
 if(c==='invalid_argument'||c==='transform_error'||st===403||st===400||st===413){ if(path.startsWith('players/')&&(c||st===403)){ NET.can=false; if(!NET.wrote&&typeof NET.onDeny==='function') try{ NET.onDeny(); }catch(e2){} } else NET.bad[path]=1; NET.err=NET.can?'Une fiche n’a pas pu être enregistrée.':''; }
 else if(c==='revoked'||c==='not_granted'||c==='capability_disabled'||c==='capability_removed'){ NET.can=false; NET.err='La connexion à la ville s’est interrompue : recharge la page pour la retrouver.'; }
 else if(c==='quota_exceeded'||st===507){ NET.bad[path]=1; NET.err='La ville est pleine : plus de place pour de nouvelles fiches.'; }
 else if(c==='resource_exhausted'||st===429){ NET.hold=Date.now()+18e4; NET.err='La ville reçoit trop de demandes : nouvel essai dans quelques minutes.'; }
 else NET.err=NET.kind==='http'?'Le serveur ne répond pas pour l’instant.':'La ville ne répond pas pour l’instant.'; }
function netPut(path,obj,key){ if(!NET.ready||!NET.can||NET.bad[path]||Date.now()<NET.hold) return; const js=key||JSON.stringify(obj); if(NET.last[path]===js&&!NET.pend[path]) return; if(NET.fly[path]){ NET.pend[path]=[obj,key]; return; }
 NET.fly[path]=true; NET.last[path]=js; Promise.resolve().then(()=>NET.drv.set(path,obj)).then(()=>{ NET.err=''; if(path.startsWith('players/')) NET.wrote=true; },e=>{ NET.last[path]=null; netFail(path,e); })
  .then(()=>{ NET.fly[path]=false; const p=NET.pend[path]; if(p){ delete NET.pend[path]; netPut(path,p[0],p[1]); } }); }
// la sauvegarde privée du joueur : même prudence, sans jamais remonter d'erreur au jeu
function netKeep(k,o){ if(!NET.ready||!NET.can||NET.kind==='local'||NET.bad['@'+k]||Date.now()<NET.hold) return; Promise.resolve().then(()=>NET.drv.pset(k,o)).catch(e=>{ const c=(e&&e.code)||''; if(c==='resource_exhausted') NET.hold=Date.now()+18e4; else if(c!=='unavailable') NET.bad['@'+k]=1; }); }
function netLabel(){ return NET.kind==='claude'?(NET.can?'Ville en ligne (claude.ai)':'Ville en ligne, en simple visite'):NET.kind==='http'?'Ville en ligne (serveur)':'Hors ligne : voisins du jeu'; }
