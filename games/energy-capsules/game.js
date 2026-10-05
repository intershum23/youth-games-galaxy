(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const GAME_ID='energy-capsules';
const MODE={
 a:{label:'GAME A',baseSpawn:1180,minSpawn:620,baseTravel:2750,minTravel:1900,maxActive:1,guard:520,scoreMul:1},
 b:{label:'GAME B',baseSpawn:920,minSpawn:450,baseTravel:2350,minTravel:1500,maxActive:2,guard:430,scoreMul:1},
 turbo:{label:'TURBO',baseSpawn:720,minSpawn:300,baseTravel:1950,minTravel:1050,maxActive:3,guard:300,scoreMul:2}
};
const HERO={corgi:{src:'../../assets/corgi.png',alt:'Капитан Корги'},cat:{src:'../../assets/cat.png',alt:'Космо-Кот'}};
const LANE_POINTS=[{sx:7,sy:18,ex:36,ey:57},{sx:93,sy:18,ex:64,ey:57},{sx:7,sy:48,ex:36,ey:78},{sx:93,sy:48,ex:64,ey:78}];
let hero='corgi',mode='a',running=false,paused=false,autoPaused=false,score=0,lives=3,streak=0,bestStreak=0,caught=0,missed=0,selectedLane=0,capsules=[],spawnElapsed=0,lastTs=0,raf=0,seq=0,resultSaved=false,soundOn=true,actx=null;
function show(id){$$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));if(id!=='game')stopLoop();}
function modeCfg(){return MODE[mode]||MODE.a}
function getGameData(){return window.YouthRecords?.getGame?.(GAME_ID)||{records:{}}}
function best(){return Number(window.YouthRecords?.getBest?.(mode,GAME_ID)||0)}
function updateHud(){
 $('#scoreValue').textContent=score.toLocaleString('ru-RU');$('#bestValue').textContent=Math.max(best(),score).toLocaleString('ru-RU');
 $('#livesValue').textContent='●'.repeat(Math.max(0,lives))+'○'.repeat(Math.max(0,3-lives));$('#streakValue').textContent=streak;
 const cfg=modeCfg();const level=Math.max(1,Math.min(9,1+Math.floor(caught/12)));$('#speedText').textContent='Скорость '+level;
}
function setHero(id){hero=HERO[id]?id:'corgi';$$('[data-hero]').forEach(b=>b.classList.toggle('on',b.dataset.hero===hero));const h=HERO[hero];$('#playerImg').src=h.src;$('#playerImg').alt=h.alt;}
function selectLane(lane){if(!running||paused||!Number.isInteger(lane)||lane<0||lane>3)return;selectedLane=lane;$$('.catchBtn').forEach(b=>b.classList.toggle('on',Number(b.dataset.lane)===lane));$$('.catchPoint').forEach(p=>p.classList.toggle('on',Number(p.dataset.lane)===lane));$('#fieldHint').textContent=['Верхний левый','Верхний правый','Нижний левый','Нижний правый'][lane];sound('move');}
function speedParams(){const cfg=modeCfg(),progress=Math.min(1,caught/70);return {spawn:Math.round(cfg.baseSpawn-(cfg.baseSpawn-cfg.minSpawn)*progress),travel:Math.round(cfg.baseTravel-(cfg.baseTravel-cfg.minTravel)*progress)}}
function safeLane(travel){let lane=Math.floor(Math.random()*4),closest=null;for(const c of capsules){const remain=(1-c.p)*c.travel;if(Math.abs(remain-travel)<modeCfg().guard){closest=c.lane;break}}if(closest!=null)lane=closest;return lane;}
function spawn(){const cfg=modeCfg();if(capsules.length>=cfg.maxActive)return false;const sp=speedParams(),lane=safeLane(sp.travel),bonus=Math.random()<0.085;const el=document.createElement('div');el.className='capsule'+(bonus?' bonus':'');el.dataset.lane=lane;el.dataset.id=String(++seq);$('#capsuleLayer').appendChild(el);capsules.push({id:seq,lane,p:0,travel:sp.travel*(bonus?.88:1),bonus,el});return true;}
function renderCapsule(c){const p=LANE_POINTS[c.lane],ease=c.p<.5?2*c.p*c.p:1-Math.pow(-2*c.p+2,2)/2;const x=p.sx+(p.ex-p.sx)*ease,y=p.sy+(p.ey-p.sy)*ease;const angle=Math.atan2(p.ey-p.sy,p.ex-p.sx)*180/Math.PI;c.el.style.left=x+'%';c.el.style.top=y+'%';c.el.style.transform=`translate(-50%,-50%) rotate(${angle}deg) scale(${.78+.22*ease})`;}
function removeCapsule(c){c.el?.remove();const i=capsules.indexOf(c);if(i>=0)capsules.splice(i,1)}
function catchCapsule(c){const base=c.bonus?3:1,mult=Math.min(3,1+Math.floor(streak/10));score+=base*modeCfg().scoreMul*mult;caught++;streak++;bestStreak=Math.max(bestStreak,streak);removeCapsule(c);$('#stateText').textContent=c.bonus?'Бонусная капсула +'+(base*modeCfg().scoreMul*mult):'Капсула принята';sound(c.bonus?'bonus':'catch');flashPoint(c.lane,true);updateHud();}
function missCapsule(c){missed++;lives--;streak=0;removeCapsule(c);$('#stateText').textContent='Пропуск! Переключите позицию';sound('miss');flashPoint(c.lane,false);updateHud();if(lives<=0)finish();}
function flashPoint(lane,ok){const p=$(`.catchPoint[data-lane="${lane}"]`);if(!p)return;p.animate([{filter:'brightness(1)'},{filter:`brightness(${ok?1.8:1.4})`,background:ok?'rgba(102,233,255,.48)':'rgba(255,80,146,.45)'},{filter:'brightness(1)'}],{duration:260,easing:'ease-out'});}
function tick(ts){if(!running)return;if(!lastTs)lastTs=ts;const dt=Math.min(50,ts-lastTs);lastTs=ts;if(!paused){spawnElapsed+=dt;const sp=speedParams();if(spawnElapsed>=sp.spawn){spawnElapsed%=sp.spawn;spawn()}
 for(const c of [...capsules]){c.p+=dt/c.travel;if(c.p>=1){if(selectedLane===c.lane)catchCapsule(c);else missCapsule(c)}else renderCapsule(c)}}raf=requestAnimationFrame(tick);}
