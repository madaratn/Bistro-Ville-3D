// ===================== LES VOISINS À TABLE (v0.94) : les personnages de l'histoire viennent manger, à leur heure =====================
const NB={
 a:{n:'Monsieur Albert',s:'Albert',after:2,h:12,fav:'omelette',g:['xp',15],in:'Monsieur Albert pousse la porte. Midi pile, comme toujours.',
  up:['Vous savez, jeune homme, je venais ici avant votre naissance. Eh bien… je reviendrai.','Odette me gardait toujours la table près de la fenêtre. Vous aussi, on dirait.','J’ai dit à tout le quartier que la maison était bien tenue. Ne me faites pas mentir.']},
 l:{n:'Lucien',s:'Lucien',after:3,h:14.5,fav:'burger',g:['ing','ble',2],in:'Lucien arrive, de la farine jusqu’aux coudes : sa fournée est finie.',
  up:['Moi je nourris les gens à six heures, toi à midi. On fait équipe, non ?','Tiens, je t’ai mis de côté ma meilleure farine. Ne le dis pas aux autres.','Tant que mon four chauffe, ton pain ne manquera pas. Parole de boulanger.']},
 r:{n:'Rosa',s:'Rosa',after:4,h:13.5,fav:'salade',g:['ing','tomate',2],in:'Rosa a remballé son étal. Elle vient voir ce que tu fais de ses légumes.',
  up:['Hm. Tu ne les as pas trop cuits. C’est déjà ça.','Bon. Je t’apporte mes plus belles tomates, mais tu me gardes une assiette.','Tu cuisines mes légumes comme Odette. Voilà, c’est dit, je ne le répéterai pas.']},
 y:{n:'Capitaine Yann',s:'le Capitaine',after:6,h:19,fav:'soupe',g:['ing','poisson',2],in:'Le Capitaine accroche sa casquette. La marée est rentrée, lui aussi.',
  up:['Un bon repas à terre, ça vaut trois jours de beau temps.','Je t’ai gardé la plus belle pièce de la criée. Entre nous, moussaillon.','Tant que mon bateau flotte, ta cuisine aura du poisson frais.']},
 p:{n:'M. Pinson',s:'M. Pinson',after:7,h:12.5,fav:'steak',g:['coin',60],in:'M. Pinson s’assoit, pose son carnet… et commande. Cette fois, il vient déjeuner.',
  up:['Je note : établissement sérieux. Et la sauce, entre nous, est remarquable.','La banque ne mange pas ici. Moi, si. Voici de quoi arrondir l’échéance.','Je n’ai jamais vu un dossier se redresser comme le vôtre. Ni un steak pareil.']},
 j:{n:'Inès',s:'Inès',after:9,h:9.5,fav:'croissant',g:['sat',2],in:'Inès, de la Gazette, s’installe avec son calepin pour le petit-déjeuner.',
  up:['Je mets trois lignes sur toi dans la Gazette de demain. Des gentilles.','Les lecteurs demandent ton adresse. Je la leur donne, tant pis pour toi.','Si un jour j’écris un livre sur ce quartier, il commencera à cette table.']},
 c:{n:'Mme Fourchette',s:'Mme Fourchette',after:15,h:20,fav:'poulet',g:['sat',3],in:'Mme Fourchette entre. Elle ne vient pas juger, ce soir : elle vient dîner.',
  up:['Je ne reviens jamais deux fois. Disons que ceci est une exception.','Une critique ne devrait pas avoir de table préférée. J’en ai une.','Vous cuisinez comme on raconte une histoire. Continuez la vôtre.']},
 z:{n:'Zoé',s:'Zoé',after:16,h:16.5,fav:'crepe',kid:1,g:['en',3],in:'Zoé sort de l’école et vient goûter, son cartable sur le dos.',
  up:['Je t’ai fait un dessin ! C’est toi, là, avec la grande toque.','Quand je serai grande, je travaillerai ici. Tu me gardes une place ?','Maman dit que c’est le meilleur goûter du quartier. Moi je dis du monde.']},
 o:{n:'Mamie Odette',s:'Mamie Odette',after:23,h:15.5,fav:'tarte',g:['en',5],in:'Mamie Odette s’assoit dans la salle. De l’autre côté du comptoir, pour une fois.',
  up:['C’est étrange d’être servie ici. Étrange, et très doux.','Ne change rien, mon grand. Ou plutôt si : change tout ce que tu veux, c’est chez toi.','Quarante ans que j’attendais de manger ici tranquille. Merci.']},
 b:{n:'Victor Belmont',s:'Victor',after:28,h:21,fav:'pates',g:['coin',300],in:'Victor Belmont entre, sans son costume. Il a demandé une table comme tout le monde.',
  up:['Je ne suis pas venu comparer. Je suis venu manger. C’est nouveau, pour moi.','Odette avait raison pour l’échalote. Et toi, tu as raison pour le reste.','Garde-moi une table le dimanche. Je ferai la plonge le lundi.']}};
