/* Pickle Samurai home — v3 (eager half)
   Everything the page needs to look finished and respond: smooth scroll, scroll story, reveal + intro animation,
   slash FX, cursor. The heavy 3D half (three.js + mascot model) is a separate module, ps-mascot.min.js, that is
   imported on first interaction or shortly after load, so first paint and interactivity never wait for WebGL.
   Shared state lives on window.__ps; the 3D half reads it every frame. */

gsap.registerPlugin(ScrollTrigger);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
// MUST match the CSS media query in ps-v2.css
const STACK_MQ=matchMedia('(max-width:820px), (max-width:1180px) and (orientation:portrait)');
const stacked=()=>STACK_MQ.matches;
const S=window.__ps={accent:'#C0392B',rot:0,secX:undefined,vis:undefined,y:0,scrollY:0,s:1,reduce,fine,stacked,onStackChange:fn=>STACK_MQ.addEventListener?.('change',fn)};

/* ---------- smooth scroll ---------- */
let lenis=null;
if(!reduce){
  lenis=new Lenis({duration:1.15,smoothWheel:true}); window.lenis=lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
// delegated so links added later (mobile menu, etc.) also scroll smoothly
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a[href^="#"]'); if(!a) return;
  const id=a.getAttribute('href'); if(id.length<2) return;
  const el=document.querySelector(id); if(!el) return;
  e.preventDefault();
  if(lenis) lenis.scrollTo(el,{offset:0}); else el.scrollIntoView({behavior:reduce?'auto':'smooth'});
});

/* ---------- small DOM additions (works with the existing home embed) ---------- */
const stage=document.getElementById('stage');
if(!document.querySelector('.taphint')){const th=document.createElement('div');th.className='taphint';th.setAttribute('aria-hidden','true');th.textContent='Tap the samurai';stage.after(th)}
{const row=document.querySelector('.cta .row2'); if(row&&!row.querySelector('a[href="/checkout"]')){const a=document.createElement('a');a.className='btn ghost';a.href='/checkout';a.innerHTML='See packages &amp; pricing';const mail=row.querySelector('.mail');row.insertBefore(a,mail)}}

/* ---------- poster: the mascot is on screen from first paint; the live 3D model swaps in when it is ready ---------- */
const PG={dx0:-0.2429,dx1:0.2097,dy0:-0.7622,dy1:0.0244};
let poster=null;
if(stage){
  poster=document.createElement('img'); poster.className='ps-poster'; poster.alt=''; poster.setAttribute('aria-hidden','true');
  poster.decoding='async'; poster.draggable=false; poster.fetchPriority='low';
  poster.src=new URL('../assets/site/mascot-poster.webp',import.meta.url).href;
  stage.appendChild(poster);
  const place=()=>{
    // same camera maths as the 3D half, so the picture sits exactly where the live model will stand
    const r=stage.getBoundingClientRect(), W=r.width, H=r.height; if(!W||!H) return;
    const st=stacked(), z=st?4.6:4.7, camY=st?.15:1, feetY=st?-.8:0, t15=Math.tan(Math.PI/12);
    const px=H/(2*t15*z), xF=Math.min(1,(t15*z*(W/H))/2.1), k=4.7/z;
    const cx=W/2+(st?0:.9*xF)*px, feet=H/2+(camY-feetY)*px;
    poster.style.left=(cx+PG.dx0*H*k)+'px'; poster.style.top=(feet+PG.dy0*H*k)+'px';
    poster.style.width=((PG.dx1-PG.dx0)*H*k)+'px'; poster.style.height=((PG.dy1-PG.dy0)*H*k)+'px';
  };
  place(); new ResizeObserver(place).observe(stage); S.onStackChange(place);
}

/* ---------- scroll story: accent colour + mascot pose per section (the 3D half reads window.__ps) ---------- */
const glow=document.getElementById('glow');
function setAccent(hex){
  document.documentElement.style.setProperty('--accent',hex); S.accent=hex;
  if(glow) glow.style.background=`radial-gradient(circle,${hex},transparent 70%)`;
}
document.querySelectorAll('section[data-accent]').forEach(sec=>{
  ScrollTrigger.create({trigger:sec,start:'top 55%',end:'bottom 45%',
    onToggle:self=>{ if(self.isActive){
      setAccent(sec.dataset.accent);
      S.rot=parseFloat(sec.dataset.rot||0);
      S.secX=parseFloat(sec.dataset.x||0);
      S.vis=sec.dataset.vis!==undefined?parseFloat(sec.dataset.vis):undefined;
      S.y=parseFloat(sec.dataset.y||0);
    }}});
});
ScrollTrigger.create({trigger:'#top',start:'top top',end:'bottom top',onLeaveBack:()=>{setAccent('#C0392B');S.rot=0;S.secX=undefined;S.vis=undefined;S.y=0;}});
if(poster) ScrollTrigger.create({trigger:'#top',start:'top top',end:'60% top',onLeave:()=>poster.classList.add('gone'),onEnterBack:()=>poster.classList.remove('gone')});
ScrollTrigger.create({trigger:'#top',start:'top top',end:'bottom top',scrub:true,onUpdate:s=>{S.scrollY=-s.progress*0.12; S.s=stacked()?1:1-s.progress*0.2}});

const hint=document.querySelector('.taphint');
if(hint) ScrollTrigger.create({trigger:'#top',start:'top top',end:'20% top',onLeave:()=>hint.classList.add('gone'),onEnterBack:()=>{hint.classList.remove('gone')}});

/* ---------- scroll progress ---------- */
const bar=document.getElementById('progress');
ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{bar.style.transform='scaleX('+s.progress+')'}});

