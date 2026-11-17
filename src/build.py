import base64,re
src=open('src/v1_backup.html').read()
ui=open('src/ui.html').read()
render=open('src/render.js').read()
fonts=''
for w in (500,600,700):
    b=base64.b64encode(open(f'/tmp/font/package/files/fredoka-latin-{w}-normal.woff2','rb').read()).decode()
    fonts+=f"@font-face{{font-family:Fredoka;font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{b}) format('woff2')}}\n"
ui=ui.replace('/*FONTS*/',fonts)
# head/UI
a=src.index('<style>'); b=src.index('<script>')
s=src[:a]+ui+src[b:]
def R(old,new,count=1):
    global s
    assert old in s, old[:70]
    s=s.replace(old,new) if count==0 else s.replace(old,new,count)
# rendu
a=s.index('/* ---------------- RENDU'); b=s.index('/* ---------------- ENTRÉES')
s=s[:a]+render+'\n'+s[b:]
# données
a=s.index('const FLOORS=['); b=s.index('const EXP=')
s=s[:a]+"""const FLOORS=[
 {n:'Damier crème',a:'#f6e9d0',b:'#ecd9b8',pat:'checker',p:0,d:0,u:1},
 {n:'Parquet chêne',a:'#d6a26c',b:'#c8935e',pat:'plank',p:250,d:2,u:2},
 {n:'Carreaux bleus',a:'#e3f0fa',b:'#c3dbf0',pat:'tile',p:500,d:3,u:3},
 {n:'Damier rétro',a:'#fafaf6',b:'#3d4350',pat:'checker',p:800,d:5,u:5},
 {n:'Marbre rose',a:'#f8e4e9',b:'#ecc9d2',pat:'tile',p:1500,d:7,u:8},
];
const WALLS=[
 {n:'Crème',c:'#f8ecd6',w:'#e0c49b',p:0,d:0,u:1},
 {n:'Rayures menthe',c:'#d3f0e3',s:'#bde6d4',w:'#86c9ad',p:300,d:2,u:2},
 {n:'Brique',c:'#cc6a4f',brick:1,w:'#7e3a29',p:600,d:4,u:4},
 {n:'Bleu nuit',c:'#3a4c78',w:'#26345a',p:900,d:5,u:6},
 {n:'Rose bonbon',c:'#fadbe6',s:'#f5c6d8',w:'#e59bba',p:1200,d:6,u:8},
];
"""+s[b:]
R("table4:{n:'Table marbre',cat:'Tables',p:380,d:5,u:6,kind:'table',col:'#8a8f98',cloth:'#eef1f5'}","table4:{n:'Table marbre',cat:'Tables',p:380,d:5,u:6,kind:'table',col:'#6f747c',cloth:'#eef1f5',marble:1}")
R("chair4:{n:'Fauteuil velours',cat:'Chaises',p:180,d:2.5,u:7,kind:'chair',col:'#6c4bd1'}","chair4:{n:'Fauteuil velours',cat:'Chaises',p:180,d:2.5,u:7,kind:'chair',col:'#7a5ae0',big:1}")
R("table3:{n:'Table nappe bleue',cat:'Tables',p:220,d:3,u:3,kind:'table',col:'#7a5a3a',cloth:'#4f8ff7'}","table3:{n:'Table nappe bleue',cat:'Tables',p:220,d:3,u:3,kind:'table',col:'#7a5a3a',cloth:'#5b9cf5'}")
R("lastSave:Date.now(),tuto:false,sound:true};","lastSave:Date.now(),tuto:false,sound:true,daynight:true};")
R("return {id:state.nid++,name,role,xp:0,skin:pick(SKINS),hair:pick(HAIRS),body:pick(BODIES)};","return {id:state.nid++,name,role,xp:0,skin:pick(SKINS),hair:pick(HAIRS),body:pick(BODIES),hs:ri(0,3)};")
R("function randLook(){return {skin:pick(SKINS),hair:pick(HAIRS),body:pick(BODIES),long:Math.random()<.45};}",
  "const PANTS=['#3b4a6b','#5a4632','#2f2f3a','#6b5b95','#7a8a99','#2e5d4b'];\nfunction randLook(){return {skin:pick(SKINS),hair:pick(HAIRS),body:pick(BODIES),pants:pick(PANTS),hs:ri(0,3),gl:Math.random()<.15,hat:Math.random()<.12?pick(['#e5484d','#3a3f4b','#f7b84f','#4f8ff7']):null};}")
