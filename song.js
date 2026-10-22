'use strict';
(() => {
const el=id=>document.getElementById(id);
const storageKey='vocalmate-song-settings-v2';
let player=null,ready=false,loopTimer=null,loopEnabled=false;
const parseYoutube=input=>{
 try{const u=new URL(input.trim());const host=u.hostname.toLowerCase();let id='';
 if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
 if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
 else if(u.pathname.startsWith('/shorts/')||u.pathname.startsWith('/embed/')||u.pathname.startsWith('/live/'))id=u.pathname.split('/')[2]||'';
 }else if(host==='youtu.be'||host==='www.youtu.be')id=u.pathname.slice(1).split('/')[0];
 return /^[\w-]{11}$/.test(id)?id:null;
 }catch{return null}
};
const sec=s=>{let parts=s.trim().split(':');if(!/^\d{1,3}(:[0-5]?\d)?$/.test(s.trim()))return null;let n=parts.length===2?(+parts[0])*60+(+parts[1]):+parts[0];return Number.isFinite(n)?n:null};
const fmt=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
const status=(msg,bad=false)=>{el('songStatus').textContent=msg;el('songStatus').style.color=bad?'#ffc9a6':'#aee8d7'};
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify({url:el('youtubeUrl').value,start:el('loopStart').value,end:el('loopEnd').value,title:el('songTitle').value}))}catch{}};
function onPlayerReady(){ready=true;status('Video đã sẵn sàng. Nhấn Play trên video để nghe.');}
function onPlayerState(e){if(e.data===0&&loopEnabled){let a=sec(el('loopStart').value);if(a!==null)player.seekTo(a,true)}}
window.onYouTubeIframeAPIReady=()=>{
 const id=el('youtubeFrame').dataset.videoId;
 if(id)mountPlayer(id);
};
function mountPlayer(id){
 ready=false;
 if(player&&typeof player.destroy==='function'){player.destroy();player=null}
 el('youtubeFrame').innerHTML='';el('youtubeFrame').dataset.videoId=id;
 if(window.YT?.Player){player=new YT.Player('youtubeFrame',{videoId:id,playerVars:{playsinline:1,rel:0,origin:location.origin},events:{onReady:onPlayerReady,onStateChange:onPlayerState,onError:()=>status('Video không cho phép phát nhúng hoặc không khả dụng. Hãy thử link khác.',true)}})}
 else {const f=document.createElement('iframe');f.src=`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`;f.title='YouTube video';f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';f.allowFullscreen=true;f.style.cssText='width:100%;height:100%;border:0';el('youtubeFrame').append(f);status('Đã nhúng video. Có thể phát bằng nút Play trong video.');}
}
function load(){const id=parseYoutube(el('youtubeUrl').value);if(!id){status('Link chưa hợp lệ. Hãy dán URL youtube.com/watch?v=... hoặc youtu.be/...',true);return}save();mountPlayer(id);el('songControls').hidden=false;}
function toggleLoop(){const a=sec(el('loopStart').value),b=sec(el('loopEnd').value);if(a===null||b===null||b<=a){status('Mốc thời gian không hợp lệ. Ví dụ bắt đầu 0:30, kết thúc 0:45.',true);return}
 if(!ready||!player){status('Để lặp đoạn, video cần phát được qua trình phát YouTube nhúng. Hãy mở app qua HTTPS.',true);return}
 loopEnabled=!loopEnabled;el('loopToggle').textContent=loopEnabled?'■ Dừng lặp đoạn':'↻ Lặp đoạn';if(loopTimer)clearInterval(loopTimer);
 if(loopEnabled){player.seekTo(a,true);player.playVideo();loopTimer=setInterval(()=>{try{if(!player||!ready)return;const t=player.getCurrentTime();if(t>=b||t<a-.7)player.seekTo(a,true)}catch{}},300);status(`Đang lặp đoạn ${fmt(a)}–${fmt(b)}. Nếu iPhone chặn phát tự động, nhấn Play trong video.`)}else status('Đã dừng lặp đoạn.');save();}
function init(){let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{}
 el('songTitle').value=saved.title||'Hôn Lễ Của Em – Hiền Hồ';el('youtubeUrl').value=saved.url||'';el('loopStart').value=saved.start||'0:00';el('loopEnd').value=saved.end||'0:20';
 el('loadSong').addEventListener('click',load);el('loopToggle').addEventListener('click',toggleLoop);
 el('songTitle').addEventListener('change',save);
 el('youtubeUrl').addEventListener('change',save);
 el('loopStart').addEventListener('change',save);el('loopEnd').addEventListener('change',save);
 el('findSong').addEventListener('click',()=>window.open('https://www.youtube.com/results?search_query='+encodeURIComponent('Hôn Lễ Của Em Hiền Hồ official'),'_blank','noopener'));
 el('seekStart').addEventListener('click',()=>{let a=sec(el('loopStart').value);if(a===null)return status('Mốc bắt đầu không hợp lệ.',true);if(player&&ready){player.seekTo(a,true);status(`Đã chuyển đến ${fmt(a)}.`)}else status('Hãy tải video trước để tua.',true)});
 if(saved.url)load();
 const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;document.head.append(script);
}
window.addEventListener('pagehide',()=>{if(loopTimer)clearInterval(loopTimer)});
init();
})();
