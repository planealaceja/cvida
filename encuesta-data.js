/* =========================================================================
   ENCUESTA DE CALIDAD DE VIDA - MUNICIPIO DE LA CEJA DEL TAMBO 2026
   Estructura de datos: secciones, preguntas, opciones y lógica condicional.

   Tipos de pregunta:
     - "single": selección única (chips tipo radio)
     - "multi" : selección múltiple (chips tipo checkbox)

   Cada pregunta puede tener:
     - condition: { q: "id_pregunta", equals: "VALOR" } o { q:"id", in:["A","B"] }
       -> la pregunta solo se muestra si se cumple la condición (lógica de salto)
     - exclusive: [valores] -> al elegir una de estas opciones en una pregunta
       "multi", se deseleccionan las demás (ej. "Ninguno", "N/A", "Todas")
     - otherTrigger: "VALOR" -> si se elige esa opción aparece un campo de texto
     - required: false -> si no se indica, se asume true (obligatoria si está visible)
   ========================================================================= */

const ENCUESTA_SECCIONES = [

{
  id: "general",
  numero: "0",
  titulo: "Datos generales",
  subtitulo: "Información sociodemográfica",
  preguntas: [
    { id:"g1", text:"¿Cuál ha sido su sexo asignado al nacer?", type:"single",
      options:["Mujer","Hombre"] },

    {
      id: "g2", text: "¿Cuál es su orientación sexual (según su sexo y el sexo por el que siente atracción)?", type: "single",
      options: ["Heterosexual (le atraen las personas del sexo contrario al suyo)",  
                "Lesbiana (siendo mujer le atraen las mujeres)", 
                "Gay (siendo hombre le atraen los hombres)", 
                "Bisexual (siente atracción por hombres y mujeres)",
                "Prefiero no decirlo",
                "Otro"],
      otherTrigger:"Otro"
    },

    { id:"g3", text:"¿Cuál es su rango de edad?", type:"single",
      options:["18 a 28 años","29 a 59 años","60 años y más"] },

    { id:"g4", text:"¿Hace cuánto vive en La Ceja del Tambo?", type:"single",
      options:["1 a 12 meses","1 a 5 años","5 años o más","Toda la vida"] },

    { id:"g5", text:"¿Trabaja en La Ceja del Tambo?", type:"single",
      options:["Sí","No"] },
     
    {
      id: "g11", text: "¿En que municipio trabajas?", type: "single", grid:"select",
      condition: { q: "g5", equals: "No" },
      options: ["Medellín", "Rionegro", "El Carmen de Viboral", "El Retiro", "El Santuario",
        "Guarne", "La Unión", "Marinilla", "San Vicente Ferrer", "Alejandría", "Concepción",
        "El Peñol", "Granada", "Guatapé", "San Carlos", "San Rafael", "Cocorná", "San Francisco",
        "San Luis", "Abejorral", "Argelia", "Nariño", "Sonsón", "Otro"
      ],
    otherTrigger:"Otro"},

    { id:"g6", text:"¿Su vivienda está ubicada en zona urbana o rural?", type:"single",
      options:["Vereda (rural)","Barrio (urbana)"] },

    { id:"g6_barrio", text:"¿En cuál barrio vive?", type:"single", grid:"select",
      condition:{q:"g6", equals:"Barrio (urbana)"},
      options:["Centro","San Cayetano","Fray Eugenio","La Floresta","Payuco","Ofir (Viva)",
        "El Tambo","Fátima (Maderos)","Hipódromo","Tahamí (Montesol)","Cuatro Esquinas",
        "María Auxiliadora","Otro"],
      otherTrigger:"Otro" },

    { id:"g6_vereda", text:"¿En cuál vereda vive?", type:"single", grid:"select",
      condition:{q:"g6", equals:"Vereda (rural)"},
      options:["Las Lomitas","El Tambo","La Milagrosa","San Nicolás","Guamito","San Miguel",
        "El Higuerón","Colmenas","Llanadas","La Loma","La Miel","La Playa","San Gerardo",
        "Fátima","San José","San Rafael","Piedras","Otra"],
      otherTrigger:"Otra" },

    { id:"g7", text:"¿Pertenece a alguno de estos grupos étnicos?", type:"multi",
      help:"Puede elegir varias opciones.",
      options:["Afrocolombiano","Rom","Raizal","Indígena","Palenquero","No aplica"],
      exclusive:["No aplica"] },

    { id:"g8", text:"¿Usted presenta alguna discapacidad?", type:"single",
      options:["Sí","No"] },

    {
      id: "g9", text: "¿Cuenta con diagnóstico o certificación de discapacidad?", type:"single",
      condition:{q: "g8", equals: "Sí" },
      options:["Sí", "No", "En trámite"] },

    { id:"g10", text:"¿Su discapacidad es de tipo?", type:"multi",
      condition:{q:"g8", equals:"Sí"},
      options: ["Física (limitaciones de movilidad o motoras)", "Auditiva (sordera o pérdida auditiva)", "Sordoceguera (discapacidad visual y auditiva combinada)", "Intelectual (limitaciones en el aprendizaje y la comprensión)", "Psicosocial (diagnóstico de trastorno mental)","Múltiple (dos o más de las discapacidades anteriores)"],
      exclusive: ["Múltiple (dos o más de las discapacidades anteriores) "],
    }
  ]
},

{
  id: "dim1",
  numero: "1",
  titulo: "Gestionemos nuestra sociedad",
  subtitulo: "Dimensión 1 · Condiciones de vida",
  preguntas: [
    { id:"d1_1", text:"¿Cuál es el estrato socioeconómico de su vivienda?", type:"single",
      grid:"num", options:["1","2","3","4","5","6"] },

    { id:"d1_2", text:"¿Su vivienda es?", type:"single",
      options:["Propia, pagada","Propia, pagando","Alquilada","Familiar"] },

    { id:"d1_3", text:"¿Cuántos dormitorios tiene su vivienda?", type:"single",
      grid:"num", options:["1","2","3","4 o más"] },

    { id:"d1_4", text:"¿Cuántas personas viven con usted?", type:"single",
      grid:"num", options:["0","1","2","3","4","5 o más"] },

    {
      id: "d1_5", text: "¿Como es la composición y estructura de su hogar?", type: "single",
      grid: "num", options: ["Vive solo/a", "Pareja sin hijos", "Madre/padre e hijos", "Madre, padre e hijos", "Familia extensa (abuelos, tíos, otros familiares)", "Familia reconstituida (Pareja con hijos de ambos)", "Multifamiliar o Compartido", "Otro"],
      otherTrigger: "Otro"},

    {
      id: "d1_6", text: "¿Cómo considera actualmente la convivencia entre los integrantes de su hogar?",
      type: "single", grid: "scale",
      options: ["Excelente", "Buena", "Regular", "Mala", "Muy mala"]},

    {
      id: "d1_7",
      text: "¿Cuáles son las principales situaciones que generan dificultades o conflictos en su hogar?",
      help: "Puede seleccionar hasta tres opciones.",
      type: "multi",
      maxLimit: 3, // Esta propiedad la leerá el frontend para bloquear los clics adicionales
      options: [
        "Comunicación entre los integrantes",
        "Crianza y establecimiento de normas y límites",
        "Situación económica",
        "Distribución de las responsabilidades del hogar y cuidado",
        "Relaciones de pareja",
        "Uso de celulares, redes sociales o videojuegos",
        "Diferencias entre generaciones",
        "Consumo de alcohol u otras sustancias",
        "Violencias al interior del hogar",
        "No se presentan dificultades"
      ],
      exclusive: ["No se presentan dificultades"]
    },

    { id:"d1_8", text:"¿Cómo percibe la calidad y cobertura de los servicios públicos en su vivienda?",
      type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d1_9", text:"¿Ha utilizado los servicios del hospital en el último año?", type:"single",
      options:["Sí","No"] },

    { id:"d1_10", text:"¿Qué percepción tiene del servicio prestado por el hospital?",
      type:"single", grid:"scale",
      condition:{q:"d1_9", equals:"Sí"},
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    {
      id: "d1_11", text: "En el último año, ¿dejó de consultar al médico alguna vez que lo necesitó?",
      type: "single", grid: "single",
      options: ["No, siempre que lo necesité pude consultar", "Sí, alguna vez no consulté aunque lo necesitaba"]
    },

    {
      id: "d1_12", text: "¿Cuál fue el principal motivo por el que no consultó? ",
      type: "single", grid: "single",
      condition: { q: "d1_11", equals: "Sí, alguna vez no consulté aunque lo necesitaba" },
      options: ["No conseguí cita o hubo mucha demora", 
        "El sitio de atención queda lejos o es difícil llegar", 
        "No tenía dinero para consulta, exámenes o transporte", 
        "No estaba afiliado o tuve problemas con la EPS", 
        "No confío en la atención o tuve una mala experiencia",
        "Falta de tiempo por trabajo u ocupaciones",
        "Otro"], otherTrigger: "Otro"
    },

    { id:"d1_13", text:"¿Cuál es su nivel de escolaridad?", type:"single",
      options:["Primaria","Bachillerato","Técnico","Tecnológico","Profesional","Postgrado","Ninguno"] },

    { id:"d1_14", text:"¿Es usted pensionado o pensionada?", type:"single",
      options:["Sí","No"] },

    { id:"d1_15", text:"¿Usted o su familia ha sido beneficiaria en el último año de alguno de estos programas?",
      type:"multi",
      options:["Familias en Acción","Programas de primera infancia","Comedor comunitario","Restaurante escolar","Bono económico","Paquete nutricional","Otro","Ninguno"],
      exclusive:["Ninguno"], otherTrigger:"Otro" },

    { id:"d1_16", text:"¿Cómo percibe la calidad de vida en el municipio?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d1_17", text:"¿Cuál es la percepción que tiene de su propia calidad de vida?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },
  ]
},

{
  id: "dim2",
  numero: "2",
  titulo: "Gestionemos nuestra institucionalidad",
  subtitulo: "Dimensión 2 · Legalidad, confianza y consciencia",
  preguntas: [
    { id:"d2_1", text:"¿Percibe que las inversiones de la administración municipal contribuyen a su bienestar?",
      type:"single", options:["Sí","No"] },
  ]
},

{
  id: "dim3",
  numero: "3",
  titulo: "Gestionemos nuestro hábitat y territorio",
  subtitulo: "Dimensión 3 · Medio ambiente y movilidad",
  preguntas: [
    { id:"d3_1", text:"¿Cómo percibe la calidad de la arborización en el municipio?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d3_2", text:"¿Cómo percibe el estado de las quebradas en el municipio?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d3_3", text:"¿Cómo percibe el control y manejo de basuras en el municipio?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d3_4", text:"¿Cómo percibe la calidad del aire en el municipio?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d3_5", text:"¿Cómo percibe la contaminación auditiva (ruido) en el municipio?", type:"single",
      options:["Alta","Media","Baja"] },

    { id:"d3_6", text:"¿Cómo percibe la contaminación visual en el municipio?", type:"single",
      options:["Alta","Media","Baja"] },

    { id:"d3_7", text:"¿Cuál de los siguientes hábitos practica para cuidar el medio ambiente?", type:"multi",
      options:["Separar residuos","Ahorrar agua","Ahorrar energía","Otro"],
      otherTrigger:"Otro" },

    { id:"d3_8", text:"¿Por cuál(es) de los siguientes eventos se siente amenazado en su vivienda?", type:"multi",
      options:["Terremoto","Deslizamiento","Inundación","Ninguno"],
      exclusive:["Ninguno"] },

    { id:"d3_9a", text:"Condiciones de accesibilidad de su zona: vías de acceso", type:"single",
      grid:"scale3", options:["Buena","Regular","Mala"] },
    { id:"d3_9b", text:"Condiciones de accesibilidad de su zona: zonas de parqueo", type:"single",
      grid:"scale3", options:["Buena","Regular","Mala"] },
    {
      id: "d3_9c", text:"Condiciones de accesibilidad de su zona: accesos para personas con discapacidad", type:"single",
      grid:"scale3", options:["Buena","Regular","Mala"] },

    { id:"d3_10a", text:"Servicio de transporte público — Rutas", type:"single",
      grid:"scale3", options:["Bueno","Regular","Malo"] },
    { id:"d3_10b", text:"Servicio de transporte público — Horarios", type:"single",
      grid:"scale3", options:["Bueno","Regular","Malo"] },
    { id:"d3_10c", text:"Servicio de transporte público — Frecuencias", type:"single",
      grid:"scale3", options:["Bueno","Regular","Malo"] },
    { id:"d3_10d", text:"Servicio de transporte público — Estado de los vehículos", type:"single",
      grid:"scale3", options:["Bueno","Regular","Malo"] },

    { id:"d3_11", text:"¿Utiliza las ciclorrutas del municipio?", type:"single",
      options:["Sí","No"] },
    { id:"d3_12", text:"¿Cómo percibe el estado de las ciclorrutas del municipio?", type:"single",
      grid:"scale3", condition:{q:"d3_11", equals:"Sí"},
      options:["Bueno","Regular","Malo"] },

    { id:"d3_13", text:"¿Cuáles de las siguientes percibe como un problema de movilidad en La Ceja?", type:"multi",
      options:["Congestión vehicular","Falta de señalización y semaforización","Incumplimiento de las normas de tránsito","Alto grado de accidentalidad","Déficit de vías","Inadecuada planeación","Ninguna","Todas"],
      exclusive:["Ninguna","Todas"] },

    { id:"d3_14", text:"¿Posee alguno de estos vehículos?", type:"multi",
      options:["Automóvil","Motocicleta","Bicicleta","No tengo vehículo"],
      exclusive:["No tengo vehículo"] },

    { id:"d3_15", text:"¿Cuál es el medio de transporte público que prefiere para movilizarse?", type:"single",
      options:["Bus o colectivo","Taxi","Taxi por plataformas electrónicas","no utilizo transporte público"] },

    { id:"d3_16", text:"Semanalmente, ¿con qué frecuencia sale de La Ceja?", type:"single",
      options:["1 a 3 veces","4 o más veces","No sale"] },
  ]
},

{
  id: "dim4",
  numero: "4",
  titulo: "Gestionemos nuestro desarrollo económico",
  subtitulo: "Dimensión 4 · Empleo y productividad",
  preguntas: [
    {
      id: "d4_1", text: "¿Cuál es su situación laboral actual?", type: "single",
      options: ["Empleado formal", " Trabajador informal", "Independiente", "Desempleado", "Estudiante", "Jubilado"]
    },
    { id:"d4_2", text:"¿Está buscando empleo actualmente?", type:"single",
      condition: { q: "d4_1", equals:"Desempleado"},
      options:["Sí","No"] 
    },
    {
      id: "d4_3", text:"En los últimos 12 meses, ¿considera que conseguir un empleo en este municipio ha sido?: ", type:"single",
      condition: { q: "d4_2", equals: "Sí" },
      options: ["Muy fácil", "Fácil", "Difícil", "Muy difícil"] 
    },
    {
      id: "d4_4", text: "¿Considera que en el municipio existen condiciones para empleo digno?", type: "single",
      options: ["Sí", "No"]
    },
    { id:"d4_5", text: "¿Actualmente cuenta con un emprendimiento?", type:"single",
      options:["Si", "No"]
    },
    {
      id: "d4_6", text:"Con los ingresos totales de su hogar, ¿cuál de las siguientes situaciones describe mejor su realidad? ", type:"single",
      options: ["Les alcanza bien y pueden ahorrar", 
        "Les alcanza justo sin grandes dificultades",
        "No les alcanza y tienen dificultades",
        "No les alcanza y tienen grandes dificultades"] 
    }, 
    {
      id: "d4_7", text: "En comparación con el año anterior, ¿la situación económica de su hogar ha?:", type: "single",
      options: ["Mejorado", "Permanecido igual", "Empeorado"]
    },
  ]
},

{
  id: "dim5",
  numero: "5",
  titulo: "Gestionemos nuestra seguridad",
  subtitulo: "Dimensión 5 · Seguridad y convivencia ciudadana",
  preguntas: [
    { id:"d5_1", text:"¿Cuál es su percepción acerca de la seguridad en el municipio?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d5_2", text:"En el último año, ¿usted o alguien de su familia ha sido víctima de alguno de los siguientes hechos?",
      type:"multi",
      options:["Robo a vehículo, moto o bicicleta","Homicidio","Atraco","Asalto a vivienda","Vandalismo","Conflicto armado","Delitos conexos al tráfico de drogas","Secuestro","Amenaza contra su vida, familia o bienes","Violencia intrafamiliar","Desorden doméstico","Otro","Ninguno"],
      exclusive:["Ninguno"], 
      otherTrigger:"Otro" },

    { id:"d5_3", text:"¿Usted o alguien de su familia ha sido víctima de alguno de los siguientes delitos?",
      help:"Esta pregunta mide hechos de violencia sexual... Si usted o alguien cercano lo necesita, puede comunicarse con la Línea 155 (orientación a mujeres víctimas) o el 123",
      type:"multi",
      options: ["Violación (Acceso carnal: Implica penetración (con pene, cualquier otra parte del cuerpo o un objeto) por vía vaginal, anal u oral)",
                "Acto sexual violento: (Involucra tocamientos, roces o conductas con contenido lúgubre/libidinoso, sin que exista penetración)",
                "Abuso sexual: (Actos sexuales no consentidos que se realizan sin violencia física directa, pero aprovechando la vulnerabilidad, o incapacidad de resistir de la víctima)",
                "Acoso sexual: (Solicitud de favores sexuales o conductas verbales/físicas no deseadas a razón de una posición de superioridad laboral, docente o económica)",
                "Explotación y comercio sexual: (Inducción, facilitación o provecho económico de la prostitución ajena o de la pornografía mediante coacción o engaño)",
                "Ninguno de los anteriores"],
      exclusive:["Ninguno de los anteriores"] },

    {
      id: "d5_4", text: "¿La persona víctima de dichos delitos ha sido un niño, niña o adolescente?", type: "single",
      condition: {
        q: "d5_3",
        in: [
          "Violación (Acceso carnal: Implica penetración (con pene, cualquier otra parte del cuerpo o un objeto) por vía vaginal, anal u oral)",
          "Acto sexual violento: (Involucra tocamientos, roces o conductas con contenido lúgubre/libidinoso, sin que exista penetración)",
          "Abuso sexual: (Actos sexuales no consentidos que se realizan sin violencia física directa, pero aprovechando la vulnerabilidad, o incapacidad de resistir de la víctima)",
          "Acoso sexual: (Solicitud de favores sexuales o conductas verbales/físicas no deseadas a razón de una posición de superioridad laboral, docente o económica)",
          "Explotación y comercio sexual: (Inducción, facilitación o provecho económico de la prostitución ajena o de la pornografía mediante coacción o engaño)"
        ]
      },
      options: ["Sí", "No"]
    },

    { id:"d5_5", text:"¿Percibe que en el municipio es posible movilizarse con seguridad por cualquier sector?", type:"single",
      options:["Sí","No"] },

    { id:"d5_6", text:"¿Los organismos de control y seguridad (Policía) son eficientes y efectivos?", type:"single",
      options:["Sí","No"] },

    { id:"d5_7", text:"¿Cuáles de las siguientes acciones percibe importantes para mejorar la seguridad de su sector?",
      type:"multi",
      options:["Mayor número de policías","Más solidaridad de las personas","Más efectividad de la denuncia","Más frentes de seguridad ciudadana","Mayor capacidad de reacción de las autoridades","Toque de queda para menores de edad","Generación de empleo","Oportunidades educativas","Mayor número de cámaras de seguridad","Promoción de la convivencia ciudadana","Promoción de los entornos protectores","Otra"],
      otherTrigger:"Otra" },
  ]
},

{
  id: "dim6",
  numero: "6",
  titulo: "Transformemos nuestro bienestar humano",
  subtitulo: "Dimensión 6 · Salud, cultura y deporte",
  preguntas: [
    { id:"d6_1", text:"¿Percibe el suicidio como una problemática cercana a su entorno familiar?", type:"single",
      help: "Si usted o alguien cercano está pasando por un momento difícil, puede llamar gratis a la Línea 3016273602  de salud mental. Llama al 604 553 1313 y recibe atención psicológica gratuita las 24 horas del día, los siete días de la semana",
      options:["Sí","No"] },

    { id:"d6_2", text:"¿Está afiliado al sistema de seguridad social en salud en condición de?", type:"single",
      options:["Cotizante","Beneficiario","Régimen subsidiado (Sisbén)","Régimen especial o de excepción","En trámite para afiliarme","Ninguno"] },

    { id:"d6_3", text:"¿Tiene a su cargo niños, niñas o adolescentes y vive con ellos?", type:"single",
      options:["Sí","No"] },
    {
      id: "d6_4", text:"¿Brinda a los niños, niñas y adolescentes a su cargo alimentación completa (3 comidas diarias) y balanceada?",
      type:"single", condition:{q:"d6_3", equals:"Sí"}, options:["Sí","No"] },
    { id:"d6_5", text:"¿En su hogar cuántas comidas al día consumen?", type:"single",
      options:["Una (1) comida al día","Dos (2) comidas al día","Tres (3) comidas al día","Cuatro (4) comidas al día o más"] },
    {
      id: "d6_6", text:"¿Los niños, niñas y adolescentes de su hogar reciben algún tipo de complemento nutricional?", type:"single",
      condition:{q:"d6_3", equals:"Sí"}, options:["Sí","No"] },
    { id:"d6_7", text:"¿En su hogar los niños, niñas y adolescentes que tienen edad para estudiar se encuentran desescolarizados?", type:"single",
      condition:{q:"d6_3", equals:"Sí"}, options:["Sí","No"] },

    { id:"d6_8", text:"¿Usted convive o tiene a su cargo personas adultas mayores de 60 años en adelante?", type:"single",
      options:["Sí","No"] },
    { id:"d6_9", text:"¿Brinda a las personas mayores a su cargo alimentación completa (3 comidas diarias) y balanceada?",
      type:"single", condition:{q:"d6_8", equals:"Sí"}, options:["Sí","No"] },

    { id:"d6_12", text:"¿Cómo percibe su estado de salud actual?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d6_13", text:"¿Participa usted en eventos culturales y artísticos?", type:"single",
      options:["Sí","No"] },
    { id:"d6_14", text:"¿Cuáles son sus preferencias a nivel cultural?", type:"multi",
      condition:{q:"d6_13", equals:"Sí"},
      options:["Danza","Música","Teatro","Artes plásticas","Otro","Ninguno"],
      exclusive:["Ninguno"], otherTrigger:"Otro" },

    { id:"d6_15", text:"¿En cuáles de estas actividades participó usted en el último año?", type:"multi",
      options:["Costurero","Cine","Ferias municipales","Conferencias","Festivales","Tertulias","Visitas a bibliotecas","Lectura de libros","Lectura de revistas o periódicos","Visita a sitios naturales","Visita a centros comerciales","Otro","Ninguno"],
      exclusive:["Ninguno"], otherTrigger:"Otro" },

    { id:"d6_16", text:"¿Cómo percibe la oferta de eventos culturales y artísticos en el municipio?", type:"single",
      grid:"scale", options:["Excelente","Bueno","Normal","Malo","Deficiente"] },

    { id:"d6_17", text:"¿Participa en eventos recreativos y deportivos?", type:"single",
      options:["Sí","No"] },
    { id:"d6_18", text:"¿Cuáles son sus preferencias a nivel deportivo?", type:"multi",
      condition:{q:"d6_17", equals:"Sí"},
      options:["Fútbol","Voleibol","Baloncesto","Patinaje","Deportes extremos","Ciclismo","Natación","Otro","Ninguno"],
      exclusive:["Ninguno"], otherTrigger:"Otro" },

    { id:"d6_19", text:"¿Cómo percibe la oferta de eventos recreativos y deportivos en el municipio?", type:"single",
      grid:"scale", options:["Excelente","Bueno","Normal","Malo","Deficiente"] },
  ]
},

{
  id: "dim7",
  numero: "7",
  titulo: "Transformemos nuestra educación",
  subtitulo: "Dimensión 7 · Educación y ciudadanía cultural",
  preguntas: [
    { id:"d7_1", text:"¿Cómo percibe la cobertura y calidad de los servicios educativos en La Ceja?", type:"single",
      grid:"scale", options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d7_2", text:"¿Usted o alguien de su hogar participa activamente en alguno de estos grupos o redes?",
      type:"multi",
      options:["Junta de Acción Comunal","Partido político","Veeduría ciudadana","Comités barriales o veredales","Consejos sectoriales","Mesas de trabajo","Sindicatos, cooperativas o gremios económicos","Organizaciones ambientales o de protección animal","Grupos cívicos o colectivos ciudadanos","Grupos promotores de iniciativas ciudadanas","Organizaciones religiosas","Otro","Ninguno"],
      exclusive:["Ninguno"], otherTrigger:"Otro" },

    { id:"d7_3", text:"¿Usted o alguien de su familia ha participado en la convocatoria del presupuesto participativo?",
      type:"single", options:["Sí","No"] },

    { id:"d7_4", text:"¿Usted o alguien de su hogar pertenece a alguno de los siguientes grupos?", type:"multi",
      options:["Ambientales","Juveniles","Mujeres","Voluntariado","Culturales","Personas mayores","Otro","Ninguno"],
      exclusive:["Ninguno"], otherTrigger:"Otro" },

    { id:"d7_5", text:"¿Percibe que puede expresarse libremente en cualquier espacio del municipio?", type:"single",
      options:["Sí","No"] },
  ]
},

];