/* ---------- text + reveal animations ---------- */
document.querySelectorAll('[data-split]').forEach(el=>{
  const t=el.textContent; el.textContent='';
  [...t].forEach(ch=>{const s=document.createElement('span');s.className='ch';s.textContent=ch;el.appendChild(s)});
});
document.querySelectorAll('.reveal').forEach(el=>{
  gsap.to(el,{opacity:1,y:0,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}});
});
// mobile/tablet: section panels + list items + cards slide in with a stagger
if(!reduce){
  document.querySelectorAll('.disc').forEach(d=>{
    const items=d.querySelectorAll('li');
    if(items.length) gsap.from(items,{x:-24,opacity:0,duration:.6,stagger:.09,ease:'power3.out',scrollTrigger:{trigger:d,start:'top 80%'}});
    const n=d.querySelector('.num'); if(n) gsap.from(n,{scale:.6,opacity:0,duration:.9,ease:'back.out(2)',scrollTrigger:{trigger:d,start:'top 85%'}});
  });
  document.querySelectorAll('.socials .soc').forEach((s,i)=>gsap.from(s,{y:18,opacity:0,duration:.5,delay:i*.07,ease:'back.out(2)',scrollTrigger:{trigger:s,start:'top 95%'}}));
}

/* ---------- intro: a katana line sweeps over the live hero (nothing is hidden behind a cover screen) ---------- */
function intro(){
  const tl=gsap.timeline({defaults:{ease:'power4.inOut'}});
  tl.to('#intro .slash',{scaleX:1,duration:.45})
    .to('#intro .slash',{opacity:0,duration:.25},'+=.04')
    .to('.hero .ch',{y:0,duration:.9,stagger:.03,ease:'expo.out'},'-=.6')
    .from('.hero .tag,.hero .sub,.hero .row,nav',{opacity:0,y:16,duration:.7,stagger:.07,ease:'power3.out',clearProps:'transform'},'-=.65')
    .set('#intro',{display:'none'});
}
if(!reduce) intro();
else{document.getElementById('intro')?.style.setProperty('display','none')}

/* ---------- katana slash FX: mouse click on desktop, tap on touch ---------- */
const fx=document.getElementById('slash-fx');
if(fx&&!reduce){
  const ctx=fx.getContext('2d');
  const fit=()=>{fx.width=innerWidth;fx.height=innerHeight};fit();addEventListener('resize',fit);
  addEventListener('pointerdown',e=>{
    const a=(Math.random()*40-20-30)*Math.PI/180,L=Math.max(innerWidth,innerHeight)*(e.pointerType==='touch'?.6:1);
    const o={p:0,x:e.clientX,y:e.clientY};
    const col=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#C0392B';
    gsap.to(o,{p:1,duration:.32,ease:'power4.out',onUpdate:()=>{
      ctx.clearRect(0,0,fx.width,fx.height);
      const len=L*o.p*.5,tail=Math.max(0,o.p-.35)*L*.5;
      ctx.strokeStyle=col;ctx.lineWidth=3*(1-o.p)+.5;ctx.shadowColor=col;ctx.shadowBlur=24;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(o.x+Math.cos(a)*tail,o.y+Math.sin(a)*tail);ctx.lineTo(o.x+Math.cos(a)*len,o.y+Math.sin(a)*len);
      ctx.moveTo(o.x-Math.cos(a)*tail,o.y-Math.sin(a)*tail);ctx.lineTo(o.x-Math.cos(a)*len,o.y-Math.sin(a)*len);ctx.stroke();
    },onComplete:()=>ctx.clearRect(0,0,fx.width,fx.height)});
  });
}

/* ---------- custom cursor + magnetic buttons (mouse only) ---------- */
if(fine&&!reduce){
  const dot=document.querySelector('.cur.dot'),ring=document.querySelector('.cur.ring');
  const xd=gsap.quickTo(dot,'x',{duration:.08}),yd=gsap.quickTo(dot,'y',{duration:.08});
  const xr=gsap.quickTo(ring,'x',{duration:.35,ease:'power3'}),yr=gsap.quickTo(ring,'y',{duration:.35,ease:'power3'});
  addEventListener('pointermove',e=>{xd(e.clientX);yd(e.clientY);xr(e.clientX);yr(e.clientY)});
  document.addEventListener('mouseover',e=>{if(e.target.closest&&e.target.closest('a,button,.card'))ring.classList.add('hot')});
  document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('a,button,.card'))ring.classList.remove('hot')});
  document.querySelectorAll('.mag').forEach(el=>{
    const qx=gsap.quickTo(el,'x',{duration:.5,ease:'power3'}),qy=gsap.quickTo(el,'y',{duration:.5,ease:'power3'});
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();qx((e.clientX-r.left-r.width/2)*.3);qy((e.clientY-r.top-r.height/2)*.4)});
    el.addEventListener('mouseleave',()=>{qx(0);qy(0)});
  });
}

/* ---------- lazy 3D mascot: import on first interaction, or shortly after load ---------- */
let booted=false;
function bootMascot(){
  if(booted||!stage) return; booted=true;
  import('./ps-mascot.min.js').catch(err=>console.warn('mascot failed',err));
}
['pointerdown','pointermove','touchstart','keydown','wheel','scroll'].forEach(ev=>addEventListener(ev,bootMascot,{once:true,passive:true}));
const DELAY=window.__psMascotDelay??8000;
const later=()=>setTimeout(()=>{(window.requestIdleCallback||setTimeout)(bootMascot)},DELAY);
if(document.readyState==='complete') later(); else addEventListener('load',later);
