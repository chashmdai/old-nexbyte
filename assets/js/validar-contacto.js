(function () {
  const $form = document.getElementById("form-contacto");
  if (!$form) return;

  const $nombre = document.getElementById("c_nombre");
  const $email  = document.getElementById("c_email");
  const $msg    = document.getElementById("c_msg");
  const $ok     = document.getElementById("c_success");

  const EMAIL_RE = /^[^@\s]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

  function err(el, msg){
    el.setCustomValidity(msg || "");
    if (!msg) return;
    el.reportValidity();
  }

  function validate(){
    if (!$nombre.value.trim()) { err($nombre, "Nombre requerido"); return false; }
    if ($nombre.value.trim().length > 100) { err($nombre, "Máximo 100 caracteres"); return false; }
    err($nombre, "");

    const e = $email.value.trim();
    if (!e) { err($email, "Correo requerido"); return false; }
    if (e.length > 100) { err($email, "Máximo 100 caracteres"); return false; }
    if (!EMAIL_RE.test(e)) { err($email, "Dominio no permitido"); return false; }
    err($email, "");

    const m = $msg.value.trim();
    if (!m) { err($msg, "Comentario requerido"); return false; }
    if (m.length > 500) { err($msg, "Máximo 500 caracteres"); return false; }
    err($msg, "");

    return true;
  }

  $form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      window.DB && DB.messages && DB.messages.add({
        nombre: $nombre.value.trim(),
        email:  $email.value.trim().toLowerCase(),
        mensaje:$msg.value.trim()
      });
      $ok.classList.remove("hidden");
      $form.reset();
      setTimeout(()=> $ok.classList.add("hidden"), 2500);
    } catch (e) {
      alert("No se pudo enviar el mensaje. Intenta nuevamente.");
      console.error(e);
    }
  });
})();
