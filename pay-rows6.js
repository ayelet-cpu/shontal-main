/* שורת עובד «דוגמה 6» (איילת 3.11.2026): שורת כותרת עם תוויות (שעות · מחושב · תלוש · פער · סטטוס),
   מתחת «מה לא בסדר» בשני טורים, ואז הכפתורים. כתב גדול יותר ופחות רווחים — אותו מידע בדיוק.
   מוזרק ע"י pay/index.html לסוף כל חודש; מחליף רק את rowHtml (התצוגה), לא נוגע בחישובים ובנתונים.
   חל רק על בקרות שבהן rowHtml במבנה המוכר (פאסטל, אריאלה וטופול); בכל השאר — לא משנה כלום. */
(function(){
  try{
    if(typeof rowHtml!=="function"||!/c-name/.test(String(rowHtml))||typeof issuesOf!=="function"||typeof rvBtns!=="function") return;
    var old=rowHtml;
    /* ---------- «מה צריך ממך» (איילת 3.11): שורה צבעונית אחת — הבעיה + מה עושים + כפתור. ---------- */
    var EMO=function(s){ return encodeURIComponent(s||''); };
    /* שאלות של החשבת על עובד: נשמרות ב-pay_kv (דרך localStorage של החודש) — {scope:{emp:[{q,at,a,aat}]}} */
    var AQK='pay-accq-v1';
    function aqScope(){ return (DATA.restaurant||document.title||'')+'|'+(DATA.month||''); }
    function aqAll(){ try{ return JSON.parse(localStorage.getItem(AQK)||'{}')||{}; }catch(_){ return {}; } }
    function aqOf(name){ var A=aqAll()[aqScope()]||{}; return A[name]||[]; }
    function aqSave(name,list){ var A=aqAll(), s=aqScope(); A[s]=A[s]||{}; A[s][name]=list; try{ localStorage.setItem(AQK,JSON.stringify(A)); }catch(_){} }
    window.__r6answer=function(name,i){
      var L=aqOf(name), q=L[i]; if(!q) return;
      var t=prompt('התשובה שלך לחשבת על '+name+':\n«'+q.q+'»',q.a||''); if(t==null) return;
      q.a=t.trim(); q.aat=new Date().toLocaleDateString('he-IL'); aqSave(name,L); render();
    };
    window.__r6info=function(name,i){ var L=aqOf(name); if(!L[i]) return; L[i].a=L[i].a||'לידיעה בלבד'; L[i].aat=new Date().toLocaleDateString('he-IL'); aqSave(name,L); render(); };
    /* הערות של רועי (או מנהל אחר) אחרי שהתלושים הגיעו — «דגלים» (איילת 3.11): העובד מסומן «יש בעיה»,
       אבל שום דבר לא נשלח לחשבת. איילת כותבת בעצמה את ההערה לחשבת (➕), או מסמנת «טופל».
       נשמר ב-pay_kv «pay-flags-v1»: {"10/2026":[{emp, rest, by, t, at, done}]} — emp = שם או תחילת שם כמו בבקרה. */
    var FK='pay-flags-v1';
    function flAll(){ try{ return JSON.parse(localStorage.getItem(FK)||'{}')||{}; }catch(_){ return {}; } }
    function flMatch(f,e){ var a=String(f.emp||'').trim(), b=String(e.name||'').trim(); if(!a) return false;
      if(f.rest&&DATA.restaurant&&f.rest!==DATA.restaurant) return false;
      return b===a||b.indexOf(a+' ')===0||(e.slipname&&String(e.slipname).indexOf(a)>=0&&a.indexOf(' ')>0); }
    function flagsOf(e){ var L=flAll()[DATA.month||'']||[]; return L.map(function(f,i){ return {f:f,i:i}; }).filter(function(x){ return flMatch(x.f,e); }); }
    window.__r6flagDone=function(i){ var A=flAll(), L=A[DATA.month||'']||[]; if(!L[i]) return; L[i].done=new Date().toLocaleDateString('he-IL'); try{ localStorage.setItem(FK,JSON.stringify(A)); }catch(_){} render(); };
    if(typeof assess==="function"){
      var oldAssess=assess;
      window.assess=function(e){ var a=oldAssess(e);
        try{ if(flagsOf(e).some(function(x){ return !x.f.done; })&&a&&a.st&&a.st.sev!=='crit') a.st={k:'gap',sev:'crit',flag:true,label:'❗ הערה של '+(flagsOf(e)[0].f.by||'רועי')}; }catch(_){}
        return a; };
    }
    function noteTxt(t){ t=String(t||'').replace(/\s+/g,' ').trim(); return t.length>110?t.slice(0,110)+'…':t; }
    function todoHtml(e,a){
      var s=e.slip, seen={};
      /* בלי כפילויות: הערות שכר מופיעות ממילא בשורות ההערות, ו«בונוס מאושר … חסר» כבר נאמר כ«בונוס … חסר» */
      var iss=issuesOf(e,a).filter(function(x){ return (!/^ℹ/.test(x)||/<b>/.test(x))&&!/^הערת שכר «/.test(x); })
        .filter(function(x){ var k=String(x).replace(/<[^>]+>/g,'').replace(/מאושר\s*/,'').replace(/→.*$/,'').trim(); if(seen[k]) return false; seen[k]=1; return true; });
      var more=iss.length>3?iss.length-3:0; iss=more?iss.slice(0,3).concat(['ועוד '+more+' — בכרטיס']):iss;
      if(/חשבונית/.test((e.rateNote||'')+(e.gold_status||''))&&!s) return '<div class="r6todo ok">✓ <span><b>עובד/ת חשבונית</b> — לא מקבל/ת תלוש, אין מה לבדוק</span></div>';
      var lane=laneOf(e), nm=EMO(e.name), out='';
      var openQ=aqOf(e.name).map(function(q,i){ return {q:q,i:i}; }).filter(function(x){ return !x.q.a; });
      var asked=afterNotes(e).filter(function(n){ return !n.done; });
      var waitLine=asked.length?'<div class="r6todo wait">⏳ <span><b>'+(!s?'ביקשת מהחשבת תלוש':'ביקשת תיקון מהחשבת')+'</b> — מחכים לתשובה או לתלוש '+(!s?'':'מתוקן')+'. את לא צריכה לעשות כלום כרגע.</span>'
        +'<span class="go"><button class="r6btn lite" data-note="'+nm+'">✏️ לערוך מה שביקשת</button></span></div>':'';
      if(asked.length&&lane!=='pay'&&(!s||a.st.sev==='crit'||a.st.sev==='warn')) out=waitLine;
      else if(lane==='pay') out='<div class="r6todo ok">✓ <span><b>אישרת</b>'+(iss.length?' — למרות: '+iss.slice(0,2).join(' · '):'')+'</span></div>';
      else if(!s&&a.worked){
        var msg=e.name+' — אין תלוש. עבד/ה '+F1(e.hours||0)+' שעות'+(e.days?' ב-'+e.days+' ימים':'')+' — לבדוק ולהוציא תלוש';
        out='<div class="r6todo bad">❗ <span><b>אין תלוש</b> — עבד/ה '+F1(e.hours||0)+' שעות'+(e.days?' ('+e.days+' ימים)':'')+'</span>'
          +'<span class="go"><button class="r6btn" data-addnote="'+nm+'" data-suggest="'+EMO(msg)+'">➕ לבקש תלוש מהחשבת</button>'
          +'<button class="r6btn lite" data-lane="pay" data-emp="'+nm+'">✓ ידוע לי, לא צריך</button></span></div>';
      }
      else if(!s) out='';
      else if((a.st.sev==='crit'||a.st.sev==='warn')&&!(a.st.flag&&!iss.length)){
        var head=a.diff!=null&&Math.abs(a.diff)>35&&!redOK(e,a)?(a.diff>0?'חסרים '+F0(a.diff)+' ₪ בתלוש':'עודף '+F0(-a.diff)+' ₪ בתלוש'):(a.st.sev==='crit'?'יש בעיה בתלוש':'לשים לב');
        var sug=(iss.length?e.name+' — '+iss.map(function(x){ return String(x).replace(/<[^>]+>/g,''); }).join('; '):gapSuggestion(e,a));
        out='<div class="r6todo '+(a.st.sev==='crit'?'bad':'wait')+'">❗ <span><b>'+head+'</b>'+(iss.length?' — '+iss.join(' · '):'')+'</span>'
          +'<span class="go"><button class="r6btn" data-addnote="'+nm+'" data-suggest="'+EMO(sug)+'">➕ להוסיף לחשבת</button>'
          +'<button class="r6btn lite" data-lane="pay" data-emp="'+nm+'">✓ ידוע לי</button></span></div>';
      }
      else if(a.st.k==='ok'||a.st.sev==='good') out='<div class="r6todo ok">✓ <span>'+okText(e,a)+'</span></div>';
      flagsOf(e).forEach(function(x){ var f=x.f, by=f.by||'רועי';
        if(f.done){ return; }
        out='<div class="r6todo bad">🔎 <span><b>'+esc(by)+' כתב אחרי התלוש:</b> «'+esc(f.t)+'»'+(f.at?' <span class="r6d">('+esc(f.at)+')</span>':'')+'<br><span class="r6d">עוד לא נשלח לחשבת — את מחליטה מה לכתוב לה.</span></span>'
          +'<span class="go"><button class="r6btn" data-addnote="'+nm+'" data-suggest="'+EMO(e.name+' — '+f.t)+'">✍️ לכתוב לחשבת</button>'
          +'<button class="r6btn lite" onclick="event.stopPropagation();__r6flagDone('+x.i+')">✓ טופל / לא רלוונטי</button></span></div>'+out;
      });
      openQ.forEach(function(x){
        out+='<div class="r6todo q">❓ <span><b>החשבת שאלה:</b> «'+esc(x.q.q)+'»'+(x.q.at?' <span class="r6d">('+esc(x.q.at)+')</span>':'')+'</span>'
          +'<span class="go"><button class="r6btn" onclick="event.stopPropagation();__r6answer(decodeURIComponent(\''+nm+'\'),'+x.i+')">✍️ לענות לחשבת</button>'
          +'<button class="r6btn lite" onclick="event.stopPropagation();__r6info(decodeURIComponent(\''+nm+'\'),'+x.i+')">✓ רק לידיעה</button></span></div>';
      });
      return out;
    }
    /* בכרטיס פתוח — רק מה שדורש ממך משהו: הערות של רועי ושאלות החשבת (איילת 3.11: «הורדת את ההערה של רועי, היא חשובה») */
    function attnHtml(e,nob){ var nm=EMO(e.name), out='';
      flagsOf(e).forEach(function(x){ var f=x.f, by=f.by||'רועי'; if(f.done) return;
        out+='<div class="r6todo bad">🔎 <span><b>'+esc(by)+' כתב אחרי התלוש:</b> «'+esc(f.t)+'»'+(f.at?' <span class="r6d">('+esc(f.at)+')</span>':'')+'<br><span class="r6d">עוד לא נשלח לחשבת — את מחליטה מה לכתוב לה.</span></span>'
          +(nob?'':'<span class="go"><button class="r6btn" data-addnote="'+nm+'" data-suggest="'+EMO(e.name+' — '+f.t)+'">✍️ לכתוב לחשבת</button>'
          +'<button class="r6btn lite" onclick="event.stopPropagation();__r6flagDone('+x.i+')">✓ טופל / לא רלוונטי</button></span>')+'</div>'; });
      aqOf(e.name).forEach(function(q,i){ if(q.a) return;
        out+='<div class="r6todo q">❓ <span><b>החשבת שאלה:</b> «'+esc(q.q)+'»'+(q.at?' <span class="r6d">('+esc(q.at)+')</span>':'')+'</span>'
          +'<span class="go"><button class="r6btn" onclick="event.stopPropagation();__r6answer(decodeURIComponent(\''+nm+'\'),'+i+')">✍️ לענות לחשבת</button>'
          +'<button class="r6btn lite" onclick="event.stopPropagation();__r6info(decodeURIComponent(\''+nm+'\'),'+i+')">✓ רק לידיעה</button></span></div>'; });
      return out; }
    /* שני סוגי הערות (איילת 3.11: «לא ברור מה לפני מה ולמה אני ממתינה»):
       1. נשלחו עם הערות השכר — לפני שהתלוש הגיע (מדף הבית). המצב: בוצע / לא בוצע בתלוש / אין תלוש.
       2. נכתבו בבקרה אחרי שהתלוש הגיע (תיקונים, «לבקש תלוש»). המצב: מחכים לתשובה או לתלוש מתוקן / החשבת טיפלה. */
    /* הערה לעצמי: סומנה «רק לי», או כתוב בה «לא בתלוש» (למשל תוספת כנגד חשבוניות) — לא לחשבת ולא מחכים לה (איילת 3.11) */
    /* סימון ידני של איילת לכל הערה (3.11): «✓ טופל» / «🔒 לעצמי». pay_kv «pay-nst-v1»: {"10/2026":{"עובד|תחילת ההערה":"done"|"me"}} */
    var NK='pay-nst-v1';
    function nKey(emp,t){ return String(emp||'')+'|'+String(t||'').replace(/\s+/g,' ').trim().slice(0,40); }
    function nstAll(){ try{ return JSON.parse(localStorage.getItem(NK)||'{}')||{}; }catch(_){ return {}; } }
    function nstOf(emp,t){ return (nstAll()[DATA.month||'']||{})[nKey(emp,t)]||''; }
    window.__r6nst=function(emp,t,v){ var A=nstAll(), m=DATA.month||''; A[m]=A[m]||{}; var k=nKey(decodeURIComponent(emp),decodeURIComponent(t));
      if(!v||A[m][k]===v) delete A[m][k]; else A[m][k]=v; try{ localStorage.setItem(NK,JSON.stringify(A)); }catch(_){} render(); };
    function nstBtns(emp,n){ var v=nstOf(emp,n.t), a="'"+EMO(emp)+"','"+EMO(n.t)+"'";
      return '<span class="r6nb">'
        +'<button class="r6btn lite sm'+(v==='done'?' on':'')+'" title="סימון שההערה טופלה" onclick="event.stopPropagation();__r6nst('+a+',\'done\')">✓ טופל</button>'
        +'<button class="r6btn lite sm'+(v==='me'?' on':'')+'" title="הערה בשבילך — לא לחשבת" onclick="event.stopPropagation();__r6nst('+a+',\'me\')">🔒 לעצמי</button></span>'; }
    /* ניכוי שביקשנו («להוריד נעליים 270») — בודקים בעצמנו בניכויי הרשות של התלוש, לא מחכים לחשבת */
    if(typeof noteStatus==="function"){
      var oldNS=noteStatus;
      window.noteStatus=function(e,n){
        var v=nstOf(e.name,n&&n.t);
        if(v==='done') return {ok:true,t:'✓ סימנת שטופל'};
        if(v==='me') return {ok:null,t:'🔒 לעצמי'};
        /* תיקון/הערה שכתבת אחרי התלוש — לא «טופל» לבד גם אם יש בתלוש שורה דומה (איילת 3.11: «אתה לא מעביר על דעת עצמך»). רק ✓ שלך */
        if(n&&(n.r||1)===2&&!n.done){ var o=oldNS(e,n); if(o&&o.ok===true) return {ok:null,t:'ℹ בתלוש: '+String(o.t||'').replace(/^[✓✔]\s*(טופל\s*—\s*)?/,'')}; return o; }
        try{ var s=e.slip, t=String(n&&n.t||'');
          if(s&&/להוריד|לנכות|ניכוי|לקזז|קיזוז/.test(t)&&!/ברוטו|נטו|שכר|שעות|תעריף/.test(t)){
            var nums=(t.replace(/,/g,'').match(/\d+(\.\d+)?/g)||[]).map(Number).filter(function(x){ return x>=10; });
            var vol=s.vol||[], hit=vol.find(function(d){ return nums.some(function(x){ return Math.abs((+d[1]||0)-x)<=1; }); });
            if(nums.length) return hit?{ok:true,t:'✓ בניכויי הרשות: '+hit[0]+' '+F0(hit[1])+' ₪'}
              :{ok:false,t:'✗ אין בניכויי הרשות ניכוי של '+nums.map(F0).join('/')+' ₪'+(vol.length?' (יש: '+vol.map(function(d){ return d[0]+' '+F0(d[1]); }).join(', ')+')':'')};
          } }catch(_){}
        return oldNS(e,n);
      };
    }
    /* «✅ טופלו» בחלון הערות השכר — רק מה שסימנת ✓ בעצמך, אף פעם לא לבד */
    if(typeof noteHandled==="function") window.noteHandled=function(n){ return !!(n&&n.done); };
    /* «❓ לשאול את רועי» (איילת 3.11): הערה שנשמרת כשאלה למנהל — לא לחשבת. בחלון הערות השכר: כפתור בכל שורה + «📋 שאלות לרועי» */
    (function(){
      var list=document.getElementById('notesList'); if(!list||typeof NOTES2==='undefined') return;
      var deco=function(){ list.querySelectorAll('button[data-nme]').forEach(function(b){
        if(b.parentNode.querySelector('.r6roy')) return; var n=NOTES2.find(function(x){ return x.id===b.dataset.nme; }); if(!n) return;
        var r=document.createElement('button'); r.className='who r6roy'+(n.roy?' on':''); r.dataset.nroy=n.id; r.title='שאלה לרועי / למנהל — לא נשלח לחשבת';
        r.textContent=n.roy?'❓ לרועי ✓':'❓ לרועי'; b.after(' ',r); }); };
      new MutationObserver(deco).observe(list,{childList:true,subtree:true}); deco();
      list.addEventListener('click',function(ev){ var b=ev.target.closest('[data-nroy]'); if(!b) return; ev.stopPropagation();
        var n=NOTES2.find(function(x){ return x.id===b.dataset.nroy; }); if(!n) return;
        n.roy=!n.roy; if(n.roy) n.me=true; syncNotesFrom2(); renderNotes(); },true);
      var me=document.getElementById('notesCopyMe');
      if(me&&!document.getElementById('notesCopyRoy')){ var c=document.createElement('button'); c.className='tbtn'; c.id='notesCopyRoy'; c.textContent='📋 שאלות לרועי';
        c.onclick=function(){ var L=NOTES2.filter(function(n){ return n.roy&&!n.done&&String(n.t||'').trim(); });
          var t=L.length?'שאלות לרועי — שכר '+(DATA.month||'')+'\n\n'+L.map(function(n){ return '• '+(n.emp||'כללי')+' — '+n.t; }).join('\n'):'';
          if(!t){ c.textContent='אין שאלות לרועי'; setTimeout(function(){ c.textContent='📋 שאלות לרועי'; },1500); return; }
          try{ navigator.clipboard.writeText(t); c.textContent='✓ הועתק — '+L.length+' שאלות'; }catch(_){ prompt('להעתקה:',t); }
          setTimeout(function(){ c.textContent='📋 שאלות לרועי'; },2000); };
        me.after(' ',c); }
    })();
    /* שורות חריגות בתלוש (איילת 3.11, חן ביטון: «למה לא שיקפת לי שיש פה מילואים במינוס? אני צריכה לדעת כל שורה ושורה»):
       כל שורה במינוס = ❗ (חוץ משורות טיפ), שורה שלא מסווגת / הפרשים = לשים לב */
    function oddLines(s){ var out=[]; ((s&&s.lines)||[]).forEach(function(l){ var d=String(l[0]||''), amt=+l[4]||0;
      if(amt<-0.5&&!/טיפ|מפרע/.test(d)) out.push({l:l,sev:'crit',t:'שורה במינוס בתלוש: «'+d+'» '+F0(amt)+' ₪ — לברר מה זה'});
      else if(Math.abs(amt)>0.5&&(/הפרש|גילום|קיזוז|החזר|תיקון/.test(d)||l[1]==='other'&&!/^(שעות|בר\/מלצר|מתלמד|צ'קר|השלמת שכר)/.test(d))) out.push({l:l,sev:'warn',t:'שורה לא רגילה בתלוש: «'+d+'» '+F0(amt)+' ₪'}); });
      return out; }
    if(typeof issuesOf==="function"){ var oldIss=issuesOf;
      window.issuesOf=function(e,a){ var r=oldIss(e,a)||[]; try{ oddLines(e.slip).forEach(function(x){ if(r.indexOf(x.t)<0) r.push(x.t); }); }catch(_){} return r; }; }
    if(typeof assess==="function"){ var oldAs2=assess;
      window.assess=function(e){ var a=oldAs2(e); try{ if(a&&a.st&&a.st.sev!=='crit'&&laneOf(e)!=='pay'&&oddLines(e.slip).some(function(x){ return x.sev==='crit'; })) a.st={k:'gap',sev:'crit',label:'❗ שורה במינוס בתלוש'};
        /* «תקין» רק כשאין שום דבר ב«מה לא בסדר» — גם כשהסה"כ מתאים, פער ברכיב (שעות מארחת מול 150%) = לבדוק (איילת 3.11: «למה רשמת שהעובד תקין») */
        else if(a&&a.st&&(a.st.sev==='good'||a.st.k==='ok')&&laneOf(e)!=='pay'&&e.slip){ var iss=(issuesOf(e,a)||[]).filter(function(x){ return !/^ℹ/.test(String(x).replace(/<[^>]+>/g,'')); });
          if(iss.length) a.st={k:'gap',sev:'warn',label:'⚠ '+iss.length+(iss.length>1?' פערים ברכיבים':' פער ברכיב')}; } }catch(_){} return a; }; }
    function slipLinesHtml(s){ if(!s||!(s.lines||[]).length) return '';
      var odd=oddLines(s), isOdd=function(l){ return odd.find(function(x){ return x.l===l; }); };
      return '<details class="r6lines"'+(odd.length?' open':'')+'><summary>📄 כל שורות התלוש ('+s.lines.length+')'+(odd.length?' · <b class="r6bad">'+odd.length+' חריגות</b>':'')+'</summary>'
        +'<div class="r6lt">'+s.lines.map(function(l){ var o=isOdd(l), q=l[2]!=null&&l[3]!=null?F1(l[2])+' × '+F1(l[3]):'';
          return '<div class="r6lr'+(o?' '+o.sev:'')+'"><span>'+esc(l[0])+(o?' <b>'+(o.sev==='crit'?'❗':'⚠')+'</b>':'')+'</span><span class="q">'+q+'</span><span class="v">'+(l[4]?F0(l[4]):(l[1]==='meals'||l[1]==='study'?'שווי':'0'))+'</span></div>'; }).join('')
        +'<div class="r6lr tot"><span>סה״כ תשלומים</span><span></span><span class="v">'+F0(s.total!=null?s.total:s.gross)+'</span></div>'
        +((s.vol||[]).length?'<div class="r6lr sub"><span>ניכויי רשות: '+s.vol.map(function(v){ return esc(v[0])+' '+F0(v[1]); }).join(' · ')+'</span><span></span><span></span></div>':'')+'</div></details>'; }
    /* «תקין» ברור (איילת 3.11): מה נבדק ומה המצב — התלוש מול השיפט, הערות שכר, שורות חריגות */
    function okText(e,a){ var N=empNotesFull(e).filter(function(n){ return !isMe(n); }), done=N.filter(function(n){ return noteStatus(e,n).ok===true||handled(e,n); }).length;
      return '<b>תקין</b> — התלוש תואם לשיפט'+(a&&a.tg!=null&&a.exp!=null?' ('+F0(a.exp)+' מול '+F0(a.tg)+')':'')
        +' · '+(N.length?(done===N.length?'הערות השכר בוצעו בתלוש ('+N.length+')':'הערות שכר: '+done+' מתוך '+N.length+' בוצעו'):'אין הערות שכר החודש')
        +' · אין שורות חריגות בתלוש'+checksLine(e); }
    /* מה נבדק — כדי שלא צריך לפתוח כל עובד (איילת 3.11: «כאשר סגור לא מבינים אם תקין באמת») */
    function checksLine(e){ var s=e.slip; if(!s) return '';
      var c=[], y=function(t){ c.push('<i class="y">✓ '+t+'</i>'); }, w=function(t){ c.push('<i class="w">⚠ '+t+'</i>'); };
      y('שעות ותעריף');
      if(e.net||e.glob||e.basis==='manager'){} else { s.travel?y('נסיעות'):w('אין נסיעות'); s.meals?y('שווי ארוחות'):w('אין שווי ארוחות'); }
      if(s.fixedtax>0) w('מס קבוע '+F1(s.fixedtax)+'%'); else if(s.mtax>=47) w('מס שולי '+F1(s.mtax)+'%'); else y('מס');
      s.pension?y('פנסיה'):w('אין פנסיה');
      if(s.recup) y('הבראה');
      return '<span class="r6chk">נבדק: '+c.join(' ')+'</span>'; }
    function daysHtml(e){ var s=e.slip; if(!s) return '';
      var L=(s.lines||[]).filter(function(l){ return l[1]==='pidyon'||l[1]==='sick'||/פדיון|תמורת חופשה|מחלה|חופשה/.test(String(l[0]||'')); }).filter(function(l){ return Math.abs(+l[4]||0)>0.5; });
      if(!L.length) return '';
      var hr=+s.rate||0, rows='';
      L.forEach(function(l){ var q=+l[2]||0, r=+l[3]||0, a=+l[4]||0, isS=l[1]==='sick'||/מחלה/.test(l[0]);
        var per=q&&r?r:(q?a/q:0), pm=String(l[0]).match(/(\d+)%/), pf=pm?(+pm[1]/100):1, hpd=hr&&per?per/pf/hr:0;
        rows+='<div class="r6dl"><b>'+esc(l[0])+'</b><span>'+(q?F1(q)+(isS?' ימים':' ימים')+' × '+F0(per)+' ₪ ליום':'')+' = <b>'+F0(a)+' ₪</b></span>'
          +(hpd?'<small>'+F0(per)+' ₪ ליום = '+(pf!==1?Math.round(pf*100)+'% × '+F0(per/pf)+' ₪ (':'')+F1(hpd)+' שעות × '+F1(hr)+' ₪ לשעה'+(pf!==1?')':'')+'</small>':'')+'</div>'; });
      var bal=[], B=null; try{ B=(JSON.parse(localStorage.getItem('pay-bal-v1')||'{}')[DATA.month||'']||{})[e.slipname]||null; }catch(_){}
      var bl=function(lbl,x,fb){ if(x&&x[2]!=null) return lbl+': יתרה לפני <b>'+F1(+x[0]||0)+'</b> · נוצלו/נפדו <b>'+F1(+x[1]||0)+'</b> · נשארו <b>'+F1(+x[2]||0)+'</b> ימים'; return fb!=null?lbl+' — נשארו <b>'+F1(+fb||0)+'</b> ימים':''; };
      if(L.some(function(l){ return l[1]==='pidyon'||/חופש/.test(l[0]); })) bal.push(bl('חופשה',B&&B.v,s.vacBal));
      if(L.some(function(l){ return l[1]==='sick'||/מחלה/.test(l[0]); })){ bal.push(bl('מחלה',B&&B.s,s.sickBal));
        var pd=L.filter(function(l){ return l[1]==='sick'||/מחלה/.test(l[0]); }).reduce(function(t,l){ return t+(+l[2]||0); },0);
        if(B&&B.s){ var dd=(+B.s[1]||0)-pd;
          if(Math.abs(dd-1)<0.01) bal.push('שולמו '+F1(pd)+' ימים + יום ראשון ללא תשלום (לפי החוק) = ירדו '+F1(+B.s[1]||0)+' מהיתרה');
          else if(Math.abs(dd)>0.01) bal.push('<span class="r6bad">שולמו '+F1(pd)+' ימי מחלה, אבל ירדו מהיתרה '+F1(+B.s[1]||0)+'</span>'); } }
      bal=bal.filter(Boolean);
      return '<div class="r6days"><h4>🏖 פדיון חופשה / מחלה — פירוט</h4>'+rows+(bal.length?'<div class="r6db">'+bal.join(' · ')+'</div>':'')+'</div>'; }
    /* הערות שסימנת שטופלו — מוסתרות; לחיצה פותחת, ובריחוף על כל אחת — כל ההשתלשלות (איילת 3.11) */
    function doneGrp(D){ return '<details class="r6donegrp"><summary>✓ '+D.length+(D.length>1?' הערות שסימנת שטופלו':' הערה שסימנת שטופלה')+' — לחיצה להצגה</summary>'+D.join('')+'</details>'; }
    function handled(e,n){ return !!n.done||nstOf(e.name,n.t)==='done'; }
    function isMe(n){ return !!n.me||n.for_acc===false||/לא\s+בתלוש/.test(String(n.t||''))||nstOf(n.emp,n.t)==='me'; }
    function isFirst(n){ return /^o\d/.test(String(n.id||''))||/דף הבית|הערות שכר לחשבת/.test(String(n.src||'')); }
    function afterNotes(e){
      var R=[], mine=noteGet(e.name);
      empNotesFull(e).filter(function(n){ return !isFirst(n)&&!isMe(n); }).forEach(function(n){ R.push({t:n.t,done:!!n.done||noteStatus(e,n).ok===true}); });
      /* ההערה בבקרה שנבנתה מאותן הערות שכר — לא להציג פעמיים */
      if(mine&&!empNotesFull(e).some(function(n){ var t=String(n.t||'').replace(/\s+/g,' ').trim().slice(0,30); return t&&String(mine).replace(/\s+/g,' ').indexOf(t)>=0; }))
        R.push({t:mine,done:!!noteDoneOf(e.name),mine:true});
      R.forEach(function(n){ if(nstOf(e.name,n.t)==='done') n.done=true; });
      R=R.filter(function(n){ return nstOf(e.name,n.t)!=='me'; });
      return R;
    }
    function notesLines(e){
      var s=e.slip, A=[], B=[], D=[];
      var M=empNotesFull(e).filter(isMe).map(function(n){ return '<div class="r6n"><span class="r6st me">🔒 לעצמי — לא בתלוש</span><span class="r6t">'+esc(noteTxt(n.t))+'</span>'+nstBtns(e.name,n)
        +'<div class="r6hist"><div><b>הערה בשבילך — לא לחשבת, ולא אמורה להופיע בתלוש</b></div></div></div>'; });
      var mine=noteGet(e.name); if(mine&&nstOf(e.name,mine)==='me') M.push('<div class="r6n"><span class="r6st me">🔒 לעצמי</span><span class="r6t">'+esc(noteTxt(mine))+'</span>'+nstBtns(e.name,{t:mine})+'</div>');
      empNotesFull(e).filter(function(n){ return isFirst(n)&&!isMe(n); }).forEach(function(n){ var st=noteStatus(e,n), tag, now;
        if(!s){ tag='<span class="r6st miss">✗ לא בוצע — אין תלוש</span>'; now='אין תלוש, אז ההערה לא בוצעה. מחכים לתלוש'; }
        else if(st.ok===true){ tag='<span class="r6st done">✓ בוצע בתלוש</span>'; now='בתלוש: '+String(st.t).replace(/^✓\s*(טופל\s*—\s*)?/,''); }
        else if(st.ok===false){ tag='<span class="r6st miss">❗ לא בוצע בתלוש</span>'; now=String(st.t).replace(/^✗\s*/,'')+' — לבקש תיקון'; }
        else { tag='<span class="r6st info">ℹ אין במה לבדוק בתלוש</span>'; now='זה מידע לחשבת (למשל פרטי עובד חדש) — אין שורה בתלוש שמראה שבוצע'; }
        if(st.t==='✓ סימנת שטופל'){ tag='<span class="r6st done">✓ סימנת שטופל</span>'; now='סימנת בעצמך שההערה טופלה'; }
        (handled(e,n)?D:A).push('<div class="r6n">'+tag+'<span class="r6t">'+esc(noteTxt(n.t))+'</span>'+nstBtns(e.name,n)+'<div class="r6hist">'
          +'<div>1️⃣ נשלח לחשבת עם הערות השכר'+(n.topic?' · '+esc(n.topic):'')+'</div>'
          +'<div>2️⃣ '+(s?'התלוש הגיע':'התלוש עוד לא הגיע')+'</div><div>3️⃣ <b>'+esc(now)+'</b></div></div></div>');
      });
      afterNotes(e).forEach(function(n){
        (n.done?D:B).push('<div class="r6n">'+(n.done?'<span class="r6st done">✓ החשבת טיפלה</span>':'<span class="r6st wait">⏳ מחכים לתשובה או לתלוש מתוקן</span>')
          +'<span class="r6t">'+esc(noteTxt(n.t))+'</span>'+(n.mine?'<button class="r6btn lite sm" data-note="'+EMO(e.name)+'">✏️</button>':'')+nstBtns(e.name,n)
          +'<div class="r6hist"><div>1️⃣ '+(s?'התלוש הגיע':'התלוש לא הגיע')+'</div><div>2️⃣ כתבת לחשבת אחרי זה (בבקרה)</div><div>3️⃣ <b>'+(n.done?'סומן שהחשבת טיפלה':'עוד לא — מחכים שהחשבת תענה או תשלח תלוש מתוקן')+'</b></div></div></div>');
      });
      flagsOf(e).filter(function(x){ return x.f.done; }).forEach(function(x){
        D.push('<div class="r6n"><span class="r6st done">✓ סימנת שטופל</span><span class="r6t">'+esc((x.f.by||'רועי')+': '+noteTxt(x.f.t))+'</span><div class="r6hist"><div>1️⃣ '+esc(x.f.by||'רועי')+' כתב אחרי התלוש'+(x.f.at?' ('+esc(x.f.at)+')':'')+'</div><div>2️⃣ <b>סימנת «טופל / לא רלוונטי»'+(x.f.done&&x.f.done!==true?' ('+esc(x.f.done)+')':'')+'</b></div></div></div>'); });
      aqOf(e.name).filter(function(q){ return q.a; }).forEach(function(q){
        B.push('<div class="r6n"><span class="r6st done">💬 ענית לחשבת</span><span class="r6t">'+esc(noteTxt(q.a))+'</span><div class="r6hist"><div>1️⃣ החשבת שאלה'+(q.at?' ('+esc(q.at)+')':'')+': «'+esc(q.q)+'»</div><div>2️⃣ <b>ענית'+(q.aat?' ('+esc(q.aat)+')':'')+': «'+esc(q.a)+'»</b></div></div></div>'); });
      var h='';
      if(A.length) h+='<div class="r6grp">📤 נשלח עם הערות השכר — לפני התלוש</div>'+A.join('');
      if(B.length) h+='<div class="r6grp">✍️ אחרי התלוש — מה שביקשת מהחשבת</div>'+B.join('');
      if(M.length) h+='<div class="r6grp">🔒 לעצמך — לא לחשבת</div>'+M.join('');
      if(D.length) h+=doneGrp(D);
      return h?'<div class="r6notes">'+h+'</div>':'';
    }
    /* בטלפון אין ריחוף — לחיצה על הערה פותחת/סוגרת את ההיסטוריה שלה (בלי לפתוח את הכרטיס) */
    document.addEventListener('click',function(ev){ var n=ev.target.closest&&ev.target.closest('.r6n'); if(!n||ev.target.closest('button')) return; ev.stopPropagation(); n.classList.toggle('show'); },true);
    window.rowHtml=function(e,a){
      try{
        var id=e.name, open=OPEN===id;
        var gapBad=a.diff!=null&&Math.abs(a.diff)>35&&!redOK(e,a);
        var diffTxt=a.diff==null?"—":(Math.abs(a.diff)<=35||redOK(e,a)?"✓ ":(a.diff>0?"▲ ":"▼ "))+(a.diff>0?"+":"")+F0(a.diff);
        var calc=(a.worked||e.glob)?F0(a.exp):"—", slip=a.tg==null?"—":F0(a.tg);
        var hours=e.hours?F1(e.hours):(e.basis==="manager"?"נטו יומי":"—");
        var note=noteGet(e.name), ndone=noteDoneOf(e.name);
        var noteEl=note
          ?'<span class="notechip '+(ndone?'done':'')+'" title="'+esc(note)+'">'+(ndone?'✅':'📝')+' '+esc(note.length>60?note.slice(0,60)+"…":note)+'</span><button class="notebtn has" data-note="'+encodeURIComponent(e.name)+'">ערוך</button>'
          :'<button class="notebtn" data-note="'+encodeURIComponent(e.name)+'">📝 הערה</button>';
        var sev=a.st.sev==='good'?'good':a.st.sev==='warn'?'warn':a.st.sev==='crit'?'crit':'none';
        var issHtml=open?attnHtml(e,true):todoHtml(e,a)+notesLines(e);
        var rv=rvBtns(e);
        if(open){ /* כרטיס פתוח (איילת 3.11): «מה לא בסדר» + הערות מתחת להערה של רועי, וכל הכפתורים בשורה אחת בלי כפילויות */
          var F=flagsOf(e).filter(function(x){ return !x.f.done; });
          var sug=F.length?e.name+' — '+F.map(function(x){ return x.f.t; }).join(' · '):(typeof gapSuggestion==='function'?gapSuggestion(e,a):'');
          var extra='<button class="rvbtn r6wr" data-addnote="'+EMO(e.name)+'" data-suggest="'+EMO(sug)+'">✍️ לכתוב לחשבת</button>'
            +(F.length?'<button class="rvbtn" onclick="event.stopPropagation();'+F.map(function(x){ return '__r6flagDone('+x.i+')'; }).join(';')+'">✓ '+esc(F[0].f.by||'רועי')+' — טופל / לא רלוונטי</button>':'');
          try{ var okk=(a.st.k==='ok'||a.st.sev==='good')&&laneOf(e)!=='pay';
            if(okk&&!empNotesFull(e).length) issHtml+='<div class="r6todo ok big">✓ <span>'+okText(e,a)+'</span></div>';
            else issHtml+='<div class="r6ex'+(okk?' ok':'')+'">'+(okk?'<div class="r6todo ok big">✓ <span>'+okText(e,a)+'</span></div>':'')+explainHtml(e,a)+'</div>'; }catch(_){}
          rv=rv.replace('<div class="rvrow">','<div class="rvrow">'+extra); }
        return '<div class="row r6 sev-'+a.st.sev+' lane-'+laneOf(e)+'" data-id="'+encodeURIComponent(id)+'">'
          +'<div class="r6h">'
          +  '<span class="nm">'+e.name+(e.glob?' <span class="chip info">גלובלי</span>':"")+rvTag(e)+'</span>'
          +  '<span class="r6sub"><b>'+(e.dept||(e.glob?"גלובלי":"—"))+'</b> · '+(e.net?"נטו":"ברוטו")+(e.slipname&&e.slipname!==e.name?" · "+e.slipname:"")+'</span>'
          +  '<span class="r6chips">'
          +    '<span class="r6c"><i>שעות</i>'+hours+'</span>'
          +    '<span class="r6c"><i>מחושב</i><b>'+calc+'</b></span>'
          +    '<span class="r6c"><i>תלוש</i>'+slip+'</span>'
          +    '<span class="r6c '+(gapBad?'gap':'')+'"><i>פער</i><b>'+diffTxt+'</b></span>'
          +    '<span class="pill '+sev+'"><span class="pdot"></span>'+a.st.label+'</span>'
          +  '</span>'
          +'</div>'
          +issHtml
          +rv
          +(open?detailHtml(e,a):"")
          +'</div>';
      }catch(err){ return old(e,a); }   /* תקלה בתצוגה החדשה — חוזרים לשורה הרגילה */
    };
    /* כרטיס פתוח «דוגמה 1» (איילת 3.11): שני טורים — הטבלה בטור אחד; מה לא בסדר, הערות, מס ופנסיה בשני (העימוד ב-CSS).
       הערות שכר עם מצב ברור: ⏳ מחכה לחשבת · ✓ בוצע בתלוש · ❗ לא בוצע. */
    if(typeof notesHtml==="function"&&typeof noteStatus==="function"&&typeof empNotesFull==="function"){
      var oldNotes=notesHtml;
      window.notesHtml=function(e){
        try{
          var A=empNotesFull(e); if(!A.length) return '<div class="exl exm">אין הערות שכר לעובד/ת זה החודש.</div>';
          var DN=[];
          var out=A.map(function(n){ var st=noteStatus(e,n), B=nstBtns(e.name,n), tp=n.topic?' <span class="exm">('+esc(n.topic)+')</span>':'';
            /* שתי שורות: מצב + ההערה, ומתחת ההסבר והכפתורים (בלי טורים צרים) */
            var CN=function(tag,why){ return '<div class="exl r6cn"><div class="r6cl">'+tag+' <span class="r6t">«'+esc(n.t)+'»</span>'+tp+'</div>'
              +'<div class="r6cw">'+(why?'<span class="r6why">'+esc(why)+'</span>':'<span></span>')+B+'</div></div>'; };
            if(isMe(n)) return CN('<span class="r6st me">🔒 לעצמי — לא בתלוש</span>','הערה בשבילך — לא לחשבת, ולא אמורה להופיע בתלוש');
            if(handled(e,n)){ DN.push(CN('<span class="r6st done">✓ סימנת שטופל</span>',isFirst(n)?'נשלח לחשבת עם הערות השכר → התלוש הגיע → סימנת שטופל':'נכתב אחרי התלוש → סימנת שטופל')); return ''; }
            if(!isFirst(n)){ var dn=!!n.done||st.ok===true;
              return CN(dn?'<span class="r6st done">✓ החשבת טיפלה</span>':'<span class="r6st wait">⏳ ביקשת אחרי התלוש</span>',dn?'סומן שהחשבת טיפלה':'כתבת לחשבת אחרי שהתלוש הגיע — מחכים לתשובה או לתלוש מתוקן'); }
            if(!e.slip) return CN('<span class="r6st miss">✗ לא בוצע — אין תלוש</span>','');
            var tag=st.ok===true?'<span class="r6st done">✓ בוצע בתלוש</span>':st.ok===false?'<span class="r6st miss">❗ לא בוצע בתלוש</span>':'<span class="r6st info">ℹ אין במה לבדוק בתלוש</span>';
            var why=st.ok===true?String(st.t||'').replace(/^✓\s*(טופל\s*—\s*)?/,''):st.ok===false?(String(st.t||'').replace(/^✗\s*/,'')||'ביקשנו, והתלוש הגיע בלי זה — לבקש תיקון'):'נשלח לחשבת לפני התלוש — אין שורה בתלוש שמראה שבוצע';
            return CN(tag,why);
          }).join('');
          return (out||(DN.length?'':'<div class="exl exm">אין הערות פתוחות.</div>'))+(DN.length?doneGrp(DN):'');
        }catch(err){ return oldNotes(e); }
      };
    }
    if(typeof detailHtml==="function"){
      var oldDetail=detailHtml;
      window.detailHtml=function(e,a){
        var h=oldDetail(e,a);
        /* «מה לא בסדר» עבר למעלה (מתחת להערה של רועי); «הערה לחשבת שכר» הוסר — יש «✍️ לכתוב לחשבת» אחד בשורת הכפתורים */
        try{ var ex=explainHtml(e,a); if(ex) h=h.replace(ex,''); }catch(_){}
        var pi=h.indexOf('<div class="panel"><h4>הערה לחשבת שכר</h4>'), pj=h.lastIndexOf('\n    </div>\n  </div>'); if(pi>0&&pj>pi) h=h.slice(0,pi)+h.slice(pj);
        try{ h=h.replace('</div>\n    <div class="detrow">',slipLinesHtml(e.slip)+'</div>\n    <div class="detrow">'); }catch(_){}
        /* פדיון חופשה / מחלה — פירוט: ימים × תשלום ליום, והיתרה (איילת 3.11) */
        try{ var ds=daysHtml(e); if(ds) h=h.replace('<h4>מס ופנסיה</h4>',ds+'<h4>מס ופנסיה</h4>'); }catch(_){}
        var sl=e.slip; if(sl){
          /* הבראה וקרן השתלמות — החודש מול החודש הקודם (איילת 3.11) */
          var P=null; try{ P=(JSON.parse(localStorage.getItem('pay-prev-v1')||'{}')[DATA.month||'']||{})[e.slipname]||null; }catch(_){}
          var pv=function(v){ return P?F0(v||0)+' ₪':'—'; };
          var rows=kv('הבראה — החודש',F0(sl.recup||0)+' ₪')+kv('הבראה — '+(P&&P.m?P.m:'חודש קודם'),pv(P&&P.recup))
            +kv('קרן השתלמות (מעסיק) — החודש',F0(sl.empStudy||0)+' ₪')+kv('קרן השתלמות (מעסיק) — '+(P&&P.m?P.m:'חודש קודם'),pv(P&&P.empStudy))
            +((sl.study||(P&&P.study))?kv('שווי קרן השתלמות (מעל התקרה) — החודש / קודם',F0(sl.study||0)+' / '+pv(P&&P.study)):'');
          h=h.replace('<h4>מס ופנסיה</h4>','<h4>מס ופנסיה</h4>'+rows);
        }
        /* «הערה לחשבת שכר» — בלי לחזור על הערות שכבר מוצגות למעלה (איילת 3.11: «ההערות רשומות פעמיים») */
        try{ var NZ=function(t){ return String(t||'').replace(/<[^>]+>/g,'').replace(/&[a-z#0-9]+;/g,' ').replace(/[^֐-׿a-zA-Z0-9]+/g,' ').trim(); };
          var have=empNotesFull(e).map(function(n){ return NZ(n.t); });
          h=h.replace(/(<h4>הערה לחשבת שכר<\/h4>)<div class="kv"><span class="kk"[^>]*>([\s\S]*?)<\/span><\/div>([\s\S]*?)(<span class="r6st wait">⏳ מחכה לחשבת<\/span>|<span class="chip">⏳ טרם בוצע<\/span>)?(<\/div><\/div>)/,
            function(all,h4,txt,mid,chip,end){
              var parts=String(txt).split(/\s*\|\s*/).map(function(p){ return p.replace(/^[^:]{1,25}:\s*/,''); }).filter(function(p){ var z=NZ(p); return z&&!have.some(function(x){ return x&&(x.indexOf(z.slice(0,30))>=0||z.indexOf(x.slice(0,30))>=0); }); });
              if(parts.length) return all;
              return '<h4>הערה לחשבת שכר</h4><div class="exm">כל ההערות מופיעות למעלה, ב«הערות שכר החודש».</div>'+mid+end; });
        }catch(_){}
        return h.replace('<div class="detail">','<div class="detail r6d">')
          .replace('הערות שכר — טופלו?','הערות שכר החודש — מה המצב')
          .replace('<span class="chip">⏳ טרם בוצע</span>','<span class="r6st wait">⏳ מחכה לחשבת</span>')
          .replace('✅ בוצע</span>','✓ החשבת טיפלה</span>')
          .replace('<span class="rn">מחושב (שיפט)</span>','<span class="rn" title="כמה מגיע לפי השעות בשיפט">מגיע לפי השיפט</span>')
          .replace('<span class="rn">הפרש</span>','<span class="rn" title="+ חסר בתלוש · − עודף בתלוש">הפרש (+ חסר)</span>');
      };
    }
    /* 📄 צילום התלוש (איילת 3.11): התמונה נשמרת בענן עם ת"ז / בנק / כתובת מוסתרים (pay/tools/slip_images.py);
       המעטפת (pay/index.html) נותנת לחודש את window.__paySlipImg(שם בתלוש) שמחזירה {img,page} או null. */
    function slipFn(){ try{ return window.__paySlipImg||(window.parent!==window&&window.parent.__paySlipImg)||null; }catch(_){ return null; } }
    if(typeof rvBtns==="function"){
      var oldBtns=rvBtns;
      window.rvBtns=function(e){ var h=oldBtns(e);
        if(!e.slip||!e.slipname) return h;   /* הכפתור תמיד מוצג כשיש תלוש; אם המעטפת ישנה — הודעה לרענן */
        return h.replace(/<\/div>$/,'<button class="rvbtn" onclick="event.stopPropagation();__r6slip(decodeURIComponent(\''+EMO(e.slipname)+'\'),decodeURIComponent(\''+EMO(e.name)+'\'))">📄 צילום התלוש</button></div>'); };
    }
    window.__r6slip=function(slipname,name){
      var ov=document.createElement('div'); ov.className='r6slipov';
      ov.innerHTML='<div class="r6slipbox"><div class="r6sliphd"><b>📄 התלוש של '+esc(name)+'</b><span class="r6d">ת"ז, בנק וכתובת מוסתרים</span><button class="r6btn lite" data-z>🔍 הגדלה</button><button class="r6btn lite" data-x>✕ סגירה</button></div><div class="r6slipimg">טוען…</div></div>';
      document.body.appendChild(ov);
      var close=function(){ ov.remove(); document.removeEventListener('keydown',esc_); };
      var esc_=function(k){ if(k.key==='Escape') close(); };
      document.addEventListener('keydown',esc_);
      ov.addEventListener('click',function(ev){ if(ev.target===ov||ev.target.closest('[data-x]')) close(); if(ev.target.closest('[data-z]')) ov.classList.toggle('zoom'); });
      (slipFn()?Promise.resolve(slipFn()(slipname)):Promise.reject('no-shell')).then(function(r){
        var box=ov.querySelector('.r6slipimg');
        box.innerHTML=r&&r.img?'<img alt="תלוש" src="'+r.img+'">':'<div class="r6d" style="padding:30px">אין עדיין צילום לתלוש הזה בענן.</div>';
      },function(){ ov.querySelector('.r6slipimg').innerHTML='<div class="r6d" style="padding:30px">לא הצלחתי לטעון את הצילום — לרענן את הדף (Ctrl+Shift+R) ולנסות שוב.</div>'; });
    };
    /* מעקב מילואים (איילת 3.11: «זה לא מסנן לפי עובדים»): בחירת עובד ברשימה מסננת את הטבלה לעובד הזה;
       «✕ כל העובדים» מחזיר. הטבלה עצמה נבנית מחדש בקוד החודש — הסינון מוחל שוב אחרי כל בנייה. */
    (function(){
      var sel=document.getElementById('milEmp'), tbl=document.getElementById('milTbl'); if(!sel||!tbl) return;
      var clr=document.createElement('button'); clr.className='tbtn'; clr.id='milClr'; clr.hidden=true; clr.textContent='✕ כל העובדים';
      sel.insertAdjacentElement('afterend',clr);
      function norm(s){ return String(s||'').replace(/[^֐-׿a-zA-Z0-9 ]/g,' ').replace(/\s+/g,' ').trim(); }
      function apply(){
        var v=sel.selectedIndex>0?norm(sel.value||sel.options[sel.selectedIndex].text):''; clr.hidden=!v;
        var rows=[].slice.call(tbl.querySelectorAll('tr')), cur=null;
        rows.forEach(function(tr){
          if(tr.querySelector('th')){ tr.style.display=''; return; }
          var first=norm((tr.cells[0]||{}).textContent).replace(/\s*\d+\s*$/,'');   /* שורת קבוצה «• שם (3)» או שורת טופס */
          if(tr.cells.length===1||/^\s*•/.test((tr.cells[0]||{}).textContent||'')) cur=first;
          var who=tr.cells.length===1?cur:(first||cur);
          tr.style.display=!v||(who&&(who===v||who.indexOf(v)===0||v.indexOf(who)===0))?'':'none';
        });
      }
      sel.addEventListener('change',apply);
      clr.addEventListener('click',function(){ sel.selectedIndex=0; apply(); });
      new MutationObserver(function(){ if(sel.selectedIndex>0) apply(); }).observe(tbl,{childList:true,subtree:true});
    })();
    document.documentElement.classList.add("rows6");
    if(typeof render==="function"&&document.getElementById("list")&&document.getElementById("list").children.length) render();
  }catch(_){}
})();
