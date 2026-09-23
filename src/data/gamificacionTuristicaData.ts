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
