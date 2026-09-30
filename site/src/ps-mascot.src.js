/* Pickle Samurai mascot (lazy 3D half). Built by esbuild from site/src/ps-mascot.src.js; loaded by ps-v2.js
   on first interaction or shortly after page load, so the page paints and becomes interactive before any 3D work. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/* ---------- 3D stage ---------- */
const stage=document.getElementById('stage');
const S=window.__ps;
const stacked=()=>S.stacked();
const reduce=S.reduce, fine=S.fine;
const GLB=window.__psGLB||new URL('../pickle-samurai-idle-web-hq-v3.glb',import.meta.url).href;
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,stacked()?1.75:2));
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
  ScrollTrigger.refresh();
}
new ResizeObserver(()=>resize()).observe(stage);
S.onStackChange(resize);
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
  window.__mascotReady=true; document.documentElement.classList.add('mascot-on'); revealMascot();
  setTimeout(()=>document.querySelector('.ps-poster')?.remove(),900);
},undefined,err=>console.warn('mascot failed',err));

function revealMascot(){
  if(document.querySelector('.ps-poster')){rig.userData.reveal=1;return}   // the poster already showed the mascot: just crossfade
  gsap.to(rig.userData,{reveal:1,duration:1.6,ease:'expo.out',delay:reduce?0:.1});
}

let stageVisible=true, running=true;
new IntersectionObserver(es=>{stageVisible=es[0].isIntersecting; if(stageVisible&&!running){running=true;clock.getDelta();requestAnimationFrame(tick)}}).observe(stage);
const tmpC=new THREE.Color(); let accentSeen='';
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
  if(S.accent!==accentSeen){ accentSeen=S.accent; tmpC.set(S.accent); gsap.to(rim.color,{r:tmpC.r,g:tmpC.g,b:tmpC.b,duration:.8}); }
  const e=1-Math.exp(-dt*3.8); // frame-rate independent easing
  rig.rotation.y += ((small?0:(S.rot||0))+mouse.sx*.18 - rig.rotation.y)*e;
  const goalX = small ? 0 : (S.secX!==undefined ? S.secX*xFactor : rig.userData.baseX);
  rig.position.x += (goalX - rig.position.x)*e;
  rig.userData.y=(rig.userData.y||0)+((small?0:(S.y||0))-(rig.userData.y||0))*e;
  rig.position.y = small ? -0.8 : (S.scrollY||0)+rig.userData.y;
  rig.userData.vis=(rig.userData.vis??1)+((S.vis!==undefined?(small?1:S.vis):1)-(rig.userData.vis??1))*e;
  rig.scale.setScalar(Math.max(.001,(rig.userData.reveal||0)*(S.s||1)*rig.userData.vis));
  renderer.render(scene,camera);
  if(stageVisible) requestAnimationFrame(tick); else running=false;
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

