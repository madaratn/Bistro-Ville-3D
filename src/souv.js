// ===================== LE VAISSELIER D'ODETTE (v0.93) : chaque chapitre terminé y ajoute un souvenir =====================
const SOUV=[
 ['key','#e2b13c','Le trousseau d’Odette','Quarante ans dans la même poche de tablier. La grosse clé, c’est la cave.'],
 ['ring','#cfd5db','Le rond de serviette d’Albert','Gravé « A. ». Il a sa table, il a son rond de serviette. C’est comme ça.'],
 ['basket','#b9854a','La panière de Lucien','Elle arrive pleine à six heures et repart vide à midi.'],
 ['jar','#d8452f','Les tomates de Rosa','Un bocal de l’été dernier. « Tu me rendras le bocal », a dit Rosa.'],
 ['bell','#e2b13c','La cloche du comptoir','Un coup : c’est prêt. Deux coups : ça refroidit !'],
 ['boat','#2f6fa8','Le chalutier du Capitaine','Une maquette faite au couteau, un hiver sans pêche.'],
 ['frame','#3f8a5a','La première pièce encaissée','Encadrée, pour se souvenir que tout a commencé par une seule.'],
 ['mould','#c9772e','Le moule à brioche','Cabossé d’un côté. La brioche aussi, et personne ne s’en plaint.'],
 ['frame','#c8423a','La pétition du quartier','Toutes les signatures de la rue, et même une patte de chat.'],
 ['pot','#b5562a','La marmite du pot-au-feu','Elle a nourri trois générations et elle n’a pas fini.'],
 ['basket','#5f9a4a','La cagette du marché','Sauvée de la place, avec les légumes du jour dedans.'],
 ['lantern','#2f6fa8','La lanterne du port','Elle est restée allumée toute la nuit de la tempête.'],
 ['frame','#b08a5a','La photo jaunie','Le bistrot, bien avant. On reconnaît le comptoir, et un sourire.'],
 ['pan','#c9772e','La casserole à sauce','En cuivre, étamée dix fois. La sauce au vin s’en souvient.'],
 ['frame','#3a3f47','L’article de Mme Fourchette','Découpé dans le journal. Lis-le quand tu doutes.'],
 ['frame','#f2a81d','Le dessin de Zoé','Le bistrot au feutre, avec un soleil dans le coin et toi à la porte.'],
 ['toque','#ffffff','La toque de la brigade','Celle qu’on ne quitte pas pour un meilleur salaire.'],
 ['box','#5a7fb0','La boîte à recettes','Des fiches tachées de beurre. Les meilleures sont les plus sales.'],
 ['lantern','#e5484d','Le lampion de la fête','Il a pendu au-dessus de la plus longue table de la rue.'],
 ['frame','#57b86a','Le certificat de la cuisine','Propre comme un sou neuf. Signé, tamponné, affiché.'],
 ['box','#8a8f96','La boîte en fer d’Odette','Elle sent encore le biscuit. Dedans, il y avait une demi-page.'],
 ['frame','#d4a53a','La lettre à en-tête doré','Un défi, ça se garde. Surtout celui-là.'],
 ['mill','#7a4a2a','Le moulin à poivre','Trois tours, pas un de plus. Odette compte encore à voix haute.'],
 ['pot','#4f8a8a','La théière de la brigade','Tout le quartier a bu dedans la semaine du duel.'],
 ['candle','#fff1d0','La bougie de la veille','Allumée quand on a frappé au carreau. On ne l’a pas soufflée.'],
 ['cup','#e2b13c','La coupe du duel','Deux cuisines, une rue. Elle est un peu à tout le monde.'],
 ['book','#9c3b34','Le carnet relié','Toutes les pages, enfin ensemble, recousues au fil de cuisine.'],
 ['pot','#fbf7ee','La soupière du dimanche','Assez grande pour la rue entière. On a vérifié.']];
