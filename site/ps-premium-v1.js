/* Pickle Samurai — premium polish v1 (home page). Pairs with ps-premium-v1.css.
   - Wraps each main-content button label in two identical copies for the hover label roll.
   - Adds the red grid spotlight to the hero on desktop (mouse) devices.
   - Nav: one underline that slides to the hovered link (rests on the current page), and data-scrolled on the bar.
   - Home: adds the "How it works" section (exploded four-layer stack) before the Work section.
   No dependencies; safe to load with defer. */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

  function flip(btn){
    if(btn.querySelector('.ps-flip-box')) return;
    var box=document.createElement('span'); box.className='ps-flip-box';
    var front=document.createElement('span'); front.className='ps-flip-face';
    while(btn.firstChild) front.appendChild(btn.firstChild);
    var back=front.cloneNode(true); back.className='ps-flip-face ps-flip-back'; back.setAttribute('aria-hidden','true');
    box.appendChild(front); box.appendChild(back); btn.appendChild(box); btn.classList.add('ps-flip');
  }

  function spotlight(){
    var hero=document.getElementById('top'); if(!hero||hero.querySelector('.ps-spot')) return;
    var SIZE=380;
    var spot=document.createElement('div'); spot.className='ps-spot'; spot.setAttribute('aria-hidden','true');
    var win=document.createElement('div'); win.className='ps-spot-win';
    var grid=document.createElement('div'); grid.className='ps-spot-grid';
    win.appendChild(grid); spot.appendChild(win); hero.insertBefore(spot,hero.firstChild);
    // the lit grid matches the whole hero (padding included) so its pattern stays fixed while the window moves
    new ResizeObserver(function(){grid.style.width=hero.offsetWidth+'px';grid.style.height=hero.offsetHeight+'px'}).observe(hero);
    var frame=0;
    hero.addEventListener('pointermove',function(e){
      if(e.pointerType!=='mouse') return;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(function(){
        var b=hero.getBoundingClientRect(), x=e.clientX-b.left-SIZE/2, y=e.clientY-b.top-SIZE/2;
        win.style.transform='translate3d('+x+'px,'+y+'px,0)';
        grid.style.transform='translate3d('+(-x)+'px,'+(-y)+'px,0)';
        spot.dataset.on='1';
      });
    });
    hero.addEventListener('pointerleave',function(){cancelAnimationFrame(frame);spot.dataset.on='0'});
  }

  function navInk(){
    var ul=document.querySelector('nav[aria-label="Main"] ul'); if(!ul||ul.classList.contains('ps-ink')) return;
    var bar=document.createElement('span'); bar.className='ps-ink-bar'; bar.setAttribute('aria-hidden','true');
    ul.classList.add('ps-ink'); ul.appendChild(bar);
    var links=[].slice.call(ul.querySelectorAll('a')), here=null, path=location.pathname.replace(/\/$/,'')||'/';
    links.forEach(function(a){ if((a.pathname.replace(/\/$/,'')||'/')===path) here=a; });
    function move(a){
      links.forEach(function(l){l.classList.toggle('ps-ink-on',l===a)});
      if(!a){bar.style.opacity='0';return}
      var u=ul.getBoundingClientRect(), r=a.getBoundingClientRect();
      bar.style.transform='translateX('+(r.left-u.left)+'px) scaleX('+r.width+')';
      bar.style.opacity='1';
    }
    // first placement without a slide-in from the left edge
    bar.style.transition='none'; move(here); bar.offsetWidth; bar.style.transition='';
    links.forEach(function(a){
      a.addEventListener('pointerenter',function(){move(a)});
      a.addEventListener('focus',function(){move(a)});
    });
    ul.addEventListener('pointerleave',function(){move(here)});
    ul.addEventListener('focusout',function(e){ if(!ul.contains(e.relatedTarget)) move(here); });
    addEventListener('resize',function(){bar.style.transition='none';move(here);bar.offsetWidth;bar.style.transition=''},{passive:true});
  }

  function navScroll(){
    var nav=document.querySelector('nav[aria-label="Main"]'); if(!nav) return;
    var on=null, frame=0;
    function check(){ frame=0; var s=(scrollY||document.documentElement.scrollTop)>24; if(s!==on){on=s; nav.dataset.scrolled=s?'1':'0';} }
    addEventListener('scroll',function(){ if(!frame) frame=requestAnimationFrame(check); },{passive:true});
    check();
  }

  function howItWorks(){
    var work=document.getElementById('work'); if(!work||document.getElementById('process')) return;
    var cta=document.querySelector('#top .btn'), href=cta?cta.getAttribute('href'):'/free-audit';
    var steps=[
      ['Audit','Free visibility audit','Request a free review of your website, Google visibility and social profiles. Get a practical look at the issues that may be costing your business calls, bookings and sales. No pressure and no passwords required.',
        '<i style="left:18px;top:52px;width:58%;height:9px"></i><i style="left:18px;top:72px;width:42%;height:9px"></i><i style="left:18px;top:92px;width:50%;height:9px"></i><i class="r" style="right:38px;bottom:42px;width:64px;height:64px"></i><i class="a" style="right:22px;bottom:30px;width:28px;height:7px;transform:rotate(45deg)"></i>'],
      ['Package','Pick a package','Clear one-time prices with timelines. Choose a website, short-form ads, or a Google Business Profile tune-up if your business serves customers in person.',
        '<i style="left:18px;top:56px;width:28%;height:62%"></i><i class="g" style="left:36%;top:48px;width:28%;height:68%"></i><i style="right:18px;top:56px;width:28%;height:62%"></i>'],
      ['Build','We build, you review','Mobile-first builds with revision rounds included in every package, handled remotely wherever your business is.',
        '<i class="a" style="left:18px;top:50px;right:18px;height:12px"></i><i style="left:18px;top:72px;right:18px;height:34%"></i><i style="left:18px;bottom:22px;width:26%;height:22%"></i><i style="left:37%;bottom:22px;width:26%;height:22%"></i><i style="right:18px;bottom:22px;width:26%;height:22%"></i>'],
      ['Launch','Launch and care','Go live, then choose an optional monthly care plan for hosting, monitoring and edits.',
        '<i class="g" style="left:50%;top:54%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%"></i><i class="g" style="left:50%;top:54%;width:20px;height:40px;margin:-28px 0 0 -10px;border-width:0 4px 4px 0;border-radius:0;transform:rotate(87deg)"></i>']
    ];
    var plates='', items='';
    steps.forEach(function(st,i){
      plates+='<div class="ps-how-plate" style="--i:'+i+'"><span class="ps-how-tag">0'+(i+1)+' '+st[0]+'</span>'+st[3]+'</div>';
      items+='<li><b>0'+(i+1)+'</b><h3>'+st[1]+'</h3><p>'+st[2]+'</p></li>';
    });
    var s=document.createElement('section'); s.id='process'; s.className='ps-how'; s.setAttribute('aria-labelledby','ps-how-h');
    s.innerHTML='<div class="ps-how-head"><p class="ps-how-kicker">How it works</p><h2 id="ps-how-h">From first look to launch</h2><p>A clear, remote-friendly process for small businesses anywhere in the United States.</p></div>'+
      '<div class="ps-how-grid"><div class="ps-how-stage" aria-hidden="true"><div class="ps-how-stack">'+plates+'</div></div>'+
      '<div><ol class="ps-how-steps">'+items+'</ol><div class="ps-how-cta"><a class="btn" href="'+href+'">Get My Free Visibility Audit</a><a class="btn ghost" href="/checkout">See Packages &amp; Pricing</a></div></div></div>';
    work.parentNode.insertBefore(s,work);

    var stage=s.querySelector('.ps-how-stage'), stack=s.querySelector('.ps-how-stack'), pl=[].slice.call(s.querySelectorAll('.ps-how-plate')), li=[].slice.call(s.querySelectorAll('.ps-how-steps li'));
    function activate(n){
      li.forEach(function(x,i){x.classList.toggle('on',i===n)});
      pl.forEach(function(x,i){x.classList.toggle('on',i===n);x.classList.toggle('done',i<n)});
    }
    activate(0);
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting) activate(li.indexOf(e.target)); })},{rootMargin:'-45% 0px -45% 0px'});
      li.forEach(function(x){io.observe(x)});
    }
    // the stack opens up as the section rises into view (desktop; CSS pins it open on phones / reduced motion)
    var frame=0;
    function spread(){
      frame=0; var r=stage.getBoundingClientRect(), vh=innerHeight;
      var p=Math.min(1,Math.max(0,(vh*.95-r.top)/(vh*.55)));
      stack.style.setProperty('--e',(p*p*(3-2*p)).toFixed(3));
    }
    addEventListener('scroll',function(){ if(!frame) frame=requestAnimationFrame(spread); },{passive:true});
    addEventListener('resize',spread,{passive:true}); spread();

    // tell the page's scroll story (ps-v3) to hide the mascot and use red here, like the Work section
    if(window.ScrollTrigger&&window.__ps){
      window.ScrollTrigger.create({trigger:s,start:'top 55%',end:'bottom 45%',onToggle:function(self){
        if(!self.isActive) return; var S=window.__ps;
        document.documentElement.style.setProperty('--accent','#C0392B'); S.accent='#C0392B';
        var glow=document.getElementById('glow'); if(glow) glow.style.background='radial-gradient(circle,#C0392B,transparent 70%)';
        S.rot=0; S.secX=0; S.vis=0; S.y=0;
      }});
      window.ScrollTrigger.refresh();
    }
  }

  function init(){
    howItWorks();
    navScroll();
    if(fine) navInk();
    if(fine) document.querySelectorAll('main .btn').forEach(flip);
    if(fine&&!reduce) spotlight();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
