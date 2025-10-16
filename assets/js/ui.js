// assets/js/ui.js
// Nota: para el "bounce" del contador usa en tu CSS:
// @keyframes nb-pop{0%{transform:scale(1)}30%{transform:scale(1.18)}100%{transform:scale(1)}}
// #cart-count.pop{animation:nb-pop .35s cubic-bezier(.2,.7,.2,1)}
// Y para el fade-in de imágenes, en tu CSS:
// .hero-img img,.product .thumb img{opacity:0;transform:scale(1.01);
//   transition:opacity .45s cubic-bezier(.2,.6,.2,1),transform .45s cubic-bezier(.2,.6,.2,1)}
// .hero-img img.is-loaded,.product .thumb img.is-loaded{opacity:1;transform:none}

document.addEventListener('DOMContentLoaded', () => {

  // ===== Header / Navbar =====
  const wireHeader = () => {
    const nb  = document.querySelector('.nb');        // contenedor del header inyectado por layout.js
    const btn = document.querySelector('.nb-menu');   // botón hamburguesa (si existe)
    const nav = document.querySelector('.nb-nav');    // contenedor del menú

    // ----- Menú móvil (overlay a pantalla completa + bloqueo de scroll)
    if (btn && nav) {
      const toggle = () => {
        nav.classList.toggle('show');
        document.body.classList.toggle('no-scroll', nav.classList.contains('show'));
      };
      btn.addEventListener('click', toggle);

      // Cerrar al tocar un enlace
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          nav.classList.remove('show');
          document.body.classList.remove('no-scroll');
        });
      });

      // Cerrar al tocar el fondo (área vacía del overlay)
      nav.addEventListener('click', (e) => {
        if (e.target === nav) {
          nav.classList.remove('show');
          document.body.classList.remove('no-scroll');
        }
      });

      // Si vuelve a desktop, cierra el overlay
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          nav.classList.remove('show');
          document.body.classList.remove('no-scroll');
        }
      });
    }

    // Sombra al hacer scroll
    const onScroll = () => { if (nb) nb.style.boxShadow = window.scrollY > 8 ? 'var(--shadow)' : 'none'; };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Link activo
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nb-nav a').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href && (href === current || href.endsWith('/' + current))) a.classList.add('active');
    });

    // Contador de carrito
    const LS_CART = 'nxv3_cart';
    const $count = () => document.getElementById('cart-count');

    const getSize = () => {
      try {
        const arr = JSON.parse(localStorage.getItem(LS_CART) || '[]') || [];
        return arr.reduce((s, i) => s + Number(i.qty || 0), 0);
      } catch { return 0; }
    };

    // Bounce suave al actualizar
    const renderCount = (n) => {
      const el = $count();
      if (!el) return;
      el.textContent = String(n);
      el.classList.remove('pop');
      // forzar reflow para reiniciar animación
      // eslint-disable-next-line no-unused-expressions
      el.offsetWidth;
      el.classList.add('pop');
    };

    renderCount(getSize());
    window.addEventListener('nx:cart-changed', (e) => {
      const n = (e.detail && typeof e.detail.size === 'number') ? e.detail.size : getSize();
      renderCount(n);
    });
  };

  // Espera a que layout.js inyecte el header antes de cablear
  const tryWire = () => { if (document.querySelector('.nb')) wireHeader(); else setTimeout(tryWire, 80); };
  tryWire();

  // ===== Reveal con "stagger" =====
  (function () {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });

    els.forEach((el, i) => {
      el.style.setProperty('--delay', i % 8); // usa --delay en CSS (multiplicado por 70ms aprox)
      io.observe(el);
    });
  })();

  // ===== Fade-in de imágenes (incluye contenido dinámico) =====
  function enhanceImages(root = document) {
    const sel = '.hero-img img, .product .thumb img';
    const imgs = root.querySelectorAll ? root.querySelectorAll(sel) : [];
    imgs.forEach(img => {
      if (img.dataset.enhanced) return;
      img.dataset.enhanced = '1';
      const on = () => img.classList.add('is-loaded');
      if (img.complete && img.naturalWidth > 0) on();
      else img.addEventListener('load', on, { once: true });
    });
  }
  enhanceImages();

  // Observa nuevos nodos para aplicar el fade-in automáticamente
  try {
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return; // no elemento
          // si el nodo agregado es imagen o contiene imágenes objetivo
          if (n.matches && (n.matches('.hero-img img') || n.matches('.product .thumb img'))) {
            enhanceImages(n.parentNode || n);
          } else {
            enhanceImages(n);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch {}

  // Reintentar cuando se "siembran" productos desde datos.js
  window.addEventListener('nx:products-seeded', () => setTimeout(enhanceImages, 0));
  // Hook manual por si alguna vista quiere refrescar imágenes
  window.addEventListener('nx:images-refresh', () => setTimeout(enhanceImages, 0));
});
