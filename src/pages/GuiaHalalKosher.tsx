import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Utensils, MapPin, Phone, Star, ShieldCheck, Info, Globe, 
  CheckCircle2, Compass, Heart, Salad, Clock, Sparkles
} from "lucide-react";
import { PanoramaAd } from "@/components/promo";
import gastronomyImg from "@/assets/gastronomy.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";

const restaurantesHalal = [
  { nombre: "Al-Quds Restaurant & Lounge", zona: "Zona Colonial / Santo Domingo", tipo: "Halal Certificado", rating: 4.8, telefono: "+1 809-555-0101", descripcion: "Cocina árabe auténtica con certificación Halal estricta. Especialidades en shawarma de cordero, hummus y mezze libanés.", direccion: "Calle El Conde, Santo Domingo" },
  { nombre: "Istanbul Turkish Kebab & Grill", zona: "Bávaro / Punta Cana", tipo: "Halal Certificado", rating: 4.6, telefono: "+1 809-555-0102", descripcion: "Carnes importadas con sello Halal preparadas al carbón. Kebabs de ternera, falafel fresco y té turco tradicional.", direccion: "Av. España, Bávaro" },
  { nombre: "Medina Moroccan & Middle Eastern", zona: "Los Jardines / Santiago", tipo: "Halal Friendly", rating: 4.5, telefono: "+1 809-555-0103", descripcion: "Tajines tradicionales de cordero y pollo Halal con cuscús aromático y frutos secos.", direccion: "Av. Juan Pablo Duarte, Santiago" },
  { nombre: "Sahara Oasis Lounge", zona: "Marina Casa de Campo / La Romana", tipo: "Halal Friendly", rating: 4.4, telefono: "+1 809-555-0104", descripcion: "Restaurante de fusión mediterránea y árabe con opciones Halal preparadas bajo estrictos protocolos.", direccion: "Marina de Casa de Campo" }
];

const restaurantesKosher = [
  { nombre: "Shalom Kosher Kitchen & Bakery", zona: "Piantini / Santo Domingo", tipo: "Glatt Kosher Certificado", rating: 4.9, telefono: "+1 809-555-0201", descripcion: "Supervisión rabínica permanente (Mashguiaj). Carnes Glatt Kosher, pan jalá fresco para Shabat y servicio de catering para eventos.", direccion: "Sector Piantini, Santo Domingo" },
  { nombre: "David's New York Kosher Deli", zona: "Punta Cana Village", tipo: "Kosher Friendly", rating: 4.6, telefono: "+1 809-555-0202", descripcion: "Deli estilo Manhattan con pastrami importado, sándwiches kosher, bagels y productos envasados con hejsher internacional.", direccion: "Galerías Puntacana, Punta Cana" }
];

const resortsConOpciones = [
  { nombre: "Eden Roc Cap Cana", zona: "Cap Cana", opciones: ["Chef privado para menús Kosher y Halal", "Cocina separada disponible en villas privadas", "Ingredientes importados con aviso previo"], contacto: "+1 809-469-7469" },
  { nombre: "Casa de Campo Resort & Villas", zona: "La Romana", opciones: ["Servicio de catering Kosher supervisado", "Menú Halal personalizado para banquetes", "Coordinación para grupos religiosos"], contacto: "+1 809-523-3333" },
  { nombre: "Hard Rock Hotel & Casino Punta Cana", zona: "Punta Cana", opciones: ["Opciones de carne Halal certificada en buffet", "Comidas Kosher selladas con aviso de 72h"], contacto: "+1 809-731-0099" },
  { nombre: "Barceló Bávaro Grand Resort", zona: "Bávaro", opciones: ["Estación vegetariana y pescados sin mezcla cárnica", "Chefs capacitados en restricciones dietéticas"], contacto: "+1 809-686-5797" }
];

