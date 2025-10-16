(function (w) {
  NB.mountSite();

  const $nf = document.getElementById('notFound');
  const $view = document.getElementById('view');
  const $img = document.getElementById('img');
  const $noImg = document.getElementById('noImg');
  const $qty = document.getElementById('qty');
  const $btnAdd = document.getElementById('btnAdd');
  const $btnGoCart = document.getElementById('btnGoCart');
  const $feedback = document.getElementById('feedback');
  const $stockHelp = document.getElementById('stockHelp');
  const $cartCountTop = document.getElementById('cartCountTop');

  const CLP = new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });

  function qs(k){ return new URLSearchParams(location.search).get(k); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function updateTopCount(){
    const n = (w.Cart && w.Cart.count) ? w.Cart.count() : 0;
    if ($cartCountTop) $cartCountTop.textContent = String(n);
    if (w.NB && typeof w.NB.updateCartCount === 'function') w.NB.updateCartCount();
  }

  function mount(p){
    document.getElementById('pNombre').textContent = p.nombre || 'Producto';
    document.getElementById('pPrecio').textContent = CLP.format(Number(p.precio || 0));
    document.getElementById('pCat').textContent = p.categoria || '—';
    document.getElementById('pDesc').textContent = p.descripcion || '—';

    if (p.imagen){
      $img.src = p.imagen;
      $img.style.display = '';
      $noImg.style.display = 'none';
    } else {
      $img.removeAttribute('src');
      $img.style.display = 'none';
      $noImg.style.display = '';
    }

    const stock = Number(p.stock || 0);
    const active = !!p.activo && stock > 0;
    const stockLbl = document.getElementById('pStockLbl');
    stockLbl.textContent = (stock > 0 ? stock + ' en stock' : 'Sin stock');
    stockLbl.className = 'p-stock ' + (stock > 0 ? 'ok' : 'out');

    $qty.min = '1';
    $qty.step = '1';
    $qty.value = '1';
    if (Number.isFinite(stock) && stock > 0) {
      $qty.max = String(stock);
      $stockHelp.textContent = 'Máximo: ' + stock;
    } else {
      $qty.max = '';
      $stockHelp.textContent = stock > 0 ? '' : 'No disponible';
    }

    $btnAdd.disabled = !active;
    $btnAdd.textContent = active ? 'Añadir al carrito' : 'Sin stock';
  }

  function addToCart(id, maxStock){
    let n = Number($qty.value);
    if (!Number.isFinite(n) || n < 1) n = 1;
    if (Number.isFinite(maxStock) && maxStock > 0 && n > maxStock) n = maxStock;
    $qty.value = String(n);

    Cart.add(id, n);
    updateTopCount();

    $feedback.textContent = 'Producto añadido.';
    $btnGoCart.style.display = '';
    setTimeout(() => { $feedback.textContent = ''; }, 1200);
  }

  const id = qs('id');
  const p = id ? DB.products.get(id) : null;

  if (!p){
    $nf.style.display = '';
  } else {
    $view.style.display = '';
    mount(p);

    $btnAdd.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart(p.id, Number(p.stock || 0));
    });

    addEventListener('storage', (ev) => {
      if (!ev || ev.key !== 'nxv3_products') return;
      const fresh = DB.products.get(p.id);
      if (fresh) mount(fresh);
    });
  }

  updateTopCount();
})(window);