import { useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Store, MessageSquare, ClipboardList, Coins, BadgeDollarSign, UserCog, Zap, Megaphone, Tag,
  HandHelping, Users, BarChart3, Building2, ExternalLink, ArrowLeft, Loader2, BadgeCheck, Clock, Trophy, Sparkles, Menu, X, Bell, LogOut, QrCode, type LucideIcon,
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
import Tarifas from "./Tarifas";
import Automatizaciones from "./Automatizaciones";
import Equipo from "./Equipo";
import { ALLOWED, ROLE_LABEL, findMember } from "../permissions";
import Mensajes from "./Mensajes";
import Reservas from "./Reservas";
import Ingresos from "./Ingresos";
import Informacion from "./Informacion";
import Promocion from "./Promocion";
import RecompensasRetos from "./RecompensasRetos";
import ValidarRetos from "./ValidarRetos";
import EstanciasCreadores from "./EstanciasCreadores";
import Reportes from "./Reportes";
import Perfil from "./Perfil";
import Sucursales from "./Sucursales";

type NavGroup = "operaciones" | "ingresos" | "contenido" | "configuracion";
const NAV_GROUPS: { key: NavGroup; label: string }[] = [
  { key: "operaciones", label: "Operaciones" },
  { key: "ingresos", label: "Ingresos y precios" },
  { key: "contenido", label: "Inteligencia y contenido" },
  { key: "configuracion", label: "Configuración" },
];

const NAV: { to: string; label: string; icon: LucideIcon; group: NavGroup; end?: boolean; badge?: "messages" | "requests" }[] = [
  { to: "", label: "Panel general", icon: LayoutDashboard, group: "operaciones", end: true },
  { to: "calendario", label: "Calendario", icon: CalendarDays, group: "operaciones" },
  { to: "anuncios", label: "Anuncios", icon: Store, group: "operaciones" },
  { to: "reservas", label: "Reservas", icon: ClipboardList, group: "operaciones" },
  { to: "solicitudes", label: "Solicitudes", icon: HandHelping, group: "operaciones", badge: "requests" },
  { to: "mensajes", label: "Mensajes", icon: MessageSquare, group: "operaciones", badge: "messages" },
  { to: "validar-retos", label: "Validar retos", icon: QrCode, group: "operaciones" },
  { to: "tarifas", label: "Tarifas", icon: BadgeDollarSign, group: "ingresos" },
  { to: "ingresos", label: "Ingresos", icon: Coins, group: "ingresos" },
  { to: "promocion", label: "Promoción", icon: Tag, group: "ingresos" },
  { to: "automatizaciones", label: "Automatizaciones", icon: Zap, group: "ingresos" },
  { to: "reportes", label: "Estadísticas y reportes", icon: BarChart3, group: "contenido" },
  { to: "informacion", label: "Información", icon: Megaphone, group: "contenido" },
  { to: "recompensas", label: "Premios y Retos", icon: Trophy, group: "contenido" },
  { to: "creadores", label: "Creadores/Estancias", icon: Sparkles, group: "contenido" },
  { to: "comunidades", label: "Comunidades", icon: Users, group: "contenido" },
  { to: "perfil", label: "Org/Perfil", icon: Building2, group: "configuracion" },
  { to: "sucursales", label: "Sucursales", icon: Store, group: "configuracion" },
  { to: "equipo", label: "Equipo", icon: UserCog, group: "configuracion" },
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
    <div className="min-h-dvh bg-secondary/30 flex items-center justify-center p-4">
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
  const { org, role } = useOrg();
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = (user?.user_metadata as { display_name?: string } | undefined)?.display_name || user?.email?.split("@")[0] || "Mi cuenta";
  const allowed = ALLOWED[role];
  const nav = NAV.filter((n) => allowed.includes(n.to));
  const g = (key: string, el: JSX.Element) => (allowed.includes(key) ? el : <Navigate to="/operadores/panel" replace />);
  const { data: messages = [] } = useMessages(org.id);
  const { data: bookings = [] } = useBookings(org.id);
  const unread = new Set(messages.filter((m) => m.sender === "traveler" && !m.read).map((m) => m.thread_id)).size;
  const requests = bookings.filter((b) => b.status === "pending").length;
  const badges = { messages: unread, requests };
  const VerifIcon = org.verification === "verified" ? BadgeCheck : Clock;

  // Menú lateral: el mismo contenido sirve para la columna de escritorio y para el cajón del móvil.
  const sidebar = (
    <>
      <div className="p-4 border-b border-border/60">
        <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{ROLE_LABEL[role]} · {org.business_name}</p>
          </div>
        </div>
      </div>
      <nav aria-label="Panel de operador" className="flex-1 overflow-y-auto p-3 space-y-5">
        {NAV_GROUPS.map((group) => {
          const items = nav.filter((n) => n.group === group.key);
          if (!items.length) return null;
          return (
            <div key={group.key} className="space-y-1">
              <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
              {items.map((n) => {
                const count = n.badge ? badges[n.badge] : 0;
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <n.icon className="h-4 w-4" />
                    <span className="flex-1 truncate">{n.label}</span>
                    {count > 0 && <span className="rounded-full bg-primary px-1.5 text-3xs font-bold text-primary-foreground">{count}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/60">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Volver al portal turístico
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-secondary/30">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background shadow-xl transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!sidebarOpen}>
        <div className="flex h-14 items-center justify-between border-b border-border/60 px-4">
          <span className="font-display font-bold text-primary">Operadores RD</span>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X className="h-5 w-5" /></Button>
        </div>
        {sidebar}
      </aside>

      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 h-14">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu className="h-5 w-5" /></Button>
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex shrink-0">
              <Link to="/" aria-label="Volver al portal"><ArrowLeft className="h-4 w-4 mr-1" /> Portal</Link>
            </Button>
            <span className="font-display font-bold truncate">{org.business_name}</span>
            {role !== "owner" && <Badge variant="outline" className="shrink-0 hidden sm:inline-flex">{ROLE_LABEL[role]}</Badge>}
            <Badge variant={org.verification === "verified" ? "default" : "secondary"} className="gap-1 shrink-0 hidden sm:inline-flex">
              <VerifIcon className="h-3 w-3" /> {VERIFICATION_LABEL[org.verification]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {allowed.includes("mensajes") && (
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="mensajes" aria-label={unread > 0 ? `Mensajes: ${unread} sin leer` : "Mensajes"}>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {unread > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to={`/operador/${org.slug}`} target="_blank"><ExternalLink className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Ver mi sitio</span></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-background h-[calc(100vh-3.5rem)] sticky top-14 self-start">
          {sidebar}
        </aside>
        <main key={location.pathname} className="flex-1 min-w-0 p-4 md:p-8 max-w-6xl">
          <Routes>
            <Route index element={<PanelHome />} />
            <Route path="calendario" element={g("calendario", <Calendario />)} />
            <Route path="tarifas" element={g("tarifas", <Tarifas />)} />
            <Route path="automatizaciones" element={g("automatizaciones", <Automatizaciones />)} />
            <Route path="anuncios" element={g("anuncios", <Anuncios />)} />
            <Route path="anuncios/nuevo" element={g("anuncios", <AnuncioWizard />)} />
            <Route path="anuncios/:id" element={g("anuncios", <AnuncioWizard />)} />
            <Route path="recompensas" element={g("recompensas", <RecompensasRetos />)} />
            <Route path="validar-retos" element={g("validar-retos", <ValidarRetos />)} />
            <Route path="creadores" element={g("creadores", <EstanciasCreadores />)} />
            <Route path="mensajes" element={g("mensajes", <Mensajes />)} />
            <Route path="reservas" element={g("reservas", <Reservas />)} />
            <Route path="solicitudes" element={g("solicitudes", <Reservas onlyPending />)} />
            <Route path="ingresos" element={g("ingresos", <Ingresos />)} />
            <Route path="informacion" element={g("informacion", <Informacion />)} />
            <Route path="promocion" element={g("promocion", <Promocion />)} />
            <Route path="comunidades" element={g("comunidades", <Comunidades />)} />
            <Route path="reportes" element={g("reportes", <Reportes />)} />
            <Route path="perfil" element={g("perfil", <Perfil />)} />
            <Route path="sucursales" element={g("perfil", <Sucursales />)} />
            <Route path="equipo" element={g("equipo", <Equipo />)} />
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
  const orgQuery = useMyOrg(user?.id, user?.email);

  if (authLoading || (user && orgQuery.isLoading)) {
    return <div className="min-h-dvh flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/login?returnTo=/operadores/panel" replace />;
  if (!orgQuery.data) {
    const fallbackName = (user.user_metadata as any)?.display_name || user.email?.split("@")[0] || "Mi organización";
    return <OrgOnboarding userId={user.id} defaultName={fallbackName} email={user.email || undefined} />;
  }
  const org = orgQuery.data;
  const member = org.id === user.id ? undefined : findMember(org, user.email);
  // Denegar por defecto: la ausencia de una membresía no concede acceso de recepción.
  if (org.id !== user.id && !member) return <Navigate to="/operadores" replace />;
  const role = org.id === user.id ? "owner" as const : member!.role;
  const ctx = { org, refetchOrg: () => orgQuery.refetch(), role, readOnly: role === "guia", scopeListingIds: role === "guia" ? member?.listing_ids || [] : undefined };
  return (
    <OrgContext.Provider value={ctx}>
      <SEOHead title="Panel de operador — Operadores RD" description="Gestiona tus servicios, reservas, calendario, mensajes e ingresos en Descubre RD." />
      <Shell />
    </OrgContext.Provider>
  );
}
