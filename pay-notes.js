/* מסך «הערות שכר» החדש (איילת 3.11.2026 — «תשנה אותו לגמרי»): מסך מלא במקום החלון, שלושה שלבים, כרטיסי סיכום,
   סינון, חלונית צד להערה (עם היסטוריה וחודשים קודמים), ומסך «הכנת משלוח לחשבת שכר» (Excel · תמונה לוואטסאפ · PDF).
   עובד על אותם נתונים בדיוק (NOTES2 של החודש → syncNotesFrom2 → pay_kv). לא מוחק ולא משנה לוגיקה עסקית;
   שדות חדשים בהערה (לא חובה): st (wip) · sentAt · doneAt · type · amt · log[] · roy.
   «טופלה» רק כשאיילת מסמנת — מה שבתלוש מוצג כמידע בלבד. החלון הישן נשאר בתפריט «⋯». */
/* 5.11.2026 איילת: «את בקרת השכר של אסא לא תיקנת כמו השאר» — אסא ופינצוס (קוד אחר: CHK / notes2Save / openQList / qlOverlay) מקבלים את אותו מסך הערות */
(function(){ try{
  if(typeof NOTES2==='undefined'||typeof syncNotesFrom2==='function'||typeof notes2Save!=='function'||typeof openQList!=='function'||!document.getElementById('qlOverlay')||typeof CHK==='undefined') return;
  window.syncNotesFrom2=function(){ notes2Save(); try{ renderChips(); }catch(_){} try{ renderCheck(); }catch(_){} try{ updateQBtn(); }catch(_){} };
  var OLDQ=openQList; window.openNotes=function(){ OLDQ(); };
  if(!document.getElementById('notesOverlay')){ var ov=document.createElement('div'); ov.id='notesOverlay'; ov.hidden=true; ov.style.display='none'; document.body.appendChild(ov); }
  if(typeof DATA!=='undefined'&&DATA){ if(!DATA.month) DATA.month=CHK.month; if(!DATA.employees) DATA.employees=(CHK.rows||[]).map(function(o){ return {name:o.name,dept:o.dept||'',slip:o.s||null}; }); if(DATA.prepay==null) DATA.prepay=!!CHK.prepay; }
  window.__nxAsa=true;
 }catch(_){} })();
