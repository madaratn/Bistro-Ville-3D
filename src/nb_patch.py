# v0.94 : les voisins de l'histoire viennent manger au bistrot
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('nb_patch',a[:70],c); js=js.replace(a,b)
RX("const PANELS={",open('src/nb.js').read()+"\nconst PANELS={")
RX("function regMeal(c,d,price,sat){ if(warming||cine||!d||sat<60||Math.random()>.14) return;","function regMeal(c,d,price,sat){ if(c&&c.nb){ try{ nbMeal(c,d,price,sat); }catch(e){ console.warn(e); } return; } if(warming||cine||!d||sat<60||Math.random()>.14) return;")
RX("try{ dxTick(); }catch(e){}","try{ dxTick(); nbTick(); }catch(e){}")
RX("return {title:'Mes habitués',html:`<p class=\"center sub\">","return {title:'Mes habitués',html:nbHTML()+`<p class=\"center sub\">")
RX("<p class=\"center\"><button class=\"b\" data-a=\"close\">Continuer</button></p>`})); }\nfunction souvSvg()","${(k=>k?'<p class=\"center nbNew\"><img src=\"'+(foodThumbs['who:'+k]||'')+'\" alt=\"\"><span><b>'+NB[k].n+'</b> viendra désormais manger chez toi, vers '+nbHour(NB[k].h)+'.</span></p>':'')(Object.keys(NB).find(k=>NB[k].after===ch+1))}<p class=\"center\"><button class=\"b\" data-a=\"close\">Continuer</button></p>`})); }\nfunction souvSvg()")