R("look:{skin:s.skin,hair:s.hair,body:s.body}","look:{skin:s.skin,hair:s.hair,body:s.body,hs:s.hs??(s.id%4)}")
R(" if(Math.abs(dx-dy)>.01) a.dir=(dx-dy)>0?1:-1;"," if(Math.abs(dx-dy)>.01) a.dir=(dx-dy)>0?1:-1;\n if(Math.abs(dx+dy)>.01) a.back=(dx+dy)<0;")
R("function faceTo(a,f){ a.dir=((f.x-a.x)-(f.y-a.y))>=0?1:-1; }","function faceTo(a,f){ const dx=f.x-a.x, dy=f.y-a.y; if(dx-dy) a.dir=(dx-dy)>0?1:-1; a.back=(dx+dy)<0; }")
R(" if(c.table) c.dir=((c.table.x-c.x)-(c.table.y-c.y))>=0?1:-1;"," if(c.table) faceTo(c,c.table);")
R(" addSat(0); floatAt(c.fx,c.fy,'😠','#e5484d'); leave(c);"," addSat(0); c.mood='angry'; floatAt(c.fx,c.fy,'😠','#e5484d'); leave(c);")
R(" floatAt(c.fx,c.fy,'+'+(price+tip)+' 🪙','#d68a00');"," floatAt(c.fx,c.fy,'+'+(price+tip),null,true); sparkle(c.fx,c.fy,6); c.mood='happy';")
R(" c.order=null; leave(c);\n}"," c.order=null; leave(c); c.back=false;\n}")
R("floatAt(x,y,'-'+F.p+' 🪙','#e5484d');","floatAt(x,y,'-'+F.p,null,true); sparkle(x,y,8,'#ffffff');")
R(" for(const f of floaters) f.t-=dt; floaters=floaters.filter(f=>f.t>0);\n render();"," updFx(dt);\n render();")
# UI : pièces, icônes, héros
s=s.replace('class="lvlup stars"','class="hero stars"').replace('class="lvlup"','class="hero"')
R("const ingTag=","const ICONS={shop:'<path d=\"M5 8h14l-1.2 12H6.2z\"/><path d=\"M9 10V7a3 3 0 0 1 6 0v3\"/>',menu:'<path d=\"M4 5.5c3-1.2 5.5-1 8 1 2.5-2 5-2.2 8-1V19c-3-1-5.5-.8-8 1-2.5-1.8-5-2-8-1z\"/><path d=\"M12 6.5V20\"/>',garden:'<path d=\"M12 21v-8\"/><path d=\"M12 13c0-4.5 3-7 7.5-7 0 4.5-3 7-7.5 7z\"/><path d=\"M12 15c0-3.5-2.4-6-6.5-6 0 3.5 2.4 6 6.5 6z\"/>',team:'<circle cx=\"9\" cy=\"8\" r=\"3.2\"/><path d=\"M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6\"/><circle cx=\"17\" cy=\"9\" r=\"2.6\"/><path d=\"M16.5 14.2c2.8.2 4.5 2.2 4.5 5\"/>',quiz:'<path d=\"M9 18h6M10 21h4\"/><path d=\"M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z\"/>',edit:'<rect x=\"3.5\" y=\"3\" width=\"14\" height=\"6\" rx=\"2\"/><path d=\"M17.5 6h2.5v5.5h-8V14\"/><rect x=\"10.5\" y=\"14\" width=\"3\" height=\"7\" rx=\"1.2\"/>',gear:'<circle cx=\"12\" cy=\"12\" r=\"3.2\"/><path d=\"M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1\"/>',star:'<path d=\"M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z\"/>'};\nconst svg=k=>'<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke-width=\"2.1\" stroke-linecap=\"round\" stroke-linejoin=\"round\">'+ICONS[k]+'</svg>';\nconst PICON={shop:['shop','#ffad4d','#ff7a2f','#d4561c'],menu:['menu','#ff7d8a','#ef4f5f','#b8323f'],garden:['garden','#6fdc8c','#2fae6e','#1c7d4a'],staff:['team','#6db7ff','#3a82f0','#2559b8'],quiz:['quiz','#b59cff','#7b5cf0','#5537c4'],rating:['star','#ffd04d','#ffa200','#c97a00'],settings:['gear','#a9b4c4','#7a8699','#566173'],custom:['star','#ffd04d','#ffa200','#c97a00']};\nconst coinify=h=>h.replace(/ ?🪙/g,'<i class=\"coin sm\"></i>');\nconst ingTag=")
R(" $('#mt').textContent=r.title;"," $('#mt').textContent=r.title.replace(/^[^A-Za-zÀ-ÿ0-9]+\\s/,''); const pi=PICON[ui.panel]||PICON.custom, mi=$('#mi'); mi.innerHTML=svg(pi[0]); mi.style.cssText=`--g1:${pi[1]};--g2:${pi[2]};--g3:${pi[3]}`;")
R(" mc.innerHTML=r.html; mc.scrollTop=st;"," mc.innerHTML=coinify(r.html); mc.scrollTop=st;")
R(" $('#einfo').innerHTML=info; $('#ebtns').innerHTML=btns;"," $('#einfo').innerHTML=coinify(info); $('#ebtns').innerHTML=coinify(btns);")
R("function toast(s){ const t=$('#toast'); t.textContent=s; t.style.opacity=1; clearTimeout(toastT); toastT=setTimeout(()=>t.style.opacity=0,2200); }",
  "function toast(s){ const t=$('#toast'); t.innerHTML=coinify(String(s).replace(/</g,'&lt;')); t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),2200); }")
