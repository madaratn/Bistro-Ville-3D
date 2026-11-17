# v0.44 : ouvrir / fermer le restaurant — fermé, on n'accueille plus personne, on finit les tables, puis on peut aménager
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('open_patch',a[:70],c); js=js.replace(a,b)
RX("function enterEdit(tab){","""let wantEdit=false;
const isOpen=()=>{ if(state.open===undefined) state.open=state.served>0; return !!state.open; };
const inHouse=()=>custs.filter(c=>c.st!=='pass'&&c.st!=='leave').length;
function setOpen(o){ state.open=!!o;
 if(!o){ let n=0; for(const c of custs) if(['queue','enter','look','host'].includes(c.st)||(c.st==='walkIn'&&!c.sitting&&!c.seq)){ c.seat=null; leave(c); n++; }
  const rest=inHouse(); toast(rest?'Fermé. Les '+rest+' clients présents terminent leur repas.':'Fermé. La salle est vide : tu peux aménager.'); if(typeof rush!=='undefined'&&rush) endRush(); }
 else { wantEdit=false; spawnT=Math.min(spawnT,1.5); toast('Ouvert ! Les premiers clients arrivent.'); }
 sfx('pop'); save(); hud(); }
function toggleOpen(){ if(mode!=='play') return; setOpen(!isOpen()); }
function openTick(){ if(wantEdit&&!isOpen()&&!inHouse()&&mode==='play'&&!ui.panel){ wantEdit=false; enterEdit(); toast('La salle est vide : à toi d’aménager.'); } }
function enterEdit(tab){
 if(isOpen()){ wantEdit=true; queueModal(()=>({title:'Fermer pour aménager ?',html:`<p class="center">On ne déplace pas les tables au milieu du service. Ferme le restaurant : les clients présents terminent leur repas, puis tu pourras installer tes meubles et ta déco.</p><p class="center"><button class="b red" data-a="closeResto">Fermer le restaurant</button> <button class="b alt" data-a="keepOpen">Rester ouvert</button></p>`})); return; }
 if(inHouse()){ wantEdit=true; toast('Encore '+inHouse()+' clients à table. Le mode Déco s’ouvrira dès qu’ils seront partis.'); return; }
""")
RX(" close:()=>closeModal(),"," close:()=>closeModal(),\n closeResto:()=>{ closeModal(); setOpen(false); wantEdit=true; }, keepOpen:()=>{ wantEdit=false; closeModal(); },")
RX(" spawnT-=dt*(rush?3:1)*storyMul();"," openTick(); if(!isOpen()) spawnT=2;\n spawnT-=dt*(rush?3:1)*storyMul();")
RX("function update(dt){ if(!warming) dayTick(dt);","function update(dt){ if(!warming&&(isOpen()||inHouse())) dayTick(dt);")
RX("function startRush(){","function startRush(){ if(!isOpen()){ toast('Ouvre d’abord le restaurant.'); return; }")
RX(" warmStart();\n"," if(isOpen()) warmStart();\n")
RX("if(!state.story&&state.prolog&&state.tuto&&!warming){","if(!state.story&&state.prolog&&state.tuto&&!warming){ if(!isOpen()&&!state.openHint){ state.openHint=1; toast('Touche l’écriteau « Fermé » pour ouvrir le bistrot'); }")
