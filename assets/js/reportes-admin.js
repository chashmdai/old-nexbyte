(function () {
  const CLP = new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });

  const $genAt   = document.getElementById('genAt');
  const $k_total = document.getElementById('k_total');
  const $k_act   = document.getElementById('k_activos');
  const $k_zero  = document.getElementById('k_zero');
  const $k_units = document.getElementById('k_units');
  const $k_value = document.getElementById('k_value');
  const $k_cats  = document.getElementById('k_cats');
  const $tbCats  = document.getElementById('tbCats');
  const $tbLow   = document.getElementById('tbLow');
  const $btnCat  = document.getElementById('btnCatCsv');
  const $btnProd = document.getElementById('btnProdCsv');
  if (!$tbCats || !$tbLow) return;

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function thumb(p){
    if (p.imagen) return `<img src="${escapeHtml(p.imagen)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'">`;
    return `<div class="muted" style="width:64px;height:64px;border:1px solid #e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center">—</div>`;
  }

  function getAll(){
    try { return (window.DB && DB.products && DB.products.list) ? DB.products.list() : []; }
    catch { return []; }
  }

  function summarize(){
    const all = getAll();
    const total   = all.length;
    const activos = all.filter(p => !!p.activo).length;
    const zero    = all.filter(p => Number(p.stock||0) === 0).length;
    const units   = all.reduce((s,p)=> s + Number(p.stock||0), 0);
    const value   = all.reduce((s,p)=> s + Number(p.stock||0) * Number(p.precio||0), 0);

    const catMap = {};
    for (let i=0;i<all.length;i++){
      const c = all[i].categoria || 'Sin categoría';
      if (!catMap[c]) catMap[c] = { cat: c, productos:0, stock:0, valor:0 };
      catMap[c].productos++;
      catMap[c].stock += Number(all[i].stock||0);
      catMap[c].valor += Number(all[i].stock||0) * Number(all[i].precio||0);
    }
    const cats = Object.values(catMap).sort((a,b)=> a.cat.localeCompare(b.cat));

    const low = all.filter(p => Number(p.stock||0) > 0)
                   .sort((a,b)=> Number(a.stock||0) - Number(b.stock||0))
                   .slice(0,5);

    return { all, total, activos, zero, units, value, cats, low };
  }

  function render(){
    const now = new Date();
    $genAt && ($genAt.textContent = 'Generado: ' + now.toLocaleString());

    const { total, activos, zero, units, value, cats, low, all } = summarize();

    $k_total && ($k_total.textContent = String(total));
    $k_act   && ($k_act.textContent   = String(activos));
    $k_zero  && ($k_zero.textContent  = String(zero));
    $k_units && ($k_units.textContent = String(units));
    $k_value && ($k_value.textContent = CLP.format(value));
    $k_cats  && ($k_cats.textContent  = String(cats.length));

    let htmlCats = '';
    for (let i=0;i<cats.length;i++){
      const r = cats[i];
      htmlCats += `
        <tr>
          <td>${escapeHtml(r.cat)}</td>
          <td>${r.productos}</td>
          <td>${r.stock}</td>
          <td>${CLP.format(r.valor)}</td>
        </tr>`;
    }
    $tbCats.innerHTML = htmlCats || '<tr><td colspan="4" class="muted">Sin datos</td></tr>';

    let htmlLow = '';
    for (let i=0;i<low.length;i++){
      const p = low[i];
      htmlLow += `
        <tr>
          <td>${thumb(p)}</td>
          <td>
            <div style="font-weight:600">${escapeHtml(p.nombre||'')}</div>
            <div class="muted" style="font-size:.9rem">#${escapeHtml(String(p.id||''))}</div>
          </td>
          <td>${escapeHtml(p.categoria||'—')}</td>
          <td>${CLP.format(Number(p.precio||0))}</td>
          <td>${Number(p.stock||0)}</td>
        </tr>`;
    }
    $tbLow.innerHTML = htmlLow || '<tr><td colspan="5" class="muted">Sin datos</td></tr>';

    $btnCat && ($btnCat.onclick = () => exportCats(cats));
    $btnProd && ($btnProd.onclick = () => exportProds(all));
  }

  function saveCsv(rows, name){
    const csv = rows.map(r => r.map(v => {
      const s = String(v);
      return s.includes(',') || /"/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function exportCats(cats){
    if (!cats || !cats.length) { alert('Nada para exportar.'); return; }
    const rows = [['categoria','productos','stock_total','valor_inventario']];
    cats.forEach(c => rows.push([c.cat, c.productos, c.stock, c.valor]));
    saveCsv(rows, 'categorias.csv');
  }
  function exportProds(all){
    if (!all || !all.length) { alert('Nada para exportar.'); return; }
    const rows = [['id','nombre','categoria','precio','stock','activo','imagen']];
    all.forEach(p => rows.push([p.id, p.nombre||'', p.categoria||'', Number(p.precio||0), Number(p.stock||0), p.activo ? '1':'0', p.imagen||'']));
    saveCsv(rows, 'productos.csv');
  }

  window.addEventListener('nx:products-seeded', render);
  window.addEventListener('storage', (e)=> { if (e.key === 'nxv3_products') render(); });

  render();
})();
