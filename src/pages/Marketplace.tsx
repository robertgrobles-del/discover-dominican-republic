import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import {
  ShoppingBag, Paintbrush, Package, Truck, Shield, Phone,
  Compass, Store, Building2, Award, Heart, ChevronRight,
} from "lucide-react";
import { artesanos, productos, servicios, negocios, type Artesano, type Producto, type Servicio } from "@/data/marketplaceData";
import { ProductosTab } from "@/components/marketplace/ProductosTab";
import { ServiciosTab } from "@/components/marketplace/ServiciosTab";
import { ArtesanosTab } from "@/components/marketplace/ArtesanosTab";
import { DirectorioTab } from "@/components/marketplace/DirectorioTab";
import { ProductDetailModal, parsePrice, getShippingFee, type ShippingDestination } from "@/components/marketplace/ProductDetailModal";
import { ArtisanChatModal } from "@/components/marketplace/ArtisanChatModal";

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
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [shippingDest, setShippingDest] = useState<ShippingDestination>("Local");

  // Artisan Chat Simulation State
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedArtisano, setSelectedArtisano] = useState<Artesano | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleOpenCheckout = (item: { id: string; name: string; type: string; price: number; image?: string; }) => {
    setSelectedItem(item);
    setCheckoutOpen(true);
  };

  const handleOpenProductModal = (product: Producto) => {
    setSelectedProduct(product);
    setShippingDest("Local");
    setProductModalOpen(true);
  };

  const handleReserveServicio = (s: Servicio) => {
    handleOpenCheckout({
      id: s.id,
      name: s.nombre,
      type: "servicio",
      price: parsePrice(s.precio),
      image: s.imagen,
    });
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

  const handleOpenChat = (artesano: Artesano) => {
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

              <TabsContent value="productos">
                <ProductosTab
                  productos={filteredProd}
                  search={searchProd}
                  onSearchChange={setSearchProd}
                  category={catProd}
                  onCategoryChange={setCatProd}
                  onBuy={handleOpenProductModal}
                />
              </TabsContent>

              <TabsContent value="servicios">
                <ServiciosTab
                  servicios={filteredServ}
                  search={searchServ}
                  onSearchChange={setSearchServ}
                  category={catServ}
                  onCategoryChange={setCatServ}
                  onReserve={handleReserveServicio}
                />
              </TabsContent>

              <TabsContent value="artesanos">
                <ArtesanosTab artesanos={artesanos} onChat={handleOpenChat} />
              </TabsContent>

              <TabsContent value="directorio">
                <DirectorioTab
                  negocios={filteredNeg}
                  search={searchNeg}
                  onSearchChange={setSearchNeg}
                  category={catNeg}
                  onCategoryChange={setCatNeg}
                />
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

        <ProductDetailModal
          open={productModalOpen}
          onOpenChange={setProductModalOpen}
          product={selectedProduct}
          shippingDest={shippingDest}
          onShippingDestChange={setShippingDest}
          onProceedToCheckout={handleProceedToCheckout}
        />

        <ArtisanChatModal
          open={chatOpen}
          onOpenChange={setChatOpen}
          artesano={selectedArtisano}
          chatHistory={chatHistory}
          chatMessage={chatMessage}
          onChatMessageChange={setChatMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </PageTransition>
  );
}
