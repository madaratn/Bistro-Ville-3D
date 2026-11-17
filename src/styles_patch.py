# v0.53 : styles de tables et de chaises + filtre par style dans la déco
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('styles_patch',a[:70],c); js=js.replace(a,b)
RX(" chair:{n:'Chaise en bois',cat:'Chaises',",""" tableP1:{n:'Guéridon marbre',cat:'Tables',st:'paris',p:180,d:3,u:2,kind:'table',col:'#6f747c',marble:1,leg:'ped',legc:'#2b2b30',edge:'#d9b24a'},
 tableP2:{n:'Table vichy rouge',cat:'Tables',st:'paris',p:140,d:2.5,u:2,kind:'table',col:'#9b6234',top:'vichy',ta:'#d8453a'},
 tableS1:{n:'Table bois flotté',cat:'Tables',st:'sea',p:130,d:2.5,u:2,kind:'table',col:'#d9c7a8',top:'plank',leg:'x',runner:'#3f9bd6'},
 tableS2:{n:'Table bleu lagon',cat:'Tables',st:'sea',p:160,d:3,u:3,kind:'table',col:'#4fb3c8',top:'paint',leg:'blk',legc:'#f6f3ee',legm:0},
 tableD1:{n:'Table formica rouge',cat:'Tables',st:'diner',p:170,d:3,u:3,kind:'table',col:'#e5484d',top:'paint',gloss:1,leg:'ped',legc:'#d9dde3',edge:'#d9dde3'},
 tableD2:{n:'Table damier',cat:'Tables',st:'diner',p:210,d:3.5,u:4,kind:'table',col:'#d9dde3',top:'tile',ta:'#1d1d22',tb:'#ffffff',leg:'ped',legc:'#d9dde3'},
 tableZ1:{n:'Table bambou',cat:'Tables',st:'zen',p:150,d:3,u:3,kind:'table',col:'#d8c08a',top:'plank',leg:'blk',legc:'#5a4630',legm:0,runner:'#8fae5a'},
 tableZ2:{n:'Table laque noire',cat:'Tables',st:'zen',p:260,d:4.5,u:5,kind:'table',col:'#1d1d22',top:'paint',gloss:1,leg:'low',legc:'#1d1d22',legm:0,runner:'#c8423a'},
 tableR1:{n:'Table de ferme',cat:'Tables',st:'rustic',p:140,d:2.5,u:2,kind:'table',col:'#8a5a30',top:'plank',leg:'blk'},
 tableR2:{n:'Table vichy vert',cat:'Tables',st:'rustic',p:170,d:3,u:3,kind:'table',col:'#7a5230',top:'vichy',ta:'#4f9a54',leg:'x'},
 tableI1:{n:'Table acier',cat:'Tables',st:'indus',p:190,d:3.5,u:4,kind:'table',col:'#8f979f',top:'metal',leg:'pin',legc:'#2b2b30'},
 tableI2:{n:'Table bois et métal',cat:'Tables',st:'indus',p:230,d:4,u:5,kind:'table',col:'#7a5230',top:'plank',leg:'pin',legc:'#2b2b30',edge:'#2b2b30'},
 tableG1:{n:'Table pliante verte',cat:'Tables',st:'garden',p:110,d:2,u:2,kind:'table',col:'#3f8f5a',top:'paint',leg:'x',legc:'#3f8f5a'},
 tableG2:{n:'Table mosaïque',cat:'Tables',st:'garden',p:200,d:3.5,u:4,kind:'table',col:'#2b2b30',top:'tile',ta:'#3f9bd6',tb:'#f6f3ee',leg:'ped',legc:'#2b2b30'},
 tableL1:{n:'Table ivoire et or',cat:'Tables',st:'lux',p:420,d:6,u:7,kind:'table',col:'#7a5a3a',cloth:'#f6efdc',runner:'#d9b24a',leg:'ped',legc:'#d9b24a'},
 tableL2:{n:'Table verre et laiton',cat:'Tables',st:'lux',p:520,d:7,u:8,kind:'table',col:'#d9b24a',top:'glass',leg:'ped',legc:'#d9b24a',edge:'#d9b24a'},
 chairP1:{n:'Chaise bistrot rotin',cat:'Chaises',st:'paris',p:80,d:1.2,u:2,kind:'chair',col:'#c79a52',acc:'#7a2233',cs:'bistro'},
 chairP2:{n:'Chaise Thonet noire',cat:'Chaises',st:'paris',p:95,d:1.5,u:3,kind:'chair',col:'#3a2a1f',acc:'#1d1d22',cs:'thonet'},
 chairS1:{n:'Chaise de plage',cat:'Chaises',st:'sea',p:70,d:1,u:2,kind:'chair',col:'#f6f3ee',acc:'#3f9bd6',cs:'deck'},
 chairS2:{n:'Fauteuil osier',cat:'Chaises',st:'sea',p:140,d:2,u:4,kind:'chair',col:'#d9b98a',acc:'#ffffff',cs:'wicker'},
 chairD1:{n:'Chaise diner rouge',cat:'Chaises',st:'diner',p:90,d:1.5,u:3,kind:'chair',col:'#e5484d',cs:'diner'},
 chairD2:{n:'Tabouret chromé',cat:'Chaises',st:'diner',p:75,d:1.2,u:3,kind:'chair',col:'#3fbfd0',cs:'stool'},
 chairZ1:{n:'Assise zaisu',cat:'Chaises',st:'zen',p:85,d:1.5,u:3,kind:'chair',col:'#c8423a',cs:'zen'},
 chairZ2:{n:'Tabouret bambou',cat:'Chaises',st:'zen',p:70,d:1.2,u:3,kind:'chair',col:'#d8c08a',acc:'#5a4630',cs:'stool'},
 chairR1:{n:'Chaise paillée',cat:'Chaises',st:'rustic',p:75,d:1.2,u:2,kind:'chair',col:'#8a5a30',acc:'#e3c98a',cs:'ladder'},
 chairR2:{n:'Rondin',cat:'Chaises',st:'rustic',p:60,d:1,u:2,kind:'chair',col:'#7a5230',cs:'log'},
 chairI1:{n:'Chaise métal gris',cat:'Chaises',st:'indus',p:95,d:1.5,u:4,kind:'chair',col:'#4a5560',cs:'tolix'},
 chairI2:{n:'Chaise métal jaune',cat:'Chaises',st:'indus',p:95,d:1.5,u:4,kind:'chair',col:'#f2b33d',cs:'tolix'},
 chairG1:{n:'Chaise pliante verte',cat:'Chaises',st:'garden',p:65,d:1,u:2,kind:'chair',col:'#3f8f5a',acc:'#3f8f5a',cs:'fold'},
 chairG2:{n:'Chaise pliante bois',cat:'Chaises',st:'garden',p:65,d:1,u:2,kind:'chair',col:'#2b2b30',acc:'#c98b52',cs:'fold'},
 chairL1:{n:'Chaise médaillon',cat:'Chaises',st:'lux',p:220,d:3,u:7,kind:'chair',col:'#e9dcc0',acc:'#d9b24a',cs:'royal'},
 chairL2:{n:'Fauteuil émeraude',cat:'Chaises',st:'lux',p:260,d:3.5,u:8,kind:'chair',col:'#1f6a55',big:1},
 chair:{n:'Chaise en bois',cat:'Chaises',""")
