/* =========================================================================
   ENCUESTA DE CALIDAD DE VIDA - LA CEJA DEL TAMBO 2026
   Lógica de la aplicación (vanilla JS, sin dependencias de build).
   ========================================================================= */

/* --------------------------------------------------------------------
   1) CONFIGURACIÓN — reemplace estos valores por los de su proyecto
      de Supabase antes de publicar la encuesta. Ver INSTRUCCIONES.md
   -------------------------------------------------------------------- */
const CONFIG = {
  SUPABASE_URL: "https://mfbddcmdhmqopbsoktyr.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYmRkY21kaG1xb3Bic29rdHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDEwNjgsImV4cCI6MjA5ODU3NzA2OH0.yt1GvDZjzyRQwXOsvFIMOfPwH9xPc3YDvh0mD9ohNbE",
  TABLE: "encuesta_calidad_vida_2026",
  // Ruta opcional a la imagen oficial del escudo de La Ceja del Tambo.
  // Si existe, reemplaza el ícono genérico del encabezado.
  ESCUDO_URL: "escudo-la-ceja.png"
};

/* --------------------------------------------------------------------
   2) ESTADO
   -------------------------------------------------------------------- */
const state = {
  step: -1,              // -1 = pantalla de bienvenida/consentimiento
  respuestas: {},         // { qid: valor | [valores] }
  otros: {},              // { qid: texto libre de "Otro" }
  comentario: "",          // comentario final opcional
  consentido: false,
  enviando: false,
};

const TOTAL_PASOS = ENCUESTA_SECCIONES.length;
const PASO_COMENTARIO = TOTAL_PASOS;
const PASO_FINAL = TOTAL_PASOS + 1;

/* --------------------------------------------------------------------
   3) UTILIDADES DE CONDICIÓN / VISIBILIDAD
   -------------------------------------------------------------------- */
function preguntaVisible(p) {
  if (!p.condition) return true;
  const val = state.respuestas[p.condition.q];
  if (p.condition.equals !== undefined) return val === p.condition.equals;
  if (p.condition.in) return Array.isArray(val) ? val.some(v=>p.condition.in.includes(v)) : p.condition.in.includes(val);
  return true;
}

function todasLasPreguntasDeSeccion(seccion) {
  return seccion.preguntas.filter(preguntaVisible);
}

function seccionCompleta(seccion) {
  return todasLasPreguntasDeSeccion(seccion).every(p => {
    if (p.required === false) return true;
    const val = state.respuestas[p.id];
    if (p.type === "multi") return Array.isArray(val) && val.length > 0;
    return val !== undefined && val !== null && val !== "";
  });
}

/* --------------------------------------------------------------------
   4) RENDER PRINCIPAL
   -------------------------------------------------------------------- */
function render(scrollTop = true) {
  const main = document.getElementById("main");
  main.innerHTML = "";
  actualizarBarraProgreso();

  if (state.step === -1) {
    main.appendChild(renderIntro());
    navBar("intro");
  } else if (state.step === PASO_COMENTARIO) {
    main.appendChild(renderComentario());
    navBar("comentario");
  } else if (state.step === PASO_FINAL) {
    main.appendChild(renderFinal());
    navBar("final");
  } else {
    main.appendChild(renderSeccion(ENCUESTA_SECCIONES[state.step]));
    navBar("seccion");
  }
  if (scrollTop) window.scrollTo({top:0, behavior:"smooth"});
}

function actualizarBarraProgreso() {
  const fill = document.getElementById("progressFill");
  let pct = 0;
  if (state.step === -1) pct = 0;
  else if (state.step >= PASO_FINAL) pct = 100;
  else if (state.step === PASO_COMENTARIO) pct = 96;
  else pct = Math.round(((state.step) / TOTAL_PASOS) * 100) + 4;
  fill.style.width = pct + "%";
}

/* --------------------------------------------------------------------
   5) PANTALLA DE BIENVENIDA Y CONSENTIMIENTO (Ley de datos personales)
   -------------------------------------------------------------------- */
