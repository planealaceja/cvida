/* =========================================================================
   PANEL DE RESULTADOS  - ENCUESTA DE CALIDAD DE VIDA LA CEJA DEL TAMBO 2026
   ========================================================================= */

const ADMIN_CONFIG = {
  SUPABASE_URL: "https://mfbddcmdhmqopbsoktyr.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYmRkY21kaG1xb3Bic29rdHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDEwNjgsImV4cCI6MjA5ODU3NzA2OH0.yt1GvDZjzyRQwXOsvFIMOfPwH9xPc3YDvh0mD9ohNbE",
  TABLE: "encuesta_calidad_vida_2026",
};

let supabaseClient = null;
let TODOS_LOS_REGISTROS = [];
let CHARTS = [];
let EDITANDO_ID = null;

const PALETA = ["#16385F","#3C6E9F","#3E8E5C","#7FD89B","#C99A2E","#C0392B","#8E5BA8","#5B6B76","#2E86AB","#E07A5F"];

function initSupabase() {
  if (ADMIN_CONFIG.SUPABASE_URL.indexOf("TU-PROYECTO") !== -1) {
    document.getElementById("loginError").textContent =
      "El panel aún no está conectado a Supabase. Configure ADMIN_CONFIG en admin-app.js (ver INSTRUCCIONES-IMPLEMENTACION.md).";
    document.getElementById("loginError").classList.add("show");
    return false;
  }
  supabaseClient = supabase.createClient(ADMIN_CONFIG.SUPABASE_URL, ADMIN_CONFIG.SUPABASE_ANON_KEY);
  return true;
}

/* ---------------- LOGIN ---------------- */
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  const errBox = document.getElementById("loginError");
  errBox.classList.remove("show");

  if (!initSupabase()) return;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
  if (error) {
    errBox.textContent = "No fue posible iniciar sesión: " + error.message;
    errBox.classList.add("show");
    return;
  }
  mostrarDashboard();
});

async function mostrarDashboard() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  poblarFiltroDimensiones();
  poblarFiltroUbicacion();
  await cargarDatos();
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  location.reload();
});
document.getElementById("refreshBtn").addEventListener("click", cargarDatos);
document.getElementById("filterDim").addEventListener("change", renderTodo);
document.getElementById("filterYear").addEventListener("change", alCambiarFiltrosDeAlcance);
document.getElementById("filterLoc").addEventListener("change", alCambiarFiltrosDeAlcance);
document.getElementById("exportCsvBtn").addEventListener("click", exportarCSV);
document.getElementById("exportXlsxBtn").addEventListener("click", exportarXLSX);

// El año y el sector acotan qué registros se ven en todo el panel (gráficos,
// KPIs, tabla de registros individuales y exportaciones), así que al cambiar
// cualquiera de los dos hay que refrescar tanto las estadísticas como la tabla.
function alCambiarFiltrosDeAlcance() {
  renderTodo();
  renderTablaRegistros();
}

// Si ya hay sesión activa (token guardado por supabase-js), entrar directo
window.addEventListener("DOMContentLoaded", async () => {
  if (!initSupabase()) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) mostrarDashboard();
});

/* ---------------- PESTAÑAS ---------------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "panelRegistros") renderTablaRegistros();
  });
});

/* ---------------- CARGA DE DATOS ---------------- */
async function cargarDatos() {
  document.getElementById("content").innerHTML = `<div class="loading">Cargando respuestas…</div>`;
  const { data, error } = await supabaseClient
    .from(ADMIN_CONFIG.TABLE)
    .select("id, created_at, anio, respuestas")
    .order("created_at", { ascending: false });

  if (error) {
    document.getElementById("content").innerHTML =
      `<div class="empty-state">No se pudieron cargar los datos: ${error.message}</div>`;
    return;
  }
  TODOS_LOS_REGISTROS = data || [];
   poblarFiltroAnios();
  poblarFiltroUbicacion();
  renderTodo();
  renderTablaRegistros();
}

