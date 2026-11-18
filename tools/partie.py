# partie réelle (sans robot) : on laisse tourner le jeu en accéléré et on regarde ce qui se passe vraiment
import asyncio,json,sys,time
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking'])
    ctx=await b.new_context(viewport={'width':360,'height':684},has_touch=True,is_mobile=True)
    pg=await ctx.new_page()
    sv=open('/tmp/aud/save14.json').read()
    await pg.add_init_script("if(!sessionStorage.getItem('x')){ localStorage.clear(); localStorage.setItem('bv_lite','1'); localStorage.setItem('bistroville_v2',%s); sessionStorage.setItem('x','1'); }"%json.dumps(sv))
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('C:'+m.type+':'+m.text[:240]) if m.type in('error','warning') and 'net::' not in m.text and 'Failed to load' not in m.text and 'GPU stall' not in m.text and 'WebGL' not in m.text and 'swiftshader' not in m.text.lower() else None)
    D=lambda c: pg.evaluate("c=>window.__dbg(c)",c)
    await pg.goto('file:///tmp/dbg.html'); await pg.wait_for_timeout(8000)
    # on ferme les fenêtres comme le ferait un joueur, sans rien neutraliser
    await D("""(()=>{ window.__log=[]; const t0=toast; toast=function(s){ window.__log.push('T '+Math.round(gameHour()*10)/10+'h '+String(s).slice(0,90)); return t0(s); };
      window.__tick=function(){ // le « joueur » : ferme les fenêtres, ramasse ce qui traîne
        if(ui.panel){ window.__log.push('M '+Math.round(gameHour()*10)/10+'h '+document.querySelector('#mt').textContent); if(ui.panel==='custom'&&typeof dlg!=='undefined'&&dlg){ ACT.snext(); } else closeModal(); }
        const r=document.querySelector('#rw'); if(r&&r.className){ r.click(); }
        return 1; }; })()""")
    await D("(()=>{ state.speed=3; })()")
    t0=time.time(); last=''
    while time.time()-t0<int(sys.argv[1]):
      # avance rapide : on fait tourner la logique directement, comme le robot d'équilibrage, mais avec toutes les fenêtres et messages réels
      await D("(()=>{ for(let i=0;i<600;i++){ update(.1); if(i%20===0) window.__tick(); } })()")
      await pg.wait_for_timeout(250)
      st=json.loads(await D("JSON.stringify({h:Math.round(gameHour()*10)/10,day:dayOf().n,night:!!dayOf().night,open:isOpen(),dx:state.dxd,nb:state.nb&&state.nb.done,nbv:state.nb&&state.nb.v,cust:custs.length,ev:dayOf().ev||0,coins:state.coins})"))
      if st['night']:
        await D("(()=>{ window.__tick(); setOpen(true); })()")
    print(json.dumps(st)[:700])
    log=json.loads(await D("JSON.stringify(window.__log)"))
    from collections import Counter
    print('messages:',len(log)); 
    for l in log[:140]: print('  ',l)
    print('errors',errs[:10]); await b.close()
asyncio.run(main())
