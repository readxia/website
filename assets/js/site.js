// Consolidated site script: lightbox, lazy-loading per <details>, and nav shrink
(function () {
  'use strict';

  // Lightbox elements (must exist in the HTML pages)
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  const backdrop = document.getElementById('lightbox-backdrop');
  const inner = document.getElementById('lightbox-inner');

  function openLightbox(src, alt) {
    if (!lb || !lbImg) return;
    inner && inner.classList.remove('zoomed');
    lbImg.src = src || '';
    lbImg.alt = alt || '';
    lb.style.display = 'flex';
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lb || !lbImg) return;
    lb.style.display = 'none';
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    inner && inner.classList.remove('zoomed');
    document.body.style.overflow = '';
  }

  // Delegated click for lightbox triggers
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest && e.target.closest('.lightbox-trigger');
    if (!trigger) return;
    // load real src if using data-src placeholder
    if (trigger.dataset && trigger.dataset.src && (!trigger.src || trigger.src.startsWith('data:image/gif'))) {
      trigger.src = trigger.dataset.src;
      trigger.removeAttribute('data-src');
    }
    openLightbox(trigger.src, trigger.alt);
  });

  // Lazy-load images inside a day when the <details> is opened
  function setupDetailsLazyLoad() {
    const days = document.querySelectorAll('details.day');
    days.forEach(day => {
      day.addEventListener('toggle', () => {
        if (!day.open) return; // only when opened
        const imgs = day.querySelectorAll('img[data-src]');
        imgs.forEach(img => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
      });
    });
  }

  setupDetailsLazyLoad();

  // Lightbox controls
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  if (lbImg) lbImg.addEventListener('click', () => { inner && inner.classList.toggle('zoomed'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // Nav shrink behavior
  const nav = document.querySelector('nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 60) nav.classList.add('nav-shrink');
    else nav.classList.remove('nav-shrink');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

})();