const NB_T=[3,8,16], NB_MAX=4;
function nbS(){ const n=dayOf().n; if(!state.nb) state.nb={v:{},d:0,done:{}}; if(state.nb.d!==n){ state.nb.d=n; state.nb.done={}; } return state.nb; }
const nbV=k=>(state.nb&&state.nb.v[k])||{p:0,c:0}, nbHearts=k=>{ const p=nbV(k).p; return p>=NB_T[2]?3:p>=NB_T[1]?2:p>=NB_T[0]?1:0; };
const nbOpen=()=>{ const pg=(state.story&&state.story.pages)||0; return Object.keys(NB).filter(k=>pg>=NB[k].after); };
function nbToday(){ let L=nbOpen(); if(L.length>NB_MAX){ const r=seeded(dayOf().n*131+7); L=L.map(k=>[r(),k]).sort((a,b)=>a[0]-b[0]).slice(0,NB_MAX).map(x=>x[1]); } return L.sort((a,b)=>NB[a].h-NB[b].h); }
const nbHour=h=>Math.floor(h)+' h'+(h%1?' 30':'');
let nbLast=-99;
function nbTick(){ if(warming||!state.story||!state.tuto||tutS||mode!=='play'||dayOf().night) return; const gt=dayOf().t||0; if(Math.abs(gt-nbLast)<6) return; nbLast=gt; const st=nbS(), h=gameHour();   // cadencé sur le temps du jeu : pareil en ×1 et en ×3
 for(const c of custs) if(c.nb&&!c.dead&&c.sitting&&Math.random()<.75) floatAt(c.fx,c.fy-.75,'♥ '+NB[c.nb].s,'#c8553d');
 for(const k of nbToday()){ if(st.done[k]) continue; const N=NB[k]; if(h<N.h) continue; if(h>N.h+1.5){ st.done[k]=3; continue; }
  if(!isOpen()||rush||cine||(typeof visit!=='undefined'&&visit.on)) continue; const W=WHO_LOOK[k]; if(!W) { st.done[k]=3; continue; }
  const id=uid++, ok=spawnCust(false,{sx:Math.random()<.5?0:S-1,looks:[Object.assign(randLook(),{fit:W.outfit})],ids:[id],kids:[!!N.kid]}); if(!ok) return;
  const c=custs.find(c=>c.id===id); if(c){ c.nb=k; c.pat=100; } st.done[k]=1; toast(N.in); sfx('pop'); return; } }
