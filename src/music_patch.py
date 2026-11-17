# v0.25 : musique d'ambiance générée (petit trio jazz/bossa tranquille, sans fichier audio)
RP("function audioInit(){ if(AC) return; try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }",
r"""function audioInit(){ if(AC){ if(AC.state==='suspended') AC.resume(); musicStart(); return; } try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} musicStart(); }
// --- musique : accords doux au piano électrique, contrebasse, balais, quelques notes de mélodie ---
const MUS={on:false,gain:null,next:0,step:0,timer:null,bar:0,mel:0};
const M_PROG=[[0,4,7,9],[9,13,16,19],[2,5,9,12],[7,11,14,17],[0,4,7,9],[4,7,11,14],[2,5,9,12],[7,11,14,17]];   // Cmaj7 Am7 Dm7 G7 | Fmaj7 Em7 Dm7 G7
const M_SCALE=[0,2,4,7,9,12,14,16];
const mHz=n=>261.63*Math.pow(2,n/12);
function mNote(f,t,d,v,type,cut){ const o=AC.createOscillator(), g=AC.createGain(), lp=AC.createBiquadFilter(); o.type=type; o.frequency.value=f; lp.type='lowpass'; lp.frequency.value=cut;
 g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(lp); lp.connect(g); g.connect(MUS.gain); o.start(t); o.stop(t+d+.05); }
function mBrush(t,v){ const n=AC.sampleRate*.08, b=AC.createBuffer(1,n,AC.sampleRate), dd=b.getChannelData(0); for(let i=0;i<n;i++) dd[i]=(Math.random()*2-1)*(1-i/n); const s=AC.createBufferSource(), g=AC.createGain(), hp=AC.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=5200; s.buffer=b; g.gain.value=v; s.connect(hp); hp.connect(g); g.connect(MUS.gain); s.start(t); }
function musicTick(){
 if(!MUS.on||!AC) return;
 const beat=60/116;   // swing manouche entraînant : la « pompe » sur les temps 2 et 4, contrebasse qui marche, mélodie qui chante
 while(MUS.next<AC.currentTime+.35){
  const t=MUS.next, st=MUS.step%8, ch=M_PROG[MUS.bar%M_PROG.length], onBeat=st%2===0;
  if(onBeat){ const bn=[ch[0],ch[2],ch[1],ch[0]+(Math.random()<.5?-1:2)][st/2]; mNote(mHz(bn)/4,t,beat*.8,.1,'sine',480); }                       // contrebasse
  if(st===2||st===6) ch.forEach((n,i)=>mNote(mHz(n),t+i*.004,.16,.04,'triangle',2200));                                                        // la pompe
  else if(st===0||st===4) ch.slice(0,3).forEach(n=>mNote(mHz(n),t,.3,.016,'triangle',1400));
  mBrush(t,st===2||st===6?.022:onBeat?.008:.012);
  if(MUS.bar%4!==3&&Math.random()<(onBeat?.62:.42)){ MUS.mel=clamp(MUS.mel+[-2,-1,-1,1,1,2][Math.floor(Math.random()*6)],0,M_SCALE.length-1);
   const long=Math.random()<.22; mNote(mHz(M_SCALE[MUS.mel])*2,t,beat*(long?1.3:.42),.03,'sawtooth',1700); if(long) mNote(mHz(M_SCALE[MUS.mel])*2*1.004,t,beat*1.3,.012,'sawtooth',1500); }   // mélodie façon accordéon
  MUS.next+=beat*(onBeat?.6:.4); MUS.step++; if(MUS.step%8===0) MUS.bar++;
 }
}
function musicStart(){
 if(!AC||!state||state.music===false||MUS.on) return;
 MUS.gain=AC.createGain(); MUS.gain.gain.value=0; MUS.gain.connect(AC.destination); MUS.gain.gain.linearRampToValueAtTime(.55,AC.currentTime+2);
 MUS.on=true; MUS.next=AC.currentTime+.1; MUS.timer=setInterval(musicTick,120);
}
function musicStop(){ if(!MUS.on) return; MUS.on=false; clearInterval(MUS.timer); try{ MUS.gain.gain.linearRampToValueAtTime(0,AC.currentTime+.4); }catch(e){} }
document.addEventListener('visibilitychange',()=>{ if(!AC) return; if(document.hidden) AC.suspend(); else AC.resume(); });""")
RP("<button class=\"b sm ${state.sound?'green':'alt'}\" data-a=\"sound\">${state.sound?'Activés':'Coupés'}</button></div>`;",
   "<button class=\"b sm ${state.sound?'green':'alt'}\" data-a=\"sound\">${state.sound?'Activés':'Coupés'}</button></div>`;\n  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">🎵 Musique d'ambiance</div><div class=\"sub\">Un swing entraînant de bistrot</div></div><button class=\"b sm ${state.music!==false?'green':'alt'}\" data-a=\"music\">${state.music!==false?'Activée':'Coupée'}</button></div>`;")
RP(" sound:()=>{state.sound=!state.sound;},"," sound:()=>{state.sound=!state.sound;},\n music:()=>{ state.music=state.music===false; if(state.music) musicStart(); else musicStop(); },")
