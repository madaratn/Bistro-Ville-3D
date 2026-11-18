// ===================== LES PROJETS DU QUARTIER (v0.85) : le joueur finance la vie de sa rue, chaque projet rapporte =====================
const PROJ=[
 {k:'moulin',n:'Restaurer le vieux moulin',p:2500,u:3,fl:.02,t:'Ses ailes tournent à nouveau au-dessus des toits.',w:'r'},
 {k:'fontaine',n:'Remettre la fontaine en eau',p:4000,u:4,fl:.03,t:'L’eau jaillit sur la place, les canards reviennent.',w:'a'},
 {k:'jeux',n:'Offrir une aire de jeux',p:8000,u:6,fl:.04,t:'Balançoires, toboggan, bac à sable : les familles s’attardent.',w:'z'},
 {k:'fanfare',n:'Financer la fanfare et les fêtes de rue',p:10000,u:7,tip:.10,t:'Fanfare, course cycliste, mariages : la rue devient une fête.',w:'l'},
 {k:'manege',n:'Installer un manège sur la place',p:15000,u:8,fl:.05,t:'Les enfants tirent leurs parents jusqu’ici, et les parents ont faim.',w:'z'},
 {k:'feux',n:'Des feux d’artifice tous les soirs',p:18000,u:10,tip:.10,t:'Le soir, on vient de loin pour le spectacle.',w:'y'},
 {k:'train',n:'Rouvrir la ligne du petit train',p:28000,u:12,fl:.06,t:'Le train à vapeur repasse sur le viaduc et amène des voyageurs.',w:'y'},
 {k:'statue',n:'Une statue pour Mamie Odette',p:40000,u:14,fl:.05,tip:.10,t:'Au milieu de la place, pour que personne n’oublie qui a fait vivre ce quartier.',w:'o'}];
const projHas=k=>!!(state.proj&&state.proj[k]);
const projFlow=()=>1+PROJ.reduce((s,P)=>s+(projHas(P.k)?(P.fl||0):0),0), projTip=()=>1+PROJ.reduce((s,P)=>s+(projHas(P.k)?(P.tip||0):0),0);
const projNext=()=>PROJ.find(P=>!projHas(P.k));
function projPanel(){ const done=PROJ.filter(P=>projHas(P.k)).length;
 let h=`<p class="sub">Belmont rachète la rue ; toi, tu la fais revivre. Chaque projet se voit depuis le bistrot et te rapporte pour toujours.</p><div class="mkF"><span class="tier t${done>=PROJ.length?2:done?1:0}">${done} / ${PROJ.length} projets</span> <span>Clients +${Math.round((projFlow()-1)*100)} % · pourboires +${Math.round((projTip()-1)*100)} %</span><i><u style="width:${Math.round(100*done/PROJ.length)}%"></u></i></div>`;
 h+=PROJ.map(P=>{ const has=projHas(P.k), lock=state.level<P.u, poor=state.coins<P.p, col=(SAGA_WHO[P.w]||[0,'#c98b52'])[1], bn=[P.fl?'clients +'+Math.round(P.fl*100)+' %':'',P.tip?'pourboires +'+Math.round(P.tip*100)+' %':''].filter(Boolean).join(' · ');
  return `<div class="row mkR ${has?'pjD':''}"><div class="tmF" style="border-color:${col}">${whoImg(P.w)}</div><div class="info"><div class="t">${P.n}</div><div class="sub">${P.t}<br><b>${bn}</b></div></div>${has?'<span class="pjOk">Fait</span>':`<button class="b sm ${lock?'':'green'}" data-a="projbuy" data-v="${P.k}" ${lock||poor?'disabled':''}>${lock?'Niveau '+P.u:P.p+' 🪙'}</button>`}</div>`; }).join('');
 return {title:'Les projets du quartier',html:h}; }
