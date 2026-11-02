/* MIT-licensed planar three-point angular dimensions. */
(function(root){'use strict';const TAU=2*Math.PI;
function valid(o){if(!o||!o.vertex||![o.a?.x,o.a?.y,o.b?.x,o.b?.y,o.vertex.x,o.vertex.y,o.arcRadius].every(Number.isFinite)||o.arcRadius<=1e-9)return false;let x=o.a.x-o.vertex.x,y=o.a.y-o.vertex.y,u=o.b.x-o.vertex.x,v=o.b.y-o.vertex.y;return Math.hypot(x,y)>1e-9&&Math.hypot(u,v)>1e-9&&Math.abs(x*v-y*u)>1e-10*Math.hypot(x,y)*Math.hypot(u,v)}
function geometry(o){if(!valid(o))throw Error('각도 치수의 두 방향과 반지름을 확인하세요.');let start=Math.atan2(o.a.y-o.vertex.y,o.a.x-o.vertex.x),span=((Math.atan2(o.b.y-o.vertex.y,o.b.x-o.vertex.x)-start)%TAU+TAU)%TAU,r=o.arcRadius,at=t=>({x:o.vertex.x+r*Math.cos(t),y:o.vertex.y+r*Math.sin(t)});return{start,span,r,c:at(start),d:at(start+span),text:at(start+span/2),measure:span*180/Math.PI}}
function segments(o){let g=geometry(o),n=Math.max(8,Math.ceil(g.span/(Math.PI/90))),out=[[o.a,g.c],[o.b,g.d]],prev=g.c;for(let i=1;i<=n;i++){let t=g.start+g.span*i/n,p={x:o.vertex.x+g.r*Math.cos(t),y:o.vertex.y+g.r*Math.sin(t)};out.push([prev,p]);prev=p}return out}
root.MachinaAngular={valid,geometry,segments};if(typeof module!=='undefined')module.exports=root.MachinaAngular;
})(typeof globalThis!=='undefined'?globalThis:this);
