import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/* Pickle Samurai home — v2
   - one shared "stacked" breakpoint for CSS + JS (fixes tablet stretch)
   - renderer sized from the real #stage box (no more squashed mascot)
   - head/neck look-at no longer accumulates rotation (fixes head glitch)
   - mobile: auto look-around, tap-to-slash, tap mascot to spin, reveal stagger */

const GLB='https://cdn.jsdelivr.net/gh/PickleSamurai/pickle-samurai-mascot@main/pickle-samurai-idle-web-hq-v2.glb';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
// MUST match the CSS media query in ps-v2.css
const STACK_MQ=matchMedia('(max-width:820px), (max-width:1180px) and (orientation:portrait)');
const stacked=()=>STACK_MQ.matches;
gsap.registerPlugin(ScrollTrigger);

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
if(!document.querySelector('.taphint')){const th=document.createElement('div');th.className='taphint';th.setAttribute('aria-hidden','true');th.textContent='Tap the samurai';document.getElementById('stage').after(th)}
{const row=document.querySelector('.cta .row2'); if(row&&!row.querySelector('a[href="/checkout"]')){const a=document.createElement('a');a.className='btn ghost';a.href='/checkout';a.innerHTML='See packages &amp; pricing';const mail=row.querySelector('.mail');row.insertBefore(a,mail)}}

/* ---------- 3D stage ---------- */
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.86;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,1,.1,50);
camera.position.set(0,1.0,4.7);
const pmrem=new THREE.PMREMGenerator(renderer); scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture; scene.environmentIntensity=.5;
const key=new THREE.DirectionalLight(0xffe1c7,1.3); key.position.set(3,4,4); scene.add(key);
const fill=new THREE.DirectionalLight(0x7892c8,.48); fill.position.set(-3,1,4); scene.add(fill);
const rim=new THREE.DirectionalLight(0x8f3651,1.45); rim.position.set(-4,2,-3); scene.add(rim);
scene.add(new THREE.HemisphereLight(0xb8c3d8,0x160e1b,.2));

const rig=new THREE.Group(); scene.add(rig);
const spin=new THREE.Group(); rig.add(spin); // extra group for tap-to-spin / hop
let mixer=null, headBone=null, neckBone=null, mascot=null;
const mouse={x:0,y:0,sx:0,sy:0}; let lastMove=0; const lookQ=new THREE.Quaternion(), lookW=new THREE.Quaternion(), axUp=new THREE.Vector3(0,1,0), axRight=new THREE.Vector3(1,0,0), tmpV=new THREE.Vector3();
let xFactor=1; // shrinks side offsets on narrower landscape screens so the mascot never gets cropped

function resize(){
  // size from the real box the canvas lives in -> the drawing buffer always matches its CSS size (no stretch)
  const r=stage.getBoundingClientRect();
  const w=Math.max(1,Math.round(r.width)), h=Math.max(1,Math.round(r.height));
  renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix();
  const small=stacked();
  camera.position.z = small ? 4.6 : 4.7; camera.position.y = small ? 0.15 : 1.0;
  const halfW=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z*camera.aspect;
  xFactor=Math.min(1,halfW/2.1);
  rig.userData.baseX = small ? 0 : 0.9*xFactor;
  if(small){rig.userData.targetX=0}
  else if(rig.userData.secX!==undefined){rig.userData.targetX=rig.userData.secX*xFactor}
  ScrollTrigger.refresh();
}
new ResizeObserver(()=>resize()).observe(stage);
STACK_MQ.addEventListener?.('change',resize);
resize();

