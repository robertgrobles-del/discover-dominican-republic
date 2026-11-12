import { Suspense, lazy, useState, useMemo, useEffect, useCallback, type ReactElement } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useAuth } from "@/hooks/useAuth";
import { useAccessContext } from "@/hooks/useAccessContext";
import { usePanelAdoption } from "@/lib/adoption";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { MockDataNotice } from "@/components/MockDataNotice";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "@/lib/adminDashboardApi";
import { StagingEventsManager, StagingVenuesManager, StagingPlacesManager, StagingNewsCategoriesManager, StagingNewsManager, StagingProvincesManager, StagingBeachesManager } from "@/components/admin/staging/StagingCrudManager";
import { StagingContactMessagesManager, StagingEstablishmentRequestsManager, StagingLeadsManager } from "@/components/admin/staging/StagingFormsManagers";
import { MediaLibrary } from "@/components/admin/staging/MediaLibrary";
import { StagingUsersManager } from "@/components/admin/staging/StagingUsersManager";
import { StagingDashboard } from "@/components/admin/staging/StagingDashboard";
import { AUTOSAVE_EVENT, RESOURCE_TO_TAB, listLocalDrafts } from "@/components/admin/staging/useDraftAutosave";
import { Shield, Loader2, Menu, X, ChevronRight, ExternalLink, LogOut, MapPin, Newspaper, Users, Tags, Gift, Building2, Moon, Sun, Image as ImageIcon, LayoutDashboard, Mail, CalendarDays, Landmark, Map as MapIcon, Signpost, Waves, WifiOff, History } from "lucide-react";

type TabCategory = "home" | "editorial" | "catalog" | "crm" | "system";

interface AdminTab {
  value: string;
  label: string;
  category: TabCategory;
  capability: string;
  /** Permite acceso si el usuario posee alguno de estos roles específicos (ej. propietarios 'partner') */
  allowRoles?: string[];
  icon: typeof Shield;
  iconClass?: string;
  demoOnly?: boolean;
  /** El escritorio recibe las pestañas visibles para resumir todas las secciones, también las futuras. */
  render: (ctx: { tabs: { value: string; label: string; icon: typeof Shield; category: string }[] }) => ReactElement;
}

/** Qué se hace en cada sección: es el subtítulo de su pantalla. */
const TAB_DESCRIPTIONS: Record<string, string> = {
  dashboard: "Métricas consolidadas, borradores protegidos, actividad reciente y tareas pendientes",
  provincias: "Fichas editoriales, fotografías, clima, cómo llegar y SEO por provincia",
  municipios: "Municipios y distritos municipales vinculados a su provincia",
  destinos: "Zonas turísticas, ciudades, pueblos e islas del portal",
  noticias: "Redacción, traducción y publicación de noticias y guías",
  "categorias-noticias": "Organiza las categorías temáticas del blog y noticias",
  eventos: "Cartelera cultural, ferias y propuestas enviadas desde la web",
  recintos: "Teatros, museos, estadios y espacios culturales",
  playas: "Fichas completas de playas: características, seguridad, mapa y galería",
  medios: "Imágenes subidas y biblioteca multimedia reutilizable",
  sorteo: "Participantes registrados desde los formularios del sitio",
  "solicitudes-negocios": "Negocios propuestos para revisar y publicar en el directorio",
  mensajes: "Bandeja de consultas recibidas desde el formulario de contacto",
  usuarios: "Cuentas del equipo, roles y permisos de acceso",
};

const CATEGORY_CONFIG: Record<TabCategory, { label: string; description: string; order: number }> = {
  home: { label: "Resumen", description: "Visión general del portal", order: 0 },
  editorial: { label: "Editorial", description: "Noticias, eventos, categorías y biblioteca de medios", order: 1 },
  catalog: { label: "Guía y lugares", description: "Provincias, municipios, destinos, playas y recintos", order: 2 },
  crm: { label: "Comunidad", description: "Solicitudes, mensajes y participantes", order: 3 },
  system: { label: "Equipo", description: "Usuarios y permisos", order: 4 },
};


