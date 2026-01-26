import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, MapPin, DollarSign, Waves, Mountain, 
  Thermometer, Users, Camera, ChevronDown, Search,
  Umbrella, Activity
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

interface Destination {
  id: string;
  name: string;
  region: string;
  image: string;
  beachType: string;
  beachDesc: string;
  costLevel: number;
  costDesc: string;
  adventureLevel: number;
  cultureLevel: number;
  nightlifeLevel: number;
  familyFriendly: boolean;
  bestSeason: string;
  avgTemp: string;
  highlights: string[];
}

const allDestinations: Destination[] = [
  {
    id: "punta-cana",
    name: "Punta Cana",
    region: "La Altagracia",
    image: puntaCanaImg,
    beachType: "Arena Blanca & Resorts",
    beachDesc: "Aguas tranquilas y turquesas",
    costLevel: 4,
    costDesc: "Alto (All-inclusive)",
    adventureLevel: 4,
    cultureLevel: 3,
    nightlifeLevel: 7,
    familyFriendly: true,
    bestSeason: "Nov - Abril",
    avgTemp: "28°C",
    highlights: ["Resorts", "Golf", "Playas"],
  },
  {
    id: "cabarete",
    name: "Cabarete",
    region: "Puerto Plata",
    image: puertoPlataImg,
    beachType: "Dorada & Viento",
    beachDesc: "Ideal para deportes acuáticos",
    costLevel: 2,
    costDesc: "Medio (Boutique & Local)",
    adventureLevel: 9,
    cultureLevel: 5,
    nightlifeLevel: 6,
    familyFriendly: false,
    bestSeason: "Jun - Sept",
    avgTemp: "30°C",
    highlights: ["Kitesurf", "Surf", "Vida nocturna"],
  },
  {
    id: "samana",
    name: "Samaná",
    region: "Samaná",
    image: samanaImg,
    beachType: "Vírgenes & Tropicales",
    beachDesc: "Naturaleza exuberante",
    costLevel: 3,
    costDesc: "Medio-Alto",
    adventureLevel: 8,
    cultureLevel: 6,
    nightlifeLevel: 2,
    familyFriendly: true,
    bestSeason: "Ene - Mar (Ballenas)",
    avgTemp: "27°C",
    highlights: ["Ballenas", "Cascadas", "Ecoturismo"],
  },
  {
    id: "santo-domingo",
    name: "Santo Domingo",
    region: "Distrito Nacional",
    image: santoDomingoImg,
    beachType: "Urbana",
    beachDesc: "Playas cercanas en Boca Chica",
    costLevel: 2,
    costDesc: "Variado",
    adventureLevel: 3,
    cultureLevel: 10,
    nightlifeLevel: 9,
    familyFriendly: true,
    bestSeason: "Todo el año",
    avgTemp: "26°C",
    highlights: ["Historia", "Gastronomía", "Cultura"],
  },
  {
    id: "la-romana",
    name: "La Romana",
    region: "La Romana",
    image: laRomanaImg,
    beachType: "Exclusivas & Privadas",
    beachDesc: "Resorts de lujo",
    costLevel: 5,
    costDesc: "Alto (Lujo)",
    adventureLevel: 5,
    cultureLevel: 7,
    nightlifeLevel: 4,
    familyFriendly: true,
    bestSeason: "Nov - Mayo",
    avgTemp: "28°C",
    highlights: ["Golf", "Altos de Chavón", "Lujo"],
  },
];

