/* שורת עובד «דוגמה 6» (איילת 3.11.2026): שורת כותרת עם תוויות (שעות · מחושב · תלוש · פער · סטטוס),
   מתחת «מה לא בסדר» בשני טורים, ואז הכפתורים. כתב גדול יותר ופחות רווחים — אותו מידע בדיוק.
   מוזרק ע"י pay/index.html לסוף כל חודש; מחליף רק את rowHtml (התצוגה), לא נוגע בחישובים ובנתונים.
   חל רק על בקרות שבהן rowHtml במבנה המוכר (פאסטל, אריאלה וטופול); בכל השאר — לא משנה כלום. */
(function(){
  try{
    if(typeof rowHtml!=="function"||!/c-name/.test(String(rowHtml))||typeof issuesOf!=="function"||typeof rvBtns!=="function") return;
    var old=rowHtml;
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
        var iss=open?[]:issuesOf(e,a);
        var issHtml=iss.length?'<ul class="r6iss">'+iss.map(function(x){ return '<li class="'+((/^ℹ/.test(x)&&!/<b>/.test(x))?'info':'')+'">'+x+'</li>'; }).join("")+'</ul>':"";
        return '<div class="row r6 sev-'+a.st.sev+' lane-'+laneOf(e)+'" data-id="'+encodeURIComponent(id)+'">'
          +'<div class="r6h">'
          +  '<span class="nm">'+e.name+(e.glob?' <span class="chip info">גלובלי</span>':"")+rvTag(e)+'</span>'
          +  '<span class="r6sub"><b>'+(e.dept||(e.glob?"גלובלי":"—"))+'</b> · '+(e.net?"נטו":"ברוטו")+(e.slipname&&e.slipname!==e.name?" · "+e.slipname:"")+'</span>'
          +  '<span class="r6note">'+noteEl+'</span>'
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
