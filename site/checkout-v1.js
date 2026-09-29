/* Pickle Samurai — "The Forge" checkout (v1)
   Your page picks the package + care plan, then hands off to a Stripe Payment Link.
   Card details are ONLY ever entered on Stripe's secure page — never on this site.

   ======= EDIT HERE =======
   1) Prices below are what the page SHOWS. They must match the prices you set in Stripe.
   2) Paste each Stripe Payment Link (https://buy.stripe.com/...) into STRIPE_LINKS.
      Leave a link as '' and the page will offer "Book a call" instead of Pay for that combo. */
(function(){
var CONFIG={
  currency:'USD',
  careStartsAfterDays:30,        // set the same number as "free trial days" on each Stripe link
  careMinimumMonths:6,           // shown in the agreement text
  bookUrl:'https://calendar.google.com/calendar/appointments/schedules/AcZssZ04zb_XMrqEWHHy236uobBIjQZjtXZEzW-iknCMImnTSsfS3PUrZDcU09yu_R_eMaGFGNuKMVWW',
  termsUrl:'/terms'
};
var STRIPE_LINKS={
  'gbp|none':'',
  'gbp|gbpcare':'',
  'ronin|guard':'',
  'ronin|dojo':'',
  'ronin|shogunc':'',
  'samurai|dojo':'',
  'samurai|shogunc':'',
  'shogun|shogunc':''
};
var BUILDS=[
  {id:'gbp',name:'GBP Tune-Up',kanji:'刃',tag:'Get found locally',price:350,time:'About 1 week',
   care:['none','gbpcare'],
   feats:['Google Business Profile audit and rewrite','Categories, services and hours set up right','Photo plan and upload checklist','Review-reply templates you can reuse']},
  {id:'ronin',name:'Ronin Site',kanji:'浪',tag:'Starter website',price:1500,time:'2 to 3 weeks',
   care:['guard','dojo','shogunc'],
   feats:['Up to 5 pages, mobile-first Webflow build','Contact or booking form with spam protection','On-page SEO basics and fast load times','Security baseline: HTTPS and header review','2 rounds of revisions']},
  {id:'samurai',name:'Samurai Site',kanji:'侍',tag:'Most popular',price:3500,time:'4 to 5 weeks',popular:true,
   care:['dojo','shogunc'],
   feats:['Up to 10 pages with custom scroll animation','CMS for a blog, menu or services','Booking or ordering integration','GBP Tune-Up included','3 rounds of revisions']},
  {id:'shogun',name:'Shogun Experience',kanji:'将',tag:'Immersive brand site',price:7500,time:'6 to 8 weeks',
   care:['shogunc'],
   feats:['Animated 3D or mascot hero, like this site','Up to 15 pages, fully custom interactions','Online store or read-only web3 integration','Advanced SEO, analytics and conversion tracking','4 rounds of revisions and priority timeline']}
];
var CARE={
  none:{id:'none',name:'No monthly plan',price:0,feats:['One-time service only']},
  gbpcare:{id:'gbpcare',name:'GBP Care',price:99,feats:['4 Google Business posts a month','Review-reply drafts','Monthly profile insights report']},
  guard:{id:'guard',name:'Guard Care',price:129,feats:['Webflow hosting included','SSL, uptime and security monitoring','1 hour of edits a month','Email support within 2 business days']},
  dojo:{id:'dojo',name:'Dojo Care',price:249,rec:true,feats:['Webflow CMS hosting included','3 hours of edits a month','Monthly SEO and speed report','2 Google Business posts a month','Support within 1 business day']},
  shogunc:{id:'shogunc',name:'Shogun Care',price:449,feats:['Premium Webflow hosting included','6 hours of edits a month','Quarterly strategy call','Animation and 3D updates','Same-day support on business days']}
};
/* ======= end of edit area ======= */

var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
var root=document.getElementById('ps-checkout'); if(!root) return;
var money=function(n){return '$'+n.toLocaleString('en-US')};
var state={step:1,build:null,care:null,agree:false};
var qs=new URLSearchParams(location.search);
var pre=qs.get('plan'); if(pre&&BUILDS.some(function(b){return b.id===pre})){state.build=pre}
function B(){return BUILDS.find(function(b){return b.id===state.build})}
function h(s){var d=document.createElement('div');d.innerHTML=s.trim();return d.firstChild}

root.innerHTML=
'<header class="fx-head">'+
  '<p class="fx-kicker">Checkout</p>'+
  '<h1 class="fx-title"><span>Forge</span> <span>your</span> <span>site</span></h1>'+
  '<p class="fx-lead">Three quick steps. Pick your blade, pick your guard, seal the deal. Payment happens on Stripe’s secure page.</p>'+
  '<ol class="fx-steps" aria-label="Checkout steps">'+
    '<li data-s="1"><b>1</b><span>Blade</span></li><li data-s="2"><b>2</b><span>Guard</span></li><li data-s="3"><b>3</b><span>Seal</span></li>'+
    '<div class="fx-blade" aria-hidden="true"><i></i></div>'+
  '</ol>'+
'</header>'+
'<div class="fx-grid">'+
  '<div class="fx-main">'+
    '<section class="fx-panel" data-step="1" aria-labelledby="fx-h1"><h2 id="fx-h1">Choose your blade</h2><p class="fx-sub">What are we building? One-time price.</p><div class="fx-builds" role="radiogroup" aria-labelledby="fx-h1"></div></section>'+
    '<section class="fx-panel" data-step="2" aria-labelledby="fx-h2" hidden><h2 id="fx-h2">Choose your guard</h2><p class="fx-sub fx-care-sub"></p><div class="fx-cares" role="radiogroup" aria-labelledby="fx-h2"></div>'+
      '<div class="fx-nav"><button type="button" class="fx-back">← Back</button></div></section>'+
    '<section class="fx-panel" data-step="3" aria-labelledby="fx-h3" hidden><h2 id="fx-h3">Seal the deal</h2><p class="fx-sub">Review your order. You can still change anything.</p>'+
      '<div class="fx-scroll"><div class="fx-scroll-in"></div><div class="fx-hanko" aria-hidden="true"><span>侍</span></div></div>'+
      '<label class="fx-agree"><input type="checkbox" id="fx-agree"><span></span></label>'+
      '<div class="fx-nav"><button type="button" class="fx-back">← Back</button></div></section>'+
  '</div>'+
  '<aside class="fx-sum" aria-label="Order summary" aria-live="polite">'+
    '<p class="fx-sum-k">Your order</p><div class="fx-sum-lines"></div>'+
    '<div class="fx-tot"><span>Due today</span><strong class="fx-today">$0</strong></div>'+
    '<div class="fx-tot m"><span>Monthly</span><strong class="fx-monthly">—</strong></div>'+
    '<button type="button" class="fx-go btn" disabled>Choose a package</button>'+
    '<p class="fx-safe"><i aria-hidden="true"></i>Secure payment by Stripe. We never see or store your card.</p>'+
  '</aside>'+
'</div>'+
'<div class="fx-cut" aria-hidden="true"><canvas></canvas></div>'+
'<div class="fx-toast" role="status"></div>';

var buildsEl=root.querySelector('.fx-builds'), caresEl=root.querySelector('.fx-cares');
BUILDS.forEach(function(b){
  var c=h('<button type="button" class="fx-card" role="radio" aria-checked="false" data-id="'+b.id+'">'+
    (b.popular?'<em class="fx-pop">Most popular</em>':'')+
    '<span class="fx-kanji" aria-hidden="true">'+b.kanji+'</span>'+
    '<small>'+b.tag+'</small><strong>'+b.name+'</strong>'+
    '<span class="fx-price">'+money(b.price)+'<i>one-time</i></span>'+
    '<ul>'+b.feats.map(function(f){return '<li>'+f+'</li>'}).join('')+'</ul>'+
    '<span class="fx-time">Timeline: '+b.time+'</span>'+
    '<span class="fx-pick">Select</span><span class="fx-slash" aria-hidden="true"></span></button>');
  c.addEventListener('click',function(){pickBuild(b.id,c)});
  buildsEl.appendChild(c);
});

function renderCares(){
  var b=B(); caresEl.innerHTML='';
  var sub=root.querySelector('.fx-care-sub');
  sub.textContent= b.id==='gbp' ? 'Optional: keep your profile active every month.' :
    'Every site needs hosting and upkeep. Your care plan covers it, and your first monthly charge is '+CONFIG.careStartsAfterDays+' days after checkout, while we build.';
  b.care.forEach(function(id){
    var k=CARE[id];
    var c=h('<button type="button" class="fx-card fx-care" role="radio" aria-checked="false" data-id="'+id+'">'+
      ((k.rec&&b.id==='ronin')?'<em class="fx-pop">Recommended</em>':'')+
      '<strong>'+k.name+'</strong><span class="fx-price">'+(k.price?money(k.price)+'<i>/ month</i>':'$0')+'</span>'+
      '<ul>'+k.feats.map(function(f){return '<li>'+f+'</li>'}).join('')+'</ul><span class="fx-pick">Select</span><span class="fx-slash" aria-hidden="true"></span></button>');
    c.addEventListener('click',function(){pickCare(id,c)});
    caresEl.appendChild(c);
  });
  if(b.care.length===1&&b.care[0]!=='none'){ // Shogun: plan is included/required
    var only=caresEl.firstChild; only.insertAdjacentHTML('afterbegin','<em class="fx-pop">Included with Shogun</em>');
  }
}

function mark(container,id){
  [].forEach.call(container.querySelectorAll('.fx-card'),function(c){var on=c.dataset.id===id;c.classList.toggle('on',on);c.setAttribute('aria-checked',on)});
}
function slashCard(card){
  if(reduce||!card) return;
  card.classList.remove('cut'); void card.offsetWidth; card.classList.add('cut');
}
function pickBuild(id,card){
  var changed=state.build!==id; state.build=id; mark(buildsEl,id); slashCard(card);
  if(changed){ state.care=null; renderCares(); var b=B(); if(b.care.length===1){state.care=b.care[0]; mark(caresEl,state.care)} }
  summary();
  setTimeout(function(){go(2)},reduce?0:520);
}
function pickCare(id,card){ state.care=id; mark(caresEl,id); slashCard(card); summary(); setTimeout(function(){go(3)},reduce?0:520) }

var firstGo=true;
function go(n){
  if(n>=2&&!state.build) n=1; if(n>=3&&!state.care) n=2;
  state.step=n;
  [].forEach.call(root.querySelectorAll('.fx-panel'),function(p){
    var on=+p.dataset.step===n; p.hidden=!on; if(on){p.classList.remove('in');void p.offsetWidth;p.classList.add('in')}
  });
  [].forEach.call(root.querySelectorAll('.fx-steps li'),function(li){var s=+li.dataset.s;li.classList.toggle('done',s<n);li.classList.toggle('now',s===n);
    li.onclick=function(){if(s<n)go(s)}; li.style.cursor=s<n?'pointer':''});
  root.querySelector('.fx-blade i').style.transform='scaleX('+((n-1)/2)+')';
  if(n===3) scrollPaper();
  summary();
  if(firstGo){firstGo=false;return}
  var top=root.querySelector('.fx-grid').getBoundingClientRect().top+scrollY-110; if(scrollY>top) scrollTo({top:top,behavior:reduce?'auto':'smooth'});
  var hd=root.querySelector('.fx-panel[data-step="'+n+'"] h2'); if(hd){hd.setAttribute('tabindex','-1');hd.focus({preventScroll:true})}
}
[].forEach.call(root.querySelectorAll('.fx-back'),function(b){b.addEventListener('click',function(){go(state.step-1)})});

function scrollPaper(){
  var b=B(), k=CARE[state.care], el=root.querySelector('.fx-scroll-in');
  el.innerHTML='<p class="fx-sk">Order scroll</p>'+
    '<div class="fx-row"><span>'+b.name+'<small>One-time build · '+b.time+'</small></span><b>'+money(b.price)+'</b></div>'+
    (k.price?'<div class="fx-row"><span>'+k.name+'<small>Starts '+CONFIG.careStartsAfterDays+' days after checkout, then monthly</small></span><b>'+money(k.price)+'/mo</b></div>':'')+
    '<div class="fx-row t"><span>Due today</span><b>'+money(b.price)+'</b></div>'+
    '<ul class="fx-next"><li>Stripe emails your receipt right away</li><li>You pick a kickoff call time on the next screen</li><li>You own your domain; registrar fees are paid to them directly</li></ul>';
  var ag=root.querySelector('.fx-agree span');
  ag.innerHTML='I agree to the <a href="'+CONFIG.termsUrl+'" target="_blank" rel="noopener">Terms</a>'+
    (k.price&&b.id!=='gbp'?' and understand '+k.name+' ('+money(k.price)+'/mo) has a '+CONFIG.careMinimumMonths+'-month minimum, then is month-to-month and cancelable anytime.':
     k.price?' and understand '+k.name+' ('+money(k.price)+'/mo) is month-to-month and cancelable anytime.':'.');
  var s=root.querySelector('.fx-scroll'); s.classList.remove('open','sealed'); void s.offsetWidth; s.classList.add('open');
}
root.querySelector('#fx-agree').addEventListener('change',function(e){state.agree=e.target.checked;summary()});

function summary(){
  var b=B(), k=state.care&&CARE[state.care];
  var lines=root.querySelector('.fx-sum-lines');
  lines.innerHTML=(b?'<div class="fx-line"><span>'+b.name+'</span><b>'+money(b.price)+'</b></div>':'<p class="fx-empty">Nothing yet. Pick a blade to start.</p>')+
    (k&&k.price?'<div class="fx-line"><span>'+k.name+'</span><b>'+money(k.price)+'/mo</b></div>':'');
  bump(root.querySelector('.fx-today'),b?money(b.price):'$0');
  bump(root.querySelector('.fx-monthly'),k&&k.price?money(k.price)+'/mo':'—');
  var btn=root.querySelector('.fx-go');
  if(!b){btn.textContent='Choose a package';btn.disabled=true}
  else if(!k){btn.textContent='Next: choose care';btn.disabled=false}
  else if(state.step<3){btn.textContent='Review order';btn.disabled=false}
  else if(!state.agree){btn.textContent='Check the box to continue';btn.disabled=true}
  else {btn.textContent=link()?'Seal & pay securely':'Finish on a quick call';btn.disabled=false}
}
function bump(el,val){ if(el.textContent===val) return; el.textContent=val; if(!reduce){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')} }
function link(){ return STRIPE_LINKS[state.build+'|'+state.care]||'' }

root.querySelector('.fx-go').addEventListener('click',function(){
  if(!state.care){go(2);return} if(state.step<3){go(3);return} if(!state.agree) return;
  seal();
});

/* ---- the signature moment: katana cut -> hanko stamp -> hand-off to Stripe ---- */
function seal(){
  var url=link(), btn=root.querySelector('.fx-go'); btn.disabled=true;
  var dest=url||CONFIG.bookUrl;
  if(url){ // tell Stripe which order this is (shows in your dashboard)
    try{var u=new URL(url); u.searchParams.set('client_reference_id','ps_'+state.build+'_'+state.care+'_'+Date.now()); dest=u.toString()}catch(e){}
  }
  if(reduce){ toast(url?'Opening secure Stripe checkout…':'Opening our booking calendar…'); location.href=dest; return }
  var cut=root.querySelector('.fx-cut'), cv=cut.querySelector('canvas'), ctx=cv.getContext('2d');
  cv.width=innerWidth; cv.height=innerHeight; cut.classList.add('on');
  var col=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#C0392B';
  var t0=performance.now(), D=380;
  (function draw(now){
    var p=Math.min(1,(now-t0)/D), e=1-Math.pow(1-p,4);
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.save(); ctx.translate(cv.width/2,cv.height/2); ctx.rotate(-0.28);
    var L=Math.hypot(cv.width,cv.height)/2;
    ctx.strokeStyle='#fff'; ctx.shadowColor=col; ctx.shadowBlur=30; ctx.lineWidth=4*(1-p)+1; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-L,0); ctx.lineTo(-L+2*L*e,0); ctx.stroke(); ctx.restore();
    if(p<1) requestAnimationFrame(draw); else {
      document.body.classList.add('fx-shake');
      var s=root.querySelector('.fx-scroll'); s.classList.add('sealed');
      embers(s);
      setTimeout(function(){document.body.classList.remove('fx-shake')},450);
      setTimeout(function(){ctx.clearRect(0,0,cv.width,cv.height);cut.classList.remove('on')},250);
      setTimeout(function(){toast(url?'Sealed. Opening secure Stripe checkout…':'Sealed. Let’s finish on a quick call…')},500);
      setTimeout(function(){location.href=dest},1500);
    }
  })(t0);
  if(navigator.vibrate) try{navigator.vibrate([10,40,25])}catch(e){}
}
function embers(anchor){
  var r=anchor.querySelector('.fx-hanko').getBoundingClientRect();
  for(var i=0;i<22;i++){
    var sp=document.createElement('i'); sp.className='fx-ember';
    var a=Math.random()*Math.PI*2, d=60+Math.random()*120;
    sp.style.left=(r.left+r.width/2)+'px'; sp.style.top=(r.top+r.height/2)+'px';
    sp.style.setProperty('--dx',Math.cos(a)*d+'px'); sp.style.setProperty('--dy',Math.sin(a)*d+'px');
    sp.style.animationDelay=(Math.random()*.08)+'s';
    document.body.appendChild(sp); setTimeout(function(n){return function(){n.remove()}}(sp),1100);
  }
}
function toast(msg){var t=root.querySelector('.fx-toast');t.textContent=msg;t.classList.add('show')}
// back button from Stripe restores the page
addEventListener('pageshow',function(e){if(e.persisted){root.querySelector('.fx-toast').classList.remove('show');summary()}});

/* intro: title words rise, cards deal in */
if(!reduce){
  root.classList.add('fx-anim');
  requestAnimationFrame(function(){root.classList.add('fx-ready')});
}
if(state.build){ mark(buildsEl,state.build); renderCares(); var b0=B(); if(b0.care.length===1){state.care=b0.care[0];mark(caresEl,state.care)} }
go(state.build?2:1);
})();
