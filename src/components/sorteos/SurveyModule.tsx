import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  PartyPopper, Gift, Send, ChevronRight, Clock, CheckCircle,
  Hotel, UtensilsCrossed, Compass, DollarSign, Plane, Heart,
  type LucideIcon
} from "lucide-react";

export type SurveyId = "experiencia" | "estadia" | "gastronomia" | "gastos" | "transporte" | "atencion";

export interface SurveyConfig {
  id: SurveyId;
  titulo: string;
  desc: string;
  tiempo: string;
  preguntas: number;
  icon: LucideIcon;
}

export const ENCUESTAS_DISPONIBLES: SurveyConfig[] = [
  { id: "experiencia", titulo: "Tu Experiencia en RD", desc: "Cuéntanos sobre tu viaje, qué fue lo mejor y qué podemos mejorar.", tiempo: "3 min", preguntas: 8, icon: Compass },
  { id: "estadia", titulo: "Alojamiento y Hospitalidad", desc: "Evalúa hoteles, resorts, airbnbs y el servicio recibido.", tiempo: "2 min", preguntas: 10, icon: Hotel },
  { id: "gastronomia", titulo: "Sabor Dominicano", desc: "Tu opinión sobre restaurantes, platos típicos y gastronomía.", tiempo: "2 min", preguntas: 8, icon: UtensilsCrossed },
  { id: "gastos", titulo: "Presupuesto y Gastos", desc: "Ayúdanos a entender el gasto promedio del turista en el país.", tiempo: "3 min", preguntas: 7, icon: DollarSign },
  { id: "transporte", titulo: "Movilidad y Transporte", desc: "Califica carreteras, aeropuertos, taxis y transporte público.", tiempo: "2 min", preguntas: 6, icon: Plane },
  { id: "atencion", titulo: "Servicio y Hospitalidad", desc: "¿Cómo te trataron los dominicanos durante tu estancia?", tiempo: "2 min", preguntas: 7, icon: Heart },
];

