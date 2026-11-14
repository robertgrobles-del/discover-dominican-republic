import { SectionIndex } from "@/components/SectionIndex";
import { GuiaPracticaSection } from "@/components/requisitos/GuiaPracticaSection";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateFAQSchema } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, AlertCircle, CheckCircle, ChevronRight,
  Clock, CreditCard, Plane, Users, Info, ExternalLink,
  Baby, HeartPulse, Landmark, ShieldCheck, Search, Ticket, CalendarClock, Briefcase
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import heroBeach from "@/assets/hero-beach.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import relaxBeachImg from "@/assets/relax-beach.jpg";
import colonialDoorImg from "@/assets/colonial-door.jpg";
import historyImg from "@/assets/history.jpg";
import beachCategoryImg from "@/assets/beach-category.jpg";
import { usePageContent } from "@/lib/pageContent";

const requisitos = [
  {
    pais: "Estados Unidos",
    emoji: "🇺🇸",
    visa: false,
    estancia: "30 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Mismo voltaje y enchufes (110V, tipo A/B); el dólar se acepta en zonas turísticas."
  },
  {
    pais: "Canadá",
    emoji: "🇨🇦",
    visa: false,
    estancia: "30 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Mismo voltaje y enchufes (110V, tipo A/B); el dólar se acepta en zonas turísticas."
  },
  {
    pais: "España",
    emoji: "🇪🇸",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Necesitas adaptador (220V→110V); diferencia horaria de 5-6 horas."
  },
  {
    pais: "Francia",
    emoji: "🇫🇷",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Necesitas adaptador (220V→110V); diferencia horaria de 5-6 horas."
  },
  {
    pais: "Alemania",
    emoji: "🇩🇪",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Necesitas adaptador (220V→110V); diferencia horaria de 5-6 horas."
  },
  {
    pais: "Reino Unido",
    emoji: "🇬🇧",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Necesitas adaptador (230V→110V, enchufe tipo G); diferencia horaria de 4-5 horas."
  },
  {
    pais: "Argentina",
    emoji: "🇦🇷",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Necesitas adaptador (220V→110V); diferencia horaria de 1 hora."
  },
  {
    pais: "Brasil",
    emoji: "🇧🇷",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Revisa el voltaje (Brasil usa 127/220V); diferencia horaria de 1-2 horas. El español y el portugués se entienden bastante."
  },
  {
    pais: "México",
    emoji: "🇲🇽",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Mismo voltaje (110V); hay vuelos directos."
  },
  {
    pais: "Colombia",
    emoji: "🇨🇴",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses. Mismo voltaje (110V); hay vuelos directos."
  },
];

const documentos = [
  {
    nombre: "Pasaporte",
    descripcion: "Vigente por al menos 6 meses después de la fecha de salida",
    obligatorio: true
  },
  {
    nombre: "E-Ticket / Tarjeta de Turista",
    descripcion: "Formulario electrónico de entrada y salida (incluido en boletos desde 2021)",
    obligatorio: true
  },
  {
    nombre: "Boleto de regreso",
    descripcion: "Prueba de salida del país dentro del período permitido",
    obligatorio: true
  },
  {
    nombre: "Reserva de alojamiento",
    descripcion: "Confirmación de hotel o dirección de estadía",
    obligatorio: true
  },
  {
    nombre: "Seguro de viaje",
    descripcion: "Altamente recomendado, aunque no obligatorio",
    obligatorio: false
  },
  {
    nombre: "Prueba de fondos",
    descripcion: "Puede ser solicitada: ~$100 USD por día de estancia",
    obligatorio: false
  },
];

const aduanas = {
  permitido: [
    "1 litro de bebidas alcohólicas",
    "200 cigarrillos o 1 caja de 50 puros",
    "Efectos personales",
    "Cámara fotográfica y equipo deportivo personal",
    "Laptop y dispositivos electrónicos personales",
    "Medicamentos con receta (con documentación)",
  ],
  prohibido: [
    "Drogas y narcóticos",
    "Armas de fuego sin permiso",
    "Productos agrícolas sin declarar",
    "Especies protegidas (ámbar con insectos, coral, etc.)",
    "Más de $10,000 USD sin declarar",
  ]
};

