# v0.68 : événements surprises et habitués à collectionner
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('events_patch',a[:70],c); js=js.replace(a,b)
RX("function update(dt){ momTick(dt);","function update(dt){ momTick(dt); evTick(dt);")
RX("momTip(c,price,sat); if(d) mastAdd(d.id);","momTip(c,price,sat); if(d) mastAdd(d.id); try{ evMeal(c,d,price,sat); }catch(e){}")
RX(" if(m.k==='tip'){ earn(m.v);"," if(evMom(m,gx,gy)){} else if(m.k==='tip'){ earn(m.v);")
RX("const staffMul=a=>tierOf(a.s).sp*(1+.1*(staffLv(a.s)-1))*teamMul(a.s);","const staffMul=a=>tierOf(a.s).sp*(1+.1*(staffLv(a.s)-1))*teamMul(a.s)*(ev&&ev.k==='panne'&&a.s.role==='chef'?.45:1);")
RX("function momTip(c,price,sat){ if(warming||rush||sat<=55||mode!=='play') return; const v=Math.max(1,Math.round(price*.2));","function momTip(c,price,sat){ if(warming||rush||sat<=55||mode!=='play') return; const v=Math.max(1,Math.round(price*.2*(ev&&ev.k==='car'?2:1)));")
RX("const PANELS={",open('src/events.js').read()+"\nconst PANELS={\n"+open('src/events_panel.js').read())
RX(" close:()=>closeModal(),",""" close:()=>closeModal(),
 evbuy:v=>{ const [ks,c]=v.split(':'), cost=+c; if(state.coins<cost) return; state.coins-=cost; const its=[]; for(const k of ks.split(',')){ state.inv[k]=(state.inv[k]||0)+1; its.push(rwIng(k)); } closeModal(); rewardShow({chest:false,title:'Le lot de Rosa',sub:'Tout frais du potager',items:its}); },""")
RX("const MORE=[","const MORE=[['habit','Mes habitués','team','#ffc9d8','#e0457f','#a82a58'],")
RX("const ord=['garden','daily','story','quiz','exc','shows',","const ord=['garden','daily','story','quiz','exc','habit','shows',")
