import re
def mascot(uid='m',expr='content',anim=False,slice_=True,thumb=True,stars=True,bitten=True):
    hair='#3a2418'; hairL='#5a3a26'; skin='#eab890'; skinD='#d39b72'; skinL='#f6cfae'
    A=lambda c: f' class="{c}"' if anim else ''
    o=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420" class="mascot">
<defs>
<radialGradient id="sk{uid}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="{skinL}"/><stop offset=".65" stop-color="{skin}"/><stop offset="1" stop-color="{skinD}"/></radialGradient>
<linearGradient id="hd{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa64d"/><stop offset="1" stop-color="#e5682e"/></linearGradient>
<linearGradient id="ch{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#ffb93d"/></linearGradient>
<linearGradient id="lg{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset=".55" stop-color="#ff8a3d"/><stop offset="1" stop-color="#e5484d"/></linearGradient>
<mask id="bt{uid}" maskUnits="userSpaceOnUse" x="150" y="130" width="230" height="220"><rect x="150" y="130" width="230" height="220" fill="#fff"/>'''
    if bitten or anim:
        o+=f'<circle{A("spB spB1")} cx="214" cy="249" r="15"/><circle{A("spB spB2")} cx="224" cy="233" r="15"/><circle{A("spB spB3")} cx="236" cy="246" r="19"/>' if anim else '<circle cx="214" cy="249" r="15"/><circle cx="222" cy="232" r="13"/><circle cx="207" cy="262" r="10"/>'
    o+=f'''</mask></defs>
<ellipse cx="180" cy="404" rx="118" ry="12" fill="#000" opacity=".28"/>
<path d="M96 268 Q180 214 264 268 Q262 300 180 300 Q98 300 96 268Z" fill="#c9561f"/>
<path d="M62 420 Q58 318 112 286 Q180 262 248 286 Q302 318 298 420Z" fill="url(#hd{uid})"/>
<path d="M112 286 Q180 262 248 286 Q226 322 180 326 Q134 322 112 286Z" fill="#c9561f" opacity=".55"/>
<path d="M160 318 q-3 34 -8 52 M200 318 q3 34 8 52" stroke="#fff3dc" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="152" cy="372" r="5" fill="#fff3dc"/><circle cx="208" cy="372" r="5" fill="#fff3dc"/>
<g transform="translate(232 352) scale(.2)"><path d="M100 14 L170 54 V146 L100 186 L30 146 V54 Z" fill="#2a1a14" stroke="url(#lg{uid})" stroke-width="12" stroke-linejoin="round"/><path d="M74 140 V66 H134 M74 104 H122" fill="none" stroke="url(#lg{uid})" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></g>
'''
    if thumb:
        o+=f'''<path d="M82 318 Q46 352 60 396" fill="none" stroke="url(#hd{uid})" stroke-width="44" stroke-linecap="round"/>
