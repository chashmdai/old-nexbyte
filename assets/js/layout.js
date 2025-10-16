
(function(){
  function ensureContainers(){
    if(!document.getElementById('site-header')){
      const h=document.createElement('div'); h.id='site-header';
      document.body.insertBefore(h, document.body.firstChild);
    }
    if(!document.getElementById('site-footer')){
      const f=document.createElement('div'); f.id='site-footer';
      document.body.appendChild(f);
    }
  }

  function headerHTML(){
    return `
<header class="nb">
  <div class="container nb-bar">
    <a class="nb-brand" href="./index.html">Nexbyte<span class="dot">.</span></a>

    <button class="nb-menu" aria-label="Abrir menú">☰</button>

    <nav class="nb-nav">
      <a href="./index.html">Home</a>
      <a href="./productos.html">Productos</a>
      <a href="./nosotros.html">Nosotros</a>
      <a href="./blogs.html">Blogs</a>
      <a href="./contacto.html">Contacto</a>
    </nav>

    <div class="nb-cta">
      <a class="btn btn-ghost" href="./login.html">Iniciar sesión</a>
      <a class="btn btn-primary" href="./registro.html">Registrar</a>
      <a class="btn nb-cart" href="./carrito.html" aria-label="Ir al carrito">
        Carrito <span class="nb-pill" id="cart-count">0</span>
      </a>
    </div>
  </div>
</header>`;
  }

  function footerHTML(){
  return `
<footer>
  <div class="container">
    <div class="cols">
      <div>
        <strong style="color:#fff">Nexbyte</strong><br>
        <small>Tecnología y mantención de PC.</small>
      </div>
      <div>
        <h4>Categorías</h4>
        <div><a href="./productos.html">Periféricos</a></div>
        <div><a href="./productos.html">Componentes</a></div>
        <div><a href="./productos.html">Accesorios</a></div>
      </div>
      <div>
        <h4>Ayuda</h4>
        <div><a href="./soporte.html">Soporte</a></div>
        <div><a href="./ayuda.html">Envíos y devoluciones</a></div>
        <div><a href="./garantias.html">Garantías</a></div>
      </div>
      <div>
        <h4>Newsletter</h4>
        <form onsubmit="return false;">
          <input class="input" placeholder="Tu email">
          <button class="btn btn-primary mt-2">Suscribirse</button>
        </form>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© <span id="year-copy"></span> Nexbyte — Todos los derechos reservados</span>
      <div class="socials">
        <a href="#" aria-label="X">X</a>
        <a href="#" aria-label="IG">IG</a>
        <a href="#" aria-label="YT">YT</a>
      </div>
    </div>
  </div>
</footer>`;
}

  function inject(){
    ensureContainers();
    document.getElementById('site-header').innerHTML = headerHTML();
    document.getElementById('site-footer').innerHTML = footerHTML();
    const y=document.getElementById('year-copy'); if(y) y.textContent=new Date().getFullYear();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
