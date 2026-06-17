import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import {
  Search, ShoppingBag, Star, MapPin, ChevronRight, Heart,
  Coffee, Gem, Paintbrush, Package, Truck, Shield, Phone,
  Camera, Compass, Car, UtensilsCrossed, Music, Anchor,
  Store, Building2, Globe, Clock, Award, Users, CheckCircle,
  Filter, TrendingUp, ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Artesanos Directo ───────────────────────────────────────────────
const artesanos = [
  {
    id: "artesano-1",
    nombre: "Taller de Alfarería Higüerito",
    especialidad: "Alfarería tradicional y Muñecas Limé",
    ubicacion: "Moca, Espaillat",
    bio: "Artesanos de tercera generación dedicados a moldear el barro rojo tradicional de Higüerito. Creadores de las famosas muñecas sin rostro (Limé) que representan la identidad y el sincretismo cultural dominicano.",
    imagen: "https://images.unsplash.com/photo-1540552980157-21d2a565c52b?w=600&auto=format&fit=crop&q=80",
    telefono: "+1 809-555-0192",
    verificado: true
  },
  {
    id: "artesano-2",
    nombre: "Tejedoras de Caña de El Seibo",
    especialidad: "Cestería y sombreros de caña",
    ubicacion: "El Seibo",
    bio: "Cooperativa de mujeres artesanas que mantiene vivo el arte ancestral del tejido de fibras de caña y palma real. Cada pieza cuenta una historia de resiliencia, trabajo en equipo y tradición familiar.",
    imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    telefono: "+1 809-555-0193",
    verificado: true
  },
  {
    id: "artesano-3",
    nombre: "Tallistas de Madera de Bonao",
    especialidad: "Esculturas en madera y Santos de Palo",
    ubicacion: "Bonao, Monseñor Nouel",
    bio: "Colectivo de tallistas especializados en maderas nobles locales como caoba y guayacán. Famosos por sus tallas de aves endémicas dominicanas y hermosas reproducciones de arte sacro tradicional.",
    imagen: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&auto=format&fit=crop&q=80",
    telefono: "+1 809-555-0194",
    verificado: true
  }
];
import gastronomy from "@/assets/gastronomy.jpg";
import adventureImg from "@/assets/adventure.jpg";
import colonialDoor from "@/assets/colonial-door.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import samanaImg from "@/assets/samana.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import laBandera from "@/assets/la-bandera.jpg";

// ─── Productos Artesanales ──────────────────────────────────────────
const productos = [
  {
    id: "larimar-jewelry",
    nombre: "Joyería de Larimar",
    vendedor: "Piedras del Caribe",
    imagen: relaxBeach,
    categoria: "Joyería",
    precio: "Desde US$ 25",
    ubicacion: "Barahona",
    rating: 4.9,
    reviews: 342,
    descripcion: "Piezas únicas de larimar azul dominicano engarzado en plata. Diseños artesanales exclusivos.",
    tags: ["Larimar", "Plata 925", "Hecho a mano"],
    envio: true,
    verificado: true,
  },
  {
    id: "cafe-barahona",
    nombre: "Café Orgánico de Montaña",
    vendedor: "Finca La Aurora",
    imagen: gastronomy,
    categoria: "Gastronomía",
    precio: "US$ 12 - US$ 45",
    ubicacion: "Jarabacoa",
    rating: 4.8,
    reviews: 215,
    descripcion: "Café 100% orgánico cultivado a 1,200 msnm. Tostado artesanal, notas de chocolate y frutas rojas.",
    tags: ["Orgánico", "Tostado artesanal", "Specialty"],
    envio: true,
    verificado: true,
  },
  {
    id: "ron-artesanal",
    nombre: "Ron Premium Dominicano",
    vendedor: "Casa del Ron",
    imagen: laBandera,
    categoria: "Bebidas",
    precio: "US$ 35 - US$ 150",
    ubicacion: "San Pedro de Macorís",
    rating: 4.9,
    reviews: 180,
    descripcion: "Ron añejo premium, envejecido hasta 25 años en barricas de roble americano. Ediciones limitadas.",
    tags: ["Añejo", "Edición limitada", "Premium"],
    envio: true,
    verificado: true,
  },
  {
    id: "cacao-organico",
    nombre: "Cacao Fino de Aroma",
    vendedor: "Chocolat Dominicano",
    imagen: gastronomy,
    categoria: "Gastronomía",
    precio: "US$ 8 - US$ 30",
    ubicacion: "Hato Mayor",
    rating: 4.7,
    reviews: 128,
    descripcion: "Cacao orgánico certificado y tabletas de chocolate artesanal single-origin de República Dominicana.",
    tags: ["Orgánico", "Single Origin", "Fair Trade"],
    envio: true,
    verificado: false,
  },
  {
    id: "pintura-naive",
    nombre: "Pintura Naïf Dominicana",
    vendedor: "Galería Caribe",
    imagen: colonialDoor,
    categoria: "Arte",
    precio: "US$ 50 - US$ 500",
    ubicacion: "Santo Domingo",
    rating: 4.8,
    reviews: 95,
    descripcion: "Cuadros originales de estilo naïf dominicano, pintados en acrílico y óleo por artistas locales.",
    tags: ["Arte original", "Naïf", "Firmado"],
    envio: true,
    verificado: true,
  },
  {
    id: "ambar-dominicano",
    nombre: "Ámbar Dominicano",
    vendedor: "Ámbar del Cibao",
    imagen: relaxBeach,
    categoria: "Joyería",
    precio: "Desde US$ 15",
    ubicacion: "Puerto Plata",
    rating: 4.6,
    reviews: 276,
    descripcion: "Ámbar azul y miel dominicano en anillos, collares y piezas de colección. Certificado de autenticidad.",
    tags: ["Ámbar azul", "Certificado", "Colección"],
    envio: true,
    verificado: true,
  },
  {
    id: "cigarros-premium",
    nombre: "Cigarros Premium Hechos a Mano",
    vendedor: "Tabacalera del Valle",
    imagen: adventureImg,
    categoria: "Tabaco",
    precio: "US$ 8 - US$ 80",
    ubicacion: "Santiago",
    rating: 4.9,
    reviews: 310,
    descripcion: "Cigarros enrollados a mano con tabaco dominicano premium. Cajas y ediciones especiales.",
    tags: ["Premium", "Hecho a mano", "Edición especial"],
    envio: true,
    verificado: true,
  },
  {
    id: "artesania-taino",
    nombre: "Artesanía Taína",
    vendedor: "Raíces Taínas",
    imagen: colonialDoor,
    categoria: "Artesanía",
    precio: "US$ 10 - US$ 120",
    ubicacion: "La Vega",
    rating: 4.5,
    reviews: 88,
    descripcion: "Réplicas de arte taíno en cerámica y piedra: cemíes, duhos y vasijas ceremoniales.",
    tags: ["Taíno", "Cerámica", "Cultural"],
    envio: true,
    verificado: false,
  },
];

// ─── Servicios Turísticos ───────────────────────────────────────────
const servicios = [
  {
    id: "tour-samana",
    nombre: "Excursiones en Samaná",
    proveedor: "Samaná Adventures",
    imagen: samanaImg,
    categoria: "Tours",
    precio: "Desde US$ 65",
    ubicacion: "Samaná",
    rating: 4.9,
    reviews: 520,
    descripcion: "Tours de avistamiento de ballenas, excursiones a Cayo Levantado y El Limón waterfall.",
    serviciosList: ["Ballenas", "Cayo Levantado", "Cascada El Limón", "Los Haitises"],
    verificado: true,
    icon: Anchor,
  },
  {
    id: "fotografia-profesional",
    nombre: "Fotografía Profesional de Viajes",
    proveedor: "RD Photo Studio",
    imagen: puntaCana,
    categoria: "Fotografía",
    precio: "Desde US$ 150",
    ubicacion: "Punta Cana",
    rating: 5.0,
    reviews: 185,
    descripcion: "Sesiones fotográficas para parejas, familias y grupos en las mejores locaciones de RD.",
    serviciosList: ["Sesión playa", "Sesión ciudad", "Drone", "Video"],
    verificado: true,
    icon: Camera,
  },
  {
    id: "transfer-aeropuerto",
    nombre: "Transfer Aeropuerto VIP",
    proveedor: "RD Transfers",
    imagen: adventureImg,
    categoria: "Transporte",
    precio: "Desde US$ 35",
    ubicacion: "Todo el país",
    rating: 4.8,
    reviews: 890,
    descripcion: "Servicio de transporte privado desde/hacia todos los aeropuertos. Vehículos premium, WiFi a bordo.",
    serviciosList: ["Aeropuerto", "Excursiones", "Eventos", "24/7"],
    verificado: true,
    icon: Car,
  },
  {
    id: "chef-privado",
    nombre: "Chef Privado a Domicilio",
    proveedor: "Sabores RD",
    imagen: gastronomy,
    categoria: "Gastronomía",
    precio: "Desde US$ 200",
    ubicacion: "Punta Cana / Santo Domingo",
    rating: 4.9,
    reviews: 145,
    descripcion: "Experiencia gastronómica con chef privado en tu villa o hotel. Menú personalizado con productos locales.",
    serviciosList: ["Cena privada", "Clase de cocina", "BBQ playa", "Maridaje"],
    verificado: true,
    icon: UtensilsCrossed,
  },
  {
    id: "guia-cultural",
    nombre: "Guías Culturales Certificados",
    proveedor: "Cultura Viva RD",
    imagen: santoDomingo,
    categoria: "Guías",
    precio: "Desde US$ 50",
    ubicacion: "Santo Domingo",
    rating: 4.7,
    reviews: 330,
    descripcion: "Recorridos culturales por la Zona Colonial, museos e historia dominicana con guías expertos.",
    serviciosList: ["Zona Colonial", "Museos", "Arte urbano", "Nocturno"],
    verificado: true,
    icon: Compass,
  },
  {
    id: "musica-eventos",
    nombre: "Música en Vivo para Eventos",
    proveedor: "Merengue Live",
    imagen: colonialDoor,
    categoria: "Entretenimiento",
    precio: "Desde US$ 300",
    ubicacion: "Nacional",
    rating: 4.8,
    reviews: 110,
    descripcion: "Grupos de merengue, bachata y música típica para bodas, fiestas y eventos corporativos.",
    serviciosList: ["Merengue", "Bachata", "Típico", "DJ"],
    verificado: false,
    icon: Music,
  },
];

// ─── Directorio de Negocios ─────────────────────────────────────────
const negocios = [
  {
    id: "casa-larimar",
    nombre: "Casa del Larimar",
    tipo: "Joyería & Museo",
    imagen: colonialDoor,
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    reviews: 1200,
    horario: "Lun-Sáb 9:00 - 18:00",
    telefono: "+1 809-689-6605",
    website: "casadellarimar.com",
    descripcion: "Museo y tienda de larimar más grande del país. Joyería fina, réplicas arqueológicas y souvenirs premium.",
    categorias: ["Joyería", "Museo", "Souvenirs"],
    verificado: true,
  },
  {
    id: "chocolate-factory",
    nombre: "Choco Museo Santo Domingo",
    tipo: "Fábrica & Tienda",
    imagen: gastronomy,
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.7,
    reviews: 890,
    horario: "Todos los días 10:00 - 20:00",
    telefono: "+1 809-222-3333",
    website: "chocomuseo.com",
    descripcion: "Fábrica de chocolate artesanal con tours, talleres de elaboración y tienda de productos de cacao.",
    categorias: ["Chocolate", "Tours", "Talleres"],
    verificado: true,
  },
  {
    id: "blue-mall",
    nombre: "Blue Mall Punta Cana",
    tipo: "Centro Comercial",
    imagen: puntaCana,
    ubicacion: "Bávaro, Punta Cana",
    rating: 4.5,
    reviews: 2100,
    horario: "Todos los días 10:00 - 22:00",
    telefono: "+1 809-455-1010",
    website: "bluemall.com.do",
    descripcion: "Centro comercial de lujo con tiendas internacionales, restaurantes gourmet y entertainment.",
    categorias: ["Shopping", "Gastronomía", "Entretenimiento"],
    verificado: true,
  },
  {
    id: "mercado-modelo",
    nombre: "Mercado Modelo",
    tipo: "Mercado Tradicional",
    imagen: santoDomingo,
    ubicacion: "Santo Domingo",
    rating: 4.3,
    reviews: 3500,
    horario: "Lun-Sáb 8:00 - 18:00",
    telefono: "+1 809-686-6972",
    website: "",
    descripcion: "El mercado de artesanías más famoso de RD. Pintura, ámbar, larimar, ron, tabaco y souvenirs.",
    categorias: ["Artesanías", "Souvenirs", "Cultura"],
    verificado: true,
  },
  {
    id: "tabacalera-santiago",
    nombre: "Tabacalera La Aurora",
    tipo: "Fábrica & Tienda",
    imagen: adventureImg,
    ubicacion: "Santiago de los Caballeros",
    rating: 4.9,
    reviews: 760,
    horario: "Lun-Vie 9:00 - 17:00",
    telefono: "+1 809-241-1111",
    website: "laaurora.com.do",
    descripcion: "La fábrica de cigarros más antigua del Caribe (1903). Tours guiados, museo del tabaco y tienda.",
    categorias: ["Tabaco", "Tours", "Museo"],
    verificado: true,
  },
  {
    id: "mamey-libreria",
    nombre: "Mamey Librería & Café",
    tipo: "Librería Cultural",
    imagen: colonialDoor,
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    reviews: 540,
    horario: "Todos los días 9:00 - 21:00",
    telefono: "+1 809-333-4444",
    website: "mameylibreria.com",
    descripcion: "Librería independiente con café artesanal. Libros sobre cultura dominicana, arte y eventos literarios.",
    categorias: ["Libros", "Café", "Cultura"],
    verificado: false,
  },
];

const categoriasProductos = ["Todos", "Joyería", "Gastronomía", "Bebidas", "Arte", "Artesanía", "Tabaco"];
const categoriasServicios = ["Todos", "Tours", "Fotografía", "Transporte", "Gastronomía", "Guías", "Entretenimiento"];
const categoriasNegocios = ["Todos", "Joyería", "Chocolate", "Shopping", "Artesanías", "Tabaco", "Libros"];

export default function Marketplace() {
  const [searchProd, setSearchProd] = useState("");
  const [searchServ, setSearchServ] = useState("");
  const [searchNeg, setSearchNeg] = useState("");
  const [catProd, setCatProd] = useState("Todos");
  const [catServ, setCatServ] = useState("Todos");
  const [catNeg, setCatNeg] = useState("Todos");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; type: string; price: number; image?: string; } | null>(null);

  // International Shipping & Detail Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [shippingDest, setShippingDest] = useState<"Local" | "USA" | "Spain" | "Canada">("Local");

  // Artisan Chat Simulation State
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedArtisano, setSelectedArtisano] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleOpenCheckout = (item: any) => {
    setSelectedItem(item);
    setCheckoutOpen(true);
  };

  const handleOpenProductModal = (product: any) => {
    setSelectedProduct(product);
    setShippingDest("Local");
    setProductModalOpen(true);
  };

  const getShippingFee = (dest: string) => {
    if (dest === "USA") return 15;
    if (dest === "Spain") return 22;
    if (dest === "Canada") return 25;
    return 0; // Local
  };

  const handleProceedToCheckout = () => {
    if (!selectedProduct) return;
    setProductModalOpen(false);
    handleOpenCheckout({
      id: selectedProduct.id,
      name: `${selectedProduct.nombre} (Envío: ${shippingDest})`,
      type: "producto",
      price: parsePrice(selectedProduct.precio) + getShippingFee(shippingDest),
      image: selectedProduct.imagen
    });
  };

  const handleOpenChat = (artesano: any) => {
    setSelectedArtisano(artesano);
    setChatHistory([]);
    setChatOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage("");

    // Simulate artisan response after 1s
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        `¡Hola! Recibimos tu mensaje en el Taller. Estaremos encantados de ayudarte con tu consulta sobre "${userMsg.substring(0, 15)}...". Nos pondremos en contacto contigo en breve para darte precios y detalles de envío local e internacional. ¡Gracias por apoyar lo local!`
      ]);
    }, 1000);
  };

  const parsePrice = (priceStr: string) => {
    const match = priceStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 25;
  };

  const filteredProd = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(searchProd.toLowerCase()) || p.vendedor.toLowerCase().includes(searchProd.toLowerCase());
    const matchCat = catProd === "Todos" || p.categoria === catProd;
    return matchSearch && matchCat;
  });

  const filteredServ = servicios.filter((s) => {
    const matchSearch = s.nombre.toLowerCase().includes(searchServ.toLowerCase()) || s.proveedor.toLowerCase().includes(searchServ.toLowerCase());
    const matchCat = catServ === "Todos" || s.categoria === catServ;
    return matchSearch && matchCat;
  });

  const filteredNeg = negocios.filter((n) => {
    const matchSearch = n.nombre.toLowerCase().includes(searchNeg.toLowerCase());
    const matchCat = catNeg === "Todos" || n.categorias.some(c => c === catNeg);
    return matchSearch && matchCat;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Marketplace Dominicano - Productos, Servicios y Negocios"
        description="Compra productos artesanales dominicanos, contrata servicios turísticos y descubre negocios locales. Larimar, café, ron, tours y más."
        keywords="marketplace dominicano, productos artesanales RD, servicios turísticos, directorio negocios dominicanos"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <ShoppingBag className="h-3 w-3 mr-1" /> Marketplace
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Marketplace <span className="text-primary">Dominicano</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Descubre productos artesanales auténticos, contrata servicios turísticos verificados y explora el directorio de negocios locales.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: Package, label: "Productos", value: "200+" },
                { icon: Compass, label: "Servicios", value: "80+" },
                { icon: Store, label: "Negocios", value: "150+" },
                { icon: Shield, label: "Verificados", value: "85%" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
                  <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="productos" className="w-full">
              <TabsList className="grid w-full max-w-xl mx-auto grid-cols-4 mb-8">
                <TabsTrigger value="productos" className="gap-1.5 text-xs sm:text-sm">
                  <ShoppingBag className="h-4 w-4" /> Productos
                </TabsTrigger>
                <TabsTrigger value="servicios" className="gap-1.5 text-xs sm:text-sm">
                  <Compass className="h-4 w-4" /> Servicios
                </TabsTrigger>
                <TabsTrigger value="artesanos" className="gap-1.5 text-xs sm:text-sm">
                  <Paintbrush className="h-4 w-4" /> Artesanos
                </TabsTrigger>
                <TabsTrigger value="directorio" className="gap-1.5 text-xs sm:text-sm">
                  <Building2 className="h-4 w-4" /> Directorio
                </TabsTrigger>
              </TabsList>

              {/* ═══ TAB: PRODUCTOS ═══ */}
              <TabsContent value="productos">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar productos o vendedores..."
                      value={searchProd}
                      onChange={(e) => setSearchProd(e.target.value)}
                      className="pl-12 h-12 bg-card border-border"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {categoriasProductos.map((cat) => (
                      <Button key={cat} variant={catProd === cat ? "default" : "outline"} size="sm" onClick={() => setCatProd(cat)} className="whitespace-nowrap">
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProd.map((p) => (
                    <Card key={p.id} className="group overflow-hidden border-border hover:shadow-xl transition-all">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {p.verificado && (
                          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> Verificado
                          </Badge>
                        )}
                        <FavoriteButton id={p.id} type="destino" name={p.nombre} image={p.imagen} className="absolute top-3 right-3" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-base font-bold text-white line-clamp-1">{p.nombre}</h3>
                          <p className="text-white/80 text-xs">{p.vendedor}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.descripcion}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {p.tags.map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {p.rating}</span>
                          <span>({p.reviews})</span>
                          <span className="flex items-center gap-1 ml-auto"><MapPin className="h-3 w-3" /> {p.ubicacion}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">{p.precio}</span>
                          <div className="flex items-center gap-1.5">
                            {p.envio && (
                              <Badge variant="secondary" className="text-[10px] gap-1 hidden sm:flex">
                                <Truck className="h-3 w-3" /> Envío
                              </Badge>
                            )}
                            <Button size="sm" onClick={() => handleOpenProductModal(p)}>Comprar</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredProd.length === 0 && <EmptyState text="No se encontraron productos" onClear={() => { setSearchProd(""); setCatProd("Todos"); }} />}
              </TabsContent>

              {/* ═══ TAB: SERVICIOS ═══ */}
              <TabsContent value="servicios">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar servicios o proveedores..."
                      value={searchServ}
                      onChange={(e) => setSearchServ(e.target.value)}
                      className="pl-12 h-12 bg-card border-border"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {categoriasServicios.map((cat) => (
                      <Button key={cat} variant={catServ === cat ? "default" : "outline"} size="sm" onClick={() => setCatServ(cat)} className="whitespace-nowrap">
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredServ.map((s) => (
                    <Card key={s.id} className="group overflow-hidden border-border hover:shadow-xl transition-all">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={s.imagen} alt={s.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        {s.verificado && (
                          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> Verificado
                          </Badge>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-bold text-white">{s.nombre}</h3>
                          <p className="text-white/80 text-sm">{s.proveedor}</p>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <Badge variant="outline" className="mb-2">{s.categoria}</Badge>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{s.descripcion}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {s.serviciosList.map((item) => (
                            <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {s.rating}</span>
                          <span>({s.reviews} reseñas)</span>
                          <span className="flex items-center gap-1 ml-auto"><MapPin className="h-3 w-3" /> {s.ubicacion}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">{s.precio}</span>
                          <Button size="sm" className="gap-1" onClick={() => handleOpenCheckout({
                            id: s.id,
                            name: s.nombre,
                            type: "servicio",
                            price: parsePrice(s.precio),
                            image: s.imagen
                          })}>
                            Reservar <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredServ.length === 0 && <EmptyState text="No se encontraron servicios" onClear={() => { setSearchServ(""); setCatServ("Todos"); }} />}
              </TabsContent>

              {/* ═══ TAB: ARTESANOS DIRECTO ═══ */}
              <TabsContent value="artesanos">
                <div className="grid md:grid-cols-3 gap-8">
                  {artesanos.map((art) => (
                    <Card key={art.id} className="group overflow-hidden border-border hover:shadow-xl transition-all bg-card/45 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img src={art.imagen} alt={art.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> Taller Verificado
                          </Badge>
                          <Badge className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm border-white/10 text-[9px] uppercase font-bold tracking-wider">
                            {art.especialidad}
                          </Badge>
                        </div>

                        <div className="p-5 pt-0 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{art.ubicacion}</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-foreground">{art.nombre}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{art.bio}</p>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <Button variant="outline" className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => handleOpenChat(art)}>
                          <Phone className="h-4 w-4" /> Chat Directo
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ═══ TAB: DIRECTORIO ═══ */}
              <TabsContent value="directorio">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar negocios..."
                      value={searchNeg}
                      onChange={(e) => setSearchNeg(e.target.value)}
                      className="pl-12 h-12 bg-card border-border"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {categoriasNegocios.map((cat) => (
                      <Button key={cat} variant={catNeg === cat ? "default" : "outline"} size="sm" onClick={() => setCatNeg(cat)} className="whitespace-nowrap">
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredNeg.map((n) => (
                    <Card key={n.id} className="group overflow-hidden border-border hover:shadow-xl transition-all">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img src={n.imagen} alt={n.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        {n.verificado && (
                          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> Verificado
                          </Badge>
                        )}
                        <Badge variant="secondary" className="absolute top-3 right-3">{n.tipo}</Badge>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-bold text-white">{n.nombre}</h3>
                          <p className="text-white/80 text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {n.ubicacion}</p>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{n.descripcion}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {n.categorias.map((c) => (
                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {n.rating}</span>
                          <span>({n.reviews.toLocaleString()} reseñas)</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                          <p className="flex items-center gap-2"><Clock className="h-3 w-3 text-primary" /> {n.horario}</p>
                          <p className="flex items-center gap-2"><Phone className="h-3 w-3 text-primary" /> {n.telefono}</p>
                          {n.website && (
                            <p className="flex items-center gap-2"><Globe className="h-3 w-3 text-primary" /> {n.website}</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="w-full gap-1">
                          Ver detalles <ChevronRight className="h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredNeg.length === 0 && <EmptyState text="No se encontraron negocios" onClear={() => { setSearchNeg(""); setCatNeg("Todos"); }} />}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA - Únete */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Package, title: "Vende tus productos", desc: "¿Produces artesanías, café, ron o arte? Publica tus productos y llega a miles de turistas.", cta: "Publicar producto" },
                { icon: Compass, title: "Ofrece tus servicios", desc: "¿Eres guía, fotógrafo o tienes un tour? Únete al marketplace y consigue más clientes.", cta: "Publicar servicio" },
                { icon: Store, title: "Registra tu negocio", desc: "¿Tienes una tienda, restaurante o atracción? Aparece en nuestro directorio verificado.", cta: "Registrar negocio" },
              ].map((item) => (
                <div key={item.title} className="bg-background rounded-xl p-6 border border-border text-center hover:border-primary/30 transition-colors">
                  <item.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                  <Button variant="outline" size="sm" className="gap-1">
                    {item.cta} <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 text-center">
              {[
                { icon: Shield, text: "Vendedores verificados" },
                { icon: Truck, text: "Envío internacional" },
                { icon: Award, text: "Productos auténticos" },
                { icon: Heart, text: "Apoyo a comunidades" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="h-5 w-5 text-primary" />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />

        <CheckoutModal 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          item={selectedItem} 
        />

        {/* Product Details & Shipping Selector Modal */}
        <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">Detalle del Producto</DialogTitle>
              <DialogDescription className="text-xs">Configure su envío internacional antes de comprar.</DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4 pt-2">
                <div className="aspect-[16/10] overflow-hidden rounded-lg">
                  <img src={selectedProduct.imagen} alt={selectedProduct.nombre} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedProduct.nombre}</h3>
                  <p className="text-xs text-muted-foreground">Por: {selectedProduct.vendedor} • {selectedProduct.ubicacion}</p>
                  <p className="text-xs text-foreground mt-2 leading-relaxed">{selectedProduct.descripcion}</p>
                </div>

                {/* Shipping Selector */}
                <div className="space-y-2 p-4 bg-muted/40 border border-border rounded-lg">
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">País de Envío</label>
                  <select
                    value={shippingDest}
                    onChange={(e) => setShippingDest(e.target.value as any)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                    title="País de Envío"
                  >
                    <option value="Local">República Dominicana (Local) - Gratis</option>
                    <option value="USA">Estados Unidos (USA) - +$15.00 USD</option>
                    <option value="Spain">España / Europa - +$22.00 USD</option>
                    <option value="Canada">Canadá - +$25.00 USD</option>
                  </select>
                  
                  <div className="flex justify-between items-baseline text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <span>Precio base:</span>
                    <span className="font-mono">${parsePrice(selectedProduct.precio).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                    <span>Costo de envío:</span>
                    <span className="font-mono">${getShippingFee(shippingDest).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm font-bold text-primary pt-1.5 border-t border-border">
                    <span>Subtotal:</span>
                    <span className="font-mono">${(parsePrice(selectedProduct.precio) + getShippingFee(shippingDest)).toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setProductModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={handleProceedToCheckout}>
                    Proceder al Pago <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Artisan Chat Simulation Modal */}
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="sm:max-w-[420px] h-[500px] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-2 border-b border-border">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                {selectedArtisano?.nombre}
              </DialogTitle>
              <DialogDescription className="text-[10px]">Chat simulado directo con el taller artesanal.</DialogDescription>
            </DialogHeader>
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 flex flex-col justify-end">
              <div className="bg-muted text-foreground p-3 rounded-lg text-xs max-w-[85%] self-start leading-normal">
                ¡Hola! Bienvenido al chat de <strong>{selectedArtisano?.nombre}</strong>. Cuéntame, ¿estás interesado en alguna pieza de {selectedArtisano?.especialidad} o te gustaría cotizar un diseño personalizado?
              </div>
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex flex-col ${i % 2 === 0 ? "items-end" : "items-start"}`}>
                  <div className={`p-3 rounded-lg text-xs max-w-[85%] leading-normal ${
                    i % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {msg}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
              <Input
                type="text"
                placeholder="Escribe tu consulta aquí..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 text-xs"
                title="Mensaje para el artesano"
              />
              <Button type="submit" size="sm" className="font-bold text-xs px-3">
                Enviar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}

function EmptyState({ text, onClear }: { text: string; onClear: () => void }) {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">{text}</p>
      <Button variant="outline" className="mt-4" onClick={onClear}>Limpiar filtros</Button>
    </div>
  );
}
