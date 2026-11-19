# v0.97 : réglage « Personnages détaillés » (on peut revenir aux personnages d'avant, à chaud)
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('hd_patch',a[:70],c); js=js.replace(a,b)
RX("data-a=\"optgfx\" ${LITE?'disabled':''}>${typeof GFX!=='undefined'&&GFX.on?'Activés':'Coupés'}</button></div>`;",
   "data-a=\"optgfx\" ${LITE?'disabled':''}>${typeof GFX!=='undefined'&&GFX.on?'Activés':'Coupés'}</button></div>`;\n  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">👤 Personnages détaillés</div><div class=\"sub\">Visages, coiffures, tenues, et gros plans animés dans les dialogues</div></div><button class=\"b sm ${typeof HD!=='undefined'&&HD.on?'green':'alt'}\" data-a=\"opthd\">${typeof HD!=='undefined'&&HD.on?'Activés':'Coupés'}</button></div>`;")
RX(" optgfx:()=>{ if(LITE) return;"," opthd:()=>{ HD.on=!HD.on; try{ localStorage.setItem('bv_hd',HD.on?'1':'0'); }catch(e){} try{ for(const [a,o] of aObjs){ agentRoot.remove(o.root); charFree(o); } aObjs.clear(); }catch(e){} },\n optgfx:()=>{ if(LITE) return;")
