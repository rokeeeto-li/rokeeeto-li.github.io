/* Shared script for project pages (qihangli.com/<project>/).
   Page-specific content lives in each page's HTML as data-* attributes; nothing here is project-specific. */

/* Theme: follow the system unless the visitor has picked one (same logic as the homepage). */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (dark) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('theme', dark ? 'light' : 'dark'); } catch (e) {}
  });
  if (!window.matchMedia) return;
  var mq = matchMedia('(prefers-color-scheme: dark)');
  function sync(e) {
    var saved = null; try { saved = localStorage.getItem('theme'); } catch (x) {}
    if (saved === 'dark' || saved === 'light') return;
    if (e.matches) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
  }
  if (mq.addEventListener) mq.addEventListener('change', sync); else if (mq.addListener) mq.addListener(sync);
})();

/* Tab switcher for figures: <button data-result data-src data-w data-h data-alt data-caption>
   updates #result-image and #result-caption. */
(function () {
  var img = document.getElementById('result-image');
  var cap = document.getElementById('result-caption');
  var tabs = document.querySelectorAll('[data-result]');
  if (!img || !cap) return;
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      img.src = tab.dataset.src; img.alt = tab.dataset.alt || '';
      if (tab.dataset.w) img.width = tab.dataset.w;
      if (tab.dataset.h) img.height = tab.dataset.h;
      cap.textContent = tab.dataset.caption || '';
    });
  });
})();

/* Method steps: <button data-step data-box="left,top,width,height" (percent) data-title data-text>
   moves the highlight #step-hl over the figure and updates #step-title / #step-body. */
(function () {
  var hl = document.getElementById('step-hl');
  var title = document.getElementById('step-title');
  var body = document.getElementById('step-body');
  var tabs = document.querySelectorAll('[data-step]');
  if (!hl || !title || !body) return;
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      var b = (tab.dataset.box || '').split(',');
      hl.classList.toggle('off', b.length !== 4);
      if (b.length === 4) { hl.style.left = b[0] + '%'; hl.style.top = b[1] + '%'; hl.style.width = b[2] + '%'; hl.style.height = b[3] + '%'; }
      title.textContent = tab.dataset.title || ''; body.textContent = tab.dataset.text || '';
    });
  });
})();

/* Tooltip: elements with data-tip-title / data-tip-text / data-tip-set show a small card after a short hover, on focus, or on tap. */
(function () {
  var els = document.querySelectorAll('[data-tip-title]');
  if (!els.length) return;
  var tip = document.createElement('div');
  tip.className = 'tip'; tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  var timer = null, current = null;
  function hide() { clearTimeout(timer); tip.classList.remove('on'); current = null; }
  function show(el) {
    tip.textContent = '';
    var t = document.createElement('strong'); t.textContent = el.dataset.tipTitle; tip.appendChild(t);
    tip.appendChild(document.createTextNode(el.dataset.tipText || ''));
    if (el.dataset.tipSet) { var s = document.createElement('span'); s.className = 'set'; s.textContent = 'Setting: ' + el.dataset.tipSet; tip.appendChild(s); }
    var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
    var top = r.bottom + 8; if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
    tip.classList.add('on'); current = el;
  }
  els.forEach(function (el) {
    el.addEventListener('mouseenter', function () { clearTimeout(timer); timer = setTimeout(function () { show(el); }, 350); });
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', function () { show(el); });
    el.addEventListener('blur', hide);
    el.addEventListener('click', function () { if (current === el) hide(); else show(el); });
  });
  window.addEventListener('scroll', hide, { passive: true });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
})();

/* Video switcher: <button data-video data-src data-title data-caption>
   updates #deployment-video (an iframe) and #deployment-video-caption. */
(function () {
  var frame = document.getElementById('deployment-video');
  var cap = document.getElementById('deployment-video-caption');
  var tabs = document.querySelectorAll('[data-video]');
  if (!frame || !cap) return;
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      frame.src = tab.dataset.src; frame.title = tab.dataset.title || '';
      cap.textContent = tab.dataset.caption || '';
    });
  });
})();

/* BibTeX copy button. */
(function () {
  var btn = document.querySelector('.copy');
  var status = document.querySelector('.copy-status');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var el = document.getElementById('bibtex-code');
    if (!el || !navigator.clipboard) { if (status) status.textContent = 'Select the text to copy it.'; return; }
    navigator.clipboard.writeText(el.textContent).then(function () {
      btn.textContent = 'Copied';
      if (status) status.textContent = 'BibTeX copied to clipboard.';
      setTimeout(function () { btn.textContent = 'Copy'; if (status) status.textContent = ''; }, 1800);
    }, function () { if (status) status.textContent = 'Select the text to copy it.'; });
  });
})();

/* Click a figure to view it larger. */
(function () {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var big = lb.querySelector('img');
  function close() { lb.classList.remove('open'); big.removeAttribute('src'); }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.tagName === 'IMG' && t.closest('figure')) { big.src = t.currentSrc || t.src; big.alt = t.alt; lb.classList.add('open'); }
    else if (lb.classList.contains('open')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

/* Section navigation: lists each section's <h2>, highlights the one being read, and can be collapsed. */
(function () {
  var secs = Array.prototype.filter.call(document.querySelectorAll('main section[id]'), function (s) { return s.querySelector('h2'); });
  if (secs.length < 2) return;
  var wide = function () { return window.innerWidth >= 1300; };
  var nav = document.createElement('nav');
  nav.className = 'toc'; nav.id = 'toc'; nav.setAttribute('aria-label', 'Sections');
  var html = '<p class="toc-title">Contents</p><ol>';
  secs.forEach(function (s) { html += '<li><a href="#' + s.id + '">' + s.querySelector('h2').textContent + '</a></li>'; });
  nav.innerHTML = html + '</ol>';
  var btn = document.createElement('button');
  btn.className = 'toc-btn'; btn.type = 'button'; btn.setAttribute('aria-controls', 'toc'); btn.title = 'Contents';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';
  document.body.appendChild(nav); document.body.appendChild(btn);

  function set(open, save) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Hide contents' : 'Show contents');
    if (save && wide()) { try { localStorage.setItem('toc', open ? 'open' : 'closed'); } catch (e) {} }
  }
  var stored = null; try { stored = localStorage.getItem('toc'); } catch (e) {}
  set(wide() && stored !== 'closed', false);
  btn.addEventListener('click', function () { set(!nav.classList.contains('open'), true); });
  // On narrow screens the panel floats over the page: close it after choosing a section, on Escape, or on an outside tap.
  nav.addEventListener('click', function (e) { if (e.target.closest('a') && !wide()) set(false, false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !wide() && nav.classList.contains('open')) set(false, false); });
  document.addEventListener('click', function (e) { if (!wide() && nav.classList.contains('open') && !e.target.closest('.toc,.toc-btn')) set(false, false); });
  window.addEventListener('resize', function () { if (!wide() && nav.classList.contains('open') && !btn.dataset.userOpened) set(false, false); });
  btn.addEventListener('click', function () { btn.dataset.userOpened = '1'; });

  var links = nav.querySelectorAll('a'), ticking = false;
  function spy() {
    ticking = false;
    var cur = -1;
    secs.forEach(function (s, i) { if (s.getBoundingClientRect().top <= 140) cur = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = secs.length - 1;
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();
})();
