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
import {
  Users, Building2, Shield, ShieldCheck, Megaphone, Coins, Sparkles, KeyRound,
  Loader2, FileText, Store, BookOpen, LayoutDashboard, BarChart3, TrendingUp,
  Layers, MessageSquare, Route, UploadCloud, Trophy, Smile, Boxes, ScrollText,
  CalendarCheck, Search, Menu, X, ChevronRight, Ticket, Server, Banknote, ExternalLink, LogOut
} from "lucide-react";
import { AdminEditorialManager } from "@/components/admin/AdminEditorialManager";
import { AdminFinanceLotteryManager } from "@/components/admin/AdminFinanceLotteryManager";
import { AdminStoreMarketplace } from "@/components/admin/AdminStoreMarketplace";
import { EntityImportManager } from "@/components/admin/EntityImportManager";
import { UGCModerationPanel } from "@/components/admin/UGCModerationPanel";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminImportEstablecimientos } from "@/components/admin/AdminImportEstablecimientos";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminContentDocuments } from "@/components/admin/AdminContentDocuments";
import { AdminStaticPagesManager } from "@/components/admin/AdminStaticPagesManager";
import { AdminInsightsPanel } from "@/components/admin/AdminInsightsPanel";
import { AdminGamificationTab } from "@/components/admin/AdminGamificationTab";
import { AdminUsuarios } from "@/components/admin/AdminUsuarios";
import { AdminOperadores } from "@/components/admin/AdminOperadores";
import { AdminNpsAnalytics } from "@/components/admin/AdminNpsAnalytics";
import { AdminStockConsole } from "@/components/admin/AdminStockConsole";
import { AdminRouteBuilder } from "@/components/admin/AdminRouteBuilder";
import { AdminAiGenerator } from "@/components/admin/AdminAiGenerator";
import { AdminAuditLogs } from "@/components/admin/AdminAuditLogs";
import { AdminReservasDirectas } from "@/components/admin/AdminReservasDirectas";
import { PermissionAuditPanel } from "@/components/admin/PermissionAuditPanel";
import { AccessGovernancePanel } from "@/components/admin/AccessGovernancePanel";
import { AdminCreatorCampaigns } from "@/components/admin/AdminCreatorCampaigns";
import { SupportImpersonationBanner } from "@/components/admin/SupportImpersonationBanner";
import { AdminCouponsManager } from "@/components/admin/AdminCouponsManager";
import { AdminStoreOrders } from "@/components/admin/AdminStoreOrders";
import { AdminEventApprovals } from "@/components/admin/AdminEventApprovals";
import { AdminSystemConsole } from "@/components/admin/AdminSystemConsole";
import { AdminMembershipPlans } from "@/components/admin/AdminMembershipPlans";

type TabCategory = "overview" | "content" | "community" | "commerce" | "system";

interface AdminTab {
  value: string;
  label: string;
  category: TabCategory;
  capability: string;
  icon: typeof Shield;
  iconClass?: string;
  demoOnly?: boolean;
  render: () => ReactElement;
}

const CATEGORY_CONFIG: Record<TabCategory, { label: string; order: number }> = {
  overview: { label: "General", order: 1 },
  content: { label: "Contenido", order: 2 },
  community: { label: "Comunidad", order: 3 },
  commerce: { label: "Comercio", order: 4 },
  system: { label: "Sistema", order: 5 },
};

const LazyMockupBanners = lazy(() =>
  import("@/components/admin/AdminMockupBanners").then((m) => ({ default: m.AdminMockupBanners })),
);