const draco=new DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
loader.load(GLB,gltf=>{
  mascot=gltf.scene; spin.add(mascot);
  // measure the model with the rig at the origin (rig offsets must not leak into the model's centering)
  const p0=rig.position.clone(), r0=rig.rotation.y, s0=rig.scale.x;
  rig.position.set(0,0,0); rig.rotation.y=0; rig.scale.setScalar(1);
  rig.updateMatrixWorld(true); mascot.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(mascot); const c=box.getCenter(tmpV);
  mascot.position.set(-c.x,-box.min.y,-c.z);
  rig.position.copy(p0); rig.rotation.y=r0; rig.scale.setScalar(s0);
  mascot.traverse(o=>{ if(o.isBone||o.type==='Bone'){ if(!headBone&&/Head$/.test(o.name)&&!/Top/.test(o.name))headBone=o; if(!neckBone&&/Neck$/.test(o.name))neckBone=o; }
    if(o.isMesh){o.frustumCulled=false; const m=o.material; ['map','normalMap','roughnessMap','metalnessMap'].forEach(k=>{if(m&&m[k]){m[k].anisotropy=renderer.capabilities.getMaxAnisotropy();m[k].needsUpdate=true}}); if(m){m.envMapIntensity=.58;if(m.normalScale)m.normalScale.set(.92,.92);}} });
  // remember each bone's un-offset pose so the look-at never stacks up frame after frame
  [headBone,neckBone].forEach(b=>{if(b)b.userData.base=b.quaternion.clone()});
  if(gltf.animations.length){mixer=new THREE.AnimationMixer(mascot); mixer.clipAction(gltf.animations[0]).play();}
  rig.position.x=rig.userData.baseX;
  rig.userData.reveal=0;
  window.__mascotReady=true; revealMascot();
},undefined,err=>console.warn('mascot failed',err));

function revealMascot(){
  gsap.to(rig.userData,{reveal:1,duration:1.6,ease:'expo.out',delay:reduce?0:.1});
}

const clock=new THREE.Clock();
function tick(){
  const dt=Math.min(clock.getDelta(),0.1); // clamp: no big jumps after a background tab
  const t=clock.elapsedTime;
  let tx=mouse.x, ty=mouse.y;
  if(!fine){ tx=Math.sin(t*.55)*.55; ty=Math.sin(t*.9)*.18; }          // touch screens: gentle look-around
  else if(performance.now()-lastMove>3500){ tx=0; ty=0; }
  const k=1-Math.exp(-dt*4.5);
  mouse.sx+=(tx-mouse.sx)*k; mouse.sy+=(ty-mouse.sy)*k;

  // 1) restore the clean pose, 2) let the animation write, 3) store it, 4) add the look offset
  [headBone,neckBone].forEach(b=>{if(b&&b.userData.base)b.quaternion.copy(b.userData.base)});
  if(mixer)mixer.update(dt);
  [headBone,neckBone].forEach(b=>{if(b)b.userData.base.copy(b.quaternion)});
  if(!reduce&&headBone){
    const yaw=Math.max(-1,Math.min(1,mouse.sx))*0.38, pitch=Math.max(-1,Math.min(1,mouse.sy))*0.13;
    mascot.updateMatrixWorld(true);
    const apply=(bone,w)=>{
      bone.getWorldQuaternion(lookW).invert();
      lookQ.setFromAxisAngle(tmpV.copy(axUp).applyQuaternion(lookW),yaw*w);   bone.quaternion.multiply(lookQ);
      lookQ.setFromAxisAngle(tmpV.copy(axRight).applyQuaternion(lookW),pitch*w); bone.quaternion.multiply(lookQ);
    };
    apply(headBone,0.65); if(neckBone)apply(neckBone,0.35);
  }
  const small=stacked();
  const e=1-Math.exp(-dt*3.8); // frame-rate independent easing
  rig.rotation.y += ((rig.userData.targetRot||0)+mouse.sx*.18 - rig.rotation.y)*e;
  rig.position.x += ((rig.userData.targetX ?? rig.userData.baseX) - rig.position.x)*e;
  rig.userData.y=(rig.userData.y||0)+((rig.userData.targetY||0)-(rig.userData.y||0))*e;
  rig.position.y = small ? -0.8 : (rig.userData.scrollY||0)+rig.userData.y;
  rig.userData.vis=(rig.userData.vis??1)+((rig.userData.targetVis??1)-(rig.userData.vis??1))*e;
  rig.scale.setScalar(Math.max(.001,(rig.userData.reveal||0)*(rig.userData.s||1)*rig.userData.vis));
  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}
tick();
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return; lastMove=performance.now(); mouse.x=(e.clientX/innerWidth)*2-1; mouse.y=(e.clientY/innerHeight)*2-1;});

