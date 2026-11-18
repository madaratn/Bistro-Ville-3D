# v0.91 : défis express, mini-jeux, énergie qui revient plus vite
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('fun_patch',a[:70],c); js=js.replace(a,b)
RX("const PANELS={",open('src/fun.js').read()+"\nconst PANELS={")
RX("function update(dt){ momTick(dt); evTick(dt);","function update(dt){ momTick(dt); evTick(dt); try{ dxTick(); }catch(e){}")
RX("const EN_MAX=20, EN_MS=60000,","const EN_MAX=20, EN_MS=20000,")
RX("Elle revient vite : 1 par minute, et le plein à chaque nouvelle journée.","Elle revient vite (1 toutes les 20 secondes). Les défis et les mini-jeux en rendent aussi.")
RX("(20 au maximum, 1 de plus chaque minute, le plein chaque matin)","(20 au maximum, 1 de plus toutes les 20 secondes, le plein chaque matin)")