(function(){
  if(typeof NOTES2==='undefined'||typeof syncNotesFrom2!=='function'||typeof openNotes!=='function'||!document.getElementById('notesOverlay')) return;
  var OLD_OPEN=openNotes;
  var E=function(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var F0=function(n){ return Math.round(+n||0).toLocaleString('he-IL'); };
  var today=function(){ var d=new Date(); return d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear(); };
  var nowS=function(){ var d=new Date(); return today()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  var REST=function(){ var r=(typeof R2REST!=='undefined'&&R2REST)||DATA.restaurant||''; try{ if(typeof CAFE_LABEL!=='undefined'&&CAFE_LABEL[r]) return CAFE_LABEL[r]; }catch(_){} return r; };
  var MON=function(){ return DATA.month||''; };
  var EMPS=function(){ return DATA.employees||[]; };
  var deptOf=function(n){ var e=EMPS().find(function(x){ return x.name===n; }); return e?(e.dept||''):''; };
  var empOf=function(n){ return EMPS().find(function(x){ return x.name===n; }); };

  /* ---------- סוג, סכום, מצב ---------- */
  var TYPES=['תוספת','ניכוי','שעות','שינוי שכר','מחלה','מילואים','חופשה','פנסיה וקרנות','מס ומסמכים','עובד חדש','גמר חשבון','כללי'];
  function autoType(n){ var t=String(n.t||''), tp=String(n.topic||'');
    if(/גמר חשבון|סיים לעבוד|עזב/.test(t+tp)) return 'גמר חשבון';
    if(/מילואים/.test(t+tp)) return 'מילואים';
    if(/מחלה/.test(t)) return 'מחלה';
    if(/להוריד|ניכוי|לנכות|לקזז|קיזוז|הלוואה|מקדמה/.test(t)) return 'ניכוי';
    if(/פנסיה|קרן השתלמות|קה"ש|גמל/.test(t)) return 'פנסיה וקרנות';
    if(/101|תיאום מס|תאום מס|מס קבוע|נקודות זיכוי|הטבות מס|אישור ניהול|מסמך/.test(t)||/מסמכים/.test(tp)) return 'מס ומסמכים';
    if(/חופש|פדיון/.test(t+tp)) return 'חופשה';
    if(/עובד(ת)? חדש|עובדים חדשים|התחיל|התחילה/.test(t+tp)) return 'עובד חדש';
    if(/תוספת|בונוס|השלמה|מענק/.test(t)||/בונוס|השלמת מסעדה/.test(tp)) return 'תוספת';
    if(/שעות|משמרות/.test(t)) return 'שעות';
    if(/תעריף|לשעה|שכר|תלוש חדש|נטו|ברוטו|גלובלי/.test(t)||/עדכוני שכר/.test(tp)) return 'שינוי שכר';
    return 'כללי'; }
  function typeOf(n){ return n.type||autoType(n); }
  function autoAmt(t){ t=String(t||'');
    var re=/(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(\s*%)?/g, m;
    while((m=re.exec(t))){ if(m[2]) continue; var pre=t.slice(Math.max(0,m.index-1),m.index), post=t.charAt(m.index+m[0].length);
      if(/[.\/–-]/.test(post)&&/\d/.test(t.charAt(m.index+m[0].length+1))) continue;   /* תאריך 14.10 */
      if(/[.\/]/.test(pre)) continue;
      var v=+m[1].replace(/,/g,''); if(v>=100&&!(v>=1900&&v<=2100&&!/,/.test(m[1]))) return v; }
    return ''; }
  function amtOf(n){ return n.amt!=null&&n.amt!==''?+n.amt:autoAmt(n.t); }
  /* הערה של «לפני התלושים» בחודש שהתלושים שלו כבר הגיעו — כבר נשלחה עם הערות השכר (גם בלי תאריך) */
  function stOf(n){ if(n.done) return 'done'; if(!n.me&&(n.r||1)===3) return qa(n).a?'sent':'new'; if(n.sentAt) return 'sent'; if(n.st==='wip') return 'wip'; if(!n.me&&(n.r||1)===1&&!DATA.prepay&&n.st!=='new') return 'sent'; return 'new'; }
  var ST={ 'new':['חדשה','s-new'], wip:['בטיפול','s-wip'], sent:['נשלחה · ממתינה','s-sent'], done:['טופלה','s-done'] };
  /* 5.11.2026 איילת: «לא ברור מה הערת שכר ראשונה, מה שאלות החשבת, מה התשובות שלנו, מה אחרי קבלת התלושים» —
     ארבעה שלבים לפי סדר החודש. r: 1 = הערות שכר שלנו (לפני התלושים) · 3 = בירור של החשבת + התשובה שלנו (ans) באותה שורה ·
     2 = תיקונים אחרי התלושים · me = לעצמי. */
  function stageOf(n){ return n.me?'me':((n.r||1)===2?'after':(n.r||1)===3?'q':'before'); }
  var STAGES=[['before','① הערות השכר שלנו','לפני התלושים'],['q','② בירורי החשבת','שאלה ותשובה'],['after','③ אחרי התלושים','מה לתקן בתלוש'],['me','④ לעצמי','לא נשלחות']];
  var STAGE_R={before:1,q:3,after:2};
  /* שאלה + תשובה: התשובה בשדה ans; בהערה שהגיעה מהבנייה («…\n↩ תשובתנו: …») — מפוצלת בתצוגה */
  function qa(n){ var t=String(n.t||''), a=n.ans; if(a==null){ var m=t.match(/^([\s\S]*?)\s*↩\s*תשובתנו:\s*([\s\S]*)$/); if(m){ t=m[1]; a=m[2]; } } return {q:t.trim(),a:String(a||'').trim()}; }
  function lineText(n){ if(stageOf(n)!=='q') return n.t; var x=qa(n); return '❓ '+x.q+' ← ↩ '+(x.a||'(עוד אין תשובה)'); }
  var RORD={1:1,3:2,2:3};
  /* מי כתב את ההערה — כדי שלא תהיה הערה «שנכנסה לבד» בלי לדעת מאיפה */
  function authorOf(n){ var L=n.log||[], f=String((L[0]&&L[0].w)||''), src=String(n.src||'')+' '+String(n.by||'');
    var id=String(n.id||'');   /* הערות שהגיעו מהבנייה (המקור לא נשמר בהערה) — לפי המזהה */
    if(/^chk-/.test(id)) return ['🤖 קלוד — בדיקת תלושים','a-cl']; if(/^qa-/.test(id)) return ['החשבת שאלה · איילת ענתה','a-acc'];
    if(/^pk-/.test(id)) return ['מהפנקס','a-ot']; if(/^a5-/.test(id)) return ['איילת','a-me'];
    if(/קלוד|claude/i.test(src)||/מהצעה של קלוד/.test(f)) return ['🤖 קלוד','a-cl'];
    if(/מהטיוטה בכרטיס/.test(f)) return ['טיוטה מהבקרה','a-dr'];
    if(/טלי/.test(src)) return ['טלי','a-ot']; if(/יובל/.test(src)) return ['יובל','a-ot']; if(/רועי|כתב אחרי התלושים/.test(src)||n.royT) return ['רועי','a-ot'];
    if(/דורין/.test(src)) return ['דורין','a-ot']; if(/החשבת|קונפורטי/.test(src)) return ['החשבת','a-acc'];
    if(/פנקס|ייבוא/.test(src)) return ['מהפנקס','a-ot'];
    if(/איילת/.test(src)||L.length) return ['איילת','a-me'];
    return ['לא ידוע','a-un']; }
  function slipInfo(n){ try{ if(n.me||!n.emp) return ''; var e=empOf(n.emp); if(!e) return ''; if(!e.slip) return 'אין תלוש לעובד/ת';
      var s=noteSt(n); var t=String(s&&s.t||'').replace(/^[✓✔✗—ℹ]\s*(טופל\s*—\s*)?/,'').replace(/^בתלוש:\s*/,'').replace(/\s*בתלוש\s*$/,'');
      if(/לא ניתן לבדוק|אין תלוש לבדוק|^מחוץ לתלוש/.test(t)) return '';
      return t?(s.ok===false?'❗ ':'')+'בתלוש: '+t:''; }catch(_){ return ''; } }
  function addLog(n,w){ n.log=n.log||[]; n.log.push({at:nowS(),w:w}); }
  function save(){ syncNotesFrom2(); try{ if(typeof render==='function') render(); }catch(_){} try{ if(typeof notesCountUpd==='function') notesCountUpd(); }catch(_){} }

  /* ---------- הערות של רועי (pay-flags-v1) — מוצגות בשלב «אחרי התלושים» ---------- */
  function flagsAll(){ try{ return JSON.parse(localStorage.getItem('pay-flags-v1')||'{}')||{}; }catch(_){ return {}; } }
  function flagsOpen(){ var L=flagsAll()[MON()]||[], r=(typeof R2REST!=='undefined'&&R2REST)||DATA.restaurant||'';
    return L.map(function(f,i){ return {f:f,i:i}; }).filter(function(x){ return !x.f.done&&(!x.f.rest||!r||x.f.rest===r); }); }
  function flagDone(i,how){ var A=flagsAll(), L=A[MON()]||[]; if(!L[i]) return; L[i].done=today()+(how?' · '+how:''); try{ localStorage.setItem('pay-flags-v1',JSON.stringify(A)); }catch(_){} }
  function flagEmp(f){ var a=String(f.emp||'').trim(); var e=EMPS().find(function(x){ return x.name===a||x.name.indexOf(a+' ')===0||(x.slipname&&a.indexOf(' ')>0&&String(x.slipname).indexOf(a)>=0); }); return e?e.name:a; }

  /* ---------- חודשים קודמים של אותו עובד ---------- */
  function prefix(){ return notes2Key().replace(/\d+$/,''); }
  function prevNotes(emp){ var out=[], cur=notes2Key(), P=prefix();
    try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(!k||k===cur||k.indexOf(P)!==0||!/\d{6}$/.test(k)) continue;
      var L=[]; try{ L=JSON.parse(localStorage.getItem(k)||'[]')||[]; }catch(_){}
      var m=k.slice(-6); m=m.slice(0,2)+'/'+m.slice(2);
      L.forEach(function(n){ if(n&&n.emp===emp&&String(n.t||'').trim()) out.push({m:m,n:n}); }); } }catch(_){}
    return out.sort(function(a,b){ return b.m.slice(3)+b.m.slice(0,2)>a.m.slice(3)+a.m.slice(0,2)?1:-1; }); }

  /* ---------- מצב המסך ---------- */
  var V={tab:(DATA.prepay?'before':'after'), q:'', dept:'', type:'', st:'', open:false, amt:false, roy:false, sel:{}, edit:null, view:'list', ssel:null, fmine:{}};
  var root=null;
  function el(h){ var d=document.createElement('div'); d.innerHTML=h; return d.firstElementChild; }
  function mount(){ if(root) return root;
    root=el('<div id="nx" dir="rtl" hidden></div>'); document.body.appendChild(root);
    root.addEventListener('click',onClick); root.addEventListener('input',onInput); root.addEventListener('change',onChange);
    document.addEventListener('keydown',function(ev){ if(root.hidden) return; if(ev.key==='Escape'){ if(V.edit) closeEdit(); else if(V.view==='send'){ V.view='list'; draw(); } else close(); } });
    return root; }
  function open(){ mount(); V.view='list'; root.hidden=false; document.documentElement.classList.add('nx-on'); draw(); try{ parent.__nxOpen=false; }catch(_){} }
  function close(){ if(!root) return; root.hidden=true; V.edit=null; document.documentElement.classList.remove('nx-on'); }

  function all(){ return NOTES2.filter(function(n){ return String(n.t||'').trim()||n.id===(V.edit&&V.edit.id); }); }
  function inTab(n){ return stageOf(n)===V.tab; }
  function pass(n){
    if(V.q){ var q=V.q.trim().toLowerCase(), hay=[n.emp,n.t,deptOf(n.emp),typeOf(n),amtOf(n),n.resp].join(' ').toLowerCase(); if(hay.indexOf(q)<0&&String(amtOf(n)).indexOf(q.replace(/,/g,''))<0) return false; }
    if(V.dept&&deptOf(n.emp)!==V.dept) return false;
    if(V.type&&typeOf(n)!==V.type) return false;
    if(V.st&&stOf(n)!==V.st) return false;
    if(V.open&&n.done) return false;
    if(V.amt&&!amtOf(n)) return false;
    if(V.roy&&!n.roy) return false;
    return true; }

  /* ---------- ציור ---------- */
  function restSel(){
    var o=[], cur=(typeof R2REST!=='undefined'&&R2REST)||'';
    if(typeof CAFE_LABEL!=='undefined'){ Object.keys(CAFE_LABEL).forEach(function(k){ o.push('<option value="cafe:'+E(k)+'"'+(k===cur?' selected':'')+'>'+E(CAFE_LABEL[k])+'</option>'); }); }
    /* המערכת הנוכחית מסומנת (באג 4.11: בפאסטל הוצג «אסא»); בבתי הקפה — שתי המסעדות כבר למעלה, בלי שורת המערכת עצמה */
    var hasCafe=o.length;
    try{ var ps=parent.document.getElementById('ssel'); if(ps) [].forEach.call(ps.options,function(op){ if(op.selected&&hasCafe) return; o.push('<option value="sys:'+E(op.value)+'"'+(op.selected?' selected':'')+'>'+E(op.textContent)+'</option>'); }); }catch(_){}
    if(!o.length) o.push('<option>'+E(REST())+'</option>');
    return '<select class="nx-sel" data-act="rest" aria-label="מסעדה">'+o.join('')+'</select>'; }
  function monSel(){
    var o=[]; try{ var pm=parent.document.getElementById('msel'); if(pm) [].forEach.call(pm.options,function(op){ o.push('<option value="'+E(op.value)+'"'+(op.selected?' selected':'')+'>'+E(op.textContent)+'</option>'); }); }catch(_){}
    if(!o.length) o.push('<option>'+E(MON())+'</option>');
    return '<select class="nx-sel" data-act="mon" aria-label="חודש">'+o.join('')+'</select>'; }
  function kpis(){ var A=all(), c={open:0,sent:0,done:0,me:0};
    A.forEach(function(n){ var s=stOf(n); if(n.me) c.me++; else if(s==='done') c.done++; else if(s==='sent') c.sent++; else c.open++; });
    var k=function(cls,ic,lbl,v,hint,act){ return '<button class="nx-kpi '+cls+(V.st===act||(act==='me'&&V.tab==='me')?' on':'')+'" data-act="kpi" data-k="'+act+'"><span class="nx-ki">'+ic+'</span><span class="nx-kt"><span>'+lbl+'</span><b>'+v+'</b><i>'+hint+'</i></span></button>'; };
    return '<div class="nx-kpis">'+k('k-open','☰','הערות פתוחות',c.open,'עוד לא נשלחו','new')+k('k-sent','➤','נשלחו לחשבת שכר',c.sent,'ממתינות לחשבת','sent')+k('k-done','✓','טופלו',c.done,'סימנת שטופלו','done')+k('k-me','👤','הערות לעצמי',c.me,'לא נשלחות','me')+'</div>'; }
  function tabs(){ var A=all(), cnt=function(s){ return A.filter(function(n){ return stageOf(n)===s&&!n.done; }).length; };
    var t=function(k,l,sub){ return '<button class="nx-tab'+(V.tab===k?' on':'')+'" data-act="tab" data-k="'+k+'">'+l+' <em>'+cnt(k)+'</em><small>'+sub+'</small></button>'; };
    /* קודם באסא ובצ'אקולי (איילת 5.11: «קודם על אסא, אני מאשרת, ואז לכל המסעדות») */
    var SS=window.__nxAsa?STAGES:STAGES.filter(function(x){ return x[0]!=='q'||A.some(function(n){ return stageOf(n)==='q'; }); });
    return '<div class="nx-tabs'+(SS.length>3?' nx-tabs4':'')+'">'+SS.map(function(x){ return t(x[0],x[1],x[2]); }).join('')+'</div>'; }
  function filters(){
    var A=all().filter(inTab), deps={}, tps={}; A.forEach(function(n){ var d=deptOf(n.emp); if(d) deps[d]=1; tps[typeOf(n)]=1; });
    var opt=function(L,v,lbl){ return '<option value="">'+lbl+'</option>'+L.map(function(x){ return '<option'+(x===v?' selected':'')+'>'+E(x)+'</option>'; }).join(''); };
    var chip=function(k,l){ return '<button class="nx-chip'+(V[k]?' on':'')+'" data-act="chip" data-k="'+k+'">'+l+'</button>'; };
    return '<div class="nx-filters"><div class="nx-search"><span>⌕</span><input data-act="q" placeholder="חיפוש: עובד, טקסט או סכום" value="'+E(V.q)+'"></div>'
      +'<select data-act="dept">'+opt(Object.keys(deps).sort(),V.dept,'כל המחלקות')+'</select>'
      +'<select data-act="type">'+opt(TYPES.filter(function(x){ return tps[x]; }),V.type,'כל הסוגים')+'</select>'
      +'<select data-act="st">'+opt(['new','wip','sent','done'].map(function(x){ return x; }),V.st,'כל הסטטוסים').replace(/>(new|wip|sent|done)</g,function(_,k){ return '>'+ST[k][0]+'<'; }).replace(/<option( selected)?>(new|wip|sent|done)/g,function(_,s,k){ return '<option value="'+k+'"'+(s||'')+'>'+ST[k][0]; })+'</select>'
      +chip('open','רק פתוחות')+chip('amt','עם סכום')+chip('roy','❓ לשאול את רועי')+'</div>'; }
  function hl(t){ return E(t).replace(/(\d{1,3}(?:,\d{3})+|\d{3,})(?:\s*(₪|ש"ח|ש&quot;ח|נטו|ברוטו))?/g,'<b class="nx-num">$&</b>'); }
  var TICON={'תוספת':'＋','ניכוי':'－','שעות':'◷','שינוי שכר':'✎','מחלה':'✚','מילואים':'★','חופשה':'☀','פנסיה וקרנות':'⛁','מס ומסמכים':'▤','עובד חדש':'☺','גמר חשבון':'⏏','כללי':'•'};
  var SICON={'new':'◷','wip':'↻','sent':'➤','done':'✓'};
  function dateOf(n){ if(n.done&&n.doneAt) return n.doneAt; if(n.sentAt) return n.sentAt; var l=(n.log||[])[0]; if(l&&l.at) return String(l.at).split(' ')[0]; return ''; }
  function shortD(d){ var m=String(d||'').match(/^(\d{1,2})\.(\d{1,2})\.\d{2}(\d{2})$/); return m?m[1]+'.'+m[2]+'.'+m[3]:d; }
  function rowHtml(n){
    var s=stOf(n), a=amtOf(n), info=slipInfo(n), d=deptOf(n.emp), sel=!!V.sel[n.id], ty=typeOf(n);
    /* כל תיקון ישר מהטבלה (איילת 3.11): טקסט — לחיצה ועריכה במקום; סוג, סכום, למי, סטטוס — בחירה בתא עצמו */
    var id=E(n.id), dv=n.me?(n.roy?'roy':'me'):'acc';
    var dsel='<select class="nx-isel nx-dest d-'+dv+'" data-act="irow" data-f="dest" data-id="'+id+'" title="למי"><option value="acc"'+(dv==='acc'?' selected':'')+'>לחשבת</option><option value="me"'+(dv==='me'?' selected':'')+'>🔒 לעצמי</option><option value="roy"'+(dv==='roy'?' selected':'')+'>❓ לרועי</option></select>';
    var tsel='<select class="nx-isel nx-type t-'+TYPES.indexOf(ty)+'" data-act="irow" data-f="type" data-id="'+id+'" title="סוג"><option value="">'+E(ty)+'</option>'+TYPES.map(function(x){ return '<option value="'+x+'">'+x+'</option>'; }).join('')+'</select>';
    var ssel='<select class="nx-isel nx-pill '+ST[s][1]+'" data-act="irow" data-f="st" data-id="'+id+'" title="סטטוס">'+['new','wip','sent','done'].map(function(k){ return '<option value="'+k+'"'+(k===s?' selected':'')+'>'+SICON[k]+' '+ST[k][0]+'</option>'; }).join('')+'</select>';
    return '<div class="nx-row'+(n.done?' is-done':'')+(sel?' is-sel':'')+'" data-id="'+id+'">'
      +'<label class="nx-ck" title="לבחירה"><input type="checkbox" data-act="ck" data-id="'+id+'"'+(sel?' checked':'')+'></label>'
      +'<div class="nx-c nx-who"><span class="nx-av">👤</span><span><b>'+E(n.emp||(n.general?'כללי':'⚠ לא משויך'))+'</b>'+dsel+'<span class="nx-by '+authorOf(n)[1]+'" title="מי כתב">✍ '+E(authorOf(n)[0])+'</span></span></div>'
      +'<div class="nx-c nx-dep">'+E(d||'—')+'</div>'
      +'<div class="nx-c">'+tsel+'</div>'
      +'<div class="nx-c nx-body">'+(stageOf(n)==='q'?(function(){ var x=qa(n);
          return '<div class="nx-q"><span class="nx-ql">❓ החשבת שאלה</span><div class="nx-text nx-ed" data-act="itext" data-id="'+id+'" title="לחיצה לעריכה">'+hl(x.q)+'</div></div>'
            +'<div class="nx-a'+(x.a?'':' empty')+'"><span class="nx-ql">↩ התשובה שלנו</span><div class="nx-text nx-ed" data-act="ians" data-id="'+id+'" title="לחיצה לכתיבת התשובה">'+(x.a?hl(x.a):'— עוד לא ענינו (לחיצה לכתיבה)')+'</div></div>'; })()
        :'<div class="nx-text nx-ed" data-act="itext" data-id="'+id+'" title="לחיצה לעריכה">'+hl(n.t)+'</div>')
      +(n.royT?'<div class="nx-roysrc">🔎 רועי רשם: '+E(n.royT)+'</div>':'')+royLine(n)
      +(n.resp?'<div class="nx-resp">💬 החשבת: '+E(n.resp)+'</div>':'')
      +(info?'<div class="nx-info'+(/^❗/.test(info)?' bad':'')+'">'+E(info)+'</div>':'')+'</div>'
      +'<div class="nx-c nx-amt"><input class="nx-ain" data-act="irow" data-f="amt" data-id="'+id+'" inputmode="decimal" value="'+(a?F0(a):'')+'" placeholder="—" title="סכום"><span>₪</span></div>'
      +'<div class="nx-c">'+ssel+'</div>'
      +'<div class="nx-c nx-date">'+E(shortD(dateOf(n)))+'</div></div>'; }
  /* עריכה במקום של טקסט (הערה או הערה של רועי) */
  function inlineEdit(div,get,set){ if(div.querySelector('textarea')) return; var ta=document.createElement('textarea'); ta.className='nx-ita'; ta.value=get(); div.innerHTML=''; div.appendChild(ta);
    var fit=function(){ ta.style.height='auto'; ta.style.height=Math.max(36,ta.scrollHeight)+'px'; }; fit(); ta.addEventListener('input',fit); ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length);
    var done=false, fin=function(ok){ if(done) return; done=true; if(ok&&ta.value.trim()!==String(get()).trim()) set(ta.value.trim()); draw(); };
    ta.addEventListener('blur',function(){ fin(true); }); ta.addEventListener('keydown',function(ev){ if(ev.key==='Escape'){ ev.stopPropagation(); fin(false); } else if(ev.key==='Enter'&&!ev.shiftKey){ ev.preventDefault(); fin(true); } }); }
  function headRow(){ var L=all().filter(inTab).filter(pass), on=L.length&&L.every(function(n){ return V.sel[n.id]; });
    return '<div class="nx-row nx-th"><label class="nx-ck"><input type="checkbox" data-act="ckall"'+(on?' checked':'')+' title="בחירת הכול"></label><div class="nx-c">עובד</div><div class="nx-c">מחלקה</div><div class="nx-c">סוג הערה</div><div class="nx-c">הערה</div><div class="nx-c">סכום</div><div class="nx-c">סטטוס</div><div class="nx-c">תאריך</div></div>'; }
  /* הערות של רועי — שורות בתוך אותה טבלה (איילת 4.11: «אל תפריד ביניהם — אפשר לכתוב הערה בצד שרועי רשם») */
  function flagRow(x){ var nm=flagEmp(x.f), d=deptOf(nm), i=x.i;
    return '<div class="nx-row nx-froy">'
      +'<span class="nx-ck"></span>'
      +'<div class="nx-c nx-who"><span class="nx-av">🔎</span><span><b>'+E(nm||'כללי')+'</b><span class="nx-rtag">רועי רשם</span></span></div>'
      +'<div class="nx-c nx-dep">'+E(d||'—')+'</div>'
      +'<div class="nx-c"><span class="nx-pill s-roy">🔎 '+E(x.f.by||'רועי')+'</span></div>'
      +'<div class="nx-c nx-body"><div class="nx-text nx-ed nx-roytxt" data-act="iflag" data-i="'+i+'" title="לחיצה לעריכה">'+hl(x.f.t)+'</div>'
      +'<textarea class="nx-mine" data-i="'+i+'" rows="1" placeholder="✍️ ההערה שלך לחשבת (לא חובה — בלי הערה יישלח מה שרועי רשם)">'+E(V.fmine[i]||'')+'</textarea></div>'
      +'<div class="nx-c nx-facts"><button class="nx-btn p sm" data-act="flag2note" data-i="'+i+'">לחשבת</button><button class="nx-btn sm" data-act="flagme" data-i="'+i+'">לעצמי</button><button class="nx-btn ghost sm" data-act="flagno" data-i="'+i+'">לא רלוונטי</button></div>'
      +'<div class="nx-c nx-date">'+E(shortD(x.f.at||''))+'</div></div>'; }
  /* מה שרועי רשם על עובד שכבר יש לו תיקון — באותה שורה (איילת 4.11: «חבר מה שרועי רשם ומה שאני רשמתי») */
  function hasAfterNote(nm){ return all().some(function(n){ return n.emp===nm&&stageOf(n)==='after'; }); }
  function royLine(n){ if(V.tab!=='after'||n.me) return ''; var F=flagsOpen().filter(function(x){ return flagEmp(x.f)===n.emp; });
    return F.map(function(x){ return '<div class="nx-roysrc nx-roylive">🔎 רועי רשם: <span class="nx-ed" data-act="iflag" data-i="'+x.i+'" title="לחיצה לעריכה">'+E(x.f.t)+'</span>'
      +' <button class="nx-btn sm" data-act="flagin" data-i="'+x.i+'" title="ההערה שלך כבר מכסה את זה">✓ כלול בהערה שלי</button><button class="nx-btn ghost sm" data-act="flagno" data-i="'+x.i+'">לא רלוונטי</button></div>'; }).join(''); }
  function flagsGroup(){ if(V.tab!=='after') return ''; var F=flagsOpen().filter(function(x){ return !hasAfterNote(flagEmp(x.f)); }); if(V.q){ var q=V.q.trim().toLowerCase(); F=F.filter(function(x){ return (flagEmp(x.f)+' '+x.f.t).toLowerCase().indexOf(q)>=0; }); }
    if(V.dept) F=F.filter(function(x){ return deptOf(flagEmp(x.f))===V.dept; }); if(V.st&&V.st!=='new') F=[]; if(!F.length) return '';
    return '<div class="nx-grp nx-grp-roy">🔎 רועי רשם — לבחור מה לעשות <span>'+F.length+'</span></div>'+F.map(flagRow).join(''); }
  /* ייצוא הלשונית כמו שהיא (איילת 4.11: «אני לא מוצאת בקלות את התיקונים אחרי התלוש — יש רק לשלוח») */
  function tabBar(){ var A=all().filter(inTab).filter(pass); if(!A.length) return '';
    var nm={before:'הערות השכר שלנו',q:'בירורי החשבת — שאלה ותשובה',after:'התיקונים אחרי התלושים',me:'ההערות לעצמי'}[V.tab];
    return '<div class="nx-tabbar"><span>'+E(nm)+' · '+A.length+'</span><button class="nx-btn sm" data-act="texp" data-k="copy">📋 העתקה</button><button class="nx-btn sm" data-act="texp" data-k="print">🖨️ הדפסה</button><button class="nx-btn sm" data-act="texp" data-k="pdf">📄 PDF</button><button class="nx-btn sm" data-act="texp" data-k="xls">📊 Excel</button></div>'; }
  function listHtml(){
    var A=all().filter(inTab).filter(pass);
    var RK={'new':0,wip:1,sent:2,done:3}; A.sort(function(a,b){ return (RK[stOf(a)]-RK[stOf(b)])||String(a.emp||'').localeCompare(String(b.emp||''),'he'); });
    var FG=flagsGroup();
    if(!A.length&&FG) return '<div class="nx-table">'+headRow()+FG+'</div>';
    if(!A.length) return '<div class="nx-empty">'+(all().filter(inTab).length?'אין הערות שמתאימות לסינון.':(V.tab==='me'?'אין הערות לעצמך החודש.':'אין עדיין הערות בשלב הזה.'))+'<br><button class="nx-btn p" data-act="new">+ הערה חדשה</button></div>';
    var h='<div class="nx-table">'+headRow()+FG, last=null;
    A.forEach(function(n){ var GN=function(x){ var s=stOf(x); return s==='done'?'טופלו':s==='sent'?'נשלחו — ממתינות לחשבת':'פתוחות'; }; var g=GN(n); if(g!==last){ last=g; h+='<div class="nx-grp">'+g+' <span>'+A.filter(function(x){ return GN(x)===g; }).length+'</span></div>'; } h+=rowHtml(n); });
    return h+'</div><div class="nx-count">מציג '+A.length+' מתוך '+all().filter(inTab).length+' הערות</div>'; }
  function bulkHtml(){ var ids=Object.keys(V.sel).filter(function(k){ return V.sel[k]; }); if(!ids.length) return '';
    return '<div class="nx-bulk"><span class="nx-bn">✓ נבחרו '+ids.length+' הערות</span>'
      +'<select data-act="bulkst"><option value="">שינוי סטטוס…</option><option value="new">חדשה</option><option value="wip">בטיפול</option><option value="sent">נשלחה</option><option value="done">טופלה</option></select>'
      +'<button class="nx-btn ok" data-act="bulk" data-k="done">✓ סימון כטופל</button>'
      +'<button class="nx-btn" data-act="bulk" data-k="me">🔒 לעצמי</button><button class="nx-btn" data-act="bulk" data-k="acc">לחשבת</button>'
      +'<button class="nx-btn danger" data-act="bulk" data-k="del">🗑 מחיקה</button><span class="nx-sp"></span>'
      +'<button class="nx-btn" data-act="bexp" data-k="print">🖨️ הדפסה</button><button class="nx-btn" data-act="bexp" data-k="img">🖼 תמונה</button><button class="nx-btn" data-act="bexp" data-k="pdf">📄 PDF</button><button class="nx-btn" data-act="bexp" data-k="xls">📊 Excel</button>'
      +'<button class="nx-btn ghost" data-act="bulk" data-k="clear">✕</button></div>'; }
  function draw(){ if(!root||root.hidden) return;
    if(V.view==='send'){ root.innerHTML=sendHtml(); return; }
    var y=root.scrollTop;
    root.innerHTML='<header class="nx-head"><div class="nx-title"><button class="nx-x" data-act="close" title="חזרה לבקרה">→</button><h1>הערות שכר</h1>'+restSel()+monSel()+'</div>'
      +'<div class="nx-hact"><button class="nx-btn p big" data-act="new">+ הערה חדשה</button><button class="nx-btn tq" data-act="send">📤 הכנת משלוח לחשבת</button>'
      +'<div class="nx-menu"><button class="nx-btn" data-act="menu">⋯</button><div class="nx-mlist" hidden>'
      +'<button data-act="xls">📊 ייצוא Excel</button><button data-act="pdf">📄 PDF</button><button data-act="print">🖨️ הדפסה</button><button data-act="copytxt">📋 העתקה כטקסט</button>'
      +'<button data-act="nextm">➡️ העתקת הערות לחודש הבא</button><button data-act="oldwin">🗂 החלון הישן</button></div></div></div></header>'
      +'<div class="nx-wrap">'+kpis()+tabs()+'<div class="nx-sticky">'+filters()+'</div>'+tabBar()+'<div class="nx-list">'+listHtml()+'</div>'+bulkHtml()+'</div>'
      +(V.edit?drawerHtml():'');
    root.scrollTop=y; }

  /* ---------- חלונית צד ---------- */
  function drawerHtml(){ var n=V.edit, isNew=!NOTES2.some(function(x){ return x.id===n.id; }), emp=n.emp||'';
    var empOpts=EMPS().map(function(e){ return '<option value="'+E(e.name)+'">'; }).join('');
    var seg=function(k,v,L){ return '<div class="nx-seg">'+L.map(function(x){ return '<button type="button" class="'+(v===x[0]?'on':'')+'" data-act="seg" data-k="'+k+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div>'; };
    var dest=n.me?(n.roy?'roy':'me'):'acc', stage=(n.r||1)===2?'after':(n.r||1)===3?'q':'before', st=stOf(n);
    var prev=emp?prevNotes(emp):[], info=slipInfo(n);
    var log=(n.log||[]).slice().reverse();
    return '<div class="nx-dim" data-act="dclose"></div><aside class="nx-drawer" role="dialog" aria-label="הערה">'
      +'<div class="nx-dh"><h2>'+(isNew?'הערה חדשה':'עריכת הערה')+'</h2><button class="nx-x" data-act="dclose">✕</button></div>'
      +'<div class="nx-dbody">'
      +'<label class="nx-f"><span>עובד/ת</span><input list="nxEmps" data-f="emp" value="'+E(emp)+'" placeholder="הקלידי שם…"><datalist id="nxEmps"><option value="— כללי —">'+empOpts+'</datalist><small>'+E(deptOf(emp)||'')+'</small></label>'
      +'<label class="nx-f"><span>ההערה</span><textarea data-f="t" rows="4" placeholder="מה לכתוב לחשבת…">'+E(n.t||'')+'</textarea></label>'
      +'<div class="nx-f2"><label class="nx-f"><span>סוג</span><select data-f="type"><option value="">אוטומטי — '+E(autoType(n))+'</option>'+TYPES.map(function(x){ return '<option'+(n.type===x?' selected':'')+'>'+x+'</option>'; }).join('')+'</select></label>'
      +'<label class="nx-f"><span>סכום ₪</span><input data-f="amt" inputmode="decimal" value="'+E(n.amt!=null&&n.amt!==''?n.amt:'')+'" placeholder="'+E(autoAmt(n.t)?F0(autoAmt(n.t))+' (מהטקסט)':'אין')+'"></label></div>'
      +'<div class="nx-f"><span>למי</span>'+seg('dest',dest,[['acc','לחשבת שכר'],['me','🔒 לעצמי'],['roy','❓ לשאול את רועי']])+'</div>'
      +'<div class="nx-f"><span>שלב</span>'+seg('stage',stage,[['before','① הערות שכר'],['q','② בירור של החשבת'],['after','③ אחרי התלושים']])+'</div>'
      +'<div class="nx-f"><span>סטטוס</span>'+seg('st',st,[['new','חדשה'],['wip','בטיפול'],['sent','נשלחה'],['done','טופלה']])+'</div>'
      +(stage==='q'&&!n.me?'<label class="nx-f"><span>↩ התשובה שלנו</span><input data-f="ans" value="'+E(qa(n).a)+'" placeholder="מה ענינו לחשבת…"></label>':'')
      +(stage==='after'&&!n.me?'<label class="nx-f"><span>תשובת החשבת</span><input data-f="resp" value="'+E(n.resp||'')+'" placeholder="מה החשבת ענתה…"></label>':'')
      +(info?'<div class="nx-dinfo">'+E(info)+'<small>מידע בלבד — לא משנה את הסטטוס</small></div>':'')
      +'<div class="nx-hist"><h3>היסטוריה</h3>'+(log.length?log.map(function(l){ return '<div><i>'+E(l.at)+'</i> '+E(l.w)+'</div>'; }).join(''):'')
      +'<div><i>'+E(n.src?'מקור':'')+'</i> '+E(n.src||(isNew?'הערה חדשה':'נכתבה לפני השדרוג'))+'</div></div>'
      +(prev.length?'<div class="nx-hist"><h3>הערות קודמות של '+E(emp)+'</h3>'+prev.slice(0,12).map(function(p){ return '<div><i>'+E(p.m)+'</i> '+E(p.n.t)+(p.n.done?' <span class="nx-pill s-done">טופלה</span>':'')+'</div>'; }).join('')+'</div>':'')
      +'</div><div class="nx-dfoot"><button class="nx-btn p big" data-act="dsave">שמירה</button><button class="nx-btn" data-act="dclose">ביטול</button>'
      +(isNew?'':'<button class="nx-btn danger" data-act="ddel">מחיקה</button>')+'</div></aside>'; }
  function openEdit(id,preset){ var n=id?NOTES2.find(function(x){ return x.id===id; }):null;
    V.edit=n?JSON.parse(JSON.stringify(n)):Object.assign({id:n2id(),emp:'',topic:'הערות שוטפות',t:'',done:false,me:V.tab==='me',r:STAGE_R[V.tab]||1,resp:''},preset||{});
    if(stageOf(V.edit)==='q'){ var x=qa(V.edit); V.edit.t=x.q; V.edit.ans=x.a; }
    draw(); setTimeout(function(){ var f=root.querySelector(V.edit.emp?'.nx-drawer textarea':'.nx-drawer input[data-f=emp]'); if(f){ f.focus(); try{ f.setSelectionRange(f.value.length,f.value.length); }catch(_){} } },30); }
  function readDrawer(){ var n=V.edit, q=function(k){ var x=root.querySelector('.nx-drawer [data-f='+k+']'); return x?x.value:null; };
    var emp=String(q('emp')||'').trim(); if(emp==='— כללי —'||emp==='כללי'){ n.emp=''; n.general=true; } else { n.emp=emp; n.general=false; }
    n.t=q('t')||''; var tp=q('type'); n.type=tp||undefined; var am=String(q('amt')||'').replace(/[,₪\s]/g,''); n.amt=am===''?undefined:+am;
    if(q('resp')!=null) n.resp=q('resp'); if(q('ans')!=null) n.ans=q('ans'); }
  function closeEdit(){ V.edit=null; draw(); }
  function saveEdit(){ readDrawer(); var n=V.edit; if(!String(n.t||'').trim()){ alert('ההערה ריקה'); return; }
    var i=NOTES2.findIndex(function(x){ return x.id===n.id; });
    if(i<0){ addLog(n,'נוצרה'+(n.me?(n.roy?' · לשאול את רועי':' · לעצמי'):' · לחשבת')); NOTES2.push(n); }
    else { var o=NOTES2[i], ch=[];
      if(o.t!==n.t) ch.push('הטקסט שונה'); if((o.emp||'')!==(n.emp||'')) ch.push('עובד: '+(n.emp||'כללי'));
      if(!!o.me!==!!n.me||!!o.roy!==!!n.roy) ch.push(n.me?(n.roy?'הועברה: לשאול את רועי':'הועברה: לעצמי'):'הועברה: לחשבת');
      if((o.r||1)!==(n.r||1)) ch.push('שלב: '+({1:'הערות שכר',2:'אחרי התלושים',3:'בירור של החשבת'})[n.r||1]);
      if(stOf(o)!==stOf(n)) ch.push('סטטוס: '+ST[stOf(n)][0]);
      if((o.resp||'')!==(n.resp||'')) ch.push('תשובת החשבת עודכנה');
      if(o.type!==n.type||o.amt!==n.amt) ch.push('סוג/סכום עודכנו');
      if(ch.length) addLog(n,ch.join(' · ')); NOTES2[i]=n; }
    if(n.done&&!n.doneAt) n.doneAt=today();
    V.tab=stageOf(n); V.edit=null; save(); draw(); }

  /* ---------- פעולות ---------- */
  function byId(id){ return NOTES2.find(function(x){ return x.id===id; }); }
  function setStatus(n,s){ if(s==='done'){ if(!n.done){ n.done=true; n.doneAt=today(); addLog(n,'סטטוס: טופלה'); } }
    else { if(n.done){ n.done=false; n.doneAt=undefined; } if(s==='sent'){ if(!n.sentAt){ n.sentAt=today(); } n.st=undefined; } else { n.sentAt=undefined; n.st=s==='wip'?'wip':'new'; } addLog(n,'סטטוס: '+ST[s][0]); } }
  function onClick(ev){ var b=ev.target.closest('[data-act]'); if(!b||!root.contains(b)) { if(!ev.target.closest('.nx-menu')) hideMenu(); var r=ev.target.closest('.nx-row'); if(r&&r.dataset.id&&!r.classList.contains('nx-th')&&!ev.target.closest('input,button,label,select,textarea')) openEdit(r.dataset.id); return; }
    var a=b.dataset.act;
    if(a!=='menu') hideMenu();
    if(a==='itext'){ var nn=byId(b.dataset.id); if(nn){ if(stageOf(nn)==='q'){ var x0=qa(nn); inlineEdit(b,function(){ return x0.q; },function(v){ addLog(nn,'השאלה שונתה'); nn.ans=qa(nn).a; nn.t=v; save(); }); } else inlineEdit(b,function(){ return nn.t||''; },function(v){ addLog(nn,'הטקסט שונה'); nn.t=v; save(); }); } return; }
    if(a==='ians'){ var na=byId(b.dataset.id); if(na){ var x1=qa(na); inlineEdit(b,function(){ return x1.a; },function(v){ addLog(na,x1.a?'התשובה שונתה':'נכתבה תשובה'); na.t=x1.q; na.ans=v; save(); }); } return; }
    if(a==='iflag'){ var fi=+b.dataset.i; inlineEdit(b,function(){ var L=flagsAll()[MON()]||[]; return (L[fi]||{}).t||''; },function(v){ var A=flagsAll(), L=A[MON()]||[]; if(!L[fi]) return; L[fi].t=v; L[fi].edited=today(); try{ localStorage.setItem('pay-flags-v1',JSON.stringify(A)); }catch(_){} }); return; }
    if(a==='irow') return;
    if(a==='close') close();
    else if(a==='tab'){ V.tab=b.dataset.k; V.sel={}; draw(); }
    else if(a==='kpi'){ var k=b.dataset.k; if(k==='me'){ V.tab='me'; V.st=''; } else { if(V.tab==='me') V.tab=DATA.prepay?'before':'after'; V.st=V.st===k?'':k; } draw(); }
    else if(a==='chip'){ V[b.dataset.k]=!V[b.dataset.k]; draw(); }
    else if(a==='new') openEdit(null);
    else if(a==='done'){ var n=byId(b.dataset.id); if(n){ setStatus(n,'done'); save(); draw(); } }
    else if(a==='dclose') closeEdit();
    else if(a==='dsave') saveEdit();
    else if(a==='ddel'){ if(!confirm('למחוק את ההערה הזו לגמרי?')) return; var i=NOTES2.findIndex(function(x){ return x.id===V.edit.id; }); if(i>=0) NOTES2.splice(i,1); V.edit=null; save(); draw(); }
    else if(a==='seg'){ readDrawer(); var n2=V.edit, k2=b.dataset.k, v=b.dataset.v;
      if(k2==='dest'){ n2.me=v!=='acc'; n2.roy=v==='roy'; } else if(k2==='stage'){ n2.r=STAGE_R[v]||1; } else if(k2==='st'){ setStatus(n2,v); n2.log=(n2.log||[]).slice(0,-1); }
      draw(); }
    else if(a==='bulk'){ var ids=Object.keys(V.sel).filter(function(k){ return V.sel[k]; }), k3=b.dataset.k;
      if(k3==='del'){ if(!confirm('למחוק '+ids.length+' הערות לגמרי?')) return; ids.forEach(function(id){ var i=NOTES2.findIndex(function(x){ return x.id===id; }); if(i>=0) NOTES2.splice(i,1); }); V.sel={}; save(); draw(); return; }
      if(k3!=='clear') ids.forEach(function(id){ var n=byId(id); if(!n) return; if(k3==='done') setStatus(n,'done'); else if(k3==='sent') setStatus(n,'sent'); else if(k3==='me'){ n.me=true; addLog(n,'הועברה: לעצמי'); } else if(k3==='acc'){ n.me=false; n.roy=false; addLog(n,'הועברה: לחשבת'); } });
      V.sel={}; if(k3!=='clear') save(); draw(); }
    else if(a==='flag2note'||a==='flagme'||a==='flagno'||a==='flagin'){ var x=flagsOpen().find(function(y){ return String(y.i)===b.dataset.i; }); if(!x) return;
      if(a==='flagno'){ flagDone(x.i,'לא רלוונטי'); draw(); return; }
      if(a==='flagin'){ var tgt=all().find(function(n){ return n.emp===flagEmp(x.f)&&stageOf(n)==='after'; }); if(tgt){ tgt.royT=(tgt.royT?tgt.royT+' · ':'')+x.f.t; addLog(tgt,'צורף מה שרועי רשם'); save(); } flagDone(x.i,'כלול בהערה של איילת'); draw(); return; }
      /* נכנס ישר לטבלה — ההערה שלה (אם כתבה) + מה שרועי רשם נשמר לידה */
      var by=x.f.by||'רועי', mine=String(V.fmine[x.i]||'').trim();
      var nn={id:n2id(),emp:flagEmp(x.f),topic:'הערות שוטפות',t:mine||x.f.t,royT:mine?x.f.t:'',done:false,me:a==='flagme',r:2,resp:'',st:'new',src:by+' כתב אחרי התלושים'+(x.f.at?' ('+x.f.at+')':'')};
      addLog(nn,'נוצרה מהערה של '+by+(nn.me?' · לעצמי':' · לחשבת')); NOTES2.push(nn); flagDone(x.i,a==='flagme'?'הועבר לעצמי':'הפך לתיקון'); delete V.fmine[x.i]; save(); draw(); toastNx(nn.me?'נשמר בהערות לעצמי':'נוסף לתיקונים לחשבת'); }
    else if(a==='bexp'){ var S=NOTES2.filter(function(n){ return V.sel[n.id]; }), k4=b.dataset.k;
      if(k4==='img'){ V.ssel={}; S.forEach(function(n){ V.ssel[n.id]=true; }); V.view='send'; draw(); root.scrollTop=0; exportImg(); }
      else if(k4==='xls') exportXls(S); else exportPdf(S,k4==='print'); }
    else if(a==='menu'){ var m=b.parentNode.querySelector('.nx-mlist'); m.hidden=!m.hidden; }
    else if(a==='send'){ V.view='send'; V.ssel=null; draw(); root.scrollTop=0; }
    else if(a==='sback'){ V.view='list'; draw(); }
    else if(a==='sall'){ var L=sendList(); var on=L.every(function(n){ return V.ssel[n.id]; }); L.forEach(function(n){ V.ssel[n.id]=!on; }); draw(); }
    else if(a==='xls') exportXls(a==='xls'&&V.view==='send'?sendChosen():null);
    else if(a==='img') exportImg();
    else if(a==='pdf') exportPdf(V.view==='send'?sendChosen():null,false);
    else if(a==='print') exportPdf(V.view==='send'?sendChosen():null,true);
    else if(a==='texp'){ var TL=all().filter(inTab).filter(pass), k5=b.dataset.k;
      if(k5==='copy') copy(textOf(TL)); else if(k5==='xls') exportXls(TL); else exportPdf(TL,k5==='print'); }
    else if(a==='copytxt'){ var T=textOf(V.view==='send'?sendChosen():defaultOut()); copy(T); }
    else if(a==='markSent'){ var C=sendChosen(); C.forEach(function(n){ if(!n.sentAt&&!n.done){ n.sentAt=today(); n.st=undefined; addLog(n,'נשלחה לחשבת שכר'); } }); save(); V.justExp=false; draw(); toastNx('סומנו '+C.length+' הערות כ«נשלחו לחשבת» · '+today()); }
    else if(a==='nextm') nextMonth();
    else if(a==='oldwin'){ close(); OLD_OPEN(null); }
    else if(a==='imgdl'){ var im=b.closest('.nx-img').querySelector('img'); var lnk=document.createElement('a'); lnk.href=im.src; lnk.download=im.dataset.name; document.body.appendChild(lnk); lnk.click(); lnk.remove(); }
    else if(a==='imgshare') shareImgs();
  }
  function onInput(ev){ var t=ev.target; if(t.classList&&t.classList.contains('nx-mine')){ V.fmine[t.dataset.i]=t.value; t.style.height='auto'; t.style.height=t.scrollHeight+'px'; return; }
    if(t.dataset.act==='q'){ V.q=t.value; var p=t.selectionStart; draw(); var f=root.querySelector('[data-act=q]'); if(f){ f.focus(); f.setSelectionRange(p,p); } } }
  function onChange(ev){ var t=ev.target, a=t.dataset.act; if(t.closest('textarea.nx-ita')) return;
    if(a==='dept'||a==='type'||a==='st'){ V[a]=t.value; draw(); }
    else if(a==='irow'){ var n=byId(t.dataset.id), f=t.dataset.f, v=t.value; if(!n) return;
      if(f==='st') setStatus(n,v);
      else if(f==='dest'){ n.me=v!=='acc'; n.roy=v==='roy'; addLog(n,v==='acc'?'הועברה: לחשבת':v==='me'?'הועברה: לעצמי':'הועברה: לשאול את רועי'); }
      else if(f==='type'){ n.type=v||undefined; addLog(n,'סוג: '+(v||'אוטומטי')); }
      else if(f==='amt'){ var am=String(v).replace(/[,₪\s]/g,''); n.amt=am===''?undefined:+am; addLog(n,'סכום: '+(am||'—')); }
      save(); draw(); }
    else if(a==='ck'){ V.sel[t.dataset.id]=t.checked; draw(); }
    else if(a==='ckall'){ all().filter(inTab).filter(pass).forEach(function(n){ V.sel[n.id]=t.checked; }); draw(); }
    else if(a==='bulkst'&&t.value){ var v2=t.value; NOTES2.forEach(function(n){ if(V.sel[n.id]) setStatus(n,v2); }); V.sel={}; save(); draw(); }
    else if(a==='sck'){ V.ssel[t.dataset.id]=t.checked; draw(); }
    else if(a==='mon'){ try{ var pm=parent.document.getElementById('msel'); if(pm&&pm.value!==t.value){ parent.__nxOpen=true; pm.value=t.value; pm.onchange&&pm.onchange.call(pm); } }catch(_){} }
    else if(a==='rest'){ var v=t.value; try{ parent.__nxOpen=true; }catch(_){}
      if(v.indexOf('cafe:')===0){ var c=v.slice(5), btn=document.querySelector('[data-cafe="'+c.replace(/"/g,'\\"')+'"]'); if(btn) btn.click(); else { try{ localStorage.setItem('cafe_cur',c); }catch(_){} location.reload(); } }
      else if(v.indexOf('sys:')===0){ try{ var ps=parent.document.getElementById('ssel'); ps.value=v.slice(4); ps.onchange&&ps.onchange.call(ps); }catch(_){} } }
    else if(t.closest('.nx-drawer')&&t.dataset.f==='emp'){ readDrawer(); draw(); var f=root.querySelector('.nx-drawer textarea'); if(f) f.focus(); }
  }
  function hideMenu(){ if(!root) return; var m=root.querySelector('.nx-mlist'); if(m) m.hidden=true; }
  function toastNx(m){ var t=el('<div class="nx-toast">'+E(m)+'</div>'); root.appendChild(t); setTimeout(function(){ t.remove(); },2600); }
  function copy(T){ if(!T){ toastNx('אין מה להעתיק'); return; } try{ navigator.clipboard.writeText(T).then(function(){ toastNx('הועתק'); },function(){ prompt('להעתקה:',T); }); }catch(_){ prompt('להעתקה:',T); } }

  /* ---------- הכנת משלוח לחשבת ---------- */
  function sendList(){ return all().filter(function(n){ return !n.me&&String(n.t||'').trim(); }).sort(function(a,b){ return (RORD[a.r||1]-RORD[b.r||1])||String(a.emp||'').localeCompare(String(b.emp||''),'he'); }); }
  function defaultOut(){ return sendList().filter(function(n){ return stOf(n)==='new'||stOf(n)==='wip'; }); }
  function sendChosen(){ var L=sendList(); if(!V.ssel){ V.ssel={}; L.forEach(function(n){ var s=stOf(n); V.ssel[n.id]=s==='new'||s==='wip'; }); } return L.filter(function(n){ return V.ssel[n.id]; }); }
  function sendHtml(){ var L=sendList(), C=sendChosen(), groups={};
    var line=function(n){ var a=amtOf(n); return '<label class="nx-srow'+(V.ssel[n.id]?' on':'')+'"><input type="checkbox" data-act="sck" data-id="'+E(n.id)+'"'+(V.ssel[n.id]?' checked':'')+'>'
      +'<div class="nx-who"><b>'+E(n.emp||'כללי')+'</b><span>'+E(deptOf(n.emp)||'')+'</span></div><div class="nx-text">'+hl(lineText(n))+'</div><div class="nx-amt">'+(a?F0(a)+' ₪':'')+'</div>'
      +'<span class="nx-pill '+ST[stOf(n)][1]+'">'+ST[stOf(n)][0]+(n.sentAt?' '+E(n.sentAt):'')+'</span></label>'; };
    var B=L.filter(function(n){ return (n.r||1)===1; }), Q=L.filter(function(n){ return (n.r||1)===3; }), A=L.filter(function(n){ return (n.r||1)===2; });
    return '<header class="nx-head"><div class="nx-title"><button class="nx-x" data-act="sback" title="חזרה">→</button><h1>הכנת משלוח לחשבת שכר</h1><span class="nx-sub">'+E(REST())+' · '+E(MON())+'</span></div>'
      +'<div class="nx-hact"><button class="nx-btn" data-act="sall">בחירת הכול / ניקוי</button></div></header>'
      +'<div class="nx-wrap"><div class="nx-sendbar"><div><b>'+C.length+'</b> הערות נבחרו מתוך '+L.length+' <small>(הערות לעצמי ולרועי לא נשלחות)</small></div>'
      +'<div class="nx-exp"><button class="nx-btn tq big" data-act="img">🖼 תמונה לוואטסאפ</button><button class="nx-btn big" data-act="xls">📊 Excel</button><button class="nx-btn big" data-act="pdf">📄 PDF</button><button class="nx-btn" data-act="copytxt">📋 טקסט</button></div></div>'
      +'<div id="nxImgs"></div>'
      +'<div class="nx-markbar"><span>שלחת? אפשר לסמן את '+C.length+' ההערות כ«נשלחו לחשבת» עם התאריך של היום.</span><button class="nx-btn p" data-act="markSent"'+(C.length?'':' disabled')+'>✓ סימון כנשלחו · '+today()+'</button></div>'
      +(B.length?'<div class="nx-grp">לפני הפקת תלושים <span>'+B.length+'</span></div>'+B.map(line).join(''):'')
      +(Q.length?'<div class="nx-grp">② בירורי החשבת — התשובות שלנו <span>'+Q.length+'</span></div>'+Q.map(line).join(''):'')
      +(A.length?'<div class="nx-grp">תיקונים אחרי התלושים <span>'+A.length+'</span></div>'+A.map(line).join(''):'')
      +(L.length?'':'<div class="nx-empty">אין הערות לחשבת החודש.</div>')+'</div>'; }
  function grouped(C){ var M={}, O=[]; C.forEach(function(n){ var k=n.emp||'כללי'; if(!M[k]){ M[k]=[]; O.push(k); } M[k].push(n); }); return O.map(function(k){ return {emp:k,dept:deptOf(k),L:M[k]}; }); }
  function titleOf(C){ var a=C.some(function(n){ return (n.r||1)===2; }), b=C.some(function(n){ return (n.r||1)===1; }); return (a&&!b?'תיקונים לשכר':'הערות שכר')+' — '+REST()+' · '+MON(); }
  function textOf(C){ if(!C||!C.length) return ''; return titleOf(C)+'\n\n'+grouped(C).map(function(g){ return '*'+g.emp+'*'+(g.dept?' ('+g.dept+')':'')+'\n'+g.L.map(function(n){ return '• '+lineText(n); }).join('\n'); }).join('\n\n'); }
  function exportXls(C){ C=C||defaultOut(); if(!C.length){ toastNx('לא נבחרו הערות'); return; }
    if(typeof XLSX==='undefined'){ alert('ספריית האקסל לא נטענה (צריך חיבור לאינטרנט).'); return; }
    var H=['#','עובד/ת','מחלקה','סוג','ההערה','סכום ₪','שלב'];
    var aoa=[[titleOf(C)],['הופק '+today()+' · '+C.length+' הערות'],[],H].concat(C.map(function(n,i){ var a=amtOf(n); return [i+1,n.emp||'כללי',deptOf(n.emp),typeOf(n),lineText(n),a===''?'':a,({1:'הערות שכר (לפני התלושים)',3:'בירור של החשבת + תשובתנו',2:'תיקון אחרי התלושים'})[n.r||1]]; }));
    var ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=[{wch:4},{wch:22},{wch:12},{wch:14},{wch:70},{wch:11},{wch:18}];
    ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:6}},{s:{r:1,c:0},e:{r:1,c:6}}]; ws['!views']=[{RTL:true}];
    try{ var bd={style:'thin',color:{rgb:'D6E4E2'}}, Bd={top:bd,bottom:bd,left:bd,right:bd};
      var set=function(r,c,st){ var ad=XLSX.utils.encode_cell({r:r,c:c}); if(!ws[ad]) ws[ad]={t:'s',v:''}; ws[ad].s=st; };
      set(0,0,{font:{bold:true,sz:16,color:{rgb:'0B6E66'}},alignment:{horizontal:'right'}}); set(1,0,{font:{sz:10,color:{rgb:'777777'}},alignment:{horizontal:'right'}});
      for(var c=0;c<7;c++) set(3,c,{font:{bold:true,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:'0F9B8E'}},alignment:{horizontal:'center',vertical:'center'},border:Bd});
      for(var r=4;r<aoa.length;r++) for(var c2=0;c2<7;c2++) set(r,c2,{alignment:{horizontal:c2===5?'center':'right',vertical:'top',wrapText:true},border:Bd,font:{bold:c2===1||c2===5},fill:r%2?{}:{fgColor:{rgb:'F3F8F7'}}});
    }catch(_){}
    var wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'הערות'); wb.Workbook={Views:[{RTL:true}]};
    XLSX.writeFile(wb,titleOf(C).replace(/[\\\/:*?"<>|]/g,'-')+'.xlsx'); }
  function docHtml(C){ return '<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8"><title>'+E(titleOf(C))+'</title><style>'
      +'@page{size:A4 portrait;margin:14mm}body{font-family:Rubik,Arial,sans-serif;color:#1f2a2e;font-size:12.5pt}h1{color:#0b6e66;font-size:19pt;margin:0 0 2px}.s{color:#777;font-size:10pt;margin-bottom:14px}'
      +'.g{break-inside:avoid;border-top:1px solid #d6e4e2;padding:8px 0}.g b{font-size:13.5pt}.g i{color:#777;font-style:normal;font-size:10pt;margin-inline-start:6px}ul{margin:4px 0 0;padding-inline-start:18px}li{margin:3px 0;line-height:1.45}.n{font-weight:700;color:#0b6e66}</style></head><body>'
      +'<h1>'+E(titleOf(C))+'</h1><div class="s">הופק '+today()+' · '+C.length+' הערות</div>'
      +grouped(C).map(function(g){ return '<div class="g"><b>'+E(g.emp)+'</b><i>'+E(g.dept||'')+'</i><ul>'+g.L.map(function(n){ return '<li>'+hl(lineText(n)).replace(/nx-num/g,'n')+'</li>'; }).join('')+'</ul></div>'; }).join('')+'</body></html>'; }
  function exportPdf(C,justPrint){ C=C||defaultOut(); if(!C.length){ toastNx('לא נבחרו הערות'); return; }
    var f=document.createElement('iframe'); f.style.cssText='position:fixed;width:0;height:0;border:0;left:0;bottom:0'; document.body.appendChild(f);
    var d=f.contentDocument; d.open(); d.write(docHtml(C)); d.close();
    setTimeout(function(){ try{ f.contentWindow.document.title=titleOf(C); f.contentWindow.focus(); f.contentWindow.print(); }catch(_){} setTimeout(function(){ f.remove(); },60000); },350);
    if(!justPrint) toastNx('בחלון ההדפסה בחרי «שמירה כ-PDF»'); }

  /* תמונה לוואטסאפ — ציור ישיר על canvas: כותרת, עובדים מודגשים, סכומים בטורקיז, פיצול אוטומטי לכמה תמונות */
  var IMGS=[];
  function exportImg(){ var C=sendChosen(); if(!C.length){ toastNx('לא נבחרו הערות'); return; }
    var W=1080, P=56, MAXH=1900, FONT='Rubik, Arial, sans-serif';
    var cv=document.createElement('canvas'), x=cv.getContext('2d');
    var font=function(sz,w){ return (w||400)+' '+sz+'px '+FONT; };
    var wrapTokens=function(t,sz,maxW){ x.font=font(sz); var words=String(t).split(/\s+/).filter(Boolean), lines=[], cur=[], w=0, sp=x.measureText(' ').width;
      words.forEach(function(wd){ var isN=/\d{3,}|\d{1,3},\d{3}/.test(wd); x.font=font(sz,isN?700:400); var ww=x.measureText(wd).width;
        if(cur.length&&w+sp+ww>maxW){ lines.push(cur); cur=[]; w=0; } cur.push({t:wd,n:isN,w:ww}); w+=(cur.length>1?sp:0)+ww; });
      if(cur.length) lines.push(cur); return {lines:lines,sp:sp}; };
    var blocks=grouped(C).map(function(g){ var items=g.L.map(function(n){ return wrapTokens(lineText(n),31,W-P*2-34); }); var h=58+items.reduce(function(s,it){ return s+it.lines.length*46+14; },0)+18; return {g:g,items:items,h:h}; });
    var pages=[], cur=[], hh=0, HEAD=190, FOOT=70;
    blocks.forEach(function(b){ if(cur.length&&HEAD+hh+b.h+FOOT>MAXH){ pages.push(cur); cur=[]; hh=0; } cur.push(b); hh+=b.h; }); if(cur.length) pages.push(cur);
    IMGS=[]; var tot=pages.length, title=titleOf(C);
    pages.forEach(function(pg,pi){ var H=HEAD+pg.reduce(function(s,b){ return s+b.h; },0)+FOOT; cv.width=W; cv.height=H; x=cv.getContext('2d'); x.direction='rtl'; x.textAlign='right'; x.textBaseline='alphabetic';
      x.fillStyle='#ffffff'; x.fillRect(0,0,W,H);
      x.fillStyle='#0f9b8e'; x.fillRect(0,0,W,150);
      x.fillStyle='#ffffff'; x.font=font(46,700); x.fillText(REST()+' · '+MON(),W-P,72);
      x.font=font(30,400); x.fillText(/^תיקונים/.test(title)?'תיקונים לשכר':'הערות שכר',W-P,118);
      if(tot>1){ x.textAlign='left'; x.font=font(28,500); x.fillText((pi+1)+'/'+tot,P,72); x.textAlign='right'; }
      var y=HEAD+10;
      pg.forEach(function(b,bi){ if(bi){ x.fillStyle='#e3ecea'; x.fillRect(P,y-26,W-P*2,2); }
        x.fillStyle='#1f2a2e'; x.font=font(36,700); x.fillText(b.g.emp,W-P,y+12);
        if(b.g.dept){ var nw=x.measureText(b.g.emp).width; x.fillStyle='#8a9a98'; x.font=font(26,400); x.fillText(b.g.dept,W-P-nw-16,y+12); }
        y+=58;
        b.items.forEach(function(it){ x.fillStyle='#0f9b8e'; x.beginPath(); x.arc(W-P-8,y-10,6,0,7); x.fill();
          it.lines.forEach(function(ln){ var xx=W-P-34; ln.forEach(function(tk){ x.font=font(31,tk.n?700:400); x.fillStyle=tk.n?'#0b7d73':'#26313a'; x.fillText(tk.t,xx,y); xx-=tk.w+it.sp; }); y+=46; });
          y+=14; });
        y+=18; });
      x.fillStyle='#9aa7a5'; x.font=font(22,400); x.fillText('הופק '+today()+' · '+C.length+' הערות',W-P,H-30);
      IMGS.push({src:cv.toDataURL('image/png'),name:title.replace(/[\\\/:*?"<>|]/g,'-')+(tot>1?' ('+(pi+1)+' מתוך '+tot+')':'')+'.png'}); });
    var box=root.querySelector('#nxImgs'); if(box) box.innerHTML='<div class="nx-imgs-h"><b>'+IMGS.length+(IMGS.length>1?' תמונות':' תמונה')+'</b> — מוכן לוואטסאפ'
      +(navigator.canShare?' <button class="nx-btn tq" data-act="imgshare">שיתוף</button>':'')+'</div><div class="nx-imgs">'
      +IMGS.map(function(im){ return '<div class="nx-img"><img src="'+im.src+'" data-name="'+E(im.name)+'" alt=""><button class="nx-btn" data-act="imgdl">⬇ הורדה</button></div>'; }).join('')+'</div>';
  }
  function shareImgs(){ try{ var files=IMGS.map(function(im){ var b=atob(im.src.split(',')[1]), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return new File([u],im.name,{type:'image/png'}); });
      if(navigator.canShare&&navigator.canShare({files:files})) navigator.share({files:files,title:titleOf(sendChosen())}); else toastNx('השיתוף לא נתמך כאן — הורידי את התמונות'); }catch(_){ toastNx('השיתוף לא נתמך כאן — הורידי את התמונות'); } }

  /* ---------- העתקה לחודש הבא — רק מה שבחרת ---------- */
  function nextMonth(){ var m=MON().match(/(\d{1,2})\/(\d{4})/); if(!m){ toastNx('לא זוהה החודש'); return; }
    var mm=+m[1]+1, yy=+m[2]; if(mm>12){ mm=1; yy++; } var nm=String(mm).padStart(2,'0')+'/'+yy, key=prefix()+String(mm).padStart(2,'0')+yy;
    var L=all().filter(function(n){ return !n.done||n.me; }); if(!L.length){ toastNx('אין הערות פתוחות להעתקה'); return; }
    var box=el('<div class="nx-dim" data-act="x"></div>'), dlg=el('<aside class="nx-drawer"><div class="nx-dh"><h2>העתקה ל-'+nm+'</h2><button class="nx-x" data-close>✕</button></div><div class="nx-dbody"><p class="nx-sub">סמני אילו הערות להעתיק לחודש הבא (הן ייכנסו כ«חדשות», לפני התלושים):</p>'
      +L.map(function(n){ return '<label class="nx-srow on"><input type="checkbox" checked data-id="'+E(n.id)+'"><div class="nx-who"><b>'+E(n.emp||'כללי')+'</b></div><div class="nx-text">'+E(n.t)+'</div></label>'; }).join('')+'</div><div class="nx-dfoot"><button class="nx-btn p big" data-go>העתקה</button><button class="nx-btn" data-close>ביטול</button></div></aside>');
    var done=function(){ box.remove(); dlg.remove(); }; root.appendChild(box); root.appendChild(dlg);
    box.onclick=done; dlg.querySelectorAll('[data-close]').forEach(function(b){ b.onclick=done; });
    dlg.querySelector('[data-go]').onclick=function(){ var ids={}; dlg.querySelectorAll('input[type=checkbox]').forEach(function(c){ if(c.checked) ids[c.dataset.id]=1; });
      var T=[]; try{ T=JSON.parse(localStorage.getItem(key)||'[]')||[]; }catch(_){}
      var have={}; T.forEach(function(n){ have[(n.emp||'')+'|'+n.t]=1; }); var k=0;
      L.filter(function(n){ return ids[n.id]; }).forEach(function(n){ if(have[(n.emp||'')+'|'+n.t]) return; var c=JSON.parse(JSON.stringify(n)); c.id=n2id(); c.done=false; c.doneAt=undefined; c.sentAt=undefined; c.st=undefined; c.r=1; c.resp=''; c.log=[{at:nowS(),w:'הועתקה מ-'+MON()}]; T.push(c); k++; });
      try{ localStorage.setItem(key,JSON.stringify(T)); }catch(_){}
      done(); toastNx(k+' הערות הועתקו ל-'+nm); }; }

  /* ---------- השיחה על העובד (איילת 5.11, לפי הרעיון שלה): רצף אחד לפי סדר החודש — הערה שלנו · שאלת החשבת + תשובתנו ·
     תיקון אחרי התלושים · לעצמי — כל אחד בצבע משלו, מי כתב ומתי, ואם טופל. בכרטיס העובד + מונים בשורת העובד. ---------- */
  var SLBL={before:['💬','הערת שכר שלנו','th-b'],q:['❓','בירור של החשבת','th-q'],after:['📄','תיקון אחרי התלושים','th-a'],me:['🔒','לעצמי','th-m']}, SORD={before:1,q:2,after:3,me:4};
  function empNotes(nm){ return all().filter(function(n){ return n.emp===nm&&String(n.t||'').trim(); })
    .sort(function(a,b){ return (SORD[stageOf(a)]-SORD[stageOf(b)])||String(dateOf(a)).localeCompare(String(dateOf(b))); }); }
  function threadHtml(nm){ var L=empNotes(nm), F=flagsOpen().filter(function(x){ return flagEmp(x.f)===nm; });
    var add=function(st,l){ return '<button class="nx-btn sm" onclick="__nxAdd(\''+encodeURIComponent(nm)+'\',\''+st+'\')">+ '+l+'</button>'; };
    var h='<div class="nx-thread"><div class="nx-th-h"><b>💬 השיחה על '+E(nm)+'</b><span>'+L.length+' הודעות</span><button class="nx-btn sm" onclick="__nxOpen()">כל הערות השכר ←</button></div>';
    if(!L.length&&!F.length) h+='<div class="nx-th-empty">אין עדיין הערות על העובד/ת החודש.</div>';
    L.forEach(function(n){ var g=stageOf(n), lb=SLBL[g], s=stOf(n), au=authorOf(n), body;
      if(g==='q'){ var x=qa(n); body='<div class="nx-th-q">'+hl(x.q)+'</div><div class="nx-th-a'+(x.a?'':' empty')+'">↩ <b>התשובה שלנו:</b> '+(x.a?hl(x.a):'עוד לא ענינו')+'</div>'; }
      else body='<div class="nx-th-t">'+hl(n.t)+'</div>'+(n.resp?'<div class="nx-th-a">💬 <b>החשבת ענתה:</b> '+E(n.resp)+'</div>':'');
      h+='<div class="nx-th-i '+lb[2]+(n.done?' done':'')+'"><div class="nx-th-m"><span class="nx-th-k">'+lb[0]+' '+lb[1]+'</span><span class="nx-by '+au[1]+'">✍ '+E(au[0])+'</span>'
        +'<span class="nx-th-d">'+E(shortD(dateOf(n)))+'</span><span class="nx-pill '+ST[s][1]+'">'+(n.done?'✓ טופל':ST[s][0])+'</span>'
        +'<button class="nx-th-e" title="עריכה" onclick="__nxEdit(\''+encodeURIComponent(n.id)+'\')">✎</button></div>'+body+'</div>'; });
    F.forEach(function(x){ h+='<div class="nx-th-i th-r"><div class="nx-th-m"><span class="nx-th-k">🔎 '+E(x.f.by||'רועי')+' רשם</span><span class="nx-th-d">'+E(shortD(x.f.at||''))+'</span></div><div class="nx-th-t">'+hl(x.f.t)+'</div></div>'; });
    return h+'<div class="nx-th-add">'+add('before','הערת שכר')+add('q','שאלה של החשבת')+add('after','תיקון אחרי התלושים')+add('me','לעצמי')+'</div></div>'; }
  window.__nxAdd=function(nm,st){ nm=decodeURIComponent(nm); open(); V.tab=st; draw(); openEdit(null,{emp:nm,r:STAGE_R[st]||1,me:st==='me'}); };
  window.__nxEdit=function(id){ id=decodeURIComponent(id); var n=byId(id); if(!n) return; open(); V.tab=stageOf(n); draw(); openEdit(id); };
  function countsHtml(nm){ var L=empNotes(nm); if(!L.length) return '';
    var c={before:0,q:0,qo:0,after:0,me:0}; L.forEach(function(n){ var g=stageOf(n); if(n.done) return; c[g]++; if(g==='q'&&!qa(n).a) c.qo++; });
    var b=function(k,ic,t){ return c[k]?'<span class="nx-cnt '+SLBL[k][2]+'" title="'+t+'">'+ic+' '+c[k]+'</span>':''; };
    var h=b('before','💬','הערות שכר פתוחות')+b('q','❓','בירורים של החשבת'+(c.qo?' — '+c.qo+' בלי תשובה':''))+b('after','📄','תיקונים אחרי התלושים')+b('me','🔒','לעצמי');
    return h?'<span class="nx-cnts" onclick="event.stopPropagation();__nxThread(\''+encodeURIComponent(nm)+'\')">'+h+'</span>':''; }
  window.__nxThread=function(nm){ nm=decodeURIComponent(nm); if(typeof openEmpCard==='function') openEmpCard(nm); else if(typeof renderEmpCard==='function'){ try{ renderEmpCard(nm); var ov=document.getElementById('empOverlay'); if(ov) ov.hidden=false; }catch(_){} } };
  if(window.__nxAsa) try{
    /* חשוב: בתוך הקובץ הזה יש rowHtml משלו (שורת הערה) — לכן העטיפה על הפונקציות של הבקרה דרך window בלבד */
    if(typeof window.renderEmpCard==='function'&&document.getElementById('empBody')){
      var OLD_CARD=window.renderEmpCard;
      window.renderEmpCard=function(nm){ var r=OLD_CARD.apply(this,arguments); try{ var b=document.getElementById('empBody'); if(b&&nm){ var old=b.querySelector('.nx-thread'); if(old) old.remove(); b.insertAdjacentHTML('afterbegin',threadHtml(nm)); } }catch(_){} return r; };
    }
    if(typeof window.rowHtml==='function'){
      var OLD_ROW=window.rowHtml;
      window.rowHtml=function(o){ var h=OLD_ROW.apply(this,arguments); try{ var nm=o&&o.name; if(!nm) return h; var c=countsHtml(nm); if(!c) return h;
        var i=h.indexOf('class="nm"'); if(i<0) return h; var j=h.indexOf('</div>',i); return j<0?h:h.slice(0,j)+c+h.slice(j); }catch(_){ return h; } };
      try{ if(typeof window.renderCheck==='function') window.renderCheck(); else if(typeof window.render==='function') window.render(); }catch(_){}
    }
  }catch(_){}

  /* ---------- חיבור: כל מקום שפותח את החלון הישן — פותח את המסך החדש ---------- */
  window.openNotes=function(name,suggest){ open(); if(name){ var ex=NOTES2.find(function(x){ return x.emp===name&&!String(x.t||'').trim(); }); openEdit(ex?ex.id:null,{emp:name,t:suggest||''}); } };
  window.__nxOpen=open;
  if(window.__nxAsa){ window.openQList=function(){ open(); }; }   /* אסא/פינצוס: כל כפתור «הערות שכר» פותח את המסך החדש; החלון הישן — בתפריט «⋯» */
  try{ if(parent.__nxOpen) setTimeout(open,50); }catch(_){}
})();