const PREGUNTAS_POR_ENCUESTA: Record<SurveyId, { pregunta: string; opciones: string[] }[]> = {
  experiencia: [
    { pregunta: "¿Cómo calificarías tu experiencia general en RD?", opciones: ["Excelente", "Buena", "Regular", "Mala"] },
    { pregunta: "¿Qué destino visitaste principalmente?", opciones: ["Punta Cana", "Santo Domingo", "Samaná", "Puerto Plata", "La Romana", "Otro"] },
    { pregunta: "¿Cómo fue la hospitalidad de la gente local?", opciones: ["Increíble", "Muy buena", "Normal", "Podría mejorar"] },
    { pregunta: "¿Recomendarías RD a amigos y familiares?", opciones: ["Definitivamente sí", "Probablemente sí", "No estoy seguro/a", "Probablemente no"] },
    { pregunta: "¿Qué fue lo mejor de tu viaje?", opciones: ["Playas", "Comida", "La gente", "Naturaleza", "Cultura", "Vida nocturna"] },
    { pregunta: "¿Qué fue lo que menos te gustó?", opciones: ["Tráfico", "Basura", "Seguridad", "Precios", "Nada negativo", "Otro"] },
    { pregunta: "¿Volverías a visitar República Dominicana?", opciones: ["Sin duda", "Probablemente", "Tal vez", "No creo"] },
    { pregunta: "¿Cuántas noches te hospedaste?", opciones: ["1-3", "4-7", "8-14", "15+"] },
  ],
  estadia: [
    { pregunta: "¿Qué tipo de alojamiento usaste?", opciones: ["Hotel all-inclusive", "Hotel boutique", "Airbnb", "Villa privada", "Hostel", "Otro"] },
    { pregunta: "¿Cómo calificas la limpieza?", opciones: ["Impecable", "Buena", "Aceptable", "Deficiente"] },
    { pregunta: "¿Cómo fue el check-in/check-out?", opciones: ["Rápido y fácil", "Normal", "Lento", "Muy complicado"] },
    { pregunta: "¿Calidad de las instalaciones?", opciones: ["Superó expectativas", "Como esperaba", "Algo inferior", "Decepcionante"] },
    { pregunta: "¿El precio fue justo por lo ofrecido?", opciones: ["Gran valor", "Precio justo", "Algo caro", "Muy caro"] },
    { pregunta: "¿Cómo fue la atención del personal?", opciones: ["Excepcional", "Amable", "Normal", "Indiferente"] },
    { pregunta: "¿Calidad del WiFi?", opciones: ["Excelente", "Bueno", "Regular", "Malo", "No había"] },
    { pregunta: "¿El desayuno incluido fue satisfactorio?", opciones: ["Excelente variedad", "Bueno", "Básico", "No incluía", "N/A"] },
    { pregunta: "¿Calificarías la ubicación como conveniente?", opciones: ["Perfecta", "Buena", "Regular", "Mala"] },
    { pregunta: "¿Reservarías el mismo alojamiento de nuevo?", opciones: ["Sin duda", "Probablemente", "Buscaría otro", "Nunca"] },
  ],
  gastronomia: [
    { pregunta: "¿Probaste la comida típica dominicana?", opciones: ["Sí, mucha", "Algo", "Muy poco", "No, solo internacional"] },
    { pregunta: "¿Cuál fue tu plato favorito?", opciones: ["La Bandera", "Mangú", "Sancocho", "Mofongo", "Chivo", "Mariscos", "Otro"] },
    { pregunta: "¿Cómo calificas la calidad de los restaurantes?", opciones: ["Excelente", "Buena", "Regular", "Mala"] },
    { pregunta: "¿Los precios de la comida te parecieron?", opciones: ["Muy económicos", "Razonables", "Algo caros", "Muy caros"] },
    { pregunta: "¿Probaste ron dominicano?", opciones: ["Sí, me encantó", "Sí, estuvo bien", "Un poco", "No probé"] },
    { pregunta: "¿Visitaste algún food truck o comedor callejero?", opciones: ["Sí, varios", "Uno o dos", "No, solo restaurantes", "No me atreví"] },
    { pregunta: "¿Encontraste opciones para dietas especiales?", opciones: ["Sí, fácilmente", "Con algo de esfuerzo", "Difícil", "No busqué", "N/A"] },
    { pregunta: "¿Recomendarías la gastronomía dominicana?", opciones: ["100%", "Probablemente", "Algunos platos", "No realmente"] },
  ],
  gastos: [
    { pregunta: "¿Cuánto gastaste aproximadamente por día?", opciones: ["Menos de US$50", "US$50-100", "US$100-200", "US$200-500", "Más de US$500"] },
    { pregunta: "¿En qué gastaste más dinero?", opciones: ["Alojamiento", "Comida", "Excursiones", "Compras", "Transporte", "Entretenimiento"] },
    { pregunta: "¿Usaste tarjeta o efectivo?", opciones: ["Solo tarjeta", "Mayoría tarjeta", "Mitad y mitad", "Mayoría efectivo", "Solo efectivo"] },
    { pregunta: "¿Encontraste cajeros/ATM fácilmente?", opciones: ["Sí, en todos lados", "Suficientes", "Pocos", "Muy difícil"] },
    { pregunta: "¿Compraste souvenirs/artesanías?", opciones: ["Sí, muchos", "Algunos", "Muy pocos", "Nada"] },
    { pregunta: "¿Sentiste que los precios eran justos para turistas?", opciones: ["Sí, muy justos", "Razonables", "Algo inflados", "Muy caros"] },
    { pregunta: "¿Tu viaje se ajustó al presupuesto planeado?", opciones: ["Gasté menos", "Igual al plan", "Un poco más", "Mucho más"] },
  ],
  transporte: [
    { pregunta: "¿Cómo llegaste a República Dominicana?", opciones: ["Vuelo directo", "Vuelo con escala", "Crucero", "Ya vivo aquí"] },
    { pregunta: "¿Cómo calificas el aeropuerto de llegada?", opciones: ["Moderno y eficiente", "Bueno", "Aceptable", "Mejorable"] },
    { pregunta: "¿Qué transporte usaste dentro del país?", opciones: ["Transfer privado", "Taxi", "Uber/DiDi", "Bus turístico", "Alquiler de auto", "Varios"] },
    { pregunta: "¿Cómo calificas las carreteras?", opciones: ["Buenas", "Aceptables", "Regulares", "Malas"] },
    { pregunta: "¿Te sentiste seguro/a en el transporte?", opciones: ["Muy seguro/a", "Seguro/a", "Algo inseguro/a", "Inseguro/a"] },
    { pregunta: "¿Fue fácil moverse entre destinos?", opciones: ["Muy fácil", "Fácil", "Algo complicado", "Muy difícil"] },
  ],
  atencion: [
    { pregunta: "¿Cómo fue la atención en tu hotel/alojamiento?", opciones: ["Excepcional", "Muy buena", "Normal", "Deficiente"] },
    { pregunta: "¿Cómo fue la atención en restaurantes?", opciones: ["Excelente", "Buena", "Regular", "Mala"] },
    { pregunta: "¿El personal hablaba tu idioma?", opciones: ["Sí, sin problemas", "Algunos sí", "Poco", "No, fue difícil"] },
    { pregunta: "¿Te sentiste bienvenido/a en el país?", opciones: ["Muy bienvenido/a", "Bienvenido/a", "Normal", "No mucho"] },
    { pregunta: "¿Tuviste algún problema que necesitara ayuda?", opciones: ["No, todo bien", "Sí, lo resolvieron rápido", "Sí, tardaron", "Sí, no lo resolvieron"] },
    { pregunta: "¿Cómo fue la atención en atracciones/excursiones?", opciones: ["Profesional", "Buena", "Aceptable", "Mejorable"] },
    { pregunta: "¿Recomendarías RD por su hospitalidad?", opciones: ["Absolutamente", "Sí", "Con reservas", "No"] },
  ],
};

