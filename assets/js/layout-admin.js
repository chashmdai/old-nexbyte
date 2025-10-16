(function (global) {
  const AX = global.AX || {};

  AX.mountLayout = function () {
    const $header = document.getElementById("admin-header");
    const $aside  = document.getElementById("admin-aside");
    if (!$header || !$aside) return;

    // Topbar sobrio
    $header.innerHTML = `
      <div class="a-topbar container">
        <button class="a-burger" aria-label="Abrir menú" aria-expanded="false">
          <span style="display:inline-block;width:18px;height:2px;background:#cfe3ff;box-shadow:0 6px 0 #cfe3ff,0 -6px 0 #cfe3ff;border-radius:2px"></span>
        </button>
        <div class="a-brand">Admin Nexbyte</div>
        <div class="spacer"></div>
      </div>
    `;

    // Helper para generar iniciales (2 letras)
    const abbr = (txt) => {
      const w = String(txt || '').trim().split(/\s+/);
      if (!w.length) return '';
      if (w.length === 1) return (w[0].slice(0,2)).toUpperCase();
      return (w[0][0] + w[1][0]).toUpperCase();
    };

    // Define las entradas del menú (sin emojis)
    const ITEMS = [
      { href: 'index.html',            label: 'Dashboard',      group: 'Gestión' },
      { href: 'productos-listado.html',label: 'Productos',       group: 'Gestión' },
      { href: 'usuarios-listado.html', label: 'Usuarios',        group: 'Gestión' },
      { href: 'inventario.html',       label: 'Inventario' },
      { href: 'reportes.html',         label: 'Reportes' },
      { href: 'contactos.html',        label: 'Contactos',       group: 'Comunicaciones' },
    ];

    // Render del aside
    let lastGroup = null;
    const linksHtml = ITEMS.map(it => {
      const g = (it.group && it.group !== lastGroup)
        ? `<div class="group-title">${it.group}</div>` : '';
      lastGroup = it.group || lastGroup;
      const ico = abbr(it.label);
      return `
        ${g}
        <a class="a-link" href="${it.href}" title="${it.label}">
          <span class="ico" aria-hidden="true">${ico}</span>
          <span class="label">${it.label}</span>
        </a>
      `;
    }).join('');

    $aside.innerHTML = `<nav class="a-nav">${linksHtml}</nav>`;

    // Dim para móvil
    let $dim = document.querySelector(".a-dim");
    if (!$dim) {
      $dim = document.createElement("div");
      $dim.className = "a-dim";
      document.body.appendChild($dim);
    }

    const $burger = $header.querySelector(".a-burger");
    const mq = matchMedia("(max-width:1024px)");
    const isMobile = () => mq.matches;

    function closeMobile() {
      document.body.classList.remove("a-open");
      $burger.setAttribute("aria-expanded","false");
    }

    function toggleMenu() {
      if (isMobile()) {
        const open = document.body.classList.toggle("a-open");
        $burger.setAttribute("aria-expanded", open ? "true" : "false");
      } else {
        // En desktop, colapsa/expande
        document.body.classList.toggle("a-collapsed");
      }
    }

    $burger.addEventListener("click", toggleMenu);
    $dim.addEventListener("click", closeMobile);
    addEventListener("keyup", e => { if (e.key === "Escape") closeMobile(); });
    mq.addEventListener("change", closeMobile);

    // Activo actual
    try {
      const here = location.pathname.split("/").pop() || "index.html";
      $aside.querySelectorAll("a.a-link").forEach(a => {
        if ((a.getAttribute("href")||"") === here) a.classList.add("active");
      });
    } catch {}
  };

  global.AX = AX;
})(window);
