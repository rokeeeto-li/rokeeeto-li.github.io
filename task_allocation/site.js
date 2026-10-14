/* Contents behaviour for the reading-notes deck. Adds two things to the deck's own side navigation without touching its code:
   1) the parts fold into an accordion: only the part you are reading is open;
   2) the whole contents column can be hidden (button above the slide); the slide and notes then use the full width. */
(function () {
  var toc = document.getElementById('toc'), bar = document.querySelector('.bar');
  if (!toc || !bar) return;
  var KEY = 'mrta-toc', body = document.body;
  var wideMQ = matchMedia('(min-width: 1100px)');
  var openIdx = -1;

  /* ---------- 1. parts as an accordion ---------- */
  function parts() { return [].slice.call(toc.querySelectorAll('.part')); }
  function curPart() { var c = toc.querySelector('button[aria-current="true"]'); var p = c && c.closest('.part'); return p ? parts().indexOf(p) : -1; }
  function apply() {
    parts().forEach(function (p, i) {
      var h = p.querySelector('.pt'), fixed = !!p.querySelector('.soon');
      if (fixed) { p.classList.add('open'); return; }
      if (h && !h.dataset.acc) {
        h.dataset.acc = '1'; h.setAttribute('role', 'button'); h.setAttribute('tabindex', '0');
        var tg = function () { openIdx = (openIdx === parts().indexOf(p)) ? -1 : parts().indexOf(p); apply(); };
        h.addEventListener('click', tg);
        h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tg(); } });
      }
      p.classList.toggle('open', i === openIdx);
      if (h) h.setAttribute('aria-expanded', i === openIdx ? 'true' : 'false');
    });
  }
  function reveal() {
    if (!toc.offsetParent && getComputedStyle(toc).position !== 'fixed') return;
    var c = toc.querySelector('button[aria-current="true"]'); if (!c) return;
    var t = toc.getBoundingClientRect(), r = c.getBoundingClientRect();
    if (r.top < t.top + 8 || r.bottom > t.bottom - 8) toc.scrollTop += r.top - t.top - t.height / 3;
  }

  /* ---------- 2. hide / show the contents ---------- */
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn tocbtn'; btn.id = 'tocbtn'; btn.setAttribute('aria-controls', 'toc');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h11M4 17h16"/></svg><span></span>';
  bar.insertBefore(btn, bar.firstChild);
  function label() { var zh = typeof LANG !== 'undefined' && LANG === 'zh'; btn.lastChild.textContent = zh ? '目录' : 'Contents'; }
  function mem() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setOff(off, save) {
    body.classList.toggle('toc-off', off); btn.setAttribute('aria-expanded', off ? 'false' : 'true');
    if (save && wideMQ.matches) { try { localStorage.setItem(KEY, off ? '0' : '1'); } catch (e) {} }
    if (!off) reveal();
  }
  function initState() { setOff(wideMQ.matches ? mem() === '0' : true, false); }
  btn.addEventListener('click', function () { setOff(!body.classList.contains('toc-off'), true); });
  if (wideMQ.addEventListener) wideMQ.addEventListener('change', initState); else if (wideMQ.addListener) wideMQ.addListener(initState);
  /* on a narrow window the contents is a pop-over: close it after choosing a slide, on Esc, or on a click elsewhere */
  toc.addEventListener('click', function (e) { if (!wideMQ.matches && e.target.closest('button[data-i]')) setOff(true, false); });
  document.addEventListener('click', function (e) { if (!wideMQ.matches && !body.classList.contains('toc-off') && !toc.contains(e.target) && !btn.contains(e.target)) setOff(true, false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !wideMQ.matches && !body.classList.contains('toc-off')) setOff(true, false); });

  /* ---------- keep in step with the deck ---------- */
  openIdx = curPart();
  var raf = 0;
  new MutationObserver(function (m) {
    var nav = m.some(function (x) { return x.type === 'attributes'; }), rebuilt = m.some(function (x) { return x.type === 'childList'; });
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0; if (nav) { var i = curPart(); if (i >= 0) openIdx = i; } else if (rebuilt && openIdx < 0) openIdx = curPart();
      apply(); label(); if (nav || rebuilt) reveal();
    });
  }).observe(toc, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-current'] });
  apply(); label(); initState(); reveal();
})();
