(function () {
  function inlineHero() {
    document.querySelectorAll('img[data-hero-inline-src]:not([data-hero-inlined])').forEach(function (img) {
      var src = img.getAttribute('data-hero-inline-src');
      if (!src) return;

      fetch(src)
        .then(function (res) {
          return res.text();
        })
        .then(function (markup) {
          if (img.getAttribute('data-hero-inlined')) return;

          var el = document.createElement('div');
          el.className = img.className;
          el.setAttribute('role', 'img');
          el.setAttribute('aria-label', img.getAttribute('alt') || 'Turnkey hero illustration');
          el.innerHTML = markup;
          img.setAttribute('data-hero-inlined', 'true');
          img.replaceWith(el);
        })
        .catch(function () {
          /* Keep <img> fallback */
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inlineHero);
  } else {
    inlineHero();
  }
})();
