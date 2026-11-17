# v0.52 : beaucoup plus d'objets de décoration pour la salle
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('decor_patch',a[:70],c); js=js.replace(a,b)
RX(" plant:{n:'Plante verte',cat:'Déco',p:60,d:2,u:1,kind:'plant'},",""" plant:{n:'Plante verte',cat:'Déco',p:60,d:2,u:1,kind:'plant'},
 cactus:{n:'Cactus',cat:'Déco',p:40,d:2,u:1,kind:'decor',m:'cactus'},
 vase:{n:'Vase fleuri',cat:'Déco',p:70,d:3,u:1,kind:'decor',m:'vase'},
 coatrack:{n:'Porte-manteau',cat:'Déco',p:80,d:2,u:1,kind:'decor',m:'coatrack'},
 easel:{n:'Ardoise sur chevalet',cat:'Déco',p:100,d:3,u:2,kind:'decor',m:'easel'},
 olive:{n:'Olivier en pot',cat:'Déco',p:110,d:4,u:2,kind:'decor',m:'olive'},
 lantern:{n:'Lanterne',cat:'Déco',p:90,d:3,u:2,kind:'decor',m:'lantern'},
 barrel:{n:'Tonneau à bougie',cat:'Déco',p:120,d:4,u:2,kind:'decor',m:'barrel'},
 candles:{n:'Guéridon aux bougies',cat:'Déco',p:140,d:4,u:3,kind:'decor',m:'candles'},
 palm:{n:'Palmier',cat:'Déco',p:150,d:5,u:3,kind:'decor',m:'palm'},
 screen:{n:'Paravent',cat:'Déco',p:180,d:5,u:3,kind:'decor',m:'screen'},
 winerack:{n:'Casier à vin',cat:'Déco',p:220,d:6,u:3,kind:'decor',m:'winerack'},
 books:{n:'Bibliothèque',cat:'Déco',p:260,d:7,u:4,kind:'decor',m:'books'},
 globe:{n:'Globe terrestre',cat:'Déco',p:240,d:6,u:4,kind:'decor',m:'globe'},
 cage:{n:'Cage à oiseau',cat:'Déco',p:280,d:7,u:5,kind:'decor',m:'cage'},
 gramo:{n:'Gramophone',cat:'Déco',p:320,d:8,u:5,kind:'decor',m:'gramo'},
 piano:{n:'Piano droit',cat:'Déco',p:900,d:14,u:7,kind:'decor',m:'piano'},""")
RX("['plant','flowers','lamp','jukebox','aquarium','fountain','statue'].includes(k)?0:","['plant','flowers','lamp','jukebox','aquarium','fountain','statue','decor'].includes(k)?0:")