function nbMeal(c,d,price,sat){ const k=c.nb, N=NB[k]; if(!N||warming) return; const st=nbS(), v=st.v[k]||(st.v[k]={p:0,c:0}); st.done[k]=2;
 if(sat<50){ toast(N.n+' repart sans sourire. Soigne mieux la prochaine visite.'); return; }
 const favOn=state.menu.includes(N.fav), h0=nbHearts(k), bonus=Math.max(10+state.level*4,Math.round(price*(favOn?2:1))); v.c++; v.p+=favOn?2:1; earn(bonus); dayAdd('tip',bonus);
 const g=N.g; let gt='', extra=0; if(g[0]==='xp'){ addXP(g[1]); gt='+'+g[1]+' XP'; } else if(g[0]==='ing'&&ING[g[1]]){ state.inv[g[1]]=(state.inv[g[1]]||0)+g[2]; gt='+'+g[2]+' '+ING[g[1]].n; } else if(g[0]==='coin'){ earn(g[1]); extra=g[1]; } else if(g[0]==='sat'){ for(let i=0;i<g[1];i++) addSat(100); gt='ta réputation monte'; } else if(g[0]==='en'){ energyTick(); state.en.v=Math.min(EN_MAX,state.en.v+g[1]); gt='+'+g[1]+' énergie'; }
 floatAt(c.fx,c.fy-.7,N.s+' ♥ +'+(bonus+extra),null,true); sparkle(c.fx,c.fy,10,'#ff8fb0'); sfx('coin');
 const h=nbHearts(k);
 if(h>h0){ const rw=[150,400,1000][h-1]; earn(rw); if(typeof MK!=='undefined'&&MK[k]){ const F=state.fr||(state.fr={}); F[k]=(F[k]||0)+3; }
  say([[k,N.up[h-1]]],N.n+' · '+'♥'.repeat(h)); queueModal(()=>({title:h===3?'Un ami pour la vie':'Un voisin fidèle',html:`<div class="nbBig"><img src="${foodThumbs['who:'+k]||''}" alt=""><b>${N.n}</b><em>${'♥'.repeat(h)}<u>${'♥'.repeat(3-h)}</u></em></div><p class="center">+${rw} pièces${typeof MK!=='undefined'&&MK[k]?' · ses prix baissent au marché':''}</p><p class="center sub">${h<3?'Encore quelques bons repas et vous serez inséparables.':'Une table l’attend chez toi, pour toujours.'}</p><p class="center"><button class="b" data-a="close">Continuer</button></p>`})); }
 else toast(N.n+' a adoré'+(favOn?' (son plat préféré est à ta carte)':'')+' : +'+(bonus+extra)+' pièces'+(gt?', '+gt:'')+'.'); save(); hud(); }
function nbHTML(){ if(!state.story) return ''; const st=nbS(), op=nbOpen(), td=nbToday(), pg=state.story.pages||0, h=gameHour(), nx=Object.keys(NB).filter(k=>pg<NB[k].after).sort((a,b)=>NB[a].after-NB[b].after)[0];
 let html='<h3>Les voisins du quartier</h3><p class="center sub">Ils viennent manger à leur heure, une fois leur chapitre terminé. Sers-les bien : ils laissent un gros pourboire, un petit cadeau, et deviennent des amis. Leur plat préféré à la carte compte double.</p><div class="rgG">';
 html+=op.map(k=>{ const N=NB[k], v=nbV(k), hh=nbHearts(k), d=st.done[k], on=td.includes(k), sta=d===2?'Venu aujourd’hui':d===1?'À table en ce moment':d===3?'Pas pu venir aujourd’hui':!on?'Ne passe pas aujourd’hui':'Attendu vers '+nbHour(N.h);
  return `<div class="rgC nbC" style="--rc:${SAGA_WHO[k][1]}"><span class="rgP"><img src="${foodThumbs['who:'+k]||''}" alt=""></span><b>${N.n}</b><em>${'♥'.repeat(hh)}<u>${'♥'.repeat(3-hh)}</u></em><small class="${d===1?'nbOn':''}">${sta}</small><small class="rgF">Adore : ${DISHM[N.fav]?DISHM[N.fav].n:''}${state.menu.includes(N.fav)?'':' (pas à la carte)'}</small><small>${v.c} repas chez toi</small></div>`; }).join('');
 if(nx) html+=`<div class="rgC lock"><span class="rgP">?</span><b>Un voisin de plus</b><small>À rencontrer après le chapitre ${NB[nx].after}.</small></div>`;
 return html+'</div><h3>Les habitués</h3>'; }

// annonce du nouveau voisin dans la fenêtre de fin de chapitre
function nbNewHTML(ch){ const k=Object.keys(NB).find(k=>NB[k].after===ch+1); return k?'<p class="nbNew"><img src="'+(foodThumbs['who:'+k]||'')+'" alt=""><span><b>'+NB[k].n+'</b> viendra désormais manger chez toi, vers '+nbHour(NB[k].h)+'.</span></p>':''; }
