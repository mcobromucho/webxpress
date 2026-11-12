/* WebXpress · destellos del cursor (compartido). Colores en data-c del <script>. Ligero: pool de 14 elementos, solo transform/opacity, sin bucles rAF; apagado en táctil o con "reducir movimiento". */
(()=>{
if(!matchMedia("(hover:hover) and (pointer:fine)").matches||matchMedia("(prefers-reduced-motion:reduce)").matches||!Element.prototype.animate)return;
const me=document.currentScript,C=((me&&me.dataset.c)||"#ffffff").split(","),T=+((me&&me.dataset.t)||650),pool=[];let k=0,last=0,lx=0,ly=0;
for(let i=0;i<14;i++){const e=document.createElement("i");e.className="lc-s";e.setAttribute("aria-hidden","true");document.body.appendChild(e);pool.push(e)}
const spark=(x,y,dx,dy,s,d)=>{const e=pool[k++%pool.length];e.style.setProperty("--c",C[(Math.random()*C.length)|0]);
e.animate([{opacity:0,transform:`translate(${x}px,${y}px) scale(0) rotate(0deg)`},{opacity:1,transform:`translate(${x+dx*.4}px,${y+dy*.4}px) scale(${s}) rotate(60deg)`,offset:.3},{opacity:0,transform:`translate(${x+dx}px,${y+dy}px) scale(0) rotate(140deg)`}],{duration:d,easing:"cubic-bezier(.2,.7,.3,1)"})};
addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const t=e.timeStamp;if(t-last<110)return;const dx=e.clientX-lx,dy=e.clientY-ly;if(dx*dx+dy*dy<900)return;last=t;lx=e.clientX;ly=e.clientY;
spark(e.clientX+8,e.clientY+14,(Math.random()-.5)*14,10+Math.random()*10,.55+Math.random()*.4,T)},{passive:true});
addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")return;for(let i=0;i<6;i++){const a=i/6*6.283+Math.random()*.5,r=18+Math.random()*16;spark(e.clientX,e.clientY,Math.cos(a)*r,Math.sin(a)*r,.7+Math.random()*.5,T-130)}},{passive:true});
})();
