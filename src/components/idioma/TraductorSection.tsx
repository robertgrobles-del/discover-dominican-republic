import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Languages, Volume2, Copy, ArrowRightLeft, Mic, 
  Sparkles, BookOpen, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { usePageContent } from "@/lib/pageContent";

const frasesComunesPorCategoria = [
  {
    categoria: "Saludos",
    frases: [
      { es: "¡Hola! ¿Cómo estás?", en: "Hello! How are you?", local: "¡Klk! ¿Qué lo que?" },
      { es: "Buenos días", en: "Good morning", local: "Buen día" },
      { es: "Mucho gusto", en: "Nice to meet you", local: "Encantao/a" },
      { es: "¿Qué tal?", en: "How's it going?", local: "¿Dime a ver?" },
    ]
  },
  {
    categoria: "Restaurante",
    frases: [
      { es: "La cuenta, por favor", en: "The check, please", local: "¿Cuánto es?" },
      { es: "¿Qué me recomienda?", en: "What do you recommend?", local: "¿Qué hay bueno?" },
      { es: "Está delicioso", en: "It's delicious", local: "¡Tá buenísimo!" },
      { es: "Sin picante, por favor", en: "Not spicy, please", local: "Sin ají, porfi" },
    ]
  },
  {
    categoria: "Transporte",
    frases: [
      { es: "¿Cuánto cuesta?", en: "How much does it cost?", local: "¿A cómo?" },
      { es: "¿Dónde queda...?", en: "Where is...?", local: "¿Por onde queda...?" },
      { es: "Llévame a...", en: "Take me to...", local: "Déjame en..." },
      { es: "¿Está lejos?", en: "Is it far?", local: "¿Queda lejos?" },
    ]
  },
  {
    categoria: "Emergencias",
    frases: [
      { es: "Necesito ayuda", en: "I need help", local: "¡Ayúdame!" },
      { es: "¿Dónde hay un hospital?", en: "Where is a hospital?", local: "¿Hay una clínica cerca?" },
      { es: "Llame a la policía", en: "Call the police", local: "Llama a la policía" },
      { es: "Me siento mal", en: "I feel sick", local: "Me siento mal" },
    ]
  },
  {
    categoria: "Playa",
    frases: [
      { es: "¿Está limpia el agua?", en: "Is the water clean?", local: "¿El agua está buena?" },
      { es: "¿Hay corrientes fuertes?", en: "Are there strong currents?", local: "¿Hay mucha corriente?" },
      { es: "¿Dónde alquilo una sombrilla?", en: "Where can I rent an umbrella?", local: "¿Dónde rentan parasoles?" },
      { es: "¡Qué playa más bonita!", en: "What a beautiful beach!", local: "¡Qué playa más chevere!" },
    ]
  },
];

const expresionesDominicanas = [
  { expresion: "¡Klk!", significado: "¿Qué lo que? - Saludo informal", ejemplo: "¡Klk manito!" },
  { expresion: "Tato", significado: "Está bien, de acuerdo", ejemplo: "–¿Vamos? –Tato" },
  { expresion: "Vaina", significado: "Cosa, situación", ejemplo: "Dame esa vaina" },
  { expresion: "Chepa", significado: "Suerte", ejemplo: "Fue de chepa" },
  { expresion: "Jevi", significado: "Genial, increíble", ejemplo: "¡Tá jevi!" },
  { expresion: "Mami/Papi", significado: "Forma cariñosa de dirigirse a alguien", ejemplo: "Oye mami, ¿cómo estás?" },
  { expresion: "Colmado", significado: "Pequeña tienda de barrio", ejemplo: "Voy al colmado" },
  { expresion: "Guagua", significado: "Autobús", ejemplo: "La guagua viene llena" },
  { expresion: "Chin", significado: "Un poco", ejemplo: "Dame un chin de eso" },
  { expresion: "Bacano", significado: "Genial, excelente", ejemplo: "¡Qué bacano!" },
];

