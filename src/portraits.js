/* ===== v0.58 : portraits détaillés (dessinés en SVG) pour les dialogues, le prologue et le tutoriel ===== */
const PORTRAIT={
 o:{age:2,fem:1,hair:'bun',glasses:'round',gcol:'#c9a13a',expr:'warm',ear:'#fffaf0',wr:1},
 b:{age:1,hair:'slick',hat:'toque',glasses:'thin',gcol:'#2b2b30',expr:'smirk',mous:'curl',brow:1},
 c:{age:1,fem:1,hair:'bob',hat:'beret',hatc:'#2f3a4f',glasses:'cat',gcol:'#b8323a',expr:'pursed',lips:'#b8323a'},
 j:{age:0,fem:1,hair:'pony',hat:'cap',hatc:'#6b7280',expr:'smile',frk:1},
 s:{age:0,hair:'curly',expr:'smile'},
 p:{age:1,hair:'bald',glasses:'rect',gcol:'#3a4252',expr:'stern',wr:1},
 l:{age:1,hair:'short',hat:'bcap',expr:'grin',mous:'small',flour:1,wide:1},
 r:{age:1,fem:1,hair:'bun',hat:'straw',expr:'smile',ear:'#e8c46a'},
 y:{age:2,hair:'short',hat:'captain',expr:'gruff',beard:1,wr:1,wide:1},
 a:{age:2,hair:'short',hat:'beret',hatc:'#5a4632',glasses:'round',gcol:'#3a2a1f',expr:'warm',mous:'bushy',wr:1},
 z:{age:-1,fem:1,hair:'bob',hat:'bow',expr:'grin',frk:1},
};
function portraitSVG(k,L0,P0,bg0){
 const L=L0||WHO_LOOK[k], P=P0||PORTRAIT[k]||{}; if(!L) return ''; const o=L.outfit, sk=o.skin, skD=shade(sk,-.16), skL=shade(sk,.12), hc=o.hairC, hD=shade(hc,-.25), hL=shade(hc,.18), top=o.top, acc=o.accent||'#fff', ex=o.extras||[];
 const bg=bg0||((typeof SAGA_WHO!=='undefined'&&SAGA_WHO[k])?SAGA_WHO[k][1]:'#c98b52'), id='p'+k, hw=P.wide?47:P.age<0?41:44, hh=P.age<0?46:50, cy=P.age<0?100:96;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="${id}b" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="${shade(bg,.55)}"/><stop offset="1" stop-color="${shade(bg,.08)}"/></radialGradient><radialGradient id="${id}s" cx=".42" cy=".36" r=".8"><stop offset="0" stop-color="${skL}"/><stop offset=".7" stop-color="${sk}"/><stop offset="1" stop-color="${skD}"/></radialGradient><linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hL}"/><stop offset="1" stop-color="${hD}"/></linearGradient><linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(top,.1)}"/><stop offset="1" stop-color="${shade(top,-.18)}"/></linearGradient><clipPath id="${id}c"><rect width="200" height="200"/></clipPath></defs><g clip-path="url(#${id}c)"><rect width="200" height="200" fill="url(#${id}b)"/><circle cx="100" cy="92" r="78" fill="#fff" opacity=".16"/>`;
 // cheveux derrière la tête
 if(P.hair==='bob') s+=`<path d="M${100-hw-7} ${cy-8} Q${100-hw-12} ${cy+46} ${100-hw+8} ${cy+52} L${100+hw-8} ${cy+52} Q${100+hw+12} ${cy+46} ${100+hw+7} ${cy-8} Q100 ${cy-70} ${100-hw-7} ${cy-8}Z" fill="url(#${id}h)"/>`;
 if(P.hair==='pony') s+=`<path d="M${100+hw-6} ${cy-20} q34 8 30 52 q-4 20 -18 22 q10 -30 -14 -52Z" fill="url(#${id}h)"/>`;
 if(P.hair==='bun'&&!P.hat) s+=`<circle cx="100" cy="${cy-hh-8}" r="19" fill="url(#${id}h)"/><path d="M88 ${cy-hh-12} q12 -8 24 0" stroke="${hD}" stroke-width="2" fill="none"/>`;
 if(P.hair==='curly') for(const [x,y,r] of [[60,62,17],[76,48,18],[98,42,19],[121,47,18],[139,61,17],[54,82,13],[146,82,13]]) s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}h)"/>`;
 // buste et vêtements
 s+=`<path d="M100 ${cy+40} l-14 0 0 22 28 0 0 -22Z" fill="${skD}"/><path d="M22 204 Q24 168 62 160 L86 154 Q100 166 114 154 L138 160 Q176 168 178 204Z" fill="url(#${id}t)"/>`;
 if(ex.includes('vest')) s+=`<path d="M62 160 L86 154 L94 204 L40 204 Q40 176 62 160Z M138 160 L114 154 L106 204 L160 204 Q160 176 138 160Z" fill="${shade(acc,-.05)}" opacity=".96"/>`;
 if(ex.includes('apron')) s+=`<path d="M72 170 L128 170 L134 204 L66 204Z" fill="${shade(acc,.05)}"/><path d="M72 170 L86 154 M128 170 L114 154" stroke="${shade(acc,-.12)}" stroke-width="5" fill="none"/>`;
 s+=`<path d="M86 154 L100 172 L114 154 L108 150 L100 160 L92 150Z" fill="${shade(top,.22)}"/>`;
 if(ex.includes('tie')) s+=`<path d="M95 164 l10 0 l-2 8 l5 26 l-8 8 l-8 -8 l5 -26Z" fill="${acc}"/><path d="M95 164 l10 0 l-2 8 l-6 0Z" fill="${shade(acc,-.2)}"/>`;
 if(ex.includes('bowtie')) s+=`<path d="M100 166 l-17 -9 0 18Z M100 166 l17 -9 0 18Z" fill="${acc}"/><circle cx="100" cy="166" r="4.5" fill="${shade(acc,.25)}"/>`;
 if(ex.includes('scarf')) s+=`<path d="M78 150 Q100 170 122 150 L126 160 Q100 182 74 160Z" fill="${k==='o'?'#f2e2c4':acc}"/><path d="M108 166 l10 30 l-12 4 l-6 -30Z" fill="${shade(k==='o'?'#f2e2c4':acc,-.1)}"/>`;
 if(ex.includes('buttons')) for(const y of [182,196]) s+=`<circle cx="100" cy="${y}" r="3.4" fill="${acc}"/>`;
 // oreilles, tête
 for(const d of [-1,1]) s+=`<ellipse cx="${100+d*(hw+1)}" cy="${cy+4}" rx="8" ry="11" fill="${sk}"/><path d="M${100+d*(hw+3)} ${cy-1} q${d*4} 5 0 10" stroke="${skD}" stroke-width="2" fill="none"/>`+(P.ear?`<circle cx="${100+d*(hw+2)}" cy="${cy+17}" r="4" fill="${P.ear}" stroke="${shade(P.ear,-.25)}" stroke-width="1"/>`:'');
 s+=`<path d="M${100-hw} ${cy-6} Q${100-hw} ${cy-hh} 100 ${cy-hh} Q${100+hw} ${cy-hh} ${100+hw} ${cy-6} Q${100+hw} ${cy+30} ${100+hw*.52} ${cy+hh-6} Q100 ${cy+hh+6} ${100-hw*.52} ${cy+hh-6} Q${100-hw} ${cy+30} ${100-hw} ${cy-6}Z" fill="url(#${id}s)"/>`;
 // joues
 for(const d of [-1,1]) s+=`<ellipse cx="${100+d*27}" cy="${cy+17}" rx="11" ry="7" fill="#ff8f8f" opacity="${P.fem||P.age<0?.38:.2}"/>`;
 if(P.frk) for(const [x,y] of [[-30,10],[-24,14],[-20,9],[30,10],[24,14],[20,9]]) s+=`<circle cx="${100+x}" cy="${cy+y}" r="1.5" fill="${shade(sk,-.35)}" opacity=".7"/>`;
 if(P.flour) s+=`<path d="M126 ${cy+22} q8 -6 12 2 q-4 6 -12 -2Z" fill="#fff" opacity=".85"/>`;
 // rides
 if(P.wr){ s+=`<path d="M82 ${cy-27} q18 -5 36 0 M86 ${cy-34} q14 -4 28 0" stroke="${skD}" stroke-width="1.6" fill="none" opacity=".6"/>`; for(const d of [-1,1]) s+=`<path d="M${100+d*38} ${cy-4} l${d*6} -3 M${100+d*38} ${cy} l${d*6} 1" stroke="${skD}" stroke-width="1.5" opacity=".6"/><path d="M${100+d*17} ${cy+18} q${d*-3} 8 ${d*2} 14" stroke="${skD}" stroke-width="1.6" fill="none" opacity=".5"/>`; }
 // yeux
 const ey=cy-3, iris=k==='b'?'#4a5a3a':k==='z'?'#4f9a54':k==='c'?'#3f6f9a':'#5a3a22', sq=P.expr==='warm'||P.expr==='grin';
 for(const d of [-1,1]){ const x=100+d*18;
  if(sq) s+=`<path d="M${x-9} ${ey+2} Q${x} ${ey-9} ${x+9} ${ey+2}" stroke="#3a2a22" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  else { const ry=P.expr==='oh'?9.8:P.expr==='stern'||P.expr==='smirk'||P.expr==='pursed'?6.4:P.age<0?9.5:8; s+=`<ellipse cx="${x}" cy="${ey}" rx="9" ry="${ry}" fill="#fff"/><circle cx="${x+(P.expr==='smirk'?d*1.5+2:0)}" cy="${ey+.6}" r="${Math.min(ry-.4,5.6)}" fill="${iris}"/><circle cx="${x+(P.expr==='smirk'?d*1.5+2:0)}" cy="${ey+.6}" r="2.8" fill="#1d1612"/><circle cx="${x+2.2}" cy="${ey-2}" r="1.7" fill="#fff"/><path d="M${x-10} ${ey-ry+2.4} Q${x} ${ey-ry-3.2} ${x+10} ${ey-ry+2.4}" stroke="#3a2a22" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
   if(P.fem) s+=`<path d="M${x+d*9} ${ey-ry+2} l${d*5} -4 M${x+d*6} ${ey-ry} l${d*3} -5" stroke="#3a2a22" stroke-width="1.8" stroke-linecap="round"/>`; }
  // sourcils
  const bc=P.age>=2?shade(hc,-.12):hD, by=ey-(sq?13:15), tl=P.expr==='stern'?d*-3:P.expr==='smirk'&&d>0?-5:P.expr==='pursed'?d*2:0;
  let yi=by+(P.expr==='stern'?4:1)+(-tl*.3), ym=by-4+tl*.4, yo=by+(P.expr==='stern'?-2:2)+tl;
  if(P.expr==='sad'){ yi=by-4; ym=by-1; yo=by+5; } else if(P.expr==='oh'){ yi-=4; ym-=6; yo-=4; }
  s+=`<path d="M${x-d*10} ${yi} Q${x} ${ym} ${x+d*10} ${yo}" stroke="${bc}" stroke-width="${P.fem?2.6:P.age>=2?4.6:3.8}" fill="none" stroke-linecap="round"/>`; }
 // nez
 s+=`<path d="M97 ${cy+3} q-6 12 2 15 q5 1 8 -2" stroke="${skD}" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="103" cy="${cy+12}" rx="5" ry="3" fill="#fff" opacity=".25"/>`;
 // bouche
 const my=cy+29, lip=P.lips||(P.fem?'#c8605a':shade(sk,-.38));
 if(P.expr==='grin') s+=`<path d="M82 ${my-3} Q100 ${my+18} 118 ${my-3} Q100 ${my+3} 82 ${my-3}Z" fill="#7a2a22"/><path d="M85 ${my-2} Q100 ${my+3} 115 ${my-2} L113 ${my+3} Q100 ${my+7} 87 ${my+3}Z" fill="#fff"/><path d="M92 ${my+9} q8 4 16 0 q-8 6 -16 0Z" fill="#e5787a"/>`;
 else if(P.expr==='warm'||P.expr==='smile') s+=`<path d="M84 ${my-1} Q100 ${my+12} 116 ${my-1}" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M90 ${my+5} q10 5 20 0" stroke="${shade(lip,.3)}" stroke-width="1.6" fill="none" opacity=".7"/>`;
 else if(P.expr==='smirk') s+=`<path d="M86 ${my+3} Q100 ${my+6} 118 ${my-5}" stroke="${lip}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
 else if(P.expr==='pursed') s+=`<path d="M91 ${my+1} q9 -5 18 0 q-9 7 -18 0Z" fill="${lip}"/><path d="M91 ${my+1} q9 2 18 0" stroke="${shade(lip,-.25)}" stroke-width="1.2" fill="none"/>`;
 else if(P.expr==='gruff') s+=`<path d="M87 ${my+2} Q100 ${my+8} 113 ${my+1}" stroke="${lip}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
 else if(P.expr==='sad') s+=`<path d="M88 ${my+7} Q100 ${my-2} 112 ${my+7}" stroke="${lip}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
 else if(P.expr==='oh') s+=`<ellipse cx="100" cy="${my+4}" rx="6" ry="7.5" fill="#7a2a22"/><ellipse cx="100" cy="${my+7}" rx="3.6" ry="3" fill="#e5787a"/>`;
 else s+=`<path d="M88 ${my+3} Q100 ${my} 112 ${my+3}" stroke="${lip}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
 for(const d of [-1,1]) if(P.expr==='warm'||P.expr==='smile'||P.expr==='grin') s+=`<path d="M${100+d*20} ${my-4} q${d*4} 3 ${d*1} 8" stroke="${skD}" stroke-width="1.5" fill="none" opacity=".55"/>`;
 // barbe et moustaches
 if(P.beard) s+=`<path d="M${100-hw+2} ${cy+10} Q${100-hw+2} ${cy+hh+10} 100 ${cy+hh+16} Q${100+hw-2} ${cy+hh+10} ${100+hw-2} ${cy+10} Q${100+hw-12} ${cy+30} 122 ${my-6} Q100 ${my-14} 78 ${my-6} Q${100-hw+12} ${cy+30} ${100-hw+2} ${cy+10}Z" fill="url(#${id}h)"/><path d="M87 ${my+2} Q100 ${my+9} 113 ${my+1}" stroke="${shade(sk,-.4)}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
 if(P.mous==='curl') s+=`<path d="M100 ${my-9} q-8 -5 -16 1 q-8 6 -15 -3 q4 12 16 9 q9 -2 15 -4 q6 2 15 4 q12 3 16 -9 q-7 9 -15 3 q-8 -6 -16 -1Z" fill="${hD}"/>`;
 if(P.mous==='small') s+=`<path d="M100 ${my-9} q-10 -4 -17 4 q9 3 17 0 q8 3 17 0 q-7 -8 -17 -4Z" fill="${hD}"/>`;
 if(P.mous==='bushy') s+=`<path d="M100 ${my-11} q-14 -5 -24 8 q13 5 24 0 q11 5 24 0 q-10 -13 -24 -8Z" fill="url(#${id}h)"/>`;
 // cheveux devant
 const ty=cy-hh;
 if(P.hair==='short') s+=`<path d="M${100-hw-1} ${cy-6} Q${100-hw-3} ${ty-8} 100 ${ty-10} Q${100+hw+3} ${ty-8} ${100+hw+1} ${cy-6} Q${100+hw-6} ${cy-30} ${100+hw*.5} ${ty+12} Q100 ${ty+6} ${100-hw*.5} ${ty+12} Q${100-hw+6} ${cy-30} ${100-hw-1} ${cy-6}Z" fill="url(#${id}h)"/>`;
 if(P.hair==='slick') s+=`<path d="M${100-hw-1} ${cy-4} Q${100-hw-3} ${ty-8} 100 ${ty-9} Q${100+hw+3} ${ty-8} ${100+hw+1} ${cy-4} Q${100+hw-5} ${cy-28} ${100+hw*.55} ${ty+14} Q${100+8} ${ty+4} ${100-hw*.6} ${ty+18} Q${100-hw+5} ${cy-28} ${100-hw-1} ${cy-4}Z" fill="url(#${id}h)"/><path d="M${100-hw*.6} ${ty+18} Q100 ${ty+2} ${100+hw*.5} ${ty+10}" stroke="${hL}" stroke-width="2" fill="none" opacity=".6"/>`;
 if(P.hair==='bald') s+=`<path d="M${100-hw-1} ${cy} q-2 -22 6 -30 q0 14 3 22Z M${100+hw+1} ${cy} q2 -22 -6 -30 q0 14 -3 22Z" fill="url(#${id}h)"/><ellipse cx="88" cy="${ty+14}" rx="14" ry="7" fill="#fff" opacity=".22"/>`;
 if(P.hair==='bun') s+=`<path d="M${100-hw-1} ${cy-2} Q${100-hw-3} ${ty-8} 100 ${ty-9} Q${100+hw+3} ${ty-8} ${100+hw+1} ${cy-2} Q${100+hw-4} ${cy-26} ${100+hw*.6} ${ty+16} Q100 ${ty+2} ${100-hw*.6} ${ty+16} Q${100-hw+4} ${cy-26} ${100-hw-1} ${cy-2}Z" fill="url(#${id}h)"/><path d="M100 ${ty-6} L100 ${ty+8}" stroke="${hD}" stroke-width="1.6" opacity=".5"/>`;
 if(P.hair==='bob') s+=`<path d="M${100-hw-3} ${cy+4} Q${100-hw-5} ${ty-10} 100 ${ty-11} Q${100+hw+5} ${ty-10} ${100+hw+3} ${cy+4} Q${100+hw-4} ${cy-22} ${100+hw*.5} ${ty+22} Q${100+6} ${ty+30} ${100-hw*.25} ${ty+22} Q${100-hw*.7} ${ty+22} ${100-hw+3} ${cy-16} Q${100-hw} ${cy-6} ${100-hw-3} ${cy+4}Z" fill="url(#${id}h)"/><path d="M${100-hw*.25} ${ty+22} Q100 ${ty+4} ${100+hw*.4} ${ty+2}" stroke="${hL}" stroke-width="2" fill="none" opacity=".5"/>`;
 if(P.hair==='pony') s+=`<path d="M${100-hw-2} ${cy-2} Q${100-hw-4} ${ty-9} 100 ${ty-10} Q${100+hw+4} ${ty-9} ${100+hw+2} ${cy-2} Q${100+hw-5} ${cy-24} ${100+hw*.5} ${ty+20} Q${100-4} ${ty+26} ${100-hw*.55} ${ty+18} Q${100-hw+4} ${cy-22} ${100-hw-2} ${cy-2}Z" fill="url(#${id}h)"/>`;
 if(P.hair==='curly') for(const [x,y,r] of [[68,60,13],[84,52,13],[100,49,13],[116,52,13],[132,60,13]]) s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}h)"/><path d="M${x-5} ${y-3} q5 -6 10 0" stroke="${hL}" stroke-width="1.6" fill="none" opacity=".5"/>`;
 // lunettes
 if(P.glasses){ const gc=P.gcol||'#2b2b30', gy=ey+1;
  if(P.glasses==='round') s+=`<circle cx="82" cy="${gy}" r="14" fill="#fff" fill-opacity=".14" stroke="${gc}" stroke-width="3"/><circle cx="118" cy="${gy}" r="14" fill="#fff" fill-opacity=".14" stroke="${gc}" stroke-width="3"/>`;
  else if(P.glasses==='cat') s+=`<path d="M66 ${gy-9} l30 2 q2 18 -14 18 q-15 0 -16 -13Z M134 ${gy-9} l-30 2 q-2 18 14 18 q15 0 16 -13Z" fill="#fff" fill-opacity=".14" stroke="${gc}" stroke-width="3.2" stroke-linejoin="round"/><path d="M66 ${gy-9} l-6 -6 M134 ${gy-9} l6 -6" stroke="${gc}" stroke-width="3.2" stroke-linecap="round"/>`;
  else s+=`<rect x="67" y="${gy-9}" width="29" height="${P.glasses==='thin'?17:19}" rx="5" fill="#fff" fill-opacity=".14" stroke="${gc}" stroke-width="${P.glasses==='thin'?2.4:3}"/><rect x="104" y="${gy-9}" width="29" height="${P.glasses==='thin'?17:19}" rx="5" fill="#fff" fill-opacity=".14" stroke="${gc}" stroke-width="${P.glasses==='thin'?2.4:3}"/>`;
  s+=`<path d="M96 ${gy-2} q4 -4 8 0" stroke="${gc}" stroke-width="2.6" fill="none"/><path d="M73 ${gy-5} l8 -3 M109 ${gy-5} l8 -3" stroke="#fff" stroke-width="2.2" opacity=".65" stroke-linecap="round"/>`; }
 // chapeaux
 const hcC=P.hatc||acc;
 if(P.hat==='toque') s+=`<path d="M62 ${ty+14} Q44 ${ty-6} 58 ${ty-26} Q62 ${ty-48} 84 ${ty-42} Q100 ${ty-58} 116 ${ty-42} Q138 ${ty-48} 142 ${ty-26} Q156 ${ty-6} 138 ${ty+14}Z" fill="#fffdf8" stroke="#e2dccf" stroke-width="2"/><rect x="60" y="${ty+6}" width="80" height="16" rx="5" fill="#fffdf8" stroke="#e2dccf" stroke-width="2"/><path d="M84 ${ty-40} q-2 22 2 44 M116 ${ty-40} q2 22 -2 44" stroke="#e2dccf" stroke-width="2" fill="none"/><rect x="60" y="${ty+17}" width="80" height="4" fill="${acc}"/>`;
 if(P.hat==='beret') s+=`<path d="M${100-hw-8} ${ty+16} Q${100-hw-14} ${ty-22} 104 ${ty-26} Q${100+hw+22} ${ty-24} ${100+hw+12} ${ty+10} Q100 ${ty+2} ${100-hw-8} ${ty+16}Z" fill="${hcC}"/><path d="M${100-hw-8} ${ty+16} Q100 ${ty+2} ${100+hw+12} ${ty+10}" stroke="${shade(hcC,-.3)}" stroke-width="3" fill="none"/><path d="M104 ${ty-26} l2 -8" stroke="${shade(hcC,-.2)}" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="86" cy="${ty-8}" rx="16" ry="6" fill="#fff" opacity=".14"/>`;
 if(P.hat==='cap'||P.hat==='bcap'){ const c2=P.hat==='bcap'?'#fffdf8':hcC; s+=`<path d="M${100-hw-3} ${ty+18} Q${100-hw-2} ${ty-22} 100 ${ty-22} Q${100+hw+2} ${ty-22} ${100+hw+3} ${ty+18} Q100 ${ty+6} ${100-hw-3} ${ty+18}Z" fill="${c2}" stroke="${shade(c2,-.14)}" stroke-width="2"/>`+(P.hat==='cap'?`<path d="M${100-hw+2} ${ty+17} Q${100-10} ${ty+8} ${100+hw+22} ${ty+22} Q${100+hw} ${ty+30} ${100-hw+2} ${ty+17}Z" fill="${shade(c2,-.22)}"/>`:`<path d="M${100-hw-3} ${ty+18} Q100 ${ty+6} ${100+hw+3} ${ty+18} l0 6 Q100 ${ty+13} ${100-hw-3} ${ty+24}Z" fill="${shade(c2,-.1)}"/>`); }
 if(P.hat==='captain') s+=`<path d="M${100-hw-4} ${ty+8} Q${100-hw-8} ${ty-26} 100 ${ty-28} Q${100+hw+8} ${ty-26} ${100+hw+4} ${ty+8}Z" fill="#fffdf8" stroke="#d9d3c4" stroke-width="2"/><path d="M${100-hw-4} ${ty+6} Q100 ${ty-4} ${100+hw+4} ${ty+6} l0 12 Q100 ${ty+8} ${100-hw-4} ${ty+18}Z" fill="#27496b"/><path d="M${100-hw+4} ${ty+18} Q100 ${ty+10} ${100+hw-4} ${ty+18} Q100 ${ty+34} ${100-hw+4} ${ty+18}Z" fill="#16202e"/><circle cx="100" cy="${ty-4}" r="8" fill="#e0b43a" stroke="#b8860b" stroke-width="1.5"/><path d="M100 ${ty-9} v10 M96 ${ty-1} q4 4 8 0" stroke="#27496b" stroke-width="1.8" fill="none"/>`;
 if(P.hat==='straw') s+=`<ellipse cx="100" cy="${ty+12}" rx="${hw+34}" ry="13" fill="#e8d49a" stroke="#c9b06a" stroke-width="2"/><path d="M${100-hw+4} ${ty+10} Q${100-hw+6} ${ty-26} 100 ${ty-28} Q${100+hw-6} ${ty-26} ${100+hw-4} ${ty+10}Z" fill="#f0dfa8" stroke="#c9b06a" stroke-width="2"/><path d="M${100-hw+4} ${ty+4} Q100 ${ty-6} ${100+hw-4} ${ty+4} l0 8 Q100 ${ty+2} ${100-hw+4} ${ty+12}Z" fill="#6fae5a"/>`;
 if(P.hat==='bow') s+=`<path d="M128 ${ty+8} l-18 -12 0 24Z M128 ${ty+8} l18 -12 0 24Z" fill="#f2a9c0" stroke="#d86a9a" stroke-width="2" stroke-linejoin="round"/><circle cx="128" cy="${ty+8}" r="6" fill="#d86a9a"/>`;
 return s+'</g></svg>';
}
function portraitURL(k){ const s=portraitSVG(k); return s?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s):''; }
function portraitsInit(){ for(const k in WHO_LOOK) if(PORTRAIT[k]) try{ foodThumbs['who:'+k]=portraitURL(k); }catch(e){ console.warn(e); } }