const consejosGenerales = [
  { emoji: "📞", titulo: "Notificación Previa", desc: "Contacta a tu resort con al menos 72 horas de anticipación para garantizar disponibilidad de carnes certificadas o vajilla sellada." },
  { emoji: "🐟", titulo: "Pescados y Mariscos", desc: "La pesca del día (mero, pargo, dorado) preparada al vapor o a la plancha es una alternativa naturalmente apta para ambas dietas." },
  { emoji: "🛒", titulo: "Supermercados con Importaciones", desc: "Cadenas como Supermercados Nacional y Bravo en Santo Domingo y Punta Cana cuentan con secciones de productos con certificación Kosher (OU, OK, Star-K) y productos Halal." },
  { emoji: "🧭", titulo: "Orientación Qibla", desc: "En República Dominicana, la dirección de la Meca (Qibla) se encuentra aproximadamente a 65° hacia el Este-Noreste." }
];

const platosNaturales = [
  { nombre: "Pescado al Vapor con Vegetales y Tostones", desc: "Pargo rojo o dorado fresco cocinado con hierbas de huerto y plátano verde frito en aceite vegetal virgen.", dieta: "Compatible Halal & Kosher (Parev)" },
  { nombre: "Arroz con Habichuelas Negras o Rojas", desc: "La base criolla tradicional, cocinada con cebolla, ajo, cilantro y orégano. Solicitar versión sin sazonador cárnico.", dieta: "100% Vegetariano / Neutro" },
  { nombre: "Mofongo Vegano de Yuca o Plátano", desc: "Puré tradicional de plátano verde o yuca aderezado con aceite de oliva y ajo criollo (sin chicharrón de cerdo).", dieta: "Libre de derivados animales" },
  { nombre: "Ensalada Tropical con Aguacate Quisqueyano", desc: "Aguacates frescos de Cambita, mango banilejo, palmito y vinagreta cítrica de limón criollo.", dieta: "Naturalmente Apto" }
];

