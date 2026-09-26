// All 32 provinces of Dominican Republic
export const PROVINCES = [
  { name: "Azua", region: "Sur", emoji: "🌵" },
  { name: "Bahoruco", region: "Sur", emoji: "🏔️" },
  { name: "Barahona", region: "Sur", emoji: "🌊" },
  { name: "Dajabón", region: "Norte", emoji: "🌿" },
  { name: "Duarte", region: "Cibao", emoji: "🌾" },
  { name: "Elías Piña", region: "Sur", emoji: "🦅" },
  { name: "El Seibo", region: "Este", emoji: "🌴" },
  { name: "Espaillat", region: "Cibao", emoji: "☕" },
  { name: "Hato Mayor", region: "Este", emoji: "🐄" },
  { name: "Hermanas Mirabal", region: "Cibao", emoji: "🌸" },
  { name: "Independencia", region: "Sur", emoji: "🏞️" },
  { name: "La Altagracia", region: "Este", emoji: "⛪" },
  { name: "La Romana", region: "Este", emoji: "🎭" },
  { name: "La Vega", region: "Cibao", emoji: "🎪" },
  { name: "María Trinidad Sánchez", region: "Norte", emoji: "🏖️" },
  { name: "Monseñor Nouel", region: "Cibao", emoji: "💧" },
  { name: "Monte Cristi", region: "Norte", emoji: "🗿" },
  { name: "Monte Plata", region: "Este", emoji: "🌳" },
  { name: "Pedernales", region: "Sur", emoji: "🦜" },
  { name: "Peravia", region: "Sur", emoji: "🏛️" },
  { name: "Puerto Plata", region: "Norte", emoji: "🚡" },
  { name: "Samaná", region: "Norte", emoji: "🐋" },
  { name: "San Cristóbal", region: "Sur", emoji: "⚓" },
  { name: "San José de Ocoa", region: "Sur", emoji: "🍃" },
  { name: "San Juan", region: "Sur", emoji: "🌄" },
  { name: "San Pedro de Macorís", region: "Este", emoji: "⚾" },
  { name: "Sánchez Ramírez", region: "Cibao", emoji: "🏺" },
  { name: "Santiago", region: "Cibao", emoji: "🏙️" },
  { name: "Santiago Rodríguez", region: "Cibao", emoji: "🌲" },
  { name: "Valverde", region: "Cibao", emoji: "🌺" },
  { name: "Santo Domingo", region: "Sur", emoji: "🏛️" },
  { name: "Distrito Nacional", region: "Sur", emoji: "🌆" },
];

export const PROVINCE_MILESTONES = [
  { count: 1,  icon: "📍", label: "Visitante",          rarity: "common",    xp: 50  },
  { count: 5,  icon: "🗺️", label: "Explorador Regional", rarity: "uncommon",  xp: 100 },
  { count: 15, icon: "🧭", label: "Gran Explorador",    rarity: "rare",      xp: 200 },
  { count: 32, icon: "🌟", label: "Embajador",          rarity: "legendary", xp: 500 },
];

export const REGION_COLORS: Record<string, string> = {
  "Norte":  "bg-blue-500/10 text-blue-600 border-blue-200",
  "Sur":    "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "Este":   "bg-amber-500/10 text-amber-600 border-amber-200",
  "Cibao":  "bg-purple-500/10 text-purple-600 border-purple-200",
};

export const REGIONS = ["all", "Norte", "Sur", "Este", "Cibao"];

export interface GamificationHubSubroute {
  title: string;
  desc: string;
  iconName: "Target" | "Video" | "Brain" | "MapPin" | "Crown" | "Gift" | "Sparkles" | "Trophy";
  link: string;
  tag: string;
  color: string;
  bg: string;
}

export const gamificationHubSubroutes: GamificationHubSubroute[] = [
  {
    title: "Retos & Misiones",
    desc: "Misiones diarias y expediciones por las 32 provincias",
    iconName: "Target",
    link: "/gamificacion-turistica/retos",
    tag: "Misiones Activas",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  {
    title: "Programa de Creadores",
    desc: "Matchmaking con hoteles (estancias 100% gratis) y afiliados",
    iconName: "Video",
    link: "/gamificacion-turistica/creadores",
    tag: "Patrocinios POP & Samaná",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Trivia Dominicana",
    desc: "Demuestra tu conocimiento en geografía, historia y cultura",
    iconName: "Brain",
    link: "/gamificacion-turistica/trivia",
    tag: "+50 XP por ronda",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20"
  },
  {
    title: "Mapa 3D de Misiones",
    desc: "Ubica geográficamente todos los retos en el mapa satelital",
    iconName: "MapPin",
    link: "/gamificacion-turistica/mapa",
    tag: "Interactivo",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20"
  },
  {
    title: "Perfil de Jugador",
    desc: "Consulta tu tarjeta de explorador, insignias e historial",
    iconName: "Crown",
    link: "/gamificacion-turistica/perfil",
    tag: "Nivel & Racha",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20"
  },
  {
    title: "Club de Recompensas",
    desc: "Canjea puntos XP por pases y descuentos exclusivos",
    iconName: "Gift",
    link: "/gamificacion-turistica/recompensas",
    tag: "Beneficios VIP",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/20"
  },
  {
    title: "14 Formas de Ganar Puntos",
    desc: "Registro, referidos, boletín, check-ins GPS, blog, fotos y ecoturismo",
    iconName: "Sparkles",
    link: "/gamificacion-turistica?tab=formas",
    tag: "+2,500 XP Potenciales",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Reglamento & Normas",
    desc: "Lineamientos de acreditación GPS, RNC empresarial y políticas anti-fraude",
    iconName: "Trophy",
    link: "/gamificacion-turistica/reglas",
    tag: "Normativa Oficial",
    color: "text-teal-500",
    bg: "bg-teal-500/10 border-teal-500/20"
  }
];