function poblarFiltroDimensiones() {
  const sel = document.getElementById("filterDim");
  sel.innerHTML = `<option value="all">Todas las dimensiones</option>` +
    ENCUESTA_SECCIONES.map(s => `<option value="${s.id}">${s.titulo}</option>`).join("");
}

function poblarFiltroAnios() {
  const sel = document.getElementById("filterYear");
  const valorPrevio = sel.value;

  const anios = [...new Set(
    TODOS_LOS_REGISTROS
      .map(r => r.anio)
      .filter(a => a != null)
  )];

  // Más reciente primero: así, cuando llegue 2027 (o cualquier año nuevo),
  // aparecerá arriba del todo sin tener que tocar el código.
  anios.sort((a, b) => b - a);

  sel.innerHTML =
    '<option value="all">Todos los años</option>' +
    anios.map(a => `<option value="${a}">${a}</option>`).join("");

  // Conserva la selección del usuario si sigue existiendo tras recargar los datos.
  if (valorPrevio && [...sel.options].some(o => o.value === valorPrevio)) {
    sel.value = valorPrevio;
  }
}
// El filtro de ubicación combina las opciones oficiales de barrio y vereda
// definidas en encuesta-data.js, para poder identificar de qué sector
// específico provienen las respuestas.
function poblarFiltroUbicacion() {
  const sel = document.getElementById("filterLoc");
  const valorPrevio = sel.value;
  const general = ENCUESTA_SECCIONES.find(s => s.id === "general");
  const pBarrio = general.preguntas.find(p => p.id === "g5_barrio");
  const pVereda = general.preguntas.find(p => p.id === "g5_vereda");

  const barrios = pBarrio.options.filter(o => o !== "Otro");
  const veredas = pVereda.options.filter(o => o !== "Otra");

  sel.innerHTML = `<option value="all">Todos los sectores (urbano y rural)</option>` +
    `<optgroup label="Barrios (zona urbana)">` +
      barrios.map(b => `<option value="barrio:${b}">${b}</option>`).join("") +
    `</optgroup>` +
    `<optgroup label="Veredas (zona rural)">` +
      veredas.map(v => `<option value="vereda:${v}">${v}</option>`).join("") +
    `</optgroup>`;

  if (valorPrevio && [...sel.options].some(o => o.value === valorPrevio)) {
    sel.value = valorPrevio;
  }
}

// Filtra únicamente por año (columna "anio"). Se deja aparte de la ubicación
// porque la distribución geográfica debe seguir viéndose completa por año,
// sin recortarla también por sector.
function registrosFiltradosPorAnio(base) {
  const fuente = base || TODOS_LOS_REGISTROS;
  const anio = document.getElementById("filterYear").value;
  if (!anio || anio === "all") return fuente;
  return fuente.filter(r => String(r.anio) === String(anio));
}

function registrosFiltradosPorUbicacion(base) {
  const fuente = base || TODOS_LOS_REGISTROS;
  const loc = document.getElementById("filterLoc").value;
  if (!loc || loc === "all") return fuente;
  const [tipo, valor] = loc.split(":");
  const campo = tipo === "barrio" ? "g5_barrio" : "g5_vereda";
  return fuente.filter(r => r.respuestas[campo] === valor);
}

// Combina año + ubicación. Es la fuente que deben usar los KPIs, los gráficos
// por dimensión, la tabla de registros individuales y las exportaciones.
function registrosSegunFiltros() {
  return registrosFiltradosPorUbicacion(registrosFiltradosPorAnio(TODOS_LOS_REGISTROS));
}

/* ---------------- KPIs ---------------- */
function renderKpis() {
  const fuente = registrosSegunFiltros();
  const total = fuente.length;
  const hoy = new Date().toDateString();
  const hoyCount = fuente.filter(r => new Date(r.created_at).toDateString() === hoy).length;

  let mujeres=0, urbano=0, rural=0;
  fuente.forEach(r => {
    const g1 = r.respuestas.g1, g5 = r.respuestas.g5;
    if (g1 === "Femenino") mujeres++;
    if (g5 && g5.includes("urbana")) urbano++;
    if (g5 && g5.includes("rural")) rural++;
  });

  const kpis = [
    { num: total, label: "Respuestas totales" },
    { num: hoyCount, label: "Respuestas hoy" },
    { num: total ? Math.round((mujeres/total)*100)+"%" : "—", label: "Identificadas como mujeres" },
    { num: total ? Math.round((urbano/total)*100)+"%" : "—", label: "Zona urbana" },
    { num: total ? Math.round((rural/total)*100)+"%" : "—", label: "Zona rural" },
  ];
  document.getElementById("kpiRow").innerHTML = kpis.map(k =>
    `<div class="kpi"><div class="num">${k.num}</div><div class="label">${k.label}</div></div>`
  ).join("");
}

