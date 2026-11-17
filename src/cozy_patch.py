# v0.18 : personnages « cosy » — familles avec enfants
RP("x:sx,y:S+1,fx:sx,fy:S+1,speed:rnd(.95,1.15),ex,pat:100}); if(opt){","x:sx,y:S+1,fx:sx,fy:S+1,speed:rnd(.95,1.15),ex,pat:100}); if(opt&&opt.kids&&opt.kids[i]) c.kidF=true; if(opt){")
RP("const av=DRINKS.filter(drinkOK);","const av=DRINKS.filter(d=>drinkOK(d)&&!(c.kidF&&!['eau','soda','jus'].includes(d.id)));")
RP("P=[ch.x+d[0]*.27,ch.y+d[1]*.27]","P=[ch.x+d[0]*.43,ch.y+d[1]*.43]")
