import { Producto, Servicio } from "@/data/marketplaceData";
import { ProductosTab } from "@/components/marketplace/ProductosTab";
import { ServiciosTab } from "@/components/marketplace/ServiciosTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Package } from "lucide-react";

interface MarketplaceCatalogProps {
  products: Producto[];
  services: Servicio[];
  searchProd: string;
  setSearchProd: (v: string) => void;
  catProd: string;
  setCatProd: (v: string) => void;
  searchServ: string;
  setSearchServ: (v: string) => void;
  catServ: string;
  setCatServ: (v: string) => void;
  onOpenProductModal: (p: Producto) => void;
  onReserveServicio: (s: Servicio) => void;
}

export function MarketplaceCatalog({
  products,
  services,
  searchProd,
  setSearchProd,
  catProd,
  setCatProd,
  searchServ,
  setSearchServ,
  catServ,
  setCatServ,
  onOpenProductModal,
  onReserveServicio,
}: MarketplaceCatalogProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="productos" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Productos ({products.length})
          </TabsTrigger>
          <TabsTrigger value="servicios" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Servicios ({services.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productos">
          <ProductosTab
            productos={products}
            search={searchProd}
            onSearchChange={setSearchProd}
            category={catProd}
            onCategoryChange={setCatProd}
            onBuy={onOpenProductModal}
          />
        </TabsContent>

        <TabsContent value="servicios">
          <ServiciosTab
            servicios={services}
            search={searchServ}
            onSearchChange={setSearchServ}
            category={catServ}
            onCategoryChange={setCatServ}
            onReserve={onReserveServicio}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
