import re,subprocess,os,json
DEBUG=os.environ.get('DEBUG')=='1'
html=open('src/v2_backup.html').read()
a=html.index('<script>'); b=html.rindex('</script>')
head=html[:a]; js=html[a+8:b]; tail=html[b+9:]
def cut(s,start,end):
    i=s.index(start); j=s.index(end); return s[:i]+s[j:]
js=cut(js,'/* ---------------- RENDU','/* ---------------- ENTRÉES')
js=cut(js,'/* ---------------- ENTRÉES','/* ---------------- MODE DÉCO')
i=js.index('function makeThumbs(){'); j=js.index('const PANELS={')
js=js[:i]+js[j:]
def R(old,new):
    global js
    assert old in js, old[:80]; js=js.replace(old,new,1)
R(" if(Math.abs(dx+dy)>.01) a.back=(dx+dy)<0;"," if(Math.abs(dx+dy)>.01) a.back=(dx+dy)<0;\n if(dx||dy){ a.hx=dx; a.hy=dy; }")
R("function faceTo(a,f){ const dx=f.x-a.x, dy=f.y-a.y;","function faceTo(a,f){ const dx=f.x-a.x, dy=f.y-a.y; a.hx=dx; a.hy=dy;")
R("const TW=64, TH=32, WH=66;","")
R("<p class=\"sub center\">Bistro Ville — prototype v0.2</p>","<p class=\"sub center\">Chez Odette — prototype v0.93</p>")
exec(open('src/logic_patch.py').read())
exec(open('src/deco_patch.py').read())
exec(open('src/bar_patch.py').read())
exec(open('src/service_patch.py').read())
exec(open('src/traffic_patch.py').read())
exec(open('src/bin_patch.py').read())
exec(open('src/fix_patch.py').read())
exec(open('src/city_patch.py').read())
exec(open('src/anim_patch.py').read())
exec(open('src/cozy_patch.py').read())
exec(open('src/prio_patch.py').read())
exec(open('src/place_patch.py').read())
exec(open('src/play_patch.py').read())
exec(open('src/warm_patch.py').read())
exec(open('src/food_patch.py').read())
exec(open('src/music_patch.py').read())
exec(open('src/join_patch.py').read())
exec(open('src/diag_patch.py').read())
exec(open('src/squeeze_patch.py').read())
exec(open('src/daily_patch.py').read())
exec(open('src/queue_patch.py').read())
exec(open('src/door_patch.py').read())
exec(open('src/jukebox_patch.py').read())
exec(open('src/story_patch.py').read())
exec(open('src/visit_patch.py').read())
exec(open('src/gourmet_patch.py').read())
exec(open('src/face_patch.py').read())
exec(open('src/order_patch.py').read())
exec(open('src/cam_patch.py').read())
exec(open('src/manage_patch.py').read())
exec(open('src/open_patch.py').read())
exec(open('src/hours_patch.py').read())
exec(open('src/walls_patch.py').read())
exec(open('src/deco2_patch.py').read())
exec(open('src/decor_patch.py').read())
exec(open('src/styles_patch.py').read())
exec(open('src/speed_patch.py').read())
exec(open('src/moments_patch.py').read())
exec(open('src/mastery_patch.py').read())
exec(open('src/ui_patch.py').read())
exec(open('src/show_patch.py').read())
exec(open('src/ing_patch.py').read())
exec(open('src/intro_patch.py').read())
exec(open('src/title_patch.py').read())
exec(open('src/tuto_patch.py').read())
exec(open('src/fridge_patch.py').read())
exec(open('src/kitchen_patch.py').read())
exec(open('src/badge_patch.py').read())
exec(open('src/dayopen_patch.py').read())
exec(open('src/team_patch.py').read())
exec(open('src/events_patch.py').read())
exec(open('src/night_patch.py').read())
exec(open('src/gfx_patch.py').read())
exec(open('src/market_patch.py').read())
exec(open('src/balance_patch.py').read())
exec(open('src/projects_patch.py').read())
exec(open('src/gameplay_patch.py').read())
exec(open('src/fun_patch.py').read())
exec(open('src/souv_patch.py').read())
assert js.rstrip().endswith('boot();')
js=js.rstrip()[:-len('boot();')]
js=js.replace("'use strict';","",1)
r3=open('src/render3d.js').read()
import base64,glob
cd={os.path.basename(f)[:-4]:base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('build/chars2/*.glb'))}
open('build/charsData.js','w').write('export const CHARS_DATA='+json.dumps(cd)+';\n')
main="import * as THREE from 'three';\nimport {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';\nimport {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';\nimport {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';\nimport {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';\nimport {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';\nimport {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';\nimport {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';\nimport {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';\n"+js+"\n"+r3+"\n"+open('src/chars_cozy.js').read()+"\n"+open('src/food.js').read()+"\n"+open('src/gourmet.js').read()+"\n"+open('src/saga.js').read()+"\n"+open('src/city.js').read()+"\n"+open('src/belmont.js').read()+"\n"+open('src/belsim.js').read()+"\n"+open('src/camview.js').read()+"\n"+open('src/cine.js').read()+"\n"+open('src/portraits.js').read()+"\n"+open('src/icons.js').read()+"\n"+open('src/evfx.js').read()+"\n"+open('src/life.js').read()+"\n"+open('src/life2.js').read()+"\n"+open('src/life3.js').read()+"\n"+open('src/life4.js').read()+"\n"+open('src/life5.js').read()+"\n"+open('src/gfx.js').read()+"\nconst splT0=performance.now(); function splashDone(){ const el=document.getElementById('splash'); if(!el) return; const w=navigator.webdriver?0:Math.max(0,3000-(performance.now()-splT0)); const fin=()=>{ el.classList.add('rdy'); setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),800); },w); }; const wait=()=>{ if(thumbsReady||performance.now()-splT0>70000) fin(); else setTimeout(wait,120); }; wait(); }\nrequestAnimationFrame(()=>setTimeout(()=>{ try{ boot(); }finally{ splashDone(); } },navigator.webdriver?0:80));\n"+("window.__dbg=c=>eval(c);\n" if DEBUG else "")
open('build/main.js','w').write(main)
subprocess.run(['npx','esbuild','main.js','--bundle','--format=iife']+([] if DEBUG else ['--minify'])+['--target=es2019','--outfile=bundle.js','--log-level=warning'],cwd='build',check=True)
bundle=open('build/bundle.js').read().replace('</script','<\\/script')
css="""#ov{position:fixed;inset:0;pointer-events:none;z-index:3;overflow:hidden}
.ob{position:absolute;left:0;top:0;will-change:transform;transform-origin:0 0}
.bb{position:absolute;left:-23px;top:-52px;width:46px;height:46px;border-radius:50%;background:conic-gradient(var(--c,#2fae6e) var(--p,100%),#efe6da 0);display:flex;align-items:center;justify-content:center;box-shadow:0 5px 12px rgba(60,30,10,.25)}
.bb::before{content:"";position:absolute;inset:4px;border-radius:50%;background:#fff}
.bb::after{content:"";position:absolute;bottom:-6px;left:50%;margin-left:-6px;border:6px solid transparent;border-top-color:#fff;border-bottom:0}
.bb span{position:relative;font-size:22px;line-height:1}
.ck{position:absolute;left:-19px;top:-40px;width:38px;height:38px;border-radius:50%;background:conic-gradient(#ff7a2f var(--p,0%),#ffe2cc 0);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(60,30,10,.22)}
.ck::before{content:"";position:absolute;inset:4px;border-radius:50%;background:#fff}
.ck span{position:relative;font-size:16px}
.th{position:absolute;left:-17px;top:-44px;width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 10px rgba(60,30,10,.22);animation:thp 1.2s ease-in-out infinite}\n.th::after{content:"";position:absolute;width:8px;height:8px;border-radius:50%;background:#fff;bottom:-9px;left:9px}\n@keyframes thp{50%{transform:translateY(-3px)}}\n.say{position:absolute;left:14px;top:-58px;background:#fff;border-radius:14px 14px 14px 4px;padding:3px 8px;font-size:17px;box-shadow:0 4px 10px rgba(60,30,10,.2);animation:pop .25s cubic-bezier(.2,.9,.3,1.4)}\n#rail{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top) + 56px);display:flex;gap:6px;z-index:4;pointer-events:none;overflow:hidden;align-items:flex-start}
#rail .lb{background:rgba(47,61,53,.9);color:#fff;border-radius:10px;padding:5px 8px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;box-shadow:0 3px 8px rgba(0,0,0,.15)}
.tk{background:#fffdf6;border-radius:10px;padding:3px 6px 4px;box-shadow:0 3px 8px rgba(60,30,10,.18);display:flex;flex-direction:column;align-items:center;min-width:42px;border-top:4px solid var(--c,#bbb);animation:pop .25s}
.tk b{font-size:19px;line-height:1.15}
.tk .st{display:flex;gap:1px;font-size:11px;line-height:1}
.tk .st i{font-style:normal;opacity:.3}
.tk .st i.d{opacity:.85;filter:grayscale(1)}
.tk .st i.c{opacity:1;animation:bob .6s ease-in-out infinite alternate}
.tk.ready{background:#e9f8ee}
.tk.ready .st i{opacity:1}
@keyframes bob{to{transform:translateY(-2px) scale(1.15)}}
.ck .si{position:absolute;right:-7px;bottom:-5px;font-size:14px;font-style:normal;background:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.2)}
.flt{position:absolute;left:0;top:-30px;transform:translateX(-50%);white-space:nowrap;font-weight:600;font-size:16px;text-shadow:0 0 3px #fff,0 0 6px #fff;animation:flt 1.6s ease-out forwards}
.flt.coinp{background:#fff;color:#b26a00;border-radius:99px;padding:3px 10px 3px 5px;display:flex;align-items:center;gap:4px;box-shadow:0 4px 10px rgba(60,30,10,.2);text-shadow:none}
.flt.coinp .coin.sm{width:18px;height:18px;margin:0}
@keyframes flt{0%{transform:translate(-50%,0) scale(.4);opacity:0}14%{transform:translate(-50%,-14px) scale(1.15);opacity:1}28%{transform:translate(-50%,-20px) scale(1)}75%{opacity:1}100%{transform:translate(-50%,-62px);opacity:0}}
</style>"""
assert head.count('<title>Bistro Ville</title>')==1
import base64 as _b64
_ic=_b64.b64encode(open('brand/icone-96.png','rb').read()).decode()
head=head.replace('<title>Bistro Ville</title>','<title>Chez Odette</title><link rel="icon" type="image/png" href="data:image/png;base64,'+_ic+'"><link rel="apple-touch-icon" href="data:image/png;base64,'+_ic+'">')
head=head.replace('</style>',css.replace('</style>','')+open('src/deco.css').read()+open('src/calm.css').read()+open('src/ui2.css').read()+'</style>',1)
old_eb='<div id="editbar" class="hide">\n  <div id="einfo"></div>\n  <div class="erow" id="ebtns"></div>\n</div>'
assert old_eb in head
head=head.replace(old_eb,'<div id="editbar" class="hide">\n  <div id="esel" class="hide"></div>\n  <div id="edock">\n    <button id="ecol" data-e="col" aria-label="Replier le catalogue"><i></i></button>\n    <div id="etabs"></div>\n    <div id="eitems"></div>\n    <div id="efoot"><button class="b alt sm" id="eundo" data-e="undo">↶ Annuler</button><span id="ehint"></span><button class="b green sm" data-e="done">✔ Terminer</button></div>\n  </div>\n</div>')
head=head.replace('<button class="pill round" id="pSet">','<button class="pill round" id="pWatch" aria-label="Regarder le restaurant"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></svg></button>\n  <button class="pill round" id="pSet">',1)
assert 'id="pWatch"' in head
assert head.count('<body>')==1
head=head.replace('<body>','<body>'+open('src/splash.html').read())
assert '<nav id="bottom">' in head
head=head.replace('<nav id="bottom">','<nav id="bottom"><button class="nb" id="bOpen" aria-label="Ouvrir ou fermer le restaurant"><i class="sgn"><b></b></i><span></span></button>')
# barre du bas regroupée : écriteau, carte, équipe, déco, et un bouton « Plus » pour le reste
for nm in ['shop','garden','quiz']:
    m=re.search(r'\s*<button class="nb" data-open="'+nm+r'">.*?</button>',head,flags=re.S); assert m,nm; head=head.replace(m.group(0),'')
assert 'id="bEdit"' in head
head=head.replace('</nav>','<button class="nb" id="bMore" data-open="more"><i class="ic" style="--g1:#ffc96b;--g2:#f0962a;--g3:#b9641a"><svg viewBox="0 0 24 24"><circle cx="5.500" cy="12" r="2.2" fill="#fff" stroke="none"/><circle cx="12" cy="12" r="2.2" fill="#fff" stroke="none"/><circle cx="18.500" cy="12" r="2.2" fill="#fff" stroke="none"/></svg></i>Plus<i class="dot hide" id="gDot">!</i><i class="dot hide" id="qDot">!</i></button></nav>',1)
head=head.replace('<div id="spacer"></div>','')

head=head.replace('<canvas id="c"></canvas>','<canvas id="c"></canvas>\n<div id="ov"></div>\n<div id="rail"></div>\n<div id="whint" class="off">Touche l\'écran pour revenir</div>',1).replace('<title>Bistro Ville</title>','<title>Bistro Ville 3D</title>')
open(os.environ.get('OUT','www/index.html'),'w').write(head+'<script>\n'+bundle+'\n</script>'+tail)
print('ok',len(head)+len(bundle))
