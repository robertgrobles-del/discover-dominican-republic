import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket, Plus, Tag, Percent, DollarSign, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { adminListEntities, adminCreateEntity, adminUpdateEntity, adminDeleteEntity } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface DiscountCoupon {
  id: string;
  code: string;
  description?: string | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  min_subtotal?: number | null;
  max_uses?: number | null;
  uses_count?: number | null;
  per_user_limit?: number | null;
  is_active: boolean;
  expires_at?: string | null;
  created_at?: string;
}

export function AdminCouponsManager() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<{
    code: string;
    description?: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    min_subtotal?: number;
    max_uses?: number;
    expires_at?: string;
  }>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 10,
    min_subtotal: 0,
  });

  const { data: coupons = [], isLoading, isError, error } = useQuery<DiscountCoupon[]>({
    queryKey: ["admin-discount-coupons"],
    queryFn: async (): Promise<DiscountCoupon[]> => {
      if (HAS_BACKEND_SESSION) {
        const res = await adminListEntities<DiscountCoupon>("discount_coupons", { limit: 100 });
        return res.data || [];
      }
      const { data, error } = await (supabase as any)
        .from("discount_coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as DiscountCoupon[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof newCoupon) => {
      const isPercentage = payload.discount_type === "percentage";
      const body: Record<string, unknown> = {
        code: payload.code.toUpperCase().trim(),
        description: payload.description?.trim() || null,
        discount_percentage: isPercentage ? Number(payload.discount_value) : null,
        discount_amount: !isPercentage ? Number(payload.discount_value) : null,
        min_subtotal: payload.min_subtotal ? Number(payload.min_subtotal) : null,
        max_uses: payload.max_uses ? Number(payload.max_uses) : null,
        expires_at: payload.expires_at ? new Date(payload.expires_at).toISOString() : null,
        is_active: true,
      };

      if (HAS_BACKEND_SESSION) {
        return adminCreateEntity("discount_coupons", body);
      }
      const { data, error } = await (supabase as any)
        .from("discount_coupons")
        .insert(body)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Cupon creado exitosamente");
      setIsOpen(false);
      setNewCoupon({ code: "", description: "", discount_type: "percentage", discount_value: 10, min_subtotal: 0 });
      void queryClient.invalidateQueries({ queryKey: ["admin-discount-coupons"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Error al crear el cupón");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      if (HAS_BACKEND_SESSION) {
        return adminUpdateEntity("discount_coupons", id, { is_active });
      }
      const { error } = await (supabase as any)
        .from("discount_coupons")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estado del cupón actualizado");
      void queryClient.invalidateQueries({ queryKey: ["admin-discount-coupons"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Error al actualizar el cupón");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (HAS_BACKEND_SESSION) {
        return adminDeleteEntity("discount_coupons", id);
      }
      const { error } = await (supabase as any).from("discount_coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cupón eliminado");
      void queryClient.invalidateQueries({ queryKey: ["admin-discount-coupons"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Error al eliminar el cupón");
    },
  });

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" /> Cupones y Descuentos (D7)
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Gestión de códigos promocionales, porcentajes de descuento y cupones de monto fijo para la Tienda y Reservas.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setIsOpen(true)} className="rounded-xl text-xs gap-1.5 shadow-sm">
          <Plus className="h-3.5 w-3.5" /> Nuevo Cupón
        </Button>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading && <p className="text-sm text-muted-foreground">Cargando cupones de descuento...</p>}
        {isError && (
          <p className="text-sm text-destructive">
            Error al obtener cupones: {error instanceof Error ? error.message : "Error del servidor"}
          </p>
        )}

        {!isLoading && !isError && coupons.length === 0 && (
          <PanelEmptyState
            icon={Tag}
            title="Sin cupones registrados"
            description="No hay cupones de descuento configurados. Crea el primero para promocionar ventas."
          />
        )}

        {!isLoading && !isError && coupons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="border border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg text-primary tracking-wider uppercase">
                      {coupon.code}
                    </span>
                    <Badge variant={coupon.is_active ? "default" : "secondary"}>
                      {coupon.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      {coupon.discount_percentage != null ? (
                        <>
                          <Percent className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Descuento del {coupon.discount_percentage}%</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Descuento de RD$ {coupon.discount_amount}</span>
                        </>
                      )}
                    </p>
                    {coupon.description && <p className="italic text-muted-foreground">{coupon.description}</p>}
                    {coupon.min_subtotal && Number(coupon.min_subtotal) > 0 ? (
                      <p>Mínimo de compra: RD$ {coupon.min_subtotal}</p>
                    ) : (
                      <p>Sin mínimo de compra</p>
                    )}
                    {coupon.uses_count !== undefined && (
                      <p>Usos: {coupon.uses_count} {coupon.max_uses ? `/ ${coupon.max_uses}` : ""}</p>
                    )}
                    {coupon.expires_at && (
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Vence: {coupon.expires_at.slice(0, 10)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => toggleMutation.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                    >
                      {coupon.is_active ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => deleteMutation.mutate(coupon.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Crear Nuevo Cupón de Descuento</DialogTitle>
            <DialogDescription className="text-xs">
              Define el código promocional y sus parámetros de aplicación.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCoupon.code.trim()) {
                return toast.error("Ingresa un código promocional válido");
              }
              createMutation.mutate(newCoupon);
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label className="text-xs">Código Promocional *</Label>
              <Input
                required
                placeholder="Ej. DESCUBRERD10, QUISQUEYA2026"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                className="text-xs h-9 mt-1 uppercase font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Descripción (opcional)</Label>
              <Input
                placeholder="Ej. Promoción Especial de Verano"
                value={newCoupon.description ?? ""}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                className="text-xs h-9 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipo de Descuento</Label>
                <Select
                  value={newCoupon.discount_type}
                  onValueChange={(val: "percentage" | "fixed_amount") =>
                    setNewCoupon({ ...newCoupon, discount_type: val })
                  }
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed_amount">Monto Fijo (RD$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Valor del Descuento *</Label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={newCoupon.discount_value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                  className="text-xs h-9 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Monto Mínimo de Compra (RD$)</Label>
                <Input
                  type="number"
                  min={0}
                  value={newCoupon.min_subtotal ?? 0}
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_subtotal: Number(e.target.value) })}
                  className="text-xs h-9 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Límite Máximo de Usos</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Sin límite"
                  value={newCoupon.max_uses ?? ""}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      max_uses: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="text-xs h-9 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Fecha de Vencimiento</Label>
              <Input
                type="date"
                value={newCoupon.expires_at ?? ""}
                onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value || undefined })}
                className="text-xs h-9 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Guardando..." : "Crear Cupón"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
