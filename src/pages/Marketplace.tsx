import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { CheckoutModal } from "@/components/CheckoutModal";
import { artesanos, productos, servicios, type Artesano, type Producto, type Servicio } from "@/data/marketplaceData";
import { ProductDetailModal, parsePrice, getShippingFee, type ShippingDestination } from "@/components/marketplace/ProductDetailModal";
import { ArtisanChatModal } from "@/components/marketplace/ArtisanChatModal";
import { MarketplaceCatalog } from "@/features/marketplace/MarketplaceCatalog";
import { VendorProfile } from "@/features/marketplace/VendorProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Users } from "lucide-react";

export default function Marketplace() {
  const [searchProd, setSearchProd] = useState("");
  const [searchServ, setSearchServ] = useState("");
  const [catProd, setCatProd] = useState("Todos");
  const [catServ, setCatServ] = useState("Todos");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; type: string; price: number; image?: string } | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [shippingDest, setShippingDest] = useState<ShippingDestination>("Local");

  const [chatOpen, setChatOpen] = useState(false);
  const [selectedArtisano, setSelectedArtisano] = useState<Artesano | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleOpenCheckout = (item: { id: string; name: string; type: string; price: number; image?: string }) => {
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
      image: selectedProduct.imagen,
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
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        `¡Hola! Recibimos tu mensaje en el Taller. Estaremos encantados de ayudarte con tu consulta sobre "${userMsg.substring(0, 15)}...". Nos pondremos en contacto contigo en breve. ¡Gracias por apoyar lo local!`,
      ]);
    }, 1000);
  };

  const filteredProd = productos.filter((p) => {
    const matchCat = catProd === "Todos" || p.categoria === catProd;
    const matchSearch = p.nombre.toLowerCase().includes(searchProd.toLowerCase()) || p.vendedor.toLowerCase().includes(searchProd.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredServ = servicios.filter((s) => {
    const matchCat = catServ === "Todos" || s.categoria === catServ;
    const matchSearch = s.nombre.toLowerCase().includes(searchServ.toLowerCase()) || s.proveedor.toLowerCase().includes(searchServ.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Marketplace Turístico & Artesanal | Descubre República Dominicana"
        description="Mercado oficial de productos criollos, artesanía certificada de larimar y ámbar, dulces tradicionales, café orgánico y excursiones locales."
      />
      <Header />

      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-7xl space-y-8">
          {/* Hero Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Marketplace Turístico RD
            </h1>
            <p className="text-base text-muted-foreground">
              Mercado directo de artesanos, productores y experiencias locales auténticas de la República Dominicana.
            </p>
          </div>

          <Tabs defaultValue="catalog" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="catalog" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Catálogo Principal
              </TabsTrigger>
              <TabsTrigger value="vendors" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Artesanos & Talleres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="catalog">
              <MarketplaceCatalog
                products={filteredProd}
                services={filteredServ}
                searchProd={searchProd}
                setSearchProd={setSearchProd}
                catProd={catProd}
                setCatProd={setCatProd}
                searchServ={searchServ}
                setSearchServ={setSearchServ}
                catServ={catServ}
                setCatServ={setCatServ}
                onOpenProductModal={handleOpenProductModal}
                onReserveServicio={handleReserveServicio}
              />
            </TabsContent>

            <TabsContent value="vendors">
              <VendorProfile artesanos={artesanos} onOpenChat={handleOpenChat} />
            </TabsContent>
          </Tabs>

          {/* Modales */}
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
      </main>

      <Footer />
    </PageTransition>
  );
}
