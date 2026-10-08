import { useState } from "react";
import { 
  ShoppingBag, 
  Store, 
  Package, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Truck, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Tag, 
  Percent,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string;
  vendor: string;
  priceDop: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock";
  imageUrl: string;
  salesCount: number;
  isArtisan: boolean;
  province: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  vendor: string;
  itemsCount: number;
  totalDop: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  escrowStatus: "held" | "released" | "disputed";
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Muñeca Limé de Cerámica Pintada a Mano",
    category: "Artesanía y Cerámica",
    vendor: "Artesanías Don Ramón",
    priceDop: 1850,
    stock: 45,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&fit=crop",
    salesCount: 128,
    isArtisan: true,
    province: "Santiago"
  },
  {
    id: "prod-2",
    name: "Café Especial de Altura Jarabacoa (500g)",
    category: "Gastronomía Típica",
    vendor: "Cafetales del Yaque",
    priceDop: 750,
    stock: 120,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&fit=crop",
    salesCount: 340,
    isArtisan: true,
    province: "La Vega"
  },
  {
    id: "prod-3",
    name: "Colgante de Larimar Natural en Plata 925",
    category: "Joyería Autóctona",
    vendor: "Joyas Bahoruco",
    priceDop: 4200,
    stock: 15,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&fit=crop",
    salesCount: 82,
    isArtisan: true,
    province: "Barahona"
  },
  {
    id: "prod-4",
    name: "Gorra Oficial Bordada Descubre RD",
    category: "Merchandising Oficial",
    vendor: "Descubre RD Store",
    priceDop: 950,
    stock: 200,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&fit=crop",
    salesCount: 512,
    isArtisan: false,
    province: "Santo Domingo"
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-9481",
    customerName: "Camila De León",
    customerEmail: "camiladl@gmail.com",
    vendor: "Joyas Bahoruco",
    itemsCount: 1,
    totalDop: 4200,
    status: "processing",
    createdAt: "2026-10-06 18:24",
    escrowStatus: "held"
  },
  {
    id: "ORD-9480",
    customerName: "Michael Miller",
    customerEmail: "mmiller.travel@nyu.edu",
    vendor: "Artesanías Don Ramón",
    itemsCount: 2,
    totalDop: 3700,
    status: "shipped",
    createdAt: "2026-10-06 14:10",
    escrowStatus: "held"
  },
  {
    id: "ORD-9479",
    customerName: "José Almonte",
    customerEmail: "jalmonte@claro.com.do",
    vendor: "Cafetales del Yaque",
    itemsCount: 3,
    totalDop: 2250,
    status: "delivered",
    createdAt: "2026-10-05 11:05",
    escrowStatus: "released"
  }
];

