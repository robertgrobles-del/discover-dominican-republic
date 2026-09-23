import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, MapPin, Check, Send, MessageSquare, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Traveler {
  name: string;
  avatar: string;
}

interface GrupoExcursion {
  id: string;
  title: string;
  destination: string;
  date: string;
  price: number;
  maxSlots: number;
  joinedCount: number;
  members: Traveler[];
  chatHistory: { user: string; text: string; time: string }[];
}

const mockGrupos: GrupoExcursion[] = [
  {
    id: "g1",
    title: "Tour de Aventura a Bahía de las Águilas",
    destination: "Pedernales",
    date: "Mañana, 07:00",
    price: 3200,
    maxSlots: 8,
    joinedCount: 5,
    members: [
      { name: "Carlos M.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
      { name: "Sofía P.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
      { name: "Alex R.", avatar: "" },
      { name: "María F.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
      { name: "Daniel O.", avatar: "" }
    ],
    chatHistory: [
      { user: "Carlos M.", text: "¡Hola! ¿Llevamos protector solar biodegradable?", time: "10:30 AM" },
      { user: "Sofía P.", text: "Sí, es obligatorio para cuidar los corales de la Bahía.", time: "10:45 AM" }
    ]
  },
  {
    id: "g2",
    title: "Catamarán & Snorkel en Isla Catalina",
    destination: "La Romana",
    date: "Sábado 20, 09:00",
    price: 4500,
    maxSlots: 12,
    joinedCount: 8,
    members: [
      { name: "Elena H.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
      { name: "Lucas G.", avatar: "" },
      { name: "Juan P.", avatar: "" }
    ],
    chatHistory: [
      { user: "Elena H.", text: "¿Hay barra libre en el barco?", time: "09:15 AM" },
      { user: "Lucas G.", text: "¡Sí, ron dominicano y jugos incluidos!", time: "09:20 AM" }
    ]
  }
];

export default function EventosGrupo() {
  const { user } = useAuth();
  const [grupos, setGrupos] = useState<GrupoExcursion[]>(mockGrupos);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GrupoExcursion | null>(null);
  const [chatInput, setChatInput] = useState("");

  const handleJoin = (id: string) => {
    if (joinedGroups.includes(id)) {
      toast.warning("Ya estás unido a este grupo de excursión.");
      return;
    }
    const myName = user?.email?.split("@")[0] || "yo";
    setGrupos(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          joinedCount: g.joinedCount + 1,
          members: [...g.members, { name: myName, avatar: "" }]
        };
      }
      return g;
    }));
    setJoinedGroups([...joinedGroups, id]);
    toast.success("¡Te has unido al grupo de viaje con éxito! El chat grupal está desbloqueado.");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedGroup) return;
    const myName = user?.email?.split("@")[0] || "yo";
    
    setGrupos(prev => prev.map(g => {
      if (g.id === selectedGroup.id) {
        const newMsg = { user: myName, text: chatInput, time: "Ahora" };
        const updatedGroup = {
          ...g,
          chatHistory: [...g.chatHistory, newMsg]
        };
        // Update selectedGroup reference as well
        setSelectedGroup(updatedGroup);
        return updatedGroup;
      }
      return g;
    }));
    setChatInput("");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Eventos en Grupo y Excursiones Compartidas - Descubre RD"
        description="Únete a grupos de viaje compartidos en República Dominicana. Comparte gastos de excursiones, haz amigos y chatea en tiempo real."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-border pb-6">
              <div>
                <Badge className="mb-3 bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1.5 py-1 px-3">
                  <Users className="h-4 w-4" /> Viajes Colaborativos
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                  Eventos en Grupo
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl">
                  ¿Viajas solo? Únete a otros aventureros para compartir los costos de transporte y guías. Haz amigos recorriendo la isla.
                </p>
              </div>
            </div>

            {/* Content grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Groups listing */}
              <div className="lg:col-span-2 space-y-6">
                {grupos.map((grupo) => {
                  const isUserJoined = joinedGroups.includes(grupo.id);
                  const slotsLeft = grupo.maxSlots - grupo.joinedCount;

                  return (
                    <Card key={grupo.id} className="overflow-hidden border border-border bg-card/65 hover:border-primary/20 transition-all flex flex-col justify-between h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                {grupo.destination}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {grupo.date}
                              </span>
                            </div>
                            <h3 className="font-display font-bold text-base md:text-lg text-foreground mb-3 leading-snug">
                              {grupo.title}
                            </h3>
                            
                            {/* Member Avatars */}
                            <div className="flex items-center gap-3 mt-4">
                              <div className="flex -space-x-2">
                                {grupo.members.slice(0, 4).map((member, i) => (
                                  <Avatar key={i} className="border-2 border-background w-8 h-8">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {grupo.members.length > 4 && (
                                  <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary text-foreground text-[9px] font-bold flex items-center justify-center">
                                    +{grupo.members.length - 4}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{grupo.joinedCount} de {grupo.maxSlots} viajeros confirmados</span>
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
                            <div>
                              <p className="text-[10px] text-muted-foreground">Compartir coste</p>
                              <p className="font-display font-bold text-foreground">RD$ {grupo.price.toLocaleString()}</p>
                            </div>
                            
                            <div className="mt-4 flex gap-2 w-full sm:w-auto">
                              <Button
                                onClick={() => handleJoin(grupo.id)}
                                size="sm"
                                variant={isUserJoined ? "secondary" : "default"}
                                className={`text-xs gap-1 ${isUserJoined ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}`}
                              >
                                {isUserJoined ? (
                                  <><Check className="h-3.5 w-3.5" /> Unido</>
                                ) : (
                                  <>Unirse al Grupo</>
                                )}
                              </Button>
                              
                              {isUserJoined && (
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedGroup(grupo)}
                                  variant="outline"
                                  className="text-xs gap-1 border-primary text-primary"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" /> Chat
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Slot limits warning */}
                        {slotsLeft <= 2 && slotsLeft > 0 && (
                          <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 text-[10px] text-amber-500">
                            <ShieldAlert className="h-4 w-4" />
                            <span>¡Sólo quedan {slotsLeft} vacantes disponibles! Apúrate a unirte.</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Chat Sidebar Drawer */}
              <div>
                <AnimatePresence mode="wait">
                  {selectedGroup ? (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Card className="border border-border bg-card sticky top-24 h-[450px] flex flex-col justify-between">
                        <CardHeader className="p-4 border-b border-border/40 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-bold truncate max-w-[180px]">{selectedGroup.title}</CardTitle>
                            <CardDescription className="text-[10px]">Chat Grupal de Excursión</CardDescription>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedGroup(null)}>Cerrar</Button>
                        </CardHeader>

                        {/* Chat history */}
                        <div className="p-4 flex-grow overflow-y-auto space-y-3">
                          {selectedGroup.chatHistory.map((chat, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[9px]">{chat.user.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="bg-secondary/45 border border-border/40 rounded-xl p-2 max-w-[200px]">
                                <div className="flex justify-between items-center gap-2 mb-0.5">
                                  <span className="font-bold text-[9px] text-foreground">@{chat.user}</span>
                                  <span className="text-[8px] text-muted-foreground">{chat.time}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-normal">{chat.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Input message form */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-border/40 flex gap-2">
                          <Input
                            placeholder="Escribe un mensaje..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="bg-secondary/35 border-border text-xs flex-grow"
                          />
                          <Button size="sm" type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </Card>
                    </motion.div>
                  ) : (
                    <Card key="no-chat" className="border border-border bg-card/65 sticky top-24 p-6 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="font-bold text-xs">Chat Grupal Desbloqueado</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Únete a una excursión para coordinar transporte y detalles en tiempo real con los demás viajeros confirmados.</p>
                    </Card>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
