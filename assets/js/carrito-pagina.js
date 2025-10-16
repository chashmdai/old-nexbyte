(function (w) {
  NB.mountSite();

  const $empty = document.getElementById('empty');
  const $wrap  = document.getElementById('cartWrap');
  const $body  = document.getElementById('cartBody');
  const $sum   = document.getElementById('summary');
  const $sub   = document.getElementById('subTotal');
  const $btnClear = document.getElementById('btnClear');

  const CLP = new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function productImg(p){
    if (p && p.imagen) {
      const url = escapeHtml(p.imagen);
      return `<img src="${url}" alt="${escapeHtml(p.nombre||'')}" style="width:64px;height:64px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'">`;
    }
    return `<div class="muted" style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;border:1px solid #e5e7eb;border-radius:8px">—</div>`;
  }

  function qtyInput(id, p, qty){
    const max = Number(p && p.stock != null ? p.stock : 9999);
    const m = Number.isFinite(max) && max >= 0 ? max : 9999;
    return `<input type="number" class="qty" data-id="${id}" min="0" step="1" max="${m}" value="${qty}" style="width:94px">`;
  }

  function row(item){
    const p = item.product;
    const name = p ? escapeHtml(p.nombre||'') : 'Producto no disponible';
    const price = p ? Number(p.precio||0) : 0;
    const line = price * (item.qty||0);
    const stock = p && Number.isFinite(Number(p.stock)) ? Number(p.stock) : null;

    const stockLabel = stock === null
      ? ''
      : `<div class="help ${stock>0?'':'error'}" aria-live="polite">${stock>0? stock+' en stock':'Sin stock'}</div>`;

    return `
      <tr data-id="${item.id}">
        <td>${productImg(p)}</td>
        <td>
          <div style="font-weight:600">${name}</div>
          ${p && p.categoria ? `<div class="muted" style="font-size:.9rem">${escapeHtml(p.categoria)}</div>` : ''}
        </td>
        <td>${CLP.format(price)}</td>
        <td>
          ${qtyInput(item.id, p, item.qty||0)}
          ${stockLabel}
        </td>
        <td class="line-total">${CLP.format(line)}</td>
        <td class="right">
          <button class="btn danger" data-del>Eliminar</button>
        </td>
      </tr>
    `;
  }

  function render(){
    const merged = Cart.mergeProducts();
    const has = merged.length > 0;

    $empty.style.display = has ? 'none' : '';
    $wrap.style.display = has ? '' : 'none';
    $sum.style.display = has ? '' : 'none';

    if (!has){
      $body.innerHTML = '';
      $sub.textContent = CLP.format(0);
      NB.updateCartCount();
      return;
    }

    for (let i=0;i<merged.length;i++){
      const it = merged[i];
      const stock = it.product && Number.isFinite(Number(it.product.stock)) ? Number(it.product.stock) : null;
      if (stock !== null && it.qty > stock){
        it.qty = stock < 0 ? 0 : stock;
        Cart.update(it.id, it.qty);
      }
      if (it.qty < 0 || !Number.isFinite(it.qty)){
        it.qty = 0; Cart.update(it.id, 0);
      }
    }

    $body.innerHTML = merged.map(row).join('');

    $sub.textContent = CLP.format(Cart.subtotal());

    NB.updateCartCount();
  }

  document.addEventListener('change', (e) => {
    const qty = e.target.closest('input.qty');
    if (!qty) return;
    const id = qty.getAttribute('data-id');
    let n = Number(qty.value);
    if (!Number.isFinite(n) || n < 0) n = 0;

    const max = Number(qty.getAttribute('max'));
    if (Number.isFinite(max) && n > max) n = max;

    qty.value = n;
    Cart.update(id, n);

    if (n === 0){
      const tr = qty.closest('tr');
      tr && tr.remove();
    } else {
      const merged = Cart.mergeProducts();
      const it = merged.find(x => String(x.id) === String(id));
      const price = it && it.product ? Number(it.product.precio||0) : 0;
      const line = price * n;
      const cell = qty.closest('tr').querySelector('.line-total');
      if (cell) cell.textContent = CLP.format(line);
    }

    if (Cart.items().length === 0) {
      render();
    } else {
      $sub.textContent = CLP.format(Cart.subtotal());
      NB.updateCartCount();
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const tr = btn.closest('tr');
    const id = tr && tr.getAttribute('data-id');
    if (!id) return;

    if (Cart.remove(id)) {
      tr.remove();
      if (Cart.items().length === 0) render();
      else {
        $sub.textContent = CLP.format(Cart.subtotal());
        NB.updateCartCount();
      }
    }
  });

  $btnClear.addEventListener('click', () => {
    if (confirm('¿Vaciar todo el carrito?')) {
      Cart.clear();
      render();
    }
  });

  addEventListener('storage', (ev) => {
    if (ev && ev.key === 'nxv3_cart') render();
  });

  render();
})(window);
