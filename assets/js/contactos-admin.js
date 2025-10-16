(function () {
  const $q       = document.getElementById('q');
  const $rows    = document.getElementById('rows');
  const $empty   = document.getElementById('empty');
  const $list    = document.getElementById('listWrap');

  const $viewer  = document.getElementById('viewer');
  const $vMeta   = document.getElementById('vMeta');
  const $vText   = document.getElementById('vText');
  const $vClose  = document.getElementById('vClose');

  const $btnExport = document.getElementById('btnExport');
  const $btnClear  = document.getElementById('btnClear');

  function fmtDate(iso){
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      const hh = String(d.getHours()).padStart(2,'0');
      const mm = String(d.getMinutes()).padStart(2,'0');
      return `${y}-${m}-${day} ${hh}:${mm}`;
    } catch { return iso || ''; }
  }
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function preview(txt){
    const t = (txt||'').trim().replace(/\s+/g,' ');
    return t.length > 80 ? t.slice(0,77)+'…' : t;
  }

  function getAll(){
    try { return DB.messages.list() || []; } catch { return []; }
  }

  function render(filterText){
    const term = (filterText||'').toLowerCase().trim();
    const all = getAll();
    let list = all;
    if (term){
      list = all.filter(m => {
        const blob = [m.nombre||'', m.email||'', m.mensaje||''].join(' ').toLowerCase();
        return blob.includes(term);
      });
    }

    if (!list.length){
      $rows.innerHTML = '';
      $list.classList.add('hidden');
      $empty.classList.remove('hidden');
      return;
    }
    $empty.classList.add('hidden');
    $list.classList.remove('hidden');

    $rows.innerHTML = list.map(m => `
      <tr data-id="${escapeHtml(m.id)}">
        <td>${escapeHtml(fmtDate(m.createdAt))}</td>
        <td>${escapeHtml(m.nombre||'')}</td>
        <td>${escapeHtml(m.email||'')}</td>
        <td class="muted">${escapeHtml(preview(m.mensaje||''))}</td>
        <td class="right">
          <button class="btn" data-view>Ver</button>
          <button class="btn danger" data-del>Eliminar</button>
        </td>
      </tr>
    `).join('');
  }

  document.addEventListener('click', (e)=>{
    const tr = e.target.closest('tr[data-id]');
    if (e.target.matches('#vClose')) {
      $viewer.classList.add('hidden');
      return;
    }
    if (e.target === $btnExport){
      const rows = getAll();
      if (!rows.length) return alert('No hay datos para exportar.');
      const head = ['id','fecha','nombre','email','mensaje'];
      const csv = [head.join(',')].concat(rows.map(r =>
        [r.id, fmtDate(r.createdAt), (r.nombre||'').replace(/,/g,' '), (r.email||'').replace(/,/g,' '), (r.mensaje||'').replace(/\r?\n/g,' ').replace(/,/g,' ')].join(',')
      )).join('\n');
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'contactos.csv';
      document.body.appendChild(a); a.click(); a.remove();
      return;
    }
    if (e.target === $btnClear){
      if (!confirm('¿Vaciar todos los mensajes?')) return;
      try { DB.messages.clear(); } catch {}
      render($q.value);
      return;
    }

    if (!tr) return;
    const id = tr.getAttribute('data-id');

    if (e.target.matches('[data-view]')){
      const m = DB.messages.get(id);
      if (!m) return;
      $vMeta.textContent = `${fmtDate(m.createdAt)} · ${m.nombre} <${m.email}>`;
      $vText.textContent = m.mensaje || '';
      $viewer.classList.remove('hidden');
      return;
    }

    if (e.target.matches('[data-del]')){
      if (!confirm('¿Eliminar este mensaje?')) return;
      try { DB.messages.remove(id); } catch {}
      render($q.value);
      return;
    }
  });

  $q.addEventListener('input', ()=> render($q.value));

  window.addEventListener('nx:msg-added', ()=> render($q.value));

  render('');
})();
