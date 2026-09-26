import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, Sun, Cloud, Waves, Music, PartyPopper,
  Palmtree, Ship, Mountain, Heart, Star, ThermometerSun,
  Fish, Camera, UtensilsCrossed
} from "lucide-react";

const meses = [
  {
    nombre: "Enero", emoji: "❄️☀️", clima: "Seco y agradable (24-30°C)",
    eventos: ["Avistamiento de ballenas jorobadas en Samaná (hasta marzo)", "Día de Reyes (6 de enero)", "Temporada alta turística"],
    fiestaPatronal: "Virgen de la Altagracia (21 de enero, Higüey - La Altagracia) & San Antonio (Guerra)",
    ideal: ["Playa", "Ballenas", "Romance"], color: "text-sky-500",
    tip: "Mejor mes para ver ballenas. Reserva tours con anticipación."
  },
  {
    nombre: "Febrero", emoji: "💕☀️", clima: "Seco y agradable (24-30°C)",
    eventos: ["Carnaval dominicano (todo el mes)", "Día de San Valentín", "Independencia Nacional (27 feb)"],
    fiestaPatronal: "Nuestra Señora de la Candelaria (2 de feb, San Jerónimo y San Carlos)",
    ideal: ["Carnaval", "Romance", "Cultura"], color: "text-rose-500",
    tip: "Los carnavales de La Vega y Santiago son los más espectaculares."
  },
  {
    nombre: "Marzo", emoji: "☀️🐋", clima: "Seco, calentando (25-31°C)",
    eventos: ["Últimas ballenas en Samaná", "Semana Santa (varía)", "Festival del Merengue en Cabarete"],
    fiestaPatronal: "San José (19 de marzo, San José de Ocoa, Matanzas y San José de las Matas)",
    ideal: ["Playa", "Ballenas", "Semana Santa"], color: "text-amber-500",
    tip: "Semana Santa es temporada altísima. Reserva con meses de anticipación."
  },
  {
    nombre: "Abril", emoji: "🌤️🌺", clima: "Transición (26-31°C), lluvias ocasionales",
    eventos: ["Semana Santa (si cae aquí)", "Inicio de temporada baja", "Festival de Jazz de Cabarete"],
    fiestaPatronal: "San Jorge & Santa Lucía (Las Terrenas y Hondo Valle)",
    ideal: ["Ofertas", "Jazz", "Playa"], color: "text-emerald-500",
    tip: "Excelente relación precio-calidad. Hoteles con descuentos de hasta 40%."
  },
  {
    nombre: "Mayo", emoji: "🌧️🌴", clima: "Inicio de lluvias (27-32°C)",
    eventos: ["Día del Trabajo (1 mayo)", "Temporada baja — mejores precios", "Festival gastronómico DR Taste"],
    fiestaPatronal: "San Fernando (30 de mayo, Montecristi) & Santa Cruz (El Seibo)",
    ideal: ["Presupuesto", "Gastronomía", "Aventura"], color: "text-teal-500",
    tip: "Las lluvias suelen ser cortas y por la tarde. Mañanas soleadas."
  },
  {
    nombre: "Junio", emoji: "🌧️🏖️", clima: "Lluvioso (27-33°C)",
    eventos: ["Inicio temporada de huracanes", "Festival del Merengue (Santo Domingo)", "Precios bajos"],
    fiestaPatronal: "San Juan Bautista (24 de junio, San Juan de la Maguana y Baní)",
    ideal: ["Presupuesto", "Merengue", "Cultura"], color: "text-blue-500",
    tip: "Resorts ofrecen los mejores precios del año. Lluvias intermitentes."
  },
  {
    nombre: "Julio", emoji: "☀️🎶", clima: "Caliente y húmedo (28-33°C)",
    eventos: ["Festival del Merengue en el Malecón", "Temporada de mangos", "Vacaciones escolares EE.UU."],
    fiestaPatronal: "Virgen del Carmen (16 de julio, Jarabacoa, Barahona y Boca Chica) & Santiago Apóstol (25 de julio, Santiago de los Caballeros)",
    ideal: ["Merengue", "Playa", "Familia"], color: "text-orange-500",
    tip: "Julio es popular entre familias norteamericanas. Resorts animados."
  },
  {
    nombre: "Agosto", emoji: "🌡️⛈️", clima: "Más caliente (28-34°C), lluvias",
    eventos: ["Día de la Restauración (16 ago)", "Pico de temporada de huracanes", "Precios bajos"],
    fiestaPatronal: "Santa Rosa de Lima (30 de agosto, La Romana) & San Bartolomé (Neyba)",
    ideal: ["Presupuesto", "Aventura"], color: "text-red-500",
    tip: "Mayor riesgo de huracanes. Contrata seguro de viaje con cobertura de cancelación."
  },
  {
    nombre: "Septiembre", emoji: "🌧️💰", clima: "Húmedo (27-33°C)",
    eventos: ["Temporada de huracanes (pico)", "Precios más bajos del año", "Festival de bachata en Santo Domingo"],
    fiestaPatronal: "Virgen de las Mercedes (24 de septiembre, Santo Cerro - La Vega y Constanza)",
    ideal: ["Presupuesto extremo", "Bachata"], color: "text-violet-500",
    tip: "Si el clima coopera, es el mes más económico para viajar."
  },
  {
    nombre: "Octubre", emoji: "🌤️🎃", clima: "Transición (26-32°C)",
    eventos: ["Fin de temporada de huracanes", "Festival de Cine de Santo Domingo", "Precios todavía bajos"],
    fiestaPatronal: "San Rafael Arcángel (24 de octubre, Tamboril y San Rafael del Yuma) & San Judas Tadeo",
    ideal: ["Cine", "Cultura", "Ofertas"], color: "text-purple-500",
    tip: "Octubre es sorprendentemente bueno. Menos turistas, buen clima."
  },
  {
    nombre: "Noviembre", emoji: "☀️🦃", clima: "Mejorando (25-31°C)",
    eventos: ["Inicio temporada alta", "Festival del Ron y Cacao", "Thanksgiving (turistas EE.UU.)"],
    fiestaPatronal: "Santa Cecilia (22 de noviembre) & San Andrés (Boca Chica)",
    ideal: ["Ron", "Gastronomía", "Transición"], color: "text-cyan-500",
    tip: "Últimas oportunidades de precios bajos antes de la temporada alta."
  },
  {
    nombre: "Diciembre", emoji: "🎄☀️", clima: "Seco y fresco (24-30°C)",
    eventos: ["Navidad dominicana", "Año Nuevo en la playa", "Diáspora regresa — ambiente festivo"],
    fiestaPatronal: "Santa Bárbara (4 de diciembre, Samaná) & La Inmaculada Concepción (Cotúi)",
    ideal: ["Navidad", "Fiesta", "Playa"], color: "text-red-500",
    tip: "Temporada más alta. Reserva con 3+ meses de anticipación. Precios premium."
  },
];

