/* MachinaCAD — MIT. Limited two-layer Gerber X2 / decimal Excellon export. */
(function(root){'use strict';
const fmt=n=>Number(n.toFixed(6)).toFixed(6),coord=n=>String(Math.round(n*1e6));
function generate(objects,options={}){
 const pcb=root.MachinaPCB||(typeof require==='function'?require('./pcb.js'):null);
 const maskExpansion=options.maskExpansion??.05;
 if(!Number.isFinite(maskExpansion)||maskExpansion<0||maskExpansion>1)throw Error('마스크 확장은 0~1 mm여야 합니다.');
 const report=pcb.checks(objects,options.rules);
 if(report.issues.length)throw Error('PCB 기본 검사 '+report.issues.length+'개 항목을 먼저 해결하세요.\n'+report.issues.slice(0,8).map(i=>i.code+': '+i.message).join('\n'));
 const all=pcb.items(objects);if(all.some(o=>o.pcb.ref)){const linker=root.MachinaBoardLink||(typeof require==='function'?require('./boardlink.js'):null),mapping=linker.audit(objects);if(mapping.issues.length)throw Error('회로 핀 매핑 '+mapping.issues.length+'개 항목을 먼저 해결하세요.')}const board=all.find(o=>o.pcb.kind==='board'),copper=all.filter(o=>o.pcb.kind!=='board');
 if(!copper.length)throw Error('내보낼 PCB 동박이 없습니다.');
 const origin={x:Math.min(board.a.x,board.b.x),y:Math.min(board.a.y,board.b.y)},size={x:Math.abs(board.b.x-board.a.x),y:Math.abs(board.b.y-board.a.y)};
 if(size.x<.000001||size.y<.000001||Math.round(size.x*1e6)>=1e10||Math.round(size.y*1e6)>=1e10)throw Error('보드 크기는 각 방향 0.000001 mm 이상, 10000 mm 미만이어야 합니다.');
 const point=p=>{const q={x:p.x-origin.x,y:p.y-origin.y};if(![q.x,q.y].every(n=>Number.isFinite(n)&&Math.abs(Math.round(n*1e6))<1e10))throw Error('Gerber 좌표 범위를 넘었습니다.');return q};
 const xy=p=>'X'+coord(p.x)+'Y'+coord(p.y);
 const diameter=n=>{if(!Number.isFinite(n)||n<.000001||n>2002)throw Error('출력 가능한 지름·폭 범위를 넘었습니다.');return fmt(n)};
 function gerber(fn,polarity,features){
  const apertures=new Map();features.forEach(f=>{const d=diameter(f.d);if(!apertures.has(d))apertures.set(d,10+apertures.size)});
  const lines=['G04 MachinaCAD - millimeters - shared lower-left origin*','%TF.GenerationSoftware,MachinaCAD,MachinaCAD,0.2.24*%','%TF.FileFunction,'+fn+'*%','%TF.FilePolarity,'+polarity+'*%','%FSLAX46Y46*%','%MOMM*%',...Array.from(apertures,([d,id])=>'%ADD'+id+'C,'+d+'*%'),'%LPD*%','G01*'];
  let selected=null;for(const f of features){const id=apertures.get(diameter(f.d));if(id!==selected){lines.push('D'+id+'*');selected=id}if(f.b)lines.push(xy(f.a)+'D02*',xy(f.b)+'D01*');else lines.push(xy(f.a)+'D03*')}
  return lines.concat('M02*','').join('\n');
 }
 for(const o of copper)if(o.pcb.kind==='trace'){const a=point(o.a),b=point(o.b);if(coord(a.x)===coord(b.x)&&coord(a.y)===coord(b.y))throw Error('1 µm 좌표 정밀도에서 사라지는 배선이 있습니다.');}
 const files={},holes=[],holeKeys=new Set(),roundPads=copper.filter(o=>o.pcb.kind==='pad');
 for(const o of roundPads)if(o.pcb.side==='through'){
  const a=point(o.a),d=diameter(o.pcb.drill),key=coord(a.x)+','+coord(a.y)+','+d;
  if(holeKeys.has(key))continue;
  if(holes.some(h=>Math.hypot(a.x-h.a.x,a.y-h.a.y)<(Number(d)+h.d)/2-1e-6))throw Error('겹치는 드릴 홀이 있습니다. 슬롯 출력은 지원하지 않습니다.');
  holeKeys.add(key);holes.push({a,d:Number(d)});
 }
 for(const side of ['top','bottom']){
  const features=copper.filter(o=>o.pcb.side===side||o.pcb.side==='through').map(o=>o.pcb.kind==='trace'?{a:point(o.a),b:point(o.b),d:o.pcb.width}:{a:point(o.a),d:Math.hypot(o.b.x-o.a.x,o.b.y-o.a.y)*2});
  files[side==='top'?'board-F_Cu.gbr':'board-B_Cu.gbr']=gerber('Copper,L'+(side==='top'?1:2)+','+(side==='top'?'Top':'Bot'),'Positive',features);
  const pads=roundPads.filter(o=>o.pcb.side===side||o.pcb.side==='through').map(o=>({a:point(o.a),d:Math.hypot(o.b.x-o.a.x,o.b.y-o.a.y)*2+maskExpansion*2}));
  files[side==='top'?'board-F_Mask.gbr':'board-B_Mask.gbr']=gerber('Soldermask,'+(side==='top'?'Top':'Bot'),'Negative',pads);
 }
 const corners=[{x:0,y:0},{x:size.x,y:0},{x:size.x,y:size.y},{x:0,y:size.y}];
 files['board-Edge_Cuts.gbr']=gerber('Profile,NP','Positive',corners.map((a,i)=>({a,b:corners[(i+1)%4],d:.05})));
 if(holes.length){const tools=new Map();holes.forEach(h=>{if(!tools.has(fmt(h.d)))tools.set(fmt(h.d),tools.size+1)});const lines=['M48','; MachinaCAD plated through holes - shared origin','METRIC,LZ','G90',';TYPE=PLATED',...Array.from(tools,([d,id])=>'T'+String(id).padStart(2,'0')+'C'+d),'%','M71'];for(const [d,id] of tools){lines.push('T'+String(id).padStart(2,'0'));holes.filter(h=>fmt(h.d)===d).forEach(h=>lines.push('X'+fmt(h.a.x)+'Y'+fmt(h.a.y)))}files['board-PTH.drl']=lines.concat('M30','').join('\n')}
 files['README.txt']=['MachinaCAD 0.2.24 - limited two-layer fabrication export','Units: mm. Coordinates: right-handed XY, no bottom-layer mirroring.','Shared origin: source ('+fmt(origin.x)+', '+fmt(origin.y)+') mm, lower-left of rectangular board.','Board size: '+fmt(size.x)+' x '+fmt(size.y)+' mm.','Copper: F_Cu = top (L1); B_Cu = bottom (L2). Mask files represent openings.','Mask expansion: '+fmt(maskExpansion)+' mm radial around pads; traces remain masked.','Edge_Cuts: closed rectangular centerline, 0.05 mm plotting aperture; not a routed slot.','PTH.drl: decimal millimeter drill hits; all holes are intended plated, no slots or NPTH.','Included only semantic PCB objects. Other CAD geometry, schematic symbols and text are omitted.','Unsupported: footprints, planes/pours, thermal relief, stencil/paste, legend, vias distinct from pads, stack-up and impedance rules.','Basic geometric checks passed using rules: '+JSON.stringify(report.rules), 'This is not complete DRC, electrical verification or fabrication approval.','Review the entire layer stack and drill interpretation in an independent CAM tool and agree on stack-up and finished hole sizes with the fabricator.',''].join('\n');
 return{files,origin,size,holeCount:holes.length,report};
}
// ZIP "store" with CRC32, no dependency or executable archive entries.
function zip(files){const enc=new TextEncoder(),entries=Object.entries(files);if(entries.length>65535)throw Error('Too many ZIP entries');const table=Array.from({length:256},(_,i)=>{let c=i;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);return c>>>0}),crc=b=>{let c=0xffffffff;for(const n of b)c=(c>>>8)^table[(c^n)&255];return(c^0xffffffff)>>>0};let local=[],central=[],offset=0;const header=(length)=>{const a=new Uint8Array(length);return[a,new DataView(a.buffer)]};for(const [name,content] of entries){if(!/^[A-Za-z0-9_.-]+$/.test(name))throw Error('Invalid ZIP filename');const n=enc.encode(name),b=enc.encode(content),sum=crc(b),[l,v]=header(30+n.length);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(12,33,true);v.setUint32(14,sum,true);v.setUint32(18,b.length,true);v.setUint32(22,b.length,true);v.setUint16(26,n.length,true);l.set(n,30);local.push(l,b);const [c,w]=header(46+n.length);w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(14,33,true);w.setUint32(16,sum,true);w.setUint32(20,b.length,true);w.setUint32(24,b.length,true);w.setUint16(28,n.length,true);w.setUint32(42,offset,true);c.set(n,46);central.push(c);offset+=l.length+b.length}const length=central.reduce((s,a)=>s+a.length,0),[end,e]=header(22);e.setUint32(0,0x06054b50,true);e.setUint16(8,entries.length,true);e.setUint16(10,entries.length,true);e.setUint32(12,length,true);e.setUint32(16,offset,true);const out=new Uint8Array(offset+length+22);let i=0;for(const a of [...local,...central,end]){out.set(a,i);i+=a.length}return out}
root.MachinaFabrication={generate,zip};if(typeof module!=='undefined')module.exports=root.MachinaFabrication;
})(typeof globalThis!=='undefined'?globalThis:this);
