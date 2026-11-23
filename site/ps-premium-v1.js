/* Pickle Samurai — premium polish v1 (home page). Pairs with ps-premium-v1.css.
   - Wraps each main-content button label in two identical cube faces for the hover flip.
   - Adds the red grid spotlight to the hero on desktop (mouse) devices.
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

  function init(){
    if(fine) document.querySelectorAll('main .btn').forEach(flip);
    if(fine&&!reduce) spotlight();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
