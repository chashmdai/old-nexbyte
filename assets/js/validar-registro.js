(function () {
  const LS_USERS = "nxv3_users";
  const ALLOWED_DOMAINS = /(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

  function readUsers() { try { return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); } catch { return []; } }
  function writeUsers(arr) { localStorage.setItem(LS_USERS, JSON.stringify(arr)); }

  function normRUN(s){ return String(s||"").replace(/[.\-]/g,"").trim().toUpperCase(); }
  function isValidRUN(run){
    const r = normRUN(run);
    if (!/^\d{7,8}[0-9K]$/.test(r)) return false;
    const body = r.slice(0,-1), dv = r.slice(-1);
    let sum=0, mul=2;
    for (let i=body.length-1;i>=0;i--){ sum += parseInt(body[i],10)*mul; mul = mul===7?2:mul+1; }
    const rest = 11-(sum%11);
    const dvCalc = rest===11? "0" : rest===10? "K" : String(rest);
    return dv === dvCalc;
  }

  function formatPhone(raw){
    const d = String(raw||"").replace(/\D/g,"");
    if (!d) return "";
    const t = d[0]==="9" ? d : "9"+d;
    const a=t.slice(0,1), b=t.slice(1,5), c=t.slice(5,9);
    return [a,b,c].filter(Boolean).join(" ").trim();
  }

  function setErr(id,msg){ const el=document.getElementById(id); if(el) el.textContent = msg||""; }
  function clearAllErrs(){
    ["err-run","err-nombre","err-apellidos","err-correo","err-pass","err-pass2",
     "err-telefono","err-region","err-comuna","err-direccion"].forEach(k=>setErr(k,""));
  }

  function maybeFillRegions(){
    const $region=document.getElementById("region"), $comuna=document.getElementById("comuna");
    if(!$region||!$comuna) return;
    if ($region.options.length>0 && $comuna.options.length>0) return;
    const data=(window.RegionesYComunas||window.REGIONES||[]);
    if(!Array.isArray(data)||!data.length) return;
    $region.innerHTML = `<option value="">Seleccione…</option>`;
    for(const reg of data){
      const name = reg.NombreRegion||reg.region||reg.nombre||"";
      if(!name) continue;
      const opt=document.createElement("option"); opt.value=opt.textContent=name; $region.appendChild(opt);
    }
    function fillComunas(regName){
      $comuna.innerHTML = `<option value="">Seleccione…</option>`;
      const r = data.find(x => (x.NombreRegion||x.region||x.nombre||"")===regName);
      const comunas = r ? (r.Comunas||r.comunas||r.items||[]) : [];
      for(const c of comunas){
        const nm = c.NombreComuna||c.comuna||c.nombre||c;
        const opt=document.createElement("option"); opt.value=opt.textContent=nm; $comuna.appendChild(opt);
      }
    }
    $region.addEventListener("change",()=>fillComunas($region.value));
    fillComunas("");
  }

  function isAllowedEmail(email){
    if (!email || email.length>100) return false;
    const m = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) return false;
    return ALLOWED_DOMAINS.test(m);
  }

  function init(){
    const $form=document.getElementById("formRegistro");
    if(!$form) return;

    maybeFillRegions();

    const $run=document.getElementById("run");
    const $tel=document.getElementById("telefono");
    const $nombre=document.getElementById("nombre");
    const $apellidos=document.getElementById("apellidos");
    const $correo=document.getElementById("correo");

    // limites duros en inputs
    if ($nombre) $nombre.maxLength = 100;
    if ($apellidos) $apellidos.maxLength = 100;
    if ($correo) $correo.maxLength = 100;

    $run.addEventListener("input",()=>{ $run.value = normRUN($run.value).replace(/[^0-9K]/g,"").slice(0,9); });
    if($tel) $tel.addEventListener("input",()=>{ $tel.value = formatPhone($tel.value).slice(0,11); });

    $form.addEventListener("submit",(e)=>{
      e.preventDefault();
      clearAllErrs();

      const run=normRUN(document.getElementById("run").value);
      const nombre=document.getElementById("nombre").value.trim();
      const apellidos=document.getElementById("apellidos").value.trim();
      const correo=document.getElementById("correo").value.trim().toLowerCase();
      const pass=document.getElementById("pass").value;
      const pass2=document.getElementById("pass2").value;
      const telefono=(document.getElementById("telefono")?.value||"").trim();
      const region=document.getElementById("region").value.trim();
      const comuna=document.getElementById("comuna").value.trim();
      const direccion=document.getElementById("direccion").value.trim();

      let ok=true;

      if(!isValidRUN(run)){ setErr("err-run","RUN inválido."); ok=false; }
      if(nombre.length<2 || nombre.length>100){ setErr("err-nombre","Entre 2 y 100 caracteres."); ok=false; }
      if(apellidos.length<2 || apellidos.length>100){ setErr("err-apellidos","Entre 2 y 100 caracteres."); ok=false; }
      if(!isAllowedEmail(correo)){ setErr("err-correo","Correo inválido o dominio no permitido (duoc.cl, profesor.duoc.cl, gmail.com)."); ok=false; }
      if(pass.length<4 || pass.length>10){ setErr("err-pass","Entre 4 y 10 caracteres."); ok=false; }
      if(pass!==pass2){ setErr("err-pass2","Las contraseñas no coinciden."); ok=false; }
      if(telefono && !/^9\d{4}\s\d{4}$/.test(telefono)){ setErr("err-telefono","Formato: 9 XXXX XXXX."); ok=false; }
      if(!region){ setErr("err-region","Selecciona una región."); ok=false; }
      if(!comuna){ setErr("err-comuna","Selecciona una comuna."); ok=false; }
      if(direccion.length<3){ setErr("err-direccion","Dirección demasiado corta."); ok=false; }

      const users=readUsers();
      if(users.some(u=>u.run===run)){ setErr("err-run","Este RUN ya está registrado."); ok=false; }
      if(users.some(u=>u.correo===correo)){ setErr("err-correo","Este correo ya está registrado."); ok=false; }

      if(!ok) return;

      const user={ run, nombre, apellidos, correo, pass, telefono, region, comuna, direccion, createdAt:Date.now() };
      users.push(user); writeUsers(users);
      location.href="./login.html";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
