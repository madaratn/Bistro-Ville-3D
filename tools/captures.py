# Captures d'écran automatiques du jeu à la taille d'un téléphone (voir LISEZ-MOI.md)
import asyncio,json,sys,time,os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
W=int(os.environ.get('VW','360')); H=int(os.environ.get('VH','684')); LITE=os.environ.get('LITE','1'); SAVE=os.environ.get('SAVE','/tmp/save.json'); DSF=float(os.environ.get('DSF','2'))
SHOTS=json.load(open(sys.argv[1])); PREFIX=sys.argv[2]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking'])
    ctx=await b.new_context(viewport={'width':W,'height':H},device_scale_factor=DSF,has_touch=True,is_mobile=True)
    pg=await ctx.new_page()
    sv=open(SAVE).read() if SAVE!='none' else None
    await pg.add_init_script("if(!sessionStorage.getItem('x')){ localStorage.clear(); localStorage.setItem('bv_lite','%s'); %s %s sessionStorage.setItem('x','1'); }"%(LITE, ("localStorage.setItem('bv_title_test','1');" if os.environ.get('TITLE') else '')+("localStorage.setItem('bv_nobake','1');" if os.environ.get('NOBAKE') else ''), ("localStorage.setItem('bistroville_v2',%s);"%json.dumps(sv)) if sv else ''))
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('C:'+m.text[:200]) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    D=lambda c: pg.evaluate("c=>window.__dbg(c)",c)
    await pg.goto('file:///tmp/dbg.html'); await pg.wait_for_timeout(int(os.environ.get('BOOT','7000')))
    if not sv and not os.environ.get('TITLE'):
      await pg.evaluate("(()=>{ const b=document.querySelector('#prSkip'); if(b) b.click(); })()"); await pg.wait_for_timeout(2000)
    names=[]
    for s in SHOTS:
      try:
        if s.get('pjs'):
          r=await pg.evaluate(s['pjs'])
        if s.get('js'):
          r=await D(s['js'])
          if s.get('print'): print(s['name'],'=>',str(r)[:600])
        await pg.wait_for_timeout(s.get('wait',600))
        if s.get('tapvar'):
          xy=await pg.evaluate('window.__p'); await pg.touchscreen.tap(xy[0],xy[1]); await pg.wait_for_timeout(700)
        if s.get('tap'): await pg.touchscreen.tap(*s['tap']); await pg.wait_for_timeout(s.get('wait2',500))
        if s.get('cond') and not str(r).startswith('scroll'): continue
        if s.get('shot',True):
          await pg.screenshot(path=f"/tmp/aud/{PREFIX}_{s['name']}.png"); names.append(s['name'])
        if s.get('after'): await D(s['after']); await pg.wait_for_timeout(200)
      except Exception as e:
        print('ERR',s['name'],str(e)[:300])
    print('errors:',errs[:6])
    await b.close()
    # planches
    per=int(os.environ.get('PER','5')); k=0
    for i in range(0,len(names),per):
      grp=names[i:i+per]; ims=[Image.open(f"/tmp/aud/{PREFIX}_{n}.png") for n in grp]; w,h=ims[0].size
      sheet=Image.new('RGB',(w*len(grp),h+34),'#222'); dr=ImageDraw.Draw(sheet)
      for j,(n,im) in enumerate(zip(grp,ims)): sheet.paste(im,(j*w,34)); dr.text((j*w+10,8),n,fill='#fff')
      sc=min(1,2000/sheet.size[0]); sheet=sheet.resize((int(sheet.size[0]*sc),int(sheet.size[1]*sc)),Image.LANCZOS); sheet.save(f"/tmp/aud/{PREFIX}_sheet{k}.png"); k+=1
    print('sheets',k)
asyncio.run(main())
