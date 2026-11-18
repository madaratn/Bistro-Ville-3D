# v0.78 : option « Effets d'image »
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('gfx_patch',a[:70],c); js=js.replace(a,b)
RX("+tg('lite',LITE,'Mode léger',","+tg('gfx',typeof GFX!=='undefined'&&GFX.on,'Effets d’image','Lueurs, flou de profondeur, couleurs plus riches')+tg('lite',LITE,'Mode léger',")
RX("else if(t==='lite'){","else if(t==='gfx'){ try{ localStorage.setItem('bv_gfx',GFX.on?'0':'1'); GFX.on=!GFX.on&&!LITE; }catch(e){} } else if(t==='lite'){")