/* --- les habitués : douze portraits dessinés avec le même pinceau --- */
const REGULARS=[
 {k:'pichon',n:'Mme Pichon',fav:'tarte',t:'Institutrice à la retraite. Corrige les fautes du menu au stylo rouge.',c:'#c8553d',o:{skin:'#f1c9a5',hairC:'#d9d4cc',top:'#7a5c9a',accent:'#f2e2c4',extras:['scarf']},p:{age:2,fem:1,hair:'bob',glasses:'round',gcol:'#7a5c9a',expr:'warm',wr:1}},
 {k:'gaston',n:'Gaston',fav:'steak',t:'Garagiste. Veut son steak saignant et son café serré.',c:'#3a82c8',o:{skin:'#e0a878',hairC:'#3a2a1f',top:'#3f5f8a',accent:'#f2b33d',extras:['buttons']},p:{age:1,hair:'short',expr:'grin',mous:'small',wide:1}},
 {k:'lea',n:'Léa',fav:'salade',t:'Étudiante. Révise ses partiels à la table du fond.',c:'#57b86a',o:{skin:'#f6d0b1',hairC:'#8a5a2e',top:'#57b86a',accent:'#fff'},p:{age:0,fem:1,hair:'pony',expr:'smile',frk:1}},
 {k:'docteur',n:'Dr Morel',fav:'soupe',t:'Médecin du quartier. Dix minutes pour manger, pas une de plus.',c:'#2fb5a8',o:{skin:'#c98e63',hairC:'#2a1b12',top:'#f4f6f8',accent:'#2fb5a8',extras:['tie']},p:{age:1,hair:'slick',glasses:'rect',gcol:'#2b2b30',expr:'smile'}},
 {k:'jeanne',n:'Jeanne',fav:'crepe',t:'Fleuriste. Laisse toujours une fleur sur la table.',c:'#e0457f',o:{skin:'#eab48c',hairC:'#c8423a',top:'#f2a9c0',accent:'#57b86a',extras:['apron']},p:{age:1,fem:1,hair:'bun',expr:'warm',ear:'#f2b33d'}},
 {k:'marius',n:'Marius',fav:'pizza',t:'Facteur. Connaît tout le monde, et tous les potins.',c:'#f2b33d',o:{skin:'#d49a6a',hairC:'#4a2e1b',top:'#2f4f8f',accent:'#f2c23d',extras:['buttons']},p:{age:1,hair:'short',hat:'cap',hatc:'#2f4f8f',expr:'grin'}},
 {k:'nadia',n:'Nadia',fav:'curry',t:'Infirmière de nuit. Vient dîner quand les autres déjeunent.',c:'#9a5ce0',o:{skin:'#b07448',hairC:'#1d1612',top:'#8fdcd6',accent:'#fff'},p:{age:0,fem:1,hair:'curly',expr:'smile',ear:'#fffaf0'}},
 {k:'bernard',n:'Bernard',fav:'omelette',t:'Pêcheur à la retraite. Raconte chaque fois la même prise, un peu plus grosse.',c:'#27496b',o:{skin:'#e0a878',hairC:'#e9e6e0',top:'#27496b',accent:'#fff',extras:['scarf']},p:{age:2,hair:'bald',expr:'gruff',beard:1,wr:1,wide:1}},
 {k:'tom',n:'Tom',fav:'burger',t:'Dix ans. Compte ses pièces pour s’offrir un burger le mercredi.',c:'#ff8a3d',o:{skin:'#f6d0b1',hairC:'#c98b3a',top:'#ff8a3d',accent:'#fff'},p:{age:-1,hair:'short',expr:'grin',frk:1}},
 {k:'colette',n:'Colette',fav:'gateau',t:'Chanteuse de cabaret. Fête son anniversaire quatre fois par an.',c:'#b8323a',o:{skin:'#f1c9a5',hairC:'#2a1b12',top:'#b8323a',accent:'#f2b33d',extras:['scarf']},p:{age:1,fem:1,hair:'bob',expr:'pursed',lips:'#b8323a',ear:'#f2b33d'}},
 {k:'hugo',n:'Hugo',fav:'pates',t:'Livreur à vélo. Mange pour trois, toujours pressé.',c:'#3fb56d',o:{skin:'#8a5634',hairC:'#1d1612',top:'#3fb56d',accent:'#1d1d22'},p:{age:0,hair:'curly',hat:'cap',hatc:'#1d1d22',expr:'smile'}},
 {k:'baronne',n:'La Baronne',fav:'poulet',t:'Personne ne sait d’où vient son titre. Elle laisse de gros pourboires.',c:'#d9b24a',o:{skin:'#f1c9a5',hairC:'#e9e6e0',top:'#3a2a4a',accent:'#d9b24a',extras:['scarf']},p:{age:2,fem:1,hair:'bun',hat:'beret',hatc:'#3a2a4a',glasses:'cat',gcol:'#d9b24a',expr:'smirk',ear:'#d9b24a',wr:1}}];
