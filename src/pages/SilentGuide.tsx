import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Volume2, VolumeX, Radio, Users, DollarSign, Award,
  Sparkles, MapPin, ArrowLeft, Heart, CheckCircle2, AlertCircle, Play, Square
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";

export default function SilentGuide() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomParam = searchParams.get("room") || "";

  // States
  const [roomCode, setRoomCode] = useState(roomParam);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isListening, setIsListening] = useState(false);
  const [listenersCount, setListenersCount] = useState(12);

  // Tip Modal States
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("10");
  const [customTip, setCustomTip] = useState("");
  const [tipSuccess, setTipSuccess] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);

  // Mock Guide Data
  const mockGuide = {
    name: "Alexandro Tejeda",
    license: "LIC-MITUR-2026-8891",
    rating: "4.9",
    languages: ["Español", "English", "Français"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    location: "Zona Colonial, Santo Domingo",
    bio: "Guía oficial certificado con más de 12 años de experiencia en historia colonial dominicana y ecoturismo."
  };

  useEffect(() => {
    if (roomParam) {
      setRoomCode(roomParam);
      // Simulate auto-connecting
      setIsConnected(true);
      setIsListening(true);
      // Periodically fluctuate listeners
      const interval = setInterval(() => {
        setListenersCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      }, 8000);
      return () => clearInterval(interval);
    } else {
      setIsConnected(false);
      setIsListening(false);
    }
  }, [roomParam]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast.error("Por favor, ingresa un código de sala válido.");
      return;
    }
    setSearchParams({ room: roomCode.trim().toUpperCase() });
    toast.success(`Conectando a la sala ${roomCode.trim().toUpperCase()}...`);
  };

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      toast.info("Transmisión en pausa.");
    } else {
      setIsListening(true);
      toast.success("Escuchando transmisión en vivo.");
    }
  };

  const handleSendTip = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customTip || tipAmount;
    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      toast.error("Por favor, ingresa un monto válido.");
      return;
    }

    setTipLoading(true);
    setTimeout(() => {
      setTipLoading(false);
      setTipSuccess(true);
      toast.success(`¡Propina de $${finalAmount} USD enviada con éxito a ${mockGuide.name}!`);
    }, 2000);
  };

  const resetTipForm = () => {
    setShowTipModal(false);
    setTipSuccess(false);
    setCustomTip("");
    setTipAmount("10");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Silent Guide - Audio Transmisor Grupal en Vivo"
        description="Escucha a tu guía turístico en tiempo real con la función Silent Guide de Descubre RD. Sin megáfonos, sin interferencias."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-1 pt-24 pb-16 container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                if (isConnected) {
                  setSearchParams({});
                } else {
                  navigate(-1);
                }
              }}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {isConnected ? "Salir de la Sala" : "Volver"}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {!isConnected ? (
              // STEP 1: Enter Room Code Form
              <motion.div
                key="enter-room"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-md mx-auto"
              >
                <Card className="border-border shadow-lg backdrop-blur-md bg-card/80">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Radio className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl font-bold font-display">Silent Guide B2B</CardTitle>
                    <CardDescription>
                      Ingresa el código que te ha proporcionado tu guía turístico para escuchar su audio en vivo directamente en tus auriculares.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleJoin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="room-code" className="text-sm font-semibold">Código de la Sala</Label>
                        <Input
                          id="room-code"
                          placeholder="Ej: COLONIAL-2026"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          className="text-center text-lg font-bold tracking-widest uppercase h-12"
                          required
                          autoFocus
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white gap-2">
                        <Play className="h-4 w-4 fill-white" />
                        Conectarse y Escuchar
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Benefits / Info */}
                <div className="grid grid-cols-3 gap-4 mt-8 text-center text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <div className="text-base">🎧</div>
                    <div className="font-bold text-foreground">Tus Auriculares</div>
                    <div>Usa tus audífonos favoritos para escuchar sin ruidos.</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-base">🔕</div>
                    <div className="font-bold text-foreground">Cero Megáfonos</div>
                    <div>Protege el silencio histórico y natural de los destinos.</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-base">🔋</div>
                    <div className="font-bold text-foreground">Bajo Consumo</div>
                    <div>Tecnología optimizada para gastar el mínimo de batería.</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // STEP 2: Live Listener Dashboard
              <motion.div
                key="live-listener"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid md:grid-cols-5 gap-6"
              >
                {/* Connection Status & Guide Audio Panel */}
                <Card className="md:col-span-3 border-border shadow-lg bg-card overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 p-6 border-b border-border relative">
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isListening ? "bg-red-400 opacity-75" : "bg-amber-400 opacity-75"}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isListening ? "bg-red-500" : "bg-amber-500"}`}></span>
                      </span>
                      <Badge variant="outline" className={`${isListening ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-amber-500/30 text-amber-500 bg-amber-500/5"} font-bold text-xs uppercase tracking-wider`}>
                        {isListening ? "En Vivo" : "En Pausa"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Radio className="h-3.5 w-3.5" />
                        Silent Guide Broadcast
                      </div>
                      <h2 className="text-2xl font-bold font-display text-foreground">Sala: {roomParam.toUpperCase()}</h2>
                    </div>
                  </div>

                  <CardContent className="p-8 flex flex-col items-center justify-center space-y-8">
                    {/* Animated Audio Waveform */}
                    <div className="h-32 flex items-center justify-center gap-1.5 w-full max-w-xs">
                      {isListening ? (
                        [...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 bg-gradient-to-t from-primary to-indigo-500 rounded-full"
                            animate={{
                              height: [15, 80 - (i % 3) * 15, 30 + (i % 2) * 20, 15]
                            }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.08
                            }}
                          />
                        ))
                      ) : (
                        [...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2.5 h-3 bg-muted rounded-full"
                          />
                        ))
                      )}
                    </div>

                    {/* Listen Status Message */}
                    <div className="text-center space-y-1.5">
                      <p className="text-lg font-semibold text-foreground">
                        {isListening ? "Escuchando transmisión de audio..." : "Audio silenciado temporalmente"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {listenersCount} turistas conectados en este grupo
                      </p>
                    </div>

                    {/* Audio Controls */}
                    <div className="w-full max-w-sm space-y-6 pt-4 border-t border-border">
                      {/* Play/Pause Button */}
                      <div className="flex justify-center">
                        <Button
                          size="lg"
                          onClick={handleToggleListening}
                          className={`h-16 w-16 rounded-full flex items-center justify-center shadow-md ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/95"} text-white`}
                        >
                          {isListening ? (
                            <Square className="h-6 w-6 fill-white" />
                          ) : (
                            <Play className="h-6 w-6 fill-white ml-1" />
                          )}
                        </Button>
                      </div>

                      {/* Volume Slider & Mute Toggle */}
                      <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-2xl border border-border">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsMuted(!isMuted)}
                          className="h-10 w-10 text-foreground"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-5 w-5 text-red-500" />
                          ) : (
                            <Volume2 className="h-5 w-5 text-primary" />
                          )}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            setVolume(parseInt(e.target.value));
                            if (isMuted) setIsMuted(false);
                          }}
                          className="flex-1 accent-primary h-1.5 rounded-lg bg-muted cursor-pointer"
                          aria-label="Volumen de audio"
                        />
                        <span className="text-xs font-mono font-bold text-muted-foreground w-8 text-right">
                          {isMuted ? "0" : volume}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Guide Credentials & Tipping Panel */}
                <div className="md:col-span-2 space-y-6">
                  {/* Guide Card */}
                  <Card className="border-border shadow-md bg-card">
                    <CardHeader className="p-5 flex flex-row items-center gap-4 border-b border-border">
                      <img
                        src={mockGuide.avatar}
                        alt={mockGuide.name}
                        className="w-14 h-14 rounded-full object-cover border border-primary/20 shadow"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-foreground text-base leading-none">{mockGuide.name}</h3>
                          <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-red-500" />
                          {mockGuide.location}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {/* Certified Badge */}
                      <div className="bg-primary/5 border border-primary/10 p-2.5 rounded-xl flex items-center gap-2.5">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-[10px] uppercase font-bold text-primary tracking-widest">Guía Certificado MITUR</div>
                          <div className="text-xs font-mono font-bold text-foreground">{mockGuide.license}</div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {mockGuide.bio}
                      </p>

                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">Idiomas</span>
                        <div className="flex flex-wrap gap-1.5">
                          {mockGuide.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs px-2.5 py-0.5 border-border text-foreground bg-muted/30">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Digital Tip Button */}
                      <Button
                        className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2"
                        onClick={() => setShowTipModal(true)}
                      >
                        <Heart className="h-4 w-4 fill-white" />
                        Enviar Propina al Guía
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Connection Details Helper */}
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs text-muted-foreground space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      ¿Problemas de Audio?
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Asegúrate de que tus auriculares estén conectados.</li>
                      <li>Verifica que el volumen de tu teléfono esté alto.</li>
                      <li>Si el audio se detiene, intenta refrescar la pestaña.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />

        {/* TIP MODAL */}
        <AnimatePresence>
          {showTipModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 fill-white animate-pulse" />
                    Propina Digital
                  </h3>
                  <p className="text-xs text-white/80 mt-1">Apoya el trabajo de tu guía turístico certificado.</p>
                </div>

                <div className="p-6">
                  {!tipSuccess ? (
                    <form onSubmit={handleSendTip} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Selecciona el monto (USD)</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {["5", "10", "15", "20"].map((val) => (
                            <Button
                              key={val}
                              type="button"
                              variant={tipAmount === val && !customTip ? "default" : "outline"}
                              className={`h-11 font-bold text-base ${tipAmount === val && !customTip ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                              onClick={() => {
                                setTipAmount(val);
                                setCustomTip("");
                              }}
                            >
                              ${val}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-tip" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Monto Personalizado</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="custom-tip"
                            type="number"
                            placeholder="Otro monto"
                            value={customTip}
                            onChange={(e) => {
                              setCustomTip(e.target.value);
                              setTipAmount("");
                            }}
                            className="pl-9 h-11 text-base"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={resetTipForm}
                          className="w-1/2 text-muted-foreground"
                          disabled={tipLoading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="w-1/2 bg-amber-500 hover:bg-amber-600 text-white font-bold"
                          disabled={tipLoading}
                        >
                          {tipLoading ? "Procesando..." : "Confirmar Pago"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">¡Muchas Gracias!</h4>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                          Tu pago de ${customTip || tipAmount} USD ha sido procesado de forma segura y se enviará de inmediato a la cuenta de {mockGuide.name}.
                        </p>
                      </div>
                      <Button onClick={resetTipForm} className="mt-4">
                        Cerrar
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
