
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const GLB='https://cdn.jsdelivr.net/gh/PickleSamurai/pickle-samurai-mascot@main/pickle-samurai-idle-web-v4.glb';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
gsap.registerPlugin(ScrollTrigger);

/* ---------- smooth scroll ---------- */
let lenis=null;
if(!reduce){
  lenis=new Lenis({duration:1.15,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href'); if(id.length>1){e.preventDefault();lenis.scrollTo(id,{offset:0})}}));
}

/* ---------- 3D stage ---------- */
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,1,.1,50);
camera.position.set(0,1.0,4.7);
const pmrem=new THREE.PMREMGenerator(renderer); scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture; scene.environmentIntensity=0.7;
const key=new THREE.DirectionalLight(0xffffff,1.9); key.position.set(3,4,4); scene.add(key);
const rim=new THREE.DirectionalLight(0xC0392B,3.2); rim.position.set(-4,2,-3); scene.add(rim);
scene.add(new THREE.HemisphereLight(0xffffff,0x221a2b,0.35));

const rig=new THREE.Group(); scene.add(rig);
let mixer=null, headBone=null, neckBone=null, mascot=null;
const mouse={x:0,y:0,sx:0,sy:0}; let lastMove=0; const lookQ=new THREE.Quaternion(), lookW=new THREE.Quaternion(), axUp=new THREE.Vector3(0,1,0), axRight=new THREE.Vector3(1,0,0);

function resize(){
  const w=innerWidth,h=innerHeight, small=w<820; const sh=small?Math.round(h*0.40):h;
  renderer.setSize(w,sh,false);
  camera.aspect=w/sh; camera.updateProjectionMatrix();
  rig.userData.baseX = w<820 ? 0 : 0.9;
  if(w<820){rig.userData.targetX=0}
  camera.position.z = small ? 4.6 : 4.7; camera.position.y = small ? 0.15 : 1.0;
}
addEventListener('resize',resize); resize();

const draco=new DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
loader.load(GLB,gltf=>{
  mascot=gltf.scene; rig.add(mascot);
  const py0=rig.position.y; rig.position.set(0,0,0); rig.updateMatrixWorld(true); mascot.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(mascot); const c=box.getCenter(new THREE.Vector3()); rig.position.y=py0;
  mascot.position.set(-c.x,-box.min.y,-c.z);
  mascot.traverse(o=>{ if(o.isBone||o.type==='Bone'){ if(/Head$/.test(o.name)&&!/Top/.test(o.name))headBone=o; if(/Neck$/.test(o.name))neckBone=o; }
    if(o.isMesh){o.frustumCulled=false; const m=o.material; ['map','normalMap','roughnessMap','metalnessMap'].forEach(k=>{if(m&&m[k]){m[k].anisotropy=renderer.capabilities.getMaxAnisotropy();m[k].needsUpdate=true}}); if(m){m.envMapIntensity=1;}} });
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
  const dt=clock.getDelta();
  const idle=performance.now()-lastMove>3500||!fine;
  const k=1-Math.exp(-dt*4.5);
  mouse.sx+=((idle?0:mouse.x)-mouse.sx)*k; mouse.sy+=((idle?0:mouse.y)-mouse.sy)*k;
  if(mixer)mixer.update(dt);
  // head follows cursor: clamped, damped, applied as a local-space quaternion on top of the animation
  if(!reduce&&headBone){
    // rotate about WORLD up / right axes, converted into each bone's local frame -> independent of bone orientation
    const yaw=Math.max(-1,Math.min(1,mouse.sx))*0.38, pitch=Math.max(-1,Math.min(1,mouse.sy))*0.13;
    mascot.updateMatrixWorld(true);
    const apply=(bone,w)=>{
      bone.getWorldQuaternion(lookW).invert();
      lookQ.setFromAxisAngle(axUp.clone().applyQuaternion(lookW),yaw*w);   bone.quaternion.multiply(lookQ);
      lookQ.setFromAxisAngle(axRight.clone().applyQuaternion(lookW),pitch*w); bone.quaternion.multiply(lookQ);
    };
    apply(headBone,0.65); if(neckBone)apply(neckBone,0.35);
  }
  rig.rotation.y += ((rig.userData.targetRot||0)+mouse.sx*.18 - rig.rotation.y)*.06;
  rig.position.x += ((rig.userData.targetX ?? rig.userData.baseX) - rig.position.x)*.06;
  rig.userData.y=(rig.userData.y||0)+((rig.userData.targetY||0)-(rig.userData.y||0))*.07;
  rig.position.y = (innerWidth<820?-0.8:0) + (innerWidth<820?0:(rig.userData.scrollY||0)+rig.userData.y);
  rig.userData.vis=(rig.userData.vis??1)+((rig.userData.targetVis??1)-(rig.userData.vis??1))*.07;
  rig.scale.setScalar(Math.max(.001,(rig.userData.reveal||0)*(rig.userData.s||1)*rig.userData.vis));
  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}
tick();
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return; lastMove=performance.now(); mouse.x=(e.clientX/innerWidth)*2-1; mouse.y=(e.clientY/innerHeight)*2-1;});

