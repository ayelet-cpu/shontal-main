/* תנועה עדינה לבקרת השכר — «לבנדר» (איילת 15.11.2026). רק מראה: לא משנה נתונים, לא לוחץ על כלום, לא שומר כלום.
   - ריבועי הספירה: המספרים עולים בפתיחה, ומשתנים בתנועה כשהם משתנים (למשל אחרי «טופל»).
   - שורות העובדים נכנסות בעדינות (רק השורות הראשונות — שלא יאט).
   - מעבר בין לשוניות ופתיחת «הערות שכר» — כניסה רכה.
   - «צריך אותך» מגיע ל-0 → «אין יותר מה לבדוק ✓» לשנייה וחצי.
   חל רק כשהמראה החדש פעיל (#payTheme). מי שביקש «פחות תנועה» במחשב — בלי תנועה. */
(function(){
  if(window.__lvOn) return; window.__lvOn=1;
  var D=document;
  function on(){ return !!D.getElementById('payTheme'); }
  var reduce=false; try{ reduce=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){}
  function anim(el,k,o){ try{ if(el&&el.animate&&!reduce) return el.animate(k,o); }catch(_){} return null; }
  var EASE='cubic-bezier(.2,.8,.2,1)';

  /* ---------- מספרים ---------- */
  var nf=null; try{ nf=new Intl.NumberFormat('he-IL'); }catch(_){}
  var last={};                 /* הערך האחרון שראינו לכל ריבוע (לפי data-onef) */
  var writing=new WeakMap();   /* מה שאנחנו כתבנו — כדי לא לדרוס עדכון של המערכת עצמה */
  function numOf(b){ var t=b.firstChild&&b.firstChild.nodeType===3?b.firstChild.nodeValue:''; var m=/^\s*([\d,]+)\s*$/.exec(t||''); return m?+m[1].replace(/,/g,''):null; }
  function tween(b,from,to,dur){
    var node=b.firstChild; if(!node||node.nodeType!==3) return;
    var finalTxt=node.nodeValue, t0=performance.now();
    var lead=/^\s*/.exec(finalTxt)[0], trail=/\s*$/.exec(finalTxt)[0];
    function fmt(v){ v=Math.round(v); return lead+(nf&&/,/.test(finalTxt)?nf.format(v):String(v))+trail; }
    function step(now){
      if(b.firstChild!==node||(writing.get(b)!=null&&node.nodeValue!==writing.get(b))){ writing.delete(b); return; }  /* המערכת שינתה — עוצרים */
      var k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,4);
      var s=k<1?fmt(from+(to-from)*e):finalTxt; node.nodeValue=s; writing.set(b,s);
      if(k<1) requestAnimationFrame(step); else writing.delete(b);
    }
    var s0=fmt(from); node.nodeValue=s0; writing.set(b,s0); requestAnimationFrame(step);
  }
  function tiles(first){
    var ks=D.querySelectorAll('.one-ks .one-k'); if(!ks.length) return;
    ks.forEach(function(k,i){
      var key=k.getAttribute('data-onef')||i, b=k.querySelector('b'); if(!b) return;
      if(writing.get(b)!=null) return;
      var v=numOf(b); if(v==null){ last[key]=null; return; }
      var prev=last[key];
      if(first){
        anim(k,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:420,delay:i*60,easing:EASE,fill:'backwards'});
        if(v>0) tween(b,0,v,700+Math.min(500,v*4));
      }else if(prev!=null&&prev!==v){
        tween(b,prev,v,450);
        anim(b,[{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:420,easing:'ease-out'});
        if(key==='a'&&prev>0&&v===0) done();
      }
      last[key]=v;
    });
  }

  /* ---------- שורות ---------- */
  function rows(list){
    var n=0; for(var i=0;i<list.length&&n<30;i++){ var r=list[i]; if(r.tagName!=='TR'||r.offsetParent===null) continue;
      anim(r,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:280,delay:n*16,easing:EASE,fill:'backwards'}); n++; }
  }

  /* ---------- לשוניות / הערות שכר ---------- */
  function shownView(){ var v=D.querySelectorAll('[id^="view"]'); for(var i=0;i<v.length;i++){ if(v[i].offsetParent!==null&&v[i].getBoundingClientRect().height>40) return v[i]; } return null; }
  D.addEventListener('click',function(e){
    if(!on()) return;
    var t=e.target.closest&&e.target.closest('.tabs .tab,.tabs .tbtn,.tabs button'); if(!t) return;
    setTimeout(function(){ var v=shownView(); if(v) anim(v,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:260,easing:EASE}); },0);
  },true);
  var nxWas=false;
  function nxCheck(){ var o=D.documentElement.classList.contains('nx-on'); if(o&&!nxWas){ var nx=D.getElementById('nx'); if(nx) anim(nx,[{opacity:0,transform:'translateY(14px) scale(.99)'},{opacity:1,transform:'none'}],{duration:300,easing:EASE}); } nxWas=o; }

  /* ---------- «אין יותר מה לבדוק» ---------- */
  function done(){
    if(reduce) return;
    var w=D.createElement('div'); w.className='lv-done';
    w.innerHTML='<div><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#16855a" stroke-width="6" stroke-linecap="round"/><path d="M30 52 l13 13 l27 -29" fill="none" stroke="#16855a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg><b>אין יותר מה לבדוק</b><span>כל מה שחיכה לך — טופל</span></div>';
    D.body.appendChild(w);
    var c=w.querySelector('circle'), p=w.querySelector('path'); var cl=c.getTotalLength(), pl=p.getTotalLength();
    c.style.strokeDasharray=cl; p.style.strokeDasharray=pl; c.style.strokeDashoffset=cl; p.style.strokeDashoffset=pl;
    anim(c,[{strokeDashoffset:cl},{strokeDashoffset:0}],{duration:550,delay:120,easing:'ease-out',fill:'forwards'});
    anim(p,[{strokeDashoffset:pl},{strokeDashoffset:0}],{duration:400,delay:600,easing:'ease-out',fill:'forwards'});
    var a=anim(w.firstChild,[{opacity:0,transform:'translateY(10px) scale(.96)'},{opacity:1,transform:'none',offset:.15},{opacity:1,offset:.85},{opacity:0,transform:'scale(1.02)'}],{duration:2200,easing:'ease-out',fill:'forwards'});
    if(a) a.onfinish=function(){ w.remove(); }; else setTimeout(function(){ w.remove(); },2200);
  }

  /* ---------- מעקב אחרי שינויים במסך ---------- */
  var pend=false, addedRows=[];
  function flushObs(){ pend=false; if(!on()) return; tiles(false); if(addedRows.length){ rows(addedRows); addedRows=[]; } nxCheck(); }
  function start(){
    if(!on()) return;
    tiles(true);
    var tb=D.querySelectorAll('.wvt tbody'); tb.forEach(function(t){ rows(t.children); });
    nxCheck();
    var mo=new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){ var m=ms[i];
        if(m.type==='childList'&&m.target.tagName==='TBODY'&&m.target.closest&&m.target.closest('.wvt')&&m.addedNodes.length<400){ for(var j=0;j<m.addedNodes.length;j++) addedRows.push(m.addedNodes[j]); }
      }
      if(!pend){ pend=true; requestAnimationFrame(flushObs); }
    });
    mo.observe(D.body,{childList:true,subtree:true,characterData:true});
    new MutationObserver(nxCheck).observe(D.documentElement,{attributes:true,attributeFilter:['class']});
  }
  if(D.readyState==='complete') setTimeout(start,60); else addEventListener('load',function(){ setTimeout(start,60); });
})();