/* ---------- tap the mascot: spin + hop (all devices) ---------- */
let spinning=false;
function mascotTrick(){
  if(spinning||reduce||!mascot) return; spinning=true;
  document.querySelector('.taphint')?.classList.add('gone');
  gsap.timeline({onComplete:()=>{spin.rotation.y=0;spinning=false}})
    .to(spin.position,{y:.28,duration:.28,ease:'power2.out'})
    .to(spin.rotation,{y:Math.PI*2,duration:.75,ease:'power3.inOut'},0)
    .to(spin.position,{y:0,duration:.45,ease:'bounce.out'},.3);
  if(navigator.vibrate) try{navigator.vibrate(12)}catch(_){}
}
addEventListener('pointerdown',e=>{
  if(e.target.closest('a,button,input,label,select,textarea,.ps-menu')) return;
  const r=stage.getBoundingClientRect();
  if(stacked()){ if(e.clientY>=r.top&&e.clientY<=r.bottom) mascotTrick(); }
  else { // desktop: roughly the mascot's column
    const cx=r.left+r.width*(.5+(rig.position.x/ (Math.tan(THREE.MathUtils.degToRad(15))*camera.position.z*camera.aspect))/2);
    if(Math.abs(e.clientX-cx)<r.width*.12&&e.clientY>r.height*.15&&e.clientY<r.height*.95&&scrollY<innerHeight*.6) mascotTrick();
  }
});

/* ---------- scroll story: mascot pose + accent colour per section ---------- */
const glow=document.getElementById('glow');
const tmpC=new THREE.Color();
function setAccent(hex){
  document.documentElement.style.setProperty('--accent',hex);
  tmpC.set(hex); gsap.to(rim.color,{r:tmpC.r,g:tmpC.g,b:tmpC.b,duration:.8});
  if(glow) glow.style.background=`radial-gradient(circle,${hex},transparent 70%)`;
}
document.querySelectorAll('section[data-accent]').forEach(sec=>{
  ScrollTrigger.create({trigger:sec,start:'top 55%',end:'bottom 45%',
    onToggle:self=>{ if(self.isActive){
      setAccent(sec.dataset.accent);
      const small=stacked();
      rig.userData.targetRot=parseFloat(sec.dataset.rot||0);
      rig.userData.secX=parseFloat(sec.dataset.x||0);
      rig.userData.targetX=small?0:rig.userData.secX*xFactor;
      rig.userData.targetVis=sec.dataset.vis!==undefined?(small?1:parseFloat(sec.dataset.vis)):1;
      rig.userData.targetY=small?0:parseFloat(sec.dataset.y||0);
    }}});
});
ScrollTrigger.create({trigger:'#top',start:'top top',end:'bottom top',onLeaveBack:()=>{setAccent('#C0392B');rig.userData.targetRot=0;rig.userData.secX=undefined;rig.userData.targetX=rig.userData.baseX;rig.userData.targetVis=1;rig.userData.targetY=0;}});
ScrollTrigger.create({trigger:'#top',start:'top top',end:'bottom top',scrub:true,onUpdate:s=>{rig.userData.scrollY=-s.progress*0.12; rig.userData.s=stacked()?1:1-s.progress*0.2}});

const hint=document.querySelector('.taphint');
if(hint) ScrollTrigger.create({trigger:'#top',start:'top top',end:'20% top',onLeave:()=>hint.classList.add('gone'),onEnterBack:()=>{if(!spinning)hint.classList.remove('gone')}});

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

/* ---------- intro ---------- */
function intro(){
  const tl=gsap.timeline({defaults:{ease:'power4.inOut'}});
  tl.to('#intro .slash',{scaleX:1,duration:.7})
    .to('#intro .word',{clipPath:'inset(0 0% 0 0)',duration:.7},'-=.2')
    .to('#intro .slash',{opacity:0,duration:.3},'+=.1')
    .to('#intro .top',{yPercent:-100,duration:.9},'+=.15')
    .to('#intro .bot',{yPercent:100,duration:.9},'<')
    .to('#intro .word',{opacity:0,duration:.2},'<')
    .set('#intro',{display:'none'})
    .to('.hero .ch',{y:0,duration:1.1,stagger:.04,ease:'expo.out'},'-=.55')
    .from('.hero .tag,.hero .sub,.hero .row,nav',{opacity:0,y:20,duration:.9,stagger:.08,ease:'power3.out',clearProps:'transform'},'-=.7');
}
if(!reduce){document.documentElement.style.overflow='hidden'; intro(); setTimeout(()=>document.documentElement.style.overflow='',2800);}
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
