import asyncio,json,sys,time
from playwright.async_api import async_playwright
DAYS=int(sys.argv[1]) if len(sys.argv)>1 else 3; CFG=sys.argv[2] if len(sys.argv)>2 else '{}'; OUT=sys.argv[3] if len(sys.argv)>3 else '/tmp/sim/out.json'; HTML=sys.argv[4] if len(sys.argv)>4 else '/tmp/dbg.html'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking'])
    pg=await b.new_page(viewport={'width':300,'height':300})
    await pg.add_init_script("if(!sessionStorage.getItem('x')){ localStorage.clear(); localStorage.setItem('bv_lite','1'); sessionStorage.setItem('x','1'); }")
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    D=lambda c: pg.evaluate("c=>window.__dbg(c)",c)
    await pg.goto('file://'+HTML); await pg.wait_for_timeout(7000)
    await pg.evaluate("(()=>{ const b=document.querySelector('#prSkip'); if(b) b.click(); })()"); await pg.wait_for_timeout(2000)
    await D(open('/tmp/sim/bot.js').read()+";0")
    await D("(()=>{ state.tuto=true; const t=document.querySelector('#tut'); if(t) t.remove(); state.sound=false; state.music=false; rewardShow=function(){}; toast=function(){}; say=function(l,t,a){ if(a) try{a();}catch(e){} }; render=function(){}; Object.assign(BOT.cfg,"+CFG+"); if(!state.story) state.story={v:2,ch:0,step:0,seen:-1,base:{},pages:0,started:1}; try{storySnap();}catch(e){} modalQ.length=0; closeModal(); })()")
    t0=time.time(); n=0
    while n<DAYS and time.time()-t0<int(sys.argv[5]) if len(sys.argv)>5 else n<DAYS:
      n=await D("botRun(3000)")
    print('PANELS', await D("(()=>{ const bad=[]; for(const p of Object.keys(PANELS)){ try{ ui.stall='l'; openPanel(p); }catch(e){ bad.push(p+': '+String(e).slice(0,120)); } } closeModal(); try{ openStall('a'); openStall('z'); openStall('y'); ACT.debtpay(); closeModal(); }catch(e){ bad.push('stall '+e); } return JSON.stringify({n:Object.keys(PANELS).length,bad,debt:state.debt,merr:BOT.merr||[]}); })()"))
    log=json.loads(await D("JSON.stringify(BOT.log)")); json.dump(log,open(OUT,'w'))
    print('days',len(log),'time',round(time.time()-t0),'err',errs[:2], await D("BOT.err||''"))
    print('n   rev  cost    net  coins lvl rat sat seat staff             S mn  occ  kq   wq  ml eq  ch.st serv tips   debt')
    for r in log: print(f"{r['n']:2d} {r['rev']:5d} {r['cost']:5d} {r['net']:6d} {r['coins']:6d} {r['lvl']:3d} {r['rating']:.1f} {r['sat']:3d} {r['seats']:4d} {r['staff']:17s} {r['S']:2d} {r['menu']:2d} {r['occ']:.2f} {r['kq']:4.1f} {r['wq']:.2f} {r['ml']:.1f} {r['eq']} {r['ch']:2d}.{r['st']} {r['served']:4d} {r['tips']:4d} {r.get('debt',0):6d}")
    print('NEW:', await D("JSON.stringify({nb:state.nb&&state.nb.v,pages:state.story&&state.story.pages,dresser:state.furn.some(f=>f.t==='odette'),souvTip:souvTip(),carnet:carnetMul(),fr:state.fr,proj:state.proj})"))
    await b.close()
asyncio.run(main())
