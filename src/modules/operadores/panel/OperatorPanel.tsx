import { useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Store, MessageSquare, ClipboardList, Coins, Megaphone, Tag,
  HandHelping, Users, BarChart3, Building2, ExternalLink, ArrowLeft, Loader2, BadgeCheck, Clock, type LucideIcon,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createOrg, opKeys, useBookings, useMessages, useMyOrg, useOpMutation } from "../api";
import { VERIFICATION_LABEL } from "../constants";
import { OrgContext, useOrg } from "./OrgContext";
import PanelHome from "./PanelHome";
import Anuncios from "./Anuncios";
import AnuncioWizard from "./AnuncioWizard";
import Calendario from "./Calendario";
import Mensajes from "./Mensajes";
import Reservas from "./Reservas";
import Ingresos from "./Ingresos";
import Informacion from "./Informacion";
import Promocion from "./Promocion";
import Reportes from "./Reportes";
import Perfil from "./Perfil";

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean; badge?: "messages" | "requests" }[] = [
  { to: "", label: "Panel", icon: LayoutDashboard, end: true },
  { to: "calendario", label: "Calendario", icon: CalendarDays },
  { to: "anuncios", label: "Anuncios", icon: Store },
  { to: "mensajes", label: "Mensajes", icon: MessageSquare, badge: "messages" },
  { to: "reservas", label: "Reservas", icon: ClipboardList },
  { to: "ingresos", label: "Ingresos", icon: Coins },
  { to: "informacion", label: "Información", icon: Megaphone },
  { to: "promocion", label: "Promoción", icon: Tag },
  { to: "solicitudes", label: "Solicitudes", icon: HandHelping, badge: "requests" },
  { to: "comunidades", label: "Comunidades", icon: Users },
  { to: "reportes", label: "Reportes", icon: BarChart3 },
  { to: "perfil", label: "Org/Perfil", icon: Building2 },
];

function OrgOnboarding({ userId, defaultName, email }: { userId: string; defaultName: string; email?: string }) {
  const [asCompany, setAsCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const mutation = useOpMutation(
    (name: string) => createOrg(userId, { business_name: name, email }),
    [opKeys.org(userId)],
  );
  const name = asCompany ? companyName.trim() : defaultName;

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <SEOHead title="Crear organización — Operadores RD" description="Crea tu organización para publicar servicios y recibir reservas directas en Descubre RD." />
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Crear organización</CardTitle>
          <CardDescription>
            Puedes presentar tus servicios con tu usuario personal o, si tienes una empresa de turismo, mostrar su identidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Tu usuario personal siempre estará relacionado con el perfil profesional.</li>
            <li>Tus miembros serán parte del perfil profesional.</li>
          </ul>
          <div className="flex items-center gap-3">
            <Switch id="as-company" checked={asCompany} onCheckedChange={setAsCompany} />
            <Label htmlFor="as-company">Crear organización de empresa</Label>
          </div>
          {asCompany ? (
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la empresa</Label>
              <Input id="company-name" value={companyName} maxLength={80} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ej. Aventuras del Caribe" />
            </div>
          ) : (
            <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
              Crearemos tu organización personal como <strong className="text-foreground">{defaultName}</strong>. Podrás convertirla en empresa más adelante desde Org/Perfil.
            </p>
          )}
          <div className="flex justify-between">
            <Button variant="outline" asChild><Link to="/operadores"><ArrowLeft className="h-4 w-4 mr-1" /> Atrás</Link></Button>
            <Button
              disabled={!name || mutation.isPending}
              onClick={() => mutation.mutate(name, { onSuccess: () => toast.success("Organización creada"), onError: (e: any) => toast.error(e.message) })}
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Shell() {
  const { org } = useOrg();
  const location = useLocation();
  const { data: messages = [] } = useMessages(org.id);
  const { data: bookings = [] } = useBookings(org.id);
  const unread = new Set(messages.filter((m) => m.sender === "traveler" && !m.read).map((m) => m.thread_id)).size;
  const requests = bookings.filter((b) => b.status === "pending").length;
  const badges = { messages: unread, requests };
  const VerifIcon = org.verification === "verified" ? BadgeCheck : Clock;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link to="/" aria-label="Volver al portal"><ArrowLeft className="h-4 w-4 mr-1" /> Portal</Link>
            </Button>
            <span className="font-display font-bold truncate">{org.business_name}</span>
            <Badge variant={org.verification === "verified" ? "default" : "secondary"} className="gap-1 shrink-0">
              <VerifIcon className="h-3 w-3" /> {VERIFICATION_LABEL[org.verification]}
            </Badge>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/operador/${org.slug}`} target="_blank"><ExternalLink className="h-4 w-4 mr-1" /> Ver mi sitio</Link>
          </Button>
        </div>
        <nav aria-label="Panel de operador" className="md:hidden flex gap-1 overflow-x-auto px-2 pb-2 no-scrollbar">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="flex">
        <aside className="hidden md:block w-60 shrink-0 border-r border-border bg-background min-h-[calc(100vh-3.5rem)] p-3 sticky top-14 self-start">
          <nav aria-label="Panel de operador" className="space-y-1">
            {NAV.map((n) => {
              const count = n.badge ? badges[n.badge] : 0;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <n.icon className="h-4 w-4" />
                  <span className="flex-1">{n.label}</span>
                  {count > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{count}</span>}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main key={location.pathname} className="flex-1 min-w-0 p-4 md:p-8 max-w-6xl">
          <Routes>
            <Route index element={<PanelHome />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="anuncios" element={<Anuncios />} />
            <Route path="anuncios/nuevo" element={<AnuncioWizard />} />
            <Route path="anuncios/:id" element={<AnuncioWizard />} />
            <Route path="mensajes" element={<Mensajes />} />
            <Route path="reservas" element={<Reservas />} />
            <Route path="solicitudes" element={<Reservas onlyPending />} />
            <Route path="ingresos" element={<Ingresos />} />
            <Route path="informacion" element={<Informacion />} />
            <Route path="promocion" element={<Promocion />} />
            <Route path="comunidades" element={<Comunidades />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Comunidades() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Comunidades</h1>
      <Card>
        <CardContent className="py-16 text-center space-y-2">
          <Users className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="font-semibold text-lg">Muy pronto.</p>
          <p className="text-muted-foreground text-sm">Muy pronto podrás aportar tu granito de arena a las comunidades locales donde operas.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OperatorPanel() {
  const { user, loading: authLoading } = useAuth();
  const orgQuery = useMyOrg(user?.id);

  if (authLoading || (user && orgQuery.isLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/partner/login" replace />;
  if (!orgQuery.data) {
    const fallbackName = (user.user_metadata as any)?.display_name || user.email?.split("@")[0] || "Mi organización";
    return <OrgOnboarding userId={user.id} defaultName={fallbackName} email={user.email || undefined} />;
  }
  return (
    <OrgContext.Provider value={{ org: orgQuery.data, refetchOrg: () => orgQuery.refetch() }}>
      <SEOHead title="Panel de operador — Operadores RD" description="Gestiona tus servicios, reservas, calendario, mensajes e ingresos en Descubre RD." />
      <Shell />
    </OrgContext.Provider>
  );
}
