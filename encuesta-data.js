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
    { id:"g1", text:"¿Con cuál género se identifica?", type:"single",
      options:["Femenino","Masculino","Diverso","Prefiero no decir"] },

    { id:"g2", text:"¿Cuál es su rango de edad?", type:"single",
      options:["18 a 26 años","27 a 55 años","Más de 55 años"] },

    { id:"g3", text:"¿Hace cuánto vive en La Ceja del Tambo?", type:"single",
      options:["1 a 12 meses","1 a 5 años","5 años o más","Toda la vida"] },

    { id:"g4", text:"¿Trabaja en La Ceja del Tambo?", type:"single",
      options:["Sí","No"] },

    { id:"g5", text:"¿Su vivienda está ubicada en zona urbana o rural?", type:"single",
      options:["Vereda (rural)","Barrio (urbana)"] },

    { id:"g5_barrio", text:"¿En cuál barrio vive?", type:"single", grid:"select",
      condition:{q:"g5", equals:"Barrio (urbana)"},
      options:["Centro","San Cayetano","Fray Eugenio","La Floresta","Payuco","Ofir (Viva)",
        "El Tambo","Fátima (Maderos)","Hipódromo","Tahamí (Montesol)","Cuatro Esquinas",
        "María Auxiliadora","Otro"],
      otherTrigger:"Otro" },

    { id:"g5_vereda", text:"¿En cuál vereda vive?", type:"single", grid:"select",
      condition:{q:"g5", equals:"Vereda (rural)"},
      options:["Las Lomitas","El Tambo","La Milagrosa","San Nicolás","Guamito","San Miguel",
        "El Higuerón","Colmenas","Llanadas","La Loma","La Miel","La Playa","San Gerardo",
        "Fátima","San José","San Rafael","Piedras","Otra"],
      otherTrigger:"Otra" },

    { id:"g6", text:"¿Pertenece a alguno de estos grupos étnicos?", type:"multi",
      help:"Puede elegir varias opciones.",
      options:["Afrocolombiano","Rom","Raizal","Indígena","Palenquero","No aplica"],
      exclusive:["No aplica"] },

    { id:"g7", text:"¿Posee alguna condición de discapacidad?", type:"single",
      options:["Sí","No"] },

    { id:"g8", text:"¿Su condición de discapacidad es de tipo?", type:"multi",
      condition:{q:"g7", equals:"Sí"},
      options:["Sensorial","Intelectual","Física","Psíquica","Visceral","Múltiple"] },
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

    { id:"d1_5", text:"¿Cómo percibe la calidad y cobertura de los servicios públicos en su vivienda?",
      type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d1_6", text:"¿Ha utilizado los servicios del hospital en el último año?", type:"single",
      options:["Sí","No"] },

    { id:"d1_7", text:"¿Qué percepción tiene del servicio prestado por el hospital?",
      type:"single", grid:"scale",
      condition:{q:"d1_6", equals:"Sí"},
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d1_8", text:"¿Cuál es su nivel de escolaridad?", type:"single",
      options:["Primaria","Bachillerato","Técnico","Tecnológico","Profesional","Postgrado","Ninguno"] },

    { id:"d1_9", text:"¿Es usted pensionado?", type:"single",
      options:["Sí","No"] },

    { id:"d1_10", text:"¿Usted o su familia ha sido beneficiaria en el último año de alguno de estos programas?",
      type:"multi",
      options:["Familias en Acción","Programas de primera infancia","Comedor comunitario","Restaurante escolar","Bono económico","Paquete nutricional","Otro","Ninguno"],
      exclusive:["Ninguno"], otherTrigger:"Otro" },

    { id:"d1_11", text:"¿Cómo percibe la calidad de vida en el municipio?", type:"single", grid:"scale",
      options:["Excelente","Buena","Regular","Mala","Muy mala"] },

    { id:"d1_12", text:"¿Cuál es la percepción que tiene de su propia calidad de vida?", type:"single", grid:"scale",
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
    { id:"d3_9c", text:"Condiciones de accesibilidad de su zona: accesos para personas con discapacidad", type:"single",
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
    { id:"d4_1", text:"¿Considera que en el municipio existen condiciones para empleo digno?", type:"single",
      options:["Sí","No"] },
    { id:"d4_2", text:"¿Está empleado actualmente?", type:"single",
      options:["Sí","No"] },
    { id:"d4_3", text:"¿Está buscando empleo actualmente?", type:"single",
      condition:{q:"d4_2", equals:"No"},
      options:["Sí","No"] },
    { id:"d4_4", text:"¿Es usted emprendedor o trabajador independiente?", type:"single",
      options:["Sí","No"] },
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
      exclusive:["Ninguno"], otherTrigger:"Otro" },

    { id:"d5_3", text:"¿Usted o alguien de su familia ha sido víctima de alguno de los siguientes delitos?",
      help:"Esta pregunta busca medir hechos de violencia sexual con fines exclusivamente estadísticos y de planeación de política pública. Su respuesta es confidencial.",
      type:"multi",
      options:["Abuso o ataque sexual violento","Agresión sexual sin consentimiento","Corrupción de menores","Exhibicionismo sexual","Acoso sexual","Pornografía","Pedofilia con menor afectado","Proxenetismo","Constreñimiento a la prostitución","Ninguno de los anteriores"],
      exclusive:["Ninguno de los anteriores"] },

    { id:"d5_4", text:"¿Percibe que en el municipio es posible movilizarse con seguridad por cualquier sector?", type:"single",
      options:["Sí","No"] },

    { id:"d5_5", text:"¿Los organismos de control y seguridad (Policía) son eficientes y efectivos?", type:"single",
      options:["Sí","No"] },

    { id:"d5_6", text:"¿Cuáles de las siguientes acciones percibe importantes para mejorar la seguridad de su sector?",
      type:"multi",
      options:["Mayor número de policías","Más solidaridad de las personas","Más efectividad de la denuncia","Más frentes de seguridad ciudadana","Mayor capacidad de reacción de las autoridades","Toque de queda para menores","Generación de empleo","Oportunidades educativas","Mayor número de cámaras de seguridad","Promoción de la convivencia ciudadana","Promoción de los entornos protectores","Otra"],
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
      options:["Sí","No"] },

    { id:"d6_2", text:"¿Está afiliado al sistema de seguridad social en salud en condición de?", type:"single",
      options:["Cotizante","Beneficiario","Régimen subsidiado (Sisbén)","Régimen especial o de excepción","En trámite para afiliarme","Ninguno"] },

    { id:"d6_3", text:"¿Tiene a su cargo menores de edad y vive con ellos?", type:"single",
      options:["Sí","No"] },
    { id:"d6_4", text:"¿Brinda a los menores de edad a su cargo alimentación completa (3 comidas diarias) y balanceada?",
      type:"single", condition:{q:"d6_3", equals:"Sí"}, options:["Sí","No"] },
    { id:"d6_5", text:"¿En su hogar cuántas comidas al día consumen?", type:"single",
      options:["Una (1) comida al día","Dos (2) comidas al día","Tres (3) comidas al día","Cuatro (4) comidas al día o más"] },
    { id:"d6_6", text:"¿Los menores de su hogar reciben algún tipo de complemento nutricional?", type:"single",
      condition:{q:"d6_3", equals:"Sí"}, options:["Sí","No"] },
    { id:"d6_7", text:"¿En su hogar hay algún menor de edad desescolarizado?", type:"single",
      condition:{q:"d6_3", equals:"Sí"}, options:["Sí","No"] },

    { id:"d6_8", text:"¿Tiene a su cargo personas mayores de 70 años y vive con ellas?", type:"single",
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