const souvN=()=>Math.min(SOUV.length,(state&&state.story&&state.story.pages)||0);
const souvPlaced=()=>state.furn.some(f=>f.t==='odette');
const souvTip=()=>souvPlaced()?1+.02*souvN():1;
// ---------- le meuble et ses 28 objets ----------
function souvObj(g,type,col,x,y,z){ const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), o=new THREE.Group(); o.position.set(x,y,z); g.add(o);
 const A=(geo,mat,px=0,py=0,pz=0)=>{ const m=mesh(geo,mat,px,py,pz,false); o.add(m); return m; };
 const c=M(col,{roughness:.5}), gold=M('#e2b13c',{metalness:.8,roughness:.3}), dark=M('#3a2a1f',{roughness:.6}), cream=M('#fbf3e2',{roughness:.7});
 switch(type){
 case 'key':{ const r=A(TO(.03,.008),gold,0,.07,0); A(B(.012,.07,.012),gold,-.015,.035,0).rotation.z=.3; A(B(.012,.06,.012),M('#b9bec5',{metalness:.8,roughness:.3}),.02,.035,0).rotation.z=-.35; break; }
 case 'ring':{ const r=A(TO(.032,.014),M(col,{metalness:.85,roughness:.25}),0,.018,0); r.rotation.x=Math.PI/2; A(CY(.02,.02,.07,10),cream,0,.045,0).rotation.z=.25; break; }
 case 'basket':{ A(CY(.05,.038,.05,12),c,0,.025,0); for(const [px,pz,k] of [[-.02,0,'#e8c078'],[.02,.01,'#d9a65a'],[0,-.015,col==='#5f9a4a'?'#e5642e':'#c98a45']]) A(SP(.022,8,6),M(col==='#5f9a4a'&&px<0?'#57b86a':k,{roughness:.8}),px,.06,pz); break; }
 case 'jar':{ A(CY(.034,.034,.075,12),M(col,{roughness:.25}),0,.038,0); A(CY(.036,.036,.085,12),M('#e8f6ff',{transparent:true,opacity:.35,roughness:.05}),0,.043,0); A(CY(.03,.03,.014,12),gold,0,.092,0); break; }
 case 'bell':{ A(SP(.04,14,10),gold,0,.04,0).scale.set(1,1.15,1); A(CY(.05,.05,.008,14),dark,0,.004,0); A(SP(.012,8,6),gold,0,.092,0); break; }
 case 'boat':{ A(B(.1,.022,.035),c,0,.02,0); A(B(.07,.012,.03),cream,0,.037,0); A(B(.006,.075,.006),dark,0,.075,0); const s=A(B(.045,.05,.004),cream,.024,.08,0); s.scale.set(1,1,1); s.rotation.z=.0; A(B(.1,.008,.04),dark,0,.005,0); break; }
 case 'frame':{ const f=A(B(.092,.1,.012),gold.color.getHexString()===col.slice(1)?gold:M('#6b4a2a',{roughness:.5}),0,.052,0); const p=A(B(.074,.082,.014),cream,0,.052,.001); A(B(.05,.03,.016),c,0,.062,.002); A(B(.05,.006,.016),M('#8a7a66'),0,.034,.002); A(B(.036,.006,.016),M('#8a7a66'),-.007,.022,.002); o.rotation.x=-.12; break; }
 case 'mould':{ A(CY(.05,.03,.045,10),M(col,{metalness:.7,roughness:.35}),0,.023,0); A(CY(.042,.042,.006,10),M('#e9b46a',{roughness:.8}),0,.046,0); break; }
 case 'pot':{ A(CY(.046,.04,.06,14),c,0,.03,0); A(CY(.049,.049,.01,14),c,0,.064,0); A(SP(.012,8,6),col==='#fbf7ee'?gold:dark,0,.076,0); for(const sx of [-.052,.052]) A(B(.016,.008,.02),col==='#fbf7ee'?gold:dark,sx,.045,0); if(col==='#fbf7ee') A(CY(.047,.047,.006,14),M('#3f7fbf'),0,.04,0); break; }
 case 'lantern':{ A(B(.05,.008,.05),dark,0,.004,0); A(B(.04,.06,.04),M('#fff1c8',{emissive:'#ffc060',emissiveIntensity:.9,roughness:.8}),0,.038,0); for(const [px,pz] of [[-.022,-.022],[.022,-.022],[-.022,.022],[.022,.022]]) A(B(.006,.06,.006),c,px,.038,pz); A(B(.052,.01,.052),c,0,.073,0); A(TO(.014,.004),dark,0,.09,0); break; }
 case 'pan':{ A(CY(.042,.036,.04,14),M(col,{metalness:.8,roughness:.28}),0,.02,0); A(CY(.037,.037,.004,14),M('#7a2a22',{roughness:.6}),0,.039,0); const h=A(B(.06,.008,.012),dark,.068,.034,0); h.rotation.z=.18; break; }
 case 'toque':{ A(CY(.032,.032,.05,14),cream,0,.025,0); A(SP(.042,12,8),M('#ffffff',{roughness:.8}),0,.068,0).scale.set(1,.7,1); break; }
 case 'box':{ A(RB(.086,.05,.056,.008),c,0,.025,0); A(B(.088,.008,.058),M(shade(col,-.25),{roughness:.5}),0,.046,0); A(B(.02,.014,.004),gold,0,.03,.029); break; }
 case 'mill':{ A(CY(.022,.03,.07,12),c,0,.035,0); A(CY(.026,.022,.02,12),M(shade(col,-.2)),0,.08,0); A(SP(.012,8,6),gold,0,.098,0); break; }
 case 'candle':{ A(CY(.034,.04,.012,12),gold,0,.006,0); A(CY(.016,.016,.07,10),c,0,.047,0); A(SP(.012,8,6),M('#ffd27a',{emissive:'#ff9a2e',emissiveIntensity:1.4}),0,.094,0).scale.set(.8,1.5,.8); break; }
 case 'cup':{ A(CY(.03,.03,.01,12),dark,0,.005,0); A(CY(.008,.012,.035,8),gold,0,.027,0); A(CY(.04,.014,.05,14),gold,0,.07,0); for(const sx of [-.044,.044]) A(TO(.014,.004),gold,sx,.074,0); break; }
 case 'book':{ A(B(.07,.1,.024),c,0,.05,0); A(B(.062,.094,.026),cream,.004,.05,0); A(B(.072,.102,.006),c,0,.05,.012); A(B(.04,.012,.008),gold,0,.07,.014); o.rotation.x=-.1; break; }
 } return o; }
