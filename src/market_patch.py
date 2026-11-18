# v0.83 : le marché des voisins
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('market_patch',a[:70],c); js=js.replace(a,b)
RX("const PANELS={",open('src/market.js').read()+"\nconst PANELS={ market(){ return mkMarketPanel(); }, stall(){ return mkStallPanel(); },")
RX(" close:()=>closeModal(),",""" close:()=>closeModal(),
 mkgo:(k)=>{ try{ const K=life.keep.find(x=>x.k===k); cam.tx=K.x; cam.tz=K.z+1.2; }catch(e){} openStall(k); },
 mkbuy:(v)=>{ const [k,q]=v.split(':'), o=mkOffers(k).find(x=>x.q===q), S0=mkS(); if(!o||(S0.b[k+q]||0)>=2||state.coins<o.p) return; state.coins-=o.p; dayAdd('ing',o.p); state.inv[q]=(state.inv[q]||0)+o.n; S0.b[k+q]=(S0.b[k+q]||0)+1; ui.stallHi=false; sfx('coin'); },
 mkbook:(v)=>{ const [id,p]=v.split(':'), S0=mkS(); if(S0.b.abook||state.coins<+p||!DISHM[id]) return; state.coins-=+p; S0.b.abook=1; ui.stallHi=false; sfx('level'); for(let i=0;i<6;i++) mastAdd(id); toast(DISHM[id].n+' : tes cuisiniers ont bien étudié.'); },
 mklem:()=>{ const S0=mkS(), e=state.en||(state.en={v:EN_MAX,t:Date.now()}); if(S0.b.zlem||state.coins<1||e.v>=EN_MAX) return; state.coins-=1; S0.b.zlem=1; e.v=Math.min(EN_MAX,e.v+3); ui.stallHi=false; sfx('level'); toast('Aaah, ça fait du bien ! +3 énergie.'); },""")
RX("const MORE=[","const MORE=[['market','Place du marché','shop','#ffd98a','#f2a81d','#b9772e'],")
