# Cómo poner en línea la Encuesta de Calidad de Vida 2026

Esta guía explica, paso a paso y sin necesidad de experiencia previa en
desarrollo, cómo dejar la encuesta funcionando en internet y cómo revisar
los resultados que vayan llegando.

## Qué incluye esta entrega

| Archivo                  | Para qué sirve |
|---------------------------|----------------|
| `encuesta.html`           | La encuesta pública (lo que responden las personas). |
| `encuesta-data.js`        | Todas las preguntas, opciones y la lógica de saltos. Editable. |
| `encuesta-app.js`         | El motor de la encuesta (navegación, validaciones, envío). |
| `admin.html`              | El panel privado para ver resultados y estadísticas. |
| `admin-app.js`            | Lógica del panel de resultados (gráficos, exportar CSV). |
| `supabase-schema.sql`     | El script que crea la base de datos donde se guardan las respuestas. |
| `escudo-la-ceja.png`      | *(usted debe agregarlo)* — el escudo oficial del municipio. |

---

## Paso 1 · Crear la base de datos (Supabase)

Usted ya tiene experiencia con Supabase por el geoportal Geo-Ceja, así que
este paso le será familiar. Puede usar el **mismo proyecto** que ya tiene o
crear uno nuevo exclusivamente para esta encuesta (recomendado, para no
mezclar datos catastrales con datos de encuesta ciudadana).

1. Entre a [supabase.com](https://supabase.com) → su proyecto (o cree uno
   nuevo con "New Project").
2. Vaya a **SQL Editor → New query**.
3. Abra el archivo `supabase-schema.sql` de esta entrega, copie todo su
   contenido y péguelo en el editor.
4. Presione **Run**. Esto crea la tabla `encuesta_calidad_vida_2026` con las
   reglas de seguridad correctas: cualquiera puede *enviar* una respuesta,
   pero solo su equipo autenticado puede *leerlas*, *editarlas* o
   *eliminarlas* (esto último habilita los botones "Editar" y "Eliminar"
   del panel de resultados).
5. Vaya a **Authentication → Users → Add user** y cree el usuario que usará
   el equipo del Observatorio Municipal para entrar al panel de resultados
   (ej. `observatorio@laceja.gov.co` con una contraseña segura).
6. Vaya a **Project Settings → API**. Copie dos valores:
   - **Project URL** (algo como `https://abcxyz.supabase.co`)
   - **anon public key** (una llave larga que empieza distinto a la `service_role`)

   ⚠️ Use siempre la llave **anon public**, nunca la `service_role` en estos
   archivos: la `service_role` tiene permisos totales y no debe estar en
   código que corre en el navegador de los usuarios.

## Paso 2 · Conectar los archivos a su base de datos

1. Abra `encuesta-app.js` con cualquier editor de texto (Bloc de notas,
   VS Code, etc.) y al inicio reemplace:
   ```js
   const CONFIG = {
     SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
     SUPABASE_ANON_KEY: "TU-LLAVE-ANON-PUBLICA",
     ...
   };
   ```
   por los valores reales que copió en el paso anterior.

2. Haga lo mismo al inicio de `admin-app.js` (`ADMIN_CONFIG`).

3. Si tiene el escudo oficial del municipio en formato `.png` con fondo
   transparente, guárdelo en esta misma carpeta con el nombre
   `escudo-la-ceja.png`. La encuesta lo detecta automáticamente; si no
   existe, se muestra un ícono genérico de reemplazo.

## Paso 3 · Publicar la encuesta en internet

La forma más simple y gratuita, sin necesidad de un servidor propio, es
usar **Netlify** o **GitHub Pages**. Cualquiera de las dos sirve; aquí están
ambas opciones:

### Opción A — Netlify (arrastrar y soltar, la más fácil)

1. Entre a [app.netlify.com/drop](https://app.netlify.com/drop) (puede crear
   una cuenta gratuita con su correo).
