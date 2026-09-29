(function(){
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  function scaleAll(){
    document.querySelectorAll('[data-vw]').forEach(function(box){
      var f=box.querySelector('iframe'); if(!f) return;
      f.style.transform='scale('+(box.clientWidth/parseFloat(box.getAttribute('data-vw')))+')';
    });
  }
  addEventListener('resize',scaleAll); scaleAll();
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('iframe[data-src]').forEach(function(f){f.src=f.getAttribute('data-src');f.removeAttribute('data-src')});
    e.target.classList.add('in'); io.unobserve(e.target);
  })},{rootMargin:'200px 0px',threshold:.05});
  document.querySelectorAll('.rv,.stage').forEach(function(n){io.observe(n)});
  document.querySelectorAll('.stage').forEach(function(st){
    var b=st.querySelector('.browser'), vp=st.querySelector('.viewport'), btn=st.querySelector('.try');
    if(btn) btn.addEventListener('click',function(){vp.classList.add('live');vp.querySelector('iframe').focus()});
    vp.addEventListener('mouseleave',function(){vp.classList.remove('live')});
    if(!reduce&&fine){
      st.addEventListener('pointermove',function(e){
        var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        b.style.setProperty('--ry',(x*7)+'deg'); b.style.setProperty('--rx',(-y*5)+'deg');
      });
      st.addEventListener('pointerleave',function(){b.style.setProperty('--ry','0deg');b.style.setProperty('--rx','0deg')});
    }
  });
})();
