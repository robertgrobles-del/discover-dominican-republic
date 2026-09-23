import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Users, Building2, Shield, Loader2, History, Megaphone } from "lucide-react";
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
import { AdminMockupBanners } from "@/components/admin/AdminMockupBanners";

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) throw error;
        setIsAdmin(data);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  if (authLoading || checkingRole) {
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

  if (!isAdmin) {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-destructive" />
                  <CardTitle>Acceso Denegado</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No tienes permisos de administrador para acceder a esta sección.
                  Contacta al administrador del sistema si crees que esto es un error.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title="Panel Administrativo | Descubre RD"
        description="Panel de administración para gestionar contenido turístico"
      />
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
              Gestiona el contenido del portal turístico mediante carga masiva de datos CSV
            </p>
          </div>

          {/* Dashboard Overview */}
          <Tabs defaultValue="dashboard" className="mb-8">
            <TabsList className="flex flex-wrap gap-2 bg-muted/50 p-1 rounded-xl h-auto">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="analytics">Analíticas</TabsTrigger>
              <TabsTrigger value="usuarios" className="gap-1.5">
                <Users className="h-3.5 w-3.5" /> Usuarios
              </TabsTrigger>
              <TabsTrigger value="operadores" className="gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Operadores
              </TabsTrigger>
              <TabsTrigger value="gamificacion">Gamificación</TabsTrigger>
              <TabsTrigger value="import">Importar</TabsTrigger>
              <TabsTrigger value="moderacion">Moderación UGC</TabsTrigger>
              <TabsTrigger value="banners" className="gap-1.5">
                <Megaphone className="h-3.5 w-3.5" /> Banners & Mockups
              </TabsTrigger>
              <TabsTrigger value="routebuilder">Creador de Rutas</TabsTrigger>
              <TabsTrigger value="nps">Analíticas NPS</TabsTrigger>
              <TabsTrigger value="stock">Control de Stock</TabsTrigger>
              <TabsTrigger value="aigenerator">Generador IA</TabsTrigger>
              <TabsTrigger value="audit" className="gap-1.5">
                <History className="h-3.5 w-3.5" /> Historial
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>
            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>
            <TabsContent value="banners" className="mt-6">
              <AdminMockupBanners />
            </TabsContent>
            <TabsContent value="usuarios" className="mt-6">
              <AdminUsuarios />
            </TabsContent>
            <TabsContent value="operadores" className="mt-6">
              <AdminOperadores />
            </TabsContent>
            <TabsContent value="gamificacion">
              <AdminGamification />
            </TabsContent>
            <TabsContent value="import">
              <AdminImportEstablecimientos />
            </TabsContent>
            <TabsContent value="moderacion">
              <UGCModerationPanel />
            </TabsContent>
            <TabsContent value="routebuilder">
              <AdminRouteBuilder />
            </TabsContent>
            <TabsContent value="nps">
              <AdminNpsAnalytics />
            </TabsContent>
            <TabsContent value="stock">
              <AdminStockConsole />
            </TabsContent>
            <TabsContent value="aigenerator">
              <AdminAiGenerator />
            </TabsContent>
            <TabsContent value="audit">
              <AdminAuditLogs />
            </TabsContent>
          </Tabs>

          <EntityImportManager />
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default AdminPanel;
