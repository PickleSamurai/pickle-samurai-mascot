/* Pickle Samurai scene (v1): fixed photoreal background behind the mascot.
   Five cinematic scenes change as you scroll, joined by a katana-slash wipe with a glowing edge.
   Slow zoom + drift follow scroll, layers shift with the pointer, embers rise in the section colour. Home page only. */
(function(){
  if(window.__psScene) return;
  if(!/^\/?$/.test(location.pathname)) return;
  window.__psScene=1;
  var ASSET='https://cdn.jsdelivr.net/gh/PickleSamurai/pickle-samurai-mascot@b501bde5e20ea14fc1e00999837c35d607edace0/assets/site/';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
  var small=window.matchMedia&&matchMedia('(max-width:820px)').matches, EXT=small?'-m.webp':'.webp';
  var SCENES=[
    {img:'bg-hero',sel:null,c:'#C0392B',alt:'Misty mountain valley at dawn with a torii gate and a crimson sun'},
    {img:'bg-design',sel:'#design',c:'#C0392B',alt:'Rain-soaked alley at night lit by red neon'},
    {img:'bg-security',sel:'#security',c:'#7B3FE4',alt:'Dark server corridor lit by violet light'},
    {img:'bg-web3',sel:'#web3',c:'#9DC63B',alt:'Crystal cavern glowing green'},
    {img:'bg-work',sel:'#work',c:'#E9B872',alt:'Japanese dojo at night'}
  ];
  var css=[
   '#ps-scene{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:#0E0E12}',
   '#ps-scene .ps-l{position:absolute;inset:0;overflow:hidden;will-change:clip-path}',
   '#ps-scene .ps-l img{position:absolute;left:-5%;top:-5%;width:110%;height:110%;object-fit:cover;display:block;filter:brightness(.82) saturate(1.05);will-change:transform;transform-origin:50% 55%}',
   '#ps-scene .ps-l video{position:absolute;left:-5%;top:-5%;width:110%;height:110%;object-fit:cover;object-position:35% 50%;display:block;opacity:0;transition:opacity 1.2s ease;filter:brightness(.82) saturate(1.05);will-change:transform;transform-origin:50% 55%}',
   '#ps-scene .ps-l video.on{opacity:1}',
   '#ps-scene .ps-vig{position:absolute;inset:0;background:radial-gradient(120% 95% at 55% 45%,rgba(14,14,18,0) 0%,rgba(14,14,18,.35) 70%,rgba(14,14,18,.8) 100%),linear-gradient(90deg,rgba(14,14,18,.5),rgba(14,14,18,.12) 60%,rgba(14,14,18,.2)),linear-gradient(180deg,rgba(14,14,18,.5),rgba(14,14,18,0) 20%,rgba(14,14,18,0) 75%,rgba(14,14,18,.55))}',
   '#ps-scene .ps-edge{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
   '#ps-scene .ps-edge line{stroke-width:2;vector-effect:non-scaling-stroke;stroke-linecap:round}',
   '#ps-scene .ps-edge{filter:drop-shadow(0 0 7px currentColor) drop-shadow(0 0 18px currentColor);opacity:0}',
   '#ps-scene canvas{position:absolute;inset:0;width:100%;height:100%}',
   '@media(max-width:820px){#ps-scene .ps-l img{filter:brightness(.7) saturate(1.05)}}',
   '@media (max-width:820px), (max-width:1180px) and (orientation:portrait){#stage{background:radial-gradient(62% 58% at 50% 56%,rgba(240,200,140,.42),rgba(192,57,43,.2) 55%,rgba(14,14,18,.28) 100%)!important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}#stage canvas{filter:brightness(1.45) contrast(1.08) saturate(1.1) drop-shadow(0 0 22px rgba(240,200,140,.55))}.disc{background:rgba(14,14,18,.6)!important}}',
   '@media(prefers-reduced-motion:reduce){#ps-scene .ps-edge{display:none}}'
  ].join('\n');
  var st=document.createElement('style'); st.setAttribute('data-ps-scene',''); st.textContent=css; document.head.appendChild(st);

  var root=document.createElement('div'); root.id='ps-scene'; root.setAttribute('aria-hidden','true');
  var layers=SCENES.map(function(s,i){
    var l=document.createElement('div'); l.className='ps-l';
    var im=document.createElement('img'); im.alt=''; im.decoding='async'; im.draggable=false;
    im.width=1920; im.height=1080; if(i===0){ im.fetchPriority='high'; im.src=ASSET+s.img+EXT; } else im.setAttribute('data-src',ASSET+s.img+EXT);
    l.appendChild(im);
    var vd=null;
    if(s.vid&&!reduce&&!(navigator.connection&&navigator.connection.saveData)){ vd=document.createElement('video'); vd.muted=true; vd.defaultMuted=true; vd.loop=true; vd.playsInline=true; vd.setAttribute('playsinline',''); vd.setAttribute('muted',''); vd.preload='auto'; vd.setAttribute('aria-hidden','true'); vd.tabIndex=-1; vd.addEventListener('playing',function(){vd.classList.add('on')}); l.appendChild(vd); }
    if(i>0) l.style.clipPath='polygon(0 0,-5% 0,-30% 100%,0 100%)';
    root.appendChild(l); return {el:l,im:im,vd:vd,s:s};
  });
  var vig=document.createElement('div'); vig.className='ps-vig'; root.appendChild(vig);
  var NS='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','ps-edge'); svg.setAttribute('viewBox','0 0 100 100'); svg.setAttribute('preserveAspectRatio','none');
  var line=document.createElementNS(NS,'line'); svg.appendChild(line); root.appendChild(svg);
  var cv=document.createElement('canvas'); root.appendChild(cv);
  document.body.insertBefore(root,document.body.firstChild);

  /* lazy-load the later scenes once the page is idle */
  function loadVideos(){ layers.forEach(function(L){ if(L.vd&&!L.vd.src&&!L.s.lazyvid){ L.vd.src=ASSET+L.s.vid; var pr=L.vd.play(); if(pr&&pr.catch) pr.catch(function(){}); } }); }
  function loadRest(){ layers.forEach(function(L){var d=L.im.getAttribute('data-src'); if(d){L.im.src=d;L.im.removeAttribute('data-src')}}); }
  var armed=false;
  function arm(){ if(armed) return; armed=true; req(); }
  ['scroll','wheel','touchstart','keydown','pointerdown'].forEach(function(e){ addEventListener(e,arm,{once:true,passive:true}); });
  function later(){ setTimeout(arm,6000); }
  if(document.readyState==='complete') later(); else addEventListener('load',later);
  function loadScene(L){ if(!armed) return; var d=L.im.getAttribute('data-src'); if(d){L.im.src=d;L.im.removeAttribute('data-src')} }
  document.addEventListener('visibilitychange',function(){ layers.forEach(function(L){ if(L.vd&&L.vd.src){ if(document.hidden) L.vd.pause(); else { var pr=L.vd.play(); if(pr&&pr.catch) pr.catch(function(){}); } } }); });

  /* scroll + pointer state */
  var secs=[], mx=0,my=0,tx=0,ty=0,raf=0,lastAccent='';
  function findSecs(){ secs=SCENES.map(function(s){return s.sel?document.querySelector(s.sel):null}); }
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function frame(){
    raf=0; var vh=innerHeight, max=Math.max(1,document.documentElement.scrollHeight-vh), P=Math.min(1,Math.max(0,scrollY/max));
    mx+=(tx-mx)*.06; my+=(ty-my)*.06;
    var active=-1, at=0;
    for(var i=1;i<layers.length;i++){
      var sc=secs[i]; if(!sc) continue;
      var top=sc.getBoundingClientRect().top; if(top<vh*2.6) loadScene(layers[i]);
      var t=Math.min(1,Math.max(0,(vh*.95-top)/(vh*(innerWidth<820?.42:.5))));
      var e=-5+ease(t)*135;
      layers[i].el.style.clipPath=t<=0?'polygon(0 0,-5% 0,-30% 100%,0 100%)':(t>=1?'none':'polygon(0 0,'+e.toFixed(2)+'% 0,'+(e-25).toFixed(2)+'% 100%,0 100%)');
      if(t>0&&t<1){active=i;at=e;}
      var Lz=layers[i]; if(t>0&&Lz.vd&&!Lz.vd.src&&Lz.s.lazyvid&&innerWidth>=820){ Lz.vd.src=ASSET+Lz.s.vid; var pr=Lz.vd.play(); if(pr&&pr.catch) pr.catch(function(){}); }
    }
    if(active>0){
      line.setAttribute('x1',at.toFixed(2)); line.setAttribute('y1',0); line.setAttribute('x2',(at-25).toFixed(2)); line.setAttribute('y2',100);
      var tt=(at+5)/135; svg.style.opacity=Math.sin(Math.PI*Math.min(1,Math.max(0,tt))).toFixed(3);
      var col=layers[active].s.c; line.setAttribute('stroke',col); svg.style.color=col;
    } else svg.style.opacity=0;
    var k=reduce?0:1;
    layers.forEach(function(L,i){
      var s=1.04+k*(.16*P+.03*Math.sin(P*6.28+i)), px=-mx*16*k, py=-my*10*k-P*k*30*(i%2?1:-1);
      var tf='translate3d('+px.toFixed(1)+'px,'+py.toFixed(1)+'px,0) scale('+s.toFixed(3)+')';
      L.im.style.transform=tf; if(L.vd) L.vd.style.transform=tf;
    });
    if(!reduce&&(Math.abs(tx-mx)>.002||Math.abs(ty-my)>.002)) req();
  }
  function req(){ if(!raf) raf=requestAnimationFrame(frame); }
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){findSecs();fit();req()});
  if(fine&&!reduce) addEventListener('pointermove',function(e){tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;req()},{passive:true});

  /* embers in the current section colour */
  var ctx=cv.getContext('2d'), W=0,H=0,dpr=Math.min(2,devicePixelRatio||1), N=innerWidth<820?22:46, ps=[], accent='#C0392B', vis=true;
  function fit(){ W=innerWidth;H=innerHeight; cv.width=W*dpr;cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  function mk(init){ return {x:Math.random()*W,y:init?Math.random()*H:H+10,r:.6+Math.random()*1.8,v:.15+Math.random()*.55,d:(Math.random()-.5)*.25,a:.2+Math.random()*.6,ph:Math.random()*6.28}; }
  var spC='',spEl=null;
  function sprite(col){ if(col===spC&&spEl) return spEl; spC=col; spEl=document.createElement('canvas'); spEl.width=spEl.height=32; var g=spEl.getContext('2d'), r=g.createRadialGradient(16,16,0,16,16,16); r.addColorStop(0,col); r.addColorStop(.25,col); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,32,32); return spEl; }
  var lastT=0;
  function tick(ts){
    if(reduce) return;
    if(small&&ts-lastT<33){requestAnimationFrame(tick);return} lastT=ts;
    if(vis){
      ctx.clearRect(0,0,W,H);
      var ac=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(); if(ac) accent=ac;
      var sp=sprite(accent);
      for(var i=0;i<ps.length;i++){
        var p=ps[i]; p.y-=p.v; p.x+=p.d+Math.sin(p.ph+=.01)*.15;
        if(p.y<-10) ps[i]=p=mk(false);
        ctx.globalAlpha=p.a*Math.min(1,(H-p.y)/120,p.y/120+.2); var d=p.r*6; ctx.drawImage(sp,p.x-d/2,p.y-d/2,d,d);
      }
      ctx.globalAlpha=1;
    }
    requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange',function(){vis=!document.hidden});
  fit(); for(var q=0;q<N;q++) ps.push(mk(true));
  findSecs(); frame();
  if(!reduce) requestAnimationFrame(tick);
  /* sections are created late by some embeds; re-find a few times */
  var n=0,t=setInterval(function(){findSecs();req();if(++n>20)clearInterval(t)},500);
})();