/* ---------------- AGREGACIÓN POR PREGUNTA ---------------- */
function contarRespuestas(qid, registros) {
  const fuente = registros || registrosSegunFiltros();
  const conteo = {};
  fuente.forEach(r => {
    let val = r.respuestas[qid];
    if (val === undefined || val === null) return;
    const arr = Array.isArray(val) ? val : [val];
    arr.forEach(v => {
      const limpio = String(v).startsWith("Otro:") ? "Otro" : v;
      conteo[limpio] = (conteo[limpio] || 0) + 1;
    });
  });
  return conteo;
}

function dibujarGrafico(container, titulo, conteo) {
  const n = Object.values(conteo).reduce((a,b)=>a+b,0);
  if (n === 0) return;
  const card = document.createElement("div");
  card.className = "chart-card";
  card.innerHTML = `<h3>${titulo} <span class="n">(n=${n})</span></h3><canvas></canvas>`;
  container.appendChild(card);

  const labels = Object.keys(conteo);
  const valores = Object.values(conteo);
  if (typeof Chart === "undefined") {
    card.querySelector("canvas").outerHTML =
      `<ul style="font-size:12.5px;color:var(--texto-suave);padding-left:18px;margin:0;">` +
      labels.map((l,i)=>`<li>${l}: ${valores[i]}</li>`).join("") + `</ul>`;
    return;
  }
  const ctx = card.querySelector("canvas").getContext("2d");
  const chart = new Chart(ctx, {
    type: labels.length > 6 ? "bar" : "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: labels.map((_,i)=>PALETA[i % PALETA.length]),
        borderRadius: labels.length > 6 ? 6 : 0,
        borderWidth: labels.length > 6 ? 0 : 2,
        borderColor: "#fff",
      }]
    },
    options: {
      indexAxis: labels.length > 6 ? "y" : "x",
      plugins: { legend: { display: labels.length <= 6, position:"bottom", labels:{boxWidth:10,font:{size:10.5}} } },
      scales: labels.length > 6 ? { x:{beginAtZero:true,ticks:{font:{size:10}}}, y:{ticks:{font:{size:10}}} } : {},
      maintainAspectRatio: false,
    }
  });
  CHARTS.push(chart);
}

/* ---------------- DISTRIBUCIÓN GEOGRÁFICA (siempre visible) ----------------
   Muestra de inmediato, sin depender del filtro de dimensión, de qué barrios
   y veredas provienen las respuestas — la condición inicial que identifica
   específicamente de qué parte del municipio responde cada persona.
   Sí respeta el filtro de año (para poder comparar 2026 vs 2027 en adelante),
   pero no el de sector, ya que su función es mostrar todos los sectores.
   -------------------------------------------------------------------- */
function renderDistribucionGeografica() {
  const geoBlock = document.getElementById("geoBlock");
  geoBlock.innerHTML = "";
  if (!TODOS_LOS_REGISTROS.length) return;

  const registrosDelAnio = registrosFiltradosPorAnio(TODOS_LOS_REGISTROS);
  if (!registrosDelAnio.length) return;

  geoBlock.innerHTML = `<h2>📍 Distribución geográfica de las respuestas</h2>`;
  const grid = document.createElement("div");
  grid.className = "chart-grid";
  geoBlock.appendChild(grid);

  dibujarGrafico(grid, "Barrio (zona urbana)", contarRespuestas("g5_barrio", registrosDelAnio));
  dibujarGrafico(grid, "Vereda (zona rural)", contarRespuestas("g5_vereda", registrosDelAnio));
  dibujarGrafico(grid, "Zona urbana o rural", contarRespuestas("g5", registrosDelAnio));

  if (!grid.children.length) geoBlock.innerHTML = "";
}

