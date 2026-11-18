# v0.70 : à 23 h l'horloge s'arrête. On ferme la porte, les derniers clients terminent, PUIS vient le bilan.
# Ensuite il reste 23 h (nuit) tant que le joueur n'a pas rouvert : le nouveau jour ne démarre qu'à l'ouverture.
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('night_patch',a[:70],c); js=js.replace(a,b)
RX(" if(d.t>=DAY_LEN) dayEnd(); }",""" if(d.t>=DAY_LEN){ d.t=DAY_LEN; if(!d.closing){ d.closing=1; d.ct=0; if(isOpen()) setOpen(false); const r=inHouse(); if(r) toast('23 h : on ferme la porte. Le bilan arrive quand les '+r+' derniers clients seront partis.'); }
  d.ct=(d.ct||0)+dt; if(!inHouse()||d.ct>300) dayEnd(); } }""")
RX("function dayTick(dt){ const d=dayOf(); d.t+=dt;","function dayTick(dt){ const d=dayOf(); if(d.night) return; d.t+=dt;")
RX("state.day={n:d.n+1,t:0,","state.day={night:1,n:d.n+1,t:0,")
RX("function setOpen(o){ state.open=!!o;","""function setOpen(o){ { const d=dayOf(); if(o&&d.closing&&!d.night){ sfx('pop'); return toast('Il est 23 h : on ne rouvre plus ce soir. Le bilan arrive dès que la salle est vide.'); } if(o&&d.night){ delete d.night; d.t=0; setTimeout(()=>toast('Jour '+d.n+' · 8 h. Bonne journée !'),900); } } state.open=!!o;""")
RX("const gameHour=()=>8+Math.min(1,dayOf().t/DAY_LEN)*15;","const gameHour=()=>dayOf().night?23:8+Math.min(1,dayOf().t/DAY_LEN)*15;")
RX("{ const d=dayOf(), h=8+d.t/DAY_LEN*15, hh=","{ const d=dayOf(), h=d.night?23:8+Math.min(1,d.t/DAY_LEN)*15, hh=")
RX("$('#sJour').innerHTML='<b>Jour '+d.n+'</b><span>'+hh+' h '+String(mm).padStart(2,'0')+'</span><em>'+svcNow().s+'</em>';","$('#sJour').innerHTML='<b>Jour '+(d.night?d.n-1:d.n)+'</b><span>'+hh+' h '+String(mm).padStart(2,'0')+'</span><em>'+(d.night?'Nuit · fermé':d.closing?'Fermeture':svcNow().s)+'</em>';")
RX("Jour ${d.n} · fermeture dans ${mn} min</div>","${d.night?'Jour '+(d.n-1)+' terminé · il est 23 h':d.closing?'Jour '+d.n+' · 23 h, les derniers clients terminent':'Jour '+d.n+' · fermeture dans '+mn+' min'}</div>")
RX("Le bistrot est fermé pour la nuit. Si tu fermes cette fenêtre, il reste fermé : profites-en pour refaire la déco, puis ouvre quand tu veux.","Le bistrot est fermé pour la nuit et l’horloge reste à 23 h. Profites-en pour refaire la déco : le jour ${n+1} ne commence que quand tu ouvres (ce bouton, ou la pancarte de la porte).")
RX("À 23 h tombe le bilan du jour.","À 23 h on ferme la porte ; le bilan tombe quand le dernier client est parti.")
RX("(isOpen()||inHouse())) dayTick(dt)","(isOpen()||inHouse()||(dayOf().closing&&!dayOf().night))) dayTick(dt)")