export default function CalendarioMensual() {
  return (
    <PageTransition>
      <SEOHead
        title="Calendario de Viaje a RD - Qué Hacer Cada Mes"
        description="Guía mes a mes de República Dominicana: clima, eventos, festivales, precios y mejor temporada para cada tipo de experiencia."
        keywords="mejor época viajar dominicana, calendario eventos RD, temporada ballenas, carnaval dominicano"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3 w-3 mr-1" /> Planifica por Temporada
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Calendario <span className="text-primary">Mes a Mes</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre qué pasa cada mes en República Dominicana: clima, eventos, precios y las mejores experiencias.
            </p>
          </div>
        </section>

        {/* Resumen rápido */}
        <section className="py-6 bg-card/50 border-b border-border">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Sun className="h-3 w-3 text-amber-500" /> Temporada seca: Dic-Abr</span>
              <span className="flex items-center gap-1"><Cloud className="h-3 w-3 text-sky-500" /> Temporada lluviosa: May-Nov</span>
              <span className="flex items-center gap-1"><Fish className="h-3 w-3 text-cyan-500" /> Ballenas: Ene-Mar</span>
              <span className="flex items-center gap-1"><Music className="h-3 w-3 text-rose-500" /> Carnaval: Feb</span>
            </div>
          </div>
        </section>

        {/* Grid de meses */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meses.map(m => (
                <Card key={m.nombre} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{m.emoji} {m.nombre}</h3>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <ThermometerSun className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">{m.clima}</span>
                    </div>

                    <div className="mb-3">
                      <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide mb-1">Eventos</p>
                      <ul className="space-y-1">
                        {m.eventos.map(e => (
                          <li key={e} className="text-xs text-muted-foreground flex items-start gap-1">
                            <Star className="h-2.5 w-2.5 text-primary mt-0.5 shrink-0" /> {e}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {m.fiestaPatronal && (
                      <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                          🎉 Fiesta Patronal
                        </p>
                        <p className="text-xs text-foreground font-medium">{m.fiestaPatronal}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {m.ideal.map(i => (
                        <Badge key={i} variant="outline" className="text-[10px]">{i}</Badge>
                      ))}
                    </div>

                    <p className="text-xs text-primary bg-primary/5 rounded-lg p-2">💡 {m.tip}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
