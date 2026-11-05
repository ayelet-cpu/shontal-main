/* 🧠 תיק עובד (איילת 5.11.2026: «אתה מתייחס לכל עובד כיחידה נפרדת») — מוזרק לכל חודש (pay/index.html → pay-brain.js).
   קורא הכול חי מהענן (localStorage של החודש = pay_kv):
     emp_brain   — נבנה ע"י pay/tools/emp_brain.py מכל החודשים: הגדרת שכר + ציר זמן + הערות שנזרעו
     emp_facts   — מה שאיילת אמרה על העובד (Claude כותב): {"<sys>:<num|שם>": [{t, at, src}]}
     pay_rules   — ספר הכללים: [{id, scope:"all"|"asa"|"pincus"|..., t, at}]
     <sys>_notes2_<MMYYYY> — הערות השכר של כל החודשים
   קריאה בלבד: לא משנה שום נתון, לא כותב הערות. החודש קורא ל-empBrainHtml(o) מתוך כרטיס העובד. */
(function(){
  function J(k,d){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(_){ return d; } }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function nf(x){ return (+x||0).toLocaleString("he-IL",{maximumFractionDigits:2}); }
  function norm(n){ return String(n||"").replace(/[^\w֐-׿ ]/g," ").split(/\s+/).filter(Boolean).sort().join(" "); }
  var MON=["","ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  function mLbl(m){ var a=String(m).split("-"); return (MON[+a[1]]||a[1])+" "+a[0]; }
  function sysOf(){ return typeof ASA_CHECK!=="undefined"?"asa":(typeof PINCUS_CHECK!=="undefined"?"pincus":""); }
  function curM(){ try{ var m=String(CHK.month||"").match(/(\d+)\/(\d{4})/); return m?m[2]+"-"+String(m[1]).padStart(2,"0"):""; }catch(_){ return ""; } }
  var B=null;
  function brain(){ if(B) return B; B=J("emp_brain",null)||{people:{}}; B.idx={};
    Object.keys(B.people||{}).forEach(function(pid){ var p=B.people[pid]; (p.keys||[]).forEach(function(k){ B.idx[p.sys+"|"+k]=pid; }); });
    return B; }
  function find(o){ var b=brain(), s=sysOf(); if(!s) return null;
    var num=o&&o.s&&o.s.num?String(o.s.num):"";
    var pid=(num&&b.idx[s+"|#|"+num])||b.idx[s+"|n|"+norm(o.name)]||b.idx[s+"|c|"+norm(o.name).replace(/ /g,"").split("").sort().join("")]||(o.compname&&b.idx[s+"|n|"+norm(o.compname)]);
    return pid?{pid:pid,p:b.people[pid]}:null; }
  function notesAll(sys,name){ var out=[], re=new RegExp("^"+sys+"_notes2_(\\d{2})(\\d{4})$");
    try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i), m=k&&k.match(re); if(!m) continue;
      (J(k,[])||[]).forEach(function(n){ if(n&&n.emp===name&&String(n.t||"").trim()) out.push({m:m[2]+"-"+m[1],t:n.t,topic:n.topic||"",who:n.who,done:!!n.done,resp:n.resp||""}); }); } }catch(_){}
    return out; }
  /* מה שהשתנה החודש מול החודשים הקודמים — ואם יש הערה שמסבירה */
  var WHY={raise:/העלא|תעריף|שכר|הסכם|גלובל|\+1/,cut:/תעריף|שכר|הפחת|הסכם|חלקי|יחסי/,pension:/פנסי|קרן/,keren:/קרן|השתלמות/,travel:/נסיע/,plus1:/\+1|פלוס 1|1\+/,tax:/מס|נקוד|101|תיאום/,role:/גלובל|תפקיד|הסכם|מנהל|העבר/,glob:/גלובל|הסכם|חוזה|מנהל|משכורת/};
  var SUS={cut:1,pension:1,keren:1,travel:1,plus1:1,tax:1,glob:1,raise:1};
  function factsOf(f,o){ var FA=J("emp_facts",{})||{}, k=sysOf()+":"+o.name; return (FA[f.pid]||[]).concat(k===f.pid?[]:(FA[k]||[])); }
  window.empBrainCheck=function(o){ var f=find(o); if(!f) return []; var m=curM(), N=notesAll(sysOf(),o.name).concat((f.p.seed||[]).filter(function(x){ return !x.sug; }));
    var facts=factsOf(f,o);
    return (f.p.ev||[]).filter(function(e){ return e.m===m&&SUS[e.k]; }).map(function(e){
      var re=WHY[e.k], why=re&&(facts.concat(N).find(function(n){ return re.test(String(n.t||"")+" "+String(n.topic||"")); }));
      /* שינוי סכום/תעריף: ההערה מסבירה רק אם היא מזכירה את הערך החדש (דר פרץ: «52 + 1» לא מסביר 53) */
      var nv=(String(e.t).match(/→\s*([\d,.]+)/)||[])[1];
      if(why&&nv&&(e.k==="raise"||e.k==="cut")){ var v=String(+nv.replace(/,/g,"")); var nums=(String(why.t).match(/\d[\d,]*(\.\d+)?/g)||[]).map(function(x){ return String(+x.replace(/,/g,"")); });
        if(nums.indexOf(v)<0) return {e:e,why:"",near:nums.length?String(why.t).slice(0,90):""}; }
      return {e:e,why:why?String(why.t).slice(0,90):""}; }); };
  var KIND={glob:"🔁",raise:"⬆",cut:"⬇",role:"🔁",travel:"🚌",pension:"🏦",keren:"🏦",plus1:"➕",tax:"🧾",vac:"🌴",sick:"🤒",mil:"🎖",bonus:"🎁",start:"🆕",gone:"🚪",noslip:"∅"};
  window.empBrainHtml=function(o){ try{
    var f=find(o); if(!f) return "";
    var p=f.p, c=p.contract||{}, m=curM();
    var facts=factsOf(f,o);
    var rates=Object.keys(c.rates||{}).map(function(k){ return k+" "+nf(c.rates[k]); }).join(" · ");
    var tr=(c.travel||[]).map(function(t){ return t.type+(t.rate?" "+nf(t.rate):""); }).join(" + ")||"אין";
    var line=[c.dept, c.glob?"גלובלי"+(c.grossM?" (ברוטו "+nf(c.grossM)+")":""):"", rates, "נסיעות: "+tr, c.p1?"+1 לשעה":"", c.pension?"פנסיה ✓":"בלי פנסיה", c.keren?"קרן ✓":"", c.pointz!=null?"נק׳ זיכוי "+nf(c.pointz):"", c.fixedtax?"מס קבוע "+nf(c.fixedtax)+"%":"", c.vacBal!=null?"יתרת חופש "+nf(c.vacBal):""].filter(Boolean).join(" · ");
    var chk=window.empBrainCheck(o);
    var h='<div class="wv-sec">🧠 תיק עובד/ת</div><div class="wv-iss" style="font-size:14.5px"><div><b>הגדרת השכר</b> (מהתלוש של '+esc(mLbl(c.from||m))+'): '+esc(line)+'</div>';
    if(p.also&&p.also.length) h+='<div>עובד/ת גם ב: '+esc(p.also.map(function(x){ return x.split(":")[0]==="asa"?"אסא":"צ'אקולי"; }).join(", "))+'</div>';
    if(facts.length) h+='<div style="margin-top:4px"><b>מה שאיילת אמרה:</b>'+facts.map(function(x){ return '<div>• '+esc(x.t)+(x.at?' <span style="color:var(--wmut)">('+esc(x.at)+')</span>':'')+'</div>'; }).join("")+'</div>';
    if(chk.length) h+='<div style="margin-top:6px"><b>החודש מול התיק:</b>'+chk.map(function(x){ return '<div class="'+(x.why?"":"wv-amb")+'">• '+(KIND[x.e.k]||"•")+" "+esc(x.e.t)+(x.why?' — <span style="color:var(--wmut)">יש הערה: «'+esc(x.why)+'»</span>':(x.near?' — <b>לא תואם למה שרשום:</b> «'+esc(x.near)+'»':' — <b>אין הערה שמסבירה</b>'))+'</div>'; }).join("")+'</div>';
    h+='</div>';
    var ev=(p.ev||[]).slice().sort(function(a,b){ return a.m<b.m?1:-1; });
    var N=notesAll(sysOf(),o.name).filter(function(n){ return n.m!==m; }).concat((p.seed||[]).filter(function(s){ return s.m!==m&&!s.sug; }));
    var byM={}; ev.forEach(function(e){ (byM[e.m]=byM[e.m]||{e:[],n:[]}).e.push(e); }); N.forEach(function(n){ (byM[n.m]=byM[n.m]||{e:[],n:[]}).n.push(n); });
    var ms=Object.keys(byM).sort().reverse();
    if(ms.length) h+='<details><summary>🗂 ההיסטוריה של '+esc(o.name)+' ('+ms.length+' חודשים)</summary><div style="font-size:14px;padding:4px 6px">'+ms.map(function(mm){ var x=byM[mm];
      return '<div style="margin-top:6px"><b>'+esc(mLbl(mm))+'</b>'+x.e.map(function(e){ return '<div>'+(KIND[e.k]||"•")+' '+esc(e.t)+'</div>'; }).join("")
        +x.n.map(function(n){ return '<div style="color:var(--wmut)">📝 '+(n.topic?'<b>'+esc(n.topic)+':</b> ':'')+esc(n.t)+(n.resp?' — תשובה: '+esc(n.resp):'')+'</div>'; }).join("")+'</div>'; }).join("")
      +'<div style="margin-top:6px">'+(p.months||[]).map(function(x){ return esc(mLbl(x.m))+': '+(x.slip?"ברוטו "+nf(x.gross)+(x.hours?" · "+nf(x.hours)+" ש׳":""):"בלי תלוש"); }).join(" | ")+'</div></div></details>';
    return h; }catch(e){ return ""; } };
  /* 6.11 (איילת: «אני צריכה לדעת מה היה השכר השעתי לפני חודש ולפני חודשיים, והאם הייתה הבראה») */
  window.empHist=function(o){ try{ const f=find(o); if(!f) return ""; const M=(f.p.months||[]).slice(-3);
    if(!M.length) return "";
    const role=(o.dept&&/אירוח|מארח/.test(o.dept))?"אירוח":null;
    const rateOf=x=>{ const R=x.rates||{}; const ks=Object.keys(R).filter(k=>!/התלמדות|מתלמד|הדרכה/.test(k)); const k=(role&&ks.find(k=>k.indexOf(role)>=0))||ks[0];
      if(k) return {v:R[k],k:k}; if(x.glob) return {v:null,k:"גלובלי"}; return x.rate?{v:x.rate,k:"",approx:true}:null; };
    const recOf=x=>{ const L=x.lines||[]; const p1=L.find(l=>/הבראה/.test(l[0]||"")&&+l[2]===1); if(p1) return "+1 לשעה ("+nf(p1[3])+" ₪)"; const r=L.filter(l=>/הבראה/.test(l[0]||"")).reduce((a,l)=>a+(+l[3]||0),0)||x.recup; return r?nf(r)+" ₪":"אין"; };
    let prev=null, h='<table class="wv-cmp" style="margin:0 0 12px;border:1.5px solid #ece6f8;border-radius:12px;overflow:hidden;border-collapse:separate;border-spacing:0;width:100%"><tr><th>חודש</th><th>לשעה</th><th>הבראה</th></tr>';
    M.forEach(x=>{ const r=rateOf(x); const v=r&&r.v!=null?nf(r.v)+(r.approx?"*":""):(r&&r.k)||"—"; const ch=prev!=null&&r&&r.v!=null&&Math.abs(prev-r.v)>0.01;
      h+='<tr><td><b>'+esc(mLbl(x.m))+'</b></td><td style="font-weight:800'+(ch?';color:#c2263d':'')+'">'+esc(v)+(ch?' ('+(r.v>prev?"↑":"↓")+')':'')+'</td><td>'+esc(x.slip?recOf(x):"אין תלוש")+'</td></tr>';
      if(r&&r.v!=null) prev=r.v; });
    const ap=M.some(x=>{ const r=rateOf(x); return r&&r.approx; });
    return h+'</table>'+(ap?'<div style="font-size:12.5px;color:#6b6788;margin:-8px 0 12px">* בלי פירוט שורות באותו חודש — התעריף מהסיכום</div>':''); }catch(e){ return ""; } };
  /* ספר הכללים — לכרטיס/לבדיקה: כללים לכל המסעדות + למסעדה הזו */
  window.payRules=function(){ var s=sysOf(); return (J("pay_rules",[])||[]).filter(function(r){ return !r.scope||r.scope==="all"||r.scope===s; }); };
})();
