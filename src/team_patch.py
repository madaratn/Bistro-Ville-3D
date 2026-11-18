# v0.67 : la vie de l'équipe — départ des deux anciens, moral, entretiens, préavis de départ, galons d'ancienneté
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('team_patch',a[:70],c); js=js.replace(a,b)
# moral et ancienneté jouent sur la vitesse ; un salaire négocié s'ajoute au salaire de base
RX("const staffMul=a=>tierOf(a.s).sp*(1+.1*(staffLv(a.s)-1));","const staffMul=a=>tierOf(a.s).sp*(1+.1*(staffLv(a.s)-1))*teamMul(a.s);")
RX("const wageOf=s=>tierOf(s).wage+10*(staffLv(s)-1);","const wageOf=s=>Math.round((tierOf(s).wage+10*(staffLv(s)-1))*(1+.15*(s.rz||0)));")
RX("function buildCrew(){ crew=state.staff.map(mkCrew);","function buildCrew(){ teamFix(); crew=state.staff.filter(s=>!teamOff(s)).map(mkCrew);")
RX(" state.day={n:d.n+1,t:0,inc:{},exp:{},served:0,c0:state.coins,e0:state.earned,hist:d.hist};"," state.day={n:d.n+1,t:0,inc:{},exp:{},served:0,c0:state.coins,e0:state.earned,hist:d.hist}; try{ teamDay(d,net); }catch(e){ console.warn(e); }")
RX("ACT.hire3=v=>{ const [r,q]=v.split(':'), T=TIERS[+q]; if(state.coins<T.fee||state.staff.length>=maxStaff()||state.level<T.u) return; state.coins-=T.fee; const s=mkStaffData(r); s.q=+q;","ACT.hire3=v=>{ const [r,q]=v.split(':'), T=TIERS[+q]; if(state.coins<T.fee||state.staff.length>=maxStaff()||state.level<T.u) return; state.coins-=T.fee; const s=mkStaffData(r); s.q=+q; s.d0=dayNow(); s.mo=75;")
# fiche de chaque employé : galons, moral, statut, boutons
RX("return `<div class=\"row\"><div class=\"info\"><div class=\"t\">${s.name} · ${R.n}</div><div class=\"sub\"><span class=\"tier t${s.q===undefined?1:s.q}\">${T.n}</span> niveau ${L}/5 · ${wageOf(s)} par jour</div></div>",
   "return `<div class=\"row tm ${s.quit?'quit':''}\"><div class=\"tmF\" style=\"border-color:${teamMood(s)[1]}\"><img src=\"${staffImg(s)}\" alt=\"\"></div><div class=\"info\"><div class=\"t\">${s.name} · ${R.n} ${teamStars(s)}</div><div class=\"sub\"><span class=\"tier t${s.q===undefined?1:s.q}\">${s.vet?'Ancien':T.n}</span> niveau ${L}/5 · ${wageOf(s)} par jour · ${teamAge(s)} j</div>${teamInfo(s)}${s.quit&&!s.vet?`<button class=\"b sm green tmK\" data-a=\"tkeep\" data-v=\"${s.id}\" ${state.coins<wageOf(s)*3?'disabled':''}>Le retenir · prime de ${wageOf(s)*3}</button>`:''}</div>")
