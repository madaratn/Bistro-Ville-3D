import asyncio,base64,re
from gen2 import mascot
from playwright.async_api import async_playwright
inner=lambda s: re.sub(r'^<svg[^>]*>|</svg>$','',s.strip())
def icon(uid,round_=True):
    m=inner(mascot(uid,stars=False,thumb=False))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><radialGradient id="bg{uid}" cx=".5" cy=".38" r=".8"><stop offset="0" stop-color="#4a2a1a"/><stop offset="1" stop-color="#160d09"/></radialGradient><linearGradient id="rg{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset=".55" stop-color="#ff8a3d"/><stop offset="1" stop-color="#e5484d"/></linearGradient><clipPath id="cp{uid}"><rect width="512" height="512" rx="{116 if round_ else 0}"/></clipPath></defs>
<g clip-path="url(#cp{uid})"><rect width="512" height="512" fill="url(#bg{uid})"/><circle cx="256" cy="236" r="210" fill="#ff8a3d" opacity=".16"/><g transform="translate(34 62) scale(1.24)">{m}</g></g>
<rect x="9" y="9" width="494" height="494" rx="{108 if round_ else 0}" fill="none" stroke="url(#rg{uid})" stroke-width="{18 if round_ else 0}"/></svg>'''
def logo():
    m=inner(mascot('lg'))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 460"><defs><radialGradient id="lbg" cx=".3" cy=".45" r=".9"><stop offset="0" stop-color="#3a2116"/><stop offset="1" stop-color="#110a07"/></radialGradient><linearGradient id="ltx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d6"/><stop offset="1" stop-color="#ffb347"/></linearGradient></defs>
<rect width="1200" height="460" rx="40" fill="url(#lbg)"/><g transform="translate(40 20)">{m}</g>
<text x="430" y="238" font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif" font-weight="700" font-size="104" letter-spacing="6" fill="url(#ltx)">MADARATN</text>
<text x="436" y="312" font-family="Fredoka, Arial, sans-serif" font-weight="600" font-size="44" letter-spacing="25" fill="#e5484d">PRODUCTION</text><rect x="436" y="340" width="150" height="8" rx="4" fill="#ff8a3d"/></svg>'''
open('icone.svg','w').write(icon('i')); open('logo.svg','w').write(logo())
ex=[('content','Content'),('gourmand','Gourmand'),('surpris','Surpris'),('decu','Déçu')]
sheet='<!doctype html><body style="margin:0;background:radial-gradient(circle at 50% 40%,#2b1a13,#0d0806 75%);display:flex">'+''.join(f'<div style="width:300px;text-align:center;padding:20px 0 14px"><div style="width:260px;margin:auto">{mascot("x"+e,expr=e,slice_=(e in("content","gourmand")),thumb=(e=="content"),stars=(e=="content"))}</div><div style="color:#ffd27a;font:700 24px sans-serif;margin-top:6px">{n}</div></div>' for e,n in ex)
open('expr.html','w').write(sheet)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    async def shot(html,w,h,out,tr=False):
      pg=await b.new_page(viewport={'width':w,'height':h}); await pg.set_content(html); await pg.wait_for_timeout(300); await pg.screenshot(path=out,omit_background=tr); await pg.close()
    wrap=lambda svg,w,h: f'<body style="margin:0;background:transparent"><div style="width:{w}px;height:{h}px">{svg}</div>'
    await shot(wrap(icon('a'),1024,1024),1024,1024,'icone-1024.png',True)
    await shot(wrap(icon('b',False),1024,1024),1024,1024,'icone-carree-1024.png')
    await shot(wrap(icon('c'),192,192),192,192,'icone-192.png',True)
    await shot(wrap(logo(),1200,460),1200,460,'logo-madaratn.png',True)
    await shot(wrap(mascot('t'),720,840),720,840,'mascotte-transparente.png',True)
    await shot(open('expr.html').read(),1200,380,'expressions.png')
    await b.close()
asyncio.run(main())
