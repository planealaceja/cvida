/* =========================================================================
   PANEL DE RESULTADOS - ENCUESTA DE CALIDAD DE VIDA LA CEJA DEL TAMBO 2026
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
document.getElementById("filterLoc").addEventListener("change", renderTodo);
document.getElementById("exportCsvBtn").addEventListener("click", exportarCSV);
document.getElementById("exportXlsxBtn").addEventListener("click", exportarXLSX);

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

    const anios = [...new Set(
        TODOS_LOS_REGISTROS
            .map(r => r.anio)
            .filter(a => a != null)
    )];

    anios.sort((a,b)=>a-b);

    sel.innerHTML =
        '<option value="all">Todos los años</option>' +
        anios.map(a =>
            `<option value="${a}">${a}</option>`
        ).join("");

}
// El filtro de ubicación combina las opciones oficiales de barrio y vereda
// definidas en encuesta-data.js, para poder identificar de qué sector
// específico provienen las respuestas.
function poblarFiltroUbicacion() {
  const sel = document.getElementById("filterLoc");
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
}

function registrosFiltradosPorUbicacion() {
  const loc = document.getElementById("filterLoc").value;
  if (!loc || loc === "all") return TODOS_LOS_REGISTROS;
  const [tipo, valor] = loc.split(":");
  const campo = tipo === "barrio" ? "g5_barrio" : "g5_vereda";
  return TODOS_LOS_REGISTROS.filter(r => r.respuestas[campo] === valor);
}

/* ---------------- KPIs ---------------- */
function renderKpis() {
  const total = TODOS_LOS_REGISTROS.length;
  const hoy = new Date().toDateString();
  const hoyCount = TODOS_LOS_REGISTROS.filter(r => new Date(r.created_at).toDateString() === hoy).length;

  let mujeres=0, urbano=0, rural=0;
  TODOS_LOS_REGISTROS.forEach(r => {
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
  const fuente = registros || registrosFiltradosPorUbicacion();
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
   -------------------------------------------------------------------- */
function renderDistribucionGeografica() {
  const geoBlock = document.getElementById("geoBlock");
  geoBlock.innerHTML = "";
  if (!TODOS_LOS_REGISTROS.length) return;

  geoBlock.innerHTML = `<h2>📍 Distribución geográfica de las respuestas</h2>`;
  const grid = document.createElement("div");
  grid.className = "chart-grid";
  geoBlock.appendChild(grid);

  dibujarGrafico(grid, "Barrio (zona urbana)", contarRespuestas("g5_barrio", TODOS_LOS_REGISTROS));
  dibujarGrafico(grid, "Vereda (zona rural)", contarRespuestas("g5_vereda", TODOS_LOS_REGISTROS));
  dibujarGrafico(grid, "Zona urbana o rural", contarRespuestas("g5", TODOS_LOS_REGISTROS));

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

  const registrosFiltrados = registrosFiltradosPorUbicacion();
  if (!registrosFiltrados.length) {
    content.innerHTML = `<div class="empty-state">No hay respuestas registradas para el sector seleccionado.</div>`;
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
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--texto-suave);padding:24px;">
      Todavía no hay respuestas registradas.</td></tr>`;
    pager.textContent = "";
    return;
  }

  TODOS_LOS_REGISTROS.forEach(r => {
    const fecha = new Date(r.created_at).toLocaleString("es-CO", { dateStyle:"medium", timeStyle:"short" });
    const zona = r.respuestas.g5 || "—";
    const sector = r.respuestas.g5_barrio || r.respuestas.g5_vereda || "—";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fecha}</td>
      <td>${r.respuestas.g1 || "—"}</td>
      <td>${zona}</td>
      <td>${sector}</td>
      <td class="row-actions">
        <button class="mini-btn" data-action="edit" data-id="${r.id}">✎ Editar</button>
        <button class="mini-btn danger" data-action="delete" data-id="${r.id}">🗑 Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  pager.textContent = `${TODOS_LOS_REGISTROS.length} registro(s) en total.`;

  tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener("click", () => abrirModalEdicion(btn.dataset.id));
  });
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener("click", () => eliminarRegistro(btn.dataset.id));
  });
}

function abrirModalEdicion(id) {
  const registro = TODOS_LOS_REGISTROS.find(r => String(r.id) === String(id));
  if (!registro) return;
  EDITANDO_ID = id;
  document.getElementById("editTextarea").value = JSON.stringify(registro.respuestas, null, 2);
  document.getElementById("editError").classList.remove("show");
  document.getElementById("editModal").classList.add("show");
}

function cerrarModalEdicion() {
  document.getElementById("editModal").classList.remove("show");
  EDITANDO_ID = null;
}
document.getElementById("editCancelBtn").addEventListener("click", cerrarModalEdicion);
document.getElementById("editModal").addEventListener("click", (e) => {
  if (e.target.id === "editModal") cerrarModalEdicion();
});

document.getElementById("editSaveBtn").addEventListener("click", async () => {
  const textarea = document.getElementById("editTextarea");
  const errBox = document.getElementById("editError");
  let nuevoJson;
  try {
    nuevoJson = JSON.parse(textarea.value);
  } catch (e) {
    errBox.textContent = "El contenido no es un JSON válido: " + e.message;
    errBox.classList.add("show");
    return;
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

/* ---------------- EXPORTAR CSV / XLSX ---------------- */
function filasParaExportar() {
  const todasLasPreguntas = ENCUESTA_SECCIONES.flatMap(s => s.preguntas.map(p => p.id));
  const headers = ["id", "fecha", ...todasLasPreguntas, "comentario_adicional"];
  const filas = TODOS_LOS_REGISTROS.map(r => {
    return [
      r.id,
      new Date(r.created_at).toLocaleString("es-CO"),
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
  if (!TODOS_LOS_REGISTROS.length) return;
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
  if (!TODOS_LOS_REGISTROS.length) return;
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
  resumen.push(["Total de respuestas", TODOS_LOS_REGISTROS.length]);
  Object.entries(contarRespuestas("g1", TODOS_LOS_REGISTROS)).forEach(([k,v]) => resumen.push([`Género · ${k}`, v]));
  Object.entries(contarRespuestas("g5", TODOS_LOS_REGISTROS)).forEach(([k,v]) => resumen.push([`Zona · ${k}`, v]));
  const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
  hojaResumen["!cols"] = [{ wch: 30 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");

  XLSX.writeFile(libro, `encuesta_calidad_vida_2026_${new Date().toISOString().slice(0,10)}.xlsx`);
}
