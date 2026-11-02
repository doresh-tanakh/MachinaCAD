/* MIT-licensed MachinaCAD plain multiline text helpers. */
(function(root){'use strict';
function valid(o){return !!o&&typeof o.value==='string'&&o.value.length>0&&o.value.length<=2000&&!/[\x00-\x09\x0b-\x1f]/.test(o.value)&&o.value.split('\n').length<=50&&Number.isFinite(o.height)&&o.height>0&&Number.isFinite(o.width)&&o.width>0&&Number.isFinite(o.rotation||0)}
function decode(raw){let out='';for(let i=0;i<raw.length;i++){let c=raw[i];if(c==='{'||c==='}')return null;if(c!=='\\'){out+=c;continue}if(++i>=raw.length)return null;let n=raw[i];if(n==='P'||n==='p')out+='\n';else if(n==='\\'||n==='{'||n==='}')out+=n;else if(n==='U'&&raw[i+1]==='+'&&/^[0-9a-f]{4}$/i.test(raw.slice(i+2,i+6))){out+=String.fromCharCode(parseInt(raw.slice(i+2,i+6),16));i+=5}else return null}return out}
function encode(value){return value.replace(/\\/g,'\\\\').replace(/\{/g,'\\{').replace(/\}/g,'\\}').replace(/\n/g,'\\P')}
function chunks(value){let parts=[],chunk='';for(const ch of value){if(chunk.length+ch.length>249){parts.push(chunk);chunk=''}chunk+=ch}parts.push(chunk);return parts}
// Line breaking preserves all characters and explicit blank lines. Width is measured by the caller.
function wrap(value,width,measure){if(typeof value!=='string'||!Number.isFinite(width)||width<=0||typeof measure!=='function')throw Error('문자 폭이 올바르지 않습니다.');const segment=typeof Intl!=='undefined'&&Intl.Segmenter?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;let out=[];for(const paragraph of value.split('\n')){let chars=segment?Array.from(segment.segment(paragraph),v=>v.segment):Array.from(paragraph);if(!chars.length){out.push('');continue}let line='';for(const char of chars){let candidate=line+char;if(line&&measure(candidate)>width){out.push(line);line=char}else line=candidate}out.push(line)}return out}
root.MachinaMText={valid,decode,encode,chunks,wrap};if(typeof module!=='undefined')module.exports=root.MachinaMText;
})(typeof globalThis!=='undefined'?globalThis:this);
