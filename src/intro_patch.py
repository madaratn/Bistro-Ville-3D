# v0.56 : prologue animé — l'âge d'or du bistrot d'Odette, la maladie, le déclin, la saisie, l'héritage et la dette
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('intro_patch',a[:70],c); js=js.replace(a,b)
RX("function prologue(done){",r"""function prologue(done){ try{ if(typeof cinePrologue==='function'&&camOK()) return cinePrologue(done); }catch(e){ console.warn(e); } return prologue2D(done); }
function prologue2D(done){
 const st=state.staff, a=st[0]?st[0].name:'Léa', b=st[1]?st[1].name:'Hugo', P=k=>foodThumbs['who:'+k]||'', dishes=DISH.map(d=>foodThumbs[d.e]).filter(Boolean), tb=[thumbs.table2,thumbs.table3,thumbs.table,thumbs.tableP2].filter(Boolean), heads=['c','j','l','r','y','a','z'];
 const room=()=>{ let h='<div class="inRoom"><div class="inWall"><i class="inWin"></i><span class="inSign">Chez Odette</span><i class="inWin"></i></div><div class="inFloor"></div>'; let n=0;
  for(let r=0;r<3;r++){ const cols=r?4:3; for(let c=0;c<cols;c++){ const sc=.8+r*.22, x=(c+.5)/cols*100+(r===1?-4:r===2?3:0), y=36+r*22; h+=`<div class="inTb" style="left:${x}%;top:${y}%;--s:${sc};--d:${(n*37%100)/100*2.4}s;--g:${.4+((n*53)%100)/100*5.5}s;z-index:${r+1}"><img class="inH" src="${P(heads[n%7])}" alt=""><img class="inT" src="${tb[n%tb.length]||''}" alt=""><img class="inH" src="${P(heads[(n+3)%7])}" alt=""><img class="inD" src="${dishes[n%dishes.length]||''}" alt=""><b class="inC">+${8+n%5*3}</b></div>`; n++; } }
  return h+'<div class="inStar"><i>★</i><span>5,0</span></div><div class="inQ">'+[0,1,2,3,4].map(i=>`<img style="animation-delay:${i*.15}s" src="${P(heads[(i+2)%7])}" alt="">`).join('')+'<em>Complet ce soir</em></div></div>'; };
 const who=(k,name)=>`<div class="inWho"><span style="border-color:${SAGA_WHO[k][1]}"><img src="${P(k)}" alt=""></span><b style="color:${SAGA_WHO[k][1]}">${name||SAGA_WHO[k][0]}</b></div>`;
 const SC=[
  {y:'Il y a vingt ans',v:()=>room(),t:'Chez Odette, on faisait la queue jusqu’au bout de la rue. Trente tables, une brigade de douze, et les meilleures assiettes de la ville.',d:8},
  {y:'Les belles années',v:()=>room(),c:'gold',t:'Les mariages, les anniversaires, les dimanches en famille… Tout le quartier a un souvenir à la table de Mamie Odette.',d:7},
  {y:'Puis un hiver…',v:()=>`<div class="inSolo">${who('o')}<div class="inBill"><u>Clinique Saint-Roch</u><span>Soins</span><b data-cnt="18400">0</b><span>Traitement</span><b data-cnt="27900">0</b><span>Convalescence</span><b data-cnt="9600">0</b></div></div>`,t:'Odette tombe gravement malade. Les soins coûtent une fortune. Elle paie tout, sans rien dire à personne.',d:8},
  {y:'Le déclin',v:()=>room(),c:'dying',t:'Sans elle en cuisine, la salle se vide. Les cuisiniers partent un à un. Les étoiles tombent, les lumières s’éteignent.',d:9,star:[5,1.8]},
  {y:'Un matin',v:()=>`<div class="inSolo">${who('p')}<div class="inDoor"><span>Chez Odette</span><i class="inStamp">SAISIE</i></div></div>`,t:'M. Pinson, de la banque, se présente avec un avis de saisie. Le bistrot doit douze mille pièces. Il vient prendre les clés.',d:8},
  {y:'Mais…',v:()=>`<div class="inSolo"><div class="inDeed"><u>Acte de propriété</u><span>Établissement</span><b>Bistrot « Chez Odette »</b><span>Propriétaire</span><b class="inYou">Toi</b><em>Signé : Odette, il y a trois ans</em></div><div class="inDebt">Dette à reprendre<b data-cnt="12000">0</b></div></div>`,t:'En ouvrant le dossier, il découvre qu’Odette a mis le bistrot à ton nom. Personne ne peut le saisir… si tu acceptes l’héritage. Et la dette qui va avec.',d:9},
  {y:'À l’hôpital',v:()=>`<div class="inSolo big">${who('o')}</div>`,t:'« Tu viens de finir tes études, tu as la vie devant toi. Je ne t’oblige à rien. Mais ce bistrot, je l’ai ouvert avec un fourneau d’occasion et trois chaises. Il mérite mieux qu’un cadenas. »',d:10},
  {y:'Les derniers fidèles',v:()=>`<div class="inSolo"><div class="inDuo">${who('s',a+', en cuisine')}${who('s',b+', en salle')}</div></div>`,t:`De toute la brigade, il ne reste que ${a} et ${b}. Ils ne vont plus très vite, et ils ont promis à Odette de tenir encore un mois, pas plus. Après, il faudra recruter.`,d:9},
  {y:'À toi de jouer',v:()=>`<div class="inSolo big">${who('o')}</div>`,t:'« Une dernière chose. Mon carnet de recettes, j’en ai donné les pages aux gens du quartier. Retrouve-les. Et ne laisse jamais partir quelqu’un le ventre vide. »',d:9,last:1}];
 let i=-1, tm=null, cnt=null; const el=document.createElement('div'); el.id='prolog'; el.className='intro'; document.body.appendChild(el);
 el.innerHTML='<div class="inBars"></div><div class="inStage"></div><div class="inCap"><small></small><p></p><div class="inBtns"><button class="prS" id="prSkip">Passer</button><button class="b" id="prNext">Suite ›</button></div></div>';
 const end=()=>{ clearTimeout(tm); clearInterval(cnt); state.prolog=1; save(); el.classList.add('out'); setTimeout(()=>el.remove(),500); done&&done(); };
 const go=()=>{ clearTimeout(tm); clearInterval(cnt); i++; if(i>=SC.length) return end(); const s=SC[i], stg=el.querySelector('.inStage');
  stg.className='inStage '+(s.c||''); stg.innerHTML=s.v(); void stg.offsetWidth; stg.classList.add('in');
  el.querySelector('.inBars').innerHTML=SC.map((_,k)=>`<i class="${k<i?'done':k===i?'on':''}" style="--t:${s.d}s"></i>`).join('');
  el.querySelector('.inCap small').textContent=s.y; const p=el.querySelector('.inCap p'); p.textContent=s.t; p.classList.remove('in'); void p.offsetWidth; p.classList.add('in');
  el.querySelector('#prNext').textContent=s.last?'J’accepte le défi':'Suite ›'; el.querySelector('#prSkip').style.display=s.last?'none':'';
  const t0=performance.now(), nums=[...stg.querySelectorAll('[data-cnt]')], star=stg.querySelector('.inStar span');
  cnt=setInterval(()=>{ const k=Math.min(1,(performance.now()-t0)/(s.d*650)); for(const n of nums) n.textContent=Math.round(+n.dataset.cnt*k).toLocaleString('fr-FR')+' pièces'; if(s.star&&star) star.textContent=(s.star[0]+(s.star[1]-s.star[0])*k).toFixed(1).replace('.',','); if(k>=1) clearInterval(cnt); },60);
  if(!s.last) tm=setTimeout(go,s.d*1000); };
 el.addEventListener('click',e=>{ if(e.target.closest('#prSkip')) return end(); if(e.target.closest('#prNext')){ audioInit(); sfx('pop'); go(); } });
 go();
}
function prologueOld(done){""")
