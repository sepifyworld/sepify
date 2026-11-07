/* sepify.com — shared behaviour for every page. No libraries. */
(function(){
  'use strict';
  var SIGNUP = 'https://app.sepify.com/signup';
  var mail = 'support@sepify.com', canSend = false;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: border once the page scrolls */
  var top = document.querySelector('.top');
  function onScroll(){ if (top) top.classList.toggle('scrolled', window.scrollY > 6); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* desktop dropdowns: click to open, Escape or outside click to close */
  var dds = [].slice.call(document.querySelectorAll('.dd'));
  function closeAll(except){ dds.forEach(function(d){ if (d !== except){ d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded','false'); } }); }
  dds.forEach(function(d){
    var b = d.querySelector('button');
    b.addEventListener('click', function(e){
      e.stopPropagation();
      var open = !d.classList.contains('open');
      closeAll(d); d.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function(e){ if (!e.target.closest('.dd')) closeAll(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeAll(); });

  /* mobile menu */
  var burger = document.querySelector('.burger'), mnav = document.getElementById('mnav');
  if (burger && mnav){
    burger.addEventListener('click', function(){
      var open = !mnav.classList.contains('open');
      mnav.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* pricing: monthly / yearly, and the founding price on Pro */
  var PRICES = { essential:{m:35, y:350}, pro:{m:65, y:650} }, FOUNDING = {m:39, y:390};
  var yearly = false, founding = false;
  function drawPrices(){
    [].forEach.call(document.querySelectorAll('[data-plan]'), function(p){
      var t = p.getAttribute('data-plan'), k = yearly ? 'y' : 'm', f = founding && t === 'pro';
      var amt = p.querySelector('.amt'), was = p.querySelector('s'), per = p.querySelector('.per');
      if (amt) amt.textContent = '$' + (f ? FOUNDING[k] : PRICES[t][k]);
      if (was){ was.hidden = !f; was.textContent = '$' + PRICES[t][k]; }
      if (per) per.textContent = (f ? 'Founding price. ' : '') + (yearly ? 'CAD per location per year, plus tax. Two months free.' : 'CAD per location per month, plus tax.');
    });
  }
  [].forEach.call(document.querySelectorAll('.billing button'), function(b){
    b.addEventListener('click', function(){
      yearly = b.getAttribute('data-b') === 'y';
      [].forEach.call(document.querySelectorAll('.billing button'), function(x){ x.setAttribute('aria-pressed', String(x === b)); });
      drawPrices();
    });
  });

  /* the live punch board on the homepage */
  (function(){
    var board = document.getElementById('board'); if (!board) return;
    var clock = document.getElementById('bclock'), tab = document.getElementById('btab');
    var t1 = tab && tab.querySelector('.t1'), dots = tab ? [].slice.call(tab.querySelectorAll('.dots i')) : [];
    var rows = {}; [].forEach.call(board.querySelectorAll('.row'), function(r){ rows[r.getAttribute('data-id')] = r; });
    var minute = 8 * 60 + 52; // 8:52 AM
    function fmt(m){ var h = Math.floor(m / 60) % 24, mm = m % 60, ap = h >= 12 ? 'PM' : 'AM', hh = h % 12 || 12; return hh + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap; }
    function setClock(){ if (clock) clock.textContent = fmt(minute); }
    function setRow(id, s, text){
      var r = rows[id]; if (!r) return;
      r.setAttribute('data-s', s); r.querySelector('.pill').textContent = text;
      r.classList.add('flash'); setTimeout(function(){ r.classList.remove('flash'); }, 900);
      var last = document.getElementById('blast');
      if (last) last.textContent = r.querySelector('b').textContent + ' ' + (s === 'brk' ? 'started a break at ' : text.indexOf('Back') === 0 ? 'back from break at ' : 'in at ') + fmt(minute);
    }
    function tabPhase(p, text, filled){
      if (!tab) return;
      tab.setAttribute('data-p', p); if (t1) t1.textContent = text;
      dots.forEach(function(d, i){ d.classList.toggle('f', i < (filled || 0)); });
    }
    setClock();
    if (reduce) return; // static board: still readable, no motion

    // each beat: who punches, what happens; the clock moves forward between beats
    var beats = [
      {who:'mk', name:'Marco', s:'on', label:function(){ return 'In ' + fmt(minute); }},
      {who:'jl', name:'Jess', s:'on', label:function(){ return 'In ' + fmt(minute); }},
      {who:'pr', name:'Priya', s:'brk', label:function(){ return 'Break ' + fmt(minute); }, brk:true},
      {who:'dn', name:'Dan', s:'on', label:function(){ return 'In ' + fmt(minute); }},
      {who:'pr', name:'Priya', s:'on', label:function(){ return 'Back ' + fmt(minute); }, back:true}
    ];
    var i = 0, start = {mk:['off','Starts 9:00 AM'], jl:['off','Starts 9:00 AM'], dn:['off','Starts 9:30 AM'], pr:['on','In 8:31 AM']};
    function reset(){ minute = 8 * 60 + 52; setClock(); Object.keys(start).forEach(function(k){ var r = rows[k]; if (r){ r.setAttribute('data-s', start[k][0]); r.querySelector('.pill').textContent = start[k][1]; } }); }
    function run(){
      if (document.hidden){ setTimeout(run, 1200); return; }
      if (i >= beats.length){ i = 0; setTimeout(function(){ reset(); setTimeout(run, 1400); }, 2600); return; }
      var b = beats[i++];
      minute += b.back ? 14 : (b.brk ? 1 : 3); setClock();
      if (b.brk || b.back){
        tabPhase('idle', b.brk ? b.name + ' tapped Start break' : b.name + ' tapped End break', 0);
        setTimeout(function(){ setRow(b.who, b.s, b.label()); tabPhase('ok', b.brk ? 'Enjoy your break' : 'Welcome back', 0); }, 700);
        setTimeout(function(){ tabPhase('idle', 'Enter your PIN', 0); run(); }, 2600);
        return;
      }
      var n = 0;
      tabPhase('idle', 'Enter your PIN', 0);
      var pin = setInterval(function(){
        n++; tabPhase('idle', 'Enter your PIN', n);
        if (n === 4){
          clearInterval(pin);
          setTimeout(function(){ tabPhase('scan', 'Checking it’s you', 4); }, 250);
          setTimeout(function(){ tabPhase('ok', 'Clocked in, ' + b.name, 0); setRow(b.who, b.s, b.label()); }, 1500);
          setTimeout(function(){ tabPhase('idle', 'Enter your PIN', 0); run(); }, 3300);
        }
      }, 220);
    }
    setTimeout(run, 900);
  })();

  /* time card calculator */
  (function(){
    var calc = document.getElementById('calc'); if (!calc) return;
    var body = calc.querySelector('tbody');
    var DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    var html = '';
    DAYS.forEach(function(d, i){
      var wk = i < 5;
      html += '<tr data-d="' + i + '"><td>' + d + '</td>' +
        '<td data-l="Start"><input type="time" aria-label="' + d + ' start" class="ci" value="' + (wk ? '09:00' : '') + '"></td>' +
        '<td data-l="End"><input type="time" aria-label="' + d + ' end" class="co" value="' + (wk ? '17:00' : '') + '"></td>' +
        '<td data-l="Unpaid break (min)"><input type="number" min="0" step="5" inputmode="numeric" aria-label="' + d + ' unpaid break in minutes" class="cb" value="' + (wk ? '30' : '') + '"></td>' +
        '<td class="h" aria-live="polite">0:00</td></tr>';
    });
    body.innerHTML = html;
    var rate = document.getElementById('rate'), ot = document.getElementById('ot'), otm = document.getElementById('otm');
    function mins(v){ if (!v) return null; var p = v.split(':'); return (+p[0]) * 60 + (+p[1]); }
    function hm(m){ m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
    function money(x){ return '$' + x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function calcAll(){
      var total = 0;
      [].forEach.call(body.querySelectorAll('tr'), function(tr){
        var a = mins(tr.querySelector('.ci').value), b = mins(tr.querySelector('.co').value), br = +tr.querySelector('.cb').value || 0, m = 0;
        if (a != null && b != null){ m = b - a; if (m < 0) m += 1440; m = Math.max(0, m - br); }
        tr.querySelector('.h').textContent = hm(m); total += m;
      });
      var limit = (+ot.value || 0) * 60, reg = limit ? Math.min(total, limit) : total, over = total - reg;
      var r = +rate.value || 0, mult = +otm.value || 1.5;
      document.getElementById('tTotal').textContent = hm(total);
      document.getElementById('tReg').textContent = hm(reg);
      document.getElementById('tOt').textContent = hm(over);
      document.getElementById('tPay').textContent = r ? money(reg / 60 * r + over / 60 * r * mult) : '—';
      document.getElementById('tDec').textContent = (total / 60).toFixed(2) + ' hours';
    }
    calc.addEventListener('input', calcAll);
    document.getElementById('cReset').addEventListener('click', function(){ [].forEach.call(body.querySelectorAll('input'), function(x){ x.value = ''; }); calcAll(); });
    document.getElementById('cPrint').addEventListener('click', function(){ window.print(); });
    calcAll();
  })();

  /* contact form: /api/contact when email sending is set up, otherwise the visitor's email app */
  (function(){
    var f = document.getElementById('cf'); if (!f) return;
    var st = document.getElementById('cfStatus'), btn = document.getElementById('cfSend');
    function show(text, err){ st.hidden = false; st.textContent = text; st.className = 'cfmsg' + (err ? ' err' : ''); }
    f.addEventListener('input', function(e){ e.target.removeAttribute('aria-invalid'); if (st.classList.contains('err')) st.hidden = true; });
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var name = f.name.value.trim(), biz = f.business.value.trim(), email = f.email.value.trim(), msg = f.message.value.trim(), bad = null;
      [['name', !name], ['email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)], ['message', !msg]].forEach(function(x){
        var el = f[x[0]]; el.setAttribute('aria-invalid', x[1] ? 'true' : 'false'); if (x[1] && !bad) bad = el;
      });
      if (bad){ show('Add your name, a valid email and a message.', true); bad.focus(); return; }
      if (!canSend){
        var body = msg + '\n\n' + name + (biz ? '\n' + biz : '') + '\n' + email;
        location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Sepify Shift question' + (biz ? ' (' + biz + ')' : '')) + '&body=' + encodeURIComponent(body);
        show('Your email app should open with your message ready to send. If nothing opens, email us at ' + mail + '.');
        return;
      }
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:name, business:biz, email:email, message:msg})})
        .then(function(r){ return r.json().then(function(j){ return {ok:r.ok, j:j}; }); })
        .then(function(x){
          if (x.ok){ f.reset(); show('Message sent. We’ll reply to ' + email + ' soon.'); }
          else show((x.j && x.j.error) || 'Your message didn’t send. Email us at ' + mail + '.', true);
        })
        .catch(function(){ show('Your message didn’t send. Email us at ' + mail + '.', true); })
        .then(function(){ btn.disabled = false; btn.textContent = 'Send message'; });
    });
  })();

  /* live settings: founding offer, contact email, chat (served by /api/site) */
  drawPrices();
  fetch('/api/site').then(function(r){ return r.ok ? r.json() : null; }).then(function(s){
    if (!s) return;
    canSend = !!s.contact;
    if (s.email && s.email !== mail){
      mail = s.email;
      [].forEach.call(document.querySelectorAll('[data-mail]'), function(m){ m.textContent = mail; m.href = 'mailto:' + mail; });
    }
    if (s.offer){
      founding = true; drawPrices();
      document.documentElement.classList.add('founding-on');
      var ob = document.getElementById('offerbar'); if (ob) ob.hidden = false;
      if (s.offer.remaining != null){
        [].forEach.call(document.querySelectorAll('[data-spots]'), function(el){
          el.hidden = false;
          el.querySelector('span').textContent = s.offer.remaining === 1 ? 'Only 1 founding spot left' : 'Only ' + s.offer.remaining + ' founding spots left';
          el.querySelector('i').style.width = Math.round((1 - s.offer.remaining / s.offer.total) * 100) + '%';
        });
      }
    }
    if (s.chat) setupChat();
  }).catch(function(){});

  /* the AI assistant (answers come from api/_facts.js) */
  function setupChat(){
    var btn = document.getElementById('cbtn'), panel = document.getElementById('cpanel'), log = document.getElementById('clog'),
        form = document.getElementById('cform'), input = document.getElementById('cin'), send = document.getElementById('csend'),
        chips = document.getElementById('chips');
    if (!btn || !panel) return;
    var history = [];
    var desktop = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    btn.hidden = false;
    var vv = window.visualViewport;
    function fit(){
      if (!vv || panel.hidden) return;
      var kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      panel.style.setProperty('--vvh', vv.height + 'px'); panel.style.setProperty('--kb', kb + 'px');
      log.scrollTop = log.scrollHeight;
    }
    if (vv){ vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
    function add(cls, text){
      var d = document.createElement('div'); d.className = 'msg ' + cls;
      var re = /(https?:\/\/[^\s)]+|app\.sepify\.com(?:\/[^\s).,]*)?|sepify\.com\/contact|[\w.+-]+@sepify\.com)/g, last = 0, m;
      while ((m = re.exec(text))){
        if (m.index > last) d.appendChild(document.createTextNode(text.slice(last, m.index)));
        var u = m[0].replace(/[.,!?]+$/, ''), a = document.createElement('a');
        a.textContent = u;
        if (u.indexOf('@') > 0) a.href = 'mailto:' + u;
        else if (/^app\.sepify\.com\/?$/.test(u)) a.href = SIGNUP;
        else a.href = /^https?:/.test(u) ? u : 'https://' + u;
        if (/^https?:\/\/(app\.)?sepify\.com|^(app\.)?sepify\.com|@/.test(u) === false){ a.target = '_blank'; a.rel = 'noopener'; }
        d.appendChild(a); last = m.index + u.length;
      }
      if (last < text.length) d.appendChild(document.createTextNode(text.slice(last)));
      log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
    }
    function open(){
      panel.hidden = false; btn.hidden = true; btn.setAttribute('aria-expanded','true');
      if (!log.children.length) add('a', "Hi! I'm the Sepify assistant. Sepify Shift lets your staff punch in with a PIN and a quick face check on any tablet, and you see who's working from your phone. Tap a question below, or tell me about your business.");
      if (desktop) input.focus(); else if (panel.focus) panel.focus({preventScroll:true});
      fit();
    }
    function close(){ if (document.activeElement === input) input.blur(); panel.hidden = true; btn.hidden = false; btn.setAttribute('aria-expanded','false'); btn.focus(); }
    panel.setAttribute('tabindex','-1');
    btn.addEventListener('click', open);
    document.getElementById('cx').addEventListener('click', close);
    panel.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
    function ask(q){
      if (!q || send.disabled) return;
      chips.hidden = true;
      add('u', q); history.push({role:'user', content:q});
      send.disabled = true;
      var t = document.createElement('div'); t.className = 'typing'; t.textContent = 'Typing…'; log.appendChild(t); log.scrollTop = log.scrollHeight;
      fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({messages: history.slice(-12)})})
        .then(function(r){ return r.json().then(function(j){ return {ok:r.ok, j:j}; }); })
        .then(function(x){
          t.remove();
          if (x.ok && x.j.reply){ add('a', x.j.reply); history.push({role:'assistant', content:x.j.reply}); }
          else { add('a err', (x.j && x.j.error) || 'The assistant didn’t answer. Email us at ' + mail + '.'); history.pop(); }
        })
        .catch(function(){ t.remove(); add('a err', 'The assistant didn’t answer. Email us at ' + mail + '.'); history.pop(); })
        .then(function(){ send.disabled = false; if (desktop) input.focus(); });
    }
    chips.addEventListener('click', function(e){
      var c = e.target.closest('.chip'); if (!c) return;
      if (c.dataset.go){ window.location.href = SIGNUP; return; }
      ask(c.dataset.q);
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var q = input.value.trim(); if (!q) return;
      input.value = ''; if (!desktop) input.blur();
      ask(q);
    });
  }
})();
