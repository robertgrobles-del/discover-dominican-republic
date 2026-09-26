export interface RouteDistance {
  origin: string;
  destination: string;
  distanceKm: number;
}

export interface OffsetProject {
  id: string;
  title: string;
  location: string;
  category: string;
  description: string;
  cost_info: string;
  impact: string;
  partner: string;
}

export const mockRoutes: RouteDistance[] = [
  { origin: "Miami (MIA)", destination: "Punta Cana (PUJ)", distanceKm: 1400 },
  { origin: "Miami (MIA)", destination: "Santo Domingo (SDQ)", distanceKm: 1350 },
  { origin: "New York (JFK)", destination: "Punta Cana (PUJ)", distanceKm: 2500 },
  { origin: "New York (JFK)", destination: "Santo Domingo (SDQ)", distanceKm: 2550 },
  { origin: "Madrid (MAD)", destination: "Santo Domingo (SDQ)", distanceKm: 6600 },
  { origin: "Madrid (MAD)", destination: "Punta Cana (PUJ)", distanceKm: 6550 },
  { origin: "Bogotá (BOG)", destination: "Santo Domingo (SDQ)", distanceKm: 1650 },
  { origin: "Panamá (PTY)", destination: "Santo Domingo (SDQ)", distanceKm: 1450 },
  { origin: "Toronto (YYZ)", destination: "Punta Cana (PUJ)", distanceKm: 3000 },
  { origin: "San Juan (SJU)", destination: "Santo Domingo (SDQ)", distanceKm: 390 }
];

export const carEmissionFactors = {
  gasoline: 0.192,
  diesel: 0.171,
  hybrid: 0.105,
  electric: 0.045
};

export const offsetProjects: OffsetProject[] = [
  { 
    id: "p1", 
    title: "Reforestación en Parque Nacional Valle Nuevo", 
    location: "Constanza • Cordillera Central (18°42'N 70°35'W)", 
    category: "Alta Prioridad Hídrica & Pino Criollo", 
    description: "Siembra de pino criollo (*Pinus occidentalis*) y especies nativas en la 'Madre de las Aguas'. Protege las cabeceras de los ríos Yaque del Norte y Yaque del Sur.", 
    cost_info: "Costo por Árbol: RD$ 250 (~$4.15 USD)",
    impact: "1 árbol = 22 kg CO₂/año + fijación hídrica de cuenca",
    partner: "Fondo Agua Santo Domingo & Ministerio de Medio Ambiente"
  },
  { 
    id: "p2", 
    title: "Restauración de Manglares en Parque Nacional Los Haitises", 
    location: "Bahía de Samaná & Sabana de la Mar (19°02'N 69°35'W)", 
    category: "Carbono Azul & Protección Costera", 
    description: "Los manglares rojos (*Rhizophora mangle*) capturan hasta 4 veces más carbono que los bosques terrestres. Protegen el hábitat de manatíes y aves marinas endémicas.", 
    cost_info: "Costo por M²: RD$ 300 (~$5.00 USD)",
    impact: "1 m² de manglar = 35 kg CO₂ almacenado a perpetuidad",
    partner: "Fundación Ecológica Maguá & Guardaparques Locales"
  },
  {
    id: "p3",
    title: "Santuario de Corales & Micro-fragmentación en Bayahíbe",
    location: "La Altagracia • Costa Caribeña (18°22'N 68°50'W)",
    category: "Regeneración Marina & Arrecifes",
    description: "Micro-fragmentación acelerada de corales cuerno de ciervo (*Acropora cervicornis*) para devolver vida a los arrecifes afectados por el calentamiento oceánico.",
    cost_info: "Costo por Fragmento: RD$ 400 (~$6.60 USD)",
    impact: "1 colonia = absorbe energía de oleaje y regenera biomasa marina",
    partner: "FUNDEMAR (Fundación Dominicana de Estudios Marinos)"
  }
];
