import { Suspense, lazy, type ReactElement } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useAuth } from "@/hooks/useAuth";
import { useAccessContext } from "@/hooks/useAccessContext";
import { usePanelAdoption } from "@/lib/adoption";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { MockDataNotice } from "@/components/MockDataNotice";
import { Navigate } from "react-router-dom";
import { Users, Building2, Shield, ShieldCheck, Megaphone, Coins, Sparkles, KeyRound, Loader2 } from "lucide-react";
import { AdminFinanceLotteryManager } from "@/components/admin/AdminFinanceLotteryManager";
import { EntityImportManager } from "@/components/admin/EntityImportManager";
import { UGCModerationPanel } from "@/components/admin/UGCModerationPanel";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminImportEstablecimientos } from "@/components/admin/AdminImportEstablecimientos";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminGamification } from "@/components/admin/AdminGamification";
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

/**
 * Consola interna (Plan de accesos y paneles por perfil, puntos 45-58 y 66).
 *
 * La navegación se construye a partir de las capacidades que concede el servidor
 * (`GET /api/v1/me/context`), no de un booleano local ni de esconder pestañas: un editor ve la mesa
 * editorial, un moderador su cola y un administrador todo. Cada endpoint vuelve a comprobar el permiso,
 * así que esconder una pestaña es comodidad, nunca seguridad.
 *
 * Las pantallas que solo existen como maqueta (el simulador de banners) quedan fuera del build real:
 * se declaran `demoOnly` y solo se montan con datos simulados.
 */

interface AdminTab {
  value: string;
  label: string;
  /** Capacidad del catálogo del servidor que hace visible esta pestaña. */
  capability: string;
  icon?: typeof Shield;
  iconClass?: string;
  /** Solo existe con datos simulados (maqueta); nunca se monta en el build real. */
  demoOnly?: boolean;
  render: () => ReactElement;
}

/**
 * El simulador de banners es una maqueta: se carga bajo demanda y solo se monta con datos simulados, así
 * que en el build real (`VITE_DATA_SOURCE=api`) su código nunca se descarga ni se ejecuta (punto 57).
 */
const LazyMockupBanners = lazy(() =>
  import("@/components/admin/AdminMockupBanners").then((m) => ({ default: m.AdminMockupBanners })),
);

const ADMIN_TABS: AdminTab[] = [
  { value: "dashboard", label: "Inicio / Dashboard", capability: "editorial.content", render: () => <AdminDashboard /> },
  { value: "analytics", label: "Analíticas", capability: "editorial.content", render: () => <AdminAnalytics /> },
  { value: "banners", label: "Banners & Anuncios", capability: "editorial.content", icon: Megaphone, iconClass: "text-primary", demoOnly: true, render: () => (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
      <LazyMockupBanners />
    </Suspense>
  ) },
  { value: "usuarios", label: "Usuarios & Roles", capability: "admin.accounts", icon: Users, render: () => <AdminUsuarios /> },
  { value: "operadores", label: "Negocios & Operadores", capability: "admin.accounts", icon: Building2, render: () => <AdminOperadores /> },
  { value: "reservas-directas", label: "Reservas Directas", capability: "admin.finance", render: () => <AdminReservasDirectas /> },
  { value: "gobernanza", label: "Aprobaciones y revisiones", capability: "admin.accounts", icon: ShieldCheck, iconClass: "text-primary", render: () => <AccessGovernancePanel /> },
  { value: "campanas-creadores", label: "Campañas con creadores", capability: "admin.accounts", icon: Megaphone, iconClass: "text-primary", render: () => <AdminCreatorCampaigns /> },
  { value: "accesos", label: "Auditoría de accesos", capability: "admin.access_catalog", icon: KeyRound, iconClass: "text-primary", render: () => <PermissionAuditPanel /> },
  { value: "moderacion", label: "Moderación UGC", capability: "moderation.queue", render: () => <UGCModerationPanel /> },
  { value: "routebuilder", label: "Creador de Rutas", capability: "editorial.content", render: () => <AdminRouteBuilder /> },
  { value: "import", label: "Importar CSV", capability: "admin.content_ops", render: () => <AdminImportEstablecimientos /> },
  { value: "gamificacion", label: "Gamificación", capability: "admin.global_config", render: () => <AdminGamification /> },
  { value: "nps", label: "NPS Analytics", capability: "editorial.content", render: () => <AdminNpsAnalytics /> },
  { value: "stock", label: "Control de Stock", capability: "admin.finance", render: () => <AdminStockConsole /> },
  { value: "aigenerator", label: "Generador IA", capability: "admin.content_ops", icon: Sparkles, iconClass: "text-amber-500", render: () => <AdminAiGenerator /> },
  { value: "finance_lottery", label: "Loterías & Tasas", capability: "admin.finance", icon: Coins, iconClass: "text-amber-500", render: () => <AdminFinanceLotteryManager /> },
  { value: "audit", label: "Audit Log", capability: "admin.audit_read", render: () => <AdminAuditLogs /> },
];

