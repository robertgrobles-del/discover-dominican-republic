import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, AlertTriangle, Hospital, Shield, Flame, 
  Car, Anchor, Mountain, Building, Info, MapPin, Clock,
  Navigation, Share2, Copy, CheckCircle2, Wrench, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { EmergencyPdfExport } from "@/components/health/EmergencyPdfExport";
import { usePageContent } from "@/lib/pageContent";
import { useCollectionList, str } from "@/lib/collectionPage";

const numerosEmergenciaLocal = [
  { 
    servicio: "Emergencias General (Policía, Bomberos, Ambulancia)", 
    numero: "911", 
    icon: AlertTriangle,
    descripcion: "Línea nacional unificada para todas las emergencias críticas con despacho inmediato.",
    horario: "24/7",
    isPriority: true
  },
  { 
    servicio: "POLITUR (Dirección Central de Policía de Turismo)", 
    numero: "809-200-3500", 
    altNumero: "809-222-2026",
    icon: ShieldAlert,
    descripcion: "Cuerpo especializado bilingüe para asistencia, orientación y seguridad de turistas.",
    horario: "24/7 Línea Gratuita Nacional",
    isPriority: true
  },
  { 
    servicio: "Asistencia Vial MOPC (Ministerio de Obras Públicas)", 
    numero: "829-688-1000", 
    icon: Wrench,
    descripcion: "Patrullas de auxilio vial gratuito en todas las autopistas del país (grúas, gomeros, mecánicos y combustible).",
    horario: "24/7",
    isPriority: true
  },
  { 
    servicio: "Policía Nacional Dominicana", 
    numero: "809-682-2151", 
    icon: Shield,
    descripcion: "Central general para denuncias, orden público e investigación policial.",
    horario: "24/7"
  },
  { 
    servicio: "Cuerpo de Bomberos del Distrito Nacional", 
    numero: "809-682-2000", 
    icon: Flame,
    descripcion: "Combate de incendios, rescate urbano y emergencias con materiales peligrosos.",
    horario: "24/7"
  },
  { 
    servicio: "Cruz Roja Dominicana", 
    numero: "809-682-4545", 
    icon: Hospital,
    descripcion: "Red nacional de ambulancias, banco de sangre y socorro humanitario.",
    horario: "24/7"
  },
  { 
    servicio: "Defensa Civil Dominicana", 
    numero: "809-472-0909",
    altNumero: "809-472-8604",
    icon: Mountain,
    descripcion: "Gestión de riesgos, alertas meteorológicas, evacuaciones y búsqueda y rescate.",
    horario: "24/7"
  },
  { 
    servicio: "DIGESETT (Tránsito & Viabilidad)", 
    numero: "809-686-6867", 
    icon: Car,
    descripcion: "Dirección de Seguridad de Tránsito y Transporte Terrestre.",
    horario: "24/7"
  },
  { 
    servicio: "Armada de República Dominicana (Guardacostas)", 
    numero: "809-542-3000", 
    icon: Anchor,
    descripcion: "Búsqueda y rescate en alta mar, playas y costas marítimas.",
    horario: "24/7"
  }
];