/* ---------------- RENDER PRINCIPAL (pestaña de estadísticas) ---------------- */
function renderTodo() {
  renderKpis();
  CHARTS.forEach(c => c.destroy());
  CHARTS = [];

  renderDistribucionGeografica();

  const filtroDim = document.getElementById("filterDim").value;
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (!TODOS_LOS_REGISTROS.length) {
    content.innerHTML = `<div class="empty-state">Todavía no hay respuestas registradas. Comparta el enlace
      de la encuesta para empezar a recibir información.</div>`;
    return;
  }

  const registrosFiltrados = registrosSegunFiltros();
  if (!registrosFiltrados.length) {
    content.innerHTML = `<div class="empty-state">No hay respuestas registradas para el año y/o el sector seleccionado.</div>`;
    return;
  }

  const secciones = filtroDim === "all" ? ENCUESTA_SECCIONES : ENCUESTA_SECCIONES.filter(s => s.id === filtroDim);

  secciones.forEach(seccion => {
    const block = document.createElement("div");
    block.className = "dim-block";
    block.innerHTML = `<h2>${seccion.titulo}</h2>`;
    const grid = document.createElement("div");
    grid.className = "chart-grid";

    seccion.preguntas.forEach(p => {
      const conteo = contarRespuestas(p.id, registrosFiltrados);
      dibujarGrafico(grid, p.text, conteo);
    });

    if (grid.children.length) {
      block.appendChild(grid);
      content.appendChild(block);
    }
  });
}

/* ---------------- PESTAÑA DE REGISTROS INDIVIDUALES (editar / eliminar) ---------------- */
function renderTablaRegistros() {
  const tbody = document.getElementById("tablaRegistrosBody");
  const pager = document.getElementById("pagerInfo");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!TODOS_LOS_REGISTROS.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--texto-suave);padding:24px;">
      Todavía no hay respuestas registradas.</td></tr>`;
    pager.textContent = "";
    return;
  }

  const registros = registrosSegunFiltros();
  if (!registros.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--texto-suave);padding:24px;">
      No hay respuestas registradas para el año y/o el sector seleccionado.</td></tr>`;
    pager.textContent = `0 de ${TODOS_LOS_REGISTROS.length} registro(s) (según filtros aplicados).`;
    return;
  }

  registros.forEach(r => {
    const fecha = new Date(r.created_at).toLocaleString("es-CO", { dateStyle:"medium", timeStyle:"short" });
    const zona = r.respuestas.g5 || "—";
    const sector = r.respuestas.g5_barrio || r.respuestas.g5_vereda || "—";
    const comentario = (r.respuestas.comentario_adicional || "").trim();
    const tieneComentario = comentario.length > 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fecha}</td>
      <td>${r.respuestas.g1 || "—"}</td>
      <td>${zona}</td>
      <td>${sector}</td>
      <td>
        <button class="mini-btn ver-comentario ${tieneComentario ? "tiene-comentario" : ""}"
            data-action="comentario" data-id="${r.id}" ${tieneComentario ? "" : "disabled"}>
              👁 ${tieneComentario ? "Ver comentario" : "Sin comentario"}
        </button>
      </td>
      <td class="row-actions">
        <button class="mini-btn" data-action="edit" data-id="${r.id}">✎ Editar</button>
        <button class="mini-btn danger" data-action="delete" data-id="${r.id}">🗑 Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  pager.textContent = registros.length === TODOS_LOS_REGISTROS.length
    ? `${TODOS_LOS_REGISTROS.length} registro(s) en total.`
    : `${registros.length} de ${TODOS_LOS_REGISTROS.length} registro(s) (según filtros aplicados).`;

  tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener("click", () => abrirModalEdicion(btn.dataset.id));
  });
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener("click", () => eliminarRegistro(btn.dataset.id));
  });
  tbody.querySelectorAll('[data-action="comentario"]').forEach(btn => {
    btn.addEventListener("click", () => abrirModalComentario(btn.dataset.id));
  });
}

