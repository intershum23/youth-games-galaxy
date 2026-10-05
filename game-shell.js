(()=>{'use strict';
const id=document.body.dataset.game;
const splashExt=document.body.dataset.splashExt||'webp';
const splashUrl=new URL(`../../assets/splashes/${id}.${splashExt}`,document.baseURI).href;
document.documentElement.style.setProperty('--game-splash',`url("${splashUrl}")`);
const splashEl=document.getElementById('splash');if(splashEl)splashEl.style.backgroundImage=`url("${splashUrl}")`;
function exitToCatalog(){if(parent!==window)parent.postMessage({type:'mm-exit-to-platform',game:id},location.origin);else location.href='../../index.html#games'}
document.getElementById('allGames').addEventListener('click',exitToCatalog);
// Splash actions belong to the shell; no engine handlers or state are replaced.
if(splashEl){
 const actions=document.createElement('div');actions.className='splashActions';
 const start=document.getElementById('startBtn');if(start)actions.append(start);
 const rules=document.createElement('button');rules.type='button';rules.id='splashRules';rules.className='splashRules';rules.textContent='Как играть';rules.setAttribute('aria-label','Правила игры');rules.onclick=()=>window.GalaxyRules.open(id,document.title,rules);actions.append(rules);splashEl.append(actions);
 const hostDesktop=()=>document.body.classList.toggle('desktop-host',(parent!==window?parent.innerWidth:innerWidth)>=900);
 hostDesktop();addEventListener('resize',hostDesktop);
}

// Presentation only: engines retain game state, timers, scoring and restart handlers.
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function decorateResult(modal){
 if(!modal)return;
 modal.classList.add('galaxy-result');
 const card=modal.querySelector(':scope > .sheet,:scope > .modal,:scope > .resultCard,:scope > .modalBox,:scope > .modalCard');
 if(!card||card.querySelector('.galaxy-result-exit'))return;
 const exit=document.createElement('button');exit.type='button';exit.className='galaxy-result-exit';exit.textContent='Все игры';exit.addEventListener('click',exitToCatalog);card.append(exit);
}
window.GalaxyPresentation={result:decorateResult};
for(const modal of document.querySelectorAll('#resultOverlay,.game-modal,#modal,#recordsOverlay,#milestoneOverlay,#handoverOverlay')){
 if(modal.id==='resultOverlay')decorateResult(modal);
 let prior=null,wasOpen=false;
 const sync=()=>{
  const open=modal.classList.contains('open')||modal.classList.contains('show')||modal.style.display==='flex';
  if(open===wasOpen)return;wasOpen=open;
  modal.setAttribute('aria-hidden',String(!open));modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
  if(!modal.hasAttribute('aria-label'))modal.setAttribute('aria-label',modal.id==='resultOverlay'?'Результат игры':'Диалог игры');
  if(open){prior=document.activeElement;modal.querySelector('button')?.focus()}else if(prior?.isConnected)prior.focus();
 };
 new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class','style']});sync();
 modal.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const list=[...modal.querySelectorAll('button,input,select,[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length);const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}});
}
// Selection semantics follow each engine's existing selected class.
for(const choice of document.querySelectorAll('#menu [data-hero],.game-modal .seg button')){
 const sync=()=>choice.setAttribute('aria-pressed',String(choice.classList.contains('on')||choice.classList.contains('selected')));
 new MutationObserver(sync).observe(choice,{attributes:true,attributeFilter:['class']});sync();
}
// Compact player labels follow existing engine-rendered names and roles.
for(const actor of document.querySelectorAll('#leftActor,#rightActor,#topActor,#bottomActor,.actorMini')){
 if(!actor.closest('#game')||!actor.querySelector('img'))continue;
 actor.classList.add('galaxy-player');
 const label=document.createElement('span');label.className='galaxy-player-label';actor.append(label);
 const update=()=>{
  const name=actor.querySelector('[id$="Name"],.actorTxt strong,.actorName');
  const role=actor.querySelector('[id$="Role"],[id$="Symbol"],.actorRole');
  const img=actor.querySelector('img');
  const hero=name?.textContent?.trim()||(/corgi/i.test(img.src)?'Капитан Корги':/cat/i.test(img.src)?'Космо-Кот':'');
  const text=[hero,role?.textContent?.trim()].filter(Boolean).join(' · ')||img.alt||'Игрок';
  if(label.textContent!==text)label.textContent=text;
 };
 new MutationObserver(update).observe(actor,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src']});update();
}
for(const img of document.querySelectorAll('#game #actorImg,#game #heroImgMini,#game #playerImg')){
 if(img.closest('.galaxy-player'))continue;
 const parent=img.parentElement,card=document.createElement('div'),label=document.createElement('span');
 card.className='galaxy-player';label.className='galaxy-player-label';img.before(card);card.append(img,label);
 const update=()=>{const name=document.querySelector('#game #actorName,#game #heroNameMini,#game #playerName');const text=name?.textContent?.trim()||img.alt||'Ваш герой';if(label.textContent!==text)label.textContent=text};
 new MutationObserver(update).observe(parent,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src']});update();
}
// Brief visual acknowledgment does not change engine-owned transforms or touch gestures.
document.addEventListener('click',e=>{
 if(reduced())return;
 const item=e.target.closest?.('button,#board .cell,#board .sq,#mainBoard .cell,#board .tile,#handArea .domino');
 if(!item||!item.closest('#menu,#game,.galaxy-result')||item.disabled)return;
 item.classList.remove('galaxy-feedback');void item.offsetWidth;item.classList.add('galaxy-feedback');
},true);
document.addEventListener('animationend',e=>{if(e.animationName==='galaxy-feedback')e.target.classList.remove('galaxy-feedback')});
addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='mm-game-probe')window.GameLifecycle?.report()});
addEventListener('DOMContentLoaded',async()=>{
 const reportScreen=()=>{const screen=document.querySelector('.screen.active')?.id||'splash';if(parent!==window)parent.postMessage({type:'mm-game-screen',game:id,launch:Number(new URLSearchParams(location.search).get('launch')),screen},location.origin)};
 for(const screen of document.querySelectorAll('.screen'))new MutationObserver(reportScreen).observe(screen,{attributes:true,attributeFilter:['class']});
 try{const image=new Image();image.src=splashUrl;await image.decode();await Promise.all([...document.querySelectorAll('.gameTitleArt,.parcelArt,.receiverArt')].map(img=>img.decode()).concat((window.GameLifecycle?.requiredImages||[]).map(async src=>{const asset=new Image();asset.src=new URL(src,document.baseURI).href;await asset.decode()})));await document.fonts.ready;document.body.classList.add('galaxy-ready');reportScreen();window.GameLifecycle?.ready(id)}catch(error){window.GameLifecycle?.fail('Не загружен обязательный ресурс игры: заставка, название или персонаж')}
});
})();