2. Arrastre la carpeta completa con los 6 archivos (`encuesta.html`,
   `encuesta-data.js`, `encuesta-app.js`, `admin.html`, `admin-app.js`, y el
   escudo si lo tiene) a la zona de "drop".
3. Netlify le entrega una URL pública en segundos, por ejemplo
   `https://laceja-calidad-vida.netlify.app`.
4. **Importante**: la URL pública apuntará a `index.html` por defecto.
   Renombre `encuesta.html` a `index.html` antes de subirlo (o configure en
   Netlify "Site settings → Build & deploy → Asset publishing" para que
   sirva `encuesta.html` como página principal). La forma más simple es
   subir una copia de `encuesta.html` también con el nombre `index.html`.
5. Para acceder al panel de resultados use la misma URL agregando
   `/admin.html`, por ejemplo `https://laceja-calidad-vida.netlify.app/admin.html`.
   Guarde ese enlace en un lugar seguro — no lo comparta por redes sociales.

### Opción B — GitHub Pages

1. Cree un repositorio nuevo en GitHub (puede ser privado o público).
2. Suba los archivos de esta entrega a la raíz del repositorio.
3. Renombre `encuesta.html` a `index.html` (igual que en la opción A).
4. Vaya a **Settings → Pages**, seleccione la rama `main` y la carpeta raíz.
5. GitHub le da una URL del tipo
   `https://su-usuario.github.io/su-repositorio/`.

### Opción C — Como sección dentro del sitio del municipio

Si la Alcaldía ya tiene un servidor web o un dominio propio
(`laceja.gov.co`), puede simplemente copiar estos archivos a una carpeta del
sitio (ej. `/encuesta-calidad-vida/`) por FTP o por el panel de su
proveedor de hosting, igual a como ha alojado antes el geoportal Geo-Ceja.
No requiere ningún paso adicional de "build" o compilación: son archivos
estáticos listos para usar.

## Paso 4 · Difundir el enlace

Una vez publicada, comparta el enlace de `index.html` (la encuesta) por:
- Redes sociales de la Alcaldía (Facebook, Instagram, WhatsApp).
- Pantallas o carteles con código QR en puntos de atención al ciudadano.
- Boletines o correos institucionales.

**No comparta el enlace de `admin.html`** fuera del equipo autorizado: es la
puerta de entrada a los resultados.

## Paso 5 · Revisar resultados

1. Entre a `su-sitio.com/admin.html`.
2. Inicie sesión con el usuario que creó en el paso 1.5.
3. Verá:
   - Indicadores generales (total de respuestas, % por género, zona urbana/rural, etc.)
   - Un gráfico por cada pregunta, agrupado por dimensión.
   - Un filtro para ver solo una dimensión a la vez.
   - Un botón **"Exportar CSV"** para descargar todas las respuestas crudas
     y trabajarlas en Excel, Power BI o Power Query, tal como ya lo ha
     hecho con otras bases de datos del municipio.

## Notas sobre seguridad y datos personales

- La encuesta no pide nombre, cédula ni datos de contacto: las respuestas
  son anónimas por diseño.
- El aviso de tratamiento de datos personales (Ley 1581 de 2012) se muestra
  antes de iniciar y se debe aceptar para continuar.
- Solo personas autenticadas (su equipo) pueden leer las respuestas; el
  público en general solo puede enviar nuevas respuestas, nunca leerlas.
- Si en algún momento quiere cerrar la recolección de respuestas, basta con
  quitar la política de inserción pública en Supabase (SQL Editor):
  ```sql
  drop policy "Permitir insercion publica" on public.encuesta_calidad_vida_2026;
  ```

## Mejoras que se hicieron sobre el listado original de preguntas

- Se convirtieron varias preguntas binarias (Bueno/Malo) en **escalas de 5
  niveles** (Excelente, Buena, Regular, Mala, Muy mala) para obtener
  estadísticas más ricas que un simple porcentaje binario.
- Se reemplazaron los menús desplegables por **chips/botones grandes**,
  pensados para uso desde celular y redes sociales (excepto en preguntas con
  listas largas, como barrio/vereda, donde se usa un menú desplegable real
  para no saturar la pantalla).
