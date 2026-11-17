# v0.57 : tutoriel guidé pas à pas (projecteur sur chaque bouton), que l'on peut passer
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('tuto_patch',a[:70],c); js=js.replace(a,b)
RX("function showTuto(){",r"""let tutS=null;
function showTuto(){
 if(tutS) return; closeModal(); if(!isOpen()) {} 
 const T=[
  {t:'Bienvenue chez toi ! Je te fais faire le tour en deux minutes. Tu peux passer quand tu veux, et revoir ce tour plus tard depuis le bouton Plus.'},
  {q:'#bOpen',t:'Ton bistrot est fermé. Touche ce bouton pour ouvrir : les clients ne viennent que si la porte est ouverte.',wait:()=>isOpen(),hint:'Touche « Ouvrir » pour continuer'},
  {q:'#pCoins',t:'Tes pièces. Chaque client servi en rapporte. Chaque soir, tu paies les salaires, l’électricité et la dette d’Odette.'},
  {q:'#pLvl',t:'Ton niveau. Il monte en servant des clients et débloque des plats, des meubles et des employés.'},
  {q:'#pRate',t:'Ta note. Plus elle est haute, plus les clients sont nombreux. Elle dépend du service, de la propreté et de la déco.'},
  {q:'#sJour',t:'L’heure du jeu. Une journée dure une heure : petit-déjeuner, midi, après-midi, puis soirée. À 23 h tombe le bilan du jour.'},
  {t:'Dans la salle, ton serveur prend les commandes et ton cuisinier prépare. Toi, touche les bulles qui apparaissent : pourboire à ramasser, client impatient à rassurer, plat à sauver. Touche aussi les déchets pour nettoyer.',pos:'low'},
  {q:'#sRush',t:'Le coup de feu : 45 secondes de rush où tout rapporte plus. Tu en as trois par jour, et chacun coûte de l’énergie.'},
  {q:'#sEn',t:'Ton énergie. Elle sert aux coups de feu et aux coups de main, et se recharge toute seule avec le temps.'},
  {q:'#sSpd',t:'La vitesse. Touche pour passer en ×2 ou ×3 quand tu veux que la journée avance plus vite.'},
  {q:'#bottom [data-open="menu"]',t:'Le menu. Choisis les plats que tu sers. À force d’être servi, un plat gagne des étoiles de maîtrise et se vend plus cher.'},
  {q:'#bottom [data-open="staff"]',t:'L’équipe. Tes deux anciens ne resteront pas longtemps : c’est ici que tu recrutes. Un apprenti coûte peu, un expert travaille mieux mais son salaire tombe chaque soir.'},
  {q:'#bEdit',t:'La déco. Ferme d’abord le bistrot, puis déplace les meubles, change les murs et le sol, et choisis un style. Une belle salle fait monter ta note.'},
  {q:'#bMore',t:'Ici : le jardin et le marché pour les ingrédients, les restaurants témoins, les ingrédients d’exception, les comptes et l’histoire.'},
  {q:'#goal',t:'Ton objectif du moment. Touche-le pour voir la liste « Aujourd’hui ». Quand tout est coché, ta journée est bouclée.'},
  {q:'#sCam',t:'La caméra. Ce bouton tourne la vue. Avec deux doigts, tu peux aussi pivoter, incliner et zoomer.'},
  {t:'Voilà, tu sais l’essentiel. Le reste, tu l’apprendras en servant. Et n’oublie pas : on ne laisse jamais partir quelqu’un le ventre vide.',last:1}];
 const el=document.createElement('div'); el.id='tut'; document.body.appendChild(el);
 el.innerHTML='<div class="tuCatch"></div><div class="tuHole"></div><div class="tuBub"><div class="tuWho"><img src="'+(foodThumbs['who:o']||'')+'" alt=""></div><div class="tuTxt"><b>Mamie Odette</b><p></p><em></em></div><div class="tuBtns"><button class="tuSkip">Passer le tutoriel</button><span></span><button class="b tuNext">Suivant</button></div></div>';
 let i=-1; const S2=tutS={el,i:0};
 const end=()=>{ clearInterval(S2.tm); tutS=null; state.tuto=true; save(); el.classList.add('out'); setTimeout(()=>el.remove(),350); };
 const place=()=>{ const s=T[i]; if(!s) return; const h=el.querySelector('.tuHole'), b=el.querySelector('.tuBub'), tg=s.q?document.querySelector(s.q):null, r=tg&&tg.getBoundingClientRect();
  if(r&&r.width>0){ const p=8; h.style.cssText=`display:block;left:${r.left-p}px;top:${r.top-p}px;width:${r.width+2*p}px;height:${r.height+2*p}px`; const low=r.top+r.height/2>innerHeight/2; b.style.top=low?'':Math.min(innerHeight-250,r.bottom+22)+'px'; b.style.bottom=low?Math.min(innerHeight-200,innerHeight-r.top+22)+'px':''; }
  else { h.style.cssText='display:none'; b.style.top=s.pos==='low'?'':'34%'; b.style.bottom=s.pos==='low'?'130px':''; } };
 const go=()=>{ i++; while(T[i]&&T[i].q&&!document.querySelector(T[i].q)) i++; const s=T[i]; if(!s) return end();
  el.classList.toggle('act',!!s.wait); el.querySelector('.tuTxt p').textContent=s.t; el.querySelector('.tuTxt em').textContent=s.wait?s.hint:''; el.querySelector('.tuBtns span').textContent=(i+1)+' / '+T.length;
  const nx=el.querySelector('.tuNext'); nx.style.display=s.wait?'none':''; nx.textContent=s.last?'C’est parti !':'Suivant'; el.querySelector('.tuSkip').style.display=s.last?'none':''; place(); const b=el.querySelector('.tuBub'); b.classList.remove('in'); void b.offsetWidth; b.classList.add('in'); };
 el.addEventListener('click',e=>{ if(e.target.closest('.tuSkip')) return end(); if(e.target.closest('.tuNext')){ audioInit(); sfx('pop'); go(); } });
 S2.tm=setInterval(()=>{ if(state.tuto&&i<T.length-1&&!S2.replay){ return end(); } const s=T[i]; if(!s) return; if(ui.panel&&!s.wait){ closeModal(); } place(); if(s.wait&&s.wait()) go(); },250);
 if(state.tuto) S2.replay=true;
 go();
}
function showTutoOld(){""")
RX(" go:v=>{ closeModal(); if(v==='quit'){ save(); location.reload(); return; } openPanel(v); },"," go:v=>{ closeModal(); if(v==='quit'){ save(); location.reload(); return; } if(v==='tuto'){ showTuto(); return; } openPanel(v); },")
RX("const MORE=[","const MORE=[['tuto','Revoir le tutoriel','quiz','#ffe08a','#f2b33d','#b9772e'],")
