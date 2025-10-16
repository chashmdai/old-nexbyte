(function () {
  const LOW = 5;
  const CLP = new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });

  const $q        = document.getElementById('q');
  const $filtro   = document.getElementById('filtro');
  const $tbody    = document.getElementById('tbody');
  const $wrap     = document.getElementById('wrap');
  const $empty    = document.getElementById('empty');
  const $btnExport= document.getElementById('btnExport');
  if (!$tbody || !$wrap) return;

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function chipStock(p){
    const st = Number(p.stock||0);
    if (st <= 0) return '<span class="badge warn">0</span>';
    if (st < LOW) return '<span class="badge" style="background:#fff7ed;border-color:#fed7aa;color:#c2410c">'+st+'</span>';
    return '<span class="badge ok">'+st+'</span>';
  }
  function thumb(p){
    if (p.imagen) {
      const url = escapeHtml(p.imagen);
      return `<img src="${url}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'">`;
    }
    return `<div class="muted" style="width:64px;height:64px;border:1px solid #e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center">—</div>`;
  }
  function row(p){
    const id = p.id;
    const activo = p.activo ? '<span class="badge ok">Sí</span>' : '<span class="badge">No</span>';
    return `
      <tr data-id="${escapeHtml(String(id))}">
        <td>${thumb(p)}</td>
        <td>
          <div style="font-weight:600">${escapeHtml(p.nombre||'')}</div>
          <div class="muted" style="font-size:.9rem">#${escapeHtml(String(id))}</div>
        </td>
        <td>${escapeHtml(p.categoria||'—')}</td>
        <td>${CLP.format(Number(p.precio||0))}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            ${chipStock(p)}
            <input class="stk" type="number" value="${Number(p.stock||0)}" min="0" step="1" style="width:90px">
            <button class="btn" data-inc>+1</button>
            <button class="btn" data-dec>-1</button>
            <button class="btn primary" data-save>Guardar</button>
          </div>
        </td>
        <td>${activo}</td>
        <td class="right">
          <button class="btn" data-toggle>${p.activo ? 'Desactivar' : 'Activar'}</button>
          <a class="btn" href="producto-editar.html?id=${encodeURIComponent(id)}">Editar</a>
          <a class="btn" href="producto-mostrar.html?id=${encodeURIComponent(id)}">Ver</a>
        </td>
      </tr>
    `;
  }

  function getAll(){
    try { return (window.DB && DB.products && DB.products.list) ? DB.products.list() : []; }
    catch { return []; }
  }
  function applyFilters(all, text, filter){
    const t = (text||'').toLowerCase().trim();
    let data = !t ? all : all.filter(p => {
      const blob = [String(p.id||''), p.nombre||'', p.categoria||''].join(' ').toLowerCase();
      return blob.includes(t);
    });
    if (filter === 'low')   data = data.filter(p => Number(p.stock||0) > 0 && Number(p.stock) < LOW);
    if (filter === 'zero')  data = data.filter(p => Number(p.stock||0) === 0);
    if (filter === 'off')   data = data.filter(p => !p.activo);
    if (filter === 'noimg') data = data.filter(p => !p.imagen);
    return data;
  }

  function render(){
    const data = applyFilters(getAll(), $q && $q.value, $filtro && $filtro.value);
    const has = data.length > 0;
    $empty && $empty.classList.toggle('hidden', has);
    $wrap.classList.toggle('hidden', !has);
    if (!has){ $tbody.innerHTML=''; return; }

    let html = '';
    for (let i=0;i<data.length;i++) html += row(data[i]);
    $tbody.innerHTML = html;
  }

  $q && $q.addEventListener('input', render);
  $filtro && $filtro.addEventListener('change', render);

  document.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    const id = tr.getAttribute('data-id');
    const p = DB.products.get(id);
    if (!p) return;

    if (e.target.matches('[data-inc]')) {
      const inp = tr.querySelector('input.stk');
      inp.value = Math.max(0, Number(inp.value||0) + 1);
    }
    if (e.target.matches('[data-dec]')) {
      const inp = tr.querySelector('input.stk');
      inp.value = Math.max(0, Number(inp.value||0) - 1);
    }
    if (e.target.matches('[data-save]')) {
      const inp = tr.querySelector('input.stk');
      let n = Number(inp.value);
      if (!Number.isFinite(n) || n < 0) { alert('Stock inválido'); return; }
      n = Math.trunc(n);
      const ok = DB.products.update(id, { stock: n });
      if (!ok) return alert('No se pudo guardar.');
      render();
    }
    if (e.target.matches('[data-toggle]')) {
      const ok = DB.products.update(id, { activo: !p.activo });
      if (!ok) return alert('No se pudo cambiar estado.');
      render();
    }
  });

  $btnExport && $btnExport.addEventListener('click', () => {
    const data = applyFilters(getAll(), $q && $q.value, $filtro && $filtro.value);
    if (!data.length) { alert('Nada para exportar.'); return; }
    const rows = [['id','nombre','categoria','precio','stock','activo','imagen']];
    data.forEach(p => rows.push([
      p.id, p.nombre||'', p.categoria||'', Number(p.precio||0), Number(p.stock||0), p.activo ? '1':'0', p.imagen||''
    ]));
    const csv = rows.map(r => r.map(v => {
      const s = String(v);
      return s.includes(',') || /"/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(',')).join('\n');

    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventario.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  window.addEventListener('nx:products-seeded', render);
  window.addEventListener('storage', (e)=> { if (e.key === 'nxv3_products') render(); });

  render();
})();
