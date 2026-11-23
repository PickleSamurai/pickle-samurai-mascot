/* Pickle Samurai — premium polish v1 (home page). Pairs with ps-premium-v1.css.
   - Wraps each main-content button label in two identical copies for the hover label roll.
   - Adds the red grid spotlight to the hero on desktop (mouse) devices.
   - Nav: one underline that slides to the hovered link (rests on the current page), and data-scrolled on the bar.
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

  function init(){
    navScroll();
    if(fine) navInk();
    if(fine) document.querySelectorAll('main .btn').forEach(flip);
    if(fine&&!reduce) spotlight();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
