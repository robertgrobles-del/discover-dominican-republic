export interface LidomTeam {
  id: string;
  name: string;
  short: string;
  city: string;
  stadium: string;
  championships: number;
  caribbeanSeries: number;
  color: string;
  secondaryColor: string;
  logo: string;
  founded: number;
  motto: string;
  description: string;
  legends: string[];
  image: string;
}

export interface StadiumGuide {
  name: string;
  city: string;
  capacity: string;
  inaugurated: string;
  home: string;
  address: string;
  chimiSpot: string;
  beverage: string;
  tips: string;
  image: string;
}

export const LIDOM_TEAMS: LidomTeam[] = [
  {
    id: "lic",
    name: "Tigres del Licey",
    short: "LIC",
    city: "Santo Domingo",
    stadium: "Estadio Quisqueya Juan Marichal",
    championships: 24,
    caribbeanSeries: 11,
    color: "#0033A0",
    secondaryColor: "#001D66",
    logo: "🐯",
    founded: 1907,
    motto: "El Glorioso",
    description: "El equipo más antiguo y laureado de la República Dominicana y del Caribe, con 24 coronas nacionales y 11 Series del Caribe.",
    legends: ["Pedro Martínez", "César Gerónimo", "Manuel Mota", "Emilio Bonifacio"],
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&fit=crop&q=80"
  },
  {
    id: "agu",
    name: "Águilas Cibaeñas",
    short: "AGU",
    city: "Santiago de los Caballeros",
    stadium: "Estadio Cibao",
    championships: 22,
    caribbeanSeries: 6,
    color: "#F7A800",
    secondaryColor: "#111111",
    logo: "🦅",
    founded: 1933,
    motto: "La Leña Ta' Aquí",
    description: "Orgullo del Cibao con 22 campeonatos y la fanaticada más ferviente en el legendario 'Valle de la Muerte'.",
    legends: ["Miguel Diloné", "Luis Polonia", "Tony Peña", "Mendy López"],
    image: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&fit=crop&q=80"
  },
  {
    id: "esc",
    name: "Leones del Escogido",
    short: "ESC",
    city: "Santo Domingo",
    stadium: "Estadio Quisqueya Juan Marichal",
    championships: 16,
    caribbeanSeries: 4,
    color: "#DA291C",
    secondaryColor: "#000000",
    logo: "🦁",
    founded: 1921,
    motto: "¡Duro de Matar!",
    description: "Una de las dinastías más respetadas de la capital, reconocidos por su garra y figuras legendarias de Grandes Ligas.",
    legends: ["Felipe Alou", "Mateo Alou", "Juan Marichal", "David Ortiz"],
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&fit=crop&q=80"
  },
  {
    id: "est",
    name: "Estrellas Orientales",
    short: "EST",
    city: "San Pedro de Macorís",
    stadium: "Estadio Tetelo Vargas",
    championships: 3,
    caribbeanSeries: 0,
    color: "#006A4E",
    secondaryColor: "#FFCC00",
    logo: "⭐",
    founded: 1910,
    motto: "Brillan Las Estrellas",
    description: "Provenientes de la cuna de los mejores campocortos del mundo, San Pedro de Macorís.",
    legends: ["Rico Carty", "Robinson Canó", "Fernando Tatis", "Rafael Batista"],
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&fit=crop&q=80"
  },
  {
    id: "tor",
    name: "Toros del Este",
    short: "TOR",
    city: "La Romana",
    stadium: "Estadio Francisco A. Micheli",
    championships: 3,
    caribbeanSeries: 1,
    color: "#E05A10",
    secondaryColor: "#000000",
    logo: "🐂",
    founded: 1983,
    motto: "Aquí To' Somo Toros",
    description: "El poder del Este dominicano en La Romana, campeones de la Serie del Caribe 2020.",
    legends: ["Julián Yan", "Andújar Cedeño", "Esteban Germán", "Cristhian Adames"],
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&fit=crop&q=80"
  },
  {
    id: "gig",
    name: "Gigantes del Cibao",
    short: "GIG",
    city: "San Francisco de Macorís",
    stadium: "Estadio Julián Javier",
    championships: 2,
    caribbeanSeries: 0,
    color: "#4A154B",
    secondaryColor: "#C5A059",
    logo: "🐎",
    founded: 1996,
    motto: "Poder del Jaya",
    description: "La fuerza ofensiva de la provincia Duarte, campeones nacionales 2015 y 2022.",
    legends: ["Nelson Cruz", "Marcel Ozuna", "Hanser Alberto", "Erick Almonte"],
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&fit=crop&q=80"
  }
];

