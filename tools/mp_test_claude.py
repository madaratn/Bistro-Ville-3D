# Essai du pilote « claude.ai » : une imitation de la base partagée de la page (mêmes fonctions, documents gelés,
# refus d'écrire chez les autres), branchée sur le serveur local pour que deux joueurs se voient vraiment.
import asyncio,json,sys,os,subprocess,shutil,time
from playwright.async_api import async_playwright
GAME=sys.argv[1] if len(sys.argv)>1 else '/tmp/dbg.html'; SAVE=sys.argv[2] if len(sys.argv)>2 else '/tmp/aud/save97.json'; PORT=8792; URL='http://127.0.0.1:%d'%PORT
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); OUT=os.environ.get('OUT_DIR','/tmp/aud'); os.makedirs(OUT,exist_ok=True)
if not os.path.exists(GAME) or not os.path.exists(SAVE): sys.exit('usage : python3 '+sys.argv[0]+' jeu_debug.html sauvegarde.json  (la sauvegarde est le contenu de la clé bistroville_v2)')
MOCK=r'''
(()=>{ const URL0=%s, SEC=%s; let A=null; const auth=async()=>A||(A=await (await fetch(URL0+'/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:SEC})})).json());
 const deep=o=>{ if(o&&typeof o==='object'){ Object.values(o).forEach(deep); Object.freeze(o); } return o; };
 const call=async(m,p,b)=>{ const a=await auth(), r=await fetch(URL0+p,{method:m,headers:{'Content-Type':'application/json',Authorization:'Bearer '+a.token},body:b===undefined?undefined:JSON.stringify(b)}); if(!r.ok) throw {code:'invalid_argument',message:'refusé '+r.status}; return r.json(); };
 const map=p=>{ const s=p.split('/'); return s[0]==='data'&&s[1]==='users'?'private/'+s.slice(2).join('/'):p; };
 const even=p=>{ if(p.split('/').length%%2) throw new TypeError('chemin de document impair : '+p); }, odd=p=>{ if(p.split('/').length%%2===0) throw new TypeError('chemin de collection pair : '+p); };
 const snap=(id,d)=>deep({id,exists:!!d,data:()=>d||undefined,metadata:{fromCache:false,hasPendingWrites:false}});
 const doc=p=>{ even(p); return {id:p.split('/').pop(),path:p, get:async()=>snap(p.split('/').pop(),deep((await call('GET','/api/doc?p='+encodeURIComponent(map(p)))).d)), set:async d=>{ if(!d||typeof d!=='object'||Array.isArray(d)) throw {code:'invalid_argument',message:'corps'}; await call('PUT','/api/doc?p='+encodeURIComponent(map(p)),d); }, delete:async()=>{ await call('DELETE','/api/doc?p='+encodeURIComponent(map(p))); } }; };
 const coll=(c,lim)=>{ odd(c); const read=async()=>{ const L=(await call('GET','/api/list?c='+encodeURIComponent(c))).docs.slice(0,lim||1000); const docs=L.map(x=>snap(x.id,deep(x.d))); return deep({docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:false,hasPendingWrites:false}}); };
  return {path:c, limit:n=>coll(c,n), get:read, doc:id=>doc(c+'/'+id), onSnapshot:(next,err)=>{ let dead=false, last=''; const tick=async()=>{ if(dead) return; try{ const q=await read(), k=JSON.stringify(q.docs.map(d=>[d.id,d.data()])); if(k!==last){ last=k; next(q); } }catch(e){ if(err) err(e); dead=true; return; } setTimeout(tick,700); }; tick(); return ()=>{ dead=true; }; } }; };
 const DB=Object.freeze({doc,collection:c=>coll(c)}), USER=Object.freeze({id:async()=>(await auth()).uid, can:async n=>true, isOwner:()=>false, canEdit:()=>false});
 window.claude=Object.freeze({use:async n=>{ await new Promise(r=>setTimeout(r,400)); return n==='db'?DB:n==='user'?USER:null; }}); })();
'''
ok=[]; ko=[]
def check(name,cond,extra=''):
    (ok if cond else ko).append(name); print(('  ok  ' if cond else '  ÉCHEC ')+name+(' : '+str(extra)[:170] if extra!='' else ''))