function renderIntro() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="intro-card">
      <div class="flor">🌸</div>
      <h2>Encuesta de Calidad de Vida</h2>
      <p>Municipio de La Ceja del Tambo, Antioquia · 2026</p>

      <div class="dato-box">
        Sus respuestas alimentan el <strong>Observatorio Municipal</strong> y orientan las
        decisiones de planeación territorial. La encuesta toma entre 8 y 12 minutos y
        está organizada por temas (dimensiones) para que sea más fácil de responder.
      </div>

      <div class="legal-box">
        <h3>🔒 Aviso de tratamiento de datos personales</h3>
        <p>En cumplimiento de la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>
        sobre protección de datos personales en Colombia, le informamos que:</p>
        <ul>
          <li>La información recolectada es de carácter <strong>voluntario, anónimo y confidencial</strong>.</li>
          <li>Será usada <strong>exclusivamente con fines estadísticos</strong> y de planeación pública por parte
              de la Alcaldía de La Ceja del Tambo.</li>
          <li>Los resultados se presentarán de forma <strong>agregada</strong>; ningún reporte identificará
              a una persona en particular.</li>
          <li>Usted puede ejercer en cualquier momento sus derechos de conocer, actualizar, rectificar
              o solicitar la eliminación de su información (habeas data), escribiendo al correo de
              contacto del Observatorio Municipal.</li>
          <li>Al continuar y dar inicio a la encuesta, usted <strong>autoriza libre y voluntariamente</strong>
              el tratamiento de los datos suministrados conforme a lo aquí descrito.</li>
        </ul>
      </div>

      <label class="consent-check" id="consentCheck">
        <input type="checkbox" id="consentInput">
        <span>He leído el aviso de tratamiento de datos personales y autorizo el uso de mi
        información con fines estadísticos, de forma voluntaria y anónima.</span>
      </label>
    </div>
  `;

  const checkbox = wrap.querySelector("#consentInput");
  const checkBox = wrap.querySelector("#consentCheck");
  checkbox.addEventListener("change", () => {
    state.consentido = checkbox.checked;
    checkBox.classList.toggle("checked", checkbox.checked);
    navBar("intro");
  });

  return wrap;
}

/* --------------------------------------------------------------------
   6) RENDER DE UNA SECCIÓN (DIMENSIÓN)
   -------------------------------------------------------------------- */
function renderSeccion(seccion) {
  const wrap = document.createElement("div");

  const header = document.createElement("div");
  header.className = "dim-header";
  header.innerHTML = `
    <div class="dim-badge">${seccion.numero}</div>
    <div>
      <div class="dim-sub">${seccion.subtitulo}</div>
      <h2>${seccion.titulo}</h2>
    </div>`;
  wrap.appendChild(header);

  todasLasPreguntasDeSeccion(seccion).forEach(p => {
    wrap.appendChild(renderPregunta(p));
  });

  return wrap;
}

/* --------------------------------------------------------------------
   7) RENDER DE UNA PREGUNTA
   -------------------------------------------------------------------- */
function renderPregunta(p) {
  const card = document.createElement("div");
  card.className = "q-card";
  card.dataset.qid = p.id;

  const reqMark = p.required === false ? "" : `<span class="req">*</span>`;
  const helpHtml = p.help ? `<div class="q-help">${p.help}</div>` : "";

  if (p.grid === "select") {
    card.innerHTML = `
      <div class="q-text">${p.text} ${reqMark}</div>
      ${helpHtml}
      <select class="q-select">
        <option value="" disabled ${state.respuestas[p.id] ? "" : "selected"}>Seleccione una opción…</option>
        ${p.options.map(opt => `<option value="${opt}" ${state.respuestas[p.id]===opt?"selected":""}>${opt}</option>`).join("")}
      </select>
      <input type="text" class="other-input" placeholder="Por favor especifique...">
      <div class="alert-missing">Esta pregunta es obligatoria.</div>
    `;
    const select = card.querySelector(".q-select");
    const otherInput = card.querySelector(".other-input");
    select.addEventListener("change", () => {
      state.respuestas[p.id] = select.value;
      limpiarDependientes(p.id);
      if (p.otherTrigger) {
        otherInput.classList.toggle("show", select.value === p.otherTrigger);
      }
      sincronizarSeccion();
    });
    if (p.otherTrigger) {
      otherInput.classList.toggle("show", state.respuestas[p.id] === p.otherTrigger);
      otherInput.value = state.otros[p.id] || "";
      otherInput.addEventListener("input", () => { state.otros[p.id] = otherInput.value; });
    }
    return card;
  }

  card.innerHTML = `
    <div class="q-text">${p.text} ${reqMark}</div>
    ${helpHtml}
    <div class="options ${p.grid === "scale" ? "opt-grid scale" : ""} ${p.grid === "scale3" ? "opt-grid scale" : ""} ${p.grid === "num" ? "opt-grid numgrid" : ""}"></div>
    <input type="text" class="other-input" placeholder="Por favor especifique...">
    <div class="alert-missing">Esta pregunta es obligatoria.</div>
  `;

  const optsBox = card.querySelector(".options");
  const otherInput = card.querySelector(".other-input");

  p.options.forEach(opt => {
    const chip = document.createElement("div");
    chip.className = "opt-chip" + (p.type === "multi" ? " multi" : "");
    chip.textContent = opt;
    chip.dataset.value = opt;

    const current = state.respuestas[p.id];
    const isSelected = p.type === "multi"
      ? Array.isArray(current) && current.includes(opt)
      : current === opt;
    chip.classList.toggle("selected", isSelected);

    chip.addEventListener("click", () => onOptionClick(p, opt, card));
    optsBox.appendChild(chip);
  });

  if (p.otherTrigger) {
    const yaSeleccionado = p.type === "multi"
      ? Array.isArray(state.respuestas[p.id]) && state.respuestas[p.id].includes(p.otherTrigger)
      : state.respuestas[p.id] === p.otherTrigger;
    otherInput.classList.toggle("show", yaSeleccionado);
    otherInput.value = state.otros[p.id] || "";
    otherInput.addEventListener("input", () => { state.otros[p.id] = otherInput.value; });
  }

  return card;
}

function onOptionClick(p, opt, card) {
  if (p.type === "single") {
    state.respuestas[p.id] = opt;
  } else {
    let arr = Array.isArray(state.respuestas[p.id]) ? [...state.respuestas[p.id]] : [];
    const exclusivas = p.exclusive || [];
    if (arr.includes(opt)) {
      arr = arr.filter(v => v !== opt);
    } else {
      if (exclusivas.includes(opt)) {
        arr = [opt];
      } else {
        arr = arr.filter(v => !exclusivas.includes(v));
        arr.push(opt);
      }
    }
    state.respuestas[p.id] = arr;
  }

  // Si la pregunta condiciona la visibilidad de otras, limpiamos respuestas
  // de preguntas hijas que ya no apliquen.
  limpiarDependientes(p.id);

  // Actualización quirúrgica: solo se tocan las tarjetas que cambiaron,
  // sin reconstruir toda la sección (evita cualquier parpadeo visual).
  sincronizarSeccion();
}

/* --------------------------------------------------------------------
   7.1) SINCRONIZACIÓN QUIRÚRGICA DE LA SECCIÓN ACTUAL
   En vez de destruir y volver a crear todas las tarjetas de la sección
   en cada clic (lo que producía un parpadeo visible), esta función:
     - actualiza en el sitio el estado visual (chips seleccionados,
       campo "otro") de las tarjetas que ya existen en el DOM,
     - inserta las tarjetas de preguntas condicionales que se acaban
       de habilitar,
     - retira las tarjetas de preguntas que dejaron de aplicar.
   -------------------------------------------------------------------- */
function sincronizarSeccion() {
  const seccion = ENCUESTA_SECCIONES[state.step];
  if (!seccion) { render(false); return; }

  const visibles = todasLasPreguntasDeSeccion(seccion);
  const visibleIds = visibles.map(p => p.id);

  // Quitar tarjetas de preguntas que ya no aplican
  document.querySelectorAll(".q-card").forEach(el => {
    if (!visibleIds.includes(el.dataset.qid)) el.remove();
  });

  // Insertar o actualizar cada pregunta visible, en el orden correcto
  let anchor = document.querySelector(".dim-header");
  visibles.forEach(p => {
    let el = document.querySelector(`.q-card[data-qid="${p.id}"]`);
    if (!el) {
      el = renderPregunta(p);
    } else {
      actualizarEstadoTarjeta(el, p);
    }
    if (anchor.nextElementSibling !== el) anchor.after(el);
    anchor = el;
  });
}

function actualizarEstadoTarjeta(card, p) {
  const current = state.respuestas[p.id];

  if (p.grid === "select") {
    const select = card.querySelector(".q-select");
    if (select && select.value !== (current || "")) select.value = current || "";
  } else {
    card.querySelectorAll(".opt-chip").forEach(chip => {
      const val = chip.dataset.value;
      const isSelected = p.type === "multi"
        ? Array.isArray(current) && current.includes(val)
        : current === val;
      chip.classList.toggle("selected", isSelected);
    });
  }

  if (p.otherTrigger) {
    const otherInput = card.querySelector(".other-input");
    const show = p.type === "multi"
      ? Array.isArray(current) && current.includes(p.otherTrigger)
      : current === p.otherTrigger;
    otherInput.classList.toggle("show", show);
  }

  const alerta = card.querySelector(".alert-missing");
  if (alerta) alerta.classList.remove("show");
}

function limpiarDependientes(qid) {
  ENCUESTA_SECCIONES.forEach(s => {
    s.preguntas.forEach(p => {
      if (p.condition && p.condition.q === qid && !preguntaVisible(p)) {
        delete state.respuestas[p.id];
        delete state.otros[p.id];
      }
    });
  });
}

/* --------------------------------------------------------------------
   8) BARRA DE NAVEGACIÓN INFERIOR
   -------------------------------------------------------------------- */
function navBar(modo="seccion") {
  let bar = document.querySelector(".nav-bar");
  if (bar) bar.remove();
  bar = document.createElement("div");
  bar.className = "nav-bar";

  if (modo === "intro") {
    bar.innerHTML = `<div></div><button class="btn btn-primary" id="btnIniciar" ${state.consentido ? "" : "disabled"}>Iniciar encuesta →</button>`;
    document.getElementById("main").appendChild(bar);
    document.getElementById("btnIniciar").addEventListener("click", () => {
      if (!state.consentido) return;
      state.step = 0;
      render();
    });
    return;
  }

  if (modo === "final") {
    document.getElementById("main").appendChild(bar);
    return;
  }

  if (modo === "comentario") {
    bar.innerHTML = `
      <button class="btn btn-ghost" id="btnAtras">← Atrás</button>
      <button class="btn btn-primary" id="btnSig">Enviar respuestas ✓</button>
    `;
    document.getElementById("main").appendChild(bar);
    document.getElementById("btnAtras").addEventListener("click", () => {
      state.step = TOTAL_PASOS - 1;
      render();
    });
    document.getElementById("btnSig").addEventListener("click", () => enviarRespuestas());
    return;
  }

  // modo === "seccion"
  const esPrimera = state.step === 0;

  bar.innerHTML = `
    <button class="btn btn-ghost" id="btnAtras" ${esPrimera ? "disabled" : ""}>← Atrás</button>
    <button class="btn btn-primary" id="btnSig">Siguiente →</button>
  `;
  document.getElementById("main").appendChild(bar);

  document.getElementById("btnAtras").addEventListener("click", () => {
    state.step = Math.max(0, state.step - 1);
    render();
  });
  document.getElementById("btnSig").addEventListener("click", () => onSiguiente());
}

function onSiguiente() {
  const seccion = ENCUESTA_SECCIONES[state.step];
  if (!seccionCompleta(seccion)) {
    marcarFaltantes(seccion);
    return;
  }
  state.step += 1; // TOTAL_PASOS-1 -> PASO_COMENTARIO automáticamente
  render();
}

function marcarFaltantes(seccion) {
  let primero = null;
  todasLasPreguntasDeSeccion(seccion).forEach(p => {
    if (p.required === false) return;
    const val = state.respuestas[p.id];
    const vacio = p.type === "multi" ? !(Array.isArray(val) && val.length) : (val === undefined || val === "");
    const card = document.querySelector(`.q-card[data-qid="${p.id}"]`);
    if (!card) return;
    const alerta = card.querySelector(".alert-missing");
    alerta.classList.toggle("show", vacio);
    if (vacio && !primero) primero = card;
  });
  if (primero) primero.scrollIntoView({behavior:"smooth", block:"center"});
}

/* --------------------------------------------------------------------
   8.1) PANTALLA DE COMENTARIO ADICIONAL (OPCIONAL)
   -------------------------------------------------------------------- */
function renderComentario() {
  const wrap = document.createElement("div");

  const header = document.createElement("div");
  header.className = "dim-header";
  header.innerHTML = `
    <div class="dim-badge">✎</div>
    <div>
      <div class="dim-sub">Antes de terminar</div>
      <h2>¿Algo más que quiera contarnos?</h2>
    </div>`;
  wrap.appendChild(header);

  const card = document.createElement("div");
  card.className = "q-card";
  card.innerHTML = `
    <div class="q-text">Comentario u observación adicional</div>
    <div class="q-help">Este espacio es opcional. Puede compartir alguna situación, sugerencia
      o inquietud que no haya quedado reflejada en las preguntas anteriores.</div>
    <textarea class="other-input show" style="min-height:110px;resize:vertical;"
      placeholder="Escriba aquí su comentario (opcional)..."></textarea>
  `;
  const textarea = card.querySelector("textarea");
  textarea.value = state.comentario || "";
  textarea.addEventListener("input", () => { state.comentario = textarea.value; });
  wrap.appendChild(card);

  return wrap;
}

/* --------------------------------------------------------------------
   9) PANTALLA FINAL
   -------------------------------------------------------------------- */
function renderFinal() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="final-card">
      <div class="check">🌼</div>
      <h2>¡Gracias por participar!</h2>
      <p>Su respuesta fue registrada correctamente y será parte del análisis de calidad de
      vida del municipio de La Ceja del Tambo. Su aporte ayuda a construir un municipio mejor
      para todos.</p>
    </div>`;
  return wrap;
}

