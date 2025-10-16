(function (w) {
  const LS_KEY = "nxv3_msgs";
  const DB = w.DB || (w.DB = {});

  function read(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
  function write(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
  function nextId(arr){
    let max = 0;
    for (let i=0;i<arr.length;i++){ const n = parseInt(arr[i].id,10); if (!isNaN(n) && n>max) max = n; }
    return String(max+1);
  }
  function sanitize(m){
    return {
      id: String(m.id),
      nombre: String(m.nombre||"").trim(),
      email: String(m.email||"").trim(),
      mensaje: String(m.mensaje||"").trim(),
      createdAt: m.createdAt || new Date().toISOString(),
      estado: m.estado || "nuevo"
    };
  }

  const API = {
    list(){ return read().slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)); },
    get(id){ const arr=read(); return arr.find(x=>String(x.id)===String(id))||null; },
    add(data){
      const arr = read();
      const rec = sanitize({ ...data, id: nextId(arr) });
      arr.push(rec); write(arr);
      try { w.dispatchEvent(new CustomEvent("nx:msg-added", { detail: rec })); } catch {}
      return rec.id;
    },
    remove(id){
      let arr = read(); const before = arr.length;
      arr = arr.filter(x => String(x.id) !== String(id)); write(arr);
      return arr.length < before;
    },
    clear(){ write([]); }
  };

  DB.messages = API;
})(window);
