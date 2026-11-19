// ===================== RENDU MODERNE (v0.78) : lueurs, profondeur de champ « maquette », étalonnage, ombres qui suivent la vue =====================
const GFX={on:false,ok:true,comp:null,bloom:null,fin:null,ao:null,aoOn:true};
try{ if(localStorage.getItem('bv_ao')==='0') GFX.aoOn=false; }catch(e){}
try{ GFX.on=!LITE&&localStorage.getItem('bv_gfx')!=='0'; }catch(e){ GFX.on=!LITE; }
function gfxInit(){ try{ const w=Math.max(2,innerWidth), h=Math.max(2,innerHeight), rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,samples:4}); if(GFX.aoOn){ rt.depthTexture=new THREE.DepthTexture(w,h); rt.depthTexture.type=THREE.UnsignedIntType; }
  const c=new EffectComposer(renderer,rt); c.setPixelRatio(PXR()); c.setSize(w,h); c.addPass(new RenderPass(scene,camera)); if(GFX.aoOn){ try{ GFX.ao=gfxAO(); c.addPass(GFX.ao); }catch(e){ console.warn('ao',e); GFX.ao=null; } }
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
// ---------- occlusion ambiante (v0.97) : les creux et les contacts s'assombrissent, les objets se posent enfin sur le sol ----------
// Calculée à demi-résolution à partir de la profondeur de l'image, floutée en respectant les contours, puis mêlée à l'image.
function gfxAO(){ const P={enabled:true,needsSwap:true,clear:false,renderToScreen:false,power:5}, cam2=new THREE.OrthographicCamera(-1,1,1,-1,0,1), geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,2,0,0,2],2));
 const quad=new THREE.Mesh(geo,null), sc2=new THREE.Scene(); quad.frustumCulled=false; sc2.add(quad);
 const mk=()=>new THREE.WebGLRenderTarget(2,2,{depthBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}), A=mk(), B=mk();
 const VS='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }';
 const CM=`uniform sampler2D tDepth; uniform vec2 res; uniform float near,far,tanF,aspect; varying vec2 vUv;
  float vz(vec2 uv){ float d=texture2D(tDepth,uv).x; return (near*far)/((far-near)*d-far); }
  vec3 vpos(vec2 uv){ float z=vz(uv); return vec3((uv*2.-1.)*vec2(aspect*tanF,tanF)*(-z),z); }`;
 const U=()=>({tDepth:{value:null},res:{value:new THREE.Vector2(2,2)},near:{value:1},far:{value:500},tanF:{value:.23},aspect:{value:1}});
 const mA=new THREE.ShaderMaterial({uniforms:Object.assign(U(),{radius:{value:.5},power:{value:1}}),vertexShader:VS,depthTest:false,depthWrite:false,fragmentShader:CM+`uniform float radius,power;
  void main(){ float d=texture2D(tDepth,vUv).x; if(d>=.99995){ gl_FragColor=vec4(1.); return; }
   vec3 P=vpos(vUv); vec2 px=1./res;
   vec3 Pr=vpos(vUv+vec2(px.x,0.)), Pl=vpos(vUv-vec2(px.x,0.)), Pu=vpos(vUv+vec2(0.,px.y)), Pd=vpos(vUv-vec2(0.,px.y));
   vec3 dx=abs(Pr.z-P.z)<abs(P.z-Pl.z)?Pr-P:P-Pl, dy=abs(Pu.z-P.z)<abs(P.z-Pd.z)?Pu-P:P-Pd, n=normalize(cross(dx,dy));
   float rs=radius/(-P.z*tanF)*.5, a0=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))*6.2832, s=0.;
   for(int i=0;i<10;i++){ float k=(float(i)+.5)/10., a=a0+k*15.08, r=rs*sqrt(k); vec3 v=vpos(vUv+vec2(cos(a)/aspect,sin(a))*r)-P; float vv=dot(v,v), f=max(1.-vv/(radius*radius),0.); s+=f*f*max((dot(v,n)-.014)/(vv+.004),0.); }
   float ao=max(.3,1./(1.+s*.2*power)); gl_FragColor=vec4(vec3(ao),1.); }`});
 const mB=new THREE.ShaderMaterial({uniforms:Object.assign(U(),{tAO:{value:null},dir:{value:new THREE.Vector2(1,0)}}),vertexShader:VS,depthTest:false,depthWrite:false,fragmentShader:CM+`uniform sampler2D tAO; uniform vec2 dir;
  void main(){ float z0=vz(vUv), sum=texture2D(tAO,vUv).r*.22, w=.22;
   for(int i=1;i<=4;i++){ float wi=i==1?.18:i==2?.12:i==3?.07:.03; for(int sg=-1;sg<=1;sg+=2){ vec2 uv=vUv+dir*float(i*sg); float ww=wi*max(0.,1.-abs(vz(uv)-z0)*2.2); sum+=texture2D(tAO,uv).r*ww; w+=ww; } }
   gl_FragColor=vec4(vec3(sum/w),1.); }`});
 const mM=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},tAO:{value:null},k:{value:1},dbg:{value:0},tint:{value:new THREE.Vector3(.2,.11,.07)}},vertexShader:VS,depthTest:false,depthWrite:false,
  fragmentShader:`uniform sampler2D tDiffuse,tAO; uniform float k,dbg; uniform vec3 tint; varying vec2 vUv; void main(){ vec4 c=texture2D(tDiffuse,vUv); float ao=mix(1.,texture2D(tAO,vUv).r,k); if(dbg>.5){ gl_FragColor=vec4(vec3(ao)*.8,1.); return; } gl_FragColor=vec4(c.rgb*(vec3(ao)+(1.-ao)*tint),c.a); }`});
 P.setSize=(w,h)=>{ const W=Math.max(2,w>>1), H=Math.max(2,h>>1); A.setSize(W,H); B.setSize(W,H); for(const m of [mA,mB]) m.uniforms.res.value.set(W,H); };
 P.render=(r,wb,rb)=>{ const dt=rb.depthTexture; mM.uniforms.tDiffuse.value=rb.texture;
  if(dt){ const t=Math.tan(camera.fov*Math.PI/360); for(const m of [mA,mB]){ const u=m.uniforms; u.tDepth.value=dt; u.near.value=camera.near; u.far.value=camera.far; u.tanF.value=t; u.aspect.value=camera.aspect; }
   mA.uniforms.power.value=P.power; quad.material=mA; r.setRenderTarget(A); r.render(sc2,cam2);
   const rs=mB.uniforms.res.value; quad.material=mB; mB.uniforms.tAO.value=A.texture; mB.uniforms.dir.value.set(1/rs.x,0); r.setRenderTarget(B); r.render(sc2,cam2); mB.uniforms.tAO.value=B.texture; mB.uniforms.dir.value.set(0,1/rs.y); r.setRenderTarget(A); r.render(sc2,cam2);
   mM.uniforms.tAO.value=A.texture; mM.uniforms.k.value=1; } else mM.uniforms.k.value=0;
  quad.material=mM; r.setRenderTarget(P.renderToScreen?null:wb); r.render(sc2,cam2); };
 P.mM=mM; P.mA=mA;
 P.dispose=()=>{ A.dispose(); B.dispose(); mA.dispose(); mB.dispose(); mM.dispose(); geo.dispose(); };
 return P; }
