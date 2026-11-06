import { Suspense, lazy, useState, useMemo, useEffect, useCallback, type ReactElement } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { StagingNewsCategoriesManager, StagingNewsManager, StagingProvincesManager } from "@/components/admin/staging/StagingCrudManager";
import { StagingEstablishmentRequestsManager, StagingLeadsManager } from "@/components/admin/staging/StagingFormsManagers";
import { MediaLibrary } from "@/components/admin/staging/MediaLibrary";
import { StagingUsersManager } from "@/components/admin/staging/StagingUsersManager";
import { Shield, Loader2, Search, Menu, X, ChevronRight, ExternalLink, LogOut, MapPin, Newspaper, Users, Tags, Gift, Building2, Moon, Sun, Image as ImageIcon } from "lucide-react";

type TabCategory = "erp" | "crm" | "cms" | "system";

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
  render: () => ReactElement;
}

/** Qué se hace en cada sección: es el subtítulo de su pantalla. */
const TAB_DESCRIPTIONS: Record<string, string> = {
  dashboard: "Ventas, reservas e indicadores clave del día",
  pedidos: "Pedidos de la tienda y confirmación de depósitos y transferencias",
  productos: "Productos, existencias, fotos y categorías de la tienda",
  "reservas-directas": "Reservas hechas en el portal: estado, cobros y cancelaciones",
  indicadores: "Ingresos, comisiones y liquidaciones",
  stock: "Envíos, seguimiento y entregas de pedidos",
  cupones: "Códigos de descuento, límites de uso y vigencia",
  membresias: "Planes, precios y suscriptores",
  finance_lottery: "Resultados de loterías y tasas de cambio",
  usuarios: "Cuentas, roles, suspensiones y puntos",
  operadores: "Operadores y socios: verificación y estado",
  leads: "Solicitudes comerciales y su seguimiento",
  soporte: "Consultas de usuarios y sus respuestas",
  embajadores: "Embajadores, referidos y comisiones",
  encuestas: "Encuestas publicadas y sus respuestas",
  nps: "Satisfacción de los visitantes a lo largo del tiempo",
  establecimientos: "Hoteles, restaurantes, bares, spas y demás negocios: alta, edición y publicación",
  editorial: "Artículos de la revista: redacción, revisión y publicación",
  contenido: "Catálogos del portal y documentos de contenido",
  medios: "Fotos y archivos subidos al portal",
  traducciones: "Textos de la interfaz en cada idioma",
  "eventos-propuestos": "Eventos enviados por usuarios, pendientes de aprobar",
  sorteos: "Sorteos, participantes y ganadores",
  routebuilder: "Rutas turísticas y sus paradas",
  gamificacion: "Retos, sellos, niveles y recompensas",
  aigenerator: "Borradores de texto generados con IA",
  "paginas-fijas": "Edita los textos y las imágenes de cada página del portal y mira el resultado al instante",
  banners: "Anuncios, ubicaciones y campañas",
  analytics: "Visitas, búsquedas y embudos de conversión",
  gobernanza: "Quién puede hacer qué: roles y permisos",
  moderacion: "Reseñas, fotos y reportes pendientes de revisar",
  accesos: "Inicios de sesión, sesiones activas y permisos temporales",
  audit: "Historial de acciones del personal",
  system_console: "Estado de los servicios y trabajos programados",
  import: "Carga de datos desde archivos",
  entidades: "Consulta directa de las tablas del catálogo",
  ajustes: "Configuración general del portal",
  creadores: "Creadores registrados, sus enlaces de afiliado e invitaciones a estancias",
  "campanas-creadores": "Campañas con creadores de contenido y sus entregas",
};

const CATEGORY_CONFIG: Record<TabCategory, { label: string; badge: string; description: string; order: number }> = {
  erp: { label: "ERP & Operaciones", badge: "ERP", description: "Finanzas, inventario, reservas y logística", order: 1 },
  crm: { label: "CRM & Relaciones", badge: "CRM", description: "Usuarios, operadores, leads y soporte", order: 2 },
  cms: { label: "CMS & Contenidos", badge: "CMS", description: "Artículos, catálogos, medios e idiomas", order: 3 },
  system: { label: "Sistema & Seguridad", badge: "CORE", description: "Gobernanza, auditoría y configuración", order: 4 },
};


