/* Adds a "Services" link to the main nav and the footer legal links on every page (v1). */
(function(){
  function add(){
    if(location.pathname.replace(/\/$/,'')==='/services'){ /* still add so the nav is consistent */ }
    var ul=document.querySelector('nav[aria-label="Main"] ul');
    if(ul && !ul.querySelector('a[href="/services"]')){
      var li=document.createElement('li'), a=document.createElement('a');
      a.href='/services'; a.textContent='Services'; li.appendChild(a);
      var items=[].slice.call(ul.children), work=items.filter(function(x){var l=x.querySelector('a');return l&&/#work$|\/work$/.test(l.getAttribute('href')||'')})[0];
      if(work&&work.nextSibling) ul.insertBefore(li,work.nextSibling); else ul.appendChild(li);
    }
    var legal=document.querySelector('footer nav.legal');
    if(legal && !legal.querySelector('a[href="/services"]')){
      var s=document.createElement('a'); s.href='/services'; s.textContent='Services';
      legal.insertBefore(s,legal.firstChild);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
  document.addEventListener('ps:included',add);
  /* embeds are injected after load on some pages: retry briefly */
  var n=0,t=setInterval(function(){add();if(++n>20)clearInterval(t)},300);
})();
