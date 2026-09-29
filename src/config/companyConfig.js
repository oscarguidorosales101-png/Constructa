/**
 * CONSTRUCTA — Configuración Empresarial Centralizada
 * 
 * Este archivo centraliza la información institucional, identidad, valores,
 * proyectos demostrativos, video, logros y vacantes laborales del sistema.
 * 
 * Permite cambiar la empresa o migrar la plataforma a otra entidad constructora
 * modificando únicamente estos parámetros, sin alterar el código de los componentes.
 */

export const COMPANY_CONFIG = {
  // 1. IDENTIDAD CORPORATIVA
  identity: {
    commercialName: 'CONSTRUCTA',
    legalName: 'Constructa Infraestructuras y Edificaciones S.A. de C.V.',
    acronym: 'CST',
    tagline: 'Ingeniería, Edificación y Construcción de Alto Nivel',
    shortDescription: 'Líder en edificación vertical residencial, complejos corporativos, obra civil pesada y centros logísticos sustentables de alta precisión técnica.',
    longDescription: 'Con más de 18 años de trayectoria ininterrumpida, CONSTRUCTA transforma entornos urbanos mediante ingeniería avanzada, metodologías BIM de vanguardia y un riguroso compromiso con la seguridad operativa, el control presupuestal y la sustentabilidad ambiental.',
    foundedYear: 2008,
    yearsOfExperience: 18,
    collaboratorsCount: 62,
    headquarters: 'Ciudad de México, México',
    badge: 'Empresa Certificada ISO 9001 / LEED Partner',
  },

  // 2. CONTACTO Y LOGÍSTICA
  contact: {
    address: 'Av. Insurgentes Sur #1602, Piso 11, Col. Crédito Constructor, Benito Juárez, CDMX, C.P. 03940',
    city: 'Ciudad de México',
    country: 'México',
    phone: '+52 (55) 8432-9000',
    phoneAlt: '+52 (55) 8432-9001',
    whatsapp: '+52 55 1234 5678',
    whatsappClean: '525512345678',
    email: 'contacto@constructa.com',
    recruitmentEmail: 'reclutamiento@constructa.com',
    commercialEmail: 'ventas@constructa.com',
    supportEmail: 'operaciones@constructa.com',
    businessHours: 'Lunes a Viernes: 08:00 - 18:30 | Sábados: 09:00 - 14:00',
    emergencyHours: 'Patio de maniobras y descarga 24/7 con previa cita logística',
    googleMapsEmbedUrl: 'https://maps.google.com/maps?q=Av.+Insurgentes+Sur+1602,+Cr%C3%A9dito+Constructor,+Benito+Ju%C3%A1rez,+03940+Ciudad+de+M%C3%A9xico,+CDMX&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },

  // 3. FILOSOFÍA INSTITUCIONAL
  philosophy: {
    history: 'Fundada en 2008 por un equipo interdisciplinario de ingenieros civiles y arquitectos visionarios, CONSTRUCTA nació con el propósito de elevar los estándares de precisión estructural en el centro del país. A lo largo de casi dos décadas, hemos entregado más de 140 desarrollos emblemáticos, superando los 850,000 m² construidos con cero siniestros graves y un estricto cumplimiento en plazos de entrega.',
    mission: 'Materializar proyectos arquitectónicos y de infraestructura de gran envergadura con los más altos estándares de calidad, seguridad y cumplimiento normativo, transformando los entornos urbanos y generando valor sustentable para nuestros clientes, inversionistas y la sociedad.',
    vision: 'Consolidarnos como el grupo constructor más confiable, tecnológicamente avanzado y eficiente de la región, siendo referente indiscutible de integridad operativa, sostenibilidad ambiental y excelencia en la ejecución de obra.',
    values: [
      {
        id: 'val-1',
        title: 'Excelencia Técnica',
        desc: 'Aplicación estricta de normas sísmicas y estándares de cálculo con supervisión continua de laboratorio en cada colado y estructura.',
        icon: 'ShieldCheck',
      },
      {
        id: 'val-2',
        title: 'Seguridad Integral',
        desc: 'Cultura de cero accidentes con protocolos de protección personal y ambiental certificados en cada frente de obra.',
        icon: 'HardHat',
      },
      {
        id: 'val-3',
        title: 'Transparencia Financiera',
        desc: 'Rigor contable, control analítico de presupuestos y honestidad comercial en cada contrato y subcontrata.',
        icon: 'DollarSign',
      },
      {
        id: 'val-4',
        title: 'Puntualidad en Plazos',
        desc: 'Planificación minuciosa mediante cronogramas de ruta crítica y monitoreo semanal de avance físico real.',
        icon: 'Clock',
      },
      {
        id: 'val-5',
        title: 'Sustentabilidad Activa',
        desc: 'Optimización de insumos, mitigación de residuos y aplicación de criterios LEED de eficiencia energética.',
        icon: 'Leaf',
      },
      {
        id: 'val-6',
        title: 'Compromiso Humano',
        desc: 'Desarrollo permanente de nuestras cuadrillas de personal, ingenieros y especialistas con trato justo y seguro.',
        icon: 'Users',
      },
    ],
  },

  // 4. LOGROS Y MÉTRICAS CORPORATIVAS
  stats: [
    {
      id: 'stat-projects',
      value: 145,
      suffix: '+',
      label: 'Proyectos Ejecutados',
      sublabel: 'Obras entregadas conforme a pliego',
    },
    {
      id: 'stat-meters',
      value: 850,
      suffix: 'k m²',
      label: 'Superficie Construida',
      sublabel: 'En edificación vertical y obra civil',
    },
    {
      id: 'stat-experience',
      value: 18,
      suffix: ' Años',
      label: 'Trayectoria Empresarial',
      sublabel: 'Experiencia ininterrumpida en el sector',
    },
    {
      id: 'stat-team',
      value: 62,
      suffix: '+',
      label: 'Colaboradores Activos',
      sublabel: 'Ingenieros, técnicos y cuadrillas de obra',
    },
    {
      id: 'stat-clients',
      value: 120,
      suffix: '+',
      label: 'Clientes Satisfechos',
      sublabel: 'Corporativos, gobiernos y desarrolladores',
    },
    {
      id: 'stat-satisfaction',
      value: 99.4,
      suffix: '%',
      label: 'Índice de Calidad',
      sublabel: 'Conformidad en entrega final de proyectos',
    },
  ],

  // 5. CERTIFICACIONES Y ACREDITACIONES
  certifications: [
    {
      title: 'ISO 9001:2015',
      entity: 'Sistema de Gestión de la Calidad en Construcción',
      badge: 'Certificado Vigente',
    },
    {
      title: 'ISO 14001:2015',
      entity: 'Sistema de Gestión Ambiental en Frentes de Obra',
      badge: 'Sustentabilidad',
    },
    {
      title: 'LEED Gold / Platinum Partner',
      entity: 'U.S. Green Building Council',
      badge: 'Edificación Sustentable',
    },
    {
      title: 'Distintivo ESR®',
      entity: 'Centro Mexicano para la Filantropía',
      badge: 'Empresa Socialmente Responsable',
    },
  ],

  // 6. ESPECIALIDADES Y LÍNEAS DE NEGOCIO
  specialties: [
    {
      id: 'esp-residencial',
      title: 'Edificación Residencial Vertical',
      tag: 'Vivienda Premium & Multifamiliar',
      description: 'Torres departamentales de 15 a 35 niveles con cimentaciones profundas, sótanos estructurados, acabados de primer nivel y amenidades integradas.',
      features: ['Estructuras sismo-resistentes', 'Acústica de vanguardia', 'Eficiencia lumínica y térmica'],
      icon: 'Building2',
    },
    {
      id: 'esp-corporativo',
      title: 'Complejos Corporativos y Comerciales',
      tag: 'Oficinas & Centros Comerciales',
      description: 'Centros empresariales clase A+, muros cortina de cristal térmico, sistemas de climatización inteligente HVAC y certificaciones ambientales LEED.',
      features: ['Plantas libres de columnas', 'Cableado estructurado central', 'Accesibilidad universal total'],
      icon: 'Briefcase',
    },
    {
      id: 'esp-industrial',
      title: 'Naves Industriales y Centros Logísticos',
      tag: 'Infraestructura de Almacenaje',
      description: 'Naves de estructura metálica de grandes claros, pisos industriales de alta resistencia con fibras poliméricas, andenes de carga y patios de maniobras.',
      features: ['Pisos de alta planicidad', 'Sistemas contra incendio NFPA', 'Cubiertas aislantes KR-18'],
      icon: 'Warehouse',
    },
    {
      id: 'esp-civil',
      title: 'Obra Civil e Infraestructura Vial',
      tag: 'Puentes, Vialidades & Hidráulica',
      description: 'Pasos a desnivel, puentes vehiculares, colectores pluviales, plantas de tratamiento y urbanización de frentes metropolitanos.',
      features: ['Hormigones hidráulicos especiales', 'Topografía satelital y drones', 'Control geotécnico estricto'],
      icon: 'Truck',
    },
    {
      id: 'esp-remodelacion',
      title: 'Reingeniería y Remodelación Mayor',
      tag: 'Rehabilitación Estructural',
      description: 'Refuerzo de columnas y trabes con polímeros reforzados de carbono (CFRP), adecuación sísmica de inmuebles y modernización de instalaciones.',
      features: ['Diagnóstico no destructivo', 'Intervención sin desalojo', 'Dictamen pericial certificado'],
      icon: 'Hammer',
    },
    {
      id: 'esp-epc',
      title: 'Gestión Integral EPC (Project Management)',
      tag: 'Llave en Mano',
      description: 'Acompañamiento integral desde la concepción del anteproyecto, tramitología, modelado BIM 5D, ejecución y liquidación de obra.',
      features: ['Supervisión 360° en tiempo real', 'Control estricto de costos', 'Garantía extendida de vicios ocultos'],
      icon: 'FileCheck',
    },
  ],

  // 7. VIDEO INSTITUCIONAL
  video: {
    title: 'Nuestra Metodología en Obra: Solidez que Inspira Confianza',
    subtitle: 'Un recorrido por nuestros frentes de trabajo, procesos constructivos y el equipo humano que lidera la ingeniería de CONSTRUCTA.',
    src: './video/CONSTRUCTA_guion_completo_16x9_CORREGIDO.mp4',
    mimeType: 'video/mp4',
    poster: '',
    duration: '2:15 min',
    highlights: [
      'Ingeniería sismo-resistente y supervisión geotécnica',
      'Protocolos HSE certificados para máxima seguridad laboral',
      'Metodología BIM 5D conectada con compras y presupuestos',
      'Compromiso irrestricto con plazos y especificaciones',
    ],
  },

  // 8. GALERÍA VISUAL DE OBRAS
  gallery: [
    {
      id: 'gal-1',
      title: 'Torre Altavista Residencial — Nivel 18',
      category: 'Edificación Vertical',
      location: 'Distrito Metropolitano, CDMX',
      description: 'Losa postensada de alta resistencia y fachada ventilada con vistas panorámicas.',
      aspectRatio: '16/9',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'gal-2',
      title: 'Complejo Corporativo Nexus',
      category: 'Corporativo & Comercial',
      location: 'Boulevard Empresarial Poniente',
      description: 'Montaje de estructura metálica pesada IPE y muro cortina de alta eficiencia térmica.',
      aspectRatio: '16/9',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'gal-3',
      title: 'Puente Bicentenario y Vías de Conexión',
      category: 'Obra Civil e Infraestructura',
      location: 'Autopista Periférica Km 34.5',
      description: 'Colado masivo de zapatas y colocación de trabes pretensadas de 40 toneladas.',
      aspectRatio: '16/9',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'gal-4',
      title: 'Centro Logístico e Industrial Norte',
      category: 'Industrial & Almacenaje',
      location: 'Parque Industrial Milenium',
      description: 'Pisos industriales con acabado espejo y resistencia a cargas dinámicas de 8 ton/m².',
      aspectRatio: '16/9',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'gal-5',
      title: 'Condominio Los Cedros — Urbanización Fase II',
      category: 'Residencial',
      location: 'Sector Campestre, Valle Alto',
      description: 'Tendido de redes subterráneas hidrosanitarias y pavimentación con concreto hidráulico.',
      aspectRatio: '16/9',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'gal-6',
      title: 'Supervisión de Calidad y Ensayos de Concreto',
      category: 'Control de Calidad',
      location: 'Laboratorio de Materiales de Obra',
      description: 'Pruebas de revenimiento y compresión cilíndrica a 7, 14 y 28 días.',
      aspectRatio: '16/9',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    },
  ],

  // 9. VACANTES LABORALES (TRABAJA CON NOSOTROS)
  vacancies: [
    {
      id: 'VAC-001',
      puesto: 'Ingeniero Residente de Edificación Vertical',
      area: 'Ingeniería y Supervisión de Obra',
      tipoJornada: 'Tiempo Completo',
      modalidad: 'Presencial en Frente de Obra',
      ubicacion: 'Ciudad de México (Torre Altavista)',
      experienciaMinima: '4 a 6 años',
      rangoSalarial: '$35,000 - $45,000 MXN mensuales',
      estado: 'Abierta',
      fechaPublicacion: '2026-03-20',
      descripcion: 'Buscamos un Ingeniero Civil titulado con experiencia comprobada en supervisión de estructuras de concreto armado sismo-resistente de más de 15 niveles, coordinación de subcontratas y control de bitácora.',
      responsabilidades: [
        'Supervisión técnica diaria de cuadrillas de fierreros, carpinteros y colados.',
        'Control y validación de estimaciones de avance físico y calidad de materiales.',
        'Coordinación directa con laboratorio de mecánica de suelos y control de calidad.',
        'Cumplimiento estricto del programa de obra y matriz de seguridad laboral.',
      ],
      requisitos: [
        'Título y Cédula Profesional en Ingeniería Civil o Arquitectura.',
        'Manejo de AutoCAD, Opus / Neodata y lectura experta de planos estructurales.',
        'Experiencia mínima de 4 años en obras verticales multifamiliares.',
        'Liderazgo de cuadrillas, resolución de interferencias y comunicación asertiva.',
      ],
      beneficios: [
        'Prestaciones superiores a la ley (Seguro de gastos médicos mayores, fondo de ahorro).',
        'Bono por cumplimiento de hitos de entrega en cronograma.',
        'Capacitación continua en metodologías BIM y certificación LEED.',
      ],
    },
    {
      id: 'VAC-002',
      puesto: 'Superintendente de Estructuras y Montaje Metálico',
      area: 'Construcción y Operaciones',
      tipoJornada: 'Tiempo Completo',
      modalidad: 'Presencial en Obra',
      ubicacion: 'Ciudad de México (Complejo Nexus)',
      experienciaMinima: '7+ años',
      rangoSalarial: '$42,000 - $55,000 MXN mensuales',
      estado: 'Abierta',
      fechaPublicacion: '2026-03-18',
      descripcion: 'Responsable de la dirección operativa del montaje de estructura metálica pesada, supervisión de soldaduras certificadas (AWS D1.1), torqueo de tornillería A325/A490 e izajes críticos.',
      responsabilidades: [
        'Planificación y autorización de planes de izaje con grúas telescópicas y torre.',
        'Revisión de reportes de inspección no destructiva de soldaduras (ultrasonido y líquidos penetrantes).',
        'Coordinación de frentes de colado de losas colaborantes con lámina losacero.',
        'Gestión de personal de montaje, pailería y soldadores calificados.',
      ],
      requisitos: [
        'Ingeniero Civil o Mecánico con especialidad en estructuras de acero.',
        'Certificación o conocimientos sólidos en normas AISC y AWS.',
        'Mínimo 7 años en dirección de montajes de gran volumen.',
        'Disponibilidad de horario para maniobras programadas en fines de semana.',
      ],
      beneficios: [
        'Sueldo competitivo con esquema mixto de bonos por tonelaje montado.',
        'Camioneta utilitaria asignada para traslados operativos.',
        'Plan de carrera hacia la Dirección de Operaciones.',
      ],
    },
    {
      id: 'VAC-003',
      puesto: 'Coordinador de Seguridad Industrial y Salud en el Trabajo (HSE)',
      area: 'Seguridad y Medio Ambiente',
      tipoJornada: 'Tiempo Completo',
      modalidad: 'Presencial en Frentes de Obra',
      ubicacion: 'Zona Metropolitana CDMX',
      experienciaMinima: '3 a 5 años',
      rangoSalarial: '$26,000 - $32,000 MXN mensuales',
      estado: 'Abierta',
      fechaPublicacion: '2026-03-22',
      descripcion: 'Profesional enfocado en garantizar la política de Cero Accidentes de CONSTRUCTA, aplicación de las normas oficiales NOM-031-STPS y capacitación constante de personal operativo.',
      responsabilidades: [
        'Impartición de pláticas de seguridad de 5 minutos al inicio de cada jornada.',
        'Inspección y liberación de líneas de vida, andamios multidireccionales y arneses.',
        'Elaboración de análisis de riesgo de trabajo (ART) y permisos de trabajo en caliente / alturas.',
        'Investigación de conatos y control estadístico de índices de accidentabilidad.',
      ],
      requisitos: [
        'Licenciatura o Ingeniería en Seguridad Industrial, Ambiental o afín.',
        'DC-3 y DC-5 en trabajos en alturas, espacios confinados y combate de incendios.',
        'Dominio de normatividad STPS vigente (NOM-009, NOM-027, NOM-031).',
        'Carácter firme, vocación preventiva y trabajo en equipo.',
      ],
      beneficios: [
        'Equipo de protección personal especializado de alta gama.',
        'Seguro de vida y gastos médicos complementarios.',
        'Estabilidad laboral en proyectos de largo plazo.',
      ],
    },
    {
      id: 'VAC-004',
      puesto: 'Topógrafo Especialista en Obra Civil con Estación Total y Dron',
      area: 'Topografía y Geotecnia',
      tipoJornada: 'Tiempo Completo',
      modalidad: 'Campo / Obra',
      ubicacion: 'Autopista Periférica (Puente Bicentenario)',
      experienciaMinima: '3 a 5 años',
      rangoSalarial: '$24,000 - $30,000 MXN mensuales',
      estado: 'Abierta',
      fechaPublicacion: '2026-03-15',
      descripcion: 'Encargado del trazo, nivelación y control geométrico de precisión para cimentaciones de puente, pilas perforadas, terraplenes y rasantes viales.',
      responsabilidades: [
        'Levantamiento y replanteo de ejes, zapatas y apoyos con estación total y GPS RTK.',
        'Vuelos fotogramétricos con dron para cálculo volumétrico de movimientos de tierra.',
        'Procesamiento de datos en CivilCAD y entrega de reportes volumétricos quincenales.',
        'Monitoreo de posibles asentamientos y desplomes en estructuras adyacentes.',
      ],
      requisitos: [
        'Ingeniero Topógrafo o Técnico en Topografía titulado.',
        'Dominio de equipos Leica / Trimble y software Civil 3D.',
        'Licencia de piloto de dron vigente expedida por AFAC.',
        'Experiencia comprobada en obras de infraestructura vial.',
      ],
      beneficios: [
        'Viáticos y equipo de topografía de última generación provisto por la empresa.',
        'Prestaciones de ley y seguro contra accidentes en campo.',
      ],
    },
    {
      id: 'VAC-005',
      puesto: 'Oficial Albañil / Fierrero Especialista',
      area: 'Mano de Obra y Cuadrillas',
      tipoJornada: 'Jornada Completa de Obra',
      modalidad: 'Presencial en Frente',
      ubicacion: 'Varios Frentes (CDMX y Valle Alto)',
      experienciaMinima: '2 a 4 años',
      rangoSalarial: '$4,200 - $5,500 MXN semanales',
      estado: 'Abierta',
      fechaPublicacion: '2026-03-24',
      descripcion: 'Buscamos oficiales de obra con habilidad en habilitado de acero de refuerzo, colocación de cimbra aparente, muros de block estructurado y colado de elementos estructurales.',
      responsabilidades: [
        'Corte, doblado y amarre de varilla corrugada conforme a planillas de despiece.',
        'Armado de trabes, columnas y losas cumpliendo recubrimientos reglamentarios.',
        'Uso seguro de herramientas eléctricas (cortadora, dobladora y vibrador de concreto).',
      ],
      requisitos: [
        'Experiencia mínima de 2 años en obras de edificación.',
        'Compromiso, puntualidad y actitud de trabajo en equipo.',
        'Cumplimiento estricto del uso de equipo de protección personal.',
      ],
      beneficios: [
        'Pago semanal puntual vía nómina bancaria.',
        'Alta inmediata en IMSS con salario real cotizado.',
        'Dotación de botas de casquillo, chaleco reflectante y casco.',
      ],
    },
    {
      id: 'VAC-006',
      puesto: 'Analista de Precios Unitarios y Presupuestos',
      area: 'Costos y Presupuestos',
      tipoJornada: 'Tiempo Completo',
      modalidad: 'Híbrida (Oficina Central / Remoto)',
      ubicacion: 'Oficinas Centrales Insurgentes',
      experienciaMinima: '3 a 5 años',
      rangoSalarial: '$28,000 - $35,000 MXN mensuales',
      estado: 'En pausa',
      fechaPublicacion: '2026-03-10',
      descripcion: 'Integración de matrices de precios unitarios, explosión de insumos, cotizaciones con proveedores comerciales y elaboración de presupuestos ejecutivos.',
      responsabilidades: [
        'Análisis de rendimientos de mano de obra y costos horarios de maquinaria.',
        'Cálculo de factores de sobrecosto (financiamiento, indirectos y utilidad).',
        'Elaboración de propuestas técnico-económicas para licitaciones privadas y públicas.',
      ],
      requisitos: [
        'Ingeniero Civil o Arquitecto.',
        'Manejo avanzado de Neodata / Opus y Excel financiero.',
        'Conocimiento actualizado de la Ley de Obras Públicas y su Reglamento.',
      ],
      beneficios: [
        'Esquema híbrido de trabajo (3 días oficina / 2 días home office).',
        'Vales de despensa y seguro de gastos médicos.',
      ],
    },
    {
      id: 'VAC-007',
      puesto: 'Jefe de Almacén y Control de Suministros en Obra',
      area: 'Logística y Almacén',
      tipoJornada: 'Tiempo Completo',
      modalidad: 'Presencial',
      ubicacion: 'Centro Logístico Norte',
      experienciaMinima: '3 a 5 años',
      rangoSalarial: '$20,000 - $25,000 MXN mensuales',
      estado: 'Cerrada',
      fechaPublicacion: '2026-02-28',
      descripcion: 'Control físico de entradas y salidas de materiales, resguardo de herramientas pesadas y registro Kardex en sistema.',
      responsabilidades: [
        'Cotejo físico contra órdenes de compra y remisiones de proveedor.',
        'Control estricto de mermas y auditorías periódicas de inventario.',
      ],
      requisitos: [
        'Experiencia en almacenes de construcción.',
        'Manejo de sistemas de inventario y ERP.',
      ],
      beneficios: [
        'Vacante cubierta satisfactoriamente en el proceso anterior.',
      ],
    },
  ],
};

export default COMPANY_CONFIG;
