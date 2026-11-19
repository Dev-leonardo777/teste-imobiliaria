/* Entradas do catálogo. O tour inicial tem seu próprio ciclo de renderização. */
(() => {
  const catalog = document.querySelector('.catalogo');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!catalog || reduceMotion.matches || !('IntersectionObserver' in window)) return;

  const items = catalog.querySelectorAll([
    '.ed-intro > *',
    '.ed-cover',
    '.ed-listing-head',
    '.ed-specs > div',
    '.ed-gallery .ed-title',
    '.ed-gallery-grid > figure',
    '.ed-place > *',
    '.ed-method > div:first-child',
    '.ed-steps > li',
    '.ed-quote',
    '.ed-contact-inner > *'
  ].join(', '));
  if (!items.length) return;

  function reveal(element, delay = 0) {
    if (!element || element.classList.contains('is-visible')) return;
    element.style.setProperty('--reveal-delay', delay + 'ms');
    element.classList.add('is-visible');
    observer.unobserve(element);
  }

  const observer = new IntersectionObserver(entries => {
    // Somente irmãos que chegam à tela juntos formam uma sequência.
    const siblings = new Map();
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const parent = entry.target.parentElement;
      const position = siblings.get(parent) || 0;
      reveal(entry.target, Math.min(position, 2) * 70);
      siblings.set(parent, position + 1);
    }
  }, { rootMargin: '0px 0px -4% 0px' });

  for (const item of items) {
    item.setAttribute('data-reveal', '');
    observer.observe(item);
    const rect = item.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) reveal(item);
  }

  function revealDestination() {
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target || !catalog.contains(target)) return;
    reveal(target.closest('[data-reveal]') || target.querySelector('[data-reveal]'));
  }
  revealDestination();
  window.addEventListener('hashchange', revealDestination);
  catalog.addEventListener('focusin', event => reveal(event.target.closest('[data-reveal]')));

  document.documentElement.classList.add('motion-ready');
  reduceMotion.addEventListener('change', event => {
    if (!event.matches) return;
    document.documentElement.classList.remove('motion-ready');
    observer.disconnect();
  });
})();