const estancia = [
  { titulo: "Estancia permitida", texto: "La mayoría de los turistas entra con un permiso de 30 días. Si te quedas más tiempo no necesitas tramitar nada antes: pagas la prórroga de estancia en el aeropuerto al salir, según el tiempo que excediste." },
  { titulo: "Prórroga de estancia", texto: "La tarifa depende del tiempo excedido (desde unos RD$2,500 para estancias de hasta 90 días, más para periodos largos). Las tarifas las fija la Dirección General de Migración y pueden cambiar." },
  { titulo: "Exención de visa por otra visa", texto: "Si tu país requiere visa, puedes entrar sin ella si tienes visa o residencia vigente de Estados Unidos, Canadá, Reino Unido o del espacio Schengen. Lleva el documento original contigo." },
  { titulo: "Trabajar o estudiar", texto: "La tarjeta de turista no permite trabajar ni estudiar. Para eso necesitas una visa específica, que se tramita en el consulado dominicano antes de viajar." },
];

const situaciones = [
  { titulo: "Menores de edad", texto: "Los menores dominicanos o residentes que salen del país sin ambos padres necesitan un permiso de salida de Migración. Para menores extranjeros no es obligatorio, pero se recomienda llevar una carta de autorización notariada del padre o madre ausente.", icono: "baby" },
  { titulo: "Dominicanos con otra nacionalidad", texto: "Si entras con pasaporte dominicano no pagas tarjeta de turista. Con pasaporte extranjero aplican las reglas de ese país, aunque puedas acreditar tu nacionalidad dominicana.", icono: "landmark" },
  { titulo: "Cruceros", texto: "Los pasajeros de crucero que bajan por el día suelen estar exentos de tarjeta de turista; la naviera gestiona el trámite. Lleva siempre tu pasaporte o la identificación que indique la naviera.", icono: "plane" },
];

const preguntas = [
  { q: "¿Necesito imprimir el E-Ticket?", a: "No. Basta con mostrar el código QR en el teléfono, aunque conviene guardar una captura por si no tienes conexión." },
  { q: "¿Cuándo debo llenar el E-Ticket?", a: "Puedes completarlo en los días previos al vuelo. También hay que llenar uno de salida antes de regresar." },
  { q: "¿Qué pasa si mi pasaporte vence pronto?", a: "Se recomienda que tenga al menos 6 meses de vigencia. Muchas aerolíneas niegan el embarque si vence durante el viaje." },
  { q: "¿Puedo traer un dron?", a: "Sí, pero para volarlo necesitas autorización del Instituto Dominicano de Aviación Civil (IDAC). Sin permiso puede ser retenido en aduanas." },
  { q: "¿Puedo viajar con mi mascota?", a: "Sí, con certificado de salud veterinario reciente y vacuna antirrábica al día. Revisa también las reglas de tu aerolínea." },
];

const fuentes = [
  { nombre: "Dirección General de Migración", url: "https://migracion.gob.do" },
  { nombre: "E-Ticket oficial", url: "https://eticket.migracion.gob.do" },
  { nombre: "Dirección General de Aduanas", url: "https://www.aduanas.gob.do" },
  { nombre: "Ministerio de Relaciones Exteriores (visas)", url: "https://mirex.gob.do" },
];

// Pasos y avisos alineados con la guía del E-Ticket (src/pages/ETicket.tsx).
const llegada = [
  { titulo: "Migración", texto: "Presenta tu pasaporte y el código QR del E-Ticket. El agente sella tu entrada y te indica los días permitidos." },
  { titulo: "Equipaje", texto: "Recoge tus maletas en la banda indicada para tu vuelo. Los carritos son gratuitos en la mayoría de terminales." },
  { titulo: "Aduanas", texto: "Vuelve a mostrar el QR. Si declaraste efectivo o mercancías, pasa por el canal rojo; si no, por el verde." },
  { titulo: "Salida", texto: "Usa taxis oficiales del aeropuerto o el traslado de tu hotel. Cambia solo lo necesario en el aeropuerto." },
];

const fraude = [
  "Te cobran por tramitarlo o por «agilizarlo».",
  "La dirección no termina en .gob.do.",
  "Llegaste desde un anuncio que promete gestionarlo por ti.",
  "Te piden los datos de tu tarjeta.",
];

