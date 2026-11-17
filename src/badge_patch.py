# v0.63 : pastilles chiffrées sur les boutons — combien de choses il y a à faire dans chaque menu
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('badge_patch',a[:70],c); js=js.replace(a,b)
RX("function hud(){","""function todo(){ const now=Date.now(), T={menu:0,staff:0,garden:0,quiz:0,daily:0,story:0,exc:0};
 try{ for(const id of state.menu){ const d=DISHM[id], L=lvl(id); if(d&&L<10&&d.ing.every(k=>(state.inv[k]||0)>=L)) T.menu++; }
  if(state.menu.length<menuSlots()&&DISH.some(d=>d.u<=state.level&&!state.menu.includes(d.id))) T.menu++;
  if(state.staff.length<maxStaff()&&state.coins>=TIERS[0].fee) T.staff=1;
  T.garden=state.garden.filter(p=>p&&(now-p.at)/1e3>=ING[p.k].g.t).length; const seeds=Object.values(ING).filter(i=>i.g&&i.g.u<=state.level&&i.g.c<=state.coins); if(seeds.length) T.garden+=state.garden.filter(p=>!p).length;
  T.quiz=Math.max(0,quizLeft()); T.daily=dailyReady(); T.story=state.story&&state.story.v&&storyReady()?1:0; T.exc=EXQ.filter(q=>xqReady(q)>0).length; }catch(e){}
 T.more=T.garden+T.quiz+T.daily+T.story+T.exc; return T; }
function badgeUpd(){ const T=todo(); for(const [q,n] of [['#bottom [data-open="menu"]',T.menu],['#bottom [data-open="staff"]',T.staff],['#bMore',T.more]]){ const b=document.querySelector(q); if(!b) continue; let e=b.querySelector('.bdg'); if(!e){ e=document.createElement('i'); e.className='bdg'; b.appendChild(e); }
  if(e._n!==n){ e._n=n; e.textContent=n>9?'9+':n; e.classList.toggle('hide',!n); if(n){ e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); } } } }
function hud(){""")
RX("$('#qDot').classList.toggle('hide',quizLeft()<=0);","$('#qDot').classList.toggle('hide',quizLeft()<=0); badgeUpd();")
RX("${(m[0]==='garden'&&gd)||(m[0]==='quiz'&&qd)||(m[0]==='daily'&&dailyReady())||(m[0]==='story'&&storyReady())?'<em>!</em>':''}","${TD[m[0]]?'<em>'+(TD[m[0]]>9?'9+':TD[m[0]])+'</em>':''}")
RX("return {title:'Plus',html:'<div class=\"moreG\">'+MORE.map(","const ord=['garden','daily','story','quiz','exc','shows','shop','gestion','tuto','quit']; MORE.sort((a,b)=>ord.indexOf(a[0])-ord.indexOf(b[0])); const TD=todo(); return {title:'Plus',html:'<div class=\"moreG\">'+MORE.map(")
