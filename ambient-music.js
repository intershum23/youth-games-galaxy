/* Original local ambient loop. One owner, paused whenever a game or hidden tab owns focus. */
(()=>{'use strict';
const key='galaxy.ambience.enabled.v1',button=document.getElementById('musicToggle');
let enabled=true,unlocked=false,gameActive=false,catalogActive=true,epoch=0;
try{enabled=localStorage.getItem(key)!=='false'}catch{}
const audio=new Audio('assets/audio/galaxy-ambient.mp3');audio.loop=true;audio.preload='none';audio.volume=.22;
function paint(){button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Выключить музыку':'Включить музыку');button.title=enabled?(audio.paused?'Музыка включится после действия на главном экране':'Космическая музыка играет'):'Музыка выключена';button.dataset.playing=String(!audio.paused);button.querySelector('[aria-hidden]').textContent=enabled?'♪':'♫';}
function sync(){const own=++epoch,play=enabled&&unlocked&&catalogActive&&!gameActive&&!document.hidden;
 if(!play){audio.pause();paint();return}
 audio.play().then(()=>{if(!enabled||gameActive||!catalogActive||document.hidden)audio.pause();paint()}).catch(()=>{paint()});paint();
}
button.addEventListener('click',()=>{if(!enabled||unlocked)enabled=!enabled;unlocked=true;try{localStorage.setItem(key,String(enabled))}catch{}sync()});
function gesture(e){if(e.target.closest?.('#musicToggle'))return;unlocked=true;sync()}
document.addEventListener('pointerup',gesture,{passive:true});document.addEventListener('keydown',e=>{if(!e.repeat&&(e.key==='Enter'||e.key===' '))gesture(e)});
document.addEventListener('visibilitychange',sync);addEventListener('pagehide',()=>{++epoch;audio.pause()});
addEventListener('pageshow',sync);addEventListener('storage',e=>{if(e.key===key){enabled=e.newValue!=='false';sync()}});
audio.addEventListener('playing',paint);audio.addEventListener('pause',paint);
window.GalaxyAmbience=Object.freeze({setGameActive(v){gameActive=!!v;sync()},setCatalogActive(v){catalogActive=!!v;sync()},snapshot:()=>({enabled,unlocked,gameActive,catalogActive,paused:audio.paused,time:audio.currentTime,volume:audio.volume,readyState:audio.readyState})});paint();
})();