const regImg=k=>{ if(!regImg.c) regImg.c={}; if(!regImg.c[k]){ const r=REGULARS.find(r=>r.k===k); try{ regImg.c[k]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(portraitSVG('r'+k,{outfit:r.o},r.p,r.c)); }catch(e){ regImg.c[k]=''; } } return regImg.c[k]; };

/* --- v0.72 : un visage par employé, tiré de son apparence en salle, avec l'humeur du moment --- */
const STAFF_FEM=new Set(['Léa','Chloé','Inès','Manon','Camille','Sarah','Jade','Zoé','Lina','Emma']);
function staffImg(s){ if(!s) return ''; const mo=s.mo===undefined?70:s.mo, ex=s.quit?'gruff':mo>=75?'grin':mo>=50?'smile':mo>=30?'flat':'stern', key=[s.id,s.role,ex,s.vet?1:0,s.name].join('|'); const C=staffImg.c||(staffImg.c={}); if(C[key]!==undefined) return C[key];
 const fem=STAFF_FEM.has(s.name), h=(s.id*2654435761>>>0), r=n=>(h>>>n)&7, role=s.role;
 const o={skin:s.skin||'#f1c27d',hairC:s.vet?'#cfcac2':(s.hair||'#5a3a1a'),
  top:role==='chef'?'#fbfbfb':role==='waiter'?'#ffffff':role==='barman'?'#f4f1ea':'#2bb3b1',
  accent:role==='chef'?'#c8d0d8':role==='waiter'?'#262833':role==='barman'?'#7a2f3a':'#e9fbfa',
  extras:role==='chef'?['buttons']:role==='waiter'?['vest','bowtie']:role==='barman'?['vest','tie']:['apron']};
 const P={age:s.vet?2:r(3)<3?0:1,fem:fem?1:0,expr:ex,hair:fem?['bob','pony','bun','curly'][r(6)&3]:(s.vet&&r(9)<3?'bald':['short','slick','curly','short'][r(6)&3])};
 if(role==='chef') P.hat='toque'; else if(role==='cleaner'){ P.hat='cap'; P.hatc='#1f7d80'; }
 if(r(12)<2){ P.glasses=fem?'round':'rect'; P.gcol='#3a2a22'; } if(r(15)<2&&P.age<2) P.frk=1; if(!fem&&r(18)<2) P.mous='small'; if(!fem&&s.vet&&r(21)<4) P.beard=1; if(s.vet) P.wr=1; if(fem&&r(24)<4) P.ear='#f2b33d'; if(!fem&&r(27)<2) P.wide=1;
 const bg={chef:'#e5773d',waiter:'#5aa0d8',barman:'#9a5ce0',cleaner:'#2bb3b1'}[role]||'#c98b52';
 try{ C[key]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(portraitSVG('s'+s.id,{outfit:o},P,bg)); }catch(e){ console.warn(e); C[key]=''; } return C[key]; }
