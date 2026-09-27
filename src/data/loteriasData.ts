export interface LotteryResult {
  id: string;
  company: "leidsa" | "nacional" | "loteka" | "real" | "primera" | "suerte" | "newyork" | "florida" | "king";
  companyName: string;
  drawName: string;
  drawTime: string;
  date: string;
  winningNumbers: string[];
  jackpotOrExtra?: string;
  colorScheme: string;
  logo: string;
}

export const DEFAULT_LOTTERY_RESULTS: LotteryResult[] = [
  // LEIDSA
  {
    id: "lei-1",
    company: "leidsa",
    companyName: "LEIDSA",
    drawName: "Quiniela y Palé LEIDSA",
    drawTime: "8:55 PM",
    date: "Hoy",
    winningNumbers: ["42", "18", "77"],
    jackpotOrExtra: "Súper Palé Activo",
    colorScheme: "from-red-600 to-red-900 border-red-500/30",
    logo: "🔴"
  },
  {
    id: "lei-2",
    company: "leidsa",
    companyName: "LEIDSA",
    drawName: "Loto, Loto Más & Súper Loto",
    drawTime: "8:55 PM (Mié/Sáb)",
    date: "Hoy",
    winningNumbers: ["04", "12", "19", "25", "31", "38"],
    jackpotOrExtra: "Acumulado: RD$ 420 Millones",
    colorScheme: "from-red-700 to-amber-900 border-red-500/30",
    logo: "🎰"
  },
  {
    id: "lei-3",
    company: "leidsa",
    companyName: "LEIDSA",
    drawName: "Pega 3 Más",
    drawTime: "8:55 PM",
    date: "Hoy",
    winningNumbers: ["14", "22", "09"],
    colorScheme: "from-red-600 to-rose-900 border-red-500/30",
    logo: "🔴"
  },
  {
    id: "lei-4",
    company: "leidsa",
    companyName: "LEIDSA",
    drawName: "Súper Kino TV",
    drawTime: "8:55 PM",
    date: "Hoy",
    winningNumbers: ["03", "07", "11", "15", "23", "34", "41", "55", "62", "79"],
    jackpotOrExtra: "Premio RD$ 25 Millones",
    colorScheme: "from-rose-600 to-pink-900 border-rose-500/30",
    logo: "📺"
  },

  // LOTERÍA NACIONAL
  {
    id: "nac-1",
    company: "nacional",
    companyName: "Lotería Nacional",
    drawName: "Gana Más (Mediodía)",
    drawTime: "2:30 PM",
    date: "Hoy",
    winningNumbers: ["88", "34", "12"],
    colorScheme: "from-blue-700 to-blue-950 border-blue-500/30",
    logo: "🏛️"
  },
  {
    id: "nac-2",
    company: "nacional",
    companyName: "Lotería Nacional",
    drawName: "Sorteo Nacional Noche",
    drawTime: "9:00 PM",
    date: "Hoy",
    winningNumbers: ["15", "73", "29"],
    colorScheme: "from-blue-800 to-indigo-950 border-blue-500/30",
    logo: "🏛️"
  },
  {
    id: "nac-3",
    company: "nacional",
    companyName: "Lotería Nacional",
    drawName: "Juega+ Pega+",
    drawTime: "2:30 PM",
    date: "Hoy",
    winningNumbers: ["05", "18", "21", "33", "02"],
    jackpotOrExtra: "Premio RD$ 300,000",
    colorScheme: "from-blue-600 to-cyan-900 border-blue-500/30",
    logo: "🔵"
  },

  // LOTEKA
  {
    id: "lot-1",
    company: "loteka",
    companyName: "LOTEKA",
    drawName: "Mega Chances",
    drawTime: "7:55 PM",
    date: "Hoy",
    winningNumbers: ["08", "24", "49", "61", "85"],
    jackpotOrExtra: "Reparte RD$ 50 Millones",
    colorScheme: "from-amber-600 to-yellow-900 border-amber-500/30",
    logo: "🟡"
  },
  {
    id: "lot-2",
    company: "loteka",
    companyName: "LOTEKA",
    drawName: "Quiniela Loteka",
    drawTime: "7:55 PM",
    date: "Hoy",
    winningNumbers: ["56", "11", "90"],
    colorScheme: "from-amber-500 to-orange-950 border-amber-500/30",
    logo: "🟡"
  },

  // LOTERÍA REAL
  {
    id: "rea-1",
    company: "real",
    companyName: "Lotería Real",
    drawName: "Quiniela Real",
    drawTime: "12:55 PM",
    date: "Hoy",
    winningNumbers: ["23", "45", "81"],
    colorScheme: "from-emerald-700 to-teal-950 border-emerald-500/30",
    logo: "👑"
  },
  {
    id: "rea-2",
    company: "real",
    companyName: "Lotería Real",
    drawName: "Loto Real",
    drawTime: "12:55 PM (Mar/Vie)",
    date: "Hoy",
    winningNumbers: ["09", "17", "22", "30", "35", "37"],
    jackpotOrExtra: "Acumulado RD$ 18.5 Millones",
    colorScheme: "from-emerald-600 to-teal-900 border-emerald-500/30",
    logo: "👑"
  },

  // LA PRIMERA
  {
    id: "pri-1",
    company: "primera",
    companyName: "La Primera",
    drawName: "La Primera Mediodía",
    drawTime: "12:00 PM",
    date: "Hoy",
    winningNumbers: ["67", "03", "49"],
    colorScheme: "from-purple-700 to-purple-950 border-purple-500/30",
    logo: "🟣"
  },
  {
    id: "pri-2",
    company: "primera",
    companyName: "La Primera",
    drawName: "La Primera Noche",
    drawTime: "8:00 PM",
    date: "Hoy",
    winningNumbers: ["38", "91", "14"],
    colorScheme: "from-purple-800 to-indigo-950 border-purple-500/30",
    logo: "🟣"
  },

  // LA SUERTE DOMINICANA
  {
    id: "sue-1",
    company: "suerte",
    companyName: "La Suerte Dominicana",
    drawName: "La Suerte Mediodía",
    drawTime: "12:30 PM",
    date: "Hoy",
    winningNumbers: ["19", "54", "02"],
    colorScheme: "from-cyan-700 to-slate-900 border-cyan-500/30",
    logo: "🍀"
  },

  // NEW YORK
  {
    id: "ny-1",
    company: "newyork",
    companyName: "New York",
    drawName: "New York Tarde (Mediodía)",
    drawTime: "3:30 PM",
    date: "Hoy",
    winningNumbers: ["72", "16", "44"],
    colorScheme: "from-slate-800 to-slate-950 border-slate-700",
    logo: "🗽"
  },
  {
    id: "ny-2",
    company: "newyork",
    companyName: "New York",
    drawName: "New York Noche",
    drawTime: "11:30 PM",
    date: "Hoy",
    winningNumbers: ["05", "89", "33"],
    colorScheme: "from-slate-900 to-slate-950 border-slate-700",
    logo: "🗽"
  },

  // FLORIDA
  {
    id: "fl-1",
    company: "florida",
    companyName: "Florida",
    drawName: "Florida Día",
    drawTime: "2:30 PM",
    date: "Hoy",
    winningNumbers: ["31", "66", "10"],
    colorScheme: "from-orange-700 to-amber-950 border-orange-500/30",
    logo: "🌴"
  }
];