function souvBuild(g,ud){ const n=souvN(), wood=M('#7a4a2a',{roughness:.55}), dk=M('#5a3520',{roughness:.6}), back=M('#f6ead0',{roughness:.85}), brass=M('#e2b13c',{metalness:.8,roughness:.3}), B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), Z=-.2;
 g.add(mesh(RB(.94,.5,.42,.02),wood,0,.25,Z+.03));                                   // le bas : deux portes
 for(const x of [-.225,.225]){ g.add(mesh(RB(.4,.36,.02,.01),dk,x,.25,Z+.245,false)); g.add(mesh(RB(.32,.28,.022,.01),wood,x,.25,Z+.25,false)); g.add(mesh(SP(.016,8,6),brass,x+(x<0?.15:-.15),.27,Z+.27,false)); }
 g.add(mesh(RB(.98,.035,.46,.012),dk,0,.515,Z+.03));                                 // le plateau
 g.add(mesh(B(.9,.98,.03),back,0,1.02,Z-.15,false));                                  // le fond clair, pour que les objets se voient
 for(const x of [-.455,.455]) g.add(mesh(B(.035,.98,.2),wood,x,1.02,Z-.07));
 const ys=[.535,.79,1.03,1.27]; for(let r=1;r<4;r++) g.add(mesh(B(.9,.022,.2),wood,0,ys[r]-.011,Z-.07,false));
 g.add(mesh(RB(1,.07,.26,.02),dk,0,1.535,Z-.06)); g.add(mesh(RB(.3,.09,.03,.012),brass,0,1.6,Z-.02,false));   // la corniche et sa plaque
 const objs=[]; for(let i=0;i<n;i++){ const S=SOUV[i], r=Math.floor(i/7), c=i%7; objs.push(souvObj(g,S[0],S[1],-.36+c*.12,ys[3-r],Z-.06+(r===3?.08:0))); }
 for(const o of objs) o.scale.setScalar(1.12);
 ud.souvLast=objs[n-1]||null; ud.anim=(T)=>{ const o=ud.souvLast; if(o){ const k=1.12*(1+.1*Math.max(0,Math.sin(T*2.4))); o.scale.setScalar(k); } };
 if(!n){ const c=mesh(new THREE.BoxGeometry(.2,.012,.14),M('#fbf3e2'),0,.541,Z+.02,false); c.rotation.y=.2; g.add(c); } }
