import { useState, useEffect } from "react";
import { 
  ShieldCheck, Package, Truck, CheckCircle2, Clock, 
  DollarSign, AlertCircle, Search, ExternalLink, ArrowRight, 
  Lock, RefreshCw, Upload, Building2, UserCheck, FileText, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface EscrowOrder {
  id: string;
  orderNumber: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: string;
  province: string;
  amount: number;
  commission: number;
  netPayout: number;
  status: "held_in_escrow" | "preparing" | "shipped" | "delivered" | "payout_released";
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  payoutDate?: string;
  createdAt: string;
}

export const DEFAULT_ESCROW_ORDERS: EscrowOrder[] = [
  {
    id: "ord-8912",
    orderNumber: "ORD-DR-8912",
    productName: "Collar Artesanal de Larimar y Plata 925",
    buyerName: "Stephanie Morales",
    buyerEmail: "stephanie.m@gmail.com",
    buyerPhone: "809-555-4819",
    shippingAddress: "Torre Bella Vista, Apto 5B, Av. Sarasota",
    province: "Santo Domingo",
    amount: 3200,
    commission: 320,
    netPayout: 2880,
    status: "held_in_escrow",
    createdAt: "2026-09-23T11:30:00Z"
  },
  {
    id: "ord-8874",
    orderNumber: "ORD-DR-8874",
    productName: "Caja de Café Especial Monte Alto Jarabacoa (x3)",
    buyerName: "Michael Vance",
    buyerEmail: "vance.m@travelny.com",
    buyerPhone: "+1 305-555-0192",
    shippingAddress: "Hotel Boutique Zona Colonial, Calle Las Damas",
    province: "Distrito Nacional",
    amount: 2400,
    commission: 240,
    netPayout: 2160,
    status: "shipped",
    carrier: "Metro Pac Express",
    trackingNumber: "MP-8839210",
    shippedAt: "2026-09-22T16:00:00Z",
    createdAt: "2026-09-21T14:15:00Z"
  },
  {
    id: "ord-8710",
    orderNumber: "ORD-DR-8710",
    productName: "Cuadro Pintura Típica Taína al Óleo (60x40cm)",
    buyerName: "Juan Carlos Almonte",
    buyerEmail: "jcalmonte@bhd.com.do",
    buyerPhone: "829-555-9012",
    shippingAddress: "Residencial Las Praderas, Casa #12",
    province: "Santiago",
    amount: 5800,
    commission: 580,
    netPayout: 5220,
    status: "payout_released",
    carrier: "Caribe Tours Envios",
    trackingNumber: "CT-9018492",
    shippedAt: "2026-09-18T10:00:00Z",
    deliveredAt: "2026-09-19T14:30:00Z",
    payoutDate: "2026-09-20T09:00:00Z",
    createdAt: "2026-09-17T09:00:00Z"
  }
];

export function MarketplaceEscrowManager() {
  const [orders, setOrders] = useState<EscrowOrder[]>(DEFAULT_ESCROW_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Tracking upload modal state
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<EscrowOrder | null>(null);
  const [carrier, setCarrier] = useState("Caribe Tours Envíos");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Seller KYC Certification state
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isCertifiedSeller, setIsCertifiedSeller] = useState(true);
  const [rncOrCedula, setRncOrCedula] = useState("131-89421-4");
  const [businessName, setBusinessName] = useState("Artesanías & Sabores Quisqueyanos SRL");

  // Load from local storage
  const loadOrders = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("dr_seller_escrow_orders") || "null");
      if (stored) setOrders(stored);
      else localStorage.setItem("dr_seller_escrow_orders", JSON.stringify(DEFAULT_ESCROW_ORDERS));
    } catch (err) {
      console.error("Error loading escrow orders:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const saveOrders = (updated: EscrowOrder[]) => {
    setOrders(updated);
    localStorage.setItem("dr_seller_escrow_orders", JSON.stringify(updated));
  };

  const handleOpenShipmentModal = (order: EscrowOrder) => {
    setSelectedOrderForShipment(order);
    setCarrier(order.carrier || "Caribe Tours Envíos");
    setTrackingNumber(order.trackingNumber || "");
  };

  const handleSaveShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForShipment || !trackingNumber.trim()) {
      toast.error("Por favor ingresa el número de guía de envío.");
      return;
    }

    const updated = orders.map((o) => {
      if (o.id === selectedOrderForShipment.id) {
        return {
          ...o,
          status: "shipped" as const,
          carrier,
          trackingNumber: trackingNumber.trim(),
          shippedAt: new Date().toISOString()
        };
      }
      return o;
    });

    saveOrders(updated);
    toast.success(`¡Guía de envío ${trackingNumber} registrada con éxito!`, {
      description: "El comprador ha sido notificado para rastrear su paquete."
    });
    setSelectedOrderForShipment(null);
  };

  const handleSimulateDeliveryAndPayout = (orderId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "payout_released" as const,
          deliveredAt: new Date().toISOString(),
          payoutDate: new Date().toISOString()
        };
      }
      return o;
    });

    saveOrders(updated);
    toast.success("¡Entrega comprobada y fondos liberados exitosamente!", {
      description: "El desembolso ha sido acreditado a tu cuenta bancaria registrada."
    });
  };

  const totalHeldInEscrow = orders
    .filter((o) => o.status === "held_in_escrow" || o.status === "shipped")
    .reduce((acc, o) => acc + o.netPayout, 0);

  const totalPayoutsReleased = orders
    .filter((o) => o.status === "payout_released")
    .reduce((acc, o) => acc + o.netPayout, 0);

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Certified Seller Seal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> VENDEDOR CERTIFICADO DESCUBRE RD
            </Badge>
            <Badge variant="outline" className="text-xs">
              Sistema de Pago Protegido (Escrow)
            </Badge>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">
            Gestión de Ventas, Envíos Comprobados & Desembolsos
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Tus fondos son retenidos en custodia segura al procesar el pago del cliente y se liberan automáticamente en tu cuenta bancaria al comprobar la entrega con guía de transporte.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsKycModalOpen(true)}
          className="rounded-xl text-xs gap-1.5 font-bold shrink-0"
        >
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span>Ver Certificación Comercial</span>
        </Button>
      </div>

      {/* Escrow Status Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Fondos en Custodia (Escrow)</span>
            <Lock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 mt-1">
            RD$ {totalHeldInEscrow.toLocaleString()}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Pendiente de entrega / guía comprobada
          </span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Desembolsos Liberados</span>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            RD$ {totalPayoutsReleased.toLocaleString()}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Transferidos a tu cuenta bancaria
          </span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Pedidos Totales</span>
            <Package className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground mt-1">
            {orders.length}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {orders.filter((o) => o.status === "held_in_escrow").length} requieren envío hoy
          </span>
        </Card>
      </div>

      {/* How Escrow Works Infostrip */}
      <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black">
            1
          </div>
          <span><strong>Pago Seguro:</strong> El comprador paga y Descubre RD custodia los fondos.</span>
        </div>
        <div className="hidden md:block text-muted-foreground">➔</div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 font-black">
            2
          </div>
          <span><strong>Envío con Guía:</strong> Empacas el producto y registras la guía de transporte.</span>
        </div>
        <div className="hidden md:block text-muted-foreground">➔</div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-black">
            3
          </div>
          <span><strong>Liberación:</strong> Se verifica la entrega y se deposita tu dinero neto.</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por orden, producto o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl text-xs h-9 bg-background">
              <SelectValue placeholder="Estado de Custodia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Pedidos</SelectItem>
              <SelectItem value="held_in_escrow">🔒 En Custodia (Por Enviar)</SelectItem>
              <SelectItem value="shipped">🚚 Enviado (En Tránsito)</SelectItem>
              <SelectItem value="payout_released">✅ Fondos Liberados</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadOrders}
            className="rounded-xl text-xs h-9 gap-1 text-muted-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-xs text-left text-muted-foreground">
          <thead className="bg-muted text-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border">
            <tr>
              <th className="py-3 px-4">Orden / Fecha</th>
              <th className="py-3 px-4">Producto & Destino</th>
              <th className="py-3 px-3 text-center">Comprador</th>
              <th className="py-3 px-3 text-center">Monto Neto</th>
              <th className="py-3 px-3 text-center">Estado de Custodia</th>
              <th className="py-3 px-4 text-right">Acción de Envío</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-foreground">
                  <span className="font-mono text-xs">{order.orderNumber}</span>
                  <span className="block text-[10px] text-muted-foreground font-normal">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-foreground line-clamp-1">{order.productName}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span>📍 {order.province} • {order.shippingAddress}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-center">
                  <div className="font-semibold text-foreground">{order.buyerName}</div>
                  <div className="text-[10px] text-muted-foreground">{order.buyerPhone}</div>
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="font-mono font-bold text-sm text-foreground">
                    RD$ {order.netPayout.toLocaleString()}
                  </span>
                  <span className="block text-[9px] text-muted-foreground">
                    (Total: RD$ {order.amount} - Com: {order.commission})
                  </span>
                </td>
                <td className="py-3.5 px-3 text-center">
                  {order.status === "held_in_escrow" && (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold">
                      🔒 Pago en Custodia
                    </Badge>
                  )}
                  {order.status === "shipped" && (
                    <div className="space-y-0.5">
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] font-bold">
                        🚚 Enviado ({order.carrier})
                      </Badge>
                      <span className="block font-mono text-[9px] text-muted-foreground">Guía: {order.trackingNumber}</span>
                    </div>
                  )}
                  {order.status === "payout_released" && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold">
                      ✅ Fondos Liberados
                    </Badge>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {order.status === "held_in_escrow" && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenShipmentModal(order)}
                      className="rounded-xl text-xs gap-1 bg-primary text-slate-950 font-bold h-8 px-3"
                    >
                      <Truck className="h-3.5 w-3.5" /> Cargar Guía de Envío
                    </Button>
                  )}

                  {order.status === "shipped" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSimulateDeliveryAndPayout(order.id)}
                      className="rounded-xl text-[11px] gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 h-8 px-2.5 font-bold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Comprobar Entrega
                    </Button>
                  )}

                  {order.status === "payout_released" && (
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      Completado
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: CARGAR GUÍA DE ENVÍO */}
      <Dialog open={!!selectedOrderForShipment} onOpenChange={(open) => !open && setSelectedOrderForShipment(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 border-border bg-card">
          <DialogHeader className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-1 w-fit">
              <Truck className="h-3.5 w-3.5" /> Despacho de Pedido
            </div>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Registrar Guía de Envío
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingresa los datos del comprobante de envío para notificar al cliente e iniciar el proceso de liberación de fondos.
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForShipment && (
            <form onSubmit={handleSaveShipment} className="space-y-4">
              <div className="p-3 rounded-2xl bg-muted/60 border border-border text-xs space-y-1">
                <p><strong>Orden:</strong> {selectedOrderForShipment.orderNumber}</p>
                <p><strong>Producto:</strong> {selectedOrderForShipment.productName}</p>
                <p><strong>Destino:</strong> {selectedOrderForShipment.shippingAddress}, {selectedOrderForShipment.province}</p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Empresa de Courier / Transporte *</Label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger className="rounded-xl text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Caribe Tours Envíos">Caribe Tours Envíos</SelectItem>
                    <SelectItem value="Metro Pac Express">Metro Pac Express</SelectItem>
                    <SelectItem value="BM Cargo">BM Cargo</SelectItem>
                    <SelectItem value="Vimenpaq">Vimenpaq</SelectItem>
                    <SelectItem value="DHL Dominicana">DHL Dominicana</SelectItem>
                    <SelectItem value="Entrega Propia / Mensajería Local">Entrega Propia / Mensajería Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1 block">Número de Guía / Tracking *</Label>
                <Input
                  placeholder="Ej. CT-9821440 / MP-772910"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                  className="font-mono font-bold text-xs rounded-xl uppercase"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setSelectedOrderForShipment(null)} className="rounded-xl text-xs">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-slate-950 font-bold rounded-xl text-xs">
                  Confirmar Despacho & Guía
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: SELLER KYC CERTIFICATION */}
      <Dialog open={isKycModalOpen} onOpenChange={setIsKycModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 border-border bg-card">
          <DialogHeader className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold mb-1 w-fit">
              <ShieldCheck className="h-3.5 w-3.5" /> Distintivo Oficial
            </div>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Certificación de Vendedor Verificado
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Garantiza la autenticidad y seguridad para todos los compradores nacionales y turistas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Estado: Vendedor 100% Verificado y Certificado</p>
                <p className="text-[11px] mt-0.5">Tus productos cuentan con el sello oficial de garantía y protección de pago.</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Razón Social / Comercio:</span>
                <span className="font-bold text-foreground">{businessName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">RNC / Identificación:</span>
                <span className="font-mono font-bold text-foreground">{rncOrCedula}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Tipo de Cuenta de Retiro:</span>
                <span className="font-bold text-foreground">Cuenta Corriente Banreservas (DOP)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Protección de Fondos (Escrow):</span>
                <span className="font-bold text-emerald-500">Activo (Garantía 100%)</span>
              </div>
            </div>

            <Button onClick={() => setIsKycModalOpen(false)} className="w-full bg-primary text-slate-950 font-bold rounded-xl text-xs mt-2">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
