import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, MapPin, Plus, Send, Check, Clock, DollarSign, Plane, Hotel, Utensils } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import { usePageContent } from "@/lib/pageContent";

const mockMembers = [
  { id: "1", name: "María G.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", status: "confirmed" },
  { id: "2", name: "Carlos M.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", status: "pending" },
  { id: "3", name: "Ana R.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", status: "confirmed" },
  { id: "4", name: "Pedro S.", avatar: "", status: "pending" },
];

const mockMessages = [
  { id: "1", user: "María G.", message: "¡Qué emoción! Ya tengo mis vuelos reservados 🎉", time: "2:30 PM" },
  { id: "2", user: "Carlos M.", message: "¿Qué hotel les parece mejor para el presupuesto?", time: "2:45 PM" },
  { id: "3", user: "Ana R.", message: "Vi uno en Bavaro que tiene todo incluido", time: "3:00 PM" },
];

const suggestedActivities = [
  { name: "Excursión a Isla Saona", price: 85, duration: "8 horas", votes: 3 },
  { name: "Snorkeling en Bayahíbe", price: 45, duration: "3 horas", votes: 2 },
  { name: "Tour Zona Colonial", price: 35, duration: "4 horas", votes: 4 },
  { name: "Cena en La Terraza", price: 60, duration: "2 horas", votes: 2 },
];

export default function PlanificadorGrupal() {
  const pc = usePageContent("planificador-grupal");
  const suggestedActivities = pc.data("suggestedActivities", __pcData.suggestedActivities);
  const mockMessages = pc.data("mockMessages", __pcData.mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("itinerario");

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Planificador de Viaje Grupal | Turismo RD")}
        description={pc.t("SEOHead.description.1", "Organiza tu viaje grupal a República Dominicana con herramientas colaborativas.")}
        keywords="viaje grupal, planificador, grupo, República Dominicana, itinerario"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Badge className="mb-2 bg-orange-500/20 text-orange-500">{pc.tx("Badge.1", "Planificación Grupal")}</Badge>
                <h1 className="font-display text-3xl font-bold">{pc.tx("h1.1", "Viaje a Punta Cana 2024")}</h1>
                <p className="text-muted-foreground">{pc.tx("p.1", "15-22 de Marzo • 4 viajeros")}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {mockMembers.map((member) => (
                    <Avatar key={member.id} className="border-2 border-background">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />{pc.tx("Button.1", "Invitar")}</Button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="itinerario">{pc.tx("TabsTrigger.1", "Itinerario")}</TabsTrigger>
                  <TabsTrigger value="actividades">{pc.tx("TabsTrigger.2", "Actividades")}</TabsTrigger>
                  <TabsTrigger value="presupuesto">{pc.tx("TabsTrigger.3", "Presupuesto")}</TabsTrigger>
                  <TabsTrigger value="vuelos">{pc.tx("TabsTrigger.4", "Vuelos")}</TabsTrigger>
                </TabsList>

                <TabsContent value="itinerario" className="space-y-4">
                  {/* Day Cards */}
                  {[1, 2, 3].map((day) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: day * 0.1 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle as="h2" className="text-lg">{pc.tx("CardTitle.1", "Día")}{" "}{day} - {day === 1 ? "Llegada" : day === 2 ? "Playa & Relax" : "Excursión"}</CardTitle>
                            <Badge variant="outline">{15 + day - 1}{" "}{pc.tx("Badge.2", "de Marzo")}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {day === 1 && (
                              <>
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                  <Plane className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">{pc.tx("p.2", "Llegada a Punta Cana")}</p>
                                    <p className="text-sm text-muted-foreground">{pc.tx("p.3", "14:30 - Aeropuerto PUJ")}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                  <Hotel className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">{pc.tx("p.4", "Check-in Hotel Bavaro")}</p>
                                    <p className="text-sm text-muted-foreground">16:00</p>
                                  </div>
                                </div>
                              </>
                            )}
                            {day === 2 && (
                              <>
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                  <Clock className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">{pc.tx("p.5", "Día libre en la playa")}</p>
                                    <p className="text-sm text-muted-foreground">{pc.tx("p.6", "Todo el día")}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                  <Utensils className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">{pc.tx("p.7", "Cena en restaurante local")}</p>
                                    <p className="text-sm text-muted-foreground">19:30</p>
                                  </div>
                                </div>
                              </>
                            )}
                            {day === 3 && (
                              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <MapPin className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium">{pc.tx("p.8", "Excursión Isla Saona")}</p>
                                  <p className="text-sm text-muted-foreground">08:00 - 17:00</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="mt-3 gap-2">
                            <Plus className="h-4 w-4" />{pc.tx("Button.2", "Agregar actividad")}</Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="actividades">
                  <Card>
                    <CardHeader>
                      <CardTitle>{pc.tx("CardTitle.2", "Actividades Sugeridas")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {suggestedActivities.map((activity) => (
                          <div key={activity.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                              <h2 className="h4 font-medium">{activity.name}</h2>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ${activity.price}{pc.tx("span.1", "/persona")}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {activity.duration}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{activity.votes}{" "}{pc.tx("span.2", "votos")}</span>
                              </div>
                              <Button size="sm" variant="outline">{pc.tx("Button.3", "Votar")}</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="presupuesto">
                  <Card>
                    <CardHeader>
                      <CardTitle>{pc.tx("CardTitle.3", "Resumen de Presupuesto")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
                          <span>{pc.tx("span.3", "Vuelos (4 personas)")}</span>
                          <span className="font-bold">$2,400</span>
                        </div>
                        <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
                          <span>{pc.tx("span.4", "Hotel (7 noches)")}</span>
                          <span className="font-bold">$1,890</span>
                        </div>
                        <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
                          <span>{pc.tx("span.5", "Actividades")}</span>
                          <span className="font-bold">$680</span>
                        </div>
                        <div className="flex justify-between p-4 bg-primary/10 rounded-lg border border-primary">
                          <span className="font-bold">{pc.tx("span.6", "Total estimado")}</span>
                          <span className="font-bold text-primary">$4,970</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">{pc.tx("p.9", "~$1,243 por persona")}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vuelos">
                  <Card>
                    <CardHeader>
                      <CardTitle>{pc.tx("CardTitle.4", "Vuelos del Grupo")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockMembers.slice(0, 2).map((member) => (
                          <div key={member.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{pc.tx("p.10", "AA 1234 • 15 Mar 10:30")}</p>
                            </div>
                            <Badge variant={member.status === "confirmed" ? "default" : "secondary"}>
                              {member.status === "confirmed" ? "Confirmado" : "Pendiente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Chat */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />{pc.tx("CardTitle.5", "Chat del Grupo")}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {mockMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{msg.user}</span>
                            <span className="text-xs text-muted-foreground">{msg.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder={pc.t("Input.placeholder.1", "Escribe un mensaje...")}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { suggestedActivities, mockMessages };
