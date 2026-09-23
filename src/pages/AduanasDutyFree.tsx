import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package, ShoppingBag, AlertTriangle, CheckCircle2, XCircle,
  Wine, Cigarette, DollarSign, Gift, Gem, ShieldAlert, Sparkles,
  Plane, Scale, HelpCircle, ArrowRight
} from "lucide-react";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

interface ItemPermitido {
  item: string;
  limite: string;
  categoria: string;
  icon: any;
  notas: string;
  aduanasRD: string;
  alRegresar: string;
}

const permitidos: ItemPermitido[] = [
  {
    item: "Ron Dominicano",
    limite: "Hasta 2-3 botellas estándar",
    categoria: "Licores",
    icon: Wine,
    notas: "Marcas como Barceló Imperial, Brugal Leyenda o Bermúdez son souvenirs premium.",
    aduanasRD: "Permitido 1L libre de impuestos al entrar; hasta 2.5L en bodega al salir.",
    alRegresar: "EE.UU: 1L duty-free (exceso paga arancel mínimo). UE: 1L destilado."
  },
  {
    item: "Puros / Tabaco Hecho a Mano",
    limite: "Hasta 50 puros / 200 cigarrillos",
    categoria: "Tabaco",
    icon: Cigarette,
    notas: "Santiago y Tamboril producen los mejores puros del mundo (Arturo Fuente, Davidoff).",
    aduanasRD: "Hasta 200 cigarrillos o 1 caja de 50 puros sin tasas.",
    alRegresar: "EE.UU: 100 puros. UE: 50 puros o 200 cigarrillos."
  },
  {
    item: "Joyería de Ámbar y Larimar",
    limite: "Uso personal / Souvenirs",
    categoria: "Gemas",
    icon: Gem,
    notas: "El Larimar es una pectolita azul endémica exclusiva de Barahona.",
    aduanasRD: "Permitida la joyería montada en plata/oro. El material en bruto está restringido.",
    alRegresar: "Dentro de la exención de equipaje estándar de tu país."
  },
  {
    item: "Café Dominicano & Cacao Orgánico",
    limite: "Cantidades comerciales no permitidas",
    categoria: "Alimentos",
    icon: ShoppingBag,
    notas: "Café Santo Domingo y bolas de cacao puro de Monte Plata o San Francisco de Macorís.",
    aduanasRD: "Totalmente permitido en equipaje facturado o de mano.",
    alRegresar: "Empaquetado comercial al vacío. Debe declararse en formulario fitosanitario."
  },
  {
    item: "Mamajuana Tradicional",
    limite: "1 a 2 botellas",
    categoria: "Licores & Hierbas",
    icon: Wine,
    notas: "Mezcla de ron, vino dulce, miel y raíces locales autóctonas.",
    aduanasRD: "Permitido. Se recomienda llevar botellas líquidas listas o paquetes secos sellados.",
    alRegresar: "EE.UU./Canadá permiten botellas líquidas procesadas. Ramas sueltas pueden ser confiscadas."
  },
  {
    item: "Artesanías y Cuadros Taínos",
    limite: "Sin límite razonable",
    categoria: "Arte",
    icon: Gift,
    notas: "Muñecas Limé sin rostro, tallas de madera guayacán y pinturas costumbristas.",
    aduanasRD: "Libre exportación de artesanía contemporánea.",
    alRegresar: "Piezas de madera deben estar selladas/barnizadas para evitar plagas."
  }
];

const articulosProhibidos = [
  {
    item: "Coral Negro y Concha Carey (Tortuga)",
    motivo: "Protegidos por el tratado internacional CITES. Confiscación inmediata y severas multas penales.",
    severidad: "Delito Ambiental"
  },
  {
    item: "Drogas Ilícitas y Estupefacientes",
    motivo: "Ley 50-88 de Tolerancia Cero. Penas de prisión de 5 a 20 años sin derecho a fianza.",
    severidad: "Delito Grave"
  },
  {
    item: "Efectivo Mayor a US$ 10,000 (o equivalente)",
    motivo: "Obligatorio declarar formalmente en aduana al entrar o salir para prevenir lavado de activos.",
    severidad: "Declaración Obligatoria"
  },
  {
    item: "Armas de Fuego, Municiones y Dagas Militares",
    motivo: "Prohibición absoluta sin permiso diplomático o del Ministerio de Interior y Policía.",
    severidad: "Prohibición Total"
  },
  {
    item: "Frutas Frescas, Semillas y Carnes Crudas",
    motivo: "Regulaciones fitosanitarias internacionales para prevenir plagas agrícolas.",
    severidad: "Confiscación Fitosanitaria"
  }
];

