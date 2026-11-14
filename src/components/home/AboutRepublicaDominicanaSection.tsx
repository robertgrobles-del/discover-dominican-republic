import { motion } from "framer-motion";
import { 
  MapPin
} from "lucide-react";
import { usePageContent } from "@/lib/pageContent";

const cinematicMoments = [
  {
    title: "Bahía de las Águilas",
    location: "Pedernales",
    tag: "Paraíso Virgen",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Pico Duarte & Cordillera Central",
    location: "Jarabacoa",
    tag: "Techo del Caribe (3,087m)",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Ciudad Colonial de 1502",
    location: "Santo Domingo",
    tag: "Primada de América",
    image: "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=800&auto=format&fit=crop&q=80",
  },
];

export function AboutRepublicaDominicanaSection() {
  const pc = usePageContent("about-republica-dominicana-section");
  const cinematicMoments = pc.data("cinematicMoments", __pcData.cinematicMoments);
  return (
    <section className="relative py-14 lg:py-20 bg-background text-foreground overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Unified Title & Dominican Republic Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Main Unified Heading */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">{pc.tx("h2.1", "Un Viaje Más Allá de lo Ordinario:")}{" "}
              <span className="text-primary">{pc.tx("span.1", "República Dominicana")}</span>
            </h2>

            {/* Prominent Lead Statement */}
            <p className="text-base sm:text-lg font-medium text-foreground/90 leading-relaxed">{pc.tx("p.1", "Más que playas de ensueño: somos la cuna histórica del Nuevo Mundo, el hogar de las cumbres más altas del Caribe insular, bosques nublados, manglares infinitos y una tierra donde convergen historia milenaria, naturaleza salvaje y hospitalidad sincera.")}</p>

            {/* Descriptive Body Paragraphs focusing purely on DR authentic essence */}
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <p>{pc.tx("p.2", "Desde la primada Ciudad Colonial de 1502 hasta la inmensidad virgen de Bahía de las Águilas, República Dominicana ofrece un contraste geográfico y cultural inigualable. Cada provincia resguarda tradiciones centenarias, notas de merengue y bachata en el aire, y el calor humano de una gente que recibe al visitante como a un hermano.")}</p>
              <p>{pc.tx("p.3", "Aquí, la aventura se vive en cada rincón: el avistamiento de ballenas jorobadas en las cálidas aguas de Samaná, el aroma de las plantaciones de café en las montañas de Jarabacoa, el senderismo hacia la cumbre del Pico Duarte a más de 3,000 metros de altura, y los arrecifes coralinos más vivos y protegidos del archipiélago.")}</p>
            </div>
          </motion.div>

          {/* Right Column: Layered Cinematic Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative"
          >
            {/* Cinematic Layered Cards overlapping layout */}
            <div className="relative h-[420px] sm:h-[460px] md:h-[480px] w-full flex items-center justify-center">
              {/* Back Card (Left tilted) */}
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="absolute left-2 sm:left-4 md:left-6 top-8 w-[150px] sm:w-[190px] md:w-[220px] h-[250px] sm:h-[300px] md:h-[320px] rounded-2xl overflow-hidden border border-border/80 shadow-sm -rotate-6 z-10 bg-card group"
              >
                <img 
                  src={cinematicMoments[0].image} 
                  alt={cinematicMoments[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-3xs font-bold uppercase tracking-wider text-amber-300">{cinematicMoments[0].tag}</span>
                  <p className="text-xs sm:text-sm font-bold text-white">{cinematicMoments[0].title}</p>
                  <p className="text-3xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-2.5 w-2.5 text-primary" /> {cinematicMoments[0].location}
                  </p>
                </div>
              </motion.div>

              {/* Middle Card (Main Center High impact) */}
              <motion.div 
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="absolute w-[180px] sm:w-[230px] md:w-[260px] h-[310px] sm:h-[370px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl shadow-primary/10 z-20 bg-card group"
              >
                <img 
                  src={cinematicMoments[1].image} 
                  alt={cinematicMoments[1].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 flex flex-col justify-end">
                  <div className="mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-slate-950 text-3xs font-black uppercase tracking-wider">
                      {cinematicMoments[1].tag}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-white leading-tight">{cinematicMoments[1].title}</p>
                  <p className="text-xs text-slate-200 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-cyan-400" /> {cinematicMoments[1].location}
                  </p>
                </div>
              </motion.div>

              {/* Front Right Card (Right tilted) */}
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="absolute right-2 sm:right-4 md:right-6 bottom-6 w-[150px] sm:w-[190px] md:w-[220px] h-[260px] sm:h-[310px] md:h-[330px] rounded-2xl overflow-hidden border border-border/80 shadow-sm rotate-6 z-30 bg-card group"
              >
                <img 
                  src={cinematicMoments[2].image} 
                  alt={cinematicMoments[2].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-3xs font-bold uppercase tracking-wider text-cyan-300">{cinematicMoments[2].tag}</span>
                  <p className="text-xs sm:text-sm font-bold text-white">{cinematicMoments[2].title}</p>
                  <p className="text-3xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-2.5 w-2.5 text-primary" /> {cinematicMoments[2].location}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { cinematicMoments };
