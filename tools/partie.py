# partie réelle (sans robot) : on laisse tourner le jeu en accéléré et on regarde ce qui se passe vraiment
import asyncio,json,sys,time
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking'])
    ctx=await b.new_context(viewport={'width':360,'height':684},has_touch=True,is_mobile=True)
    pg=await ctx.new_page()
    sv=open('/tmp/save.json').read()
    await pg.add_init_script("if(!sessionStorage.getItem('x')){ localStorage.clear(); localStorage.setItem('bv_lite','1'); localStorage.setItem('bistroville_v2',%s); sessionStorage.setItem('x','1'); }"%json.dumps(sv))
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('C:'+m.type+':'+m.text[:240]) if m.type in('error','warning') and 'net::' not in m.text and 'Failed to load' not in m.text and 'GPU stall' not in m.text and 'WebGL' not in m.text and 'swiftshader' not in m.text.lower() else None)
    D=lambda c: pg.evaluate("c=>window.__dbg(c)",c)
    await pg.goto('file:///tmp/dbg.html'); await pg.wait_for_timeout(8000)
    # on ferme les fenêtres comme le ferait un joueur, sans rien neutraliser
    await D("""(()=>{ window.__log=[]; const t0=toast; toast=function(s){ window.__log.push('T '+Math.round(gameHour()*10)/10+'h '+String(s).slice(0,90)); return t0(s); };
      window.__tick=function(){ // le « joueur » : ferme les fenêtres, ramasse ce qui traîne
        const H=Math.round(gameHour()*10)/10+'h ';
        if(scOn){ let g=0; window.__log.push('S '+H+'« '+(scOn.o.title||'')+' »'); while(scOn&&g++<90){ if(scOn.wait==='ask'){ const O=scOn.ask[2]; let i=Math.floor(Math.random()*O.length); if(scCost(O[i][1])>state.coins) i=(i+1)%O.length; window.__log.push('    ? '+scOn.ask[1]+' → '+O[i][0].slice(0,80)); scPick(i); const tg=document.querySelector('.scTag'); if(tg&&tg.textContent) window.__log.push('    ['+[...tg.querySelectorAll('span')].map(x=>x.textContent).join(' | ')+']'); continue; } if(scOn.wait==='me'){ scSign('m'); continue; } if(scOn.typing) scTap(); if(scOn.wait==='card2'){ window.__log.push('    # '+document.querySelector('.scCard b').textContent); } else if(scOn.full&&scOn.who&&scOn._l!==scOn.full){ scOn._l=scOn.full; window.__log.push('    '+scOn.who+': '+scOn.full.slice(0,100)); } scTap(); } if(scOn) window.__log.push('!! scène bloquée '+scOn.wait); }
        else if(ui.panel){ window.__log.push('M '+H+document.querySelector('#mt').textContent); closeModal(); }
        else { const s2=storyStep(); if(s2&&s2.ok){ window.__log.push('* '+H+'étape validée : '+s2.S.g.t); ACT.sstep(); } }
        const r=document.querySelector('#rw'); if(r&&r.className){ r.click(); }
        return 1; }; })()""")
    await D("(()=>{ state.speed=3; })()")
    t0=time.time(); last=''
    while time.time()-t0<int(sys.argv[1]):
      # avance rapide : on fait tourner la logique directement, comme le robot d'équilibrage, mais avec toutes les fenêtres et messages réels
      await D("(()=>{ for(let i=0;i<600;i++){ update(.1); if(i%20===0) window.__tick(); } })()")
      await pg.wait_for_timeout(250)
      st=json.loads(await D("JSON.stringify({h:Math.round(gameHour()*10)/10,day:dayOf().n,night:!!dayOf().night,open:isOpen(),cust:custs.length,coins:state.coins,ch:state.story.ch,step:state.story.step,el:elN(),elB:dayOf().elB||0,lost:dayOf().lost||0,cmd:state.cmd,pdj:state.pdj,fl:state.fl,ax:state.ax,tot:{pdj:state.tot.pdj,cmd:state.tot.cmd,dstars:state.tot.dstars}})"))
      if st['night']:
        await D("(()=>{ window.__tick(); if(state.story) delete state.story.doneDay; const d=dayOf(); window.__log.push('= nuit du jour '+(d.n-1)+' : '+JSON.stringify(d.hist[d.hist.length-1])+' étoiles '+JSON.stringify(state.stars)); setOpen(true); })()")
    print(json.dumps(st)[:700])
    log=json.loads(await D("JSON.stringify(window.__log)"))
    from collections import Counter
    print('messages:',len(log)); 
    for l in log[:int(sys.argv[2]) if len(sys.argv)>2 else 260]: print('  ',l[:230])
    print('errors',errs[:10]); await b.close()
asyncio.run(main())