const guias = [
  { titulo: "Guía del E-Ticket", texto: "Cómo llenarlo en 15 minutos y evitar páginas falsas.", url: "/e-ticket", img: puertoPlataImg },
  { titulo: "Aduanas y Duty Free", texto: "Límites de alcohol, puros y efectivo, con calculadora.", url: "/aduanas", img: laRomanaImg },
  { titulo: "Seguro de viaje", texto: "Coberturas recomendadas para tu estadía.", url: "/seguro-viaje", img: relaxBeachImg },
  { titulo: "Embajadas y consulados", texto: "Dónde pedir visa o ayuda consular.", url: "/embajadas", img: colonialDoorImg },
  { titulo: "Leyes para el turista", texto: "Drones, tránsito, drogas y tus derechos.", url: "/leyes-turista", img: historyImg },
  { titulo: "Viajar con mascotas", texto: "Certificados y vacunas para entrar con tu animal.", url: "/viajar-con-mascotas", img: samanaImg },
  { titulo: "Lista de empaque", texto: "Qué llevar según tu tipo de viaje.", url: "/lista-empaque", img: beachCategoryImg },
  { titulo: "Tasas de cambio", texto: "Cuánto vale tu moneda en pesos hoy.", url: "/conversor-moneda#tasas", img: santoDomingoImg },
];

// "canada" encuentra "Canadá".
const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const iconosSituacion = { baby: Baby, salud: HeartPulse, landmark: Landmark, plane: Plane };