RX("function editUI(){","""const ESTYLES=[['all','Tous'],['classic','Classique'],['paris','Parisien'],['sea','Bord de mer'],['diner','Rétro diner'],['zen','Japonais'],['rustic','Chalet'],['indus','Industriel'],['garden','Guinguette'],['lux','Palace']];
let estyle='all';
function editUI(){ { let r=$('#estyle'); if(!r){ r=document.createElement('div'); r.id='estyle'; $('#eitems').before(r); r.addEventListener('click',e=>{ const b=e.target.closest('[data-es]'); if(!b) return; audioInit(); estyle=b.dataset.es; sfx('pop'); editUI(); $('#eitems').scrollLeft=0; }); }
  const on=etab==='Tables'||etab==='Chaises'; r.style.display=on?'':'none'; if(on) r.innerHTML=ESTYLES.map(([k,n])=>`<button data-es="${k}" class="${estyle===k?'on':''}">${n}</button>`).join(''); }""")
RX(" return Object.keys(FURN).filter(k=>FURN[k].cat===etab).map(cardHTML).join('');"," return Object.keys(FURN).filter(k=>FURN[k].cat===etab&&(estyle==='all'||!['Tables','Chaises'].includes(etab)||(FURN[k].st||'classic')===estyle)).map(cardHTML).join('');")