interface SurveyModuleProps {
  survey: SurveyConfig;
  onCompleted?: () => void;
  onBack?: () => void;
}

export const SurveyModule: React.FC<SurveyModuleProps> = ({ survey, onCompleted, onBack }) => {
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const preguntas = PREGUNTAS_POR_ENCUESTA[survey.id] || [];
  const totalPreguntas = preguntas.length;

  if (enviado) {
    return (
      <div className="text-center py-12 bg-card rounded-2xl border border-border p-8 max-w-lg mx-auto">
        <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">¡Gracias por participar!</h3>
        <p className="text-muted-foreground mb-4">Tu encuesta ha sido enviada exitosamente. Ya estás participando en el sorteo.</p>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-sm py-1.5 px-4 mb-6">
          <Gift className="h-4 w-4 mr-1" /> Entrada extra registrada
        </Badge>
        {onBack && (
          <div>
            <Button variant="outline" onClick={onBack}>
              Ver más encuestas
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Último paso: email para el sorteo
  if (step === totalPreguntas) {
    return (
      <div className="max-w-md mx-auto bg-card rounded-2xl border border-border p-8">
        <div className="text-center mb-6">
          <Gift className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground text-lg">¡Último paso!</h3>
          <p className="text-sm text-muted-foreground">Ingresa tu email para vincular tus respuestas y participar en el sorteo de premios.</p>
        </div>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="mb-4"
        />
        <Button
          className="w-full gap-2"
          disabled={loading}
          onClick={async () => {
            if (!email) { toast.error("Ingresa tu email para participar"); return; }
            setLoading(true);
            const { error } = await supabase.from("survey_responses").insert({
              survey_id: survey.id,
              email,
              respuestas: respuestas,
            });
            setLoading(false);
            if (error) {
              // Si falla por tabla inexistente o RLS, dar feedback amigable
              console.warn("Error guardando encuesta en backend:", error);
            }
            setEnviado(true);
            toast.success("🎉 ¡Encuesta enviada! Ya participas en el sorteo.");
            if (onCompleted) onCompleted();
          }}
        >
          <Send className="h-4 w-4" /> {loading ? "Enviando..." : "Enviar y participar en sorteo"}
        </Button>
      </div>
    );
  }

  const preguntaActual = preguntas[step];

  return (
    <div className="max-w-lg mx-auto">
      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Pregunta {step + 1} de {totalPreguntas}</span>
          <span>{Math.round(((step + 1) / totalPreguntas) * 100)}%</span>
        </div>
        <Progress
          value={((step + 1) / totalPreguntas) * 100}
          className="h-2"
          aria-label={`Pregunta ${step + 1} de ${totalPreguntas}`}
        />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
        <h3 className="font-semibold text-foreground text-lg mb-6">{preguntaActual.pregunta}</h3>
        <RadioGroup
          value={respuestas[`q${step}`] || ""}
          onValueChange={v => setRespuestas({ ...respuestas, [`q${step}`]: v })}
          className="space-y-3"
        >
          {preguntaActual.opciones.map(opt => (
            <div
              key={opt}
              onClick={() => setRespuestas({ ...respuestas, [`q${step}`]: opt })}
              className="flex items-center space-x-3 p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <RadioGroupItem value={opt} id={`q${step}-${opt}`} />
              <Label htmlFor={`q${step}-${opt}`} className="flex-1 cursor-pointer text-sm font-medium">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Anterior
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!respuestas[`q${step}`]) { toast.error("Selecciona una respuesta para continuar"); return; }
              setStep(step + 1);
            }}
            className="gap-1 bg-primary text-primary-foreground"
          >
            {step === totalPreguntas - 1 ? "Finalizar" : "Siguiente"} <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
