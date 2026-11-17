# v0.46 : déco — objets muraux (fenêtres, tableaux, enseigne, ardoise…), carrelage carreau par carreau, onglets plus clairs
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('walls_patch',a[:70],c); js=js.replace(a,b)
import re as _re
_m=_re.search(r"const ETABS=\[.*?\]\];",js); assert _m
js=js.replace(_m.group(0),"const ETABS=[['Tables','','Tables'],['Chaises','','Chaises'],['Cuisine','','Équipement'],['Bar','','Bar'],['Déco','','Objets déco'],['sols','','Sols'],['murs','','Murs'],['zone','','Cuisine'],['store','','Réserve']];")
RX("function editUI(){","""// ---- murs et sols à la carte ----
const WOBJ={win:{n:'Fenêtre classique',p:30,win:1},winR:{n:'Fenêtre ronde',p:45,win:1},winA:{n:'Fenêtre en arc',p:60,win:1},
 art0:{n:'Tableau vert',p:20},art1:{n:'Tableau rose',p:20},art2:{n:'Tableau bleu',p:20},art3:{n:'Tableau soleil',p:20},
 mirror:{n:'Miroir doré',p:70},clock:{n:'Horloge',p:40},shelf:{n:'Étagère à plantes',p:45},lampW:{n:'Applique',p:35},
 winS:{n:'Fenêtre à volets',p:70,win:1},winV:{n:'Vitrail',p:120,win:1},
 poster1:{n:'Affiche Café',p:30},poster2:{n:'Affiche Riviera',p:30},plates:{n:'Assiettes décorées',p:40},pans:{n:'Cuivres de cuisine',p:65},
 bottles:{n:'Étagère à bouteilles',p:55},mirrorR:{n:'Grand miroir',p:90},cuckoo:{n:'Coucou',p:75},coat:{n:'Patère',p:35},
 bunting:{n:'Fanions',p:25},garland:{n:'Guirlande lumineuse',p:50},neon:{n:'Néon tasse',p:110},
 sign:{n:'Enseigne classique',p:0,uniq:'sign'},signW:{n:'Enseigne bois',p:60,uniq:'sign'},signB:{n:'Enseigne noir et or',p:90,uniq:'sign'},signR:{n:'Enseigne rayée',p:90,uniq:'sign'},signN:{n:'Enseigne néon',p:150,uniq:'sign'},
 board:{n:'Ardoise du menu',p:0,uniq:'board'}};
const isSign=t=>!!t&&/^sign/.test(t);
let wsel=null, tileMode=false, tileBrush=null;
function wallDefaults(){ const N=new Array(S).fill(null), W=new Array(S).fill(null), m=Math.floor(S/2);
 for(const i of backWins()) N[i]='win'; N[m]='sign'; for(const j of leftWins()) W[j]='win'; W[3]='board'; let k=0; for(let j=5;j<S-1;j+=2) if(W[j]===null) W[j]='art'+(j%4);
 return {N,W}; }
function wallLayout(){ const D=wallDefaults(), O=state.wallObj; if(O) for(const sd of ['N','W']){ const o=O[sd]||{}; for(const k in o){ const i=+k; if(i<S) D[sd][i]=o[k]; } } return D; }
const wallSlotOK=(sd,i)=>i>=0&&i<S&&!(sd==='N'?inKitchen(i,0):inKitchen(0,i));
function wallSet(sd,i,t){ if(!wallSlotOK(sd,i)){ toast('Ce pan de mur est pris par la cuisine.'); return; } const L=wallLayout(), cur=L[sd][i]; if(cur===t) t=null;
 const W=t?WOBJ[t]:null, had=!!(W&&W.uniq&&(state.wOwn||[]).includes(t)); if(t&&!isSign(t)&&!isSign(cur)&&(isSign(L[sd][i-1])||isSign(L[sd][i+1]))){ toast('L’enseigne prend déjà cette place.'); return; } if(W&&!had&&W.p>state.coins){ toast('Pas assez de pièces'); sfx('bad'); return; }
 pushUndo(); const O=state.wallObj||(state.wallObj={N:{},W:{}});
 if(W&&W.uniq) for(const s2 of ['N','W']){ const l2=wallLayout()[s2]; l2.forEach((v,k)=>{ if(v&&WOBJ[v]&&WOBJ[v].uniq===W.uniq) (O[s2]||(O[s2]={}))[k]=null; }); }
 (O[sd]||(O[sd]={}))[i]=t; if(isSign(t)){ for(const k of [i-1,i+1]) if(k>=0&&k<S) O[sd][k]=null; }
 if(W&&W.p&&!had){ state.coins-=W.p; if(W.uniq) (state.wOwn||(state.wOwn=[])).push(t); } state.tv=(state.tv||0)+1; sfx(t?'coin':'pop'); }
function tilePaint(x,y){ if(!inRest(x,y)||tileBrush===null) return false; const T=state.tiles||(state.tiles={}), k=x+','+y, cur=T[k]===undefined?state.floor:T[k]; if(cur===tileBrush) return true;
 pushUndo(); if(tileBrush===state.floor) delete T[k]; else T[k]=tileBrush; state.tv=(state.tv||0)+1; sfx('pop'); return true; }
function editUI(){""")
RX(" if(etab==='style'){"," if(etab==='sols'||etab==='murs'){")
RX("  return fl+'<i class=\"esep\"></i>'+wl;","""  if(etab==='sols'){ const flT=FLOORS.map((f,i)=>{ const own=state.ownF.includes(i), lock=!own&&state.level<f.u; return `<button class="ecard${tileBrush===i?' on':''}${lock?' lock':''}" data-tb="${i}"><span class="eim sw" style="background:repeating-conic-gradient(${f.a} 0 25%,${f.b} 0 50%) 0 0/20px 20px"></span><span class="en">${f.n}</span><span class="ep${!own&&state.coins<f.p?' poor':''}">${lock?'niv. '+f.u:!own?f.p+' 🪙':tileBrush===i?'Pinceau':'Choisir'}</span></button>`; }).join('');
   return `<div class="emode"><button class="${tileMode?'':'on'}" data-tm="0">Toute la salle</button><button class="${tileMode?'on':''}" data-tm="1">Carreau par carreau</button></div>`+(tileMode?flT+'<button class="ecard" data-tb="-1"><span class="eim sw" style="background:#fff"></span><span class="en">Tout effacer</span><span class="ep">Remettre le sol</span></button>':fl); }
  const wo=Object.keys(WOBJ).map(k=>{ const W=WOBJ[k]; return `<button class="ecard${wsel===k?' on':''}" data-wo="${k}"><span class="eim"><img src="${thumbs['wo:'+k]||''}" alt=""></span><span class="en">${W.n}</span><span class="ep${W.p>state.coins&&!(state.wOwn||[]).includes(k)?' poor':''}">${W.p&&!(state.wOwn||[]).includes(k)?W.p+' 🪙':W.uniq?'Choisir':'Gratuit'}</span></button>`; }).join('');
  return wl+'<i class="esep"></i>'+wo+`<button class="ecard${wsel==='x'?' on':''}" data-wo="x"><span class="eim sw" style="background:repeating-linear-gradient(45deg,#f3dfb8 0 6px,#fff 6px 12px)"></span><span class="en">Gomme</span><span class="ep">Retirer</span></button>`;""")