// Rama staging: el panel solo gestiona provincias y noticias contra el mini backend (api/index.ts).
// La capacidad no existe a propósito: el acceso lo da el rol real de la sesión (allowRoles), no el contexto
// de demostración que se carga con la landing en datos locales.
const ADMIN_TABS: AdminTab[] = [
  { value: "dashboard", label: "Escritorio", category: "home", capability: "staging.panel", allowRoles: ["admin", "editor", "autor", "colaborador"], icon: LayoutDashboard, iconClass: "text-foreground", render: ({ tabs }) => <StagingDashboard sections={tabs.filter((t) => t.value !== "dashboard").map((t) => ({ ...t, group: CATEGORY_CONFIG[t.category as TabCategory]?.label ?? "" }))} /> },
  { value: "noticias", label: "Noticias", category: "editorial", capability: "staging.panel", allowRoles: ["admin", "editor", "autor", "colaborador"], icon: Newspaper, iconClass: "text-primary", render: () => <StagingNewsManager /> },
  { value: "categorias-noticias", label: "Categorías", category: "editorial", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: Tags, iconClass: "text-amber-500", render: () => <StagingNewsCategoriesManager /> },
  { value: "medios", label: "Biblioteca de medios", category: "editorial", capability: "staging.panel", allowRoles: ["admin", "editor", "autor", "colaborador"], icon: ImageIcon, iconClass: "text-cyan-500", render: () => <MediaLibrary /> },
  { value: "provincias", label: "Provincias", category: "catalog", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: MapPin, iconClass: "text-emerald-500", render: () => <StagingProvincesManager /> },
  { value: "municipios", label: "Municipios", category: "catalog", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: MapIcon, iconClass: "text-emerald-600", render: () => <StagingPlacesManager kind="municipalities" /> },
  { value: "destinos", label: "Destinos", category: "catalog", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: Signpost, iconClass: "text-teal-500", render: () => <StagingPlacesManager kind="destinations" /> },
  { value: "playas", label: "Playas", category: "catalog", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: Waves, iconClass: "text-cyan-600", render: () => <StagingBeachesManager /> },
  { value: "eventos", label: "Eventos", category: "editorial", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: CalendarDays, iconClass: "text-rose-500", render: () => <StagingEventsManager /> },
  { value: "recintos", label: "Recintos", category: "catalog", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: Landmark, iconClass: "text-indigo-500", render: () => <StagingVenuesManager /> },
  { value: "solicitudes-negocios", label: "Solicitudes de negocios", category: "crm", capability: "staging.panel", allowRoles: ["admin"], icon: Building2, iconClass: "text-orange-500", render: () => <StagingEstablishmentRequestsManager /> },
  { value: "mensajes", label: "Mensajes de contacto", category: "crm", capability: "staging.panel", allowRoles: ["admin"], icon: Mail, iconClass: "text-violet-500", render: () => <StagingContactMessagesManager /> },
  { value: "sorteo", label: "Sorteo y boletín", category: "crm", capability: "staging.panel", allowRoles: ["admin"], icon: Gift, iconClass: "text-pink-500", render: () => <StagingLeadsManager /> },
  { value: "usuarios", label: "Usuarios", category: "system", capability: "staging.panel", allowRoles: ["admin"], icon: Users, iconClass: "text-sky-500", render: () => <StagingUsersManager /> },
];

/**
 * Tema del panel, aparte del del sitio: claro por defecto, con botón para el oscuro. Se guarda en "admin-theme";
 * al salir del panel se devuelve al sitio el tema que tenía (ThemeToggle, clave "theme").
 */
function useAdminTheme() {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem("admin-theme") === "dark"; } catch { return false; } });
  useEffect(() => {
    const root = document.documentElement;
    const hadLight = root.classList.contains("light");
    const hadBeach = document.body.classList.contains("sol-de-playa");
    root.classList.toggle("light", !dark);
    document.body.classList.remove("sol-de-playa");
    return () => {
      root.classList.toggle("light", hadLight);
      document.body.classList.toggle("sol-de-playa", hadBeach);
    };
  }, [dark]);
  const toggle = () => setDark((d) => {
    try { localStorage.setItem("admin-theme", d ? "light" : "dark"); } catch { /* sin almacenamiento: dura la visita */ }
    return !d;
  });
  return { dark, toggle };
}