/* ---------------- MODAL: VER COMENTARIO ---------------- */
function abrirModalComentario(id) {
  const registro = TODOS_LOS_REGISTROS.find(r => String(r.id) === String(id));
  if (!registro) return;
  const comentario = (registro.respuestas.comentario_adicional || "").trim();
  if (!comentario) return;

  const fecha = new Date(registro.created_at).toLocaleString("es-CO", { dateStyle:"medium", timeStyle:"short" });
  const zona = registro.respuestas.g5 || "—";
  const sector = registro.respuestas.g5_barrio || registro.respuestas.g5_vereda || "—";

  const chips = [
    { label: "Fecha", valor: fecha },
    { label: "Género", valor: registro.respuestas.g1 || "—" },
    { label: "Edad", valor: registro.respuestas.g2 || "—" },
    { label: "Zona", valor: zona },
    { label: "Barrio / Vereda", valor: sector },
  ];
  document.getElementById("chipsComentario").innerHTML = chips.map(c =>
    `<div class="chip"><span class="chip-label">${c.label}</span>${c.valor}</div>`
  ).join("");

  document.getElementById("contenidoComentario").textContent = comentario;
  document.getElementById("modalComentario").classList.add("show");
}

function cerrarModalComentario() {
  document.getElementById("modalComentario").classList.remove("show");
}
document.getElementById("cerrarComentario").addEventListener("click", cerrarModalComentario);
document.getElementById("modalComentario").addEventListener("click", (e) => {
  if (e.target.id === "modalComentario") cerrarModalComentario();
});

/* ---------------- EDICIÓN POR CAMPOS ---------------- */
let CAMPOS_ORDEN = [];
let CAMPO_ACTUAL = -1;
let MODO_EDICION = "form";

const ETIQUETAS_EXTRA = {
  comentario_adicional: "Comentario adicional",
};

function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
}

function crearBloqueCampo(qid, label, pregunta, valorActual) {
  const div = document.createElement("div");
  div.className = "campo-block";
  div.dataset.qid = qid;

  const tieneOpciones = pregunta && Array.isArray(pregunta.options) && pregunta.options.length;
  let tipo;
  if (tieneOpciones) {
    tipo = Array.isArray(valorActual) ? "checkbox" : "select";
  } else if (qid === "comentario_adicional" || (typeof valorActual === "string" && valorActual.length > 70)) {
    tipo = "textarea";
  } else {
    tipo = "text";
  }
  div.dataset.tipo = tipo;
  if (typeof valorActual === "number") div.dataset.esNumero = "1";

  let controlHtml = "";

  if (tipo === "checkbox") {
    const seleccionados = Array.isArray(valorActual) ? valorActual : [];
    const otroOpcion = pregunta.options.find(o => /^otr[oa]$/i.test(o));
    let otroTexto = "";
    controlHtml += `<div class="campo-check-grupo">`;
    pregunta.options.forEach(opt => {
      const esOtro = otroOpcion && opt === otroOpcion;
      let marcado = seleccionados.includes(opt);
      if (esOtro && !marcado) {
        const match = seleccionados.find(v => typeof v === "string" && /^otr[oa]\s*:/i.test(v));
        if (match) { marcado = true; otroTexto = match.replace(/^otr[oa]\s*:\s*/i, ""); }
      }
      controlHtml += `<label class="campo-check-item">
        <input type="checkbox" value="${escapeHtml(opt)}" ${esOtro ? 'data-otro="1"' : ""} ${marcado ? "checked" : ""}>
        ${escapeHtml(opt)}
      </label>`;
    });
    controlHtml += `</div>`;
    if (otroOpcion) {
      controlHtml += `<input type="text" class="campo-otro-input" placeholder="Especifique…" value="${escapeHtml(otroTexto)}">`;
    }
  } else if (tipo === "select") {
    const otroOpcion = pregunta.options.find(o => /^otr[oa]$/i.test(o));
    let seleccionEsOtro = false, otroTexto = "";
    if (valorActual != null && valorActual !== "" && !pregunta.options.includes(valorActual)) {
      seleccionEsOtro = true;
      const m = String(valorActual).match(/^otr[oa]\s*:\s*(.*)$/i);
      otroTexto = m ? m[1] : String(valorActual);
    }
    controlHtml += `<select>
      <option value="">— Sin respuesta —</option>
      ${pregunta.options.map(opt => {
        const esSeleccion = opt === valorActual || (seleccionEsOtro && otroOpcion && opt === otroOpcion);
        return `<option value="${escapeHtml(opt)}" ${esSeleccion ? "selected" : ""}>${escapeHtml(opt)}</option>`;
      }).join("")}
    </select>`;
    if (otroOpcion) {
      controlHtml += `<input type="text" class="campo-otro-input" placeholder="Especifique…"
        value="${escapeHtml(otroTexto)}" style="display:${seleccionEsOtro ? "block" : "none"};margin-top:8px;">`;
    }
  } else if (tipo === "textarea") {
    controlHtml = `<textarea>${escapeHtml(valorActual)}</textarea>`;
  } else {
    controlHtml = `<input type="text" value="${escapeHtml(valorActual)}">`;
  }

  div.innerHTML = `<label class="campo-label">${escapeHtml(label)}</label>${controlHtml}`;

  if (tipo === "select") {
    const select = div.querySelector("select");
    const otroInput = div.querySelector(".campo-otro-input");
    if (otroInput) {
      select.addEventListener("change", () => {
        otroInput.style.display = /^otr[oa]$/i.test(select.value) ? "block" : "none";
      });
    }
  }

  return div;
}

