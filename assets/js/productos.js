(function () {
  const $grid  = document.getElementById('grid');
  const $empty = document.getElementById('empty');
  const CLP = new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });
  const LS_CART = 'nxv3_cart';

  function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

  function readCart(){ try { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); } catch { return []; } }
  function writeCart(arr){
    localStorage.setItem(LS_CART, JSON.stringify(arr));
    try {
      const size = arr.reduce((s,i)=> s + Number(i.qty||0), 0);
      window.dispatchEvent(new CustomEvent('nx:cart-changed', { detail:{ size } }));
    } catch {}
  }
  function addOne(id){
    const p = DB.products.get(id);
    if (!p || !p.activo || Number(p.stock||0) <= 0) { alert('Producto no disponible.'); return false; }

    const cart = readCart();
    const i = cart.findIndex(it => String(it.id) === String(id));
    const current = i >= 0 ? Number(cart[i].qty||0) : 0;
    const next = Math.min(Number(p.stock||0), current + 1);
    if (next <= current) { alert('No hay más stock disponible.'); return false; }

    if (i >= 0) cart[i].qty = next; else cart.push({ id:String(id), qty:1 });
    writeCart(cart);
    return true;
  }

  // UI
  function card(p){
    const id = String(p.id);
    const img = p.imagen
      ? `<img src="${escapeHtml(p.imagen)}" alt="" class="p-img" onerror="this.style.display='none'">`
      : `<div class="p-img none">—</div>`;
    return `
      <article class="p-card" data-id="${id}">
        <a class="p-media" href="detalle-producto.html?id=${encodeURIComponent(id)}">${img}</a>
        <div class="p-body">
          <a class="p-title" href="detalle-producto.html?id=${encodeURIComponent(id)}">${escapeHtml(p.nombre||'')}</a>
          <div class="p-cat muted">${escapeHtml(p.categoria||'Otros')}</div>
          <div class="p-price">${CLP.format(Number(p.precio||0))}</div>
          <div class="p-actions">
            <button type="button" class="btn primary" data-add>Añadir</button>
          </div>
        </div>
      </article>
    `;
  }

  function getOnSale(){
    try {
      const all = (DB && DB.products && DB.products.list) ? DB.products.list() : [];
      return all.filter(p => !!p.activo && Number(p.stock||0) > 0)
                .sort((a,b)=> Number(b.id) - Number(a.id));
    } catch { return []; }
  }

  function render(){
    const data = getOnSale();
    if (!data.length){
      $grid.innerHTML = '';
      $empty.classList.remove('hidden');
      return;
    }
    $empty.classList.add('hidden');
    $grid.innerHTML = data.map(card).join('');
  }

  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const card = btn.closest('.p-card');
    if (!card) return;

    const ok = addOne(card.getAttribute('data-id'));
    if (ok){
      btn.textContent = 'Agregado ✓';
      setTimeout(()=> btn.textContent = 'Añadir', 900);
    }
  });

  window.addEventListener('nx:products-seeded', render);

  render();
})();