R("<img src=\"${thumbs[k]}\" alt=\"\">","<div class=\"pv\"><img src=\"${thumbs[k]}\" alt=\"\"></div>")
R("<div style=\"width:60px;height:40px;border-radius:8px;background:repeating-conic-gradient(${f.a} 0 25%,${f.b} 0 50%) 0 0/20px 20px\"></div>","<div class=\"sw\" style=\"background:repeating-conic-gradient(${f.a} 0 25%,${f.b} 0 50%) 0 0/24px 24px\"></div>")
R("<div style=\"width:60px;height:40px;border-radius:8px;background:${f.s?`repeating-linear-gradient(90deg,${f.c} 0 8px,${f.s} 8px 12px)`:f.c}\"></div>","<div class=\"sw\" style=\"background:linear-gradient(transparent 68%,${f.w} 68%),${f.s?`repeating-linear-gradient(90deg,${f.c} 0 10px,${f.s} 10px 16px)`:f.c}\"></div>")
R(" for(const k in FURN){ t.setTransform(1,0,0,1,0,0); t.clearRect(0,0,140,140); t.setTransform(1.6,0,0,1.6,70,104);"," for(const k in FURN){ t.setTransform(1,0,0,1,0,0); t.clearRect(0,0,140,140); t.setTransform(1.65,0,0,1.65,70,121);")
R("<button class=\"b sm ${state.sound?'green':'alt'}\" data-a=\"sound\">${state.sound?'Activés':'Coupés'}</button></div>`;",
  "<button class=\"b sm ${state.sound?'green':'alt'}\" data-a=\"sound\">${state.sound?'Activés':'Coupés'}</button></div>`;\n  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">🌙 Cycle jour / nuit</div><div class=\"sub\">Suit l'heure réelle de ton téléphone</div></div><button class=\"b sm ${state.daynight?'green':'alt'}\" data-a=\"dn\">${state.daynight?'Activé':'Coupé'}</button></div>`;")
R(" sound:()=>{state.sound=!state.sound;},"," sound:()=>{state.sound=!state.sound;},\n dn:()=>{state.daynight=!state.daynight;},")
R("function floatAt(x,y,s,c,coin){ floaters.push({x,y,s,c,coin,t:1.6}); }","function floatAt(x,y,s,c,coin){ if(String(s).includes('🪙')){ s=s.replace(/ ?🪙/,''); coin=true; } floaters.push({x,y,s,c,coin,t:1.6}); }")
R("document.querySelectorAll('[data-open]')","document.querySelectorAll('[data-ic]').forEach(el=>el.innerHTML=svg(el.dataset.ic));\ndocument.querySelectorAll('[data-open]')")
R("$('#pLvl').onclick=()=>toast(`Niveau ${state.level}","$('#pLvl').onclick=()=>toast(`⭐ Niveau ${state.level}")
R(" $('#coins').textContent=fmt(state.coins); $('#lvl').textContent=state.level;"," $('#coins').textContent=fmt(state.coins); $('#lvl').textContent=state.level;")
R("<p class=\"sub center\">Bistro Ville — prototype v0.1</p>","<p class=\"sub center\">Bistro Ville — prototype v0.2</p>")
R(" if(FURN[k].kind==='chair') drawChairBack(null,0,0,FURN[k].col);","");
R(" resize(); centerCam(); makeThumbs(); calcRating(); hud();"," resize(); centerCam(); makeThumbs(); calcRating(); hud();\n if(document.fonts&&document.fonts.load) document.fonts.load('600 15px Fredoka').catch(()=>{});")
open('www/index.html','w').write(s)
print('ok',len(s))
