import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, MapPin, Phone, Star, ShieldCheck, Info, Globe, CheckCircle } from "lucide-react";

const restaurantesHalal = [
  { nombre: "Al-Quds Restaurant", zona: "Santo Domingo", tipo: "Halal certificado", rating: 4.5, telefono: "+1 809-555-0101", descripcion: "Cocina árabe auténtica con certificación Halal. Especialidades libanesas y palestinas." },
  { nombre: "Istanbul Kebab House", zona: "Punta Cana", tipo: "Halal certificado", rating: 4.3, telefono: "+1 809-555-0102", descripcion: "Cocina turca con carnes certificadas Halal. Kebabs, falafel y mezze." },
  { nombre: "Medina Restaurant", zona: "Santiago", tipo: "Halal friendly", rating: 4.2, telefono: "+1 809-555-0103", descripcion: "Cocina marroquí y del Medio Oriente con opciones Halal." },
  { nombre: "Sahara Lounge", zona: "La Romana", tipo: "Halal friendly", rating: 4.0, telefono: "+1 809-555-0104", descripcion: "Restaurante de fusión con menú Halal disponible bajo pedido." },
];

const restaurantesKosher = [
  { nombre: "Shalom Kosher Kitchen", zona: "Santo Domingo", tipo: "Kosher certificado", rating: 4.6, telefono: "+1 809-555-0201", descripcion: "El único restaurante totalmente Kosher en Santo Domingo. Supervisión rabínica permanente." },
  { nombre: "David's Deli", zona: "Punta Cana", tipo: "Kosher friendly", rating: 4.1, telefono: "+1 809-555-0202", descripcion: "Deli estilo Nueva York con opciones Kosher y productos importados." },
];

const resortsConOpciones = [
  { nombre: "Hard Rock Hotel Punta Cana", zona: "Punta Cana", opciones: ["Menú Halal bajo pedido", "Cocina Kosher con aviso previo 72h"], contacto: "+1 809-731-0099" },
  { nombre: "Barceló Bávaro Palace", zona: "Bávaro", opciones: ["Chef dedicado para dietas especiales", "Ingredientes Halal disponibles"], contacto: "+1 809-686-5797" },
  { nombre: "Casa de Campo Resort", zona: "La Romana", opciones: ["Servicio de catering Kosher", "Menú Halal personalizado"], contacto: "+1 809-523-3333" },
  { nombre: "Club Med Punta Cana", zona: "Punta Cana", opciones: ["Opciones vegetarianas abundantes", "Adaptaciones religiosas con aviso"], contacto: "+1 809-686-5500" },
];

const consejosGenerales = [
  { emoji: "📞", texto: "Contacta tu hotel al menos 72 horas antes para solicitar menú Halal o Kosher" },
  { emoji: "🥩", texto: "La carne Halal certificada se encuentra en supermercados grandes de Santo Domingo" },
  { emoji: "🐟", texto: "Los mariscos y pescados frescos son una excelente opción natural para ambas dietas" },
  { emoji: "🥗", texto: "La cocina dominicana tiene muchos platos naturalmente compatibles: arroz, habichuelas, ensaladas" },
  { emoji: "🏪", texto: "Supermercados Nacional y Bravo tienen secciones de productos internacionales/importados" },
  { emoji: "🕌", texto: "La comunidad musulmana en Santo Domingo puede orientarte sobre carnicerías Halal" },
  { emoji: "✡️", texto: "La comunidad judía en Sosúa (histórica) puede conectarte con recursos Kosher" },
  { emoji: "📱", texto: "Apps como HalalTrip y Kosher GPS pueden ayudarte a encontrar opciones" },
];

const platosNaturales = [
  { nombre: "Arroz Blanco con Habichuelas", descripcion: "Plato base de la comida dominicana. Naturalmente Halal y Kosher (sin cerdo).", nota: "Pedir sin cerdo si viene con carne" },
  { nombre: "Pescado Frito con Tostones", descripcion: "Pescado fresco del día con plátano verde frito. Compatible con ambas dietas.", nota: "Verificar aceite de fritura" },
  { nombre: "Mofongo de Vegetales", descripcion: "Plátano verde majado con vegetales salteados. Opción segura y deliciosa.", nota: "Pedir sin chicharrón" },
  { nombre: "Ensalada Tropical", descripcion: "Aguacate, mango, palmito y vegetales frescos. Siempre compatible.", nota: "Sin restricciones" },
  { nombre: "Jugos Naturales", descripcion: "Chinola (maracuyá), piña, lechosa (papaya), morir soñando. Todos naturales.", nota: "Sin restricciones" },
  { nombre: "Habichuelas Guisadas", descripcion: "Guiso de frijoles con especias dominicanas. Pedir versión sin carne.", nota: "Verificar ingredientes" },
];

