import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home, Heart, UtensilsCrossed, MapPin, Calendar, Star,
  Palmtree, Music, Camera, Users, Gift, Plane, CheckCircle
} from "lucide-react";
import santoDomingo from "@/assets/santo-domingo.jpg";

const novedades = [
  { titulo: "Teleférico de Santo Domingo", desc: "Sistema de transporte aéreo moderno que conecta barrios de la capital. Una experiencia panorámica nueva.", icono: "🚡" },
  { titulo: "Malecón renovado", desc: "Iluminación, áreas verdes y ciclovía. El Malecón ahora es más moderno y seguro para pasear.", icono: "🌊" },
  { titulo: "Ciudad Colonial restaurada", desc: "Más museos, galerías y restaurantes. La Zona Colonial es más vibrante que nunca.", icono: "🏛️" },
  { titulo: "Nuevos resorts en Miches", desc: "Club Med y otros resorts abrieron en la costa virgen de Miches. Un destino emergente.", icono: "🏖️" },
  { titulo: "Aeropuerto PUJ expandido", desc: "Terminal renovada con más capacidad, WiFi gratis y zona comercial ampliada.", icono: "✈️" },
  { titulo: "Gastronomía en auge", desc: "Restaurantes dominicanos premiados internacionalmente. La cocina local tiene su momento.", icono: "🍽️" },
];

const experienciasNostalgia = [
  { nombre: "Comer La Bandera como mamá la hacía", desc: "Arroz, habichuelas y carne con aguacate. Busca los comedores locales auténticos.", icon: UtensilsCrossed },
  { nombre: "Escuchar merengue en un colmado", desc: "La experiencia más dominicana que existe. Cerveza fría, merengue a todo volumen.", icon: Music },
  { nombre: "Visitar tu pueblo de origen", desc: "Reconecta con tus raíces. Cada pueblo tiene su encanto y su gente.", icon: Home },
  { nombre: "Ir a la playa del campo", desc: "Las playas que recuerdas de niño siguen ahí. Algunas mejor cuidadas que antes.", icon: Palmtree },
  { nombre: "Jugar dominó en el parque", desc: "Reúnete con la familia y revive las tardes de dominó bajo los árboles.", icon: Users },
  { nombre: "Probar los dulces típicos", desc: "Jalao, dulce de coco, habichuelas con dulce en Semana Santa. Los sabores de casa.", icon: Heart },
];

const paquetesDiaspora = [
  { titulo: "Paquete Navidad en Casa", periodo: "Dic 15 - Ene 5", desc: "Vuelo + hotel + transfer + cena de Nochebuena. Ideal para reunión familiar.", precio: "Desde US$599/persona" },
  { titulo: "Semana Santa Familiar", periodo: "Marzo/Abril", desc: "Playa + procesiones + habichuelas con dulce. Todo en un paquete.", precio: "Desde US$449/persona" },
  { titulo: "Carnaval Febrero", periodo: "Todo febrero", desc: "Carnaval de La Vega + Santiago + hotel + transfer. Vive la tradición.", precio: "Desde US$399/persona" },
  { titulo: "Reencuentro Verano", periodo: "Jun-Ago", desc: "Precios bajos de temporada. Lleva a los hijos a conocer la tierra.", precio: "Desde US$349/persona" },
];

const datosUtiles = [
  { pregunta: "¿Necesito pasaporte dominicano?", respuesta: "Si tienes doble ciudadanía, puedes entrar con cualquier pasaporte. Con pasaporte EE.UU./Canadá/EU no necesitas visa." },
  { pregunta: "¿Puedo llevar medicinas?", respuesta: "Sí, lleva tus recetas médicas. Medicamentos comunes están disponibles en farmacias locales sin problemas." },
  { pregunta: "¿Las tarjetas de EE.UU. funcionan?", respuesta: "Sí, Visa/Mastercard se aceptan en todas partes. Los cajeros cobran comisión de ~US$5." },
  { pregunta: "¿Puedo enviar paquetes antes?", respuesta: "Sí, servicios como EPS, BM Cargo y otros hacen envíos puerta a puerta desde EE.UU. a RD." },
  { pregunta: "¿Cuántas maletas puedo llevar?", respuesta: "Depende de la aerolínea. JetBlue, Spirit y American tienen políticas diferentes. Verifica antes." },
  { pregunta: "¿Puedo traer armas de fuego?", respuesta: "NO. Está estrictamente prohibido. Penas severas de cárcel." },
];

export default function VuelveACasa() {
  return (
    <PageTransition>
      <SEOHead
        title="Vuelve a Casa - Guía para la Diáspora Dominicana"
        description="Guía para dominicanos en el exterior que regresan de visita. Novedades del país, paquetes especiales, experiencias nostálgicas y datos prácticos."
        keywords="dominicanos exterior, diaspora dominicana, volver a RD, paquetes navidad dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative min-h-[45vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={santoDomingo} alt="Santo Domingo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
          <div className="container mx-auto px-4 relative z-10 py-16">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              🇩🇴 Para Dominicanos en el Exterior
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 max-w-2xl">
              Vuelve a <span className="text-primary">Casa</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Tu tierra te espera. Descubre qué ha cambiado, revive tus recuerdos y planifica tu regreso perfecto.
            </p>
          </div>
        </section>

        {/* Novedades */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🆕 Lo Nuevo en RD</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {novedades.map(n => (
                <Card key={n.titulo}>
                  <CardContent className="p-5">
                    <span className="text-2xl mb-2 block">{n.icono}</span>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{n.titulo}</h3>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Experiencias nostálgicas */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">💛 Experiencias que Extrañas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {experienciasNostalgia.map(e => (
                <div key={e.nombre} className="bg-background rounded-xl p-5 border border-border flex gap-4">
                  <e.icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{e.nombre}</h3>
                    <p className="text-xs text-muted-foreground">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Paquetes especiales */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🎁 Paquetes Especiales para la Diáspora</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {paquetesDiaspora.map(p => (
                <Card key={p.titulo} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-1">{p.titulo}</h3>
                    <Badge variant="outline" className="text-[10px] mb-2">{p.periodo}</Badge>
                    <p className="text-sm text-muted-foreground mb-2">{p.desc}</p>
                    <p className="text-primary font-bold text-sm">{p.precio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">❓ Preguntas Frecuentes</h2>
            <div className="space-y-3">
              {datosUtiles.map(d => (
                <div key={d.pregunta} className="bg-background rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{d.pregunta}</h3>
                  <p className="text-xs text-muted-foreground">{d.respuesta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