export const HOT_COLD_STATS = {
  hotNumbers: [
    { num: "42", count: 18, lastSeen: "Hoy (Leidsa)" },
    { num: "88", count: 16, lastSeen: "Hoy (Gana Más)" },
    { num: "18", count: 15, lastSeen: "Hoy (Leidsa)" },
    { num: "23", count: 14, lastSeen: "Hoy (Real)" },
    { num: "56", count: 14, lastSeen: "Ayer" }
  ],
  coldNumbers: [
    { num: "01", daysMissing: 48, note: "48 días sin salir en 1ra" },
    { num: "99", daysMissing: 39, note: "39 días sin salir en 1ra" },
    { num: "47", daysMissing: 35, note: "35 días sin salir" },
    { num: "13", daysMissing: 31, note: "31 días sin salir" }
  ]
};

export const COMPANIES_LIST = [
  { id: "all", name: "Todas las Loterías", logo: "🇩🇴" },
  { id: "leidsa", name: "LEIDSA", logo: "🔴" },
  { id: "nacional", name: "Lotería Nacional", logo: "🏛️" },
  { id: "loteka", name: "LOTEKA", logo: "🟡" },
  { id: "real", name: "Lotería Real", logo: "👑" },
  { id: "primera", name: "La Primera", logo: "🟣" },
  { id: "suerte", name: "La Suerte", logo: "🍀" },
  { id: "newyork", name: "New York", logo: "🗽" },
  { id: "florida", name: "Florida", logo: "🌴" }
];
