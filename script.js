/* =========================================
   NÚMERO DE WHATSAPP / TELÉFONO
   Cambia solo este valor y se actualiza
   en toda la aplicación automáticamente.
   ========================================= */
const PHONE = "3156349313";

(function () {
  /* ========================================= */
  /* DATOS DEL NEGOCIO — BurgerStreet          */
  /* ========================================= */
  const contact = {
    firstName: "BurgerStreet",
    lastName: "",
    fullName: "BurgerStreet 🍔",
    org: "BurgerStreet — Comida de Otro Nivel",
    title: "Hamburguesas Gourmet & Comida Rápida",
    phone: "+57" + PHONE,
    email: "pedidos@burgerstreet.co",
    website: window.location.origin + "/",
    address: "Carrera 7 #123-45, Bogotá, Colombia",
  };

  /* ── Toast ───────────────────────────────── */
  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ── Build VCard ─────────────────────────── */
  function buildVCard(c) {
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${c.lastName};${c.firstName};;;`,
      `FN:${c.fullName}`,
      `ORG:${c.org}`,
      `TITLE:${c.title}`,
      `TEL;TYPE=CELL,VOICE:${c.phone}`,
      `EMAIL;TYPE=INTERNET:${c.email}`,
      `URL:${c.website}`,
      `ADR;TYPE=WORK:;;${c.address};;;;`,
      "END:VCARD",
    ].join("\r\n");
  }

  /* ── Download VCard ──────────────────────── */
  async function downloadVCard() {
    const vcf = buildVCard(contact);
    const fileName = `BurgerStreet.vcf`;

    let shared = false;
    if (navigator.canShare) {
      try {
        const file = new File([vcf], fileName, { type: "text/vcard" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Guardar BurgerStreet",
          });
          toast("Contacto guardado 🍔");
          shared = true;
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Web Share API falló:", err);
      }
    }

    if (!shared) {
      try {
        const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        toast("Descargado. Revisa tus notificaciones.");
      } catch (e) {
        const vcardModal = document.getElementById("vcardFallbackModal");
        if (vcardModal) vcardModal.classList.add("show");
      }
    }
  }

  /* ── Share card ──────────────────────────── */
  async function shareCard() {
    const shareData = {
      title: "BurgerStreet 🍔",
      text: "¡Descubre BurgerStreet — Hamburguesas Gourmet & Comida de Otro Nivel!",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (_) { /* cancelado */ }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast("Enlace copiado al portapapeles 🔗");
      } catch (_) {
        toast("No se pudo compartir");
      }
    } else {
      toast("Compartir no disponible");
    }
  }

  /* ── Modals setup ────────────────────────── */
  function setupModals() {
    const vcardModal   = document.getElementById("vcardFallbackModal");
    const closeVCard   = document.getElementById("closeVCardModal");
    const copyVCard    = document.getElementById("copyVCardData");
    const iosModal     = document.getElementById("iosInstallModal");
    const closeIos     = document.getElementById("closeIosInstall");

    if (closeVCard) {
      closeVCard.addEventListener("click", () => vcardModal.classList.remove("show"));
    }
    if (copyVCard) {
      copyVCard.addEventListener("click", async () => {
        const text = `Nombre: ${contact.fullName}\nTeléfono: ${contact.phone}\nEmail: ${contact.email}`;
        try {
          await navigator.clipboard.writeText(text);
          toast("Datos copiados 📋");
          vcardModal.classList.remove("show");
        } catch (_) { toast("Error al copiar"); }
      });
    }
    if (closeIos) {
      closeIos.addEventListener("click", () => iosModal.classList.remove("show"));
    }
  }

  /* ── PWA / Service Worker ────────────────── */
  function registerPWA() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./service-worker.js")
          .then(r => console.log("SW registered:", r.scope))
          .catch(e => console.log("SW failed:", e));
      });
    }

    let deferredPrompt;
    const installBtn  = document.getElementById("installAppBtn");
    const iosModal    = document.getElementById("iosInstallModal");
    const isIOS       = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

    if (!installBtn) return;
    if (isStandalone) { installBtn.style.display = "none"; return; }

    if (isIOS) {
      installBtn.addEventListener("click", () => {
        if (iosModal) iosModal.classList.add("show");
      });
    } else {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
      });

      installBtn.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === "accepted") installBtn.style.display = "none";
          deferredPrompt = null;
        } else {
          toast("Usa la opción 'Instalar' del navegador 📲");
        }
      });

      window.addEventListener("appinstalled", () => {
        installBtn.style.display = "none";
        deferredPrompt = null;
      });
    }
  }

  /* ── Init ────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    // Inyectar número en los botones de WhatsApp y llamada
    const waBtn   = document.getElementById("btn-whatsapp");
    const callBtn = document.getElementById("btn-call");
    if (waBtn)   waBtn.href   = `https://wa.me/57${PHONE}?text=Hola%20BurgerStreet%2C%20quiero%20hacer%20un%20pedido%20%F0%9F%8D%94`;
    if (callBtn) callBtn.href = `tel:+57${PHONE}`;

    // Inyectar número formateado en todos los elementos .phone-display y placeholders
    const formatted = `+57 ${PHONE.slice(0,3)} ${PHONE.slice(3,6)} ${PHONE.slice(6)}`;
    document.querySelectorAll(".phone-display").forEach(el => el.textContent = formatted);
    document.querySelectorAll('input[name="telefono"]').forEach(el => {
      if (el.placeholder) el.placeholder = formatted;
    });

    const save  = document.getElementById("saveContact");
    const share = document.getElementById("shareCard");
    if (save)  save.addEventListener("click", downloadVCard);
    if (share) share.addEventListener("click", shareCard);

    setupModals();
    registerPWA();

    /* Contact / suggestion form */
    const form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const origText  = submitBtn.textContent;
        submitBtn.textContent = "Enviando...";
        submitBtn.disabled = true;

        const data  = new FormData(form);
        const name  = data.get("nombre");
        const email = data.get("email");
        const tel   = data.get("telefono") || "No especificado";
        const tipo  = data.get("tipo")     || "Otro";
        const msg   = data.get("mensaje");

        try {
          const response = await fetch("https://formsubmit.co/ajax/davi.gr7@gmail.com", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              _subject: `${tipo.toUpperCase()} de ${name} — BurgerStreet`,
              _template: "table",
              Nombre: name,
              Correo: email,
              Teléfono: tel,
              Tipo: tipo,
              Mensaje: msg,
            }),
          });

          if (response.ok) {
            toast("¡Mensaje enviado! 🍔");
            form.innerHTML = `
              <div style="text-align:center;padding:20px;">
                <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#ff6b1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:14px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h2 style="margin:0 0 10px;font-size:20px;">¡Gracias! 🎉</h2>
                <p style="color:var(--muted);font-size:14px;">Recibimos tu mensaje. Te responderemos pronto.</p>
                <button type="button" onclick="location.reload()" style="margin-top:18px;width:auto;padding:10px 24px;">Volver</button>
              </div>`;
          } else {
            throw new Error("Error en el servidor");
          }
        } catch (err) {
          toast("Error al enviar. Inténtalo de nuevo.");
          submitBtn.textContent = origText;
          submitBtn.disabled = false;
        }
      });
    }
  });
})();
