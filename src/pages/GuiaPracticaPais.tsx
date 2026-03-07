import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap, Droplets, Phone, Banknote, Clock, ThermometerSun,
  Plug, ShieldCheck, Languages, CreditCard, Lightbulb, AlertTriangle,
  Info, MapPin, Wifi, Car, Stethoscope, ShoppingBag
} from "lucide-react";

const datosEsenciales = [
  {
    icon: Zap, titulo: "Electricidad", color: "text-amber-500",
    datos: [
      { label: "Voltaje", value: "110V / 60Hz" },
      { label: "Enchufe", value: "Tipo A y B (igual que EE.UU.)" },
      { label: "Adaptador necesario", value: "Solo si vienes de Europa, Asia o Sudamérica (220V)" },
      { label: "Consejo", value: "Lleva un protector de sobretensión; los cortes de luz son posibles fuera de zonas turísticas" },
    ]
  },
  {
    icon: Droplets, titulo: "Agua", color: "text-sky-500",
    datos: [
      { label: "¿Es potable?", value: "No se recomienda beber agua del grifo" },
      { label: "Recomendación", value: "Compra agua embotellada (botellones de 5 galones cuestan ~RD$80)" },
      { label: "En hoteles", value: "La mayoría ofrece agua purificada incluida" },
      { label: "Hielo en restaurantes", value: "Generalmente seguro en establecimientos turísticos" },
    ]
  },
  {
    icon: Banknote, titulo: "Propinas", color: "text-emerald-500",
    datos: [
      { label: "Restaurantes", value: "10% propina legal incluida + 18% ITBIS. Adicional 5-10% si el servicio fue bueno" },
      { label: "Hoteles", value: "US$1-2 por maleta al botones; US$2-5/día a la limpieza" },
      { label: "Taxis", value: "No es obligatorio, pero se aprecia redondear" },
      { label: "Tours/Guías", value: "US$5-10 por persona al guía, US$2-5 al conductor" },
      { label: "Spa", value: "15-20% del servicio" },
    ]
  },
  {
    icon: CreditCard, titulo: "Dinero y Pagos", color: "text-violet-500",
    datos: [
      { label: "Moneda", value: "Peso Dominicano (DOP / RD$)" },
      { label: "Dólar aceptado", value: "Sí, en la mayoría de zonas turísticas" },
      { label: "Tarjetas", value: "Visa y Mastercard aceptadas ampliamente; Amex menos común" },
      { label: "Cajeros/ATM", value: "Abundantes en ciudades. Comisión típica: RD$200-400 (~US$4-7)" },
      { label: "Cambio recomendado", value: "Bancos o casas de cambio oficiales. Evita cambistas callejeros" },
    ]
  },
  {
    icon: Clock, titulo: "Horarios", color: "text-orange-500",
    datos: [
      { label: "Zona horaria", value: "AST (UTC-4). No se usa horario de verano" },
      { label: "Bancos", value: "Lunes a viernes 8:30-17:00; sábados 9:00-13:00" },
      { label: "Comercios", value: "9:00-21:00 (centros comerciales hasta 22:00)" },
      { label: "Supermercados", value: "8:00-22:00 (algunos 24h)" },
      { label: "Restaurantes", value: "Almuerzo 12:00-15:00; Cena 18:00-23:00" },
    ]
  },
  {
    icon: ThermometerSun, titulo: "Clima", color: "text-red-500",
    datos: [
      { label: "Temperatura promedio", value: "25-32°C (77-90°F) todo el año" },
      { label: "Temporada seca", value: "Diciembre - Abril (mejor época)" },
      { label: "Temporada lluviosa", value: "Mayo - Noviembre (lluvias breves por la tarde)" },
      { label: "Huracanes", value: "Junio - Noviembre (agosto-octubre mayor riesgo)" },
      { label: "Protección solar", value: "SPF 50+ imprescindible. Sol muy fuerte entre 10am-3pm" },
    ]
  },
  {
    icon: Phone, titulo: "Comunicaciones", color: "text-blue-500",
    datos: [
      { label: "Código país", value: "+1 (809, 829, 849)" },
      { label: "Operadores SIM", value: "Claro, Altice, Viva — SIM turista desde US$5" },
      { label: "eSIM", value: "Disponible con Airalo, Holafly y otros proveedores" },
      { label: "WiFi", value: "Disponible en hoteles, restaurantes y centros comerciales" },
      { label: "Emergencias", value: "911 (policía, bomberos, ambulancia)" },
    ]
  },
  {
    icon: Car, titulo: "Transporte", color: "text-cyan-500",
    datos: [
      { label: "Conducción", value: "Por el lado derecho de la vía" },
      { label: "Licencia", value: "Licencia internacional recomendada; la de tu país es válida 90 días" },
      { label: "Uber/DiDi", value: "Disponible en Santo Domingo y Santiago" },
      { label: "Taxis", value: "Negocia el precio ANTES de subir. No usan taxímetro" },
      { label: "OMSA/Metro", value: "Metro en Santo Domingo: RD$20 (~US$0.35). Moderno y seguro" },
    ]
  },
  {
    icon: Stethoscope, titulo: "Salud", color: "text-rose-500",
    datos: [
      { label: "Vacunas", value: "No se requieren vacunas obligatorias (excepto fiebre amarilla si vienes de zona endémica)" },
      { label: "Farmacias", value: "Cadenas Carol, GBC, Los Hidalgos — abiertas hasta tarde" },
      { label: "Medicamentos comunes", value: "Disponibles sin receta: analgésicos, antihistamínicos, protectores gástricos" },
      { label: "Seguro médico", value: "ALTAMENTE recomendado. La atención privada puede ser costosa" },
      { label: "Hospitales", value: "HOMS (Santiago), Cedimat y CEPN (Santo Domingo) son de clase mundial" },
    ]
  },
  {
    icon: ShoppingBag, titulo: "Compras y Souvenirs", color: "text-pink-500",
    datos: [
      { label: "Artículos típicos", value: "Larimar, ámbar, ron, café, cacao, mamajuana, artesanías en madera" },
      { label: "Duty-Free", value: "Tiendas en aeropuertos con precios libres de impuestos" },
      { label: "Regateo", value: "Aceptable en mercados y vendedores ambulantes; no en tiendas formales" },
      { label: "IVA/ITBIS", value: "18% incluido en precios (no hay devolución de impuestos para turistas)" },
    ]
  },
  {
    icon: Languages, titulo: "Idioma", color: "text-indigo-500",
    datos: [
      { label: "Idioma oficial", value: "Español" },
      { label: "Inglés", value: "Ampliamente hablado en zonas turísticas" },
      { label: "Francés/Alemán/Italiano", value: "En resorts y tours internacionales" },
      { label: "Frases útiles", value: "\"¿Cuánto cuesta?\" = How much? | \"Gracias\" = Thank you | \"¡Qué lo qué!\" = What's up!" },
    ]
  },
  {
    icon: ShieldCheck, titulo: "Seguridad", color: "text-green-500",
    datos: [
      { label: "General", value: "Las zonas turísticas son seguras. Usa sentido común como en cualquier destino" },
      { label: "Objetos de valor", value: "Usa la caja fuerte del hotel. No exhibas joyas costosas" },
      { label: "De noche", value: "Quédate en zonas iluminadas y turísticas" },
      { label: "Policía turística (POLITUR)", value: "Presente en las principales zonas turísticas" },
      { label: "Estafas comunes", value: "Precios inflados sin preguntar, cambistas callejeros con tasas malas" },
    ]
  },
];

