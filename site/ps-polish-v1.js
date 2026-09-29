/* Pickle Samurai polish (v1): Instagram icon, section imagery, card thumbnails, process band, motion.
   Loaded from Webflow Site settings > Custom code > Footer. Everything is injected, so no page embed needs editing. */
(function(){
  if(window.__psPolish) return; window.__psPolish=1;
  var ASSET='https://cdn.jsdelivr.net/gh/PickleSamurai/pickle-samurai-mascot@9e6fb72807f6d0fb309c14651149c286712a6993/assets/site/';
  var IG='https://www.instagram.com/thepicklesamurai/';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var isHome=/^\/?$/.test(location.pathname);

  /* ---------- CSS ---------- */
  var igSvg="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.351-.2 6.78-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/></svg>";
  var igUrl='url("data:image/svg+xml,'+encodeURIComponent(igSvg)+'")';
  var css=[
   '.ic-ig{-webkit-mask-image:'+igUrl+';mask-image:'+igUrl+'}',
   /* section images */
   '.ps-fig{position:relative;margin:0 0 26px;aspect-ratio:2.2/1;overflow:hidden;background:#17171D;border-top:1px solid rgba(233,184,114,.4);clip-path:polygon(0 0,calc(100% - 26px) 0,100% 26px,100% 100%,0 100%)}',
   '.ps-fig img{position:absolute;left:0;top:-8%;width:100%;height:116%;object-fit:cover;display:block;will-change:transform;animation:psKen 22s ease-in-out infinite alternate}',
   '.ps-fig::before{content:"";position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,transparent 45%,rgba(14,14,18,.75)),radial-gradient(120% 90% at 100% 0,color-mix(in srgb,var(--fa,#C0392B) 32%,transparent),transparent 60%);pointer-events:none}',
   '.ps-fig::after{content:"";position:absolute;inset:0;z-index:3;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.16) 50%,transparent 65%);transform:translateX(-130%);pointer-events:none}',
   '.ps-fig.in::after{animation:psSheen 1.6s .3s ease-out 1 forwards}',
   '.ps-fig figcaption{position:absolute;left:16px;bottom:12px;z-index:4;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(243,241,236,.85)}',
   '@keyframes psKen{from{scale:1.02}to{scale:1.1}}',
   '@keyframes psSheen{to{transform:translateX(130%)}}',
   /* card thumbnails + tilt spotlight */
   '.card .ps-thumb{display:block;margin:-34px -28px 22px;width:calc(100% + 56px);max-width:none;height:170px;object-fit:cover;object-position:top;border-bottom:1px solid rgba(233,184,114,.25);transition:transform .8s cubic-bezier(.2,.8,.2,1),filter .5s;filter:saturate(.9) brightness(.92)}',
   '.card:hover .ps-thumb{transform:scale(1.04);filter:none}',
   '.card{overflow:hidden;--mx:50%;--my:0%}',
   '.card::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(360px circle at var(--mx) var(--my),rgba(233,184,114,.13),transparent 60%)}',
   '.card:hover::before{opacity:1}',
   '.card>*{position:relative;z-index:1}',
   /* button sheen */
   '.btn{position:relative;overflow:hidden}',
   '.btn::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.32) 50%,transparent 70%);transform:translateX(-130%);pointer-events:none}',
   '.btn:hover::after{transform:translateX(130%);transition:transform .7s ease}',
   /* process band */
   '.ps-proc{position:relative;z-index:5;padding:clamp(70px,10vw,130px) clamp(20px,6vw,96px);background:linear-gradient(180deg,rgba(14,14,18,0),rgba(23,23,29,.88) 18%,rgba(23,23,29,.88) 82%,rgba(14,14,18,0))}',
   '.ps-proc h2{font-size:clamp(44px,7vw,110px);margin-bottom:38px}',
   '.ps-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;list-style:none;padding:0;margin:0;counter-reset:s}',
   '.ps-steps li{position:relative;padding:26px 22px 24px;background:#0E0E12;border-top:1px solid rgba(233,184,114,.35);clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%);opacity:0;transform:translateY(34px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1)}',
   '.ps-steps.in li{opacity:1;transform:none}',
   '.ps-steps.in li:nth-child(2){transition-delay:.12s}.ps-steps.in li:nth-child(3){transition-delay:.24s}.ps-steps.in li:nth-child(4){transition-delay:.36s}',
   '.ps-steps li::before{counter-increment:s;content:"0" counter(s);display:block;font-family:"Bebas Neue",Impact,sans-serif;font-size:56px;line-height:.9;color:transparent;-webkit-text-stroke:1px #C0392B;margin-bottom:10px}',
   '.ps-steps h3{font-size:30px;margin-bottom:10px}',
   '.ps-steps p{color:#A6A4AD;font-size:15px;line-height:1.6}',
   '.ps-price{margin-top:34px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;color:#A6A4AD;font-size:15px}',
   '.ps-price b{color:#F3F1EC;font-weight:600}',
   '@media(max-width:900px){.ps-steps{grid-template-columns:1fr 1fr}}',
   '@media(max-width:560px){.ps-steps{grid-template-columns:1fr}.card .ps-thumb{height:150px}}',
   /* dojo banner behind CTA heading area */
   '.cta.ps-banner::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(14,14,18,.96) 0%,rgba(14,14,18,.78) 55%,rgba(14,14,18,.5) 100%),var(--bn) center/cover no-repeat;opacity:.9;pointer-events:none}',
   '@media(prefers-reduced-motion:reduce){.ps-fig img{animation:none}.ps-fig.in::after{animation:none}.ps-steps li{opacity:1;transform:none;transition:none}.btn::after{display:none}}'
  ].join('\n');
  var st=document.createElement('style'); st.setAttribute('data-ps-polish',''); st.textContent=css; document.head.appendChild(st);

  /* ---------- Instagram icon ---------- */
  function addIG(){
    document.querySelectorAll('.social:not([data-ig]),.socials:not([data-ig])').forEach(function(g){
      g.setAttribute('data-ig','1');
      var tt=g.querySelector('a[href*="tiktok.com"]'); if(!tt) return;
      var a=document.createElement('a'); a.href=IG; a.target='_blank'; a.rel='noopener noreferrer';
      a.setAttribute('aria-label','Pickle Samurai on Instagram');
      if(tt.classList.contains('soc')){ a.className='soc'; a.innerHTML='<span class="ic ic-ig" aria-hidden="true"></span>Instagram <i>&#8599;</i>'; }
      else a.innerHTML='<span class="ic ic-ig" aria-hidden="true"></span>';
      tt.parentNode.insertBefore(a,tt.nextSibling);
    });
  }

  /* ---------- section images (home) ---------- */
  var FIGS=[
    {sel:'#design .disc',img:'design.jpg',alt:'Laptop and monitor on a dark desk showing an abstract website layout, lit in crimson red (illustration)',cap:'Design',a:'#C0392B'},
    {sel:'#security .disc',img:'security.jpg',alt:'A glowing violet shield and padlock hovering above a dark desk (illustration)',cap:'Security',a:'#7B3FE4'},
    {sel:'#web3 .disc',img:'web3.jpg',alt:'Glass nodes joined by thin green light lines in a dark space (illustration)',cap:'Web3',a:'#9DC63B'}
  ];
  var figs=[];
  function addFigs(){
    FIGS.forEach(function(f){
      var d=document.querySelector(f.sel); if(!d||d.querySelector('.ps-fig')) return;
      var fg=document.createElement('figure'); fg.className='ps-fig'; fg.style.setProperty('--fa',f.a);
      fg.innerHTML='<img src="'+ASSET+f.img+'" alt="'+f.alt+'" width="1200" height="600" loading="lazy" decoding="async"><figcaption>'+f.cap+'</figcaption>';
      d.insertBefore(fg,d.firstChild); figs.push(fg);
    });
  }

  /* ---------- work card thumbnails ---------- */
  var THUMBS={'ember & wheel':'thumb-ember.jpg','sharpline':'thumb-sharpline.jpg','fresh stripe':'thumb-fresh.jpg'};
  function addThumbs(){
    document.querySelectorAll('.cards .card').forEach(function(c){
      if(c.querySelector('.ps-thumb')) return;
      var h=c.querySelector('h3'); if(!h) return;
      var k=h.textContent.trim().toLowerCase(), src=THUMBS[k]; if(!src) return;
      var im=document.createElement('img'); im.className='ps-thumb'; im.src=ASSET+src; im.width=800; im.height=400; im.loading='lazy'; im.decoding='async';
      im.alt='Screenshot of the '+h.textContent.trim()+' concept site (fictional business)';
      c.insertBefore(im,c.firstChild);
    });
  }

  /* ---------- process band + CTA banner (home) ---------- */
  function addProcess(){
    var work=document.querySelector('#work'); if(!work||document.querySelector('.ps-proc')) return;
    var s=document.createElement('section'); s.className='ps-proc'; s.id='process'; s.style.minHeight='0'; s.style.display='block';
    s.setAttribute('aria-labelledby','ps-proc-h');
    s.innerHTML='<h2 id="ps-proc-h">How it works</h2><ol class="ps-steps">'+
     '<li><h3>Free call</h3><p>15 minutes on Google Meet. You tell us what you need; we tell you plainly what fits.</p></li>'+
     '<li><h3>Pick a package</h3><p>Clear one-time prices with timelines. Start with a Google Business Profile tune-up or a full site.</p></li>'+
     '<li><h3>We build, you review</h3><p>Mobile-first, secure by default, with revision rounds included in every package.</p></li>'+
     '<li><h3>Launch and care</h3><p>Go live, then choose an optional monthly care plan for hosting, monitoring and edits.</p></li></ol>'+
     '<div class="ps-price"><span>Websites from <b>$1,500</b> &middot; Google Business Profile tune-up <b>$350</b></span><a class="btn ghost" href="/checkout">See packages &amp; pricing</a><a class="btn" href="/services">What is included</a></div>';
    work.parentNode.insertBefore(s,work.nextSibling);
    io(s.querySelector('.ps-steps'));
  }
  function addBanner(){
    var c=document.querySelector('.cta'); if(!c||c.classList.contains('ps-banner')) return;
    c.style.setProperty('--bn','url("'+ASSET+'dojo.jpg")'); c.classList.add('ps-banner');
    c.style.overflow='hidden';
  }

  /* ---------- reveal-on-view + parallax + card tilt ---------- */
  var obs=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target)}})},{threshold:.25}):null;
  function io(el){ if(!el) return; if(obs) obs.observe(el); else el.classList.add('in'); }
  function watchFigs(){ figs.forEach(function(f){ if(!f.__w){f.__w=1;io(f)} }); }
  var ticking=false;
  function par(){
    ticking=false; var vh=innerHeight;
    document.querySelectorAll('.ps-fig').forEach(function(f){
      var r=f.getBoundingClientRect(); if(r.bottom<0||r.top>vh) return;
      var p=((r.top+r.height/2)-vh/2)/vh; f.firstElementChild.style.transform='translateY('+(p*-7).toFixed(2)+'%)';
    });
  }
  function onScroll(){ if(!ticking){ticking=true;requestAnimationFrame(par)} }
  function tilt(){
    if(reduce||!(matchMedia('(hover:hover) and (pointer:fine)').matches)) return;
    document.addEventListener('pointermove',function(e){
      var c=e.target.closest&&e.target.closest('.cards .card'); if(!c) return;
      var r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      c.style.setProperty('--mx',(x*100)+'%'); c.style.setProperty('--my',(y*100)+'%');
    },{passive:true});
  }

  function run(){
    addIG();
    if(isHome){
      var before=document.documentElement.scrollHeight;
      addFigs(); addThumbs(); addProcess(); watchFigs(); par();
      if(document.documentElement.scrollHeight!==before){
        try{ if(window.ScrollTrigger) ScrollTrigger.refresh(); }catch(e){}
        try{ dispatchEvent(new Event('resize')); }catch(e){}
      }
    } else { addThumbs(); }
  }
  tilt();
  addEventListener('scroll',onScroll,{passive:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  document.addEventListener('ps:included',run);
  var n=0,t=setInterval(function(){run();if(++n>25)clearInterval(t)},400);
})();
