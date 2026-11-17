# v0.37 : images 3D à la place des émojis (ingrédients, plats du Belmont, portraits)
n=js.count("function renderPanel(){"); assert n==1,n
js=js.replace("function renderPanel(){","function renderPanel(){ renderPanel0(); try{ iconizeEl($('#modal')); }catch(e){} }\nfunction renderPanel0(){")
RP("function toast(s){ const t=$('#toast'); t.innerHTML=coinify(String(s).replace(/</g,'&lt;'));","function toast(s){ const t=$('#toast'); t.innerHTML=coinify(String(s).replace(/</g,'&lt;')); try{ iconizeEl(t); }catch(e){}")
RP(" const NEWS=[];",""" const NEWS=[];
 if(!state.img1){ state.img1=1; if(loaded) NEWS.push(`<div class="row"><div class="emo">${belImg(2)}</div><div class="info"><div class="t">De vraies images 3D</div><div class="sub">Les ingrédients, les plats étoilés du Belmont et les personnages de l’histoire sont maintenant modélisés en 3D, dans les menus comme en salle.</div></div></div>`); }""")