/* --------------------------------------------------------------------
   10) ENVÍO DE RESPUESTAS A SUPABASE (con respaldo local si falla)
   -------------------------------------------------------------------- */
async function enviarRespuestas() {
  if (state.enviando) return;
  state.enviando = true;

  const payload = construirPayload();

  const supabaseConfigurado = CONFIG.SUPABASE_URL.indexOf("TU-PROYECTO") === -1;

  if (supabaseConfigurado) {
    try {
      const resp = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${CONFIG.TABLE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": CONFIG.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify([{ respuestas: payload, dispositivo: navigator.userAgent }])
      });
      if (!resp.ok) throw new Error("Error HTTP " + resp.status);
    } catch (err) {
      console.error("No se pudo enviar a Supabase, se guarda copia local:", err);
      guardarRespaldoLocal(payload);
    }
  } else {
    console.warn("CONFIG.SUPABASE_URL no está configurado todavía. Guardando solo copia local.");
    guardarRespaldoLocal(payload);
  }

  state.step = PASO_FINAL;
  state.enviando = false;
  render();
}

function construirPayload() {
  const out = {};
  ENCUESTA_SECCIONES.forEach(s => {
    s.preguntas.forEach(p => {
      if (!preguntaVisible(p)) return;
      let val = state.respuestas[p.id];
      if (val === undefined) return;
      if (p.otherTrigger) {
        const tieneOtro = p.type === "multi" ? (Array.isArray(val) && val.includes(p.otherTrigger)) : val === p.otherTrigger;
        if (tieneOtro && state.otros[p.id]) {
          val = p.type === "multi" ? [...val, `Otro: ${state.otros[p.id]}`] : `Otro: ${state.otros[p.id]}`;
        }
      }
      out[p.id] = val;
    });
  });
  if (state.comentario && state.comentario.trim()) {
    out.comentario_adicional = state.comentario.trim();
  }
  out._enviado_en = new Date().toISOString();
  return out;
}

function guardarRespaldoLocal(payload) {
  try {
    const key = "encuesta_calidad_vida_2026_respaldo";
    const actuales = JSON.parse(localStorage.getItem(key) || "[]");
    actuales.push(payload);
    localStorage.setItem(key, JSON.stringify(actuales));
  } catch (e) {
    console.error("No se pudo guardar el respaldo local:", e);
  }
}

/* --------------------------------------------------------------------
   11) ESCUDO MUNICIPAL (si existe el archivo configurado, lo usa)
   -------------------------------------------------------------------- */
function intentarCargarEscudo() {
  if (!CONFIG.ESCUDO_URL) return;
  const img = new Image();
  img.onload = () => {
    const box = document.getElementById("escudoBox");
    box.innerHTML = "";
    const tag = document.createElement("img");
    tag.src = CONFIG.ESCUDO_URL;
    tag.alt = "Escudo de La Ceja del Tambo";
    box.appendChild(tag);
  };
  img.onerror = () => {}; // se conserva el ícono genérico
  img.src = CONFIG.ESCUDO_URL;
}

/* --------------------------------------------------------------------
   12) INICIO
   -------------------------------------------------------------------- */
intentarCargarEscudo();
render();