/** Cualquiera de estas capacidades abre la consola interna; ninguna pertenece a un usuario corriente. */
const STAFF_CAPABILITIES = ADMIN_TABS.map((t) => t.capability);

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const { can, loading: accessLoading, context, demo } = useAccessContext();
  usePanelAdoption("admin");

  // El filtro es barato y depende de las capacidades ya cargadas del contexto de acceso.
  const visibleTabs = ADMIN_TABS.filter((tab) => can(tab.capability) && (!tab.demoOnly || IS_MOCK_DATA));
  const isStaff = visibleTabs.length > 0;
  const canImportEntities = can("admin.content_ops");

  if (authLoading || accessLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaff) {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <AccessDeniedState
              title="Consola interna restringida"
              description="Tu cuenta no tiene ninguna capacidad de la consola interna. Editor, moderador y administrador se asignan por invitación; si crees que es un error, solicita el acceso indicando tu caso de uso."
              requiredRole="admin, editor o moderator"
              onRequestAccess={() => { window.location.href = "mailto:soporte@descubrerd.com?subject=Solicitud%20de%20acceso%20a%20la%20consola%20interna"; }}
            />
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const defaultTab = visibleTabs[0]?.value ?? "dashboard";

  return (
    <PageTransition>
      <SEOHead
        title="Panel Administrativo | Descubre República Dominicana"
        description="Panel de administración para gestionar contenido turístico, moderación, leads y catálogo"
      />
      <MockDataNotice />
      <SupportImpersonationBanner />
      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Panel Administrativo</h1>
            </div>
            <p className="text-muted-foreground">
              {visibleTabs.length} área{visibleTabs.length === 1 ? "" : "s"} habilitada{visibleTabs.length === 1 ? "" : "s"} según tus
              capacidades{demo ? " (entorno de demostración)" : ""}
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="mb-8 space-y-6">
            <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 border-b border-border/50 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> Consola Interna de Administración
                </span>
                <span className="text-xs text-muted-foreground">
                  Nivel de acceso: {context.user.roles.length > 0 ? context.user.roles.join(", ") : "personal interno"}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span>Áreas habilitadas para tu cuenta:</span>
                </div>
                <TabsList className="flex flex-wrap gap-1.5 bg-muted/40 p-1.5 rounded-xl h-auto w-full justify-start">
                  {visibleTabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5">
                      {tab.icon && <tab.icon className={`h-3.5 w-3.5 ${tab.iconClass ?? ""}`} aria-hidden />}
                      {tab.label}
                      {tab.demoOnly && <span className="ml-1 text-[10px] font-mono uppercase text-muted-foreground">demo</span>}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {visibleTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                {tab.render()}
              </TabsContent>
            ))}
          </Tabs>

          {canImportEntities ? <EntityImportManager /> : (
            <p className="text-xs text-muted-foreground">
              La importación de entidades requiere la capacidad <span className="font-mono">admin.content_ops</span>.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default AdminPanel;
