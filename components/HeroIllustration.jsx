'use client';

import { useEffect } from 'react';

/** Replaces hero <img> tags with inline SVG so SMIL tick-ring animations run. */
export function HeroIllustrationEnhancer() {
  useEffect(() => {
    const imgs = document.querySelectorAll('img[data-hero-inline-src]');

    imgs.forEach((img) => {
      const src = img.getAttribute('data-hero-inline-src');
      if (!src) return;

      fetch(src)
        .then((res) => res.text())
        .then((markup) => {
          const el = document.createElement('div');
          el.className = img.className;
          el.setAttribute('role', 'img');
          el.setAttribute('aria-label', img.getAttribute('alt') || 'Turnkey hero illustration');
          el.innerHTML = markup;
          img.replaceWith(el);
        })
        .catch(() => {
          /* Keep the <img> fallback on fetch failure */
        });
    });
  }, []);

  return null;
}