export default function RequisitosViaje() {
  const pc = usePageContent("requisitos-viaje");
  const requisitos = pc.data("requisitos", __pcData.requisitos);
  const documentos = pc.data("documentos", __pcData.documentos);
  const aduanas = pc.data("aduanas", __pcData.aduanas);
  const estancia = pc.data("estancia", __pcData.estancia);
  const situaciones = pc.data("situaciones", __pcData.situaciones);
  const preguntas = pc.data("preguntas", __pcData.preguntas);
  const fuentes = pc.data("fuentes", __pcData.fuentes);
  const llegada = pc.data("llegada", __pcData.llegada);
  const fraude = pc.data("fraude", __pcData.fraude);
  const guias = pc.data("guias", __pcData.guias);
  const [paisBusqueda, setPaisBusqueda] = useState("");

  const paisesFiltrados = requisitos.filter(r =>
    sinTildes(r.pais).includes(sinTildes(paisBusqueda.trim()))
  );

  const iconosEstancia = [CalendarClock, Clock, Plane, Briefcase];

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Requisitos de Viaje a República Dominicana")}
        description={pc.t("SEOHead.description.1", "Todo lo que necesitas saber para entrar a RD: visas, documentos, aduanas y formularios requeridos por país.")}
        keywords="requisitos viaje republica dominicana, visa republica dominicana, e-ticket, tarjeta de turista, prorroga de estancia, aduanas rd"
        image={heroBeach}
        url="/requisitos-viaje"
        geo={{
          placename: "República Dominicana",
          region: "DO",
          latitude: 18.7357,
          longitude: -70.1627
        }}
        breadcrumbs={[{ name: "Inicio", url: "/" }, { name: "Planifica", url: "/planifica" }, { name: "Requisitos de viaje", url: "/requisitos-viaje" }]}
        jsonLd={generateFAQSchema(preguntas.map((p) => ({ question: p.q, answer: p.a })))}
      />
      <div className="min-h-dvh flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img
            src={pc.img("img.src.1", heroBeach)}
            alt={pc.t("img.alt.1", "Playa de República Dominicana")}
            className="absolute inset-0 w-full h-full object-cover object-center"
            fetchPriority="high"
          />
          {/* Oscuro de abajo arriba: el título es blanco, así que en modo claro no puede fundirse con el fondo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav aria-label={pc.t("nav.aria-label.2", "Ruta de navegación")} className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">{pc.tx("Link.1", "Inicio")}</Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <Link to="/planifica" className="hover:text-primary transition-colors">{pc.tx("Link.2", "Planifica")}</Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-white font-medium">{pc.tx("span.3", "Requisitos de viaje")}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-semibold">
                  <FileText className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />{" "}{pc.tx("Badge.1", "ENTRADA AL PAÍS")}</Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">{pc.tx("h1.1", "Requisitos de Viaje")}</h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">{pc.tx("p.1", "Documentos, visas, días de estancia y aduanas para entrar a República Dominicana, explicados por país y por situación.")}</p>
              </div>

              {/* Acceso directo al E-Ticket */}
              <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Ticket className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-medium">{pc.tx("p.6", "E-Ticket gratis y obligatorio")}</p>
                  <a href="https://eticket.migracion.gob.do" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline">
                    eticket.migracion.gob.do
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <SectionIndex items={[{ id: "por-pais", label: "Por país" }, { id: "documentos", label: "Documentos" }, { id: "estancia", label: "Estancia" }, { id: "aduanas", label: "Aduanas" }, { id: "preguntas", label: "Preguntas" }, { id: "guia-practica", label: "Guía práctica" }]} />

        {/* Introducción editorial */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">{pc.tx("p.12", "Lo esencial")}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">{pc.tx("h2.2", "Entrar a República Dominicana es sencillo")}</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-pretty">
                <p>{pc.tx("p.13", "La mayoría de los viajeros solo necesita tres cosas: un pasaporte vigente, el E-Ticket completado en línea y un boleto de regreso. La tarjeta de turista ya viene pagada dentro del pasaje aéreo, así que no tienes que comprarla al llegar.")}</p>
                <p>{pc.tx("p.14", "Si tu nacionalidad requiere visa, revisa si tienes una visa o residencia vigente de Estados Unidos, Canadá, Reino Unido o del espacio Schengen: con ella puedes entrar como turista sin tramitar la visa dominicana.")}</p>
              </div>
              <blockquote className="mt-6 border-l-4 border-primary pl-4 font-display text-lg italic text-foreground">
                {pc.tx("blockquote.1", "Revisa tus documentos al menos dos semanas antes del vuelo: la mayoría de los problemas se resuelven en casa, no en el aeropuerto.")}
              </blockquote>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={pc.img("img.src.2", santoDomingoImg)}
                alt={pc.t("img.alt.2", "Zona Colonial de Santo Domingo")}
                loading="lazy"
                className="rounded-3xl w-full aspect-[3/4] object-cover"
              />
              <img
                src={pc.img("img.src.4", puntaCanaImg)}
                alt={pc.t("img.alt.4", "Playa de Punta Cana")}
                loading="lazy"
                className="rounded-3xl w-full aspect-[3/4] object-cover mt-10"
              />
            </div>
          </div>
        </section>

        {/* Por país */}
        <section id="por-pais" className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl scroll-mt-24">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">{pc.tx("Badge.2", "VISA Y ESTANCIA")}</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{pc.tx("TabsTrigger.1", "Requisitos por País")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{pc.tx("p.7", "Busca tu nacionalidad para ver si necesitas visa y cuántos días puedes quedarte.")}</p>
          </div>

          <div className="max-w-md mx-auto mb-8">
            <Label htmlFor="buscar-pais" className="sr-only">{pc.tx("Label.1", "Busca tu país")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-pais"
                className="pl-9 rounded-xl"
                placeholder={pc.t("Input.placeholder.1", "Ej: España, Estados Unidos...")}
                value={paisBusqueda}
                onChange={(e) => setPaisBusqueda(e.target.value)}
              />
            </div>
            <p className="sr-only" aria-live="polite">{paisBusqueda ? `${paisesFiltrados.length} países encontrados` : ""}</p>
          </div>

          {paisesFiltrados.length === 0 ? (
            <div className="text-center p-10 bg-card border border-border rounded-2xl">
              <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
              <p className="text-muted-foreground">{pc.tx("p.2", "No encontramos tu país. Contacta la embajada dominicana más cercana.")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paisesFiltrados.map((req) => (
                <Card key={req.pais} className="bg-card border-border/80 hover:border-primary/40 hover:shadow-lg transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl leading-none" aria-hidden="true">{req.emoji}</span>
                        <h3 className="font-display font-bold text-lg text-foreground">{req.pais}</h3>
                      </div>
                      <Badge variant={req.visa ? "destructive" : "secondary"} className="text-3xs shrink-0">
                        {req.visa ? "Requiere visa" : "Sin visa"}
                      </Badge>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <dt className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-primary" aria-hidden="true" />{pc.tx("span.1", "Estancia")}</dt>
                        <dd className="font-semibold">{req.estancia}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <dt className="flex items-center gap-2 text-muted-foreground"><CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />{pc.tx("span.2", "Tarjeta turista")}</dt>
                        <dd className="font-semibold text-right">{req.tarjeta}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">{req.notas}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 text-xs md:text-sm text-primary leading-relaxed flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{pc.tx("p.5", "Los días de estancia y la exención de visa pueden cambiar. Si tu país no aparece o requiere visa, consulta al consulado dominicano o a la Dirección General de Migración antes de comprar tu boleto.")}</span>
          </div>
        </section>

        {/* Documentos */}
        <section id="documentos" className="py-16 bg-muted/30 border-y border-border/40 scroll-mt-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">{pc.tx("Badge.3", "CHECKLIST")}</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{pc.tx("TabsTrigger.2", "Documentos Requeridos")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{pc.tx("CardDescription.1", "Lo que te pueden pedir en la aerolínea y en Migración al llegar.")}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                {documentos.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/60">
                    {doc.obligatorio ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-foreground">{doc.nombre}</h3>
                        <Badge variant={doc.obligatorio ? "default" : "secondary"} className="text-3xs">
                          {doc.obligatorio ? "Obligatorio" : "Recomendado"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{doc.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-card border-primary/30 h-fit">
                <CardContent className="p-6 space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Ticket className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground">{pc.tx("CardTitle.2", "E-Ticket (Formulario Digital)")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pc.tx("p.3", "Desde 2021, el E-Ticket reemplaza los formularios de migración y aduanas en papel. Es gratuito: se completa en línea antes de llegar y antes de salir, y genera un código QR que muestras en Migración.")}</p>
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <a href="https://eticket.migracion.gob.do" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />{pc.tx("a.1", "Llenar E-Ticket")}</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/e-ticket">{pc.tx("a.2", "Ver guía paso a paso")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Llegada paso a paso (pasos del E-Ticket y aeropuertos del portal) */}
        <section className="relative py-20 overflow-hidden">
          <img
            src={pc.img("img.src.5", laRomanaImg)}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative container mx-auto px-4 lg:px-8 max-w-6xl text-white">
            <div className="max-w-2xl mb-12">
              <Badge className="mb-3 bg-amber-500/20 text-amber-300 border-amber-500/30">{pc.tx("Badge.8", "EL DÍA DEL VUELO")}</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{pc.tx("h2.3", "Tu llegada, paso a paso")}</h2>
              <p className="text-white/80 leading-relaxed">{pc.tx("p.15", "Desde que bajas del avión hasta que sales del aeropuerto suelen pasar entre 30 y 60 minutos. Esto es lo que vas a encontrar.")}</p>
            </div>
            <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              {llegada.map((paso, idx) => (
                <li key={paso.titulo} className="border-t-2 border-amber-400/70 pt-5">
                  <span className="font-display text-4xl font-black text-amber-300/90" aria-hidden="true">{String(idx + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-lg font-bold text-white mt-2 mb-1">{paso.titulo}</h3>
                  <p className="text-sm text-white/75 leading-relaxed">{paso.texto}</p>
                </li>
              ))}
            </ol>
            <p className="mt-12 text-sm text-white/80">
              {pc.tx("p.16", "Principales aeropuertos internacionales:")}{" "}
              <strong className="text-white">{pc.tx("strong.2", "Punta Cana (PUJ), Las Américas en Santo Domingo (SDQ), Cibao en Santiago (STI), Puerto Plata (POP), Samaná (AZS) y La Romana (LRM).")}</strong>{" "}
              <Link to="/aeropuerto" className="text-amber-300 font-semibold hover:underline">{pc.tx("Link.3", "Ver guía de aeropuertos →")}</Link>
            </p>
          </div>
        </section>

        {/* Aviso de fraude (de la guía del E-Ticket) */}
        <section className="container mx-auto px-4 lg:px-8 max-w-6xl pt-16">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 border-l-4 border-destructive pl-5">
            <h2 className="font-display text-2xl font-bold text-foreground shrink-0 md:w-64">{pc.tx("h2.4", "El E-Ticket nunca se cobra")}</h2>
            <div className="text-muted-foreground leading-relaxed">
              <p className="mb-2">{pc.tx("p.17", "Hay páginas que imitan el formulario oficial y cobran por llenarlo. Desconfía si:")}</p>
              <ul className="list-disc pl-5 space-y-1">
                {fraude.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* Estancia y situaciones especiales */}
        <section id="estancia" className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl scroll-mt-24">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">{pc.tx("Badge.4", "DURANTE TU VIAJE")}</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{pc.tx("TabsTrigger.4", "Estancia y Prórroga")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{pc.tx("p.8", "Cuánto tiempo puedes quedarte, cómo extenderlo y qué cambia según tu situación.")}</p>
          </div>

          {/* Texto editorial con foto, no tarjetas */}
          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-14 items-start mb-16">
            <div className="divide-y divide-border">
              {estancia.map((e, idx) => {
                const Icon = iconosEstancia[idx % iconosEstancia.length];
                return (
                  <article key={e.titulo} className="py-6 first:pt-0 last:pb-0">
                    <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />{e.titulo}</h3>
                    <p className="text-muted-foreground leading-relaxed text-pretty">{e.texto}</p>
                  </article>
                );
              })}
            </div>
            <figure className="relative overflow-hidden rounded-3xl">
              <img
                src={pc.img("img.src.3", samanaImg)}
                alt={pc.t("img.alt.3", "Bahía de Samaná vista desde la costa")}
                loading="lazy"
                className="w-full aspect-[4/5] object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <p className="font-display text-2xl font-bold">{pc.tx("p.10", "30 días")}</p>
                <p className="text-sm text-white/85">{pc.tx("p.11", "de estancia base para la mayoría de turistas. ¿Te quieres quedar más? Pagas la prórroga al salir, sin trámites previos.")}</p>
              </figcaption>
            </figure>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-10">
            <div className="text-center mb-8">
              <Badge className="mb-2 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">{pc.tx("Badge.5", "CASOS PARTICULARES")}</Badge>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">{pc.tx("h3.1", "Situaciones Especiales")}</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {situaciones.map((s) => {
                const Icon = iconosSituacion[s.icono as keyof typeof iconosSituacion] ?? Users;
                return (
                  <div key={s.titulo} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border/60">
                    <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground mb-1">{s.titulo}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.texto}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Aduanas */}
        <section id="aduanas" className="py-16 bg-muted/30 border-y border-border/40 scroll-mt-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">{pc.tx("Badge.6", "AL LLEGAR")}</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{pc.tx("TabsTrigger.3", "Aduanas")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{pc.tx("p.9", "Qué puedes entrar libre de impuestos y qué está prohibido o necesita permiso.")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-card border-emerald-500/40">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5" aria-hidden="true" />{pc.tx("CardTitle.3", "Permitido")}</h3>
                  <ul className="space-y-2.5">
                    {aduanas.permitido.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card border-destructive/40">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-lg text-destructive flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5" aria-hidden="true" />{pc.tx("CardTitle.4", "Prohibido o Restringido")}</h3>
                  <ul className="space-y-2.5">
                    {aduanas.prohibido.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-sm text-primary leading-relaxed">
              <strong>{pc.tx("h4.1", "💡 Declaración de efectivo:")}</strong>{" "}{pc.tx("p.4", "Si viajas con más de $10,000 USD (o equivalente), debes declararlo en el formulario de aduanas. No hacerlo puede resultar en confiscación y multas.")}
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes y fuentes */}
        <section id="preguntas" className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl scroll-mt-24">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">{pc.tx("Badge.7", "DUDAS COMUNES")}</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{pc.tx("h2.1", "Preguntas Frecuentes")}</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Accordion type="single" collapsible className="lg:col-span-2">
              {preguntas.map((p, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left font-semibold">{p.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{p.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Card className="bg-card border-border h-fit">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />{pc.tx("CardTitle.5", "Fuentes Oficiales")}</h3>
                <p className="text-xs text-muted-foreground mb-4">{pc.tx("CardDescription.2", "Las normas migratorias cambian. Confirma siempre antes de viajar.")}</p>
                <div className="space-y-2">
                  {fuentes.map((f) => (
                    <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 p-3 bg-muted/30 rounded-xl border border-border/60 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors">
                      {f.nombre}<ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <GuiaPracticaSection />

        {/* Guías relacionadas del portal */}
        <section className="py-16 bg-muted/30 border-t border-border/40">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">{pc.tx("p.18", "Sigue planificando")}</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">{pc.tx("h2.5", "Guías que complementan este tema")}</h2>
              </div>
              <Link to="/planifica" className="text-sm font-semibold text-primary hover:underline">{pc.tx("Link.4", "Ver todo en Planifica →")}</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {guias.map((g) => (
                <Link key={g.url} to={g.url} className="group relative overflow-hidden rounded-2xl aspect-[4/5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <img src={g.img} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="font-display font-bold text-lg leading-tight text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">{g.titulo}</h3>
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">{g.texto}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Panorama Ad Section */}
        <section className="py-6 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { requisitos, documentos, aduanas, estancia, situaciones, preguntas, fuentes, llegada, fraude, guias };