const ADMIN_TABS: AdminTab[] = [
  // Visión General
  { value: "dashboard", label: "Resumen", category: "overview", capability: "editorial.content", icon: LayoutDashboard, iconClass: "text-primary", render: () => <AdminDashboard /> },
  { value: "analytics", label: "Analítica web", category: "overview", capability: "editorial.content", icon: BarChart3, iconClass: "text-blue-500", render: () => <AdminAnalytics /> },
  { value: "indicadores", label: "Indicadores y finanzas", category: "overview", capability: "admin.finance", icon: TrendingUp, iconClass: "text-emerald-500", render: () => <AdminInsightsPanel /> },
  { value: "nps", label: "Satisfacción (NPS)", category: "overview", capability: "editorial.content", icon: Smile, iconClass: "text-amber-500", render: () => <AdminNpsAnalytics /> },

  // Editorial & Contenido
  { value: "editorial", label: "Revista y publicaciones", category: "content", capability: "editorial.content", icon: BookOpen, iconClass: "text-primary", render: () => <AdminEditorialManager /> },
  { value: "contenido", label: "Contenido del sitio", category: "content", capability: "editorial.content", icon: Layers, iconClass: "text-indigo-500", render: () => <AdminContentDocuments /> },
  { value: "paginas-fijas", label: "Páginas fijas y legales", category: "content", capability: "editorial.content", icon: FileText, iconClass: "text-slate-500", render: () => <AdminStaticPagesManager /> },
  { value: "banners", label: "Banners y anuncios", category: "content", capability: "editorial.content", icon: Megaphone, iconClass: "text-primary", demoOnly: true, render: () => (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
      <LazyMockupBanners />
    </Suspense>
  ) },
  { value: "routebuilder", label: "Rutas gamificadas", category: "content", capability: "editorial.content", icon: Route, iconClass: "text-teal-500", render: () => <AdminRouteBuilder /> },
  { value: "aigenerator", label: "Redacción con IA", category: "content", capability: "admin.content_ops", icon: Sparkles, iconClass: "text-amber-500", render: () => <AdminAiGenerator /> },

  // Comunidad & Operadores
  { value: "usuarios", label: "Usuarios y roles", category: "community", capability: "admin.accounts", icon: Users, iconClass: "text-sky-500", render: () => <AdminUsuarios /> },
  { value: "operadores", label: "Negocios y operadores", category: "community", capability: "admin.accounts", icon: Building2, iconClass: "text-orange-500", render: () => <AdminOperadores /> },
  { value: "reservas-directas", label: "Reservas", category: "community", capability: "admin.finance", icon: CalendarCheck, iconClass: "text-emerald-500", render: () => <AdminReservasDirectas /> },
  { value: "gobernanza", label: "Accesos por aprobar", category: "community", capability: "admin.accounts", icon: ShieldCheck, iconClass: "text-primary", render: () => <AccessGovernancePanel /> },
  { value: "campanas-creadores", label: "Campañas de creadores", category: "community", capability: "admin.accounts", icon: Megaphone, iconClass: "text-pink-500", render: () => <AdminCreatorCampaigns /> },
  { value: "eventos-propuestos", label: "Eventos por aprobar", category: "community", capability: "editorial.content", icon: CalendarCheck, iconClass: "text-emerald-500", render: () => <AdminEventApprovals /> },
  { value: "moderacion", label: "Moderación", category: "community", capability: "moderation.queue", icon: MessageSquare, iconClass: "text-red-500", render: () => <UGCModerationPanel /> },
  { value: "accesos", label: "Auditoría de accesos", category: "community", capability: "admin.access_catalog", icon: KeyRound, iconClass: "text-primary", render: () => <PermissionAuditPanel /> },

  // Comercio & Fidelización
  { value: "gamificacion", label: "Gamificación y pasaporte", category: "commerce", capability: "admin.global_config", icon: Trophy, iconClass: "text-amber-500", render: () => <AdminGamificationTab /> },
  { value: "stock", label: "Envíos de premios", category: "commerce", capability: "admin.finance", icon: Boxes, iconClass: "text-cyan-500", render: () => <AdminStockConsole /> },
  { value: "pedidos", label: "Pedidos y depósitos", category: "commerce", capability: "admin.finance", icon: Banknote, iconClass: "text-emerald-500", render: () => <AdminStoreOrders /> },
  { value: "marketplace", label: "Tienda (maqueta)", category: "commerce", capability: "admin.finance", icon: Store, iconClass: "text-emerald-500", demoOnly: true, render: () => <AdminStoreMarketplace /> },
  { value: "cupones", label: "Cupones", category: "commerce", capability: "admin.finance", icon: Ticket, iconClass: "text-pink-500", render: () => <AdminCouponsManager /> },
  { value: "membresias", label: "Planes de membresía", category: "commerce", capability: "admin.global_config", icon: ShieldCheck, iconClass: "text-purple-500", render: () => <AdminMembershipPlans /> },
  { value: "finance_lottery", label: "Loterías y tasas", category: "commerce", capability: "admin.finance", icon: Coins, iconClass: "text-amber-500", render: () => <AdminFinanceLotteryManager /> },

  // Sistema & Auditoría
  { value: "system_console", label: "Sistema y tareas", category: "system", capability: "admin.content_ops", icon: Server, iconClass: "text-emerald-500", render: () => <AdminSystemConsole /> },
  { value: "import", label: "Importar establecimientos", category: "system", capability: "admin.content_ops", icon: UploadCloud, iconClass: "text-indigo-500", render: () => <AdminImportEstablecimientos /> },
  { value: "entidades", label: "Catálogo", category: "system", capability: "admin.content_ops", icon: Boxes, iconClass: "text-cyan-500", render: () => <EntityImportManager /> },
  { value: "audit", label: "Bitácora de auditoría", category: "system", capability: "admin.audit_read", icon: ScrollText, iconClass: "text-violet-500", render: () => <AdminAuditLogs /> },
];