export default function AdminPanel() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can, loading: accessLoading, context, demo } = useAccessContext();
  usePanelAdoption("admin");
  const theme = useAdminTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine !== false : true));
  const [localDraftCountByTab, setLocalDraftCountByTab] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const d of listLocalDrafts()) {
      const tab = RESOURCE_TO_TAB[d.resource];
      if (tab) counts[tab] = (counts[tab] ?? 0) + 1;
    }
    return counts;
  });

  useEffect(() => {
    const refreshDrafts = () => {
      const counts: Record<string, number> = {};
      for (const d of listLocalDrafts()) {
        const tab = RESOURCE_TO_TAB[d.resource];
        if (tab) counts[tab] = (counts[tab] ?? 0) + 1;
      }
      setLocalDraftCountByTab(counts);
    };
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener(AUTOSAVE_EVENT, refreshDrafts);
    window.addEventListener("storage", refreshDrafts);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener(AUTOSAVE_EVENT, refreshDrafts);
      window.removeEventListener("storage", refreshDrafts);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const totalLocalDrafts = useMemo(
    () => Object.values(localDraftCountByTab).reduce((acc, n) => acc + n, 0),
    [localDraftCountByTab],
  );

  // El modo demo solo aplica cuando NO hay sesión de backend real
  const isDemoMode = !HAS_BACKEND_SESSION && (demo || IS_MOCK_DATA);

  // Con sesión real de backend, las pestañas salen de can(tab.capability) o de allowRoles
  // y se descartan las pestañas demoOnly
  const visibleTabs = useMemo(() => {
    if (isDemoMode) {
      return ADMIN_TABS;
    }
    const userRoles = (user?.app_metadata?.roles as string[] | undefined) ?? [];
    return ADMIN_TABS.filter((tab) => {
      if (tab.demoOnly && HAS_BACKEND_SESSION) return false;
      const roleAllowed = tab.allowRoles?.some((r) => userRoles.includes(r));
      return can(tab.capability) || roleAllowed;
    });
  }, [can, isDemoMode, user?.app_metadata?.roles]);

  const activeTabValue = searchParams.get("seccion") ?? visibleTabs[0]?.value ?? "dashboard";
  const setActiveTabValue = useCallback((value: string) => setSearchParams({ seccion: value }, { replace: false }), [setSearchParams]);

  // Pendientes que atender, para señalarlos en el menú. Comparte caché con el dashboard.
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard-kpis"],
    queryFn: async () => (HAS_BACKEND_SESSION ? await adminDashboardApi.getDashboard() : null),
    enabled: false, // staging: el mini backend no tiene /admin/dashboard
    staleTime: 60_000,
  });
  const pendingByTab = useMemo<Record<string, number>>(() => {
    const p = dashboard?.pending;
    if (!p) return {};
    return {
      moderacion: (p.reviews ?? 0) + (p.ugc_reports ?? 0) + (p.reported_posts ?? 0),
      medios: p.ugc_media ?? 0,
      soporte: p.support_tickets ?? 0,
      operadores: p.operators_to_verify ?? 0,
      "eventos-propuestos": p.content_in_review?.find((c) => c.path === "events")?.n ?? 0,
    };
  }, [dashboard]);

  // Tab activo actual
  const activeTab = useMemo(() => {
    return visibleTabs.find((t) => t.value === activeTabValue) || visibleTabs[0] || null;
  }, [visibleTabs, activeTabValue]);

  // Agrupación por categoría
  const groupedTabs = useMemo(() => {
    const groups: Partial<Record<TabCategory, AdminTab[]>> = {};
    for (const tab of visibleTabs) {
      if (!groups[tab.category]) groups[tab.category] = [];
      groups[tab.category]!.push(tab);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => CATEGORY_CONFIG[a as TabCategory].order - CATEGORY_CONFIG[b as TabCategory].order)
      .map(([cat, tabs]) => ({
        category: cat as TabCategory,
        label: CATEGORY_CONFIG[cat as TabCategory].label,
        tabs: tabs || [],
      }));
  }, [visibleTabs]);

  if (authLoading || accessLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  // Si no hay usuario autenticado, redirigir inmediatamente a login preservando returnTo=/admin
  if (!user) {
    return <Navigate to="/login?returnTo=/admin" replace />;
  }

  // Si la cuenta autenticada no tiene permisos sobre ninguna pestaña del panel de administración
  if (visibleTabs.length === 0) {
    return (
      <PageTransition>
        <SEOHead
          title="Acceso Denegado | Panel Administrativo"
          description="Consola interna restringida"
        />
        <Header />
        <main className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4">
          <AccessDeniedState
            title="Consola de Administración"
            description="Tu cuenta no tiene capacidades de administración (admin.read). Solicita acceso al equipo responsable."
            requiredRole="admin"
          />
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const roleLabel = context.user.roles.includes("admin") ? "Administrador" : context.user.roles.includes("editor") ? "Editor" : context.user.roles.includes("moderator") ? "Moderador" : isDemoMode ? "Demostración" : "Personal";
  const initials = (user?.email ?? "AD").slice(0, 2).toUpperCase();

  const sidebar = (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Shield className="h-4 w-4" /></div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-foreground">Descubre RD</p>
        </div>
      </div>

      <nav aria-label="Secciones de administración" className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {groupedTabs.map((group) => (
          <div key={group.category} className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground/80">{group.label}</span>
            </div>
            <ul className="space-y-0.5">
              {group.tabs.map((tab) => {
                const isActive = activeTab?.value === tab.value;
                const Icon = tab.icon;
                const pending = pendingByTab[tab.value] ?? 0;
                const localDrafts = localDraftCountByTab[tab.value] ?? 0;
                return (
                  <li key={tab.value}>
                    <button
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => { setActiveTabValue(tab.value); setMobileMenuOpen(false); }}
                      className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-all duration-150 ${
                        isActive 
                          ? "bg-primary/10 font-semibold text-primary border border-primary/20 shadow-xs" 
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {isActive && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" aria-hidden="true" />}
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                      <span className="flex-1 truncate">{tab.label}</span>
                      {localDrafts > 0 && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                          title={`${localDrafts} borrador(es) guardado(s) en este equipo`}
                          aria-label={`${localDrafts} borradores locales`}
                        />
                      )}
                      {tab.demoOnly && <span className="rounded bg-muted px-1 text-3xs font-medium uppercase text-muted-foreground">demo</span>}
                      {pending > 0 && <span className="rounded-full bg-primary/90 px-1.5 py-0.2 text-3xs font-bold tabular-nums text-primary-foreground shadow-xs" aria-label={`${pending} pendientes`}>{pending}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {groupedTabs.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">Ninguna sección coincide.</p>}
      </nav>

      <div className="shrink-0 border-t border-border/60 p-3 bg-muted/10">
        <div className="flex items-center gap-2.5 rounded-lg p-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">{initials}</div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-semibold text-foreground">{user?.email ?? "Sesión de demostración"}</p>
            <p className="text-3xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {roleLabel}
            </p>
          </div>
          {user && (
            <button type="button" onClick={() => void signOut()} aria-label="Cerrar sesión" title="Cerrar sesión" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <SEOHead title="Consola de administración | Descubre RD" description="Consola empresarial unificada: CMS, ERP, CRM y control de plataforma." />
      <div className="flex min-h-screen bg-muted/20 text-foreground">
        {/* Menú lateral: fijo en escritorio, cajón en móvil */}
        <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-border/60 bg-background lg:flex">{sidebar}</aside>
        {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border/60 bg-background shadow-xl transition-transform duration-200 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!mobileMenuOpen}>
          {sidebar}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {!HAS_BACKEND_SESSION && <MockDataNotice />}

          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú"><Menu className="h-5 w-5" /></Button>
            <nav aria-label="Ruta" className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden text-muted-foreground font-medium sm:inline">Administración</span>
              <ChevronRight className="hidden h-3 w-3 text-muted-foreground/60 sm:inline" />
              <span className="hidden text-muted-foreground sm:inline">
                {activeTab ? CATEGORY_CONFIG[activeTab.category].label : "Panel"}
              </span>
              <ChevronRight className="hidden h-3 w-3 text-muted-foreground/60 sm:inline" />
              <span className="truncate font-semibold text-foreground text-sm">{activeTab?.label ?? "Inicio"}</span>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {!isOnline && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-3xs font-medium text-amber-700 dark:text-amber-300">
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">Sin internet · respaldo local activo</span>
                  <span className="sm:hidden">Sin red</span>
                </span>
              )}
              {totalLocalDrafts > 0 && activeTabValue !== "dashboard" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTabValue("dashboard")}
                  className="h-8 gap-1.5 border-amber-500/40 bg-amber-500/10 text-xs text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
                >
                  <History className="h-3.5 w-3.5" />
                  <span className="tabular-nums">{totalLocalDrafts}</span>
                  <span className="hidden md:inline">borrador{totalLocalDrafts === 1 ? "" : "es"} local{totalLocalDrafts === 1 ? "" : "es"}</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={theme.toggle}
                aria-label={theme.dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"} title={theme.dark ? "Modo claro" : "Modo oscuro"}>
                {theme.dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {isDemoMode && <Badge variant="secondary" className="hidden sm:inline-flex text-3xs">Datos de demostración</Badge>}
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg border-border/60 hover:bg-muted/60" asChild>
                <Link to="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 sm:mr-1.5" /><span className="hidden sm:inline">Ver portal público</span></Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-6">
            <div className="mx-auto w-full max-w-[1600px]">
              {activeTab ? (
                <>
                  <div className="mb-6 pb-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-foreground">{activeTab.label}</h1>
                      <p className="text-xs text-muted-foreground mt-0.5">{TAB_DESCRIPTIONS[activeTab.value] ?? CATEGORY_CONFIG[activeTab.category].description}</p>
                    </div>
                  </div>
                  <div>{activeTab.render({ tabs: visibleTabs })}</div>
                </>
              ) : (
                <p className="py-20 text-center text-muted-foreground">Elige una sección en el menú.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
