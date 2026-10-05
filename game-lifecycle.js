(()=>{'use strict';
let fatal=null,loaded=false,id=null,epoch=0;const pending=new Set();
function begin(){epoch++;for(const handle of pending){clearTimeout(handle);clearInterval(handle)}pending.clear()}
function schedule(fn,ms,...args){const token=epoch;const handle=setTimeout(()=>{pending.delete(handle);if(token===epoch)fn(...args)},ms);pending.add(handle);return handle}
function repeat(fn,ms,...args){const token=epoch;const handle=setInterval(()=>{if(token===epoch)fn(...args)},ms);pending.add(handle);return handle}
function cancel(handle){clearTimeout(handle);clearInterval(handle);pending.delete(handle)}
function send(type,extra={}){if(parent!==window)parent.postMessage({type,launch:Number(new URLSearchParams(location.search).get('launch')),game:id||document.body?.dataset.game,...extra},location.origin)}
function fail(message){fatal=String(message);send('mm-game-error',{message:fatal})}
addEventListener('error',e=>{if(e.target===window)fail(e.message||'Ошибка JavaScript');else if(e.target.tagName==='SCRIPT')fail('Не загружен скрипт: '+e.target.src)},true);
addEventListener('unhandledrejection',e=>fail(e.reason?.message||e.reason));
window.GameLifecycle={begin,schedule,repeat,cancel,fail,engineInitialized:false,ready(game){id=game;const splash=document.querySelector('#splash.active button');if(!splash||!this.engineInitialized){fail('Инициализация игры не завершена');return}loaded=true;this.report()},report(){if(fatal)send('mm-game-error',{message:fatal});else if(loaded)send('mm-game-ready')}};
})();
