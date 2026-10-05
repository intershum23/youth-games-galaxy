(()=>{'use strict';
let fatal=null,loaded=false,id=null,epoch=0;const pending=new Set();
function begin(){epoch++;for(const handle of pending){clearTimeout(handle);clearInterval(handle)}pending.clear()}
function schedule(fn,ms,...args){const token=epoch;const handle=setTimeout(()=>{pending.delete(handle);if(token===epoch)fn(...args)},ms);pending.add(handle);return handle}
function repeat(fn,ms,...args){const token=epoch;const handle=setInterval(()=>{if(token===epoch)fn(...args)},ms);pending.add(handle);return handle}
function cancel(handle){clearTimeout(handle);clearInterval(handle);pending.delete(handle)}
function send(type,extra={}){if(parent!==window)parent.postMessage({type,launch:Number(new URLSearchParams(location.search).get('launch')),game:id||document.body?.dataset.game,...extra},location.origin)}
function standaloneFailure(){
 if(parent!==window)return;
 if(!document.body){addEventListener('DOMContentLoaded',standaloneFailure,{once:true});return}
 let box=document.getElementById('gameLoadError');
 if(!box){box=document.createElement('section');box.id='gameLoadError';box.className='game-load-error';box.setAttribute('role','alert');const card=document.createElement('div'),title=document.createElement('h2'),text=document.createElement('p'),retry=document.createElement('button'),back=document.createElement('a');title.textContent='Не удалось загрузить игру';text.className='game-load-message';retry.type='button';retry.textContent='Повторить';retry.onclick=()=>location.reload();back.textContent='Все игры';back.href=new URL('../../index.html#games',document.baseURI).href;card.append(title,text,retry,back);box.append(card);document.body.append(box)}
 box.querySelector('.game-load-message').textContent=fatal;
}
function fail(message){fatal=String(message);send('mm-game-error',{message:fatal});standaloneFailure()}
addEventListener('error',e=>{if(e.target===window)fail(e.message||'Ошибка JavaScript');else if(e.target.tagName==='SCRIPT')fail('Не загружен скрипт: '+e.target.src)},true);
addEventListener('unhandledrejection',e=>fail(e.reason?.message||e.reason));
window.GameLifecycle={begin,schedule,repeat,cancel,fail,engineInitialized:false,ready(game){id=game;const splash=document.querySelector('#splash.active button');if(!splash||!this.engineInitialized){fail('Инициализация игры не завершена');return}loaded=true;this.report()},report(){if(fatal)send('mm-game-error',{message:fatal});else if(loaded)send('mm-game-ready')}};
})();
