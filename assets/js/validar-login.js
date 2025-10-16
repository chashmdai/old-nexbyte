(function () {
  const LS_USERS="nxv3_users", LS_AUTH="nxv3_auth";
  const ALLOWED_DOMAINS = /(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

  function readUsers(){ try{ return JSON.parse(localStorage.getItem(LS_USERS)||"[]"); }catch{ return []; } }
  function saveAuth(user){ localStorage.setItem(LS_AUTH, JSON.stringify({correo:user.correo, run:user.run, nombre:user.nombre, ts:Date.now()})); }

  function emailOk(s){
    if (!s || s.length>100) return false;
    const m = s.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) return false;
    return ALLOWED_DOMAINS.test(m);
  }

  document.getElementById("formLogin").addEventListener("submit",(e)=>{
    e.preventDefault();
    const correo=document.getElementById("correo").value.trim().toLowerCase();
    const pass=document.getElementById("pass").value;
    const errC=document.getElementById("err-correo");
    const errP=document.getElementById("err-pass");
    const errG=document.getElementById("err-general");
    errC.textContent=errP.textContent=errG.textContent="";

    if(!emailOk(correo)){ errC.textContent="Solo se permite @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100)."; return; }
    if(pass.length<4 || pass.length>10){ errP.textContent="Contraseña 4 a 10 caracteres."; return; }

    const u = readUsers().find(x=>x.correo===correo);
    if(!u || u.pass!==pass){ errG.textContent="Correo o contraseña incorrectos."; return; }

    saveAuth(u);
    location.href="./productos.html";
  });
})();
