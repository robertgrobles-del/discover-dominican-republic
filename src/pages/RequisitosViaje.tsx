import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, AlertCircle, CheckCircle, 
  Clock, CreditCard, Plane, Users, Info, ExternalLink
} from "lucide-react";

const requisitos = [
  {
    pais: "Estados Unidos",
    emoji: "🇺🇸",
    visa: false,
    estancia: "30 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "Canadá",
    emoji: "🇨🇦",
    visa: false,
    estancia: "30 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "España",
    emoji: "🇪🇸",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "Francia",
    emoji: "🇫🇷",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "Alemania",
    emoji: "🇩🇪",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "Reino Unido",
    emoji: "🇬🇧",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "Argentina",
    emoji: "🇦🇷",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "Brasil",
    emoji: "🇧🇷",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "México",
    emoji: "🇲🇽",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
  },
  {
    pais: "Colombia",
    emoji: "🇨🇴",
    visa: false,
    estancia: "60 días",
    tarjeta: "Incluida en boleto aéreo",
    notas: "Pasaporte válido 6+ meses"
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
    "200 cigarrillos o 1 caja de cigarros",
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

export default function RequisitosViaje() {
  const [paisBusqueda, setPaisBusqueda] = useState("");

  const paisesFiltrados = requisitos.filter(r => 
    r.pais.toLowerCase().includes(paisBusqueda.toLowerCase())
  );

  return (
    <PageTransition>
      <SEOHead
        title="Requisitos de Viaje a República Dominicana"
        description="Todo lo que necesitas saber para entrar a RD: visas, documentos, aduanas y formularios requeridos por país."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-red-500/10 to-orange-500/10">
            <div className="container mx-auto px-4 text-center">
              <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Requisitos de Viaje</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Documentación necesaria para visitar República Dominicana
              </p>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              <Tabs defaultValue="requisitos" className="space-y-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="requisitos">Por País</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  <TabsTrigger value="aduanas">Aduanas</TabsTrigger>
                </TabsList>

                <TabsContent value="requisitos" className="space-y-6">
                  {/* Search */}
                  <div className="max-w-md mx-auto">
                    <Label>Busca tu país</Label>
                    <Input 
                      placeholder="Ej: España, Estados Unidos..."
                      value={paisBusqueda}
                      onChange={(e) => setPaisBusqueda(e.target.value)}
                    />
                  </div>

                  {/* Countries Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {paisesFiltrados.map((req) => (
                      <Card key={req.pais}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <span className="text-4xl">{req.emoji}</span>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">{req.pais}</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  {req.visa ? (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  <span>{req.visa ? "Requiere visa" : "No requiere visa"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span>Estancia: {req.estancia}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-primary" />
                                  <span>Tarjeta turista: {req.tarjeta}</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {req.notas}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {paisesFiltrados.length === 0 && (
                    <Card className="text-center p-8">
                      <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No encontramos tu país. Contacta la embajada dominicana más cercana.
                      </p>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="documentos" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Documentos Requeridos</CardTitle>
                      <CardDescription>
                        Lista de documentos necesarios para entrar a RD
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {documentos.map((doc, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                        >
                          {doc.obligatorio ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{doc.nombre}</h4>
                              <Badge variant={doc.obligatorio ? "default" : "secondary"}>
                                {doc.obligatorio ? "Obligatorio" : "Recomendado"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {doc.descripcion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* E-Ticket Section */}
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        E-Ticket (Formulario Digital)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        Desde abril 2021, el E-Ticket reemplaza la tarjeta de turista 
                        física y los formularios de aduanas en papel. Está incluido 
                        en el precio de la mayoría de boletos aéreos.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button asChild>
                          <a href="https://eticket.migracion.gob.do" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Llenar E-Ticket
                          </a>
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="/e-ticket">
                            Ver guía paso a paso
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="aduanas" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-green-500/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          Permitido
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aduanas.permitido.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-red-500/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-5 w-5" />
                          Prohibido / Restringido
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aduanas.prohibido.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Info className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <h4 className="font-semibold mb-2">Sobre la declaración de efectivo</h4>
                          <p className="text-sm text-muted-foreground">
                            Si viajas con más de $10,000 USD (o equivalente), debes 
                            declararlo en el formulario de aduanas. No hacerlo puede 
                            resultar en confiscación y multas.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
