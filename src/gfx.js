// ===================== RENDU MODERNE (v0.78) : lueurs, profondeur de champ « maquette », étalonnage, ombres qui suivent la vue =====================
const GFX={on:false,ok:true,comp:null,bloom:null,fin:null};
try{ GFX.on=!LITE&&localStorage.getItem('bv_gfx')!=='0'; }catch(e){ GFX.on=!LITE; }
function gfxInit(){ try{ const w=Math.max(2,innerWidth), h=Math.max(2,innerHeight), rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,samples:4});
  const c=new EffectComposer(renderer,rt); c.setPixelRatio(PXR()); c.setSize(w,h); c.addPass(new RenderPass(scene,camera));
  const b=new UnrealBloomPass(new THREE.Vector2(w/2,h/2),.3,.55,3); c.addPass(b);
  const f=new ShaderPass({uniforms:{tDiffuse:{value:null},res:{value:new THREE.Vector2(w,h)},tilt:{value:1},vig:{value:.26},sat:{value:1.14},con:{value:1.05},warm:{value:.03}},
   vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
   fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 res; uniform float tilt,vig,sat,con,warm; varying vec2 vUv;
    void main(){ float d=abs(vUv.y-.52)*2.; float a=smoothstep(.5,1.,d)*tilt; vec4 c=texture2D(tDiffuse,vUv);
     if(a>.01){ vec2 px=a*2.6/res; vec3 s=c.rgb*2.; float n=2.;
      for(int i=0;i<10;i++){ float t=float(i)*.6283+d*3.; float r=.45+.55*fract(float(i)*.618); s+=texture2D(tDiffuse,vUv+vec2(cos(t),sin(t))*px*r).rgb; n+=1.; } c.rgb=s/n; }
     float l=dot(c.rgb,vec3(.2126,.7152,.0722)); c.rgb=mix(vec3(l),c.rgb,sat); c.rgb=(c.rgb-.18)*con+.18; c.rgb*=vec3(1.+warm,1.,1.-warm);
     vec2 q=vUv-.5; c.rgb*=1.-vig*smoothstep(.25,.95,dot(q,q)*2.2); gl_FragColor=vec4(max(c.rgb,0.),c.a); }`}); c.addPass(f);
  c.addPass(new OutputPass()); GFX.comp=c; GFX.bloom=b; GFX.fin=f; }catch(e){ console.warn('gfx',e); GFX.ok=false; GFX.on=false; } }
function gfxResize(){ if(GFX.comp){ try{ GFX.comp.setPixelRatio(PXR()); GFX.comp.setSize(innerWidth,innerHeight); GFX.fin.uniforms.res.value.set(innerWidth*PXR(),innerHeight*PXR()); }catch(e){} } }
function gfxRender(){ 
 // l'ombre du soleil suit la vue : nette partout, pas seulement dans la salle
 if(!LITE&&!visit.on&&!cine){ const X=Math.round(cam.tx*2)/2, Z=Math.round(cam.tz*2)/2, sc=sun.shadow.camera, R=Math.max(S+6,15); sun.position.set(X-7,18,Z+12); sun.target.position.set(X,0,Z+1); if(sc.right!==R){ sc.left=-R; sc.right=R; sc.top=R; sc.bottom=-R; sc.updateProjectionMatrix(); } }
 if(!GFX.on||LITE||!GFX.ok){ renderer.render(scene,camera); return; }
 if(!GFX.comp){ gfxInit(); if(!GFX.comp){ renderer.render(scene,camera); return; } gfxResize(); }
 const n=visit.on?.6:nightF(); GFX.bloom.threshold=3.1-2.2*n; GFX.bloom.strength=.22+.55*n; GFX.fin.uniforms.tilt.value=cine?.5:1; GFX.fin.uniforms.vig.value=.22+.16*n;
 try{ GFX.comp.render(); }catch(e){ console.warn('gfx',e); GFX.ok=false; renderer.render(scene,camera); } }
// ===================== DÉCOR : herbe, fleurs des champs, forêt et collines au loin =====================
function grassTex(){ const t=canvasTex(256,256,x=>{ x.fillStyle='#b9c766'; x.fillRect(0,0,256,256); const r=seeded(5); for(let i=0;i<260;i++){ const X=r()*256, Y=r()*256, s=8+r()*26; x.fillStyle=['rgba(140,170,70,.16)','rgba(210,215,120,.16)','rgba(120,160,80,.12)','rgba(230,220,140,.1)'][i%4]; for(const [ox,oy] of [[0,0],[256,0],[-256,0],[0,256],[0,-256]]){ x.beginPath(); x.ellipse(X+ox,Y+oy,s,s*.7,r()*3,0,7); x.fill(); } } for(let i=0;i<900;i++){ x.fillStyle=i%3?'rgba(110,150,60,.35)':'rgba(235,235,150,.3)'; x.fillRect(r()*256,r()*256,1.5,3); } },true); t.repeat.set(26,26); return t; }
function decorFree(x,z){ const c=S/2; if(x>-1&&x<S+1&&z>-1&&z<S+.6) return false; if(z>S-.4&&z<S+6.9&&x>-22&&x<S+30) return false; if(Math.abs(x-c)<10&&z>S+6.6&&z<S+14.8) return false; if(z>S+15.4&&z<S+19.9) return false;
 if(x>c+10.2&&x<c+16.9&&z>S+7.2&&z<S+13.2) return false; if(x>1.6&&x<5.6&&z>-3.3&&z<-1.3) return false; if(x>-20.4&&x<-4.2&&z>S-7.4) return false; if(x>S+3.3&&x<S+11.1&&z>S-7.8) return false; if(x>S+12&&x<S+24.4&&z>S-8.4) return false;
 if(z<-4&&z>-11.6&&x>-15.6&&x<S+25) return false; if(Math.abs(z+21.5)<1) return false; if(x>c-17&&x<c-9.8&&z>S+7&&z<S+13) return false; if(Math.hypot(x+7.5,z+15.5)<1.8||Math.hypot(x-(c+1.5),z+14.2)<1.4||Math.hypot(x-(c-7),z-(S+23.5))<2.6) return false; return true; }
function buildDecor(root,L){ const c=L.c, r=seeded(123), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), col=new THREE.Color(), v=new THREE.Vector3(), sc=new THREE.Vector3();
 const put=(geo,mat,n,gen,cast)=>{ const im=new THREE.InstancedMesh(geo,mat,n); let k=0; for(let i=0;i<n*3&&k<n;i++){ const o=gen(); if(!o) continue; q.setFromAxisAngle(up,o.ry||0); m4.compose(v.set(o.x,o.y||0,o.z),q,sc.set(o.s||1,o.sy||o.s||1,o.s||1)); im.setMatrixAt(k,m4); if(o.c) im.setColorAt(k,col.set(o.c)); k++; } im.count=k; im.userData.own=1; im.userData.side='-'; im.castShadow=!!cast; im.receiveShadow=!cast; im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; root.add(im); return im; };
 // touffes d'herbe
 { const g=mergeGeometries([0,1,2].map(i=>{ const k=new THREE.ConeGeometry(.035,.2,3).toNonIndexed(); k.rotateZ((i-1)*.35); k.translate((i-1)*.045,.1,(i%2)*.03); return k; }),false);
  put(g,new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,flatShading:true}),LITE?500:2600,()=>{ const x=c-34+r()*72, z=-24+r()*(S+52); if(!decorFree(x,z)) return null; return {x,z,ry:r()*6,s:.7+r()*.9,c:['#8fb84a','#a3c455','#7fae48','#c2cf6a'][Math.floor(r()*4)]}; }); }
 // fleurs des champs et cailloux
 put(new THREE.SphereGeometry(.045,6,5),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.8}),LITE?150:700,()=>{ const x=c-32+r()*68, z=-22+r()*(S+48); if(!decorFree(x,z)) return null; return {x,z,y:.07,s:.7+r()*.8,c:['#ffffff','#ffd23f','#ff8fb6','#c58cff','#ff9a3d','#ffffff','#e5484d'][Math.floor(r()*7)]}; });
 put(new THREE.IcosahedronGeometry(.1,0),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.95,flatShading:true}),LITE?40:160,()=>{ const x=c-32+r()*68, z=-22+r()*(S+48); if(!decorFree(x,z)) return null; return {x,z,y:.03,ry:r()*6,s:.5+r()*1.6,sy:.4+r()*.5,c:['#cdb89c','#bfa888','#d8c6ac','#a89a86'][Math.floor(r()*4)]}; },true);
 // buissons bas
 put(new THREE.IcosahedronGeometry(.3,1),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.9,flatShading:true}),LITE?20:70,()=>{ const x=c-32+r()*68, z=-22+r()*(S+48); if(!decorFree(x,z)||!decorFree(x+.5,z)||!decorFree(x-.5,z+.5)) return null; return {x,z,y:.14,ry:r()*6,s:.6+r()*.9,sy:.5+r()*.4,c:['#6cc35a','#57b04f','#7fbf55','#4f9a54'][Math.floor(r()*4)]}; },true);
 // forêt tout autour (deux maillages instanciés) et collines dans la brume
 { const P=[]; for(let i=0;i<(LITE?70:240);i++){ const a=r()*6.283, d=31+r()*46, x=c+2+Math.cos(a)*d*1.25, z=S/2+2+Math.sin(a)*d; if(Math.abs(x-c)<33&&z>-25&&z<S+27) continue; if(Math.abs(z+21.5)<1.6) continue; P.push({x,z,s:.9+r()*1.5,ry:r()*6,k:Math.floor(r()*5)}); }
  let i=0; put(new THREE.CylinderGeometry(.09,.13,1.1,6),new THREE.MeshStandardMaterial({color:'#8a5a36',roughness:.9}),P.length,()=>{ const p=P[i++]; return p&&{x:p.x,z:p.z,y:.55*p.s,s:p.s}; },true);
  i=0; put(new THREE.IcosahedronGeometry(.62,1),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.85,flatShading:true}),P.length,()=>{ const p=P[i++]; return p&&{x:p.x,z:p.z,y:1.5*p.s,s:p.s,sy:p.s*1.25,ry:p.ry,c:['#8cc43f','#77b23a','#6aa83c','#a5d150','#5f9c3e'][p.k]}; },true);
  i=0; put(new THREE.IcosahedronGeometry(.42,1),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.85,flatShading:true}),P.length,()=>{ const p=P[i++]; return p&&{x:p.x+.2,z:p.z-.1,y:2.15*p.s,s:p.s,ry:p.ry,c:['#a5d150','#8cc43f','#86b03a','#b9d95a','#77b23a'][p.k]}; },true);
  const hm=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,flatShading:true}); let h=0; put(new THREE.IcosahedronGeometry(1,2),hm,16,()=>{ const a=h/16*6.283+r()*.25, d=74+r()*26; h++; return {x:c+Math.cos(a)*d*1.2,z:S/2+Math.sin(a)*d,y:-1,s:15+r()*13,sy:5+r()*6,ry:r()*6,c:['#9fbf6a','#8fb56c','#a9c47a','#86ad6f'][h%4]}; }); }
}