/* ---------- scroll story: mascot pose + accent colour per section ---------- */
const glow=document.getElementById('glow');
function setAccent(hex){
  document.documentElement.style.setProperty('--accent',hex);
  gsap.to(rim.color,{r:new THREE.Color(hex).r,g:new THREE.Color(hex).g,b:new THREE.Color(hex).b,duration:.8});
  glow.style.background=`radial-gradient(circle,${hex},transparent 70%)`;
}
document.querySelectorAll('section[data-accent]').forEach(sec=>{
  ScrollTrigger.create({trigger:sec,start:'top 55%',end:'bottom 45%',
    onToggle:self=>{ if(self.isActive){
      setAccent(sec.dataset.accent);
      const small=innerWidth<820;
      rig.userData.targetRot=parseFloat(sec.dataset.rot||0);
      rig.userData.targetX=small?0:parseFloat(sec.dataset.x||0)*1.0;
      rig.userData.targetVis=sec.dataset.vis!==undefined?(small?1:parseFloat(sec.dataset.vis)):1;
      rig.userData.targetY=innerWidth<820?0:parseFloat(sec.dataset.y||0);
    }}});
});
ScrollTrigger.create({trigger:'#top',start:'top top',end:'bottom top',onLeaveBack:()=>{rig.userData.targetRot=0;rig.userData.targetX=rig.userData.baseX;rig.userData.targetVis=1;rig.userData.targetY=0;}});
// hero: mascot slides away a little and scales as you scroll off it
ScrollTrigger.create({trigger:'#top',start:'top top',end:'bottom top',scrub:true,onUpdate:s=>{rig.userData.scrollY=-s.progress*0.12; rig.userData.s=innerWidth<820?1:1-s.progress*0.2}});

/* ---------- scroll progress (replaces the hidden scrollbar) ---------- */
const bar=document.getElementById('progress');
ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{bar.style.transform='scaleX('+s.progress+')'}});

/* ---------- text + reveal animations ---------- */
document.querySelectorAll('[data-split]').forEach(el=>{
  const t=el.textContent; el.textContent='';
  [...t].forEach(ch=>{const s=document.createElement('span');s.className='ch';s.textContent=ch;el.appendChild(s)});
});
document.querySelectorAll('.reveal').forEach(el=>{
  gsap.to(el,{opacity:1,y:0,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 82%'}});
});
document.querySelectorAll('.cards .card').forEach((el,i)=>{ el.style.transitionDelay=''; });

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
    .from('.hero .tag,.hero .sub,.hero .row,nav',{opacity:0,y:20,duration:.9,stagger:.08,ease:'power3.out'},'-=.7');
}
if(!reduce){document.documentElement.style.overflow='hidden'; intro(); setTimeout(()=>document.documentElement.style.overflow='',2800);}

/* ---------- cursor + magnetic buttons + slash FX ---------- */
if(fine&&!reduce){
  const dot=document.querySelector('.cur.dot'),ring=document.querySelector('.cur.ring');
  const xd=gsap.quickTo(dot,'x',{duration:.08}),yd=gsap.quickTo(dot,'y',{duration:.08});
  const xr=gsap.quickTo(ring,'x',{duration:.35,ease:'power3'}),yr=gsap.quickTo(ring,'y',{duration:.35,ease:'power3'});
  addEventListener('pointermove',e=>{xd(e.clientX);yd(e.clientY);xr(e.clientX);yr(e.clientY)});
  document.querySelectorAll('a,button,.card').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('hot'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('hot'));
  });
  document.querySelectorAll('.mag').forEach(el=>{
    const qx=gsap.quickTo(el,'x',{duration:.5,ease:'power3'}),qy=gsap.quickTo(el,'y',{duration:.5,ease:'power3'});
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();qx((e.clientX-r.left-r.width/2)*.3);qy((e.clientY-r.top-r.height/2)*.4)});
    el.addEventListener('mouseleave',()=>{qx(0);qy(0)});
  });
  // click = katana slash
  const fx=document.getElementById('slash-fx'),ctx=fx.getContext('2d');
  const fit=()=>{fx.width=innerWidth;fx.height=innerHeight};fit();addEventListener('resize',fit);
  addEventListener('pointerdown',e=>{
    const a=(Math.random()*40-20-30)*Math.PI/180,L=Math.max(innerWidth,innerHeight);
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
