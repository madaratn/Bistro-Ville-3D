# Essai du multijoueur à trois joueurs contre le serveur local (server/server.js).
#   python3 tools/mp_test.py /chemin/vers/le_jeu_debug.html [sauvegarde.json]
import asyncio,json,sys,os,subprocess,shutil,time
from playwright.async_api import async_playwright
GAME=sys.argv[1] if len(sys.argv)>1 else '/tmp/dbg.html'; SAVE=sys.argv[2] if len(sys.argv)>2 else '/tmp/aud/save97.json'; PORT=8791; URL='http://127.0.0.1:%d'%PORT
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); OUT=os.environ.get('OUT_DIR','/tmp/aud'); os.makedirs(OUT,exist_ok=True)
if not os.path.exists(GAME) or not os.path.exists(SAVE): sys.exit('usage : python3 '+sys.argv[0]+' jeu_debug.html sauvegarde.json  (la sauvegarde est le contenu de la clé bistroville_v2)')
ok=[]; ko=[]
def check(name,cond,extra=''):
    (ok if cond else ko).append(name); print(('  ok  ' if cond else '  ÉCHEC ')+name+(' : '+str(extra)[:160] if extra!='' else ''))
async def main():
  d='/tmp/mpdata_test'; shutil.rmtree(d,ignore_errors=True)
  srv=subprocess.Popen(['node',os.path.join(ROOT,'server','server.js')],env=dict(os.environ,PORT=str(PORT),DATA=d),stdout=subprocess.PIPE,stderr=subprocess.STDOUT); time.sleep(1.2)
  try:
    async with async_playwright() as p:
      b=await p.chromium.launch(executable_path=CHROME,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking'])
      sv=open(SAVE).read(); P={}; errs=[]
      for name in ['A','B','C']:
        ctx=await b.new_context(viewport={'width':360,'height':684},has_touch=True,is_mobile=True); pg=await ctx.new_page()
        await pg.add_init_script("if(!sessionStorage.getItem('x')){ localStorage.clear(); localStorage.setItem('bv_lite','1'); localStorage.setItem('bv_server',%s); localStorage.setItem('bistroville_v2',%s); sessionStorage.setItem('x','1'); }"%(json.dumps(URL),json.dumps(sv)))
        pg.on('pageerror',lambda e,n=name:errs.append(n+': '+str(e)[:200]))
        await pg.goto('file://'+GAME); P[name]=pg
      await asyncio.sleep(9)
      D=lambda n,c: P[n].evaluate("c=>window.__dbg(c)",c)
      async def until(n,expr,want,t=24):
        r=None
        for k in range(int(t/1.5)):
          r=json.loads(await D(n,"JSON.stringify("+expr+")"))
          if (want(r) if callable(want) else r==want): return r
          await asyncio.sleep(1.5)
        return r
      for n in P:
        await D(n,"(()=>{ rewardShow=function(){}; storyRecap.done=1; state.n96=1; state.n97=1; state.n99=1; BUST.on=false; GFX.on=false; state.speed=0; update=function(){}; let g=0; while(scOn&&g++<80){ if(scOn.wait==='ask'){ scPick(0); continue; } if(scOn.wait==='me'){ scSign('m'); continue; } if(scOn.typing) scTap(); scTap(); } modalQ.length=0; closeModal(); state.me={n:'Joueur"+n+"',g:'m'}; state.name='Bistrot "+n+"'; return 1; })()")
      await asyncio.sleep(4)
      U={}
      for n in P:
        r=await until(n,"{kind:NET.kind,uid:NET.uid,ready:NET.ready,err:NET.err}",lambda r:r['ready'],40); U[n]=r['uid']; check('connexion de '+n+' au serveur',r['kind']=='http',r)
      check('trois identités différentes',len(set(U.values()))==3)
      await D('A',"ACT.vjoin('1')"); await D('B',"ACT.vjoin('1')"); await D('C',"ACT.vjoin('2')"); await asyncio.sleep(3)
      for n in P:
        r=await until(n,"{real:MP.real.length,names:MP.all.filter(p=>!p.npc).map(p=>p.n).sort(),npc:MP.all.filter(p=>p.npc).length}",lambda r:r['real']==3); check(n+' voit les trois bistrots',r['real']==3 and r['names']==['Bistrot A','Bistrot B','Bistrot C'],r)
      # confrérie
      await D('B',"(()=>{ state.coins=5000; MP.form={em:2,col:'#3f7fbf',n:'Les Copains',tag:'cop'}; ACT.gcreate(); return 1; })()")
      r=await until('A',"MP.G.filter(g=>!g.npc).map(g=>[g.n,g.tag])",[['Les Copains','COP']]); check('A voit la confrérie fondée par B',r==[['Les Copains','COP']],r)
      await D('A',"ACT.gjoin('%s')"%U['B'])
      r=await until('B',"mpMembers('%s').map(p=>p.n).sort()"%U['B'],['Bistrot A','Bistrot B']); check('B voit A dans sa confrérie',r==['Bistrot A','Bistrot B'],r)
      # tableau
      await D('B',"(()=>{ ui.panel='ville'; ui.tab='guilde'; renderPanel(); document.querySelector('#gmsg').value='Salut les copains <b>!</b>'; ACT.gsend(); return 1; })()")
      r=await until('A',"mpBoard(mpG()).map(x=>[x.n,x.x])",lambda r:len(r)==1); check('A lit le message de B (balises neutralisées)',len(r)==1 and r[0][0]=='JoueurB' and '<' not in r[0][1],r)
      # entraide
      await D('A',"(()=>{ energyTick(); state.en.v=3; ACT.gask(); return 1; })()")
      r=await until('B',"mpAsks().map(a=>a.p.n)",['Bistrot A']); check('B voit la demande de A',r==['Bistrot A'],r)
      r=await D('B',"(()=>{ const c0=state.coins, p0=state.mp.p||0; ACT.ghelp('%s'); ACT.ghelp('%s'); return [state.coins-c0,(state.mp.p||0)-p0]; })()"%(U['A'],U['A'])); check('aider deux fois de suite ne paie qu’une fois',r==[30,10],r)
      await until('A',"mpHelpers()",1)
      r=json.loads(await D('A',"(()=>{ const n=mpHelpers(); ACT.ggot(); return JSON.stringify({n,en:state.en.v}); })()")); check('A reçoit le coup de main (+2 énergie)',r['n']==1 and r['en']==5,r)
      # points, classements, quartiers
      await D('A',"(()=>{ state.served+=50; mpSync(true); return 1; })()"); await D('B',"(()=>{ state.served+=20; mpSync(true); return 1; })()")
      r=await until('C',"{a:MP.byId.get('%s').p,g:mpGPts('%s'),top:mpDistrict(1,false).map(x=>[MP.gById.get(x[0]).tag,x[1]]).slice(0,3),rk:mpRank().filter(p=>!p.npc).map(p=>p.n)}"%(U['A'],U['B']),lambda r:r['a']==50 and r['g']==80); check('C voit les points de A, de la confrérie et du quartier',r['a']==50 and r['g']==80 and ['COP',80] in r['top'],r)
      # visite et coup de cœur
      na=json.loads(await D('A',"JSON.stringify({n:state.furn.length,size:state.size})"))
      await D('A',"(()=>{ state.furn=state.furn.slice(0,-3); rebuildOcc(); MP.snapT=0; mpSync(true); return state.furn.length; })()"); await asyncio.sleep(2.5)
      await D('C',"ACT.vvisit('%s')"%U['A']); await asyncio.sleep(3.5)
      r=json.loads(await D('C',"JSON.stringify({mode,vis:!!MP.vis,n:state.furn.length,name:state.name,crew:crew.length})")); check('C visite le bistrot de A (son aménagement, pas le sien)',r['mode']=='show' and r['n']==na['n']-3 and r['name']=='Bistrot A',r)
      await P['C'].screenshot(path=os.path.join(OUT,'MP_visit.png'))
      await D('C',"(()=>{ mpLike(MP.vis.id); mpVisExit(); return 1; })()"); await asyncio.sleep(2.5)
      r=json.loads(await D('C',"JSON.stringify({mode,n:state.furn.length,name:state.name,crew:crew.length})")); check('C retrouve son bistrot intact',r['mode']=='play' and r['n']==na['n'] and r['name']=='Bistrot C' and r['crew']>0,r)
      r=await until('B',"mpLikes('%s')"%U['A'],1); check('B voit le coup de cœur donné à A',r==1,r)
      # triche : écrire la fiche d'un autre
      r=await D('A',"NET.drv.set('players/%s',{n:'Pirate',p:99999}).then(()=> 'accepté',e=>'refusé')"%U['B']); check('écrire la fiche d’un autre est refusé',r=='refusé',r)
      r=await D('A',"NET.drv.set('players/'+NET.uid,Object.assign(mpDoc(),{p:999999})).then(()=>NET.drv.get('players/'+NET.uid)).then(d=>d.p)"); check('un bond de points anormal est plafonné par le serveur',r<=950+50,r)
      # exclusion
      await D('A',"mpSync(true)"); await D('B',"ACT.gkick('%s')"%U['A'])
      r=await until('C',"mpMembers('%s').map(p=>p.n)"%U['B'],['Bistrot B']); check('A, exclu, n’est plus compté dans la confrérie',r==['Bistrot B'],r)
      r=await until('A',"[state.mp.g,(state.mp.ms||[]).length,!!mpG()]",['',0,False]); check('A, exclu, n’a plus de confrérie sur sa propre fiche',r==['',0,False],r)
      await D('A',"ACT.gjoin('%s')"%U['B']); r=await D('A',"state.mp.g"); check('A, exclu, ne peut pas revenir',r=='',r)
      await D('A',"ACT.gjoin('npcg1')"); r=await until('C',"(MP.byId.get('%s')||{}).g"%U['A'],'npcg1'); check('A rejoint une autre confrérie',r=='npcg1',r)
      # deux bistrots sur la même place : tout le monde doit voir le même plan, et chacun corrige sa propre fiche
      for n in 'AB': await D(n,"(()=>{ state.mp.d=3; state.mp.sl=7; mpBuild(); mpSync(true); return 1; })()")
      pos="MP.all.filter(p=>!p.npc&&p.d===3).map(p=>[p.id,p.sl]).sort()"
      ra=await until('A',pos,lambda r:len(r)==2 and r[0][1]!=r[1][1]); rb=await until('B',pos,lambda r:r==ra); rc=await until('C',pos,lambda r:r==ra)
      check('même place visée par deux joueurs : un seul plan pour tous',len(ra)==2 and ra[0][1]!=ra[1][1] and ra==rb==rc,[ra,rb,rc])
      r=None
      for k in range(16):
        r=await D('C',"NET.drv.list('players').then(L=>L.filter(p=>p.d===3).map(p=>p.sl).sort())")
        if len(r)==2 and r[0]!=r[1]: break
        await asyncio.sleep(1.5)
      check('les deux fiches enregistrées portent des places différentes',len(r)==2 and r[0]!=r[1],r)
      # quartier complet : on ne s'y installe pas, et le déménagement n'est pas débité
      r=json.loads(await D('C',"(()=>{ const c0=state.coins=5000, d0=state.mp.d; const keep=MP.all; MP.all=keep.concat(Array.from({length:20},(_,i)=>({id:'zz'+i,d:5,sl:i,p:0,g:'',n:'x'}))); mpJoin(5); const r={d:state.mp.d===d0,c:state.coins===c0}; MP.all=keep; return JSON.stringify(r); })()")); check('quartier complet : refus sans débit',r['d'] and r['c'],r)
      # captures
      await D('A',"(()=>{ ui.gq=false; openPanel('ville','carte'); MP.sel=NET.uid; renderPanel(); return 1; })()"); await asyncio.sleep(1.5); await P['A'].screenshot(path=os.path.join(OUT,'MP_A_carte.png'))
      await D('B',"(()=>{ openPanel('ville','guilde'); return 1; })()"); await asyncio.sleep(1.5); await P['B'].screenshot(path=os.path.join(OUT,'MP_B_guilde.png'))
      await D('C',"(()=>{ openPanel('ville','rang'); return 1; })()"); await asyncio.sleep(1.5); await P['C'].screenshot(path=os.path.join(OUT,'MP_C_rang.png'))
      # dissolution : C rejoint, B dissout, C est libéré
      await D('C',"ACT.gjoin('%s')"%U['B']); await until('B',"mpMembers('%s').length"%U['B'],2)
      await D('C',"(()=>{ ui.panel='ville'; ui.tab='guilde'; renderPanel(); document.querySelector('#gmsg').value='Un mot de C'; state.mp.mt=0; ACT.gsend(); return 1; })()")
      await D('B',"(()=>{ ui.gq=true; ACT.gleave(); return 1; })()")
      r=await until('C',"[state.mp.g,(state.mp.ms||[]).length,MP.G.filter(g=>!g.npc).length]",['',0,0]); check('confrérie dissoute : C est libéré, ses messages effacés',r==['',0,0],r)
      # départ
      await D('C',"(()=>{ ui.vq2=true; ACT.vquit(); return 1; })()")
      r=await until('A',"MP.all.filter(p=>!p.npc).map(p=>p.n).sort()",['Bistrot A','Bistrot B']); check('C a quitté la ville : sa fiche a disparu chez les autres',r==['Bistrot A','Bistrot B'],r)
      check('aucune erreur de page',not errs,errs[:3]); await b.close()
  finally:
    srv.terminate()
  print('\n%d réussis, %d échecs'%(len(ok),len(ko))); sys.exit(1 if ko else 0)
asyncio.run(main())
