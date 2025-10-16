(function () {
  const qs = k => new URLSearchParams(location.search).get(k);
  const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  const $notFound = document.getElementById('notFound');
  const $view = document.getElementById('view');

  const $pId = document.getElementById('pId');
  const $pName = document.getElementById('pName');
  const $pCat = document.getElementById('pCat');
  const $pPrice = document.getElementById('pPrice');
  const $pStock = document.getElementById('pStock');
  const $pDesc = document.getElementById('pDesc');

  const $img = document.getElementById('pImg');
  const $imgNone = document.getElementById('pImgNone');

  const $qty = document.getElementById('qty');
  const $btnInc = document.getElementById('btnInc');
  const $btnDec = document.getElementById('btnDec');
  const $btnAdd = document.getElementById('btnAdd');
  const $buyZone = document.getElementById('buyZone');
  const $noBuy = document.getElementById('noBuy');

  const LS_CART = 'nxv3_cart';

  function readCart(){ try { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); } catch { return []; } }
  function writeCart(arr){
    localStorage.setItem(LS_CART, JSON.stringify(arr));
    try { window.dispatchEvent(new CustomEvent('nx:cart-changed', { detail: { size: cartSize(arr) } })); } catch {}
  }
  function cartSize(arr){ return arr.reduce((s, it) => s + Number(it.qty||0), 0); }

  function setImg(url){
    if (url) {
      $img.src = url;
      $img.style.display = '';
      $imgNone.style.display = 'none';
    } else {
      $img.removeAttribute('src');
      $img.style.display = 'none';
      $imgNone.style.display = '';
    }
  }

  function render(){
    const id = qs('id');
    const p = id ? DB.products.get(id) : null;

    if (!p) {
      $notFound.classList.remove('hidden');
      $view.classList.add('hidden');
      return;
    }

    $notFound.classList.add('hidden');
    $view.classList.remove('hidden');

    $pId.textContent = p.id;
    $pName.textContent = p.nombre || '—';
    $pCat.textContent = p.categoria || 'Otros';
    $pPrice.textContent = CLP.format(Number(p.precio || 0));
    $pDesc.textContent = p.descripcion ? p.descripcion : '—';

    const stock = Number(p.stock || 0);
    if (p.activo && stock > 0) {
      $pStock.className = 'badge ok';
      $pStock.textContent = 'En stock: ' + stock;
      $buyZone.classList.remove('hidden');
      $noBuy.classList.add('hidden');

      $qty.max = String(stock);
      if (Number($qty.value) < 1) $qty.value = '1';
      if (Number($qty.value) > stock) $qty.value = String(stock);
    } else {
      $pStock.className = 'badge warn';
      $pStock.textContent = stock <= 0 ? 'Sin stock' : 'Inactivo';
      $buyZone.classList.add('hidden');
      $noBuy.classList.remove('hidden');
    }

    setImg(p.imagen || '');
  }

  function addToCart(id, qty){
    const p = DB.products.get(id);
    if (!p || !p.activo) { alert('Producto no disponible.'); return false; }
    const stock = Number(p.stock || 0);
    qty = Math.max(1, Math.trunc(Number(qty || 1)));

    const cart = readCart();
    const i = cart.findIndex(it => String(it.id) === String(id));
    const current = i >= 0 ? Number(cart[i].qty || 0) : 0;
    const nextQty = Math.min(stock, current + qty);

    if (nextQty <= current){
      alert('No hay más stock disponible.');
      return false;
    }
    if (i >= 0) cart[i].qty = nextQty; else cart.push({ id: String(id), qty: nextQty });
    writeCart(cart);
    return true;
  }

  $btnInc.addEventListener('click', () => {
    const max = Number($qty.max || 99);
    const v = Math.min(max, Number($qty.value || 1) + 1);
    $qty.value = String(v);
  });
  $btnDec.addEventListener('click', () => {
    const v = Math.max(1, Number($qty.value || 1) - 1);
    $qty.value = String(v);
  });
  $btnAdd.addEventListener('click', () => {
    const id = new URLSearchParams(location.search).get('id');
    const ok = addToCart(id, Number($qty.value || 1));
    if (ok) {
      $btnAdd.textContent = 'Agregado ✓';
      setTimeout(()=>{ $btnAdd.textContent = 'Agregar al carrito'; }, 900);
    }
  });

  window.addEventListener('nx:products-seeded', render);

  render();
})();
