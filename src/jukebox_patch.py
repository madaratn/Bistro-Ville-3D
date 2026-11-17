# v0.34 : plusieurs ambiances musicales à tempos différents, on change en touchant le juke-box
a=js.index("function musicTick(){"); b=js.index("function musicStart(){")
js=js[:a]+r"""// chaque morceau : tempo, nombre de pas par mesure, durée d'un pas, grille d'accords, gamme de la mélodie, et sa façon de jouer
const mWalk=(n)=>{ MUS.mel=clamp(MUS.mel+[-2,-1,-1,1,1,2][Math.floor(Math.random()*6)],0,n-1); return MUS.mel; };
const P_JAZZ=[[0,4,7,9],[9,13,16,19],[2,5,9,12],[7,11,14,17],[0,4,7,9],[4,7,11,14],[2,5,9,12],[7,11,14,17]];
const P_BOSSA=[[2,5,9,12],[7,11,14,17],[0,4,7,11],[9,13,16,19],[2,5,9,12],[7,11,14,17],[0,4,7,11],[0,4,7,11]];
const P_MINOR=[[9,12,16],[9,12,16],[2,5,9],[2,5,9],[4,8,11,14],[4,8,11,14],[9,12,16],[4,8,11,14]];
const P_BALLAD=[[0,4,7,11],[9,13,16,19],[2,5,9,12],[7,11,14,17],[4,7,11,14],[9,13,16,19],[2,5,9,12],[7,11,14,17]];
const S_MAJ=[0,2,4,7,9,12,14,16], S_MIN=[-3,-1,0,2,4,5,8,9,11,12,14,16];
const TRACKS=[
 {n:'Swing manouche',e:'🎻',bpm:116,steps:8,prog:P_JAZZ,scale:S_MAJ,dur:(st,b)=>b*(st%2===0?.6:.4),
  play(t,st,ch,beat,bar){ const on=st%2===0;
   if(on){ const bn=[ch[0],ch[2],ch[1],ch[0]+(Math.random()<.5?-1:2)][st/2]; mNote(mHz(bn)/4,t,beat*.8,.1,'sine',480); }
   if(st===2||st===6) ch.forEach((n,i)=>mNote(mHz(n),t+i*.004,.16,.04,'triangle',2200));
   else if(st===0||st===4) ch.slice(0,3).forEach(n=>mNote(mHz(n),t,.3,.016,'triangle',1400));
   mBrush(t,st===2||st===6?.022:on?.008:.012);
   if(bar%4!==3&&Math.random()<(on?.62:.42)){ const m=this.scale[mWalk(this.scale.length)], long=Math.random()<.22; mNote(mHz(m)*2,t,beat*(long?1.3:.42),.03,'sawtooth',1700); if(long) mNote(mHz(m)*2*1.004,t,beat*1.3,.012,'sawtooth',1500); } }},
 {n:'Bossa du soir',e:'🌙',bpm:88,steps:8,prog:P_BOSSA,scale:S_MAJ,dur:(st,b)=>b*.5,
  play(t,st,ch,beat,bar){
   if(st===0||st===4) mNote(mHz(ch[0])/4,t,beat*1.3,.1,'sine',420); if(st===3||st===7) mNote(mHz(ch[2])/4,t,beat*.5,.08,'sine',420);
   if(st===0||st===3||st===6) ch.forEach((n,i)=>mNote(mHz(n),t+i*.006,.42,.026,'triangle',1500));
   mBrush(t,st%2?.006:.01); if(st===0||st===3||st===6||(bar%2&&st===5)) mNote(1900,t,.03,.012,'square',2600);
   if(bar%4!==3&&Math.random()<(st%2?.22:.36)){ const m=this.scale[mWalk(this.scale.length)], d=beat*(Math.random()<.4?1.6:.8); mNote(mHz(m)*2,t,d,.034,'sine',2400); mNote(mHz(m)*4,t,d*.6,.006,'sine',3000); } }},
 {n:'Valse musette',e:'🪗',bpm:168,steps:6,prog:P_MINOR,scale:S_MIN,dur:(st,b)=>b*.5,
  play(t,st,ch,beat,bar){
   if(st===0) mNote(mHz(bar%2?ch[2]:ch[0])/4,t,beat*.9,.11,'sine',460);
   if(st===2||st===4) ch.forEach((n,i)=>mNote(mHz(n),t+i*.003,.13,.034,'triangle',2000));
   if(st===2||st===4) mBrush(t,.012);
   if(bar%8!==7&&Math.random()<(st%2===0?.85:.55)){ const m=this.scale[mWalk(this.scale.length)], d=beat*(st===0&&Math.random()<.3?1.4:.46); mNote(mHz(m)*2,t,d,.024,'sawtooth',1900); mNote(mHz(m)*2*1.006,t,d,.014,'sawtooth',1700); } }},
 {n:'Jazz lounge',e:'🎹',bpm:66,steps:8,prog:P_BALLAD,scale:S_MAJ,dur:(st,b)=>b*(st%2===0?.62:.38),
  play(t,st,ch,beat,bar){
   if(st===0) mNote(mHz(ch[0])/4,t,beat*1.9,.1,'sine',400); if(st===4) mNote(mHz(ch[2])/4,t,beat*1.6,.085,'sine',400); if(st===7&&Math.random()<.5) mNote(mHz(ch[0]+2)/4,t,beat*.4,.06,'sine',400);
   if(st===0) ch.forEach((n,i)=>mNote(mHz(n),t+i*.03,beat*2.6,.022,'triangle',1200)); if(st===5&&bar%2) ch.slice(1).forEach((n,i)=>mNote(mHz(n),t+i*.02,beat*1.2,.014,'triangle',1200));
   mBrush(t,st===2||st===6?.012:.005);
   if(Math.random()<(st%2===0?.3:.16)){ const m=this.scale[mWalk(this.scale.length)], d=beat*(Math.random()<.5?1.8:.9); mNote(mHz(m)*2,t,d,.032,'triangle',2000); mNote(mHz(m)*4,t,d*.5,.008,'sine',3200); } }},
 {n:'Tarentelle',e:'🍝',bpm:132,steps:6,prog:P_MINOR,scale:S_MIN,dur:(st,b)=>b/3,
  play(t,st,ch,beat,bar){ const s=beat/3;
   if(st===0) mNote(mHz(ch[0])/4,t,beat*.7,.11,'sine',480); if(st===3) mNote(mHz(ch[2])/4,t,beat*.6,.09,'sine',480);
   if(st===2||st===5) ch.forEach((n,i)=>mNote(mHz(n),t+i*.003,.1,.03,'triangle',2400));
   mBrush(t,st===0||st===3?.02:.009);
   if(bar%8!==7&&Math.random()<(st%3===0?.9:.7)){ const m=this.scale[mWalk(this.scale.length)]; if(st%3===0&&Math.random()<.35){ for(let k=0;k<3;k++) mNote(mHz(m)*2,t+k*s/3,s*.3,.022,'sawtooth',3000); } else mNote(mHz(m)*2,t,s*.8,.028,'sawtooth',2800); } }},
];
const curTrack=()=>TRACKS[(state.track||0)%TRACKS.length];
function musicTick(){
 if(!MUS.on||!AC) return;
 const tr=curTrack(), beat=60/tr.bpm;
 while(MUS.next<AC.currentTime+.35){
  const st=MUS.step%tr.steps; tr.play(MUS.next,st,tr.prog[MUS.bar%tr.prog.length],beat,MUS.bar);
  MUS.next+=tr.dur(st,beat); MUS.step++; if(MUS.step%tr.steps===0) MUS.bar++;
 }
}
function setTrack(i,f){
 state.track=((i%TRACKS.length)+TRACKS.length)%TRACKS.length; const tr=curTrack();
 MUS.step=0; MUS.bar=0; MUS.mel=3; state.music=true;
 if(AC&&MUS.on){ MUS.next=AC.currentTime+.45; } else { audioInit(); musicStart(); }
 toast(tr.e+' '+tr.n+' · '+tr.bpm+' bpm'); if(f){ sparkle(f.x,f.y,8,'#ff8fb8'); floatAt(f.x,f.y,'🎵 '+tr.n,'#b04bd6'); } save();
}
"""+js[b:]
RP("<div class=\"sub\">Un swing entraînant de bistrot</div></div><button class=\"b sm ${state.music!==false?'green':'alt'}\" data-a=\"music\">${state.music!==false?'Activée':'Coupée'}</button></div>`;",
   "<div class=\"sub\">${curTrack().e} ${curTrack().n} · ${curTrack().bpm} bpm — touche le juke-box pour changer</div></div><button class=\"b sm alt\" data-a=\"track\">Suivante</button> <button class=\"b sm ${state.music!==false?'green':'alt'}\" data-a=\"music\">${state.music!==false?'Activée':'Coupée'}</button></div>`;")
RP(" sound:()=>{state.sound=!state.sound;},"," sound:()=>{state.sound=!state.sound;},\n track:()=>{ setTrack((state.track||0)+1); },")
RP(" jukebox:{n:'Juke-box',cat:'Déco',p:420,d:8,u:4,kind:'jukebox'},"," jukebox:{n:'Juke-box',cat:'Déco',p:150,d:8,u:1,kind:'jukebox'},")
RP(" const NEWS=[];",""" const NEWS=[];
 if(!state.juke){ state.juke=1; const j=state.furn.some(f=>kindOf(f)==='jukebox'); if(!j) state.store.jukebox=(state.store.jukebox||0)+1; if(loaded){
  NEWS.push(`<div class="row"><div class="emo">🎵</div><div class="info"><div class="t">Le juke-box change la musique</div><div class="sub">Cinq ambiances à des tempos différents : swing, bossa, valse musette, jazz lounge, tarentelle. Touche le juke-box pour passer à la suivante${j?'':' (un juke-box offert t’attend dans la réserve du mode Déco)'}.</div></div></div>`); } }""")
