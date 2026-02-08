import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Wand2, Calendar as CalendarIcon, MapPin, Users, 
  Sparkles, Loader2, Clock, Download, Share2, Heart
} from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const intereses = [
  { id: "playa", label: "Playas", emoji: "🏖️" },
  { id: "aventura", label: "Aventura", emoji: "🧗" },
  { id: "cultura", label: "Cultura", emoji: "🏛️" },
  { id: "gastronomia", label: "Gastronomía", emoji: "🍽️" },
  { id: "naturaleza", label: "Naturaleza", emoji: "🌿" },
  { id: "nightlife", label: "Vida Nocturna", emoji: "🌙" },
  { id: "wellness", label: "Wellness", emoji: "🧘" },
  { id: "golf", label: "Golf", emoji: "⛳" },
];

const presupuestos = [
  { id: "economico", label: "Económico", desc: "< $100/día" },
  { id: "moderado", label: "Moderado", desc: "$100-250/día" },
  { id: "premium", label: "Premium", desc: "$250-500/día" },
  { id: "lujo", label: "Lujo", desc: "> $500/día" },
];

export default function ItinerarioIA() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    destino: "",
    fechaInicio: new Date(),
    fechaFin: addDays(new Date(), 7),
    viajeros: 2,
    intereses: [] as string[],
    presupuesto: "moderado",
    notas: ""
  });

  const toggleInteres = (id: string) => {
    setFormData(prev => ({
      ...prev,
      intereses: prev.intereses.includes(id)
        ? prev.intereses.filter(i => i !== id)
        : [...prev.intereses, id]
    }));
  };

  const generateItinerary = async () => {
    setIsGenerating(true);
    // Simular generación de IA
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setItinerary({
      titulo: "Tu Aventura en República Dominicana",
      dias: [
        {
          dia: 1,
          titulo: "Llegada y exploración inicial",
          actividades: [
            { hora: "14:00", actividad: "Check-in en hotel", lugar: "Punta Cana", tipo: "alojamiento" },
            { hora: "16:00", actividad: "Relax en la playa", lugar: "Playa Bávaro", tipo: "playa" },
            { hora: "19:00", actividad: "Cena de bienvenida", lugar: "Restaurante local", tipo: "gastronomia" },
          ]
        },
        {
          dia: 2,
          titulo: "Aventura acuática",
          actividades: [
            { hora: "08:00", actividad: "Desayuno buffet", lugar: "Hotel", tipo: "gastronomia" },
            { hora: "10:00", actividad: "Snorkeling en arrecife", lugar: "Isla Saona", tipo: "aventura" },
            { hora: "13:00", actividad: "Almuerzo en la playa", lugar: "Isla Saona", tipo: "gastronomia" },
            { hora: "18:00", actividad: "Regreso y atardecer", lugar: "Marina", tipo: "naturaleza" },
          ]
        },
        {
          dia: 3,
          titulo: "Cultura y tradición",
          actividades: [
            { hora: "09:00", actividad: "Tour Zona Colonial", lugar: "Santo Domingo", tipo: "cultura" },
            { hora: "12:00", actividad: "Museo de las Casas Reales", lugar: "Zona Colonial", tipo: "cultura" },
            { hora: "14:00", actividad: "Almuerzo típico", lugar: "El Mesón de Bari", tipo: "gastronomia" },
            { hora: "17:00", actividad: "Compras artesanía", lugar: "Mercado Modelo", tipo: "compras" },
          ]
        },
      ],
      resumen: {
        costoEstimado: "$1,850",
        distanciaTotal: "245 km",
        actividadesIncluidas: 12,
      }
    });
    setIsGenerating(false);
    setStep(3);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Generador de Itinerarios con IA - República Dominicana"
        description="Crea tu itinerario perfecto para República Dominicana con inteligencia artificial. Personalizado según tus intereses y presupuesto."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Potenciado por IA</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Crea tu Itinerario Perfecto
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Nuestra IA diseña el viaje ideal para ti en segundos
              </p>
            </div>
          </section>

          {/* Progress Steps */}
          <section className="py-8 border-b">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                      step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {s}
                    </div>
                    <span className={cn(
                      "text-sm hidden sm:inline",
                      step >= s ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {s === 1 ? "Preferencias" : s === 2 ? "Generar" : "Tu Itinerario"}
                    </span>
                    {s < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <BetweenSectionsAd showDemo />

          {/* Step 1: Preferences */}
          {step === 1 && (
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-4xl">
                <Card>
                  <CardHeader>
                    <CardTitle>Cuéntanos sobre tu viaje ideal</CardTitle>
                    <CardDescription>Personaliza tu experiencia en República Dominicana</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Destination */}
                    <div className="space-y-2">
                      <Label>¿A dónde quieres ir?</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Ej: Punta Cana, Samaná, Santo Domingo..."
                          className="pl-10"
                          value={formData.destino}
                          onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha de inicio</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(formData.fechaInicio, "PPP", { locale: es })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.fechaInicio}
                              onSelect={(date) => date && setFormData(prev => ({ ...prev, fechaInicio: date }))}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha de fin</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(formData.fechaFin, "PPP", { locale: es })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.fechaFin}
                              onSelect={(date) => date && setFormData(prev => ({ ...prev, fechaFin: date }))}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Travelers */}
                    <div className="space-y-2">
                      <Label>Número de viajeros</Label>
                      <div className="flex items-center gap-4">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          min={1} 
                          max={20}
                          value={formData.viajeros}
                          onChange={(e) => setFormData(prev => ({ ...prev, viajeros: parseInt(e.target.value) }))}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">personas</span>
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="space-y-4">
                      <Label>¿Qué te interesa?</Label>
                      <div className="flex flex-wrap gap-2">
                        {intereses.map((interes) => (
                          <Badge
                            key={interes.id}
                            variant={formData.intereses.includes(interes.id) ? "default" : "outline"}
                            className="cursor-pointer text-sm py-2 px-4"
                            onClick={() => toggleInteres(interes.id)}
                          >
                            {interes.emoji} {interes.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-4">
                      <Label>Presupuesto</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {presupuestos.map((p) => (
                          <Card
                            key={p.id}
                            className={cn(
                              "cursor-pointer transition-all",
                              formData.presupuesto === p.id 
                                ? "border-primary bg-primary/5" 
                                : "hover:border-muted-foreground/50"
                            )}
                            onClick={() => setFormData(prev => ({ ...prev, presupuesto: p.id }))}
                          >
                            <CardContent className="p-4 text-center">
                              <p className="font-medium">{p.label}</p>
                              <p className="text-xs text-muted-foreground">{p.desc}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Notas adicionales (opcional)</Label>
                      <Textarea 
                        placeholder="Ej: Viajamos con niños, necesitamos accesibilidad, queremos evitar..."
                        value={formData.notas}
                        onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                      />
                    </div>

                    <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Step 2: Generate */}
          {step === 2 && (
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-2xl text-center">
                <Card className="p-12">
                  <Wand2 className="h-20 w-20 mx-auto mb-6 text-primary" />
                  <h2 className="text-2xl font-bold mb-4">¿Listo para crear tu itinerario?</h2>
                  <p className="text-muted-foreground mb-8">
                    Nuestra IA analizará tus preferencias y creará un plan personalizado
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
                    <h3 className="font-semibold mb-3">Resumen de tu viaje:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {formData.destino || "Toda República Dominicana"}
                      </li>
                      <li className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        {format(formData.fechaInicio, "d MMM", { locale: es })} - {format(formData.fechaFin, "d MMM yyyy", { locale: es })}
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {formData.viajeros} viajeros
                      </li>
                      <li className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary" />
                        {formData.intereses.map(i => intereses.find(int => int.id === i)?.label).join(", ") || "Sin preferencias"}
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Modificar
                    </Button>
                    <Button size="lg" onClick={generateItinerary} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generar Itinerario
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* Step 3: Show Itinerary */}
          {step === 3 && itinerary && (
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                  <Badge className="mb-4">✨ Generado con IA</Badge>
                  <h2 className="text-3xl font-bold mb-4">{itinerary.titulo}</h2>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                  <Card className="text-center p-4">
                    <p className="text-2xl font-bold text-primary">{itinerary.resumen.costoEstimado}</p>
                    <p className="text-xs text-muted-foreground">Costo estimado</p>
                  </Card>
                  <Card className="text-center p-4">
                    <p className="text-2xl font-bold text-primary">{itinerary.resumen.distanciaTotal}</p>
                    <p className="text-xs text-muted-foreground">Distancia total</p>
                  </Card>
                  <Card className="text-center p-4">
                    <p className="text-2xl font-bold text-primary">{itinerary.resumen.actividadesIncluidas}</p>
                    <p className="text-xs text-muted-foreground">Actividades</p>
                  </Card>
                </div>

                {/* Days */}
                <div className="space-y-6">
                  {itinerary.dias.map((dia: any) => (
                    <Card key={dia.dia} className="overflow-hidden">
                      <CardHeader className="bg-primary/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Día {dia.dia}</CardTitle>
                            <CardDescription>{dia.titulo}</CardDescription>
                          </div>
                          <Badge variant="secondary">{dia.actividades.length} actividades</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {dia.actividades.map((act: any, idx: number) => (
                            <div key={idx} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                              <div className="text-center min-w-[60px]">
                                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <span className="text-sm font-medium">{act.hora}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{act.actividad}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {act.lugar}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {act.tipo}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-center gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Crear otro itinerario
                  </Button>
                  <Button onClick={() => generateItinerary()}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerar
                  </Button>
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
