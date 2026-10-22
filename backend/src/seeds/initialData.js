export const initialData = {
  programas: [
    {
      id: "PROG-01",
      codigo: "ASIS-HUM",
      nombre: "Asistencia Humanitaria de Emergencia y Protección",
      linea_trabajo: "Asistencia humanitaria y protección",
      organizacion_lider: "COOPI",
      descripcion: "Orientación en necesidades urgentes, entrega de kits de habitabilidad, alimentos e insumos de primera necesidad.",
      cupos: 6700
    },
    {
      id: "PROG-02",
      codigo: "PROT-JUR",
      nombre: "Ruta de Protección y Orientación Legal",
      linea_trabajo: "Asistencia humanitaria y protección",
      organizacion_lider: "Fundación HIAS Colombia",
      descripcion: "Orientación legal en regularización migratoria, acceso a derechos y prevención de violencias.",
      cupos: 3200
    },
    {
      id: "PROG-03",
      codigo: "SAL-BIEN",
      nombre: "Salud Mental, Bienestar y Apoyo Psicosocial",
      linea_trabajo: "Salud y bienestar",
      organizacion_lider: "Fondazione L'Albero della Vita (FADV)",
      descripcion: "Acompañamiento psicosocial individual y grupal, atención a la infancia y familias.",
      cupos: 2911
    },
    {
      id: "PROG-04",
      codigo: "DISC-INCL",
      nombre: "Rehabilitación Basada en Comunidad e Inclusión",
      linea_trabajo: "Salud y bienestar",
      organizacion_lider: "Humanity and Inclusion (HI)",
      descripcion: "Atención, rehabilitación física, apoyos funcionales y enfoque de accesibilidad para personas con discapacidad.",
      cupos: 1500
    },
    {
      id: "PROG-05",
      codigo: "SOC-ECON",
      nombre: "Integración Socioeconómica y Medios de Vida",
      linea_trabajo: "Integración socioeconómica y cohesión social",
      organizacion_lider: "COOPI & FADV",
      descripcion: "Formación para el empleo, fortalecimiento de emprendimientos locales y cohesión comunitaria.",
      cupos: 1836
    }
  ],
  beneficiarios: [
    {
      id: "BEN-001",
      codigo_interno: "URB-2026-0001",
      nombres: "María Elena",
      apellidos: "Gómez Rentería",
      tipo_documento: "CC",
      numero_documento: "1038472910",
      fecha_nacimiento: "1988-05-14",
      edad: 38,
      genero: "Femenino",
      telefono: "3127894561",
      municipio: "Apartadó",
      direccion_comunidad: "Barrio Obrero, Sector La Paz",
      condicion_poblacional: "Víctima del conflicto armado",
      discapacidad: "Ninguna",
      autorizacion_datos: true,
      fecha_registro: "2026-02-10T09:30:00.000Z",
      familiares: [
        {
          id: "FAM-001-1",
          nombres: "Carlos Andrés Gómez",
          parentesco: "Hijo/a",
          edad: 14,
          documento: "TI 1098234123",
          observaciones: "Estudiante secundaria"
        },
        {
          id: "FAM-001-2",
          nombres: "Rosa Rentería",
          parentesco: "Madre",
          edad: 64,
          documento: "CC 32456789",
          observaciones: "Adulto mayor a cargo"
        }
      ]
    },
    {
      id: "BEN-002",
      codigo_interno: "URB-2026-0002",
      nombres: "Yenifer Carolina",
      apellidos: "Mendoza Silva",
      tipo_documento: "PPT",
      numero_documento: "PPT-98745632",
      fecha_nacimiento: "1995-11-22",
      edad: 30,
      genero: "Femenino",
      telefono: "3201478523",
      municipio: "Necoclí",
      direccion_comunidad: "Sector El Muelle",
      condicion_poblacional: "Migrante / Refugiada",
      discapacidad: "Ninguna",
      autorizacion_datos: true,
      fecha_registro: "2026-02-15T11:15:00.000Z",
      familiares: [
        {
          id: "FAM-002-1",
          nombres: "Samuel David Mendoza",
          parentesco: "Hijo/a",
          edad: 4,
          documento: "Sin Documento",
          observaciones: "En proceso de registro civil"
        }
      ]
    },
    {
      id: "BEN-003",
      codigo_interno: "URB-2026-0003",
      nombres: "José Luis",
      apellidos: "Mosquera Palacios",
      tipo_documento: "CC",
      numero_documento: "71289456",
      fecha_nacimiento: "1979-08-03",
      edad: 47,
      genero: "Masculino",
      telefono: "3145698712",
      municipio: "Turbo",
      direccion_comunidad: "Corregimiento Nueva Colonia",
      condicion_poblacional: "Comunidad de acogida",
      discapacidad: "Física",
      autorizacion_datos: true,
      fecha_registro: "2026-02-20T14:00:00.000Z",
      familiares: [
        {
          id: "FAM-003-1",
          nombres: "Luz Dary Mosquera",
          parentesco: "Cónyuge / Pareja",
          edad: 45,
          documento: "CC 43567890",
          observaciones: "Apoyo principal"
        }
      ]
    },
    {
      id: "BEN-004",
      codigo_interno: "URB-2026-0004",
      nombres: "Ana Sofía",
      apellidos: "Pérez Blanco",
      tipo_documento: "SIN_DOCUMENTO",
      numero_documento: "",
      fecha_nacimiento: "2002-04-18",
      edad: 24,
      genero: "Femenino",
      telefono: "3004561234",
      municipio: "Apartadó",
      direccion_comunidad: "Asentamiento San Fernando",
      condicion_poblacional: "Desplazado interno",
      discapacidad: "Ninguna",
      autorizacion_datos: true,
      fecha_registro: "2026-03-01T10:00:00.000Z",
      familiares: []
    }
  ],
  vinculaciones: [
    {
      id: "VINC-001",
      beneficiario_id: "BEN-001",
      codigo_interno: "URB-2026-0001",
      programa_id: "PROG-01",
      programa_nombre: "Asistencia Humanitaria de Emergencia y Protección",
      linea_trabajo: "Asistencia humanitaria y protección",
      fecha_vinculacion: "2026-02-10",
      estado: "finalizado",
      observaciones: "Fase inicial de entrega completada satisfactoriamente."
    },
    {
      id: "VINC-002",
      beneficiario_id: "BEN-001",
      codigo_interno: "URB-2026-0001",
      programa_id: "PROG-05",
      programa_nombre: "Integración Socioeconómica y Medios de Vida",
      linea_trabajo: "Integración socioeconómica y cohesión social",
      fecha_vinculacion: "2026-02-25",
      estado: "en proceso",
      observaciones: "Participando en taller de confección y emprendimiento."
    },
    {
      id: "VINC-003",
      beneficiario_id: "BEN-002",
      codigo_interno: "URB-2026-0002",
      programa_id: "PROG-02",
      programa_nombre: "Ruta de Protección y Orientación Legal",
      linea_trabajo: "Asistencia humanitaria y protección",
      fecha_vinculacion: "2026-02-15",
      estado: "en proceso",
      observaciones: "Acompañamiento en registro civil de su hijo menor."
    },
    {
      id: "VINC-004",
      beneficiario_id: "BEN-003",
      codigo_interno: "URB-2026-0003",
      programa_id: "PROG-04",
      programa_nombre: "Rehabilitación Basada en Comunidad e Inclusión",
      linea_trabajo: "Salud y bienestar",
      fecha_vinculacion: "2026-02-20",
      estado: "en proceso",
      observaciones: "Evaluación de movilidad y solicitud de ayuda técnica."
    }
  ],
  atenciones: [
    {
      id: "ATEN-001",
      beneficiario_id: "BEN-001",
      codigo_interno: "URB-2026-0001",
      fecha: "2026-02-12",
      tipo_atencion: "Entrega de Kit de Emergencia / Habitabilidad",
      linea_trabajo: "Asistencia humanitaria y protección",
      descripcion: "Entrega de kit de higiene familiar y kit de alimentos no perecederos para 4 personas.",
      responsable: "Laura Carmona (Trabajadora Social)",
      entidad: "COOPI",
      resultado: "Kit entregado a conformidad con firma de planilla y registro fotográfico.",
      remision: "Remitida a FADV para valoración psicosocial."
    },
    {
      id: "ATEN-002",
      beneficiario_id: "BEN-001",
      codigo_interno: "URB-2026-0001",
      fecha: "2026-03-05",
      tipo_atencion: "Capacitación para el Empleo / Taller",
      linea_trabajo: "Integración socioeconómica y cohesión social",
      descripcion: "Módulo I: Modelado de negocio y costos para emprendimientos en confección.",
      responsable: "Mateo Vélez (Facilitador de Emprendimiento)",
      entidad: "FADV",
      resultado: "Asistencia completa, plan de negocio inicial elaborado.",
      remision: "Ninguna"
    },
    {
      id: "ATEN-003",
      beneficiario_id: "BEN-002",
      codigo_interno: "URB-2026-0002",
      fecha: "2026-02-18",
      tipo_atencion: "Asesoría Legal / Regularización Migratoria",
      linea_trabajo: "Asistencia humanitaria y protección",
      descripcion: "Orientación jurídica para la vigencia del PPT y trámite de nacionalidad del menor.",
      responsable: "Dra. Natalia Hincapié (Abogada HIAS)",
      entidad: "Fundación HIAS Colombia",
      resultado: "Documentación revisada y radicada ante Registraduría Municipal de Necoclí.",
      remision: "Remisión a Defensoría del Pueblo para seguimiento."
    },
    {
      id: "ATEN-004",
      beneficiario_id: "BEN-003",
      codigo_interno: "URB-2026-0003",
      fecha: "2026-02-24",
      tipo_atencion: "Valoración en Salud y Ayuda Técnica",
      linea_trabajo: "Salud y bienestar",
      descripcion: "Evaluación fisioterapéutica de movilidad reducida en miembro inferior.",
      responsable: "Camilo Quintero (Fisioterapeuta)",
      entidad: "Humanity and Inclusion (HI)",
      resultado: "Prescripción de bastón canadiense ortopédico y plan de ejercicios domiciliarios.",
      remision: "Hospital San Sebastián de Urabá"
    }
  ],
  seguimientos: [
    {
      id: "SEG-001",
      beneficiario_id: "BEN-001",
      codigo_interno: "URB-2026-0001",
      fecha: "2026-03-12",
      avance_novedad: "La beneficiaria inició la producción de sus primeras prendas y organizó su espacio de trabajo.",
      observaciones: "Muestra alta motivación y compromiso. Familia reporta estabilidad en vivienda.",
      accion_pendiente: "Entregar kit de insumos y telas programado para la semana entrante.",
      proximo_contacto: "2026-04-05",
      estado_pendiente: "pendiente"
    },
    {
      id: "SEG-002",
      beneficiario_id: "BEN-002",
      codigo_interno: "URB-2026-0002",
      fecha: "2026-03-02",
      avance_novedad: "La Registraduría emitió cita para la huella dactilar y validación de documentos.",
      observaciones: "La usuaria asistió puntualmente a la orientación preparatoria.",
      accion_pendiente: "Acompañar a la cita en Registraduría de Necoclí el 15 de abril.",
      proximo_contacto: "2026-04-15",
      estado_pendiente: "pendiente"
    },
    {
      id: "SEG-003",
      beneficiario_id: "BEN-003",
      codigo_interno: "URB-2026-0003",
      fecha: "2026-03-10",
      avance_novedad: "Se entregó el bastón canadiense. El usuario reporta disminución notable del dolor al caminar.",
      observaciones: "Cumple con los ejercicios diarios recomendados por el equipo de HI.",
      accion_pendiente: "Control fisioterapéutico de seguimiento en 30 días.",
      proximo_contacto: "2026-04-10",
      estado_pendiente: "completado"
    }
  ]
};