export default function GuiaHalalKosher() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía Halal y Kosher en República Dominicana"
        description="Encuentra restaurantes Halal y Kosher, resorts con opciones religiosas, platos naturalmente compatibles y consejos para viajeros musulmanes y judíos en RD."
        keywords="halal dominicana, kosher caribe, comida halal punta cana, restaurantes kosher santo domingo, dieta religiosa viaje"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Utensils className="h-3 w-3 mr-1" /> Dietas Religiosas
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Guía <span className="text-primary">Halal & Kosher</span> en RD
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Información completa para viajeros musulmanes y judíos: restaurantes certificados, resorts con opciones especiales y platos dominicanos naturalmente compatibles.
            </p>
          </div>
        </section>

        {/* Tips rápidos */}
        <section className="py-8 bg-card/50 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-semibold text-foreground mb-4 text-center text-sm uppercase tracking-wide">📋 Consejos Esenciales</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {consejosGenerales.map(c => (
                <Badge key={c.texto} variant="outline" className="py-2 px-3 text-sm">
                  {c.emoji} {c.texto}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Restaurantes Halal */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🕌 Restaurantes Halal</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {restaurantesHalal.map(r => (
                <Card key={r.nombre}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-foreground">{r.nombre}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" /> {r.zona}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">{r.tipo}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{r.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" /> <span className="text-sm font-medium">{r.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" /> {r.telefono}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Restaurantes Kosher */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">✡️ Restaurantes Kosher</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {restaurantesKosher.map(r => (
                <Card key={r.nombre}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-foreground">{r.nombre}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" /> {r.zona}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">{r.tipo}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{r.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" /> <span className="text-sm font-medium">{r.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" /> {r.telefono}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resorts con opciones */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🏨 Resorts con Opciones Especiales</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {resortsConOpciones.map(r => (
                <Card key={r.nombre}>
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-foreground mb-1">{r.nombre}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" /> {r.zona}
                    </div>
                    <ul className="space-y-2 mb-3">
                      {r.opciones.map(o => (
                        <li key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> {o}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" /> {r.contacto}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platos naturalmente compatibles */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4 text-center">🍽️ Platos Dominicanos Naturalmente Compatibles</h2>
            <p className="text-center text-muted-foreground mb-8">Muchos platos tradicionales son compatibles con dietas Halal y Kosher con pequeñas adaptaciones.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {platosNaturales.map(p => (
                <div key={p.nombre} className="bg-background rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{p.nombre}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{p.descripcion}</p>
                  <Badge variant="outline" className="text-xs">
                    <Info className="h-3 w-3 mr-1" /> {p.nota}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comunidades religiosas */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🤝 Comunidades Religiosas en RD</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="font-display font-bold text-foreground">Comunidad Musulmana</h3>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Centro Islámico de RD</strong> — Santo Domingo. Mezquita con servicios regulares de oración.</p>
                    <p><strong className="text-foreground">Dirección Qibla</strong> — Desde RD: aproximadamente 65° Este-Noreste.</p>
                    <p><strong className="text-foreground">Horarios de oración</strong> — Disponibles en apps como Muslim Pro.</p>
                    <p><strong className="text-foreground">Ramadán</strong> — Los hoteles principales acomodan horarios de Iftar y Suhoor con aviso previo.</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-display font-bold text-foreground">Comunidad Judía</h3>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Sinagoga de Santo Domingo</strong> — Centro de la comunidad judía dominicana.</p>
                    <p><strong className="text-foreground">Sosúa</strong> — Historia judía: refugiados europeos en los años 1940. Museo Judío de Sosúa.</p>
                    <p><strong className="text-foreground">Shabat</strong> — Algunos hoteles pueden acomodar necesidades de Shabat con aviso previo.</p>
                    <p><strong className="text-foreground">Productos Kosher</strong> — Importados disponibles en tiendas especializadas de Santo Domingo.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
