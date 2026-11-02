/* MIT-licensed MachinaCAD plain multiline text helpers. */
(function(root){'use strict';
function valid(o){return !!o&&typeof o.value==='string'&&o.value.length>0&&o.value.length<=2000&&!/[\x00-\x09\x0b-\x1f]/.test(o.value)&&o.value.split('\n').length<=50&&Number.isFinite(o.height)&&o.height>0&&Number.isFinite(o.width)&&o.width>0&&Number.isFinite(o.rotation||0)}
function decode(raw){let out='';for(let i=0;i<raw.length;i++){let c=raw[i];if(c==='{'||c==='}')return null;if(c!=='\\'){out+=c;continue}if(++i>=raw.length)return null;let n=raw[i];if(n==='P'||n==='p')out+='\n';else if(n==='\\'||n==='{'||n==='}')out+=n;else if(n==='U'&&raw[i+1]==='+'&&/^[0-9a-f]{4}$/i.test(raw.slice(i+2,i+6))){out+=String.fromCharCode(parseInt(raw.slice(i+2,i+6),16));i+=5}else return null}return out}
function encode(value){return value.replace(/\\/g,'\\\\').replace(/\{/g,'\\{').replace(/\}/g,'\\}').replace(/\n/g,'\\P')}
function chunks(value){let parts=[],chunk='';for(const ch of value){if(chunk.length+ch.length>249){parts.push(chunk);chunk=''}chunk+=ch}parts.push(chunk);return parts}
root.MachinaMText={valid,decode,encode,chunks};if(typeof module!=='undefined')module.exports=root.MachinaMText;
})(typeof globalThis!=='undefined'?globalThis:this);
