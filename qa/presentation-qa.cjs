// jsdom integration, not rendered browser or touch QA.
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),results=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const server=http.createServer((req,res)=>{try{res.end(fs.readFileSync(path.resolve(root,'.'+decodeURI(req.url.split('?')[0]))))}catch(e){res.statusCode=404;res.end('missing')}});
function audio(){const param={setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};const o={connect(){return o},start(){},stop(){},frequency:{...param},gain:{...param}};return {currentTime:0,state:'running',destination:{},createOscillator:()=>o,createGain:()=>o,resume(){}}}
async function load(id){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>{if(e.type==='unhandled-exception'||e.type==='resource-loading')errors.push(e.message)});const d=await JSDOM.fromURL(`http://127.0.0.1:8766/games/${id}/index.html`,{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.matchMedia=()=>({matches:true});w.HTMLElement.prototype.scrollIntoView=function(){};w.ResizeObserver=class{observe(){}};w.AudioContext=audio}});await new Promise(r=>d.window.addEventListener('load',r));return {d,w:d.window,doc:d.window.document,errors}}
function click(doc,selector){const e=doc.querySelector(selector);assert(e,selector);e.click();return e}
(async()=>{await new Promise(r=>server.listen(8766,'127.0.0.1',r));try{
for(const id of fs.readdirSync(root+'/games')){
 const r={id,status:'PASS',checks:[]};let env;
 try{env=await load(id);const {doc,w}=env;click(doc,'#splash button');const cat=click(doc,'[data-hero="cat"]');await delay(0);assert.equal(cat.getAttribute('aria-pressed'),'true');assert.equal(doc.querySelector('[data-hero]:not([data-hero="cat"])').getAttribute('aria-pressed'),'false');r.checks.push('Hero selection accessible state follows engine');
 const result=doc.querySelector('#resultOverlay');if(result){assert(result.classList.contains('galaxy-result'));assert.equal(result.querySelectorAll('.galaxy-result-exit').length,1);w.GalaxyPresentation.result(result);assert.equal(result.querySelectorAll('.galaxy-result-exit').length,1);r.checks.push('Native result decorated once; original handlers retained')}
 if(id==='tictactoe'){
  click(doc,'#duoMode');click(doc,'#startAi');for(const i of [0,3,1,4,2]){doc.querySelectorAll('#board .cell')[i].click();await delay(10)}await delay(650);
  assert(result.classList.contains('open'));assert.equal(doc.querySelector('#resultScore').textContent,'Очки 150');assert.equal(result.getAttribute('aria-hidden'),'false');
  doc.querySelector('#playerName').value='QA Visual';click(doc,'#saveRecord');assert(w.localStorage.getItem('youthTttRecords').includes('QA Visual'));click(doc,'#resultReplay');await delay(0);
  assert(!result.classList.contains('open'));assert.equal(doc.querySelectorAll('#board .mark').length,0);assert.equal(result.getAttribute('aria-hidden'),'true');r.checks.push('Duo victory, save record, replay clears field and closes dialog');
 }
 if(id==='memory'){
  click(doc,'#aiMode,.modeCard');click(doc,'#playBtn');const groups=new Map();for(const c of doc.querySelectorAll('.memoryCard')){const key=c.querySelector('.cardFront').innerHTML;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c.dataset.i)}for(const pair of groups.values()){for(const i of pair)click(doc,`.memoryCard[data-i="${i}"]`);await delay(450)}
  const modal=doc.querySelector('#modal');assert(modal.classList.contains('open'));assert(modal.classList.contains('galaxy-result'));assert.equal(modal.querySelectorAll('.galaxy-result-exit').length,1);
  doc.querySelector('#recordName').value='fuck';click(doc,'#modalActions button');assert.equal(doc.querySelector('#modalTitle').textContent,'Имя не принято');assert(modal.classList.contains('galaxy-result'));assert(doc.querySelector('#recordName'));doc.querySelector('#recordName').value='QA Visual';click(doc,'#modalActions button');assert(w.localStorage.getItem('youthMemoryRecords').includes('QA Visual'));assert.equal(doc.querySelector('#modalTitle').textContent,'Результат сохранён');
  click(doc,'#modalActions button');assert.equal(doc.querySelectorAll('.memoryCard.matched').length,0);assert(!modal.classList.contains('open'));click(doc,'#homeBtn');click(doc,'#recordsBtn');assert(!modal.classList.contains('galaxy-result'));assert.equal(modal.querySelectorAll('.galaxy-result-exit').length,0);r.checks.push('All 8 pairs, name validation retry, native save, new result replay, ordinary records dialog reset');
 }
 if(['domino','solitaire'].includes(id)){
  w.resultModal('QA fixture','Presentation integration',[id==='domino'?['ОК',()=>{}]:{label:'ОК'}]);assert(doc.querySelector('#modal.galaxy-result .galaxy-result-exit'));
  w.modal('QA ordinary','Presentation integration');assert(!doc.querySelector('#modal').classList.contains('galaxy-result'));assert(!doc.querySelector('#modal .galaxy-result-exit'));r.checks.push('Explicit result renderer fixture; ordinary dialog reset (not gameplay finish)');
 }
 assert.equal(env.errors.length,0,env.errors.join('; '));
 }catch(e){r.status='FAIL';r.failure=e.message;process.exitCode=1}finally{env?.d.window.close()}
 results.push(r);console.log(id,r.status,r.failure||'');
}
}finally{fs.writeFileSync(path.join(__dirname,'results/presentation-qa-results.json'),JSON.stringify({runtime:'jsdom integration, NOT browser visual QA',mocked:['AudioContext','ResizeObserver','matchMedia','scrollIntoView'],results},null,2));server.close()}})();