// Antes la página /traductor; ahora es una sección de /espanol-viajero. Conserva su clave de contenido editable.
export function TraductorSection() {
  const pc = usePageContent("traductor-viajero");
  const frasesComunesPorCategoria = pc.data("frasesComunesPorCategoria", __pcData.frasesComunesPorCategoria);
  const expresionesDominicanas = pc.data("expresionesDominicanas", __pcData.expresionesDominicanas);
  const [texto, setTexto] = useState("");
  const [idiomaOrigen, setIdiomaOrigen] = useState("en");
  const [idiomaDestino, setIdiomaDestino] = useState("es");
  const [traduccion, setTraduccion] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const idiomas = [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
  ];

  const handleTranslate = async () => {
    if (!texto.trim()) return;
    setIsTranslating(true);
    // Simular traducción
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTraduccion(`[Traducción de "${texto}" al ${idiomas.find(i => i.code === idiomaDestino)?.name}]`);
    setIsTranslating(false);
  };

  const swapLanguages = () => {
    setIdiomaOrigen(idiomaDestino);
    setIdiomaDestino(idiomaOrigen);
    setTexto(traduccion);
    setTraduccion(texto);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const speakText = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : lang;
    speechSynthesis.speak(utterance);
  };

  return (
    <section id="traductor" className="scroll-mt-24 border-t border-border">
        
        <div className="pt-12">
          {/* Hero */}
          <section className="relative py-14 bg-gradient-to-b from-primary/10 via-background to-background">
            <div className="container mx-auto px-4 text-center">
              <Languages className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{pc.tx("h1.1", "Traductor del Viajero")}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{pc.tx("p.1", "Comunícate fácilmente durante tu estadía en RD")}</p>
            </div>
          </section>

          {/* Translator */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="mb-12">
                <CardContent className="p-6">
                  {/* Language Selection */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <select 
                      value={idiomaOrigen}
                      onChange={(e) => setIdiomaOrigen(e.target.value)}
                      className="bg-muted px-4 py-2 rounded-lg"
                    >
                      {idiomas.map(i => (
                        <option key={i.code} value={i.code}>{i.flag} {i.name}</option>
                      ))}
                    </select>
                    
                    <Button variant="ghost" size="icon" onClick={swapLanguages}>
                      <ArrowRightLeft className="h-5 w-5" />
                    </Button>
                    
                    <select 
                      value={idiomaDestino}
                      onChange={(e) => setIdiomaDestino(e.target.value)}
                      className="bg-muted px-4 py-2 rounded-lg"
                    >
                      {idiomas.map(i => (
                        <option key={i.code} value={i.code}>{i.flag} {i.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Text Areas */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{pc.tx("span.1", "Texto original")}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mic className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => speakText(texto, idiomaOrigen)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        placeholder={pc.t("Textarea.placeholder.1", "Escribe o habla...")}
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{pc.tx("span.2", "Traducción")}</span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(traduccion)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => speakText(traduccion, idiomaDestino)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="min-h-[150px] bg-muted/50 rounded-md p-3">
                        {traduccion || <span className="text-muted-foreground">{pc.tx("span.3", "La traducción aparecerá aquí...")}</span>}
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={handleTranslate}
                    disabled={isTranslating || !texto.trim()}
                  >
                    {isTranslating ? (
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Languages className="h-4 w-4 mr-2" />
                    )}{pc.tx("Button.1", "Traducir")}</Button>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="frases">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="frases">
                    <MessageCircle className="h-4 w-4 mr-2" />{pc.tx("TabsTrigger.1", "Frases Útiles")}</TabsTrigger>
                  <TabsTrigger value="expresiones">
                    <BookOpen className="h-4 w-4 mr-2" />{pc.tx("TabsTrigger.2", "Expresiones Dominicanas")}</TabsTrigger>
                </TabsList>

                <TabsContent value="frases" className="space-y-6">
                  {frasesComunesPorCategoria.map((cat) => (
                    <Card key={cat.categoria}>
                      <CardHeader>
                        <CardTitle as="h2" className="text-lg">{cat.categoria}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {cat.frases.map((frase, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="space-y-1">
                                <p className="font-medium">{frase.es}</p>
                                <p className="text-sm text-muted-foreground">{frase.en}</p>
                                <Badge variant="secondary" className="text-xs">
                                  🇩🇴 {frase.local}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => speakText(frase.es, 'es')}
                                >
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => copyToClipboard(frase.es)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="expresiones">
                  <Card>
                    <CardHeader>
                      <CardTitle>{pc.tx("CardTitle.1", "Expresiones Típicas Dominicanas")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {expresionesDominicanas.map((exp, idx) => (
                          <div 
                            key={idx} 
                            className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge className="text-lg">{exp.expresion}</Badge>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => speakText(exp.expresion, 'es')}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-muted-foreground mb-1">{exp.significado}</p>
                            <p className="text-sm italic">"{exp.ejemplo}"</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </div>

        </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { frasesComunesPorCategoria, expresionesDominicanas };