function construirFormularioEdicion(registro) {
  const nav = document.getElementById("editNav");
  const fields = document.getElementById("editFields");
  nav.innerHTML = "";
  fields.innerHTML = "";
  CAMPOS_ORDEN = [];
  CAMPO_ACTUAL = -1;

  const idsConocidos = new Set();

  const agregarSeccionNav = (anchorId, titulo) => {
    const link = document.createElement("a");
    link.textContent = titulo;
    link.addEventListener("click", () => {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.appendChild(link);
  };

  (ENCUESTA_SECCIONES || []).forEach(seccion => {
    const anchorId = `edit-sec-${seccion.id}`;
    agregarSeccionNav(anchorId, seccion.titulo);

    const tituloEl = document.createElement("div");
    tituloEl.className = "edit-seccion-titulo";
    tituloEl.id = anchorId;
    tituloEl.textContent = seccion.titulo;
    fields.appendChild(tituloEl);

    seccion.preguntas.forEach(p => {
      idsConocidos.add(p.id);
      const bloque = crearBloqueCampo(p.id, p.text || p.id, p, registro.respuestas[p.id]);
      fields.appendChild(bloque);
      CAMPOS_ORDEN.push(bloque);
    });
  });

  const extras = Object.keys(registro.respuestas || {}).filter(k => !idsConocidos.has(k));
  if (extras.length) {
    const anchorId = "edit-sec-otros";
    agregarSeccionNav(anchorId, "Otros datos");

    const tituloEl = document.createElement("div");
    tituloEl.className = "edit-seccion-titulo";
    tituloEl.id = anchorId;
    tituloEl.textContent = "Otros datos";
    fields.appendChild(tituloEl);

    extras.forEach(qid => {
      const bloque = crearBloqueCampo(qid, ETIQUETAS_EXTRA[qid] || qid, null, registro.respuestas[qid]);
      fields.appendChild(bloque);
      CAMPOS_ORDEN.push(bloque);
    });
  }
}

function leerFormularioEdicion(registroOriginal) {
  const nuevo = { ...(registroOriginal.respuestas || {}) };
  document.querySelectorAll("#editFields .campo-block").forEach(bloque => {
    const qid = bloque.dataset.qid;
    const tipo = bloque.dataset.tipo;

    if (tipo === "checkbox") {
      const otroInput = bloque.querySelector(".campo-otro-input");
      const valores = [];
      bloque.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        if (!chk.checked) return;
        if (chk.dataset.otro === "1") {
          const txt = otroInput ? otroInput.value.trim() : "";
          valores.push(txt ? `${chk.value}: ${txt}` : chk.value);
        } else {
          valores.push(chk.value);
        }
      });
      nuevo[qid] = valores;
    } else if (tipo === "select") {
      const select = bloque.querySelector("select");
      const otroInput = bloque.querySelector(".campo-otro-input");
      let val = select.value;
      if (val === "") {
        delete nuevo[qid];
        return;
      }
      if (/^otr[oa]$/i.test(val) && otroInput) {
        const txt = otroInput.value.trim();
        val = txt ? `${val}: ${txt}` : val;
      }
      nuevo[qid] = val;
    } else if (tipo === "textarea") {
      nuevo[qid] = bloque.querySelector("textarea").value;
    } else {
      const input = bloque.querySelector('input[type="text"]');
      const val = input.value;
      nuevo[qid] = (bloque.dataset.esNumero === "1" && val.trim() !== "" && !isNaN(val))
        ? Number(val) : val;
    }
  });
  return nuevo;
}

