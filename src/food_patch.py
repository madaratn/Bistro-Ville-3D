# v0.24 : vignettes 3D des plats dans les menus
n=js.count('<div class="emo">${d.e}</div>'); assert n>=3, n
js=js.replace('<div class="emo">${d.e}</div>','<div class="emo">${foodIcon(d.e)}</div>')
RP("c.st='eat'; c.t=rnd(7,10); c.headT=0; c.phone=false;","c.st='eat'; c.t=c.eatT=rnd(7,10); c.headT=0; c.phone=false;")
