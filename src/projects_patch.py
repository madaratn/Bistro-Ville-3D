# v0.85 : les projets du quartier
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('projects_patch',a[:70],c); js=js.replace(a,b)
RX("const PANELS={",open('src/projects.js').read()+"\nconst PANELS={ projets(){ return projPanel(); },")
RX(" close:()=>closeModal(),",r""" close:()=>closeModal(),
 projbuy:(k)=>{ const P=PROJ.find(x=>x.k===k); if(!P||projHas(k)||state.level<P.u||state.coins<P.p) return; state.coins-=P.p; (state.proj||(state.proj={}))[k]=1; addXP(40); sfx('level'); closeModal(); try{ lifeProjFx(k); }catch(e){} rewardShow({chest:false,title:P.n,sub:P.t,items:[{img:foodThumbs['who:'+P.w],n:'Le quartier te dit merci',r:2},{xp:1,n:[P.fl?'Clients +'+Math.round(P.fl*100)+' %':'',P.tip?'Pourboires +'+Math.round(P.tip*100)+' %':''].filter(Boolean).join(' · ')}]}); },""")
RX("const MORE=[","const MORE=[['projets','Projets du quartier','team','#c9a6ff','#8a5cf0','#5b33c4'],")
RX("*11/(.3+rating*.46);","*11/(.3+rating*.46)/projFlow();")
RX("const tip=sat>70?Math.round(price*(sat-70)/100):0;","const tip=sat>70?Math.round(price*(sat-70)/100*projTip()):0;")