const embajadas = [
  {
    pais: "Estados Unidos",
    emoji: "🇺🇸",
    telefono: "809-567-7775",
    direccion: "Av. República de Colombia #57, Santo Domingo",
    email: "SantoDomingoUSA@state.gov",
    emergencia: "809-567-7775 ext. 0"
  },
  {
    pais: "España",
    emoji: "🇪🇸",
    telefono: "809-535-6500",
    direccion: "Av. Independencia #1205, Santo Domingo",
    email: "emb.santodomingo@maec.es",
    emergencia: "809-535-6500"
  },
  {
    pais: "Canadá",
    emoji: "🇨🇦",
    telefono: "809-262-3100",
    direccion: "Av. Winston Churchill #1099, Torre Citigroup, Santo Domingo",
    email: "sdmgo@international.gc.ca",
    emergencia: "1-613-996-8885"
  },
  {
    pais: "Alemania",
    emoji: "🇩🇪",
    telefono: "809-542-8949",
    direccion: "Calle Gustavo Mejía Ricart #196, Santo Domingo",
    email: "info@santo-domingo.diplo.de",
    emergencia: "809-542-8949"
  },
  {
    pais: "Francia",
    emoji: "🇫🇷",
    telefono: "809-695-4300",
    direccion: "Calle Las Damas #42, Zona Colonial, Santo Domingo",
    email: "contact@ambafrance-do.org",
    emergencia: "809-695-4300"
  },
  {
    pais: "Reino Unido",
    emoji: "🇬🇧",
    telefono: "809-472-7111",
    direccion: "Av. 27 de Febrero #233, Torre Acrópolis, Santo Domingo",
    email: "ukindr@fco.gov.uk",
    emergencia: "809-472-7111"
  },
  {
    pais: "Colombia",
    emoji: "🇨🇴",
    telefono: "809-562-1670",
    direccion: "Av. Abraham Lincoln #1009, Torre E.O., Santo Domingo",
    email: "esantodomingo@cancilleria.gov.co",
    emergencia: "809-562-1670"
  },
  {
    pais: "México",
    emoji: "🇲🇽",
    telefono: "809-687-6444",
    direccion: "Av. Anacaona #9, Santo Domingo",
    email: "embamex@codetel.net.do",
    emergencia: "809-687-6444"
  }
];

const hospitalesTuristicos = [
  {
    nombre: "Hospiten Bávaro",
    ubicacion: "Punta Cana / Bávaro",
    telefono: "809-686-1414",
    direccion: "Carretera Verón-Punta Cana Km 1",
    especialidades: ["Urgencias 24h", "UCI", "Personal Multilingüe", "Seguros Internacionales"]
  },
  {
    nombre: "Centro Médico Punta Cana (Rescue Group)",
    ubicacion: "Punta Cana",
    telefono: "809-552-1506",
    direccion: "Av. España #1, Bávaro",
    especialidades: ["Urgencias 24h", "Traumatología", "Cámara Hiperbárica (Buceo)", "Pediatría"]
  },
  {
    nombre: "Centro Médico Bournigal (Rescue Group)",
    ubicacion: "Puerto Plata",
    telefono: "809-586-2342",
    direccion: "Calle Antera Mota, Puerto Plata",
    especialidades: ["Urgencias 24h", "Medicina de Viajes", "Cirugía", "UCI"]
  },
  {
    nombre: "Hospital General Plaza de la Salud",
    ubicacion: "Santo Domingo",
    telefono: "809-565-7477",
    direccion: "Av. Ortega y Gasset, Ensanche La Fe",
    especialidades: ["Centro de Trauma Nivel 1", "Cardiología Avanzada", "Neurología"]
  },
  {
    nombre: "Clínica Unión Médica del Norte",
    ubicacion: "Santiago de los Caballeros",
    telefono: "809-226-8686",
    direccion: "Av. Juan Pablo Duarte #176, Santiago",
    especialidades: ["Urgencias 24h", "Cirugía Cardiovascular", "Diagnóstico por Imagen"]
  },
  {
    nombre: "Centro Médico UCE",
    ubicacion: "Santo Domingo",
    telefono: "809-221-0171",
    direccion: "Av. Máximo Gómez #66",
    especialidades: ["Urgencias 24h", "Medicina Interna", "Cuidados Intensivos"]
  }
];

