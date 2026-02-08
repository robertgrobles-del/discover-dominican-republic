import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, AlertTriangle, Hospital, Shield, Flame, 
  Car, Anchor, Mountain, Building, Info, MapPin, Clock
} from "lucide-react";

const numerosEmergencia = [
  { 
    servicio: "Emergencias General (Policía, Bomberos, Ambulancia)", 
    numero: "911", 
    icon: AlertTriangle,
    descripcion: "Línea única para todas las emergencias",
    horario: "24/7"
  },
  { 
    servicio: "Policía Nacional", 
    numero: "809-682-2151", 
    icon: Shield,
    descripcion: "Para reportar delitos y solicitar asistencia policial",
    horario: "24/7"
  },
  { 
    servicio: "POLITUR (Policía Turística)", 
    numero: "809-200-3500", 
    icon: Shield,
    descripcion: "Especializada en atención al turista",
    horario: "24/7"
  },
  { 
    servicio: "Bomberos", 
    numero: "809-682-2000", 
    icon: Flame,
    descripcion: "Incendios y rescate",
    horario: "24/7"
  },
  { 
    servicio: "Cruz Roja", 
    numero: "809-682-4545", 
    icon: Hospital,
    descripcion: "Ambulancias y primeros auxilios",
    horario: "24/7"
  },
  { 
    servicio: "Defensa Civil", 
    numero: "809-472-0909", 
    icon: Mountain,
    descripcion: "Desastres naturales y evacuaciones",
    horario: "24/7"
  },
  { 
    servicio: "AMET (Tránsito)", 
    numero: "809-686-6867", 
    icon: Car,
    descripcion: "Accidentes de tránsito",
    horario: "24/7"
  },
  { 
    servicio: "Armada (Emergencias Marítimas)", 
    numero: "809-542-3000", 
    icon: Anchor,
    descripcion: "Rescate marítimo",
    horario: "24/7"
  },
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
];

const hospitalesTuristicos = [
  {
    nombre: "Hospiten Bávaro",
    ubicacion: "Punta Cana",
    telefono: "809-686-1414",
    especialidades: ["Urgencias 24h", "UCI", "Quirófano"]
  },
  {
    nombre: "Centro Médico Punta Cana",
    ubicacion: "Punta Cana",
    telefono: "809-552-1506",
    especialidades: ["Urgencias 24h", "Medicina General", "Pediatría"]
  },
  {
    nombre: "Hospital General de la Plaza de la Salud",
    ubicacion: "Santo Domingo",
    telefono: "809-565-7477",
    especialidades: ["Trauma", "Cardiología", "Neurología"]
  },
  {
    nombre: "Clínica Unión Médica",
    ubicacion: "Santiago",
    telefono: "809-226-8686",
    especialidades: ["Urgencias 24h", "Cirugía", "Diagnóstico"]
  },
  {
    nombre: "Centro de Medicina Avanzada Dr. Abel González",
    ubicacion: "Santo Domingo",
    telefono: "809-227-2226",
    especialidades: ["Cardiología", "Oncología", "Trasplantes"]
  },
];

export default function ContactosEmergencia() {
  return (
    <PageTransition>
      <SEOHead
        title="Contactos de Emergencia en República Dominicana"
        description="Números de emergencia, embajadas y hospitales en RD. Todo lo que necesitas en caso de urgencia."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-red-500/10 to-rose-500/10">
            <div className="container mx-auto px-4 text-center">
              <Phone className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactos de Emergencia</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Números importantes para tu seguridad en RD
              </p>
            </div>
          </section>

          {/* Emergency Banner */}
          <section className="bg-red-500 text-white py-6">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-4">
                <Phone className="h-8 w-8 animate-pulse" />
                <div>
                  <p className="text-2xl font-bold">911</p>
                  <p className="text-sm opacity-90">Emergencias • 24/7 • Gratis desde cualquier teléfono</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              <Tabs defaultValue="emergencias" className="space-y-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="emergencias">Emergencias</TabsTrigger>
                  <TabsTrigger value="embajadas">Embajadas</TabsTrigger>
                  <TabsTrigger value="hospitales">Hospitales</TabsTrigger>
                </TabsList>

                <TabsContent value="emergencias" className="space-y-4">
                  {numerosEmergencia.map((item, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                            <item.icon className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.servicio}</h3>
                            <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                          </div>
                          <div className="text-right">
                            <a 
                              href={`tel:${item.numero.replace(/-/g, '')}`}
                              className="text-2xl font-bold text-primary hover:underline"
                            >
                              {item.numero}
                            </a>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                              <Clock className="h-3 w-3" />
                              {item.horario}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="embajadas" className="space-y-4">
                  <Card className="bg-blue-500/5 border-blue-500/20 mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Si pierdes tu pasaporte o tienes una emergencia grave, 
                          contacta la embajada de tu país inmediatamente. Pueden 
                          ayudarte con documentos de emergencia y asistencia consular.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    {embajadas.map((emb, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-3xl">{emb.emoji}</span>
                            <div>
                              <h3 className="font-bold">Embajada de {emb.pais}</h3>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-primary" />
                              <a href={`tel:${emb.telefono}`} className="hover:underline">
                                {emb.telefono}
                              </a>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-primary mt-0.5" />
                              <span className="text-muted-foreground">{emb.direccion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-xs">
                                Emergencia: {emb.emergencia}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="hospitales" className="space-y-4">
                  <Card className="bg-green-500/5 border-green-500/20 mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Hospital className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Estos hospitales atienden regularmente a turistas y tienen 
                          personal que habla inglés. Recuerda llevar tu seguro de viaje 
                          y pasaporte para la admisión.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {hospitalesTuristicos.map((hosp, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{hosp.nombre}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {hosp.ubicacion}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {hosp.especialidades.map((esp) => (
                                <Badge key={esp} variant="secondary" className="text-xs">
                                  {esp}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <a 
                              href={`tel:${hosp.telefono.replace(/-/g, '')}`}
                              className="text-lg font-bold text-primary hover:underline"
                            >
                              {hosp.telefono}
                            </a>
                            <Button size="sm" className="mt-2 w-full">
                              <Phone className="h-3 w-3 mr-1" />
                              Llamar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Safety Tips */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Consejos de Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">📱 Guarda estos números</h4>
                    <p className="text-sm text-muted-foreground">
                      Agrega el 911 y la embajada de tu país a tus contactos antes de viajar.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">📋 Copia de documentos</h4>
                    <p className="text-sm text-muted-foreground">
                      Lleva copias físicas y digitales de pasaporte y seguro de viaje.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">🏨 Informa al hotel</h4>
                    <p className="text-sm text-muted-foreground">
                      En caso de emergencia, el personal del hotel puede ayudar con traducciones y logística.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">💳 Seguro de viaje</h4>
                    <p className="text-sm text-muted-foreground">
                      Altamente recomendado. Cubre emergencias médicas, repatriación y pérdida de equipaje.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
