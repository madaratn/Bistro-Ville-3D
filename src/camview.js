/* ===== Caméra : changer l'angle de vue (rotation, inclinaison) =====
   Les murs situés entre la caméra et la salle s'effacent, ceux d'en face apparaissent ;
   les grands bâtiments du quartier qui boucheraient la vue s'effacent aussi. */
cam.yawT=cam.yaw; cam.pitchT=cam.pitch;
const CAM_P0=.57, CAM_PMIN=.3, CAM_PMAX=1.3;
let viewStale=true, viewSig='';
const angNorm=a=>{ while(a>Math.PI) a-=2*Math.PI; while(a<-Math.PI) a+=2*Math.PI; return a; };
function rotView(k){ if(visit.on) return; cam.yawT=Math.round((cam.yawT-Math.PI/4)/(Math.PI/2)+(k||1))*(Math.PI/2)+Math.PI/4; sfx('pop'); }
function resetView(){ cam.yawT=Math.PI/4+Math.round((cam.yaw-Math.PI/4)/(2*Math.PI))*2*Math.PI; cam.pitchT=CAM_P0; }
function viewEase(dt){ // appelé à chaque image : la caméra glisse vers l'angle demandé
 if(visit.on){ cam.yawT=clamp(cam.yawT,Math.PI/4-.7,Math.PI/4+.7); }
 cam.pitchT=clamp(cam.pitchT,CAM_PMIN,CAM_PMAX);
 const k=Math.min(1,dt*7); cam.yaw+=(cam.yawT-cam.yaw)*k; cam.pitch+=(cam.pitchT-cam.pitch)*k;
}
function viewBuildWalls(){ // murs est et sud, visibles seulement quand on regarde depuis l'autre côté
 let up=null, wa=null, cap=null;
 for(const c of staticRoot.children){ const p=c.geometry&&c.geometry.parameters; if(!p||!c.isMesh) continue; if(Math.abs(p.width-(S+WT))<.01&&p.depth===WT&&p.height>.5) up=c.material; else if(Math.abs(p.height-.48)<.001&&Math.abs(p.width-S)<.01) wa=c.material; else if(Math.abs(p.height-.05)<.001&&Math.abs(p.width-(S+WT+.02))<.01) cap=c.material; }
 if(!up||!wa) return; cap=cap||wa; const hU=WH-.48, add=(m,tag)=>{ m.userData.wall=tag; m.visible=false; staticRoot.add(m); };
 // est
 add(ownMesh(new THREE.BoxGeometry(WT,hU,S+WT),up,S+WT/2,.48+hU/2,S/2-WT/2),'E'); add(mesh(new THREE.BoxGeometry(WT+.04,.48,S),wa,S+WT/2-.02,.24,S/2),'E'); add(mesh(new THREE.BoxGeometry(WT+.04,.05,S+WT),cap,S+WT/2,WH+.02,S/2-WT/2),'E');
 for(let j=1;j<S-1;j+=2){ const w=makeWindow(); w.position.set(S-.005,.98,j+.5); w.rotation.y=-Math.PI/2; add(w,'E'); }
 // sud : des pans de mur entre les deux portes, un linteau au-dessus de chacune
 let x0=0; const runs=[]; for(let x=0;x<=S;x++){ if(x===S||x===DX||x===DXO){ if(x>x0) runs.push([x0,x]); x0=x+1; } }
 for(const [a,b] of runs){ const w=b-a, cx=(a+b)/2; add(ownMesh(new THREE.BoxGeometry(w,hU,WT),up,cx,.48+hU/2,S+WT/2),'S'); add(mesh(new THREE.BoxGeometry(w,.48,WT+.04),wa,cx,.24,S+WT/2-.02),'S'); if(w>=2){ const wn=makeWindow(); wn.position.set(cx,.98,S-.005); wn.rotation.y=Math.PI; add(wn,'S'); } }
 for(const dx of new Set([DX,DXO])) add(ownMesh(new THREE.BoxGeometry(1,WH-1.25,WT),up,dx+.5,1.25+(WH-1.25)/2,S+WT/2),'S');
 add(mesh(new THREE.BoxGeometry(S+WT*2,.05,WT+.04),cap,S/2,WH+.02,S+WT/2),'S');
}
function viewTag(){ // range chaque élément du décor : mur nord/ouest, haies, ou objet haut du quartier (avec sa direction vue de la salle)
 const box=new THREE.Box3(), c=new THREE.Vector3(), sz=new THREE.Vector3();
 const az=(o)=>{ box.getSize(sz); if(box.max.y<1.5||sz.x>14||sz.z>14) return '-'; if(c.x>-.5&&c.x<S+.5&&c.z>-.5&&c.z<S+.5) return '-'; o.userData.az=Math.atan2(c.x-S/2,c.z-S/2); o.userData.azW=Math.hypot(c.x-S/2,c.z-S/2)<S*.5+4?.95:.62; return 'a'; };
 for(const o of staticRoot.children){ if(o.userData.wall) continue; box.setFromObject(o); if(box.isEmpty()){ o.userData.wall='-'; continue; } box.getCenter(c); box.getSize(sz); let t=null;
  if(c.y>.03&&c.x>-.4&&c.x<S+.3&&c.z>-WT-.06&&c.z<.16&&sz.z<.5) t='N'; else if(c.y>.03&&c.z>-.4&&c.z<S+.3&&c.x>-WT-.06&&c.x<.16&&sz.x<.5) t='W';
  else if(c.x>-.2&&c.x<S+.2&&Math.abs(c.z-S)<.35&&box.max.y<2&&box.max.y>.2&&sz.z<.8) t='H';
  else if(c.z>-.2&&c.z<S+.2&&Math.abs(c.x-S)<.35&&box.max.y<2&&box.max.y>.2&&sz.x<.8) t='h';
  else t=az(o);
  o.userData.wall=t||'-'; }
 if(typeof cityRoot!=='undefined') for(const o of cityRoot.children){ if(o.userData.side) continue; box.setFromObject(o); if(box.isEmpty()){ o.userData.side='-'; continue; } box.getCenter(c); o.userData.side=az(o); if(o.userData.side==='a'&&c.x>S+3.3&&c.x<S+11.1&&c.z>S-7.7&&c.z<S+1.2){ o.userData.az=Math.atan2(7.2+S/2,-3.8+S/2); o.userData.azW=.62; } }
}
function viewUpdate(){
 if(viewStale){ viewStale=false; if(!staticRoot.children.some(o=>o.userData.wall==='E')) viewBuildWalls(); viewTag(); viewSig=''; }
 const sy=Math.sin(cam.yaw), cy=Math.cos(cam.yaw);
 const hN=cy<-.03, hW=sy<-.03, edM=mode==='edit', sig=Math.round(cam.yaw*40)+'|'+visit.on+'|'+edM+'|'+(typeof cityRoot!=='undefined'?cityRoot.children.length:0);
 if(sig===viewSig) return; viewSig=sig;
 const hid=o=>Math.abs(angNorm(o.userData.az-cam.yaw))<o.userData.azW;      // entre la caméra et la salle : on l'efface
 for(const o of staticRoot.children){ const t=o.userData.wall; if(!t||t==='-') continue; o.visible=t==='N'?!hN:t==='W'?!hW:t==='E'?hW:t==='S'?hN:t==='H'?(!hN&&!edM):t==='h'?(!hW&&!edM):!hid(o); }
 if(typeof cityRoot!=='undefined') for(const o of cityRoot.children){ if(!o.userData.side){ viewStale=true; continue; } if(o.userData.side==='a') o.visible=!hid(o); }
}