// Antes la página /emergencias; ahora es una sección de /info/seguridad. Conserva su clave de contenido editable.
export function EmergenciasSection() {
  const pc = usePageContent("contactos-emergencia");
  const hospitalesTuristicos = pc.data("hospitalesTuristicos", __pcData.hospitalesTuristicos);
  const embajadas = pc.data("embajadas", __pcData.embajadas);
  // Los números salen de la colección «Contactos de emergencia» del panel; el arreglo local aporta icono, horario y prioridad.
  const emergSlug = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const numerosEmergencia = useCollectionList("emergency-contacts", numerosEmergenciaLocal, (n) => emergSlug(n.servicio), (r, b) => ({
    ...(b ?? { icon: Phone, horario: "", isPriority: false }),
    servicio: str(r.institution, b?.servicio), numero: str(r.phone_number, b?.numero), descripcion: str(r.address, b?.descripcion),
  }));
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [copiedSOS, setCopiedSOS] = useState<boolean>(false);

  const obtainGPSLocation = () => {
    setIsLocating(true);
    setGpsCoordinates(null);
    if (!navigator.geolocation) {
      toast.error("La geolocalización no está soportada por tu navegador.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setGpsCoordinates(coords);
        setIsLocating(false);
        toast.success(`Ubicación SOS obtenida: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
      },
      () => {
        setIsLocating(false);
        toast.error("No se obtuvo tu ubicación. No se adjuntaron coordenadas; si es una emergencia, llama al 911.");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 }
    );
  };

  const copySOSMessage = () => {
    const coordsText = gpsCoordinates 
      ? `🚨 EMERGENCIA SOS: Necesito asistencia inmediata en República Dominicana. Mis coordenadas GPS exactas: https://maps.google.com/?q=${gpsCoordinates.lat},${gpsCoordinates.lng} (${gpsCoordinates.lat.toFixed(5)}, ${gpsCoordinates.lng.toFixed(5)})`
      : `🚨 EMERGENCIA SOS: Necesito asistencia inmediata en República Dominicana. Por favor comunicarse con POLITUR (809-200-3500) o al 911.`;

    navigator.clipboard.writeText(coordsText);
    setCopiedSOS(true);
    toast.success(gpsCoordinates ? "Mensaje con tus coordenadas reales copiado." : "Mensaje sin coordenadas copiado.");
    setTimeout(() => setCopiedSOS(false), 3000);
  };

  return (
    <section id="emergencias" className="scroll-mt-24 border-t border-border">
        
        <div className="pt-12">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 gap-1.5 px-3 py-1">
                <ShieldAlert className="h-4 w-4 text-red-600" />{" "}{pc.tx("Badge.1", "Directorio Oficial de Seguridad & Urgencias (Opción #31)")}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-foreground">{pc.tx("h1.1", "Contactos de Emergencia & SOS Georreferenciado")}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">{pc.tx("p.1", "Acceso directo de un toque a POLITUR 24/7, Asistencia Vial MOPC gratuita en autopistas, red consular y hospitales con cobertura de seguros internacionales.")}</p>
              <div className="mt-5 flex justify-center">
                <EmergencyPdfExport />
              </div>
            </div>
          </section>

          {/* One-Tap SOS Geolocation Tool */}
          <section className="py-6 bg-red-600 text-white shadow-inner">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Navigation className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="h3 font-bold text-lg">{pc.tx("h3.1", "Módulo de Ubicación Georreferenciada SOS")}</h2>
                    <p className="text-xs opacity-90">
                      {gpsCoordinates 
                        ? `Coordenadas: Lat ${gpsCoordinates.lat.toFixed(5)} • Lng ${gpsCoordinates.lng.toFixed(5)}`
                        : "Obtén tus coordenadas satelitales exactas para compartirlas con POLITUR o el 911 en caso de auxilio."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={obtainGPSLocation}
                    disabled={isLocating}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/40 text-xs gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {isLocating ? "Detectando satélite..." : "Obtener Mis Coordenadas GPS"}
                  </Button>

                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={copySOSMessage}
                    className="bg-white text-red-600 hover:bg-white/90 text-xs font-bold gap-1.5 shadow-md"
                  >
                    {copiedSOS ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSOS ? "¡Copiado para Enviar!" : "Copiar Texto de Auxilio SOS"}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Tabs */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-5xl">
              <Tabs defaultValue="emergencias" className="space-y-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="emergencias" className="font-semibold text-xs sm:text-sm">{pc.tx("TabsTrigger.1", "Líneas de Emergencia & Auxilio")}</TabsTrigger>
                  <TabsTrigger value="hospitales" className="font-semibold text-xs sm:text-sm">{pc.tx("TabsTrigger.2", "Hospitales Turísticos 24h")}</TabsTrigger>
                  <TabsTrigger value="embajadas" className="font-semibold text-xs sm:text-sm">{pc.tx("TabsTrigger.3", "Embajadas & Consulados")}</TabsTrigger>
                </TabsList>

                {/* Emergency Lines */}
                <TabsContent value="emergencias" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {numerosEmergencia.map((item, idx) => (
                      <Card 
                        key={idx} 
                        className={`hover:shadow-md transition-all border ${
                          item.isPriority 
                            ? "border-red-500/40 bg-gradient-to-br from-red-500/5 via-card to-background ring-1 ring-red-500/20" 
                            : "border-border bg-card/60"
                        }`}
                      >
                        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              item.isPriority ? "bg-red-500/20 text-red-600" : "bg-muted text-muted-foreground"
                            }`}>
                              <item.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h2 className="h3 font-bold text-sm text-foreground truncate">{item.servicio}</h2>
                                {item.isPriority && (
                                  <Badge className="bg-red-600 text-white text-3xs">{pc.tx("Badge.2", "Prioridad")}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.descripcion}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                            <span className="text-3xs text-muted-foreground font-medium">{pc.tx("span.1", "Horario:")}{" "}{item.horario}</span>
                            
                            <Button 
                              asChild 
                              size="sm" 
                              className={`${item.isPriority ? "bg-red-600 hover:bg-red-700" : "bg-primary"} text-white text-xs gap-1.5 h-8`}
                            >
                              <a href={`tel:${item.numero.replace(/-/g, '')}`}>
                                <Phone className="w-3.5 h-3.5" />{pc.tx("a.1", "Llamar (")}{item.numero})
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Hospital Directory */}
                <TabsContent value="hospitales" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {hospitalesTuristicos.map((hosp, idx) => (
                      <Card key={idx} className="border border-border hover:border-primary/40 transition-all hover:shadow-md bg-card/60">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h2 className="h3 font-bold text-sm text-foreground">{hosp.nombre}</h2>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-primary" /> {hosp.ubicacion} • {hosp.direccion}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-3xs bg-primary/10 text-primary border-primary/30">{pc.tx("Badge.3", "24 Horas")}</Badge>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {hosp.especialidades.map(esp => (
                              <span key={esp} className="text-3xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                {esp}
                              </span>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-border/50 flex justify-end">
                            <Button asChild size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                              <a href={`tel:${hosp.telefono.replace(/-/g, '')}`}>
                                <Phone className="w-3.5 h-3.5 text-primary" />
                                {hosp.telefono}
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Embassies Directory */}
                <TabsContent value="embajadas" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {embajadas.map((emb, idx) => (
                      <Card key={idx} className="border border-border hover:shadow-md transition-shadow bg-card/60">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{emb.emoji}</span>
                            <div>
                              <h2 className="h3 font-bold text-sm text-foreground">{pc.tx("h3.2", "Embajada de")}{" "}{emb.pais}</h2>
                              <p className="text-xs text-muted-foreground">{emb.direccion}</p>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{pc.tx("span.2", "Central Telefónica:")}</span>
                              <a href={`tel:${emb.telefono.replace(/-/g, '')}`} className="font-medium text-primary hover:underline">
                                {emb.telefono}
                              </a>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{pc.tx("span.3", "Línea Urgencias:")}</span>
                              <span className="font-semibold text-red-600">{emb.emergencia}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{pc.tx("span.4", "Correo:")}</span>
                              <span className="text-2xs text-muted-foreground truncate">{emb.email}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </div>

        </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { hospitalesTuristicos, embajadas };
