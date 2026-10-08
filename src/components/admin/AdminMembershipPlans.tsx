import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Plus, Sparkles, CheckCircle2, XCircle, Edit, DollarSign, Layers } from "lucide-react";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { fetchApi } from "@/lib/fastifyClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface MembershipPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_annual: number;
  currency: string;
  points_multiplier: number;
  benefits: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function AdminMembershipPlans() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  // Form states
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceAnnual, setPriceAnnual] = useState(49);
  const [currency, setCurrency] = useState("USD");
  const [multiplier, setMultiplier] = useState(1.5);
  const [benefitsText, setBenefitsText] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: plans = [], isLoading, isError, error } = useQuery<MembershipPlan[]>({
    queryKey: ["admin-membership-plans"],
    queryFn: async (): Promise<MembershipPlan[]> => {
      if (HAS_BACKEND_SESSION) {
        const res = await fetchApi<{ data: MembershipPlan[] }>("/admin/memberships/plans");
        return res.data || [];
      }
      const { data, error: sbError } = await (supabase as any)
        .from("membership_plans")
        .select("*")
        .order("price_annual", { ascending: true });
      if (sbError) throw new Error(sbError.message);
      return (data || []).map((p: any) => ({
        ...p,
        price_annual: Number(p.price_annual),
        points_multiplier: Number(p.points_multiplier),
        benefits: Array.isArray(p.benefits) ? p.benefits : [],
      }));
    },
  });

  const openCreateDialog = () => {
    setEditingPlan(null);
    setSlug("");
    setName("");
    setDescription("");
    setPriceAnnual(49);
    setCurrency("USD");
    setMultiplier(1.5);
    setBenefitsText("Acceso a eventos VIP\nDescuentos en comercios afiliados\nMultiplicador de puntos 1.5x");
    setIsActive(true);
    setIsOpen(true);
  };

  const openEditDialog = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setSlug(plan.slug);
    setName(plan.name);
    setDescription(plan.description || "");
    setPriceAnnual(plan.price_annual);
    setCurrency(plan.currency || "USD");
    setMultiplier(plan.points_multiplier);
    setBenefitsText((plan.benefits || []).join("\n"));
    setIsActive(plan.is_active);
    setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const benefits = benefitsText
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean);

      const payload = {
        slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
        name: name.trim(),
        description: description.trim() || null,
        price_annual: Number(priceAnnual),
        currency: currency.trim() || "USD",
        points_multiplier: Number(multiplier),
        benefits,
        is_active: isActive,
      };

      if (editingPlan) {
        if (HAS_BACKEND_SESSION) {
          const res = await fetchApi<{ data: MembershipPlan }>(`/admin/memberships/plans/${editingPlan.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
          return res.data;
        }
        const { data, error: sbError } = await (supabase as any)
          .from("membership_plans")
          .update(payload)
          .eq("id", editingPlan.id)
          .select()
          .single();
        if (sbError) throw new Error(sbError.message);
        return data;
      } else {
        if (HAS_BACKEND_SESSION) {
          const res = await fetchApi<{ data: MembershipPlan }>("/admin/memberships/plans", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          return res.data;
        }
        const { data, error: sbError } = await (supabase as any)
          .from("membership_plans")
          .insert([{ ...payload, id: payload.slug }])
          .select()
          .single();
        if (sbError) throw new Error(sbError.message);
        return data;
      }
    },
    onSuccess: () => {
      toast.success(editingPlan ? "Plan de membresía actualizado" : "Plan de membresía creado con éxito");
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-membership-plans"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al guardar el plan");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: boolean }) => {
      if (HAS_BACKEND_SESSION) {
        const res = await fetchApi<{ data: MembershipPlan }>(`/admin/memberships/plans/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ is_active: newStatus }),
        });
        return res.data;
      }
      const { data, error: sbError } = await (supabase as any)
        .from("membership_plans")
        .update({ is_active: newStatus })
        .eq("id", id)
        .select()
        .single();
      if (sbError) throw new Error(sbError.message);
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Plan ${variables.newStatus ? "activado" : "desactivado"} correctamente`);
      queryClient.invalidateQueries({ queryKey: ["admin-membership-plans"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al cambiar el estado del plan");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-500" />
            Planes de Membresía (Pasaporte RD)
          </h2>
          <p className="text-xs text-muted-foreground">
            Configuración autoritativa de niveles de suscripción, multiplicadores de puntos y beneficios para turistas.
          </p>
        </div>
        <Button size="sm" onClick={openCreateDialog} className="gap-1.5 bg-primary">
          <Plus className="h-4 w-4" /> Nuevo Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/40" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Error al cargar los planes: {(error as Error)?.message}
        </Card>
      ) : plans.length === 0 ? (
        <PanelEmptyState
          icon={ShieldCheck}
          title="No hay planes de membresía registrados"
          description="Crea el primer plan para permitir suscripciones oficiales a Pasaporte RD."
          actionLabel="Crear Plan"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((p) => (
            <Card key={p.id} className={`border flex flex-col justify-between transition-all ${p.is_active ? "border-border/80" : "border-border/40 opacity-70 bg-muted/20"}`}>
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold">{p.name}</CardTitle>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{p.slug}</p>
                  </div>
                  <Badge variant={p.is_active ? "default" : "secondary"} className="text-xs">
                    {p.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {p.description && (
                  <CardDescription className="text-xs mt-2 line-clamp-2">{p.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                <div className="flex items-baseline gap-2 border-y border-border/40 py-2.5">
                  <span className="text-2xl font-bold font-display">${p.price_annual}</span>
                  <span className="text-xs text-muted-foreground">{p.currency} / año</span>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                      ⚡ ×{p.points_multiplier} Puntos
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Beneficios incluidos</p>
                  <ul className="text-xs space-y-1">
                    {(p.benefits || []).slice(0, 4).map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{b}</span>
                      </li>
                    ))}
                    {(p.benefits || []).length > 4 && (
                      <li className="text-[11px] text-muted-foreground pl-5">+{(p.benefits || []).length - 4} más...</li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => openEditDialog(p)}>
                    <Edit className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 text-xs ${p.is_active ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"}`}
                    onClick={() => toggleActiveMutation.mutate({ id: p.id, newStatus: !p.is_active })}
                    disabled={toggleActiveMutation.isPending}
                  >
                    {p.is_active ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Plan */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {editingPlan ? "Editar Plan de Membresía" : "Nuevo Plan de Membresía"}
            </DialogTitle>
            <DialogDescription>
              Configura los parámetros anuales, beneficios y multiplicador de gamificación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="plan-name">Nombre del Plan</Label>
                <Input
                  id="plan-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingPlan && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  placeholder="Ej. Explorador VIP"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-slug">Slug Identificador</Label>
                <Input
                  id="plan-slug"
                  value={slug}
                  disabled={!!editingPlan}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ej. explorador-vip"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan-desc">Descripción (opcional)</Label>
              <Input
                id="plan-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve resumen del nivel de membresía"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="plan-price">Precio Anual</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min={0}
                  step={1}
                  value={priceAnnual}
                  onChange={(e) => setPriceAnnual(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-curr">Moneda</Label>
                <Input
                  id="plan-curr"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="USD"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-mult">Multiplicador XP</Label>
                <Input
                  id="plan-mult"
                  type="number"
                  min={1}
                  max={20}
                  step={0.1}
                  value={multiplier}
                  onChange={(e) => setMultiplier(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan-benefits">Beneficios (uno por línea)</Label>
              <Textarea
                id="plan-benefits"
                rows={4}
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
                placeholder="Acceso VIP a eventos&#10;Multiplicador de XP&#10;Descuentos exclusivos"
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <Label className="text-sm font-semibold">Plan Activo</Label>
                <p className="text-xs text-muted-foreground">Disponible para que nuevos usuarios se suscriban</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !name.trim() || !slug.trim()}>
              {saveMutation.isPending ? "Guardando..." : editingPlan ? "Actualizar Plan" : "Crear Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
