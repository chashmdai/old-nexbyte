(function () {
  const LS_CART = 'nxv3_cart';
  const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  const $empty   = document.getElementById('empty');
  const $wrap    = document.getElementById('cartWrap');
  const $tbody   = document.getElementById('tbody');
  const $total   = document.getElementById('total');
  const $itemsCt = document.getElementById('itemsCount');
  const $btnClr  = document.getElementById('btnClear');
  const $btnChk  = document.getElementById('btnCheckout');

  function readCart(){ try { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); } catch { return []; } }
  function writeCart(arr){
    localStorage.setItem(LS_CART, JSON.stringify(arr));
    try { window.dispatchEvent(new CustomEvent('nx:cart-changed', { detail:{ size: cartSize(arr) } })); } catch {}
  }
  function cartSize(arr){ return arr.reduce((s,it)=> s + Number(it.qty||0), 0); }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&gt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function row(prod, qty){
    const id = String(prod.id);
    const precio = Number(prod.precio || 0);
    const stock  = Number(prod.stock || 0);
    const activo = !!prod.activo;
    const disponible = activo && stock > 0;

    const img = prod.imagen
      ? `<img src="${escapeHtml(prod.imagen)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'">`
      : `<div class="muted" style="width:64px;height:64px;border:1px solid #e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center">—</div>`;

    const warn = !disponible ? `<div class="error" style="margin-top:4px">No disponible</div>` :
                 (qty > stock ? `<div class="error" style="margin-top:4px">Stock actualizado: máx ${stock}</div>` : '');

    const controlsDisabled = !disponible ? 'disabled' : '';
    const maxAttr = disponible ? `max="${stock}"` : '';

    const subtotal = CLP.format(Math.max(0, Math.min(qty, stock) * precio));

    return `
      <tr data-id="${id}">
        <td>${img}</td>
        <td>
          <div style="font-weight:600">${escapeHtml(prod.nombre || '')}</div>
          <div class="muted" style="font-size:.9rem">${escapeHtml(prod.categoria || 'Otros')} · #${escapeHtml(id)}</div>
          ${warn}
        </td>
        <td>${CLP.format(precio)}</td>
        <td>
          <div class="qty" style="justify-content:flex-start">
            <button class="qty-btn" data-dec ${controlsDisabled}>-</button>
            <input type="number" class="qty-input" value="${Math.max(1, qty)}" min="1" ${maxAttr} ${controlsDisabled} step="1" aria-label="Cantidad">
            <button class="qty-btn" data-inc ${controlsDisabled}>+</button>
            <button class="btn" data-apply ${controlsDisabled} style="margin-left:8px">Aplicar</button>
          </div>
        </td>
        <td class="subtotal">${subtotal}</td>
        <td class="right">
          <button class="btn danger" data-del>Eliminar</button>
        </td>
      </tr>
    `;
  }

  function normalizeCart(cart){
    const out = [];
    for (let i=0;i<cart.length;i++){
      const it = cart[i];
      const p = DB.products.get(it.id);
      if (!p) continue;
      const stock = Number(p.stock || 0);
      let qty = Math.max(1, Math.trunc(Number(it.qty || 1)));
      if (stock <= 0 || !p.activo) {
        qty = Math.max(1, qty);
      } else if (qty > stock) {
        qty = stock;
      }
      out.push({ id: String(p.id), qty });
    }
    return out;
  }

  function calcTotals(cart){
    let total = 0, items = 0;
    for (let i=0;i<cart.length;i++){
      const it = cart[i];
      const p = DB.products.get(it.id);
      if (!p) continue;
      const precio = Number(p.precio || 0);
      const stock  = Number(p.stock || 0);
      const qty    = Math.max(1, Math.min(Number(it.qty||1), stock));
      total += precio * qty;
      items += qty;
    }
    return { total, items };
  }

  function render(){
    let cart = readCart();

    cart = normalizeCart(cart);
    writeCart(cart); 

    if (!cart.length){
      $empty.classList.remove('hidden');
      $wrap.classList.add('hidden');
      return;
    }

    $empty.classList.add('hidden');
    $wrap.classList.remove('hidden');

    let html = '';
    for (let i=0;i<cart.length;i++){
      const it = cart[i];
      const p = DB.products.get(it.id);
      if (!p) continue;
      html += row(p, Number(it.qty || 1));
    }
    $tbody.innerHTML = html;

    const t = calcTotals(cart);
    $itemsCt.textContent = String(t.items);
    $total.textContent = CLP.format(t.total);

    const allUnavailable = cart.every(it => {
      const p = DB.products.get(it.id);
      return !p || !p.activo || Number(p.stock||0) <= 0;
    });
    $btnChk.classList.toggle('disabled', allUnavailable);
    $btnChk.setAttribute('aria-disabled', allUnavailable ? 'true' : 'false');
    if (allUnavailable) $btnChk.addEventListener('click', preventIfDisabled);
    else $btnChk.removeEventListener('click', preventIfDisabled);
  }

  function preventIfDisabled(e){
    if (e.currentTarget.classList.contains('disabled')) {
      e.preventDefault();
      alert('No hay productos disponibles para continuar.');
    }
  }

  document.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    const cart = readCart();

    if (e.target === $btnClr){
      if (confirm('¿Vaciar carrito?')) {
        writeCart([]);
        render();
      }
      return;
    }

    if (!tr) return;
    const id = tr.getAttribute('data-id');
    const idx = cart.findIndex(it => String(it.id) === String(id));
    if (idx < 0) return;

    const p = DB.products.get(id);
    const stock = Number(p?.stock || 0);
    const $qty = tr.querySelector('.qty-input');

    if (e.target.matches('[data-del]')){
      cart.splice(idx, 1);
      writeCart(cart);
      render();
      return;
    }

    if (e.target.matches('[data-inc]')) {
      const v = Math.min(stock, Number($qty.value||1) + 1);
      $qty.value = String(v);
      return;
    }
    if (e.target.matches('[data-dec]')) {
      const v = Math.max(1, Number($qty.value||1) - 1);
      $qty.value = String(v);
      return;
    }

    if (e.target.matches('[data-apply]')) {
      let v = Math.trunc(Number($qty.value||1));
      if (!Number.isFinite(v) || v < 1) v = 1;
      if (Number.isFinite(stock) && stock >= 0) v = Math.min(v, stock);
      cart[idx].qty = v;
      writeCart(cart);
      render();
      return;
    }
  });

  window.addEventListener('nx:products-seeded', render);

  render();
})();
