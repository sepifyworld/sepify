// Cookie & privacy consent for sepify.com.
//
// What the site uses:
//   Essential (always on): remembers this choice in the browser (localStorage "sepify-consent").
//   Analytics (off until the visitor turns it on): Vercel Web Analytics. No cookies; Vercel counts
//   visits with a daily hash that resets after 24 hours. analytics.js only loads it after "yes".
//
// Rules this follows (strictest common standard: Quebec Law 25 / GDPR style):
//   - nothing optional runs before a choice; "Reject" is as easy as "Accept"
//   - a Global Privacy Control signal from the browser counts as "Reject" (no banner shown)
//   - the choice can be changed anytime ("Cookie settings" in the footer, or /privacy)
//   - the choice is asked again after 12 months or when CONSENT_VERSION changes
//
// Other scripts can use: window.sepifyConsent.analytics (true/false), window.sepifyConsent.open(),
// and listen for the "sepify:consent" event.
(function () {
  var KEY = 'sepify-consent', CONSENT_VERSION = 1, MAX_AGE = 365 * 24 * 3600 * 1000;
  var gpc = navigator.globalPrivacyControl === true;

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!c || c.v !== CONSENT_VERSION || !c.at || Date.now() - c.at > MAX_AGE) return null;
      return c;
    } catch (e) { return null; }
  }
  function save(analytics, how) {
    var c = { v: CONSENT_VERSION, analytics: !!analytics, at: Date.now(), how: how };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    apply(c);
  }

  var api = window.sepifyConsent = { analytics: false, decided: false, gpc: gpc, open: function () { show(true); } };
  function apply(c) {
    api.analytics = !!(c && c.analytics) && !gpc;
    api.decided = !!c;
    try { window.dispatchEvent(new CustomEvent('sepify:consent', { detail: { analytics: api.analytics } })); } catch (e) {}
  }

  var saved = read();
  apply(saved);

  // ---------- banner ----------
  var css = '' +
    '.ck{position:fixed;z-index:60;left:max(16px,env(safe-area-inset-left,0px));bottom:max(16px,calc(env(safe-area-inset-bottom,0px) + 12px));width:min(440px,calc(100vw - 32px));background:#161816;color:#e9ecea;border:1px solid #2e332f;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.45);padding:20px;font:400 15px/1.5 var(--f-body,system-ui,sans-serif);max-height:calc(100dvh - 32px);overflow:auto}' +
    '.ck h2{all:unset;display:flex;align-items:center;gap:10px;font:600 17px/1.3 var(--f-display,system-ui,sans-serif);color:#fff;letter-spacing:-.01em;margin-bottom:8px}' +
    '.ck h2 i{width:9px;height:9px;border-radius:50%;background:#12B76A;flex:none}' +
    '.ck p{margin:0 0 14px;color:#c4cbc6}.ck a{color:#fff;text-underline-offset:2px}' +
    '.ck .row{display:flex;gap:8px;flex-wrap:wrap}' +
    '.ck button{flex:1 1 auto;min-height:44px;padding:0 16px;border-radius:22px;font:600 15px/1 var(--f-body,system-ui,sans-serif);cursor:pointer;border:1px solid #3a403b;background:transparent;color:#fff}' +
    '.ck button.yes,.ck button.no{background:#fff;color:#111;border-color:#fff}' +
    '.ck button:hover{border-color:#12B76A}.ck button:focus-visible,.ck input:focus-visible+span{outline:2px solid #12B76A;outline-offset:2px}' +
    '.ck .opts{display:grid;gap:10px;margin:4px 0 14px}' +
    '.ck label{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid #2e332f;border-radius:14px;cursor:pointer}' +
    '.ck label b{display:block;color:#fff;font-weight:600}.ck label small{display:block;color:#a3aca6;font-size:13px;line-height:1.45;margin-top:2px}' +
    '.ck input{position:absolute;opacity:0;width:1px;height:1px}' +
    '.ck .sw{flex:none;position:relative;width:40px;height:24px;border-radius:12px;background:#3a403b;margin-top:2px;transition:background .15s}' +
    '.ck .sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s}' +
    '.ck input:checked+.sw{background:#12B76A}.ck input:checked+.sw::after{transform:translateX(16px)}' +
    '.ck input:disabled+.sw{opacity:.6}.ck label.off{cursor:default}' +
    '.ck .note{font-size:13px;color:#a3aca6;margin:-4px 0 12px}' +
    '@media (max-width:520px){.ck{left:0;right:0;bottom:0;width:auto;border-radius:20px 20px 0 0;border-bottom:0;padding:18px 18px max(18px,env(safe-area-inset-bottom,0px))}.ck .row button{flex:1 1 40%}}' +
    '@media (prefers-reduced-motion:reduce){.ck .sw,.ck .sw::after{transition:none}}';

  var box;
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }

  function show(detailed) {
    if (!document.body) return document.addEventListener('DOMContentLoaded', function () { show(detailed); });
    if (!document.getElementById('ck-css')) { var s = document.createElement('style'); s.id = 'ck-css'; s.textContent = css; document.head.appendChild(s); }
    if (box) box.remove();
    var cur = read();
    var on = cur ? !!cur.analytics : false;
    var gpcNote = gpc ? '<p class="note">Your browser sends a Global Privacy Control signal, so analytics stays off.</p>' : '';
    box = el(
      '<section class="ck" role="region" aria-label="Cookie and privacy choices">' +
        '<h2 id="ck-t"><i aria-hidden="true"></i>Your privacy, your choice</h2>' +
        (detailed
          ? '<p>Choose what sepify.com may use. You can change this anytime from <b>Cookie settings</b> at the bottom of every page.</p>' +
            '<div class="opts">' +
              '<label class="off"><input type="checkbox" checked disabled><span class="sw" aria-hidden="true"></span><span><b>Essential</b><small>Makes the site work and remembers this choice. Always on.</small></span></label>' +
              '<label><input type="checkbox" id="ck-an"' + (on && !gpc ? ' checked' : '') + (gpc ? ' disabled' : '') + '><span class="sw" aria-hidden="true"></span><span><b>Analytics</b><small>Counts visits and which pages help, so we can improve the site. No cookies, no ads, nothing sold. Run by our host, Vercel.</small></span></label>' +
            '</div>' + gpcNote +
            '<div class="row"><button type="button" class="save">Save choices</button><button type="button" class="yes">Accept all</button></div>'
          : '<p>We use only what this site needs to work. With your OK, we’d also count visits with privacy-friendly analytics (no cookies, no ads, nothing sold). <a href="/privacy#cookies">Privacy &amp; cookie policy</a></p>' +
            '<div class="row"><button type="button" class="no">Reject</button><button type="button" class="yes">Accept</button><button type="button" class="more">Choose</button></div>') +
      '</section>');
    document.body.appendChild(box);

    function done(analytics, how) { save(analytics, how); box.remove(); box = null; }
    box.querySelector('.yes').onclick = function () { done(!gpc, 'accept'); };
    var no = box.querySelector('.no'); if (no) no.onclick = function () { done(false, 'reject'); };
    var more = box.querySelector('.more'); if (more) more.onclick = function () { show(true); var t = box.querySelector('#ck-an') || box.querySelector('button'); t && t.focus(); };
    var sv = box.querySelector('.save'); if (sv) sv.onclick = function () { var a = box.querySelector('#ck-an'); done(a && a.checked, 'choose'); };
    if (detailed) { var f = box.querySelector('#ck-an') || box.querySelector('.save'); f && f.focus(); }
  }
  api.open = function () { show(true); };

  // Footer "Cookie settings" links (any element with data-cookie-settings) reopen the choices.
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (!t) return;
    e.preventDefault();
    show(true);
  });

  // First visit: a GPC signal is a clear "no", so record it quietly. Otherwise ask.
  if (!saved) {
    if (gpc) save(false, 'gpc');
    else show(false);
  }
})();