// ---------- le don du vaisselier, et sa place dans la salle ----------
function souvPlace(){ const c=[]; for(let y=0;y<S;y++) for(let x=0;x<S;x++){ try{ if(canPlace(x,y,null,'odette')&&!inKitchen(x,y)) c.push([x,y]); }catch(e){} }
 c.sort((a,b)=>Math.min(a[0],a[1])-Math.min(b[0],b[1])||(a[0]+a[1])-(b[0]+b[1]));
 for(const [x,y] of c.slice(0,60)){ const f={id:state.nid++,t:'odette',x,y}; state.furn.push(f); rebuildOcc(); let ok=false; try{ ok=layoutOK()&&!diningBad(); }catch(e){} if(ok) return f; state.furn.pop(); state.nid--; rebuildOcc(); } return null; }
function souvCheck(){ const st=state.story; if(!st||!st.v||warming||mode!=='play') return; if(state.souv||souvPlaced()||(state.store.odette||0)>0){ state.souv=1; return; }
 if(!souvN()) return; state.souv=1; const f=souvPlace(); if(!f) state.store.odette=1; else { try{ popAt.set(f.id,performance.now()); }catch(e){} }
 queueModal(()=>({title:'Le vaisselier d’Odette',html:`<div class="souvH">${souvSvg()}</div><p class="center"><b>Mamie Odette te confie son vieux vaisselier.</b></p><p class="center">À chaque chapitre terminé, un souvenir du quartier vient s’y poser. Tu en as déjà <b>${souvN()}</b>. Chaque souvenir donne <b>+2 % de pourboires</b> tant que le meuble est dans la salle.</p><p class="center sub">${f?'Il est installé dans ta salle. Tu peux le déplacer en mode Déco, et le toucher pour relire tes souvenirs.':'Il t’attend dans ta réserve : ouvre la Déco pour le placer.'}</p><p class="center"><button class="b" data-a="souvopen">Voir les souvenirs</button></p>`})); save(); }
function souvGain(ch){ const S=SOUV[ch]; if(!S) return; const f=state.furn.find(f=>f.t==='odette'); if(f){ try{ popAt.set(f.id,performance.now()+400); }catch(e){} }
 queueModal(()=>({title:'Un souvenir de plus',html:`<div class="souvH">${souvSvg()}</div><div class="carBig"><div class="carBn">Souvenir ${ch+1} sur ${SOUV.length}</div><b>${S[2]}</b><p>${S[3]}</p></div><p class="center">${souvPlaced()?'Il vient de se poser dans le vaisselier d’Odette. Tes pourboires passent à <b>+'+2*(ch+1)+' %</b>.':'Il t’attend dans le vaisselier d’Odette : place le meuble dans ta salle (Déco) pour le voir, et pour toucher ses <b>+'+2*(ch+1)+' %</b> de pourboires.'}</p><p class="center"><button class="b" data-a="close">Continuer</button></p>`})); }
function souvSvg(){ return '<svg viewBox="0 0 64 64" width="84" height="84"><rect x="8" y="34" width="48" height="24" rx="3" fill="#7a4a2a"/><rect x="11" y="38" width="19" height="17" rx="2" fill="#8f5a35"/><rect x="34" y="38" width="19" height="17" rx="2" fill="#8f5a35"/><circle cx="27" cy="46" r="1.600" fill="#e2b13c"/><circle cx="37" cy="46" r="1.600" fill="#e2b13c"/><rect x="6" y="31" width="52" height="4" rx="2" fill="#5a3520"/><rect x="10" y="6" width="44" height="26" fill="#f6ead0"/><rect x="8" y="4" width="4" height="28" fill="#7a4a2a"/><rect x="52" y="4" width="4" height="28" fill="#7a4a2a"/><rect x="6" y="2" width="52" height="5" rx="2" fill="#5a3520"/><rect x="10" y="18" width="44" height="2" fill="#7a4a2a"/><circle cx="18" cy="14" r="3.500" fill="#e2b13c"/><rect x="26" y="10" width="6" height="8" rx="1" fill="#d8452f"/><rect x="37" y="9" width="8" height="9" fill="#3f8a5a"/><rect x="15" y="24" width="9" height="7" rx="2" fill="#b5562a"/><rect x="30" y="23" width="5" height="8" fill="#9c3b34"/><path d="M40 31l4-8 4 8z" fill="#2f6fa8"/></svg>'; }