async def main():
  d='/tmp/mpdata_test2'; shutil.rmtree(d,ignore_errors=True)
  srv=subprocess.Popen(['node',os.path.join(ROOT,'server','server.js')],env=dict(os.environ,PORT=str(PORT),DATA=d),stdout=subprocess.PIPE,stderr=subprocess.STDOUT); time.sleep(1.2)
  try:
    async with async_playwright() as p:
      b=await p.chromium.launch(executable_path=CHROME,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking'])
      sv=open(SAVE).read(); P={}; errs=[]
      for name in ['A','B']:
        ctx=await b.new_context(viewport={'width':360,'height':684},has_touch=True,is_mobile=True); pg=await ctx.new_page()
        await pg.add_init_script(MOCK%(json.dumps(URL),json.dumps('secret-de-test-pour-'+name+'-0123456789')))
        await pg.add_init_script("if(!sessionStorage.getItem('x')){ localStorage.clear(); localStorage.setItem('bv_lite','1'); localStorage.setItem('bistroville_v2',%s); sessionStorage.setItem('x','1'); }"%json.dumps(sv))
        pg.on('pageerror',lambda e,n=name:errs.append(n+': '+str(e)[:200])); pg.on('console',lambda m,n=name: errs.append(n+' C:'+m.text[:160]) if m.type=='error' and 'net::' not in m.text and '403' not in m.text else None)
        await pg.goto('file://'+GAME); P[name]=pg
      await asyncio.sleep(9)
      D=lambda n,c: P[n].evaluate("c=>window.__dbg(c)",c)
      async def until(n,expr,want,t=20):
        r=None
        for k in range(int(t/1.5)):
          r=json.loads(await D(n,"JSON.stringify("+expr+")"))
          if r==want: return r
          await asyncio.sleep(1.5)
        return r
      for n in P:
        await D(n,"(()=>{ rewardShow=function(){}; storyRecap.done=1; state.n96=1; state.n97=1; state.n99=1; BUST.on=false; GFX.on=false; state.speed=0; update=function(){}; let g=0; while(scOn&&g++<80){ if(scOn.wait==='ask'){ scPick(0); continue; } if(scOn.wait==='me'){ scSign('m'); continue; } if(scOn.typing) scTap(); scTap(); } modalQ.length=0; closeModal(); state.me={n:'Joueur"+n+"',g:'m'}; state.name='Bistrot "+n+"'; return 1; })()")
      await asyncio.sleep(4); U={}
      for k in range(12):
        st=[json.loads(await D(n,"JSON.stringify({r:NET.ready,b:NET.busy,k:NET.kind,s:MP.started})")) for n in P]
        if all(x['r'] for x in st): break
        print('   attente',st); await asyncio.sleep(2)
      for n in P:
        r=json.loads(await D(n,"JSON.stringify({kind:NET.kind,uid:NET.uid,can:NET.can,label:netLabel()})")); U[n]=r['uid']; check(n+' utilise le pilote claude.ai',r['kind']=='claude' and r['can'],r)
      await D('A',"ACT.vjoin('3')"); await D('B',"ACT.vjoin('3')"); await asyncio.sleep(3)
      for n in P:
        r=await until(n,"MP.all.filter(p=>!p.npc).map(p=>p.n).sort()",['Bistrot A','Bistrot B']); check(n+' voit les deux bistrots',r==['Bistrot A','Bistrot B'],r)
      await D('A',"(()=>{ state.coins=5000; MP.form={em:6,col:'#d4a53a',n:'Les Couronnes',tag:'ROI'}; ACT.gcreate(); return 1; })()"); await asyncio.sleep(2.5)
      await until('B',"MP.G.filter(g=>!g.npc).length",1); await D('B',"ACT.gjoin('%s')"%U['A']); await asyncio.sleep(2.5)
      await D('B',"(()=>{ ui.panel='ville'; ui.tab='guilde'; renderPanel(); document.querySelector('#gmsg').value='Présent !'; ACT.gsend(); state.served+=33; mpSync(true); return 1; })()"); await asyncio.sleep(3)
      r=await until('A',"{m:mpMembers(NET.uid).map(p=>[p.n,p.p]),b:mpBoard(mpG()).map(x=>x.x),g:mpGPts(NET.uid)}",{'m':[['Bistrot B',33],['Bistrot A',0]],'b':['Présent !'],'g':33}); check('A voit B, son message et ses points (documents gelés lus sans les modifier)',r['m']==[['Bistrot B',33],['Bistrot A',0]] and r['b']==['Présent !'] and r['g']==33,r)
      r=await D('B',"NET.drv.set('players/%s',{n:'Pirate'}).then(()=>'accepté',e=>e.code)"%U['A']); check('écrire la fiche d’un autre est refusé',r=='invalid_argument',r)
      r=await D('A',"(()=>{ MP.cloudT=0; MP.cloudH=''; mpSync(true); return new Promise(res=>setTimeout(()=>NET.drv.pget('save').then(c=>res(c?c.lv:null)),1500)); })()"); check('la partie de A est sauvegardée dans son espace privé',r==10,r)
      r=await D('B',"NET.drv.get('data/users/%s/save').then(d=>d?'lisible':'invisible',e=>'invisible')"%U['A']); check('B ne peut pas lire la sauvegarde de A',r=='invisible',r)
      await D('A',"(()=>{ openPanel('ville','guilde'); return 1; })()"); await asyncio.sleep(1.5); await P['A'].screenshot(path=os.path.join(OUT,'MPC_A.png'))
      check('aucune erreur de page',not errs,errs[:3]); await b.close()
  finally:
    srv.terminate()
  print('\n%d réussis, %d échecs'%(len(ok),len(ko))); sys.exit(1 if ko else 0)
asyncio.run(main())