RX(" else if(d.ew!==undefined) styleAct('w',+d.ew);"," else if(d.ew!==undefined) styleAct('w',+d.ew);\n else if(d.wo){ wsel=wsel===d.wo?null:d.wo; }\n else if(d.tm!==undefined){ tileMode=d.tm==='1'; if(tileMode&&tileBrush===null) tileBrush=state.floor; }\n else if(d.tb!==undefined){ if(+d.tb<0){ if(state.tiles&&Object.keys(state.tiles).length){ pushUndo(); state.tiles={}; state.tv=(state.tv||0)+1; } } else { const i=+d.tb, f=FLOORS[i]; if(!state.ownF.includes(i)){ if(state.level<f.u){ toast('Disponible au niveau '+f.u); } else if(state.coins<f.p){ toast('Pas assez de pièces'); sfx('bad'); } else { pushUndo(); state.coins-=f.p; state.ownF.push(i); tileBrush=i; sfx('coin'); hud(); } } else tileBrush=i; } }")
RX(" if(d.et){ etab=d.et; ecol=false;"," if(d.et){ etab=d.et; ecol=false; if(etab!=='murs') wsel=null; if(etab!=='sols') tileMode=false;")
RX("function editTap(x,y){","function editTap(x,y){ if(etab==='sols'&&tileMode){ if(tilePaint(x,y)) editUI(); return; }")
RX("floor:state.floor,wall:state.wall,ownF:[...state.ownF],ownW:[...state.ownW]}; }","floor:state.floor,wall:state.wall,ownF:[...state.ownF],ownW:[...state.ownW],tiles:JSON.stringify(state.tiles||{}),wobj:JSON.stringify(state.wallObj||null)}; }")
RX("$('#ehint').textContent=sel?'Glisse un objet pour le déplacer, ou touche une case libre.':(EHINT[etab]||'');","$('#ehint').textContent=sel?'Glisse un objet pour le déplacer, ou touche une case libre.':etab==='murs'?(wsel?'Touche un rond sur le mur pour poser ou retirer.':'Choisis une couleur de mur, ou un objet à accrocher.'):etab==='sols'?(tileMode?'Choisis un sol, puis touche les carreaux un par un.':'Touche un sol pour l’appliquer à toute la salle.'):(EHINT[etab]||'');")
RX(" Object.assign(state,{coins:s.coins,store:s.store,kz:s.kz,floor:s.floor,wall:s.wall,ownF:s.ownF,ownW:s.ownW});"," Object.assign(state,{coins:s.coins,store:s.store,kz:s.kz,floor:s.floor,wall:s.wall,ownF:s.ownF,ownW:s.ownW}); if(s.tiles!==undefined){ state.tiles=JSON.parse(s.tiles); state.wallObj=JSON.parse(s.wobj); state.tv=(state.tv||0)+1; }")
RX("'<button class=\"ech\" data-e=\"grand\"><span>🏠</span>Agrandir</button>'","'<button class=\"ech\" data-e=\"grand\"><span></span>Agrandir</button>'")
