// Visitor analytics (Vercel Web Analytics). No cookies, no personal data.
// Page views are counted automatically. The events below show how far people get:
//   Section reached  -> which parts of the homepage they scrolled to
//   Get started      -> clicked a signup button (where on the page, which plan)
//   Tour opened, Chat opened, Chat question, Quiz finished, Contact click, Contact sent
// Custom events show up in Vercel only on the Pro plan; page views work on every plan.
(function () {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);

  var sent = {};
  function track(name, data, once) {
    var key = name + JSON.stringify(data || {});
    if (once && sent[key]) return;
    sent[key] = true;
    try { window.va('event', data ? { name: name, data: data } : { name: name }); } catch (e) {}
  }
  window.sepifyTrack = track;

  var page = location.pathname.replace(/\/$/, '') || '/home';

  // Where on the page a click happened, e.g. "hero", "pricing", "header", "footer".
  function where(el) {
    if (el.closest('header')) return 'header';
    if (el.closest('footer')) return 'footer';
    if (el.closest('#quiz')) return 'quiz';
    var sec = el.closest('section');
    if (!sec) return 'other';
    if (sec.id) return sec.id;
    var lb = sec.getAttribute('aria-labelledby');
    if (lb) return lb;
    var c = (sec.className || '').split(/\s+/).filter(function (x) { return x && x !== 'in' && x !== 'sec' && x !== 'reveal' && x !== 'split'; });
    return c[0] || 'section';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a, button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('app.sepify.com/signup') !== -1) {
      var plan = (href.match(/[?&]plan=([a-z]+)/) || [])[1] || 'none';
      track('Get started', { where: where(a), plan: plan, page: page });
    } else if (href.indexOf('app.sepify.com/login') !== -1) {
      track('Log in click', { page: page });
    } else if (/^\/contact\b/.test(href)) {
      track('Contact click', { where: where(a), page: page });
    } else if (a.id === 'tourOpen') {
      track('Tour opened', null, true);
    } else if (a.id === 'cbtn') {
      track('Chat opened', null, true);
    } else if (a.id === 'csend' || (a.classList && a.classList.contains('chip'))) {
      track('Chat question', null, true);
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    // Sections reached (each counted once per visit).
    var names = { 'tour': 'tour', 'face-check': 'face check', 'pricing': 'pricing', 'how': 'how it works',
                  'built-for': 'built for', 'faq': 'faq', 'final': 'final call to action' };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          track('Section reached', { section: en.target.getAttribute('data-track'), page: page }, true);
          io.unobserve(en.target);
        });
      }, { threshold: 0.3 });
      Object.keys(names).forEach(function (k) {
        var el = document.getElementById(k) || document.querySelector('section.' + k);
        if (el) { el.setAttribute('data-track', names[k]); io.observe(el); }
      });
    }

    // Quiz finished: the result panel becomes visible.
    var qr = document.getElementById('quizResult');
    if (qr && 'MutationObserver' in window) {
      new MutationObserver(function () {
        if (!qr.hidden) {
          var locs = document.querySelector('.quiz-q[data-q="locs"] button[aria-pressed="true"]');
          track('Quiz finished', locs ? { locations: locs.getAttribute('data-v') } : null, true);
        }
      }).observe(qr, { attributes: true, attributeFilter: ['hidden'] });
    }
  });
})();
