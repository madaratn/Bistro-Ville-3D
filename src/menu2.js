// ===================== LA CARTE (v0.98) : des fiches illustrées, comme une vraie carte de restaurant =====================
function menuHTML2(){
 if(ui.tab==='boissons') return drinksHTML();
 let html='';
 const pic=(d,extra)=>`<div class="dPic">${foodIcon(d.e)}${extra||''}</div>`, price=d=>`<span class="dPrice">${dishPrice(d)} 🪙</span>`;
 if(ui.tab==='carte'){
  { const sv=svcNow(), now=menuNow(); html+=`<div class="svcH"><b>${sv.n}</b> · ${hLabel(sv.h0)} – ${hLabel(sv.h1)}<div class="svcT">${SVC.map(x=>`<i class="${x.k===sv.k?'on':''}" style="flex:${x.h1-x.h0}">${x.s}</i>`).join('')}</div>${now.length?'':'<div class="sub">Aucun de tes plats ne correspond à ce service : les clients prennent ce qu’il y a, sans enthousiasme.</div>'}</div>`; }
  html+=pdjHTML();
  html+=`<div class="dHead"><i></i><b>La carte</b><em>${state.menu.length} / ${menuSlots()} plats</em><i></i></div><div class="dGrid">`;
  html+=state.menu.map(id=>{ const d=DISHM[id]; return `<div class="dCard">${pic(d,price(d))}<div class="dNm">${d.n}</div><div class="dBad">${svcBadges(d)}</div>${mastRow(id)}<div class="dMeta">${d.t} s de cuisson</div><button class="b sm alt" data-a="remMenu" data-v="${id}" ${state.menu.length<=1?'disabled':''}>Retirer</button></div>`; }).join('');
  for(let i=state.menu.length;i<menuSlots();i++) html+=`<button class="dCard dAdd" data-a="tab" data-v="plats"><span>+</span>Ajouter un plat</button>`;
  html+='</div>';
 } else {
  html+='<p class="sub">Améliore tes recettes avec des ingrédients : un plat de meilleur niveau rapporte plus et rend les clients plus heureux.</p>';
  for(const cat of ['Matin','Entrée','Plat','Dessert','Soir']){
   html+=`<div class="dHead"><i></i><b>${({Matin:'Petit-déjeuner et brunch',Soir:'Soirée'})[cat]||cat+'s'}</b><i></i></div><div class="dGrid">`;
   html+=DISH.filter(d=>d.c===cat).map(d=>{ const lock=state.level<d.u, L=lvl(d.id), inM=state.menu.includes(d.id);
    if(lock) return `<div class="dCard lock">${pic(d,`<span class="dLock">🔒 Niveau ${d.u}</span>`)}<div class="dNm">${d.n}</div></div>`;
    const can=L<10&&d.ing.every(k=>(state.inv[k]||0)>=L);
    return `<div class="dCard ${inM?'on':''}">${pic(d,price(d)+`<span class="dLv">Niv. ${L}</span>`+(inM?'<span class="dOn">À la carte</span>':''))}<div class="dNm">${d.n}</div><div class="dStars">${'★'.repeat(Math.ceil(L/2))}<u>${'★'.repeat(5-Math.ceil(L/2))}</u></div>${mastRow(d.id)}<div class="ings">${L<10?d.ing.map(k=>ingTag(k,L)).join(''):'<span class="ok">Niveau max !</span>'}</div><div class="dBt">${L<10?`<button class="b sm green" data-a="upg" data-v="${d.id}" ${can?'':'disabled'}>Améliorer</button>`:''}${inM?'':`<button class="b sm" data-a="addMenu" data-v="${d.id}" ${state.menu.length>=menuSlots()?'disabled':''}>+ Carte</button>`}</div></div>`; }).join('');
   html+='</div>';
  }
 }
 return html; }
