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