function ComparisonRow({ 
  label, 
  icon: Icon, 
  values, 
  type = "text" 
}: { 
  label: string; 
  icon: React.ElementType; 
  values: (string | number | null)[]; 
  type?: "text" | "progress" | "dollars"; 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 border-b border-border">
      {values.map((value, i) => (
        <div
          key={i}
          className={`p-6 ${i < values.length - 1 ? "md:border-r" : ""} border-border flex flex-col items-center text-center gap-3 hover:bg-muted/50 transition-colors`}
        >
          {value !== null ? (
            <>
              <div className="bg-primary/10 p-3 rounded-full">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {label}
                </p>
                {type === "progress" && typeof value === "number" ? (
                  <div className="flex items-center gap-3 w-full max-w-[200px]">
                    <span className="text-sm font-bold">{value}/10</span>
                    <Progress value={value * 10} className="flex-1 h-2" />
                  </div>
                ) : type === "dollars" && typeof value === "number" ? (
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <DollarSign
                        key={n}
                        className={`h-4 w-4 ${n <= value ? "text-primary" : "text-muted"}`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-foreground">{value}</p>
                )}
              </div>
            </>
          ) : (
            <div className="opacity-30">
              <div className="bg-muted p-3 rounded-full">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-4 w-24 bg-muted rounded mt-3" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ComparadorDestinos() {
  const [selectedDestinations, setSelectedDestinations] = useState<(Destination | null)[]>([
    allDestinations[0],
    allDestinations[1],
    null,
  ]);
  const [showSelector, setShowSelector] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const addDestination = (index: number, destination: Destination) => {
    const newSelections = [...selectedDestinations];
    newSelections[index] = destination;
    setSelectedDestinations(newSelections);
    setShowSelector(null);
    setSearchQuery("");
  };

  const removeDestination = (index: number) => {
    const newSelections = [...selectedDestinations];
    newSelections[index] = null;
    setSelectedDestinations(newSelections);
  };

  const availableDestinations = allDestinations.filter(
    (d) => !selectedDestinations.some((s) => s?.id === d.id) &&
           (d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="py-12 px-4">
          <div className="container mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Encuentra tu Paraíso Ideal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Selecciona hasta 3 destinos y compara sus playas, precios y experiencias lado a lado para planificar tus vacaciones perfectas.
            </motion.p>
          </div>
        </section>

        {/* Destination Selector */}
        <section className="container mx-auto px-4 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {selectedDestinations.map((dest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {dest ? (
                  <div className="relative group h-64 rounded-xl overflow-hidden shadow-lg border border-border">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <button
                      onClick={() => removeDestination(index)}
                      className="absolute top-3 right-3 p-1.5 bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-full text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-primary">
                        {dest.region}
                      </p>
                      <h3 className="text-2xl font-bold">{dest.name}</h3>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowSelector(index)}
                    className="h-64 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-card/50 hover:bg-card transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-bold text-foreground">Añadir Destino</p>
                    <p className="text-sm text-muted-foreground">Buscar zona para comparar</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Destination Selector Modal */}
          <AnimatePresence>
            {showSelector !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowSelector(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 max-w-lg w-full max-h-[70vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-display text-xl font-bold mb-4">Seleccionar Destino</h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar destino..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {availableDestinations.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => addDestination(showSelector, dest)}
                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-16 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{dest.name}</p>
                          <p className="text-sm text-muted-foreground">{dest.region}</p>
                        </div>
                      </button>
                    ))}
                    {availableDestinations.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No hay más destinos disponibles
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-4 pb-16">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-muted/50 border-b border-border">
              {selectedDestinations.map((dest, i) => (
                <div
                  key={i}
                  className={`p-6 text-center ${i < selectedDestinations.length - 1 ? "border-b md:border-b-0 md:border-r" : ""} border-border`}
                >
                  {dest ? (
                    <h4 className="font-bold text-xl text-foreground">{dest.name}</h4>
                  ) : (
                    <h4 className="font-medium text-xl italic text-muted-foreground">-- Vacío --</h4>
                  )}
                </div>
              ))}
            </div>

            {/* Rows */}
            <ComparisonRow
              label="Tipo de Playa"
              icon={Umbrella}
              values={selectedDestinations.map((d) => d?.beachType || null)}
            />
            <ComparisonRow
              label="Costo Promedio"
              icon={DollarSign}
              values={selectedDestinations.map((d) => d?.costLevel || null)}
              type="dollars"
            />
            <ComparisonRow
              label="Nivel de Aventura"
              icon={Activity}
              values={selectedDestinations.map((d) => d?.adventureLevel || null)}
              type="progress"
            />
            <ComparisonRow
              label="Cultura e Historia"
              icon={Camera}
              values={selectedDestinations.map((d) => d?.cultureLevel || null)}
              type="progress"
            />
            <ComparisonRow
              label="Vida Nocturna"
              icon={Users}
              values={selectedDestinations.map((d) => d?.nightlifeLevel || null)}
              type="progress"
            />
            <ComparisonRow
              label="Mejor Temporada"
              icon={Thermometer}
              values={selectedDestinations.map((d) => d?.bestSeason || null)}
            />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