const tiendasDutyFree = [
  {
    aeropuerto: "Aeropuerto Internacional de Punta Cana (PUJ)",
    terminales: "Terminal A & Terminal B",
    operador: "Duty Free Americas & Dufry",
    destacados: "Cava de rones finos, puros con humidor climatizado, perfumes de diseñador (Chanel, Dior), chocolates artesanales y licor local con hasta 35% de descuento respecto a precio de ciudad.",
    horario: "24/7 coincidente con los vuelos internacionales"
  },
  {
    aeropuerto: "Aeropuerto Int. Las Américas Santo Domingo (SDQ)",
    terminales: "Terminal Norte & Satélite Sur",
    operador: "Dufry Dominicana",
    destacados: "Extenso boulevard comercial con marcas de lujo, electrónica, joyería de Larimar certificada con certificado de autenticidad y degustaciones de ron.",
    horario: "Abierto 24 Horas"
  },
  {
    aeropuerto: "Aeropuerto Int. del Cibao Santiago (STI)",
    terminales: "Área de Salidas Internacionales",
    operador: "Duty Free Americas",
    destacados: "Especialización en marcas de tabaco del Valle del Cibao, café artesanal gourmet y productos típicos de la región norte.",
    horario: "Según programación de vuelos"
  }
];

export default function AduanasDutyFree() {
  const [activeTab, setActiveTab] = useState<"permitido" | "prohibido" | "dutyfree" | "calculadora">("permitido");
  
  // Calculadora interactiva de franquicias
  const [ronBottles, setRonBottles] = useState<number>(1);
  const [cigarCount, setCigarCount] = useState<number>(20);
  const [cashAmount, setCashAmount] = useState<number>(2500);
  const [countryTarget, setCountryTarget] = useState<"usa" | "canada" | "europe">("usa");

  const getCashStatus = () => {
    if (cashAmount > 10000) {
      return { text: "Requiere declaración formal ante la DGA", color: "text-rose-500", ok: false };
    }
    return { text: "Dentro del límite libre sin declaración previa", color: "text-emerald-500", ok: true };
  };

  const getLiquorStatus = () => {
    if (countryTarget === "usa") {
      return ronBottles <= 1 
        ? "100% Exento de aranceles (1 Litro libre)"
        : `1L Libre + ${ronBottles - 1} botella(s) sujeta a arancel aproximado de US$2-$3 por botella`;
    }
    if (countryTarget === "canada") {
      return ronBottles <= 1 
        ? "Dentro de la franquicia canadiense de 1.14L"
        : "Sujeto a arancel provincial de importación al llegar";
    }
    return ronBottles <= 1 
      ? "Exento de impuestos en la Unión Europea (1 Litro)"
      : "Debe declararse en aduana europea (arancel + IVA local)";
  };

  const getCigarStatus = () => {
    if (countryTarget === "usa") {
      return cigarCount <= 100 ? "Permitido libre de aranceles (Hasta 100 puros)" : "Excede la franquicia permitida";
    }
    return cigarCount <= 50 ? "Permitido libre de aranceles (Hasta 50 puros)" : "Excede la franquicia recomendada";
  };

  return (
    <PageTransition>
      <SEOHead
        title="Guía de Aduanas y Tiendas Duty-Free en RD | Descubre República Dominicana"
        description="Todo sobre las regulaciones aduaneras de República Dominicana: límites de ron, tabaco, café, divisas, qué artículos están prohibidos y tiendas Duty Free en los aeropuertos."
        keywords="aduanas republica dominicana, duty free punta cana, limite alcohol aduana rd, comprar puros dominicana aduana, franquicia equipaje dga"
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="pb-20">
          {/* Hero Section */}
          <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={santoDomingoImg} 
                alt="Aeropuerto y compras en República Dominicana" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/30" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-16 text-center max-w-4xl text-white">
              <Badge className="mb-4 bg-primary/20 text-white border-primary/40 backdrop-blur-md px-3 py-1 font-semibold">
                <Package className="h-3.5 w-3.5 mr-1.5 text-primary" /> Dirección General de Aduanas (DGA)
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-4 drop-shadow-md">
                Guía de Aduanas y <span className="text-primary italic">Duty-Free</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Conoce los límites permitidos de ron, puros, artesanías y divisas, junto a los mejores consejos de compras libres de impuestos en aeropuertos dominicanos.
              </p>
            </div>
          </section>

          {/* Selector de Pestañas */}
          <section className="container mx-auto px-4 -mt-6 relative z-20">
            <div className="bg-card border border-border/80 rounded-2xl p-2 shadow-xl max-w-3xl mx-auto flex flex-wrap sm:flex-nowrap gap-2">
              <button
                onClick={() => setActiveTab("permitido")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "permitido" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" /> Permitidos & Souvenirs
              </button>
              <button
                onClick={() => setActiveTab("prohibido")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "prohibido" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <ShieldAlert className="h-4 w-4" /> Restringidos & Multas
              </button>
              <button
                onClick={() => setActiveTab("calculadora")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "calculadora" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Scale className="h-4 w-4" /> Calculadora de Franquicia
              </button>
              <button
                onClick={() => setActiveTab("dutyfree")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "dutyfree" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <ShoppingBag className="h-4 w-4" /> Tiendas Duty-Free
              </button>
            </div>
          </section>

          {/* Contenido Dinámico */}
          <section className="container mx-auto px-4 mt-12 max-w-5xl">
            {activeTab === "permitido" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    Artículos Permitidos y Recomendados
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Productos tradicionales dominicanos que puedes llevar en tu equipaje facturado o de mano cumpliendo las normativas.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {permitidos.map((p) => {
                    const IconComponent = p.icon;
                    return (
                      <Card key={p.item} className="border border-border/80 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0 border border-primary/20">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="font-bold text-foreground text-base">{p.item}</h3>
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold">{p.categoria}</Badge>
                              </div>
                              <p className="text-xs text-primary font-semibold mb-2">{p.limite}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{p.notas}</p>
                              
                              <div className="bg-muted/30 rounded-xl p-3 space-y-1.5 text-[11px] border border-border/40">
                                <p><strong className="text-foreground">🇩🇴 Aduana RD:</strong> {p.aduanasRD}</p>
                                <p><strong className="text-foreground">✈️ Al regresar:</strong> {p.alRegresar}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "prohibido" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    Artículos Prohibidos y Leyes Aduaneras
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Evita retrasos graves, confiscaciones o sanciones penales conociendo los productos no autorizados.
                  </p>
                </div>

                <div className="space-y-4">
                  {articulosProhibidos.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-card border border-destructive/30 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 bg-destructive/10 rounded-xl text-destructive shrink-0 mt-0.5 sm:mt-0">
                          <XCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground text-sm">{item.item}</h3>
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                              {item.severidad}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {item.motivo}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mt-8">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-foreground text-sm">Declaración Electrónica de Entrada/Salida (E-Ticket)</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Todos los pasajeros deben completar obligatoriamente el formulario digital gratuito de la Dirección General de Migración y Aduanas antes de embarcar en su vuelo (<span className="text-foreground font-semibold">eticket.migracion.gob.do</span>).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "calculadora" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    Calculadora de Franquicia Aduanera
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Estima si las compras y souvenirs de tu viaje caben dentro de los límites libres de impuestos para tu país de destino.
                  </p>
                </div>

                <Card className="border border-border/80 shadow-md">
                  <CardHeader className="bg-muted/20 border-b">
                    <CardTitle className="text-lg font-bold">Simula tus Compras de Viaje</CardTitle>
                    <CardDescription>Ajusta las cantidades para ver el diagnóstico aduanero de tu país.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs font-bold text-muted-foreground">País de Residencia / Regreso</Label>
                          <div className="grid grid-cols-3 gap-2 mt-1.5">
                            <Button
                              type="button"
                              variant={countryTarget === "usa" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCountryTarget("usa")}
                              className="text-xs font-semibold"
                            >
                              🇺🇸 EE.UU.
                            </Button>
                            <Button
                              type="button"
                              variant={countryTarget === "canada" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCountryTarget("canada")}
                              className="text-xs font-semibold"
                            >
                              🇨🇦 Canadá
                            </Button>
                            <Button
                              type="button"
                              variant={countryTarget === "europe" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCountryTarget("europe")}
                              className="text-xs font-semibold"
                            >
                              🇪🇺 Europa
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-bold text-muted-foreground">Botellas de Ron / Licores (750ml c/u)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="12" 
                            value={ronBottles} 
                            onChange={(e) => setRonBottles(Math.max(0, parseInt(e.target.value) || 0))}
                            className="mt-1.5"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-bold text-muted-foreground">Cantidad de Puros / Tabacos</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="200" 
                            value={cigarCount} 
                            onChange={(e) => setCigarCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="mt-1.5"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-bold text-muted-foreground">Efectivo Total Transportado (USD)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            step="500" 
                            value={cashAmount} 
                            onChange={(e) => setCashAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="mt-1.5"
                          />
                        </div>
                      </div>

                      {/* Resultados de la Simulación */}
                      <div className="bg-muted/30 border border-border/80 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
                            <Scale className="h-4 w-4 text-primary" /> Diagnóstico de Franquicia
                          </h4>

                          <div className="space-y-4 text-xs">
                            <div className="p-3 bg-background rounded-xl border border-border/60">
                              <span className="font-bold text-foreground block mb-0.5">🥃 Licores y Ron:</span>
                              <span className="text-muted-foreground">{getLiquorStatus()}</span>
                            </div>

                            <div className="p-3 bg-background rounded-xl border border-border/60">
                              <span className="font-bold text-foreground block mb-0.5">🚬 Puros y Tabaco:</span>
                              <span className="text-muted-foreground">{getCigarStatus()}</span>
                            </div>

                            <div className="p-3 bg-background rounded-xl border border-border/60">
                              <span className="font-bold text-foreground block mb-0.5">💵 Declaración de Divisas:</span>
                              <span className={`font-semibold ${getCashStatus().color}`}>
                                {getCashStatus().text} (${cashAmount.toLocaleString()} USD)
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-muted-foreground mt-6 leading-relaxed border-t border-border/60 pt-3">
                          * Nota: Los valores son informativos con base en las regulaciones de CBP (EE.UU.), CBSA (Canadá) y Aduanas UE. Las exenciones por valor total de compras rondan entre US$800 (EE.UU.) y €430 (UE).
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "dutyfree" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    Tiendas Duty-Free en Aeropuertos
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Aprovecha tus compras libres de impuestos en las áreas de salidas y llegadas internacionales de República Dominicana.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tiendasDutyFree.map((shop, idx) => (
                    <Card key={idx} className="border border-border/80 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all">
                      <CardHeader className="bg-muted/15 pb-4">
                        <Badge className="w-fit mb-2 bg-primary/10 text-primary border-primary/20">
                          <Plane className="h-3 w-3 mr-1" /> {shop.terminales}
                        </Badge>
                        <CardTitle className="text-base font-bold">{shop.aeropuerto}</CardTitle>
                        <CardDescription className="text-xs font-semibold text-primary">{shop.operador}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 flex-1 flex flex-col justify-between gap-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {shop.destacados}
                        </p>
                        <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
                          <span className="font-semibold text-foreground">Horario:</span>
                          <span>{shop.horario}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Banner Publicitario Oficial */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <PanoramaAd />
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