export default function AdminPanel() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can, loading: accessLoading, context, demo } = useAccessContext();
  usePanelAdoption("admin");

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // El modo demo solo aplica cuando NO hay sesión de backend real
  const isDemoMode = !HAS_BACKEND_SESSION && (demo || IS_MOCK_DATA);

  // Con sesión real de backend, las pestañas salen estrictamente de can(tab.capability)
  // y se descartan las pestañas demoOnly
  const visibleTabs = useMemo(() => {
    if (isDemoMode) {
      return ADMIN_TABS;
    }
    return ADMIN_TABS.filter((tab) => can(tab.capability) && (!tab.demoOnly || !HAS_BACKEND_SESSION));
  }, [can, isDemoMode]);

  const activeTabValue = searchParams.get("seccion") ?? visibleTabs[0]?.value ?? "dashboard";
  const setActiveTabValue = useCallback((value: string) => setSearchParams({ seccion: value }, { replace: false }), [setSearchParams]);

  // Pendientes que atender, para señalarlos en el menú. Comparte caché con el dashboard.
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard-kpis"],
    queryFn: async () => (HAS_BACKEND_SESSION ? await adminDashboardApi.getDashboard() : null),
    enabled: HAS_BACKEND_SESSION && Boolean(user),
    staleTime: 60_000,
  });
  const pendingByTab = useMemo<Record<string, number>>(() => {
    const p = dashboard?.pending;
    if (!p) return {};
    return {
      moderacion: (p.reviews ?? 0) + (p.ugc_reports ?? 0) + (p.reported_posts ?? 0) + (p.ugc_media ?? 0),
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
          <p className="text-[11px] text-muted-foreground">Consola de administración</p>
        </div>
      </div>

      <div className="shrink-0 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar sección" aria-label="Buscar sección" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 pl-8 text-sm" />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Secciones de administración" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groupedTabs.map((group) => (
          <div key={group.category}>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group.label}</p>
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
                      className={`group relative flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                        isActive ? "bg-primary/10 font-semibold text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {isActive && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" aria-hidden="true" />}
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                      <span className="flex-1 truncate">{tab.label}</span>
                      {tab.demoOnly && <span className="rounded bg-muted px-1 text-[10px] font-medium uppercase text-muted-foreground">demo</span>}
                      {pending > 0 && <span className="rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground" aria-label={`${pending} pendientes`}>{pending}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {groupedTabs.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">Ninguna sección coincide.</p>}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{initials}</div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-foreground">{user?.email ?? "Sesión de demostración"}</p>
            <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
          </div>
          {user && (
            <button type="button" onClick={() => void signOut()} aria-label="Cerrar sesión" title="Cerrar sesión" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <SEOHead title="Consola de administración | Descubre RD" description="Consola interna para gestionar contenido, comunidad, comercio y sistema." />
      <div className="flex min-h-screen bg-muted/30 text-foreground">
        {/* Menú lateral: fijo en escritorio, cajón en móvil */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">{sidebar}</aside>
        {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background shadow-xl transition-transform duration-200 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!mobileMenuOpen}>
          {sidebar}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {!HAS_BACKEND_SESSION && <MockDataNotice />}
          <SupportImpersonationBanner />

          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú"><Menu className="h-5 w-5" /></Button>
            <nav aria-label="Ruta" className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="hidden text-muted-foreground sm:inline">{activeTab ? CATEGORY_CONFIG[activeTab.category].label : "Administración"}</span>
              <ChevronRight className="hidden h-3.5 w-3.5 text-muted-foreground/60 sm:inline" />
              <span className="truncate font-medium text-foreground">{activeTab?.label ?? "Inicio"}</span>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {isDemoMode && <Badge variant="secondary" className="hidden sm:inline-flex">Datos de demostración</Badge>}
              <Button variant="outline" size="sm" asChild>
                <Link to="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Ver sitio</span></Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1600px]">
              {activeTab ? (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">{activeTab.label}</h1>
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
