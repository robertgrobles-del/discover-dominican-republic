import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Package, Truck, CheckCircle2, XCircle, Search, Save } from "lucide-react";

export function AdminStockConsole() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingShipment, setEditingShipment] = useState<string | null>(null);
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");

  const { data: shipments, isLoading } = useQuery({
    queryKey: ["admin-reward-shipments"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("reward_shipments")
        .select(`
          id,
          recipient_name,
          recipient_phone,
          shipping_address,
          courier_name,
          tracking_number,
          status,
          created_at,
          reward_id,
          reward_inventory(title, is_physical)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 10_000,
  });

  const updateShipmentMutation = useMutation({
    mutationFn: async ({ id, status, courierName, trackingNumber }: { id: string; status: string; courierName?: string; trackingNumber?: string }) => {
      const updates: any = { status };
      if (courierName !== undefined) updates.courier_name = courierName;
      if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
      if (status === "shipped") updates.shipped_at = new Date().toISOString();

      const { data, error } = await (supabase as any)
        .from("reward_shipments")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reward-shipments"] });
      setEditingShipment(null);
      setCourier("");
      setTracking("");
      toast({
        title: "Envío actualizado",
        description: "El estado de la entrega se ha registrado correctamente.",
      });
    },
    onError: (err) => {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el envío.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: string, currentCourier: string, currentTracking: string) => {
    setEditingShipment(id);
    setCourier(currentCourier || "");
    setTracking(currentTracking || "");
  };

  const handleSave = (id: string, currentStatus: string) => {
    updateShipmentMutation.mutate({
      id,
      status: currentStatus === "pending" ? "shipped" : currentStatus,
      courierName: courier,
      trackingNumber: tracking,
    });
  };

  const updateStatusDirect = (id: string, status: string) => {
    updateShipmentMutation.mutate({ id, status });
  };

  const filteredShipments = shipments?.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.recipient_name?.toLowerCase().includes(term) ||
      s.reward_inventory?.title?.toLowerCase().includes(term) ||
      s.courier_name?.toLowerCase().includes(term) ||
      s.tracking_number?.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted-foreground">Cargando envíos y stock...</span>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/5">Pendiente</Badge>;
      case "shipped":
        return <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-500/5">Enviado</Badge>;
      case "delivered":
        return <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/5">Entregado</Badge>;
      default:
        return <Badge variant="destructive">Cancelado</Badge>;
    }
  };

  return (
    <Card className="border border-border/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Consola de Control de Stock y Envíos
            </CardTitle>
            <CardDescription>
              Gestiona el despacho y logística de premios físicos solicitados por los viajeros.
            </CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar destinatario o premio..."
              className="pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Destinatario</TableHead>
                <TableHead>Premio Reclamado</TableHead>
                <TableHead>Dirección de Envío</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Número de Guía</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments && filteredShipments.length > 0 ? (
                filteredShipments.map((s) => {
                  const isEditing = editingShipment === s.id;
                  return (
                    <TableRow key={s.id} className="hover:bg-secondary/10">
                      <TableCell className="text-xs font-mono">
                        {new Date(s.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-bold">
                        <div>{s.recipient_name}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{s.recipient_phone}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {s.reward_inventory?.title || "Recompensa Física"}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {s.shipping_address}
                      </TableCell>
                      <TableCell className="text-xs">
                        {isEditing ? (
                          <Input
                            className="h-7 text-xs w-28"
                            value={courier}
                            onChange={(e) => setCourier(e.target.value)}
                            placeholder="Ej: MetroPac"
                          />
                        ) : (
                          s.courier_name || <span className="text-muted-foreground text-[10px]">No asignado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {isEditing ? (
                          <Input
                            className="h-7 text-xs w-32 font-mono"
                            value={tracking}
                            onChange={(e) => setTracking(e.target.value)}
                            placeholder="Tracking #"
                          />
                        ) : (
                          s.tracking_number || <span className="text-muted-foreground text-[10px]">No asignado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {getStatusBadge(s.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleSave(s.id, s.status)}
                          >
                            <Save className="h-3 w-3" /> Guardar
                          </Button>
                        ) : (
                          <div className="flex justify-end gap-1.5">
                            {s.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 gap-1"
                                onClick={() => handleEdit(s.id, s.courier_name, s.tracking_number)}
                              >
                                <Truck className="h-3.5 w-3.5" /> Despachar
                              </Button>
                            )}
                            {s.status === "shipped" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-1"
                                onClick={() => updateStatusDirect(s.id, "delivered")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Entregado
                              </Button>
                            )}
                            {s.status !== "delivered" && s.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1"
                                onClick={() => updateStatusDirect(s.id, "cancelled")}
                              >
                                <XCircle className="h-3.5 w-3.5" /> Cancelar
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                    No se encontraron órdenes de envío físicas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