<g transform="translate(60 386)"><rect x="-22" y="-10" width="42" height="34" rx="14" fill="url(#sk{uid})"/><rect x="-10" y="-40" width="19" height="40" rx="9.5" fill="url(#sk{uid})"/><path d="M-20 4 h36 M-20 14 h36" stroke="{skinD}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></g>'''
    else:
        o+=f'<path d="M82 318 Q52 360 70 420" fill="none" stroke="url(#hd{uid})" stroke-width="44" stroke-linecap="round"/>'
    o+=f'''<g{A("spHd2")}><path d="M156 262 h48 v30 q-24 14 -48 0Z" fill="{skinD}"/>
<ellipse cx="86" cy="178" rx="15" ry="20" fill="url(#sk{uid})"/><ellipse cx="274" cy="178" rx="15" ry="20" fill="url(#sk{uid})"/><path d="M82 170 q8 8 2 18 M278 170 q-8 8 -2 18" stroke="{skinD}" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M88 168 Q86 74 180 72 Q274 74 272 168 Q272 236 232 262 Q180 286 128 262 Q88 236 88 168Z" fill="url(#sk{uid})"/>
<ellipse cx="118" cy="214" rx="20" ry="13" fill="#ff7f7f" opacity=".38"/><ellipse{A("spCk2")} cx="246" cy="212" rx="22" ry="15" fill="#ff7f7f" opacity=".42"/>
<path d="M90 150 Q78 70 180 62 Q282 70 270 150 Q262 112 230 104 Q200 122 150 106 Q110 112 90 150Z" fill="{hair}"/>'''
    for x,y,r in [(104,104,24),(132,78,27),(170,64,29),(210,66,28),(244,84,26),(264,112,21),(150,96,20),(196,92,21),(228,104,17)]:
        o+=f'<circle cx="{x}" cy="{y}" r="{r}" fill="{hair}"/>'
    for x,y,r in [(126,72,9),(166,56,10),(208,58,9),(242,78,8)]:
        o+=f'<circle cx="{x}" cy="{y}" r="{r}" fill="{hairL}" opacity=".8"/>'
    o+=f'<path d="M170 96 q22 -26 44 -6 q-14 -2 -18 12 q-12 -12 -26 -6Z" fill="{hairL}"/>'
    eyeO=lambda cx: f'<ellipse cx="{cx}" cy="180" rx="15" ry="19" fill="#2a1a14"/><circle cx="{cx+6}" cy="172" r="6" fill="#fff"/><circle cx="{cx-5}" cy="188" r="3" fill="#fff" opacity=".8"/>'
    if expr=='content':
        o+=f'<path d="M118 150 q20 -16 42 -4" stroke="{hair}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M202 142 q22 -12 42 6" stroke="{hair}" stroke-width="9" stroke-linecap="round" fill="none"/>'
        o+=f'<g{A("spEye2")}>{eyeO(140)}</g><path d="M204 184 q18 -18 38 -2" stroke="#2a1a14" stroke-width="8" stroke-linecap="round" fill="none"/>'
        mouth='<path d="M134 222 Q178 262 220 226 Q214 268 176 268 Q140 266 134 222Z" fill="#6e1f1a"/><path d="M142 226 Q178 252 212 229 L210 238 Q178 256 146 236Z" fill="#fff"/><path d="M156 256 q20 -12 40 0 q-18 14 -40 0Z" fill="#ff7f8f"/>'
    elif expr=='surpris':
        o+=f'<path d="M116 136 q22 -14 44 -2" stroke="{hair}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M200 134 q22 -12 44 2" stroke="{hair}" stroke-width="9" stroke-linecap="round" fill="none"/>'
        o+=eyeO(140)+eyeO(222); mouth='<ellipse cx="180" cy="244" rx="19" ry="24" fill="#6e1f1a"/><ellipse cx="180" cy="256" rx="11" ry="9" fill="#ff7f8f"/>'
    elif expr=='decu':
        o+=f'<path d="M118 158 q22 -4 42 -18" stroke="{hair}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M202 140 q20 14 42 18" stroke="{hair}" stroke-width="9" stroke-linecap="round" fill="none"/>'
        o+=eyeO(140).replace('cy="180"','cy="186"').replace('ry="19"','ry="15"')+eyeO(222).replace('cy="180"','cy="186"').replace('ry="19"','ry="15"')
        mouth='<path d="M150 258 Q180 234 210 258" stroke="#6e1f1a" stroke-width="8" stroke-linecap="round" fill="none"/>'
        o+='<path d="M252 150 q8 14 0 22 q-8 -8 0 -22Z" fill="#7fd1f2"/>'
    else: # gourmand
        o+=f'<path d="M118 150 q20 -16 42 -4" stroke="{hair}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M202 146 q22 -12 42 0" stroke="{hair}" stroke-width="9" stroke-linecap="round" fill="none"/>'
        o+='<path d="M122 186 q18 -18 38 -2" stroke="#2a1a14" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M204 184 q18 -18 38 -2" stroke="#2a1a14" stroke-width="8" stroke-linecap="round" fill="none"/>'
        mouth='<path d="M146 236 Q180 262 214 236 Q200 250 180 250 Q160 250 146 236Z" fill="#6e1f1a"/><path d="M196 248 q10 14 20 2 q-4 -8 -12 -8Z" fill="#ff7f8f"/>'
    o+=f'<path d="M174 196 q-8 14 4 18" stroke="{skinD}" stroke-width="5" stroke-linecap="round" fill="none"/><g{A("spMo2")}>{mouth}</g></g>'
    if slice_:
        o+=f'''<g{A("spArm2")}><path d="M280 322 Q322 330 314 276" fill="none" stroke="url(#hd{uid})" stroke-width="44" stroke-linecap="round"/>
<g mask="url(#bt{uid})"><path d="M210 250 L330 168 Q350 214 334 268Z" fill="url(#ch{uid})"/><path d="M210 250 L330 168 Q336 182 339 196 L222 256Z" fill="#fff3b0" opacity=".45"/>
<path d="M330 168 Q352 214 334 268" fill="none" stroke="#c9772e" stroke-width="20" stroke-linecap="round"/><path d="M332 174 Q350 214 335 262" fill="none" stroke="#e8a55a" stroke-width="7" stroke-linecap="round"/>
<circle cx="262" cy="232" r="12" fill="#d43a2f"/><circle cx="259" cy="229" r="4" fill="#ef6a55"/><circle cx="298" cy="204" r="11" fill="#d43a2f"/><circle cx="295" cy="201" r="3.5" fill="#ef6a55"/><circle cx="302" cy="244" r="11.5" fill="#d43a2f"/><circle cx="299" cy="241" r="3.5" fill="#ef6a55"/>
<path d="M276 208 q8 -8 14 2 q-8 6 -14 -2Z" fill="#4f9a54"/><path d="M280 252 q8 -6 12 4 q-8 4 -12 -4Z" fill="#4f9a54"/><circle cx="244" cy="246" r="3.5" fill="#2b2b30"/><circle cx="318" cy="224" r="3.5" fill="#2b2b30"/></g>
<g transform="translate(318 268)"><rect x="-20" y="-16" width="40" height="36" rx="15" fill="url(#sk{uid})"/><path d="M-14 -6 h30 M-14 4 h30" stroke="{skinD}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/><rect x="-28" y="-10" width="18" height="24" rx="9" fill="url(#sk{uid})"/></g></g>
<circle{A("spCr spCr1")} cx="204" cy="282" r="3.5" fill="#ffcf5a"/><circle{A("spCr spCr2")} cx="196" cy="296" r="2.5" fill="#c9772e"/><circle{A("spCr spCr3")} cx="214" cy="298" r="2.5" fill="#ffcf5a"/>'''
    else:
        o+=f'<path d="M278 318 Q308 360 290 420" fill="none" stroke="url(#hd{uid})" stroke-width="44" stroke-linecap="round"/>'
    if stars:
        o+=f'<path{A("spSt spSt1")} d="M44 96 l5 12 12 5 -12 5 -5 12 -5 -12 -12 -5 12 -5Z" fill="#ffd27a"/><path{A("spSt spSt2")} d="M318 86 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4Z" fill="#ffd27a"/><path{A("spSt spSt3")} d="M36 250 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z" fill="#ff8a3d"/>'
    return o+'</svg>'
