(function (w) {
  const LS_KEY = "nxv3_products";

  function read() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
    catch { return []; }
  }

  function write(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }

  function nextId(list) {
    let max = 0;
    for (let i = 0; i < list.length; i++) {
      const n = parseInt(list[i].id, 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return String(max + 1);
  }

  function list(filterText) {
    const txt = (filterText || "").toLowerCase().trim();
    const arr = read();
    if (!txt) return arr;
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      const s = (String(p.id) + " " + String(p.nombre) + " " + String(p.categoria)).toLowerCase();
      if (s.includes(txt)) out.push(p);
    }
    return out;
  }

  function get(id) {
    const arr = read();
    for (let i = 0; i < arr.length; i++) if (String(arr[i].id) === String(id)) return arr[i];
    return null;
  }

  function add(data) {
    const arr = read();
    const id = nextId(arr);
    const p = {
      id: String(id),
      nombre: data && data.nombre ? String(data.nombre) : "",
      precio: Number(data && data.precio != null ? data.precio : 0),
      stock: Number(data && data.stock != null ? data.stock : 0),
      categoria: data && data.categoria ? String(data.categoria) : "",
      descripcion: data && data.descripcion ? String(data.descripcion) : "",
      activo: data && data.activo === false ? false : true,
      imagen: data && data.imagen ? String(data.imagen) : ""
    };
    arr.push(p);
    write(arr);
    return p;
  }

  function update(id, data) {
    const arr = read();
    let changed = false;
    for (let i = 0; i < arr.length; i++) {
      if (String(arr[i].id) === String(id)) {
        const curr = arr[i];
        arr[i] = {
          id: String(id),
          nombre: data && data.nombre != null ? String(data.nombre) : curr.nombre,
          precio: data && data.precio != null ? Number(data.precio) : curr.precio,
          stock: data && data.stock != null ? Number(data.stock) : curr.stock,
          categoria: data && data.categoria != null ? String(data.categoria) : curr.categoria,
          descripcion: data && data.descripcion != null ? String(data.descripcion) : curr.descripcion,
          activo: data && data.activo != null ? !!data.activo : curr.activo,
          imagen: data && data.imagen != null ? String(data.imagen) : curr.imagen
        };
        changed = true;
        break;
      }
    }
    if (changed) write(arr);
    return changed;
  }

  function remove(id) {
    const arr = read();
    const next = [];
    let removed = false;
    for (let i = 0; i < arr.length; i++) {
      if (String(arr[i].id) === String(id)) { removed = true; continue; }
      next.push(arr[i]);
    }
    if (removed) write(next);
    return removed;
  }

  w.DB = w.DB || {};
  w.DB.products = { list, get, add, update, remove };

  (function seedIfEmpty(){
    try {
      if (read().length) return; 
    } catch(_) {}

    const CANDIDATES = [
      "../assets/data/productos.json", 
      "./assets/data/productos.json",  
      "/assets/data/productos.json"    
    ];

    function fetchFirst(urls){
      return (async () => {
        for (const u of urls) {
          try {
            const res = await fetch(u, { cache: "no-cache" });
            if (res.ok) return await res.json();
          } catch(_) {}
        }
        return null;
      })();
    }

    (async () => {
      let data = await fetchFirst(CANDIDATES);

      if (!Array.isArray(data) || data.length === 0) {
        data = [
          { id: "1", nombre: "Teclado mecánico TKL", categoria: "Teclados", precio: 39990, stock: 12, imagen: "", descripcion: "Switches rojos, 87 teclas, USB-C.", activo: true },
          { id: "2", nombre: "Audífonos over-ear",    categoria: "Audio",    precio: 29990, stock: 8,  imagen: "", descripcion: "Micrófono desmontable, cable 1.8m.", activo: true },
          { id: "3", nombre: "Mouse inalámbrico",     categoria: "Mouse",    precio: 19990, stock: 15, imagen: "", descripcion: "Sensor 12K DPI, 6 botones.",           activo: true },
          { id: "4", nombre: "Pad mouse XL",          categoria: "Accesorios",precio: 9990, stock: 20, imagen: "", descripcion: "800×300 mm, base antideslizante.",      activo: true }
        ];
      }

      const arr = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i] || {};
        arr.push({
          id: String(d.id != null ? d.id : nextId(arr)),
          nombre: d.nombre ? String(d.nombre) : "",
          precio: Number(d.precio != null ? d.precio : 0),
          stock: Number(d.stock != null ? d.stock : 0),
          categoria: d.categoria ? String(d.categoria) : "",
          descripcion: d.descripcion ? String(d.descripcion) : "",
          activo: d.activo === false ? false : true,
          imagen: d.imagen ? String(d.imagen) : ""
        });
      }
      write(arr);

      try { w.dispatchEvent(new CustomEvent("nx:products-seeded")); } catch(_){}
    })();
  })();
})(window);