function gfxResize(){ if(GFX.comp){ try{ GFX.comp.setPixelRatio(PXR()); GFX.comp.setSize(innerWidth,innerHeight); GFX.fin.uniforms.res.value.set(innerWidth*PXR(),innerHeight*PXR()); }catch(e){} } }
function gfxRender(){ 
 // l'ombre du soleil suit la vue : nette partout, pas seulement dans la salle
 if(!LITE&&!visit.on&&!cine){ const X=Math.round(cam.tx*2)/2, Z=Math.round(cam.tz*2)/2, sc=sun.shadow.camera, R=Math.max(S+6,15); sun.position.set(X-7,18,Z+12); sun.target.position.set(X,0,Z+1); if(sc.right!==R){ sc.left=-R; sc.right=R; sc.top=R; sc.bottom=-R; sc.updateProjectionMatrix(); } }
 if(!GFX.on||LITE||!GFX.ok){ renderer.render(scene,camera); return; }
 if(!GFX.comp){ gfxInit(); if(!GFX.comp){ renderer.render(scene,camera); return; } gfxResize(); }
 const n=visit.on?.6:nightF(); GFX.bloom.threshold=visit.on?7:3.1-1.9*n; GFX.bloom.strength=visit.on?.22:.22+.4*n; /* au Belmont, les lustres ne doivent pas noyer la salle dans le blanc */ GFX.fin.uniforms.tilt.value=cine?.5:1; GFX.fin.uniforms.vig.value=.22+.16*n;
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