function irACampo(delta) {
  if (!CAMPOS_ORDEN.length) return;
  CAMPO_ACTUAL = Math.min(Math.max(CAMPO_ACTUAL + delta, 0), CAMPOS_ORDEN.length - 1);
  document.querySelectorAll(".campo-block.resaltado").forEach(b => b.classList.remove("resaltado"));
  const el = CAMPOS_ORDEN[CAMPO_ACTUAL];
  el.classList.add("resaltado");
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => el.classList.remove("resaltado"), 1600);
}
document.getElementById("editNavUp").addEventListener("click", () => irACampo(-1));
document.getElementById("editNavDown").addEventListener("click", () => irACampo(1));

function abrirModalEdicion(id) {
  const registro = TODOS_LOS_REGISTROS.find(r => String(r.id) === String(id));
  if (!registro) return;
  EDITANDO_ID = id;
  MODO_EDICION = "form";
  document.getElementById("editToggleModo").textContent = "🧾 Ver como JSON";
  document.getElementById("editBodyForm").style.display = "flex";
  document.getElementById("editBodyJson").style.display = "none";
  construirFormularioEdicion(registro);
  document.getElementById("editTextarea").value = JSON.stringify(registro.respuestas, null, 2);
  document.getElementById("editError").classList.remove("show");
  document.getElementById("editModal").classList.add("show");
}

function cerrarModalEdicion() {
  document.getElementById("editModal").classList.remove("show");
  EDITANDO_ID = null;
  CAMPOS_ORDEN = [];
  CAMPO_ACTUAL = -1;
}
document.getElementById("editCancelBtn").addEventListener("click", cerrarModalEdicion);
document.getElementById("editModal").addEventListener("click", (e) => {
  if (e.target.id === "editModal") cerrarModalEdicion();
});

document.getElementById("editToggleModo").addEventListener("click", () => {
  const btn = document.getElementById("editToggleModo");
  const registro = TODOS_LOS_REGISTROS.find(r => String(r.id) === String(EDITANDO_ID));
  if (!registro) return;

  if (MODO_EDICION === "form") {
    // Pasa a modo JSON, volcando lo que el usuario ya haya editado en el formulario.
    let actual;
    try {
      actual = leerFormularioEdicion(registro);
    } catch (e) {
      actual = registro.respuestas;
    }
    document.getElementById("editTextarea").value = JSON.stringify(actual, null, 2);
    document.getElementById("editBodyForm").style.display = "none";
    document.getElementById("editBodyJson").style.display = "block";
    btn.textContent = "🧩 Ver por campos";
    MODO_EDICION = "json";
  } else {
    // Vuelve a modo formulario, reconstruyéndolo desde el JSON (si es válido).
    const textarea = document.getElementById("editTextarea");
    let datos;
    try {
      datos = JSON.parse(textarea.value);
    } catch (e) {
      document.getElementById("editError").textContent = "El JSON no es válido, corríjalo antes de volver a la vista por campos.";
      document.getElementById("editError").classList.add("show");
      return;
    }
    document.getElementById("editError").classList.remove("show");
    construirFormularioEdicion({ respuestas: datos });
    document.getElementById("editBodyForm").style.display = "flex";
    document.getElementById("editBodyJson").style.display = "none";
    btn.textContent = "🧾 Ver como JSON";
    MODO_EDICION = "form";
  }
});

