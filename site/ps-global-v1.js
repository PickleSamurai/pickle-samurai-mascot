/* Pickle Samurai — site-wide extras (all pages).
   Loaded from Webflow Site settings > Custom code > Footer.
   - ambient glow on pages that don't have one
   - animated mobile menu (with socials + booking button)
   - "Pricing" link in the main nav
   - social icons in the footer if a page is missing them */
(function(){
  if(window.__psGlobal) return; window.__psGlobal=true;
  var SOCIALS=[
    ['YouTube','https://www.youtube.com/@PickleSamuraiAI','ic-yt'],
    ['TikTok','https://www.tiktok.com/@picklesamuraitoken','ic-tt'],
    ['X','https://x.com/PickleSamurai1','ic-x'],
    ['Discord','https://discord.gg/vec5uYDGy','ic-dc']
  ];
  var BOOK='https://calendar.google.com/calendar/appointments/schedules/AcZssZ04zb_XMrqEWHHy236uobBIjQZjtXZEzW-iknCMImnTSsfS3PUrZDcU09yu_R_eMaGFGNuKMVWW';
  function el(tag,attrs,html){var e=document.createElement(tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;return e}
  function socialGroup(){
    var g=el('div',{'class':'social',role:'group','aria-label':'Pickle Samurai on social media'});
    SOCIALS.forEach(function(s){g.appendChild(el('a',{href:s[1],target:'_blank',rel:'noopener noreferrer','aria-label':'Pickle Samurai on '+s[0]},'<span class="ic '+s[2]+'" aria-hidden="true"></span>'))});
    return g;
  }
  function run(){
    var onHome=!!document.getElementById('glow');
    // 1) glow
    if(!onHome&&!document.querySelector('.ps-glow')){
      document.body.classList.add('ps-has-glow');
      document.body.insertBefore(el('div',{'class':'ps-glow','aria-hidden':'true'}),document.body.firstChild);
      document.body.insertBefore(el('div',{'class':'ps-glow b','aria-hidden':'true'}),document.body.firstChild);
    }
    var nav=document.querySelector('nav[aria-label="Main"]');
    // 2) Pricing link
    if(nav){
      var ul=nav.querySelector('ul');
      if(ul&&!ul.querySelector('a[href="/checkout"]')&&location.pathname.indexOf('/checkout')!==0){
        var li=el('li',{},'<a href="/checkout">Pricing</a>'); ul.appendChild(li);
      }
    }
    // 3) footer socials
    var f=document.querySelector('footer');
    if(f&&!f.querySelector('.social,.soc')){ var first=f.firstElementChild; f.insertBefore(socialGroup(),first?first.nextSibling:null); }
    // 4) mobile menu
    if(nav&&!document.querySelector('.ps-menu')){
      var links=[].slice.call(nav.querySelectorAll('ul a'));
      var menu=el('div',{'class':'ps-menu',id:'ps-menu',role:'dialog','aria-modal':'true','aria-label':'Menu','aria-hidden':'true'});
      var ol=el('ol');
      links.forEach(function(a){var li=el('li');var c=a.cloneNode(true);c.removeAttribute('class');li.appendChild(c);ol.appendChild(li)});
      menu.appendChild(el('div',{'class':'slash','aria-hidden':'true'}));
      menu.appendChild(ol);
      var foot=el('div',{'class':'foot'});
      foot.appendChild(el('a',{'class':'btn',href:BOOK,target:'_blank',rel:'noopener noreferrer'},'Book a free call'));
      foot.appendChild(socialGroup());
      foot.appendChild(el('small',{},'support@picklesamurai.com'));
      menu.appendChild(foot);
      document.body.appendChild(menu);
      var b=el('button',{'class':'ps-burger',type:'button','aria-label':'Open menu','aria-expanded':'false','aria-controls':'ps-menu'},'<i></i><i></i><i></i>');
      nav.appendChild(b);
      var set=function(open){
        menu.classList.toggle('open',open); b.setAttribute('aria-expanded',open); b.setAttribute('aria-label',open?'Close menu':'Open menu');
        menu.setAttribute('aria-hidden',!open); document.documentElement.classList.toggle('ps-lock',open);
        if(window.lenis&&window.lenis.stop){open?window.lenis.stop():window.lenis.start()}
        if(open){var fl=menu.querySelector('a');fl&&setTimeout(function(){fl.focus()},350)}else b.focus({preventScroll:true});
      };
      b.addEventListener('click',function(){set(!menu.classList.contains('open'))});
      menu.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});
      document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open'))set(false)});
      // keep the burger above the open menu
      b.style.position='relative'; nav.style.zIndex='95';
    }
  }
  // <div data-ps-include="URL"></div> -> fetches that HTML fragment (nav + page + footer) and drops it in place.
  // Keeps Webflow embeds tiny: the real page lives in GitHub and updates with one commit.
  function includes(done){
    var nodes=[].slice.call(document.querySelectorAll('[data-ps-include]'));
    if(!nodes.length){done();return}
    var left=nodes.length;
    nodes.forEach(function(n){
      fetch(n.getAttribute('data-ps-include')).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(html){
        var t=document.createElement('template'); t.innerHTML=html;
        [].forEach.call(t.content.querySelectorAll('script'),function(old){var s=document.createElement('script');[].forEach.call(old.attributes,function(a){s.setAttribute(a.name,a.value)});s.textContent=old.textContent;old.replaceWith(s)});
        n.replaceWith(t.content);
      }).catch(function(){n.innerHTML='<p style="padding:40px 20px">This page did not load. Please refresh, or email support@picklesamurai.com.</p>'})
      .then(function(){if(--left===0)done()});
    });
  }
  function start(){includes(function(){run();document.dispatchEvent(new Event('ps:included'))})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
