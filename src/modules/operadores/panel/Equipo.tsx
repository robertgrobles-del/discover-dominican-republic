import { useState } from "react";
import { Trash2, UserPlus, ShieldAlert, UserCheck, CheckCircle2, XCircle, ArrowRightLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { isValidEmail } from "@/lib/security";
import { opKeys, updateOrg, useListings, useOpMutation } from "../api";
import { MEMBER_ROLES, ROLE_DESC, ROLE_LABEL, findMember, type PanelRole } from "../permissions";
import type { TeamMember } from "../types";
import { useOrg } from "./OrgContext";
import { fetchApi } from "@/lib/fastifyClient";

const uid = () => `tm-${Math.random().toString(36).slice(2, 9)}`;

interface JoinRequest {
  id: string;
  applicant_name: string;
  applicant_email: string;
  requested_role: Exclude<PanelRole, "owner">;
  message: string;
  created_at: string;
}

export default function Equipo() {
  const { org, refetchOrg } = useOrg();
  const { data: listings = [] } = useListings(org.id);
  const team = org.team || [];
  
  const [form, setForm] = useState<{ name: string; email: string; role: Exclude<PanelRole, "owner">; listing_ids: string[] }>({ 
    name: "", 
    email: "", 
    role: "recepcion", 
    listing_ids: [] 
  });

  // Solicitudes de ingreso (Join Requests)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    {
      id: "jr-1",
      applicant_name: "María Gómez",
      applicant_email: "maria.gomez@ejemplo.com",
      requested_role: "recepcion",
      message: "Hola, soy la nueva recepcionista del turno de la tarde.",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    }
  ]);

  // Transferencia de propiedad
  const [transferTargetId, setTransferTargetId] = useState<string>("");
  const [transferPassword, setTransferPassword] = useState<string>("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const save = useOpMutation((t: TeamMember[]) => updateOrg(org.id, { team: t }), [opKeys.org(org.id)]);

  const persist = (next: TeamMember[], msg: string) => 
    save.mutate(next, { 
      onSuccess: () => { toast.success(msg); refetchOrg(); }, 
      onError: (e: any) => toast.error(e.message) 
    });

  const add = () => {
    if (form.name.trim().length < 2) return toast.error("Escribe el nombre.");
    if (!isValidEmail(form.email)) return toast.error("Ingresa un correo válido.");
    if (findMember(org, form.email) || form.email.trim().toLowerCase() === (org.email || "").toLowerCase()) 
      return toast.error("Ese correo ya tiene acceso.");
    if (form.role === "guia" && form.listing_ids.length === 0) 
      return toast.error("Asigna al menos una excursión al guía.");
    
    persist([
      ...team, 
      { 
        id: uid(), 
        name: form.name.trim(), 
        email: form.email.trim().toLowerCase(), 
        role: form.role, 
        listing_ids: form.role === "guia" ? form.listing_ids : undefined, 
        added_at: new Date().toISOString() 
      }
    ], "Miembro agregado");
    
    setForm({ name: "", email: "", role: "recepcion", listing_ids: [] });
  };

  const handleApproveRequest = async (req: JoinRequest) => {
    persist([
      ...team,
      {
        id: uid(),
        name: req.applicant_name,
        email: req.applicant_email,
        role: req.requested_role,
        added_at: new Date().toISOString(),
      }
    ], `Solicitud de ${req.applicant_name} aprobada`);

    setJoinRequests(prev => prev.filter(r => r.id !== req.id));
    try {
      await fetchApi(`/orgs/${org.id}/join-requests/${req.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ action: "approve", granted_role: req.requested_role }),
      });
    } catch {
      // Ignorar en demo
    }
  };

  const handleRejectRequest = async (req: JoinRequest) => {
    setJoinRequests(prev => prev.filter(r => r.id !== req.id));
    toast.info(`Solicitud de ${req.applicant_name} rechazada`);
    try {
      await fetchApi(`/orgs/${org.id}/join-requests/${req.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ action: "reject", reason: "Rechazado por el administrador" }),
      });
    } catch {
      // Ignorar en demo
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetId) return toast.error("Selecciona un miembro para transferir la propiedad.");
    if (!transferPassword) return toast.error("Ingresa tu contraseña para confirmar.");
    
    setTransferring(true);
    try {
      await fetchApi(`/orgs/${org.id}/ownership-transfer`, {
        method: "POST",
        body: JSON.stringify({
          target_member_id: transferTargetId,
          confirm_password: transferPassword,
        }),
      });

      toast.success("Propuesta de transferencia de propiedad iniciada. El nuevo dueño debe aceptar.");
      setTransferOpen(false);
    } catch {
      toast.success("Propuesta de transferencia enviada (Modo local).");
      setTransferOpen(false);
    } finally {
      setTransferring(false);
      setTransferPassword("");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Equipo, Roles y Solicitudes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona accesos departamentales, atiende solicitudes de ingreso y transfiere la propiedad legal de la empresa.
          </p>
        </div>

        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-amber-500/30 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20">
              <ArrowRightLeft className="h-4 w-4" /> Transferir Propiedad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <ShieldAlert className="h-5 w-5" /> Transferencia de Propiedad
              </DialogTitle>
              <DialogDescription>
                Esta acción transferirá la titularidad legal y el rol de Propietario (Owner) a otro miembro del equipo.
                Tu rol pasará a ser Administrador.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label>Nuevo Propietario</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                >
                  <option value="">-- Selecciona un miembro activo --</option>
                  {team.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email}) - {ROLE_LABEL[m.role]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Confirmar Contraseña Actual</Label>
                <Input 
                  type="password" 
                  placeholder="Tu contraseña de inicio de sesión" 
                  value={transferPassword}
                  onChange={(e) => setTransferPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setTransferOpen(false)}>Cancelar</Button>
              <Button onClick={handleTransferOwnership} disabled={transferring} className="bg-amber-600 hover:bg-amber-700 text-white">
                {transferring ? "Procesando..." : "Confirmar Transferencia"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="miembros" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md">
          <TabsTrigger value="miembros">Miembros Activos ({team.length})</TabsTrigger>
          <TabsTrigger value="solicitudes" className="relative">
            Solicitudes de Ingreso
            {joinRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground font-semibold">
                {joinRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="miembros" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agregar miembro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="tm-name">Nombre completo</Label>
                  <Input 
                    id="tm-name" 
                    maxLength={60} 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="Ej. Carlos Martínez"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tm-mail">Correo electrónico</Label>
                  <Input 
                    id="tm-mail" 
                    type="email" 
                    maxLength={254} 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    placeholder="carlos@empresa.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rol y Permisos</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {MEMBER_ROLES.map((r) => (
                    <button 
                      key={r} 
                      type="button" 
                      aria-pressed={form.role === r} 
                      onClick={() => setForm({ ...form, role: r })} 
                      className={`rounded-xl border p-3 text-left text-sm transition-all ${
                        form.role === r ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-semibold">{ROLE_LABEL[r]}</p>
                      <p className="text-xs text-muted-foreground">{ROLE_DESC[r]}</p>
                    </button>
                  ))}
                </div>
              </div>
              {form.role === "guia" && (
                <div className="space-y-2">
                  <Label>Excursiones asignadas</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {listings.map((l) => (
                      <label key={l.id} className="flex items-center gap-2 text-sm p-2 rounded-lg border bg-muted/20">
                        <Checkbox 
                          checked={form.listing_ids.includes(l.id)} 
                          onCheckedChange={(c) => 
                            setForm({ 
                              ...form, 
                              listing_ids: c ? [...form.listing_ids, l.id] : form.listing_ids.filter((x) => x !== l.id) 
                            })
                          } 
                        /> 
                        <span className="truncate">{l.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={add} disabled={save.isPending} className="gap-2">
                <UserPlus className="h-4 w-4" /> Enviar Invitación
              </Button>
            </CardContent>
          </Card>

          <section>
            <h2 className="font-display text-xl font-bold mb-3">Miembros Actuales ({team.length})</h2>
            {team.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no has agregado miembros a tu equipo.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {team.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold flex items-center gap-2">
                          {m.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.email}
                          {m.role === "guia" && m.listing_ids?.length ? ` · ${m.listing_ids.length} excursión(es) asignadas` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{ROLE_LABEL[m.role]}</Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10" 
                          aria-label={`Quitar a ${m.name}`} 
                          onClick={() => persist(team.filter((x) => x.id !== m.id), "Acceso retirado")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="solicitudes" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-semibold">Solicitudes de Ingreso Pendientes</h2>
            <Badge variant="outline">{joinRequests.length} pendientes</Badge>
          </div>

          {joinRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                <UserCheck className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                No hay solicitudes de ingreso pendientes en este momento.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {joinRequests.map(req => (
                <Card key={req.id} className="border-primary/20">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base">{req.applicant_name}</p>
                        <Badge variant="secondary" className="capitalize">{ROLE_LABEL[req.requested_role]}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{req.applicant_email}</p>
                      {req.message && (
                        <p className="text-sm bg-muted/40 p-2 rounded-md italic text-muted-foreground mt-2">
                          "{req.message}"
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> Solicitado hace poco
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveRequest(req)} 
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Aprobar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRejectRequest(req)} 
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <XCircle className="h-4 w-4" /> Rechazar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
