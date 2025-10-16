(function (w) {
  const LS_KEY = "nxv3_users";

  function _read() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
    catch { return []; }
  }
  function _write(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }

  function _normRUN(s) {
    return String(s || "").replace(/[.\-]/g, "").trim().toUpperCase();
  }

  function list(filterText) {
    const txt = String(filterText || "").toLowerCase().trim();
    const arr = _read();
    if (!txt) return arr;
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const u = arr[i];
      const blob = [
        u.run || "",
        u.nombre || "",
        u.apellidos || "",
        u.correo || ""
      ].join(" ").toLowerCase();
      if (blob.includes(txt)) out.push(u);
    }
    return out;
  }

  function get(run) {
    const key = _normRUN(run);
    const arr = _read();
    for (let i = 0; i < arr.length; i++) {
      if (_normRUN(arr[i].run) === key) return arr[i];
    }
    return null;
  }

  function existsByRun(run) {
    const key = _normRUN(run);
    const arr = _read();
    for (let i = 0; i < arr.length; i++) {
      if (_normRUN(arr[i].run) === key) return true;
    }
    return false;
  }
  function existsByCorreo(correo) {
    const mail = String(correo || "").trim().toLowerCase();
    const arr = _read();
    for (let i = 0; i < arr.length; i++) {
      if (String(arr[i].correo || "").toLowerCase() === mail) return true;
    }
    return false;
  }

  function add(data) {
    const arr = _read();

    const runKey = _normRUN(data.run);
    const mail = String(data.correo || "").trim().toLowerCase();
    for (let i = 0; i < arr.length; i++) {
      const u = arr[i];
      if (_normRUN(u.run) === runKey || String(u.correo || "").toLowerCase() === mail) {
        return false;
      }
    }

    const user = {
      run: runKey,
      nombre: String(data.nombre || ""),
      apellidos: String(data.apellidos || "",
      ),
      correo: mail,
      pass: String(data.pass || ""),
      telefono: String(data.telefono || ""),
      region: String(data.region || ""),
      comuna: String(data.comuna || ""),
      direccion: String(data.direccion || ""),
      createdAt: data.createdAt || Date.now()
    };
    arr.push(user);
    _write(arr);
    return true;
  }

  function update(run, patch) {
    const key = _normRUN(run);
    const arr = _read();
    let idx = -1;
    for (let i = 0; i < arr.length; i++) {
      if (_normRUN(arr[i].run) === key) { idx = i; break; }
    }
    if (idx === -1) return false;

    const curr = arr[idx];

    if (patch && patch.correo != null) {
      const nextMail = String(patch.correo).trim().toLowerCase();
      for (let j = 0; j < arr.length; j++) {
        if (j === idx) continue;
        if (String(arr[j].correo || "").toLowerCase() === nextMail) {
          return false;
        }
      }
    }

    const next = {
      ...curr,
      ...patch,
      run: curr.run,
      correo: patch && patch.correo != null ? String(patch.correo).trim().toLowerCase() : curr.correo,
    };
    arr[idx] = next;
    _write(arr);
    return true;
  }

  function remove(run) {
    const key = _normRUN(run);
    const arr = _read();
    const next = [];
    let removed = false;
    for (let i = 0; i < arr.length; i++) {
      if (_normRUN(arr[i].run) === key) { removed = true; continue; }
      next.push(arr[i]);
    }
    if (removed) _write(next);
    return removed;
  }

  w.DB = w.DB || {};
  w.DB.users = { list, get, add, update, remove, existsByRun, existsByCorreo, _read, _write };
})(window);