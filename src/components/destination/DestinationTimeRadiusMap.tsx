import React, { useState } from "react";
import { Clock, Car, Navigation, Compass, MapPin, ChevronRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TimeRadiusSpot {
  nombre: string;
  categoria: string;
  tiempo: string; // "15-25 min", "45-55 min", "75-90 min"
  distanciaKm: string;
  descripcion: string;
  carretera: string;
}

interface DestinationTimeRadiusMapProps {
  destinationName: string;
  region?: string;
}

export function DestinationTimeRadiusMap({ destinationName, region }: DestinationTimeRadiusMapProps) {
  const [selectedRadius, setSelectedRadius] = useState<"30" | "60" | "90">("30");

  // Dynamic spots based on region/destination
  const isEast = destinationName.toLowerCase().includes("punta cana") || 
                 destinationName.toLowerCase().includes("bávaro") || 
                 destinationName.toLowerCase().includes("la romana") ||
                 destinationName.toLowerCase().includes("bayahíbe");

  const isNorth = destinationName.toLowerCase().includes("puerto plata") ||
                  destinationName.toLowerCase().includes("sosúa") ||
                  destinationName.toLowerCase().includes("cabarete");

  const isSamana = destinationName.toLowerCase().includes("samaná") ||
                   destinationName.toLowerCase().includes("las terrenas") ||
                   destinationName.toLowerCase().includes("las galeras");

  const spotsData: Record<"30" | "60" | "90", TimeRadiusSpot[]> = isEast ? {
    "30": [
      {
        nombre: "Ojos Indígenas & Cap Cana Marina",
        categoria: "Naturaleza & Marina",
        tiempo: "15-20 min",
        distanciaKm: "14 km",
        descripcion: "Red de 12 lagunas de agua dulce cristalina y senderos en bosque subtropical húmedo.",
        carretera: "Blvd. Turístico del Este"
      },
      {
        nombre: "Playa Macao & Escuelas de Surf",
        categoria: "Playa Pública & Olas",
        tiempo: "20-25 min",
        distanciaKm: "19 km",
        descripcion: "Playa virgen de arena dorada declarada por la UNESCO, perfecta para surfear y almorzar pescado fresco.",
        carretera: "Carretera Macao - Uvero Alto"
      },
      {
        nombre: "BlueMall Punta Cana & Galerías de Arte",
        categoria: "Compras & Gastronomía",
        tiempo: "12-15 min",
        distanciaKm: "8 km",
        descripcion: "Alta gastronomía local, tiendas libres de impuestos y exhibiciones de artesanía fina.",
        carretera: "Av. Circunvalación Verón"
      }
    ],
    "60": [
      {
        nombre: "Playa Bayahíbe & Embarcadero a Saona",
        categoria: "Pueblo Costero & Excursiones",
        tiempo: "50-55 min",
        distanciaKm: "68 km",
        descripcion: "Pintoresco pueblo pesquero con aguas tranquilas del Mar Caribe y salida en catamarán a Isla Saona.",
        carretera: "Autovía del Este (Ruta 3)"
      },
      {
        nombre: "Altos de Chavón (La Romana)",
        categoria: "Cultura & Arquitectura",
        tiempo: "55-60 min",
        distanciaKm: "74 km",
        descripcion: "Villa mediterránea del siglo XVI esculpida en piedra sobre el cañón del Río Chavón con anfiteatro griego.",
        carretera: "Autopista del Coral"
      },
      {
        nombre: "Boca de Yuma & Cueva de Bernard",
        categoria: "Pueblo Histórico & Acantilados",
        tiempo: "45-50 min",
        distanciaKm: "52 km",
        descripcion: "Acantilados con vista panorámica, casa fuerte de Ponce de León y mariscos capturados al día.",
        carretera: "Ruta San Rafael del Yuma"
      }
    ],
    "90": [
      {
        nombre: "Cueva de las Maravillas",
        categoria: "Arqueología Taína",
        tiempo: "75-85 min",
        distanciaKm: "105 km",
        descripcion: "Caverna monumental a 25 metros bajo tierra con más de 500 pictogramas y petroglifos indígenas taínos.",
        carretera: "Autovía del Este (San Pedro)"
      },
      {
        nombre: "Miches & Playa Esmeralda",
        categoria: "Ecoturismo Virgen",
        tiempo: "80-90 min",
        distanciaKm: "98 km",
        descripcion: "Kilómetros de cocoteros intactos, Montaña Redonda y avistamiento de aves en Laguna Redonda.",
        carretera: "Carretera Uvero Alto - Miches"
      },
      {
        nombre: "Basílica de Nuestra Señora de la Altagracia (Higüey)",
        categoria: "Patrimonio Religioso",
        tiempo: "65-75 min",
        distanciaKm: "45 km",
        descripcion: "La catedral y monumento espiritual más relevante del país con impresionante arquitectura brutalista.",
        carretera: "Carretera Verón - Higüey"
      }
    ]
  } : isNorth ? {
    "30": [
      {
        nombre: "Cabarete: Bahía de Kitesurf & Encuentro",
        categoria: "Deportes Acuáticos",
        tiempo: "15-20 min",
        distanciaKm: "12 km",
        descripcion: "Capital del viento y kitesurf del Caribe, bares con mesas en la arena y vibra cosmopolita.",
        carretera: "Ruta 5 Norte"
      },
      {
        nombre: "Sosúa: Playa Alicia & Arrecifes de Coral",
        categoria: "Snorkel & Playa",
        tiempo: "12-18 min",
        distanciaKm: "9 km",
        descripcion: "Aguas calmas de tono turquesa profundo ideales para niños y buceo de pared coralina.",
        carretera: "Ruta 5 Norte"
      },
      {
        nombre: "Monumento Natural 27 Charcos de Damajagua",
        categoria: "Aventura Fluvial",
        tiempo: "25-30 min",
        distanciaKm: "22 km",
        descripcion: "Saltos de agua, toboganes de piedra natural y cañones tallados en roca caliza con guías locales.",
        carretera: "Carretera Navarrete - Puerto Plata"
      }
    ],
    "60": [
      {
        nombre: "Teleférico y Parque Nacional Loma Isabel de Torres",
        categoria: "Montaña & Mirador",
        tiempo: "40-50 min",
        distanciaKm: "32 km",
        descripcion: "Ascenso panorámico en cabina a 800 metros sobre el mar, jardín botánico y réplica del Cristo Redentor.",
        carretera: "Circunvalación Puerto Plata"
      },
      {
        nombre: "Fortaleza Colonial San Felipe",
        categoria: "Historia del Siglo XVI",
        tiempo: "35-45 min",
        distanciaKm: "28 km",
        descripcion: "Baluarte defensivo contra piratas del Atlántico en el malecón histórico de Puerto Plata.",
        carretera: "Av. General Gregorio Luperón"
      },
      {
        nombre: "Fábricas de Cigarros y Ron de Santiago de los Caballeros",
        categoria: "Tradición Dominicana",
        tiempo: "55-60 min",
        distanciaKm: "65 km",
        descripcion: "La capital mundial del tabaco premium y las destilerías centenarias a través del Valle del Cibao.",
        carretera: "Carretera Turística La Cumbre"
      }
    ],
    "90": [
      {
        nombre: "Montecristi: Parque Nacional El Morro",
        categoria: "Naturaleza & Farallón",
        tiempo: "80-90 min",
        distanciaKm: "110 km",
        descripcion: "El farallón volcánico de 242 metros emergiendo sobre el mar, piscinas naturales y manglares.",
        carretera: "Autopista Duarte / Tramo Montecristi"
      },
      {
        nombre: "Ruta del Cacao en Altamira y Guananico",
        categoria: "Agroturismo & Comunidades",
        tiempo: "70-80 min",
        distanciaKm: "58 km",
        descripcion: "Fincas de cacao orgánico de exportación, cooperativas de mujeres y chocolate artesanal.",
        carretera: "Ruta interior Cordillera Septentrional"
      },
      {
        nombre: "Río San Juan: Laguna Gri-Grí & Playa Caletón",
        categoria: "Biodiversidad Marina",
        tiempo: "65-75 min",
        distanciaKm: "70 km",
        descripcion: "Canales de manglares que desembocan en el mar y cavernas marinas con golondrinas.",
        carretera: "Ruta Costera 5 Este"
      }
    ]
  } : {
    // Default Santo Domingo / Central / South
    "30": [
      {
        nombre: "Ciudad Colonial (Zona Colonial UNESCO)",
        categoria: "Patrimonio Histórico",
        tiempo: "15-25 min",
        distanciaKm: "8 km",
        descripcion: "Las primeras calles, catedral, fortaleza y hospital del Nuevo Mundo en un cuadrante peatonal.",
        carretera: "Av. George Washington (Malecón)"
      },
      {
        nombre: "Parque Nacional Los Tres Ojos",
        categoria: "Cuevas & Naturaleza",
        tiempo: "20-25 min",
        distanciaKm: "12 km",
        descripcion: "Cuatro lagos subterráneos de agua sulfurosa rodeados de estalactitas y exuberante vegetación.",
        carretera: "Av. Las Américas"
      },
      {
        nombre: "Jardín Botánico Nacional Dr. Rafael M. Moscoso",
        categoria: "Botánica & Respiración",
        tiempo: "15-20 min",
        distanciaKm: "6 km",
        descripcion: "El mayor pulmón verde de la ciudad con jardín japonés, pabellón de orquídeas y senderos arbolados.",
        carretera: "Av. República de Colombia"
      }
    ],
    "60": [
      {
        nombre: "Boca Chica & Los Pescadores de Fritura",
        categoria: "Playa Urbana & Mar Abierto",
        tiempo: "40-50 min",
        distanciaKm: "36 km",
        descripcion: "Piscina natural protegida por un arrecife de coral con agua hasta la cintura y chillo frito al minuto.",
        carretera: "Autopista Las Américas"
      },
      {
        nombre: "Juan Dolio & Guayacanes",
        categoria: "Playa & Gastronomía",
        tiempo: "50-60 min",
        distanciaKm: "55 km",
        descripcion: "Playas de oleaje sereno ideales para familias con restaurantes frente al mar y atardeceres dorados.",
        carretera: "Autovía del Este"
      },
      {
        nombre: "San Cristóbal: Cuevas del Pomier & Casa de Caoba",
        categoria: "Espeleología & Memoria",
        tiempo: "45-55 min",
        distanciaKm: "35 km",
        descripcion: "Complejo de más de 55 cuevas con la mayor concentración de arte rupestre taíno del Caribe.",
        carretera: "Autopista 6 de Noviembre"
      }
    ],
    "90": [
      {
        nombre: "Baní: Dunas de Baní & Salinas de Puerto Hermoso",
        categoria: "Desierto Costero & Salineras",
        tiempo: "75-85 min",
        distanciaKm: "78 km",
        descripcion: "Montañas de arena de hasta 35 metros de altura frente al Mar Caribe y montañas de sal marina rosada.",
        carretera: "Carretera Sánchez"
      },
      {
        nombre: "Bayaguana & Salto Alto",
        categoria: "Ecoturismo de Río",
        tiempo: "70-80 min",
        distanciaKm: "64 km",
        descripcion: "Tres cascadas consecutivas que caen en una piscina verde esmeralda rodeada de bosque virgen.",
        carretera: "Carretera Mella / Tramo Monte Plata"
      },
      {
        nombre: "Pueblo Cocolo de San Pedro de Macorís",
        categoria: "Cultura & Béisbol",
        tiempo: "65-75 min",
        distanciaKm: "72 km",
        descripcion: "Cuna de los peloteros de Grandes Ligas, arquitectura victoriana y la tradición oral de los Guloyas.",
        carretera: "Autovía del Este"
      }
    ]
  };

  const currentSpots = spotsData[selectedRadius];

  return (
    <section className="py-12 bg-background border-b border-border/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="outline" className="text-xs mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
              Mejora 608 · Mapa de Tiempo en Carro
            </Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              ¿Qué hay alrededor de tu estancia?
            </h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Descubre qué visitar en carretera según el tiempo que desees conducir desde <strong>{destinationName}</strong>.
            </p>
          </div>

          {/* Time Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-xl border border-border/60">
            <button
              onClick={() => setSelectedRadius("30")}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                selectedRadius === "30"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> A 30 minutos
            </button>
            <button
              onClick={() => setSelectedRadius("60")}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                selectedRadius === "60"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> A 60 minutos
            </button>
            <button
              onClick={() => setSelectedRadius("90")}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                selectedRadius === "90"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> A 90 minutos
            </button>
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {currentSpots.map((spot, i) => (
            <div
              key={i}
              className="bg-card border border-border/80 rounded-2xl p-5 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {spot.categoria}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Car className="w-3 h-3" /> {spot.tiempo}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {spot.nombre}
                </h3>
                
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {spot.descripcion}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-foreground/80">
                    <Navigation className="w-3 h-3 text-primary" /> {spot.distanciaKm}
                  </span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded">
                    {spot.carretera}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Tiempos calculados con tráfico estándar en carreteras principales y autopistas dominicanas.</span>
        </div>
      </div>
    </section>
  );
}