export default function GuiaHalalKosher() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía Halal y Kosher en República Dominicana - Restaurantes y Resorts"
        description="Información completa de viaje para comunidades musulmanas y judías en RD: restaurantes Halal y Kosher, resorts con menús especiales, orientación Qibla y productos importados."
        keywords="halal dominicana, kosher caribe, comida halal punta cana, restaurantes kosher santo domingo, viaje judio republica dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Banner */}
          <section className="relative min-h-[42vh] flex items-center overflow-hidden border-b border-border/60">
            <div className="absolute inset-0">
              <img src={gastronomyImg} alt="Gastronomía Halal y Kosher en República Dominicana" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            </div>
            <div className="container mx-auto px-4 relative z-10 py-14">
              <div className="max-w-2xl">
                <Badge className="mb-3 bg-primary text-primary-foreground font-semibold">
                  <Utensils className="h-3.5 w-3.5 mr-1.5" /> Dietas Religiosas & Certificaciones
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3">
                  Guía <span className="text-primary">Halal & Kosher</span> en RD
                </h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Recursos gastronómicos, establecimientos con supervisión rabínica o certificación islámica, resorts con servicios de catering especial y alternativas naturalmente compatibles.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Tips */}
          <section className="py-10 bg-card/40 border-b border-border">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {consejosGenerales.map((c, i) => (
                  <div key={i} className="bg-background rounded-3xl p-5 border border-border flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="text-2xl mb-2 block">{c.emoji}</span>
                      <h3 className="font-display font-bold text-foreground text-sm mb-1">{c.titulo}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Halal & Kosher Restaurants */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl space-y-12">
              
              {/* Halal Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                      🕌 Restaurantes con Opciones Halal
                    </h2>
                    <p className="text-xs text-muted-foreground">Establecimientos árabes, turcos y mediterráneos con carnes certificadas</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Halal Friendly</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {restaurantesHalal.map(r => (
                    <Card key={r.nombre} className="rounded-3xl border border-border hover:border-primary/40 transition-colors shadow-xs">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/20 text-[10px] mb-1.5">
                              {r.tipo}
                            </Badge>
                            <h3 className="font-display font-bold text-foreground text-lg">{r.nombre}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-primary shrink-0" /> {r.zona}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-current" /> {r.rating}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">{r.descripcion}</p>
                        
                        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate max-w-[200px]">{r.direccion}</span>
                          <span className="text-primary font-semibold flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {r.telefono}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Kosher Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                      ✡️ Restaurantes & Servicios Kosher
                    </h2>
                    <p className="text-xs text-muted-foreground">Opciones con certificación rabínica y alimentos empacados</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Supervisión Rabínica</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {restaurantesKosher.map(r => (
                    <Card key={r.nombre} className="rounded-3xl border border-border hover:border-primary/40 transition-colors shadow-xs">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20 text-[10px] mb-1.5">
                              {r.tipo}
                            </Badge>
                            <h3 className="font-display font-bold text-foreground text-lg">{r.nombre}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-primary shrink-0" /> {r.zona}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-current" /> {r.rating}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">{r.descripcion}</p>
                        
                        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate max-w-[200px]">{r.direccion}</span>
                          <span className="text-primary font-semibold flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {r.telefono}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Resorts with Special Menus */}
          <section className="py-12 bg-card/40 border-y border-border">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <Badge variant="outline" className="mb-2 text-xs">Hotelería Adaptada</Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Resorts con Servicios Dietéticos Especiales</h2>
                <p className="text-xs text-muted-foreground mt-1">Hoteles de lujo preparados para recibir solicitudes gastronómicas religiosas</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {resortsConOpciones.map(resort => (
                  <div key={resort.nombre} className="bg-background rounded-3xl p-5 border border-border flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="text-xs text-primary font-semibold block mb-1">{resort.zona}</span>
                      <h4 className="font-display font-bold text-foreground text-base mb-3">{resort.nombre}</h4>
                      <div className="space-y-1.5 mb-4">
                        {resort.opciones.map((op, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{op}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground">
                      <span>Contacto: <strong className="text-foreground">{resort.contacto}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Naturally Compatible Local Dishes */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <Badge variant="outline" className="mb-2 text-xs">Sabor Dominicano Sin Restricciones</Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Platos Criollos Naturalmente Compatibles</h2>
                <p className="text-xs text-muted-foreground mt-1">Disfruta la auténtica cocina dominicana solicitando preparaciones sin cerdo ni mezclas cárnicas</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {platosNaturales.map(p => (
                  <div key={p.nombre} className="bg-card rounded-3xl p-5 border border-border flex flex-col justify-between shadow-xs">
                    <div>
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none mb-2">
                        {p.dieta}
                      </Badge>
                      <h4 className="font-display font-bold text-foreground text-sm mb-2">{p.nombre}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Religious Communities Info */}
          <section className="py-12 bg-card/40 border-t border-border">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <Badge variant="outline" className="mb-2 text-xs">Conexión Comunitaria</Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Comunidades y Espacios de Rezo</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="rounded-3xl border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-display">Comunidad Musulmana en RD</CardTitle>
                        <span className="text-xs text-muted-foreground">Centro Islámico de Santo Domingo</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                    <p>• <strong>Mezquita Principal:</strong> Centro Islámico Dominicano (Av. Francia, Santo Domingo). Servicios de Salat y Jumu'ah los viernes.</p>
                    <p>• <strong>Qibla:</strong> 65° ENE desde cualquier punto de la isla.</p>
                    <p>• <strong>Ramadán:</strong> Los principales resorts de Bávaro y La Romana facilitan horarios especiales para el Iftar y Suhoor.</p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-display">Comunidad Judía en RD</CardTitle>
                        <span className="text-xs text-muted-foreground">Centro Israelita & Sosúa Histórica</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                    <p>• <strong>Sinagoga de Santo Domingo:</strong> Centro Israelita de la República Dominicana con servicios de Shabat y festividades.</p>
                    <p>• <strong>Sosúa (Puerto Plata):</strong> Comunidad histórica fundada en 1940 con sinagoga y el Museo Judío de Sosúa.</p>
                    <p>• <strong>Shabat en Hoteles:</strong> Coordinación de llaves mecánicas y lámparas de Shabat en hoteles de Cap Cana y Santo Domingo.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Bottom Panorama Ad */}
          <div className="container mx-auto px-4 max-w-6xl pb-16">
            <PanoramaAd />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