RX("function dayEnd(){",r"""// ===================== LA VIE DE L'ÉQUIPE =====================
const dayNow=()=>state.day?state.day.n:1, teamAge=s=>Math.max(0,dayNow()-(s.d0||1)), teamOff=s=>s.off===dayNow();
const teamRank=s=>{ const a=teamAge(s); return s.vet?3:a>=60?3:a>=30?2:a>=10?1:0; };
const teamStars=s=>{ const r=teamRank(s); return r?'<span class="gal" title="Ancienneté">'+'★'.repeat(r)+'</span>':''; };
const teamMul=s=>(1+.04*(s.vet?0:teamRank(s)))*(s.vet?1:(s.mo===undefined?1:s.mo<30?.9:s.mo>80?1.05:1));
function teamFix(){ const n=dayNow(); if(!state.teamV){ state.teamV=1; if(n<=20) state.staff.slice(0,2).forEach((s,i)=>{ if((s.q||0)===0||s.q===undefined){ s.vet=1; s.leave=Math.max(n+8,20+i*3+Math.floor(Math.random()*8)); } }); }
 for(const s of state.staff){ if(s.d0===undefined) s.d0=s.vet?1:n; if(s.mo===undefined) s.mo=70; } }
const teamMood=s=>s.mo>=75?['Ravi','#27a05c']:s.mo>=50?['Content','#6fae3a']:s.mo>=30?['Fatigué','#e0a02a']:['Au bord du départ','#e5484d'];
function teamInfo(s){ const n=dayNow(); if(s.vet) return `<div class="sub tmN">${s.leave-n<=0?'Part ce soir':'Prend sa retraite dans '+(s.leave-n)+' jour'+(s.leave-n>1?'s':'')} · il faudra recruter</div>`;
 const m=teamMood(s); return `<div class="tmM"><span class="bar"><i style="width:${Math.max(4,s.mo)}%;background:${m[1]}"></i></span><em style="color:${m[1]}">${m[0]}</em></div>`+(s.quit?`<div class="sub tmN">A posé sa démission : part dans ${Math.max(0,s.quit-n)} jour${s.quit-n>1?'s':''}</div>`:teamOff(s)?'<div class="sub tmN">En repos aujourd’hui</div>':''); }
function teamGo(s,txt){ state.staff=state.staff.filter(x=>x!==s); resetSim(); crew=crew.filter(a=>a.s!==s); try{ assignHomes(); }catch(e){} }
const teamCard=(s,txt)=>`<div class="tmC"><div class="tmP"><img src="${staffImg(s)||foodThumbs['who:s']||''}" alt=""></div><div><b>${s.name}, ${ROLES[s.role].n.toLowerCase()}</b><p>${txt}</p></div></div>`;
function teamDay(d,net){ teamFix(); const n=dayNow(), perHead=d.served/Math.max(1,state.staff.length), list=state.staff.slice();
 for(const s of list){
  if(s.vet){ const left=s.leave-n;
   if(left===3) queueModal(()=>({title:'Bientôt la retraite',html:teamCard(s,`« Patron, il faut que je vous dise : dans trois jours, je raccroche le tablier. J’ai promis à Odette de tenir jusque-là. Trouvez quelqu’un pour me remplacer, et je lui montrerai les ficelles. »`)+'<p class="center"><button class="b" data-a="go" data-v="staff">Voir l’équipe</button></p>'}));
   else if(left<=0){ teamGo(s); queueModal(()=>({title:'Au revoir, '+s.name,html:teamCard(s,`« Voilà, c’est mon dernier soir. Vingt ans dans cette cuisine… Prenez soin du bistrot, et passez le bonjour à Odette. Vous êtes entre de bonnes mains : les vôtres. »`)+`<p class="center sub">${s.name} a pris sa retraite.${state.staff.some(x=>x.role===s.role)?'':' Tu n’as plus personne à ce poste : recrute vite.'}</p><p class="center"><button class="b" data-a="go" data-v="staff">Recruter</button></p>`})); }
   continue; }
  // moral du jour
  let dm=-2; if(perHead>24) dm-=4; if(net>0) dm+=2; if(rating>=4) dm+=1; if(state.coins<0) dm-=10; if((dailyCheck().c.gest||0)>=8) dm+=1;
  s.mo=Math.max(0,Math.min(100,s.mo+dm));
  if(s.quit){ if(n>=s.quit){ teamGo(s); queueModal(()=>({title:s.name+' est parti',html:teamCard(s,`« Je vous avais prévenu. Bonne continuation. »`)+'<p class="center"><button class="b" data-a="go" data-v="staff">Recruter</button></p>'})); } continue; }
  if(s.mo<=0){ s.quit=n+3; queueModal(()=>({title:'Démission',html:teamCard(s,`« J’en peux plus, patron. Trop de monde, pas assez de considération. Je vous donne trois jours pour me remplacer. »`)+`<p class="center sub">Tu peux encore le retenir depuis l’écran Équipe, avec une prime de ${wageOf(s)*3} pièces.</p><p class="center"><button class="b" data-a="go" data-v="staff">Voir l’équipe</button></p>`})); continue; }
  // entretien : tous les 30 jours d'ancienneté, ou plus tôt si le moral est bas (au plus une fois par semaine)
  const age=teamAge(s), due=(age>0&&age%30===0)||(s.mo<35&&n-(s.rv||0)>=7);
  if(due){ s.rv=n; (state.teamQ||(state.teamQ=[])).push(s.id); } }
 teamAsk(); try{ buildCrew(); }catch(e){} }
function teamAsk(){ const Q=state.teamQ||[]; while(Q.length&&!state.staff.some(s=>s.id===Q[0])) Q.shift(); if(!Q.length) return; const s=state.staff.find(x=>x.id===Q[0]), w=wageOf(s), up=Math.round(w*.15), prime=w*2;
 queueModal(()=>({title:'Entretien avec '+s.name,html:teamCard(s,s.mo<35?`« Patron, je ne vais pas vous mentir : je fatigue. Il faudrait faire un geste. »`:`« Ça fait ${teamAge(s)} jours que je suis là. On pourrait parler de ma situation ? »`)+
  `<div class="tmQ"><button data-a="tans" data-v="raise"><b>Augmentation</b><span>+${up} par jour, pour toujours · moral +30</span></button><button data-a="tans" data-v="prime" ${state.coins<prime?'disabled':''}><b>Prime</b><span>${prime} pièces tout de suite · moral +18</span></button><button data-a="tans" data-v="rest"><b>Jour de repos</b><span>Absent demain · moral +22</span></button><button data-a="tans" data-v="no" class="no"><b>Refuser</b><span>Rien ne change · moral −25</span></button></div>`})); }
function dayEnd(){""")
RX(" close:()=>closeModal(),",""" close:()=>closeModal(),
 tans:v=>{ const Q=state.teamQ||[], s=state.staff.find(x=>x.id===Q[0]); Q.shift(); closeModal(); if(!s) return setTimeout(teamAsk,240); const w=wageOf(s);
  if(v==='raise'){ s.rz=(s.rz||0)+1; s.mo=Math.min(100,s.mo+30); toast(s.name+' est augmenté. Son salaire passe à '+wageOf(s)+' par jour.'); }
  else if(v==='prime'){ if(state.coins<w*2) return; state.coins-=w*2; s.mo=Math.min(100,s.mo+18); toast(s.name+' empoche sa prime et repart du bon pied.'); }
  else if(v==='rest'){ s.off=dayNow(); s.mo=Math.min(100,s.mo+22); try{ buildCrew(); resetSim(); }catch(e){} toast(s.name+' prend sa journée. Il revient demain.'); }
  else { s.mo=Math.max(0,s.mo-25); toast(s.name+' encaisse le refus…'); }
  sfx(v==='no'?'bad':'coin'); hud(); setTimeout(teamAsk,240); },
 tkeep:id=>{ const s=state.staff.find(x=>x.id==id); if(!s||!s.quit||state.coins<wageOf(s)*3) return; state.coins-=wageOf(s)*3; s.quit=0; s.mo=55; sfx('coin'); toast(s.name+' reste dans l’équipe. Ouf !'); hud(); },""")