CSS='''<style>
.spEat{width:auto;height:min(31vh,250px);margin:10px auto 0;display:block;opacity:0;animation:spEatIn .6s 1.5s forwards;overflow:visible}
@keyframes spEatIn{from{opacity:0;transform:translateY(14px) scale(.92)}to{opacity:1;transform:none}}
.spArm2{animation:spArm2 3s ease-in-out infinite;transform-origin:300px 330px}
@keyframes spArm2{0%,100%{transform:translate(34px,-2px) rotate(9deg)}24%,38%{transform:translate(-16px,2px) rotate(-3deg)}64%{transform:translate(34px,-2px) rotate(9deg)}}
.spMo2{animation:spMo2 3s linear infinite;transform-origin:178px 244px}
@keyframes spMo2{0%,10%{transform:scale(1)}22%,28%{transform:scale(1.12,1.45)}32%{transform:scale(.8,.45)}38%{transform:scale(.85,.9)}44%{transform:scale(.8,.45)}50%{transform:scale(.85,.9)}56%{transform:scale(.8,.45)}62%{transform:scale(.85,.85)}72%,100%{transform:scale(1)}}
.spHd2{animation:spHd2 3s ease-in-out infinite;transform-origin:180px 290px}
@keyframes spHd2{0%,16%,100%{transform:rotate(0)}26%{transform:rotate(4deg)}34%,58%{transform:rotate(-1.5deg)}46%{transform:rotate(1.5deg)}}
.spCk2{animation:spCk2 3s linear infinite;transform-origin:246px 212px}
@keyframes spCk2{0%,31%,70%,100%{transform:scale(1)}38%,50%,62%{transform:scale(1.25,1.3)}44%,56%{transform:scale(1.05)}}
.spEye2{animation:spEye2 4.3s linear infinite;transform-origin:140px 180px}
@keyframes spEye2{0%,46%,52%,100%{transform:scaleY(1)}49%{transform:scaleY(.1)}}
.spB{opacity:0}
.spB1{animation:spB1 9s steps(1) infinite}.spB2{animation:spB2 9s steps(1) infinite}.spB3{animation:spB3 9s steps(1) infinite}
@keyframes spB1{0%{opacity:0}10.3%{opacity:1}100%{opacity:1}}
@keyframes spB2{0%{opacity:0}43.6%{opacity:1}100%{opacity:1}}
@keyframes spB3{0%{opacity:0}77%{opacity:1}100%{opacity:1}}
.spCr{opacity:0;animation:spCr 3s ease-in infinite}.spCr2{animation-delay:.08s}.spCr3{animation-delay:.16s}
@keyframes spCr{0%,30%{opacity:0;transform:translate(0,-20px)}32%{opacity:1}56%{opacity:0;transform:translate(-6px,60px)}100%{opacity:0}}
.spSt{animation:spSt 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.spSt2{animation-delay:.8s}.spSt3{animation-delay:1.5s}
@keyframes spSt{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(.35) rotate(40deg)}}
</style>'''
if __name__=='__main__':
    import sys
    open('/tmp/masc/mascotte.svg','w').write(mascot('m'))
    an=mascot('s',anim=True).replace('class="mascot"','class="spEat" aria-hidden="true"').replace(' xmlns="http://www.w3.org/2000/svg"','')
    an=re.sub(r'\n\s*','',an)
    open('/tmp/masc/splash_eat.html','w').write(an+'\n'+CSS)
    for e in ['content','surpris','decu','gourmand']: open(f'/tmp/masc/expr_{e}.svg','w').write(mascot('e'+e,expr=e,slice_=(e in('content','gourmand')),thumb=(e=='content'),stars=(e=='content'),bitten=True))