export function AdminStoreMarketplace() {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "vendors">("overview");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Formulario nuevo producto
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Artesanía y Cerámica");
  const [newProdVendor, setNewProdVendor] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdProvince, setNewProdProvince] = useState("Santo Domingo");
  const [newProdIsArtisan, setNewProdIsArtisan] = useState(true);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdVendor) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    const created: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      vendor: newProdVendor,
      priceDop: Number(newProdPrice),
      stock: Number(newProdStock || 10),
      status: "active",
      imageUrl: newProdImage || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&fit=crop",
      salesCount: 0,
      isArtisan: newProdIsArtisan,
      province: newProdProvince
    };

    setProducts([created, ...products]);
    setShowAddProductModal(false);
    toast.success("Producto publicado en el Marketplace exitosamente");

    // Limpiar form
    setNewProdName("");
    setNewProdPrice("");
    setNewProdVendor("");
    setNewProdStock("");
    setNewProdImage("");
  };

  const handleReleaseEscrow = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, escrowStatus: "released" } : o));
    toast.success(`Fondos en custodia de la orden ${orderId} liberados al artesano/vendedor`);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-foreground">
              Tienda Oficial y Marketplace de Artesanos
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control de productos autóctonos, pedidos, custodia de pagos (Escrow) y artesanos de República Dominicana.
          </p>
        </div>

        <Button
          onClick={() => setShowAddProductModal(true)}
          className="rounded-2xl gap-2 font-bold shadow-md shadow-primary/20 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" /> Agregar Nuevo Producto
        </Button>
      </div>

      {/* Tabs Principales */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-xl h-11 bg-muted/60 p-1 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl text-xs font-bold">
            Productos ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl text-xs font-bold">
            Órdenes ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="vendors" className="rounded-xl text-xs font-bold">
            Vendedores / Artesanos
          </TabsTrigger>
        </TabsList>

        {/* ===================== TAB 1: RESUMEN / KPIS ===================== */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-3xl border-border/70 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Ventas Totales</span>
                  <h3 className="text-2xl font-black text-foreground mt-1">RD$ 284,350</h3>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +14.2% este mes
                  </span>
                </div>
                <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Pedidos Realizados</span>
                  <h3 className="text-2xl font-black text-foreground mt-1">1,062</h3>
                  <span className="text-[11px] text-muted-foreground font-medium mt-1 block">
                    98.4% entregados con éxito
                  </span>
                </div>
                <div className="p-3.5 bg-sky-500/10 text-sky-600 rounded-2xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">En Custodia (Escrow)</span>
                  <h3 className="text-2xl font-black text-foreground mt-1">RD$ 7,900</h3>
                  <span className="text-[11px] text-amber-600 font-bold mt-1 block">
                    2 órdenes pendientes de entrega
                  </span>
                </div>
                <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Artesanos Registrados</span>
                  <h3 className="text-2xl font-black text-foreground mt-1">48 Creadores</h3>
                  <span className="text-[11px] text-muted-foreground font-medium mt-1 block">
                    En 14 provincias del país
                  </span>
                </div>
                <div className="p-3.5 bg-purple-500/10 text-purple-600 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Pedidos Recientes y Productos Top */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 rounded-3xl border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Últimos Pedidos del Marketplace</CardTitle>
                <CardDescription className="text-xs">Monitoreo de pagos y despacho en tiempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/40">
                  {orders.map((ord) => (
                    <div key={ord.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-muted rounded-xl">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-foreground block">{ord.id}</span>
                          <span className="text-[11px] text-muted-foreground">{ord.customerName} • {ord.vendor}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-xs text-foreground block">RD$ {ord.totalDop.toLocaleString()}</span>
                        <div className="flex items-center gap-1.5 justify-end mt-0.5">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                            {ord.status}
                          </Badge>
                          {ord.escrowStatus === "held" ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] py-0">
                              Custodia
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0">
                              Liberado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Categorías Más Vendidas</CardTitle>
                <CardDescription className="text-xs">Rendimiento por tipo de producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Gastronomía (Café/Cacao)", share: "42%", count: "480 pedidos" },
                  { name: "Joyería (Larimar/Ámbar)", share: "30%", count: "310 pedidos" },
                  { name: "Artesanías & Cerámica", share: "18%", count: "192 pedidos" },
                  { name: "Merchandising Descubre RD", share: "10%", count: "80 pedidos" }
                ].map((cat, i) => (
                  <div key={i} className="p-3 bg-muted/40 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{cat.name}</h4>
                      <span className="text-[10px] text-muted-foreground">{cat.count}</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary font-bold text-xs">
                      {cat.share}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===================== TAB 2: PRODUCTOS ===================== */}
        <TabsContent value="products" className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por producto, artesano o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-2xl text-xs bg-card"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {filteredProducts.length} productos en catálogo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => (
              <Card key={prod.id} className="rounded-3xl border-border/80 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                <div className="relative h-44 overflow-hidden bg-muted">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                  {prod.isArtisan && (
                    <Badge className="absolute top-2.5 left-2.5 bg-amber-500 text-white font-bold text-[10px]">
                      Hecho en RD 🇩🇴
                    </Badge>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/75 backdrop-blur-xs text-white rounded-xl text-xs font-black">
                    RD$ {prod.priceDop.toLocaleString()}
                  </span>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase block">
                      {prod.category}
                    </span>
                    <h4 className="font-bold text-sm text-foreground leading-tight mt-0.5 line-clamp-2">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por: <strong>{prod.vendor}</strong> ({prod.province})
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Stock: <strong className="text-foreground">{prod.stock} unids.</strong>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {prod.salesCount} vendidos
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===================== TAB 3: ÓRDENES Y CUSTODIA (ESCROW) ===================== */}
        <TabsContent value="orders" className="space-y-4 pt-4">
          <Card className="rounded-3xl border-border/80 overflow-hidden">
            <CardHeader className="p-5 bg-muted/20 border-b border-border/60">
              <CardTitle className="text-base font-bold">Gestión de Órdenes y Custodia de Fondos (Escrow)</CardTitle>
              <CardDescription className="text-xs">
                Los fondos se retienen de forma segura hasta que el comprador recibe el producto o se confirma el envío.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted/40 uppercase font-bold text-muted-foreground tracking-wider border-b border-border/60">
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Vendedor / Artesano</th>
                    <th className="py-3 px-4">Monto Total</th>
                    <th className="py-3 px-4">Estado Entrega</th>
                    <th className="py-3 px-4">Custodia (Escrow)</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">{ord.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground block">{ord.customerName}</span>
                        <span className="text-[10px] text-muted-foreground">{ord.customerEmail}</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground">{ord.vendor}</td>
                      <td className="py-3.5 px-4 font-black text-foreground">RD$ {ord.totalDop.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.escrowStatus === "held" ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                            Retenido en Escrow
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                            Liberado al Vendedor
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ord.escrowStatus === "held" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReleaseEscrow(ord.id)}
                            className="rounded-xl h-8 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10"
                          >
                            Liberar Fondos
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 4: VENDEDORES / ARTESANOS ===================== */}
        <TabsContent value="vendors" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Artesanías Don Ramón", province: "Santiago", productsCount: 14, sales: "RD$ 124,000", verified: true },
              { name: "Cafetales del Yaque", province: "La Vega (Jarabacoa)", productsCount: 8, sales: "RD$ 98,200", verified: true },
              { name: "Joyas Bahoruco (Larimar)", province: "Barahona", productsCount: 22, sales: "RD$ 62,150", verified: true }
            ].map((v, i) => (
              <Card key={i} className="rounded-3xl border-border/70 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {v.name}
                      {v.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </h4>
                    <span className="text-xs text-muted-foreground">{v.province}</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold">
                    {v.productsCount} items
                  </Badge>
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ventas acumuladas:</span>
                  <strong className="text-foreground">{v.sales}</strong>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL CREAR NUEVO PRODUCTO (Estilo SalesSync / Odaplace) */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-border shadow-2xl bg-card">
            <CardHeader className="p-6 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Publicar Producto en Marketplace</CardTitle>
                <CardDescription className="text-xs">Completa la ficha técnica del producto o artesanía dominicana</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddProductModal(false)}
                className="rounded-full w-8 h-8 p-0"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground">Nombre del Producto *</label>
                  <Input
                    placeholder="Ej. Cuadro Pintura Taína sobre Caoba"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="mt-1 rounded-xl text-xs h-10"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground">Categoría</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full mt-1 bg-background border border-border rounded-xl px-3 h-10 text-xs font-medium text-foreground focus:outline-hidden"
                    >
                      <option value="Artesanía y Cerámica">Artesanía y Cerámica</option>
                      <option value="Gastronomía Típica">Gastronomía Típica (Café/Cacao/Dulces)</option>
                      <option value="Joyería Autóctona">Joyería Autóctona (Larimar/Ámbar)</option>
                      <option value="Moda y Calzado Local">Moda y Calzado Local</option>
                      <option value="Merchandising Oficial">Merchandising Oficial Descubre RD</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground">Nombre del Artesano / Taller *</label>
                    <Input
                      placeholder="Ej. Taller Hermanos Guillén"
                      value={newProdVendor}
                      onChange={(e) => setNewProdVendor(e.target.value)}
                      className="mt-1 rounded-xl text-xs h-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground">Precio en Pesos (RD$) *</label>
                    <Input
                      type="number"
                      placeholder="1500"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="mt-1 rounded-xl text-xs h-10"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground">Stock Inicial</label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="mt-1 rounded-xl text-xs h-10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground">Provincia de Origen</label>
                    <Input
                      placeholder="Ej. Santo Domingo, La Vega"
                      value={newProdProvince}
                      onChange={(e) => setNewProdProvince(e.target.value)}
                      className="mt-1 rounded-xl text-xs h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">URL de la Imagen Principal</label>
                  <Input
                    placeholder="https://..."
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="mt-1 rounded-xl text-xs h-10"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isArtisan"
                    checked={newProdIsArtisan}
                    onChange={(e) => setNewProdIsArtisan(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="isArtisan" className="text-xs font-medium text-foreground cursor-pointer">
                    Es una artesanía o producto 100% hecho a mano en República Dominicana (Sello MITUR)
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddProductModal(false)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl text-xs font-bold shadow-md shadow-primary/20"
                  >
                    Publicar Producto
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
