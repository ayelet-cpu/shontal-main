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
      if(lane==='pay') out='<div class="r6todo ok">✓ <span><b>אישרת</b>'+(iss.length?' — למרות: '+iss.slice(0,2).join(' · '):'')+'</span></div>';
      else if(!s&&a.worked){
        var msg=e.name+' — אין תלוש. עבד/ה '+F1(e.hours||0)+' שעות'+(e.days?' ב-'+e.days+' ימים':'')+' — לבדוק ולהוציא תלוש';
        out='<div class="r6todo bad">❗ <span><b>אין תלוש</b> — עבד/ה '+F1(e.hours||0)+' שעות'+(e.days?' ('+e.days+' ימים)':'')+'</span>'
          +'<span class="go"><button class="r6btn" data-addnote="'+nm+'" data-suggest="'+EMO(msg)+'">➕ לבקש תלוש מהחשבת</button>'
          +'<button class="r6btn lite" data-lane="pay" data-emp="'+nm+'">✓ ידוע לי, לא צריך</button></span></div>';
      }
      else if(!s) out='';
      else if(a.st.sev==='crit'||a.st.sev==='warn'){
        var head=a.diff!=null&&Math.abs(a.diff)>35&&!redOK(e,a)?(a.diff>0?'חסרים '+F0(a.diff)+' ₪ בתלוש':'עודף '+F0(-a.diff)+' ₪ בתלוש'):(a.st.sev==='crit'?'יש בעיה בתלוש':'לשים לב');
        var sug=(iss.length?e.name+' — '+iss.map(function(x){ return String(x).replace(/<[^>]+>/g,''); }).join('; '):gapSuggestion(e,a));
        out='<div class="r6todo '+(a.st.sev==='crit'?'bad':'wait')+'">❗ <span><b>'+head+'</b>'+(iss.length?' — '+iss.join(' · '):'')+'</span>'
          +'<span class="go"><button class="r6btn" data-addnote="'+nm+'" data-suggest="'+EMO(sug)+'">➕ להוסיף לחשבת</button>'
          +'<button class="r6btn lite" data-lane="pay" data-emp="'+nm+'">✓ ידוע לי</button></span></div>';
      }
      else if(a.st.k==='ok'||a.st.sev==='good') out='<div class="r6todo ok">✓ <span><b>תקין</b>'+(empNotesFull(e).some(function(n){ return noteStatus(e,n).ok===true; })?' — גם ההערות שלנו בוצעו בתלוש':'')+'</span></div>';
      openQ.forEach(function(x){
        out+='<div class="r6todo q">❓ <span><b>החשבת שאלה:</b> «'+esc(x.q.q)+'»'+(x.q.at?' <span class="r6d">('+esc(x.q.at)+')</span>':'')+'</span>'
          +'<span class="go"><button class="r6btn" onclick="event.stopPropagation();__r6answer(decodeURIComponent(\''+nm+'\'),'+x.i+')">✍️ לענות לחשבת</button>'
          +'<button class="r6btn lite" onclick="event.stopPropagation();__r6info(decodeURIComponent(\''+nm+'\'),'+x.i+')">✓ רק לידיעה</button></span></div>';
      });
      return out;
    }
    /* כל הערה בשורה קצרה עם המצב העדכני; מה קרה איתה — רק בריחוף (בטלפון: בלחיצה) */
    function notesLines(e){
      var L=[], s=e.slip;
      empNotesFull(e).forEach(function(n){ var st=noteStatus(e,n);
        var tag=st.ok===true?'<span class="r6st done">✓ בוצע בתלוש</span>':st.ok===false?'<span class="r6st miss">❗ לא בוצע</span>':'<span class="r6st wait">⏳ נשלח לחשבת</span>';
        var h='<div>📝 נכתב בהערות השכר'+(n.topic?' · '+esc(n.topic):'')+(n.me?' · <b>לעצמי — לא נשלח לחשבת</b>':' · נשלח לחשבת')+'</div>'
          +(n.src?'<div class="r6d">מקור: '+esc(n.src)+'</div>':'')
          +'<div>'+(!s?'⏳ אין תלוש — אי אפשר לבדוק אם בוצע':st.ok===true?'✓ בתלוש: '+esc(String(st.t).replace(/^✓\s*/,'')):st.ok===false?'❗ בתלוש: '+esc(String(st.t).replace(/^✗\s*/,''))+' — לבקש תיקון':'⏳ אין במה לבדוק את זה בתלוש — מחכים שהחשבת תאשר')+'</div>';
        if(n.me) tag='<span class="r6st me">🔒 לעצמי</span>';
        L.push('<div class="r6n">'+tag+'<span class="r6t">'+esc(noteTxt(n.t))+'</span><div class="r6hist">'+h+'</div></div>');
      });
      var mine=noteGet(e.name);
      /* ההערה בבקרה שנבנתה מאותן הערות שכר — לא להציג פעמיים */
      if(mine&&empNotesFull(e).some(function(n){ var t=String(n.t||'').replace(/\s+/g,' ').trim().slice(0,30); return t&&String(mine).replace(/\s+/g,' ').indexOf(t)>=0; })) mine='';
      if(mine){ var dn=noteDoneOf(e.name);
        L.push('<div class="r6n">'+(dn?'<span class="r6st done">✓ החשבת טיפלה</span>':'<span class="r6st wait">⏳ ההערה שלך לחשבת</span>')+'<span class="r6t">'+esc(noteTxt(mine))+'</span>'
          +'<button class="r6btn lite sm" data-note="'+EMO(e.name)+'">✏️</button><div class="r6hist"><div>📝 ההערה שכתבת בבקרה לחשבת השכר</div><div>'+(dn?'✓ סומן «בוצע»':'⏳ עוד לא סומן «בוצע»')+'</div></div></div>'); }
      aqOf(e.name).filter(function(q){ return q.a; }).forEach(function(q){
        L.push('<div class="r6n"><span class="r6st done">💬 ענית לחשבת</span><span class="r6t">'+esc(noteTxt(q.a))+'</span><div class="r6hist"><div>❓ החשבת שאלה'+(q.at?' ('+esc(q.at)+')':'')+': «'+esc(q.q)+'»</div><div>💬 ענית'+(q.aat?' ('+esc(q.aat)+')':'')+': «'+esc(q.a)+'»</div></div></div>'); });
      return L.length?'<div class="r6notes">'+L.join('')+'</div>':'';
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
        var issHtml=open?'':todoHtml(e,a)+notesLines(e);
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
          +rvBtns(e)
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
          return A.map(function(n){ var st=noteStatus(e,n);
            var tag=st.ok===true?'<span class="r6st done">✓ בוצע בתלוש</span>':st.ok===false?'<span class="r6st miss">❗ לא בוצע בתלוש</span>':'<span class="r6st wait">⏳ מחכה לחשבת</span>';
            var why=st.ok===true?'':st.ok===false?(st.t||'ביקשנו, והתלוש הגיע בלי זה — לבקש תיקון'):'אין במה לבדוק את זה בתלוש — מחכים שהחשבת תאשר שטיפלה';
            return '<div class="exl r6n">'+tag+' «'+esc(n.t)+'»'+(n.topic?' <span class="exm">('+esc(n.topic)+(n.me?' · לעצמי':'')+')</span>':'')+(why?'<div class="r6why">'+esc(why)+'</div>':'')+'</div>';
          }).join('');
        }catch(err){ return oldNotes(e); }
      };
    }
    if(typeof detailHtml==="function"){
      var oldDetail=detailHtml;
      window.detailHtml=function(e,a){
        var h=oldDetail(e,a);
        return h.replace('<div class="detail">','<div class="detail r6d">')
          .replace('הערות שכר — טופלו?','הערות שכר החודש — מה המצב')
          .replace('<span class="chip">⏳ טרם בוצע</span>','<span class="r6st wait">⏳ מחכה לחשבת</span>')
          .replace('✅ בוצע</span>','✓ החשבת טיפלה</span>')
          .replace('<span class="rn">מחושב (שיפט)</span>','<span class="rn" title="כמה מגיע לפי השעות בשיפט">מגיע לפי השיפט</span>')
          .replace('<span class="rn">הפרש</span>','<span class="rn" title="+ חסר בתלוש · − עודף בתלוש">הפרש (+ חסר)</span>');
      };
    }
    document.documentElement.classList.add("rows6");
    if(typeof render==="function"&&document.getElementById("list")&&document.getElementById("list").children.length) render();
  }catch(_){}
})();