// Rama staging: el panel solo gestiona provincias y noticias contra el mini backend (api/index.ts).
// La capacidad no existe a propósito: el acceso lo da el rol real de la sesión (allowRoles), no el contexto
// de demostración que se carga con la landing en datos locales.
const ADMIN_TABS: AdminTab[] = [
  { value: "provincias", label: "Provincias", category: "cms", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: MapPin, iconClass: "text-emerald-500", render: () => <StagingProvincesManager /> },
  { value: "noticias", label: "Noticias", category: "cms", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: Newspaper, iconClass: "text-primary", render: () => <StagingNewsManager /> },
  { value: "medios", label: "Biblioteca de medios", category: "cms", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: ImageIcon, iconClass: "text-cyan-500", render: () => <MediaLibrary /> },
  { value: "categorias-noticias", label: "Categorías de noticias", category: "cms", capability: "staging.panel", allowRoles: ["admin", "editor"], icon: Tags, iconClass: "text-amber-500", render: () => <StagingNewsCategoriesManager /> },
  { value: "sorteo", label: "Participantes del sorteo", category: "crm", capability: "staging.panel", allowRoles: ["admin"], icon: Gift, iconClass: "text-pink-500", render: () => <StagingLeadsManager /> },
  { value: "solicitudes-negocios", label: "Solicitudes de negocios", category: "crm", capability: "staging.panel", allowRoles: ["admin"], icon: Building2, iconClass: "text-orange-500", render: () => <StagingEstablishmentRequestsManager /> },
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

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Filtrado de pestañas por buscador en el sidebar
  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return visibleTabs;
    const q = searchQuery.toLowerCase().trim();
    return visibleTabs.filter((t) =>
      t.label.toLowerCase().includes(q) ||
      CATEGORY_CONFIG[t.category].label.toLowerCase().includes(q)
    );
  }, [visibleTabs, searchQuery]);

  // Agrupación por categoría
  const groupedTabs = useMemo(() => {
    const groups: Partial<Record<TabCategory, AdminTab[]>> = {};
    for (const tab of filteredTabs) {
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
  }, [filteredTabs]);

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
          <p className="text-2xs text-muted-foreground">Consola de administración</p>
        </div>
      </div>

      <div className="shrink-0 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar módulos, tablas..." aria-label="Buscar sección" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 pl-8 text-xs bg-muted/40 border-border/60 rounded-lg focus-visible:ring-1 focus-visible:ring-primary" />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Secciones de administración" className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        {groupedTabs.map((group) => (
          <div key={group.category} className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground/80">{group.label}</span>
              <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-semibold border border-border/40">
                {CATEGORY_CONFIG[group.category].badge}
              </span>
            </div>
            <ul className="space-y-0.5">
              {group.tabs.map((tab) => {
                const isActive = activeTab?.value === tab.value;
                const Icon = tab.icon;
                const pending = pendingByTab[tab.value] ?? 0;
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
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-background lg:flex">{sidebar}</aside>
        {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-background shadow-xl transition-transform duration-200 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!mobileMenuOpen}>
          {sidebar}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {!HAS_BACKEND_SESSION && <MockDataNotice />}

          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú"><Menu className="h-5 w-5" /></Button>
            <nav aria-label="Ruta" className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden text-muted-foreground font-medium sm:inline">Suite Unificada</span>
              <ChevronRight className="hidden h-3 w-3 text-muted-foreground/60 sm:inline" />
              <Badge variant="outline" className="text-3xs uppercase font-semibold tracking-wider border-border/60 bg-muted/30">
                {activeTab ? CATEGORY_CONFIG[activeTab.category].label : "Administración"}
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
              <span className="truncate font-semibold text-foreground text-sm">{activeTab?.label ?? "Inicio"}</span>
            </nav>
            <div className="ml-auto flex items-center gap-2">
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
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{activeTab.label}</h1>
                        <span className="text-3xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                          {CATEGORY_CONFIG[activeTab.category].badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{TAB_DESCRIPTIONS[activeTab.value] ?? CATEGORY_CONFIG[activeTab.category].description}</p>
                    </div>
                  </div>
                  <div>{activeTab.render()}</div>
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