const consejosViajeRapidos = [
  { emoji: "🧴", texto: "Lleva protector solar reef-safe (SPF 50+)" },
  { emoji: "🦟", texto: "Repelente de mosquitos, especialmente al atardecer" },
  { emoji: "👟", texto: "Calzado cómodo para caminar en ciudades coloniales" },
  { emoji: "🧢", texto: "Sombrero y gafas de sol son imprescindibles" },
  { emoji: "💧", texto: "Hidrátate constantemente — el clima tropical deshidrata" },
  { emoji: "📱", texto: "Descarga mapas offline por si pierdes señal" },
  { emoji: "💰", texto: "Lleva efectivo pequeño para propinas y vendedores locales" },
  { emoji: "🪪", texto: "Carga una copia de tu pasaporte; deja el original en el hotel" },
];

export default function GuiaPracticaPais() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía Práctica de República Dominicana - Todo lo que Necesitas Saber"
        description="Información esencial para tu viaje: electricidad, propinas, moneda, agua, salud, seguridad, idioma y más. Guía completa para visitantes internacionales."
        keywords="guía práctica RD, información turista, propinas dominicana, voltaje RD, agua potable, moneda peso dominicano"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Lightbulb className="h-3 w-3 mr-1" /> Información Esencial
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Guía Práctica de <span className="text-primary">República Dominicana</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Todo lo que necesitas saber antes de viajar: electricidad, propinas, moneda, salud, seguridad, idioma y cultura local.
            </p>
          </div>
        </section>

        {/* Tips rápidos */}
        <section className="py-8 bg-card/50 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-semibold text-foreground mb-4 text-center text-sm uppercase tracking-wide">⚡ Tips Rápidos</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {consejosViajeRapidos.map(c => (
                <Badge key={c.texto} variant="outline" className="py-2 px-3 text-sm">
                  {c.emoji} {c.texto}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Datos esenciales */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {datosEsenciales.map(seccion => (
                <Card key={seccion.titulo} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <seccion.icon className={`h-5 w-5 ${seccion.color}`} />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">{seccion.titulo}</h3>
                    </div>
                    <div className="space-y-3">
                      {seccion.datos.map(d => (
                        <div key={d.label} className="flex gap-3">
                          <span className="text-xs font-semibold text-primary whitespace-nowrap min-w-[120px]">{d.label}</span>
                          <span className="text-sm text-muted-foreground">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparación por país */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🌍 Diferencias según tu País de Origen</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { pais: "🇺🇸 EE.UU. / 🇨🇦 Canadá", diferencias: ["Mismo voltaje y enchufes (110V, tipo A/B)", "Dólar aceptado en zonas turísticas", "No necesitas visa (hasta 30 días)", "Zona horaria similar (EST+1 o igual)"] },
                { pais: "🇪🇸 España / 🇪🇺 Europa", diferencias: ["Necesitas adaptador (220V→110V)", "Diferencia horaria de 5-6 horas", "No necesitas visa (hasta 90 días)", "Seguro de viaje altamente recomendado"] },
                { pais: "🇨🇴 Colombia / 🇲🇽 México", diferencias: ["Mismo voltaje (110V)", "Sin visa para estancias cortas", "Vuelos directos disponibles", "Moneda diferente, pero dólar como referencia"] },
                { pais: "🇧🇷 Brasil", diferencias: ["Voltaje diferente (Brasil usa 127/220V)", "Visa NO requerida hasta 90 días", "Idioma: español vs portugués (se entienden)", "Diferencia horaria de 1-2 horas"] },
              ].map(c => (
                <div key={c.pais} className="bg-background rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">{c.pais}</h3>
                  <ul className="space-y-2">
                    {c.diferencias.map(d => (
                      <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Info className="h-3 w-3 text-primary mt-1 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
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