function clearCapsules(){for(const c of capsules)c.el?.remove();capsules=[]}
function stopLoop(){running=false;paused=false;document.body.classList.remove('paused');cancelAnimationFrame(raf);raf=0;lastTs=0;clearCapsules();GameLifecycle.begin();}
function startGame(nextMode=mode){stopLoop();mode=MODE[nextMode]?nextMode:'a';score=0;lives=3;streak=0;bestStreak=0;caught=0;missed=0;selectedLane=0;spawnElapsed=650;resultSaved=false;running=true;paused=false;autoPaused=false;$('#modeBadge').textContent=MODE[mode].label;$('#stateText').textContent='Перехватывайте капсулы';$('#pauseBtn').textContent='Ⅱ';$('#pauseBtn').setAttribute('aria-label','Пауза');setHero(hero);show('game');running=true;selectLane(0);updateHud();lastTs=0;raf=requestAnimationFrame(tick);}
function togglePause(force){if(!running)return;paused=typeof force==='boolean'?force:!paused;document.body.classList.toggle('paused',paused);$('#pauseBtn').textContent=paused?'▶':'Ⅱ';$('#pauseBtn').setAttribute('aria-label',paused?'Продолжить':'Пауза');$('#stateText').textContent=paused?'Пауза':'Перехватывайте капсулы';lastTs=0;}
function saveResult(){if(resultSaved)return;resultSaved=true;const data=getGameData(),records={...(data.records||{})},arr=Array.isArray(records[mode])?[...records[mode]]:[];arr.push({score,caught,missed,bestStreak,mode,date:new Date().toISOString()});arr.sort((a,b)=>Number(b.score||0)-Number(a.score||0)||String(b.date||'').localeCompare(String(a.date||'')));records[mode]=arr.slice(0,10);window.YouthRecords?.saveGame?.({records,last:{score,caught,missed,bestStreak,mode,date:new Date().toISOString()}},GAME_ID);window.YouthRecords?.updateBest?.(mode,score,GAME_ID);if(parent!==window)parent.postMessage({type:'mm-records-changed',game:GAME_ID},location.origin);}
function finish(){if(!running)return;running=false;cancelAnimationFrame(raf);raf=0;saveResult();$('#resultTitle').textContent='Энергия удержана';$('#resultText').textContent=`${MODE[mode].label}: реактор принял ${caught} капсул, пропущено ${missed}.`;$('#resultScore').textContent=score.toLocaleString('ru-RU');$('#resultCaught').textContent=caught;$('#resultCombo').textContent=bestStreak;$('#resultOverlay').classList.add('open');sound('end');}
function renderRecords(){const data=getGameData(),labels={a:'GAME A',b:'GAME B',turbo:'TURBO'},rows=[];for(const [m,arr] of Object.entries(data.records||{}))for(const r of (Array.isArray(arr)?arr:[]))rows.push({...r,mode:m});rows.sort((a,b)=>Number(b.score||0)-Number(a.score||0));const box=$('#recordsList');box.innerHTML='';if(!rows.length){box.innerHTML='<div class="record"><div class="rank">—</div><div><strong>Пока пусто</strong><small>Завершите первый раунд</small></div><b>0</b></div>';return}rows.slice(0,12).forEach((r,i)=>{const row=document.createElement('div');row.className='record';const date=r.date?new Date(r.date).toLocaleDateString('ru-RU'):'';row.innerHTML=`<div class="rank">${i+1}</div><div><strong>${labels[r.mode]||r.mode}</strong><small>${Number(r.caught||0)} капсул${date?' • '+date:''}</small></div><b>${Number(r.score||0).toLocaleString('ru-RU')}</b>`;box.appendChild(row)});}
function sound(kind){if(!soundOn)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const t=actx.currentTime,g=actx.createGain();g.connect(actx.destination);g.gain.setValueAtTime(.05,t);const tone=(f,d,at=0,type='sine')=>{const o=actx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t+at);o.connect(g);o.start(t+at);o.stop(t+at+d)};if(kind==='catch'){tone(540,.05);tone(760,.07,.035)}else if(kind==='bonus'){tone(620,.05);tone(880,.06,.035);tone(1100,.09,.08)}else if(kind==='miss'){tone(190,.1,0,'triangle');tone(140,.12,.07,'triangle')}else if(kind==='end'){tone(420,.07);tone(320,.1,.08);tone(240,.14,.17)}else tone(320,.035);g.gain.exponentialRampToValueAtTime(.001,t+.4)}catch(e){}}
function fullscreen(){if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch?.(()=>{});}
function keyLane(k){return({q:0,Q:0,e:1,E:1,z:2,Z:2,c:3,C:3,'7':0,'9':1,'1':2,'3':3})[k]}
function init(){
 $('#startBtn').addEventListener('click',()=>show('menu'));
 $$('[data-hero]').forEach(b=>b.addEventListener('click',()=>setHero(b.dataset.hero)));
 $$('.modeCard[data-mode]').forEach(b=>b.addEventListener('click',()=>startGame(b.dataset.mode)));
 $$('.catchBtn').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();selectLane(Number(b.dataset.lane))}));
 $('#pauseBtn').addEventListener('click',()=>togglePause());
 $('#homeBtn').addEventListener('click',()=>{stopLoop();show('menu')});
 $('#newBtn').addEventListener('click',()=>startGame(mode));
 $('#screenBtn').addEventListener('click',fullscreen);
 $('#soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('#soundBtn').textContent=soundOn?'🔊':'🔇';$('#soundBtn').setAttribute('aria-label',soundOn?'Выключить звук':'Включить звук')});
 $('#resultMenu').addEventListener('click',()=>{$('#resultOverlay').classList.remove('open');show('menu')});
 $('#resultReplay').addEventListener('click',()=>{$('#resultOverlay').classList.remove('open');startGame(mode)});
 $('#recordsBtn').addEventListener('click',()=>{renderRecords();$('#recordsOverlay').classList.add('open')});
 $('#recordsClose').addEventListener('click',()=>$('#recordsOverlay').classList.remove('open'));
 window.addEventListener('keydown',e=>{const lane=keyLane(e.key);if(lane!==undefined&&$('#game').classList.contains('active')){e.preventDefault();selectLane(lane)}else if(e.key===' '&&$('#game').classList.contains('active')){e.preventDefault();togglePause()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused){autoPaused=true;togglePause(true)}else if(!document.hidden&&autoPaused){autoPaused=false;$('#stateText').textContent='Пауза • нажмите ▶'}});
 window.addEventListener('pagehide',()=>stopLoop(),{once:true});
 setHero('corgi');show('splash');
 window.__ENERGY_CAPSULES_QA__={snapshot:()=>({mode,score,lives,streak,caught,missed,selectedLane,running,paused,capsules:capsules.map(c=>({lane:c.lane,p:c.p,bonus:c.bonus}))})};
 GameLifecycle.engineInitialized=true;
}
init();
})();
