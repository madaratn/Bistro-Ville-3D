# v0.36 : visiter Le Belmont
RP("const PANELS={",r"""const PANELS={
 belmenu(){ let html='<p class="sub center">Cuisine de Victor Belmont · trois étoiles</p>';
  html+=BEL_MENU.map((m,i)=>`<div class="row belm"><div class="emo">${belImg(i)}</div><div class="info"><div class="t">${m[1]}</div><div class="sub">${m[2]}</div></div><div class="belp">${m[3]} 🪙<small>pas à ta carte</small></div></div>`).join('');
  html+='<p class="sub center">Aucun de ces plats n’est encore à ta carte. Pour l’instant.</p>'; return {title:'La carte du Belmont',html}; },""")
RP(" close:()=>closeModal(),"," close:()=>closeModal(),\n visit:()=>{ closeModal(); enterVisit(); },")
RP("PICON={","PICON={belmenu:['star','#e9cc78','#d4a53a','#9c7420'],")
RP(" const NEWS=[];",""" const NEWS=[];
 if(!state.vis1){ state.vis1=1; if(loaded) NEWS.push(`<div class="row"><div class="emo">🏛️</div><div class="info"><div class="t">Visite Le Belmont</div><div class="sub">Touche le palace d’à côté (ou « Visiter » dans 📖 Histoire) pour entrer chez ton rival : lustres, vivier à homards, piano à queue, cuisine en cuivre… Touche les ✦ pour tout découvrir.</div></div></div>`); }""")