export const STANDINGS_ROUND_ROBIN = [
  { rank: 1, team: "Tigres del Licey", short: "LIC", jj: 18, g: 11, p: 7, pct: ".611", dif: "-", racha: "G-3", casa: "6-3", ruta: "5-4" },
  { rank: 2, team: "Estrellas Orientales", short: "EST", jj: 18, g: 10, p: 8, pct: ".556", dif: "1.0", racha: "P-1", casa: "6-3", ruta: "4-5" },
  { rank: 3, team: "Leones del Escogido", short: "ESC", jj: 18, g: 9, p: 9, pct: ".500", dif: "2.0", racha: "G-1", casa: "5-4", ruta: "4-5" },
  { rank: 4, team: "Águilas Cibaeñas", short: "AGU", jj: 18, g: 8, p: 10, pct: ".444", dif: "3.0", racha: "P-2", casa: "4-5", ruta: "4-5" },
  { rank: 5, team: "Gigantes del Cibao", short: "GIG", jj: 18, g: 8, p: 10, pct: ".444", dif: "3.0", racha: "G-1", casa: "5-4", ruta: "3-6" },
  { rank: 6, team: "Toros del Este", short: "TOR", jj: 18, g: 8, p: 10, pct: ".444", dif: "3.0", racha: "P-1", casa: "5-4", ruta: "3-6" }
];

export const STADIUMS_GUIDE: StadiumGuide[] = [
  {
    name: "Estadio Quisqueya Juan Marichal",
    city: "Santo Domingo (Distrito Nacional)",
    capacity: "14,469 fanáticos",
    inaugurated: "1955",
    home: "Tigres del Licey & Leones del Escogido",
    address: "Ensanche La Fe, Santo Domingo",
    chimiSpot: "Chimi D' Frank & Empanadas Monumentales frente al play",
    beverage: "Cerveza Presidente Vestida de Novia (bajo cero)",
    tips: "Llega 1 hora antes para disfrutar la animación de las mascotas y la música de banda en vivo.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&fit=crop&q=80"
  },
  {
    name: "Estadio Cibao",
    city: "Santiago de los Caballeros",
    capacity: "18,077 fanáticos (El más grande del país)",
    inaugurated: "1958",
    home: "Águilas Cibaeñas",
    address: "Av. Imbert, Santiago",
    chimiSpot: "Yaroas santiagueras, chivo liniero y lechón asado",
    beverage: "Presidente Light bien fría y ponche tradicional",
    tips: "Conocido como 'El Valle de la Muerte'. El ambiente más encendido y bullanguero del béisbol caribeño.",
    image: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&fit=crop&q=80"
  },
  {
    name: "Estadio Tetelo Vargas",
    city: "San Pedro de Macorís",
    capacity: "8,000 fanáticos",
    inaugurated: "1959",
    home: "Estrellas Orientales",
    address: "Av. Circunvalación, San Pedro de Macorís",
    chimiSpot: "Pastel en Hoja amaliano y yaniqueques gigantes",
    beverage: "Cerveza fría y Guavaberry tradicional",
    tips: "Cuna de leyendas de Grandes Ligas y ambiente 100% petromacorisano.",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&fit=crop&q=80"
  },
  {
    name: "Estadio Francisco A. Micheli",
    city: "La Romana",
    capacity: "7,838 fanáticos",
    inaugurated: "1979",
    home: "Toros del Este",
    address: "Av. Padre Abreu, La Romana",
    chimiSpot: "Empanadas de chivo, chimi de pierna y mariscos",
    beverage: "Presidente fría y ron dominicano añejo",
    tips: "Excelente acústica y ambiente familiar en el corazón de la región Este.",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&fit=crop&q=80"
  },
  {
    name: "Estadio Julián Javier",
    city: "San Francisco de Macorís",
    capacity: "12,000 fanáticos",
    inaugurated: "1975",
    home: "Gigantes del Cibao",
    address: "Salida a Nagua, San Francisco de Macorís",
    chimiSpot: "Chimi del Jaya y queso con dulce de leche",
    beverage: "Presidente súper fría",
    tips: "Visita la zona VIP con vista panorámica y música típica en vivo.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&fit=crop&q=80"
  }
];

export const LEAGUE_LEADERS = {
  batting: [
    { rank: 1, player: "Ronny Mauricio", team: "LIC", stat: ".342 AVG", hits: 52 },
    { rank: 2, player: "Yairo Muñoz", team: "AGU", stat: ".331 AVG", hits: 48 },
    { rank: 3, player: "Robinson Canó", team: "EST", stat: ".318 AVG", hits: 45 }
  ],
  homeRuns: [
    { rank: 1, player: "Franmil Reyes", team: "ESC", stat: "9 HR", rbi: 28 },
    { rank: 2, player: "Marcell Ozuna", team: "GIG", stat: "8 HR", rbi: 24 },
    { rank: 3, player: "Yamaico Navarro", team: "TOR", stat: "7 HR", rbi: 22 }
  ],
  pitching: [
    { rank: 1, player: "César Valdez", team: "LIC", stat: "1.45 ERA", wL: "6-1" },
    { rank: 2, player: "Esmil Rogers", team: "TOR", stat: "1.92 ERA", wL: "5-2" },
    { rank: 3, player: "Enny Romero", team: "ESC", stat: "2.10 ERA", wL: "4-1" }
  ]
};
