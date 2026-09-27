export interface AirlineRoute {
  id: string;
  name: string;
  code: string;
  country: string;
  hub: string;
  logo: string;
  website: string;
  terminalSDQ?: string;
  terminalPUJ?: string;
  directOrigins: { city: string; country: string; flightDuration: string; airportsRD: string[] }[];
  isDominicanHub?: boolean;
}

export const airlinesData: AirlineRoute[] = [
  {
    id: "arajet",
    name: "Arajet",
    code: "DM",
    country: "República Dominicana",
    hub: "Santo Domingo (SDQ)",
    logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=120&fit=crop",
    website: "https://www.arajet.com",
    terminalSDQ: "Terminal Las Américas (Hub Principal)",
    terminalPUJ: "Terminal A",
    isDominicanHub: true,
    directOrigins: [
      { city: "Bogotá", country: "Colombia", flightDuration: "2h 30m", airportsRD: ["SDQ", "PUJ"] },
      { city: "Medellín", country: "Colombia", flightDuration: "2h 20m", airportsRD: ["SDQ"] },
      { city: "Ciudad de México", country: "México", flightDuration: "4h 15m", airportsRD: ["SDQ"] },
      { city: "Cancún", country: "México", flightDuration: "2h 45m", airportsRD: ["SDQ"] },
      { city: "Toronto", country: "Canadá", flightDuration: "4h 30m", airportsRD: ["SDQ", "PUJ"] },
      { city: "Montreal", country: "Canadá", flightDuration: "4h 45m", airportsRD: ["SDQ"] },
      { city: "Santiago de Chile", country: "Chile", flightDuration: "7h 45m", airportsRD: ["SDQ"] },
      { city: "Buenos Aires", country: "Argentina", flightDuration: "8h 15m", airportsRD: ["SDQ", "PUJ"] },
      { city: "San José", country: "Costa Rica", flightDuration: "2h 45m", airportsRD: ["SDQ"] },
      { city: "São Paulo", country: "Brasil", flightDuration: "7h 10m", airportsRD: ["SDQ", "PUJ"] },
    ],
  },
  {
    id: "air-century",
    name: "Air Century",
    code: "Y2",
    country: "República Dominicana",
    hub: "Santo Domingo (JBQ)",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=120&h=120&fit=crop",
    website: "https://www.aircentury.com",
    terminalSDQ: "La Isabela (JBQ)",
    terminalPUJ: "Terminal B",
    isDominicanHub: true,
    directOrigins: [
      { city: "San Juan", country: "Puerto Rico", flightDuration: "45m", airportsRD: ["JBQ", "PUJ"] },
      { city: "Sint Maarten", country: "Caribe Holandés", flightDuration: "1h 15m", airportsRD: ["JBQ"] },
      { city: "Curazao", country: "Curazao", flightDuration: "1h 20m", airportsRD: ["JBQ"] },
      { city: "Aruba", country: "Aruba", flightDuration: "1h 25m", airportsRD: ["JBQ"] },
      { city: "La Habana", country: "Cuba", flightDuration: "2h 00m", airportsRD: ["JBQ"] },
    ],
  },
  {
    id: "american-airlines",
    name: "American Airlines",
    code: "AA",
    country: "Estados Unidos",
    hub: "Miami (MIA), Charlotte (CLT)",
    logo: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120&h=120&fit=crop",
    website: "https://www.aa.com",
    terminalSDQ: "Terminal Norte",
    terminalPUJ: "Terminal B",
    directOrigins: [
      { city: "Miami", country: "Estados Unidos", flightDuration: "2h 15m", airportsRD: ["SDQ", "PUJ", "STI", "POP"] },
      { city: "Charlotte", country: "Estados Unidos", flightDuration: "3h 25m", airportsRD: ["PUJ", "SDQ"] },
      { city: "Dallas-Fort Worth", country: "Estados Unidos", flightDuration: "4h 40m", airportsRD: ["PUJ"] },
      { city: "Filadelfia", country: "Estados Unidos", flightDuration: "3h 50m", airportsRD: ["PUJ", "SDQ"] },
      { city: "Boston", country: "Estados Unidos", flightDuration: "4h 10m", airportsRD: ["PUJ", "SDQ"] },
    ],
  },
  {
    id: "delta",
    name: "Delta Air Lines",
    code: "DL",
    country: "Estados Unidos",
    hub: "Atlanta (ATL), New York (JFK)",
    logo: "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=120&h=120&fit=crop",
    website: "https://www.delta.com",
    terminalSDQ: "Terminal Norte",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Atlanta", country: "Estados Unidos", flightDuration: "3h 30m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "New York (JFK)", country: "Estados Unidos", flightDuration: "3h 55m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "Boston", country: "Estados Unidos", flightDuration: "4h 05m", airportsRD: ["PUJ"] },
    ],
  },
  {
    id: "jetblue",
    name: "JetBlue",
    code: "B6",
    country: "Estados Unidos",
    hub: "New York (JFK/EWR), Boston (BOS)",
    logo: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=120&h=120&fit=crop",
    website: "https://www.jetblue.com",
    terminalSDQ: "Terminal Norte",
    terminalPUJ: "Terminal B",
    directOrigins: [
      { city: "New York (JFK)", country: "Estados Unidos", flightDuration: "3h 50m", airportsRD: ["SDQ", "PUJ", "STI", "POP"] },
      { city: "Newark (EWR)", country: "Estados Unidos", flightDuration: "3h 55m", airportsRD: ["SDQ", "STI", "PUJ"] },
      { city: "Boston (BOS)", country: "Estados Unidos", flightDuration: "4h 05m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "Fort Lauderdale (FLL)", country: "Estados Unidos", flightDuration: "2h 20m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "Orlando (MCO)", country: "Estados Unidos", flightDuration: "2h 45m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "San Juan (SJU)", country: "Puerto Rico", flightDuration: "45m", airportsRD: ["SDQ", "PUJ", "STI"] },
    ],
  },
  {
    id: "iberia",
    name: "Iberia",
    code: "IB",
    country: "España",
    hub: "Madrid (MAD)",
    logo: "https://images.unsplash.com/photo-1520690214124-2405c5217036?w=120&h=120&fit=crop",
    website: "https://www.iberia.com",
    terminalSDQ: "Terminal Sur",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Madrid", country: "España", flightDuration: "8h 40m", airportsRD: ["SDQ", "PUJ"] },
    ],
  },
  {
    id: "air-europa",
    name: "Air Europa",
    code: "UX",
    country: "España",
    hub: "Madrid (MAD)",
    logo: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120&h=120&fit=crop",
    website: "https://www.aireuropa.com",
    terminalSDQ: "Terminal Sur",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Madrid", country: "España", flightDuration: "8h 45m", airportsRD: ["SDQ", "PUJ"] },
    ],
  },
  {
    id: "air-france",
    name: "Air France",
    code: "AF",
    country: "Francia",
    hub: "París (CDG)",
    logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=120&fit=crop",
    website: "https://www.airfrance.com",
    terminalSDQ: "Terminal Sur",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "París (CDG)", country: "Francia", flightDuration: "9h 15m", airportsRD: ["PUJ", "SDQ"] },
    ],
  },
  {
    id: "air-canada",
    name: "Air Canada",
    code: "AC",
    country: "Canadá",
    hub: "Toronto (YYZ), Montreal (YUL)",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=120&h=120&fit=crop",
    website: "https://www.aircanada.com",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Toronto", country: "Canadá", flightDuration: "4h 30m", airportsRD: ["PUJ", "POP", "AZS"] },
      { city: "Montreal", country: "Canadá", flightDuration: "4h 45m", airportsRD: ["PUJ", "POP"] },
    ],
  },
  {
    id: "copa",
    name: "Copa Airlines",
    code: "CM",
    country: "Panamá",
    hub: "Ciudad de Panamá (PTY)",
    logo: "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=120&h=120&fit=crop",
    website: "https://www.copaair.com",
    terminalSDQ: "Terminal Norte",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Ciudad de Panamá (Hub de las Américas)", country: "Panamá", flightDuration: "2h 30m", airportsRD: ["SDQ", "PUJ", "STI"] },
    ],
  },
];
