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

  // Add placeholder src to lazy images that only have data-src (keeps HTML unchanged but ensures a visible placeholder)
  // This mirrors adding src="assets/loading.webp" to tags and runs early because this script is loaded with `defer`.
  try {
    document.querySelectorAll('img[data-src]').forEach(img => {
      if (!img.hasAttribute('src') || img.getAttribute('src') === '') {
        img.src = 'assets/loading.webp';
      }
    });
  } catch (err) {
    // ignore
  }

  // Delegated click for lightbox triggers
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest && e.target.closest('.lightbox-trigger');
    if (!trigger) return;

    // Helper to preload an image and resolve with the Image element
    function preload(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('failed'));
        img.src = url;
      });
    }

    // Build a list of candidate URLs to try, preferring any data-src
    const raw = (trigger.dataset && trigger.dataset.src) || trigger.src || '';
    const candidates = [];
    if (raw) candidates.push(raw);
    try {
      if (raw.includes('/thumbnails/')) {
        candidates.push(raw.replace('/thumbnails/', '/'));
      }
      const noThumb = raw.replace(/thumbnail/gi, '');
      if (noThumb !== raw) candidates.push(noThumb);
    } catch (err) {
      // ignore
    }

    // Try candidates in order until we find one whose naturalWidth is reasonably large
    (async function tryCandidates() {
      for (const c of candidates) {
        try {
          const img = await preload(c);
          if (img.naturalWidth >= 400 || img.naturalHeight >= 300) {
            try { trigger.src = c; } catch (err) {}
            trigger.removeAttribute('data-src');
            openLightbox(c, trigger.alt);
            return;
          }
        } catch (err) {
          // preload failed, try next
        }
      }
      // Fallback to first candidate or existing src
      const fallback = candidates[0] || trigger.src;
      if (fallback && trigger.dataset && trigger.dataset.src) {
        try { trigger.src = fallback; } catch (err) {}
        trigger.removeAttribute('data-src');
      }
      openLightbox(fallback, trigger.alt);
    })();
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

})();