- Se agregó **lógica de salto condicional**: por ejemplo, la pregunta sobre
  tipo de discapacidad solo aparece si la persona indicó que tiene una
  discapacidad; la pregunta sobre alimentación de menores solo aparece si
  hay menores a cargo; y al indicar zona **urbana** se pregunta el **barrio**,
  mientras que al indicar zona **rural** se pregunta la **vereda** (usando
  los listados oficiales del municipio).
- Se agregó lógica de **opciones excluyentes** (ej. seleccionar "Ninguno" o
  "N/A" deselecciona automáticamente las demás opciones del grupo) y de
  **"Otro, ¿cuál?"** con campo de texto que aparece solo cuando se elige
  esa opción.
- Las preguntas quedaron **agrupadas y rotuladas por dimensión**, igual al
  esquema de las 7 dimensiones del documento original, para que la persona
  sepa siempre sobre qué tema se le está preguntando.
- Al final de la encuesta, antes del mensaje de agradecimiento, se agregó un
  **campo de comentario adicional opcional** para que la persona pueda
  compartir alguna situación o sugerencia que no haya quedado cubierta por
  las preguntas cerradas.
- La numeración original del Excel (que tenía saltos e inconsistencias) se
  reemplazó por identificadores internos estables (`g1`, `d1_1`, `d3_9a`,
  etc.), pensados para que el orden de las preguntas se pueda reorganizar
  en el futuro sin romper la base de datos.

## Barrio / vereda: listas oficiales

Las opciones de barrio (zona urbana) y vereda (zona rural) que se muestran
en la encuesta son las que usted indicó:

- **Barrios**: Centro, San Cayetano, Fray Eugenio, La Floresta, Payuco,
  Ofir (Viva), El Tambo, Fátima (Maderos), Hipódromo, Tahamí (Montesol),
  Cuatro Esquinas, María Auxiliadora.
- **Veredas**: Las Lomitas, El Tambo, La Milagrosa, San Nicolás, Guamito,
  San Miguel, El Higuerón, Colmenas, Llanadas, La Loma, La Miel, La Playa,
  San Gerardo, Fátima, San José, San Rafael, Piedras.

Se agregó una opción **"Otro / Otra"** con campo de texto libre en ambas
listas, como respaldo por si alguna vivienda queda fuera de los límites
exactos de estas dos listas. Si prefiere que la lista sea cerrada (sin esa
opción de respaldo), es un cambio de una sola línea en `encuesta-data.js`
que con gusto puedo hacer.

## Panel de resultados: qué hay de nuevo

- **Distribución geográfica**: apenas se cargan los datos, el panel muestra
  de inmediato en qué barrio y en qué vereda vive cada persona que respondió,
  sin necesidad de aplicar ningún filtro.
- **Filtro por sector**: además del filtro por dimensión, ahora hay un
  segundo filtro para ver las estadísticas de un barrio o vereda específico
  únicamente.
- **Pestaña "Registros individuales"**: una tabla con cada respuesta
  recibida (fecha, género, zona, barrio/vereda) con botones para **Editar**
  (abre el JSON completo de esa respuesta para corregirlo) y **Eliminar**
  (borra el registro de forma permanente, previa confirmación).
- **Exportar a Excel (.xlsx)**: además del botón de CSV que ya existía,
  ahora hay un botón para descargar directamente un archivo de Excel con dos
  hojas: "Respuestas" (todos los datos crudos) y "Resumen" (un resumen
  rápido de género y zona), para quien prefiera abrir el archivo
  directamente en Excel sin tener que importar un CSV.

## Corrección de parpadeo al responder

En la primera versión, cada clic en una opción reconstruía visualmente toda
la sección, lo que producía un parpadeo perceptible en todas las preguntas.
Ahora la encuesta actualiza únicamente la pregunta que cambió (y muestra u
oculta las preguntas condicionales que correspondan), sin volver a dibujar
las demás tarjetas — la interacción es instantánea y sin parpadeo.

