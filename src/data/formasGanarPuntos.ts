export interface FormaGanarPuntos {
  id: string;
  num: number;
  title: string;
  category: "account" | "exploration" | "community" | "knowledge" | "eco_events";
  categoryLabel: string;
  xpReward: number;
  coinReward: number;
  frequency: string;
  frequencyType: "one_time" | "daily" | "per_action" | "recurring" | "milestone";
  badgeText: string;
  badgeColor: string;
  iconName: string;
  description: string;
  requirements: string[];
  actionLabel: string;
  actionRoute?: string;
  actionModal?: string;
  isPopular?: boolean;
}

export const CATEGORIAS_PUNTOS = [
  { id: "all", label: "Todas las Formas (14)" },
  { id: "account", label: "Registro & Comunidad" },
  { id: "exploration", label: "Exploración & GPS" },
  { id: "knowledge", label: "Conocimiento & Contenido" },
  { id: "eco_events", label: "Sostenibilidad & Eventos" }
] as const;

export const FORMAS_GANAR_PUNTOS: FormaGanarPuntos[] = [
  {
    id: "registro-inicial",
    num: 1,
    title: "Crear tu Cuenta y Pasaporte Digital",
    category: "account",
    categoryLabel: "Registro & Bienvenida",
    xpReward: 100,
    coinReward: 100,
    frequency: "Única vez",
    frequencyType: "one_time",
    badgeText: "Bono de Bienvenida",
    badgeColor: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    iconName: "UserPlus",
    description: "Crea tu cuenta de explorador en Descubre RD y activa tu Pasaporte Digital con tu primer sello consular.",
    requirements: [
      "Registro completo con nombre, email y contraseña",
      "Confirmación de correo electrónico",
      "Creación automática de tu pasaporte digital y número de explorador"
    ],
    actionLabel: "Crear Cuenta",
    actionRoute: "/registro",
    isPopular: true
  },
  {
    id: "invitar-amigos",
    num: 2,
    title: "Invitar Amigos (Referidos Verificados)",
    category: "account",
    categoryLabel: "Comunidad & Crecimiento",
    xpReward: 100,
    coinReward: 100,
    frequency: "Por amigo registrado",
    frequencyType: "per_action",
    badgeText: "Recompensa Doble",
    badgeColor: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    iconName: "Users",
    description: "Comparte tu enlace o código de referido. Cuando tu invitado complete su registro, ambos reciben 100 XP y 100 Monedas.",
    requirements: [
      "El invitado debe registrarse usando tu código único",
      "El invitado debe confirmar su cuenta",
      "Sin límite de amigos referidos"
    ],
    actionLabel: "Invitar Amigos",
    actionModal: "referrals",
    isPopular: true
  },
  {
    id: "suscribir-boletin",
    num: 3,
    title: "Suscribirte al Boletín Oficial Turístico",
    category: "account",
    categoryLabel: "Información & Noticias",
    xpReward: 50,
    coinReward: 50,
    frequency: "Única vez",
    frequencyType: "one_time",
    badgeText: "Directo al Email",
    badgeColor: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    iconName: "Mail",
    description: "Recibe guías de fin de semana, aperturas de hoteles, promociones exclusivas y rutas secretas de República Dominicana.",
    requirements: [
      "Ingresar correo electrónico en el formulario de newsletter",
      "Aceptar recepción del boletín turístico",
      "Acreditación instantánea de 50 XP y 50 Monedas"
    ],
    actionLabel: "Suscribirme al Boletín",
    actionModal: "newsletter",
    isPopular: false
  },
  {
    id: "retos-misiones",
    num: 4,
    title: "Completar Retos y Misiones Turísticas",
    category: "exploration",
    categoryLabel: "Expediciones & Desafíos",
    xpReward: 350,
    coinReward: 150,
    frequency: "Por cada misión",
    frequencyType: "per_action",
    badgeText: "Alta Recompensa",
    badgeColor: "bg-purple-500/15 text-purple-600 border-purple-500/30",
    iconName: "Target",
    description: "Cumple desafíos temáticos como la ascensión al Pico Duarte, la expedición a Bahía de las Águilas o la ruta de cascadas de Jarabacoa.",
    requirements: [
      "Seleccionar una misión activa en el panel de retos",
      "Cumplir las metas del desafío (visita, fotografía o actividad)",
      "Recibir sello de misión y puntos automáticos"
    ],
    actionLabel: "Ver Misiones Activas",
    actionRoute: "/gamificacion-turistica/retos",
    isPopular: true
  },
  {
    id: "checkin-gps",
    num: 5,
    title: "Check-in Georreferenciado GPS en Provincias",
    category: "exploration",
    categoryLabel: "Exploración en Terreno",
    xpReward: 150,
    coinReward: 75,
    frequency: "Por monumento / provincia",
    frequencyType: "per_action",
    badgeText: "Validación GPS",
    badgeColor: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
    iconName: "MapPin",
    description: "Valida tu presencia física en las 32 provincias y más de 120 hitos declarados patrimonio nacional o atractivos de alto valor.",
    requirements: [
      "Estar a menos de 500 metros del hito geolocalizado",
      "Permitir acceso a ubicación en el navegador o app",
      "Máximo 1 sello por monumento cada 24 horas"
    ],
    actionLabel: "Explorar 32 Provincias",
    actionRoute: "/gamificacion-turistica?tab=provincias",
    isPopular: true
  },
  {
    id: "trivia-diaria",
    num: 6,
    title: "Responder la Trivia Dominicana Diaria",
    category: "knowledge",
    categoryLabel: "Conocimiento & Cultura",
    xpReward: 50,
    coinReward: 25,
    frequency: "Diario (1 ronda al día)",
    frequencyType: "daily",
    badgeText: "Ronda Diaria",
    badgeColor: "bg-violet-500/15 text-violet-600 border-violet-500/30",
    iconName: "Brain",
    description: "Demuestra cuánto sabes sobre historia dominicana, geografía, flora, fauna, gastronomía y personajes ilustres.",
    requirements: [
      "5 preguntas de opción múltiple por día",
      "Puntaje proporcional a respuestas correctas y tiempo",
      "Disponible para jugar una vez cada 24 horas"
    ],
    actionLabel: "Jugar Trivia Ahora",
    actionRoute: "/gamificacion-turistica/trivia",
    isPopular: true
  },
  {
    id: "resenas-verificadas",
    num: 7,
    title: "Publicar Reseñas y Calificaciones con Fotos",
    category: "knowledge",
    categoryLabel: "Comunidad & Guía",
    xpReward: 40,
    coinReward: 20,
    frequency: "Hasta 3 por día",
    frequencyType: "per_action",
    badgeText: "Opinión de Valor",
    badgeColor: "bg-orange-500/15 text-orange-600 border-orange-500/30",
    iconName: "Star",
    description: "Ayuda a otros viajeros evaluando restaurantes, hoteles, balnearios y operadores de tours que hayas probado.",
    requirements: [
      "Mínimo 80 caracteres de reseña constructiva",
      "Calificación de 1 a 5 estrellas con al menos 1 foto real",
      "Aprobación mediante filtro anti-spam"
    ],
    actionLabel: "Explorar Destinos",
    actionRoute: "/destinos",
    isPopular: false
  },
  {
    id: "galeria-fotos",
    num: 8,
    title: "Subir Fotos a la Galería y Certámenes",
    category: "community",
    categoryLabel: "Creatividad Visual",
    xpReward: 80,
    coinReward: 40,
    frequency: "Hasta 2 por semana",
    frequencyType: "per_action",
    badgeText: "Premio Visual",
    badgeColor: "bg-pink-500/15 text-pink-600 border-pink-500/30",
    iconName: "Camera",
    description: "Comparte tus postales de paisajes dominicanos. Si tu foto es elegida Foto de la Semana ganas +200 XP extra.",
    requirements: [
      "Fotografías originales de alta resolución de RD",
      "Indicar provincia o lugar exacto de la captura",
      "Cumplir normas de derechos de autor y respeto a la privacidad"
    ],
    actionLabel: "Ir a RD Social",
    actionRoute: "/rd-social",
    isPopular: false
  },
  {
    id: "autor-invitado-blog",
    num: 9,
    title: "Publicar Artículos en el Blog como Autor Invitado",
    category: "knowledge",
    categoryLabel: "Creación de Contenido",
    xpReward: 300,
    coinReward: 150,
    frequency: "Por artículo publicado",
    frequencyType: "per_action",
    badgeText: "Máximo Reconocimiento",
    badgeColor: "bg-rose-500/15 text-rose-600 border-rose-500/30",
    iconName: "PenTool",
    description: "Escribe crónicas de viaje, guías culinarias o investigaciones culturales para la revista oficial Descubre RD.",
    requirements: [
      "Envío de propuesta mediante el formulario editorial",
      "Contenido original e inédito de mínimo 500 palabras",
      "Aprobación del comité editorial del portal"
    ],
    actionLabel: "Enviar Propuesta",
    actionRoute: "/blog",
    isPopular: true
  },
  {
    id: "huella-carbono",
    num: 10,
    title: "Calcular y Compensar tu Huella de Carbono",
    category: "eco_events",
    categoryLabel: "Turismo Sostenible",
    xpReward: 100,
    coinReward: 50,
    frequency: "Mensual / Por viaje",
    frequencyType: "recurring",
    badgeText: "Impacto Verde",
    badgeColor: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    iconName: "Leaf",
    description: "Calcula el impacto ambiental de tus traslados y apoya programas de reforestación de manglares y arrecifes de coral.",
    requirements: [
      "Calcular el CO2 emitido en tu viaje con la herramienta interactiva",
      "Comprometerse con una acción verde o donación ecológica",
      "Desbloquea la Insignia Guardián Verde"
    ],
    actionLabel: "Calcular Huella",
    actionRoute: "/turismo-sostenible",
    isPopular: false
  },
  {
    id: "racha-diaria",
    num: 11,
    title: "Mantener Racha de Visita Diaria (Streak)",
    category: "account",
    categoryLabel: "Fidelidad & Constancia",
    xpReward: 20,
    coinReward: 10,
    frequency: "Diario con multiplicador",
    frequencyType: "daily",
    badgeText: "Multiplicador x2 y x3",
    badgeColor: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    iconName: "Flame",
    description: "Inicia sesión consecutivamente. Al llegar a 7 días de racha recibes multiplicador x2 y a los 30 días multiplicador x3.",
    requirements: [
      "Entrar al portal al menos una vez cada 24 horas",
      "Bono de 20 XP base diarios acumulativos",
      "Cofre sorpresa adicional cada 7 días de racha ininterrumpida"
    ],
    actionLabel: "Ver mi Perfil y Racha",
    actionRoute: "/gamificacion-turistica/perfil",
    isPopular: true
  },
  {
    id: "rutas-tematicas",
    num: 12,
    title: "Completar Circuitos & Rutas Temáticas",
    category: "exploration",
    categoryLabel: "Rutas Culturales & Eco",
    xpReward: 250,
    coinReward: 120,
    frequency: "Por circuito completado",
    frequencyType: "milestone",
    badgeText: "Circuito Maestro",
    badgeColor: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30",
    iconName: "Route",
    description: "Completa circuitos emblemáticos como la Ruta del Cacao, la Ruta del Café, la Ruta Taína o la Ruta del Ron Colonial.",
    requirements: [
      "Visitar y registrar los hitos clave que conforman el circuito temático",
      "Validar al menos el 80% de las paradas obligatorias",
      "Obtención del diploma digital de la ruta"
    ],
    actionLabel: "Ver Rutas & Destinos",
    actionRoute: "/destinos",
    isPopular: false
  },
  {
    id: "gremios-clanes",
    num: 13,
    title: "Unirte y Aportar a Gremios & Clanes Regionales",
    category: "community",
    categoryLabel: "Gremios & Trabajo en Equipo",
    xpReward: 120,
    coinReward: 60,
    frequency: "Por unirse y en misiones grupales",
    frequencyType: "recurring",
    badgeText: "Espíritu de Clan",
    badgeColor: "bg-teal-500/15 text-teal-600 border-teal-500/30",
    iconName: "Shield",
    description: "Alíate al Clan Norte, Clan Sur, Clan Este o Clan Cibao. Tus puntos sumarán a la tabla de posiciones regional mensual.",
    requirements: [
      "Elegir tu clan regional en la pestaña Gremios",
      "Aportar al menos 100 XP personales durante la temporada",
      "Bono colectivo de fin de mes para el clan campeón"
    ],
    actionLabel: "Unirme a un Gremio",
    actionRoute: "/gamificacion-turistica?tab=gremios",
    isPopular: true
  },
  {
    id: "eventos-culturales",
    num: 14,
    title: "Asistir y Registrar Eventos Culturales & LIDOM",
    category: "eco_events",
    categoryLabel: "Tradición & Deportes",
    xpReward: 100,
    coinReward: 50,
    frequency: "Por evento oficial",
    frequencyType: "per_action",
    badgeText: "Vivo la Cultura",
    badgeColor: "bg-red-500/15 text-red-600 border-red-500/30",
    iconName: "Calendar",
    description: "Haz check-in en festivales de música, carnavales veganos/santiagueros o partidos de la Liga Dominicana de Béisbol (LIDOM).",
    requirements: [
      "Asistir al recinto durante el horario oficial del evento",
      "Escanear el código QR del evento o validar geolocalización",
      "Insignia conmemorativa exclusiva de edición limitada"
    ],
    actionLabel: "Ver Calendario de Eventos",
    actionRoute: "/eventos",
    isPopular: true
  }
];