document.getElementById("editSaveBtn").addEventListener("click", async () => {
  const errBox = document.getElementById("editError");
  const registro = TODOS_LOS_REGISTROS.find(r => String(r.id) === String(EDITANDO_ID));
  if (!registro) return;
  let nuevoJson;

  if (MODO_EDICION === "json") {
    try {
      nuevoJson = JSON.parse(document.getElementById("editTextarea").value);
    } catch (e) {
      errBox.textContent = "El contenido no es un JSON válido: " + e.message;
      errBox.classList.add("show");
      return;
    }
  } else {
    nuevoJson = leerFormularioEdicion(registro);
  }
  errBox.classList.remove("show");

  const { error } = await supabaseClient
    .from(ADMIN_CONFIG.TABLE)
    .update({ respuestas: nuevoJson })
    .eq("id", EDITANDO_ID);

  if (error) {
    errBox.textContent = "No se pudo guardar: " + error.message;
    errBox.classList.add("show");
    return;
  }

  cerrarModalEdicion();
  await cargarDatos();
});

async function eliminarRegistro(id) {
  const ok = confirm("¿Está seguro de eliminar esta respuesta? Esta acción no se puede deshacer.");
  if (!ok) return;

  const { error } = await supabaseClient
    .from(ADMIN_CONFIG.TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    alert("No se pudo eliminar el registro: " + error.message);
    return;
  }
  await cargarDatos();
}

/* ---------------- EXPORTAR CSV / XLSX ----------------
   Exportan los registros según los filtros de año y sector aplicados en ese
   momento (si no hay ninguno activo, exportan todo, como antes). */
function filasParaExportar() {
  const registros = registrosSegunFiltros();
  const todasLasPreguntas = ENCUESTA_SECCIONES.flatMap(s => s.preguntas.map(p => p.id));
  const headers = ["id", "fecha", "anio", ...todasLasPreguntas, "comentario_adicional"];
  const filas = registros.map(r => {
    return [
      r.id,
      new Date(r.created_at).toLocaleString("es-CO"),
      r.anio != null ? r.anio : "",
      ...todasLasPreguntas.map(qid => {
        const v = r.respuestas[qid];
        if (v === undefined || v === null) return "";
        return Array.isArray(v) ? v.join(" | ") : String(v);
      }),
      r.respuestas.comentario_adicional || ""
    ];
  });
  return { headers, filas };
}

function exportarCSV() {
  if (!registrosSegunFiltros().length) return;
  const { headers, filas } = filasParaExportar();
  const csv = [headers.join(","),
    ...filas.map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `encuesta_calidad_vida_2026_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportarXLSX() {
  const registros = registrosSegunFiltros();
  if (!registros.length) return;
  if (typeof XLSX === "undefined") {
    alert("No se pudo cargar la librería de Excel. Verifique su conexión a internet e intente de nuevo.");
    return;
  }
  const { headers, filas } = filasParaExportar();
  const hoja = XLSX.utils.aoa_to_sheet([headers, ...filas]);
  hoja["!cols"] = headers.map(() => ({ wch: 22 }));

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Respuestas");

  // Segunda hoja con un resumen rápido de género y sector, útil para
  // quien solo quiera ver la información de forma sencilla.
  const resumen = [["Indicador", "Valor"]];
  resumen.push(["Total de respuestas exportadas", registros.length]);
  Object.entries(contarRespuestas("g1", registros)).forEach(([k,v]) => resumen.push([`Género · ${k}`, v]));
  Object.entries(contarRespuestas("g5", registros)).forEach(([k,v]) => resumen.push([`Zona · ${k}`, v]));
  const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
  hojaResumen["!cols"] = [{ wch: 30 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");

  XLSX.writeFile(libro, `encuesta_calidad_vida_2026_${new Date().toISOString().slice(0,10)}.xlsx`);
}

