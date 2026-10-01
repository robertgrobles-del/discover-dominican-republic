import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Hotel, Users, Link2, Copy, Check, ShieldCheck, Gavel, Video, Wallet } from "lucide-react";
import { toast } from "sonner";
import { creatorsPool, initialSponsoredOpportunities, Creator, SponsoredOpportunity } from "@/data/creatorsData";
import { PanoramaAd } from "@/components/promo";
import { usePanelAdoption } from "@/lib/adoption";

import { CreatorsMetrics } from "@/components/creators/CreatorsMetrics";
import { CreatorsMonetizationInfoCard } from "@/components/creators/CreatorsMonetizationInfoCard";
import { CreatorsOnboardingModal } from "@/components/creators/CreatorsOnboardingModal";
import { CreatorsSponsorshipsTab } from "@/components/creators/CreatorsSponsorshipsTab";
import { CreatorsAffiliatesTab } from "@/components/creators/CreatorsAffiliatesTab";
import { CreatorsPoolTab } from "@/components/creators/CreatorsPoolTab";
import { CreatorsVideosTab, CreatorVideoItem } from "@/components/creators/CreatorsVideosTab";
import { CreatorsPayoutsTab } from "@/components/creators/CreatorsPayoutsTab";
import { CreatorsIdentityTab } from "@/components/creators/CreatorsIdentityTab";
import { CreatorsAppealsTab, CreatorAppealItem } from "@/components/creators/CreatorsAppealsTab";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

interface CreatorDashboard {
  profile: { id: string; handle: string; display_name: string; tier: string; total_views: number; total_earnings: number | string; balance_available: number | string; balance_pending: number | string; commission_rate: number | string; status: string };
  videos: Array<{ id: string; title: string; destination_name: string | null; views_count: number; status: string; created_at: string; moderation_rule?: string | null; review_notes?: string | null }>;
  payouts: Array<{ id: string; amount: number | string; status: string; created_at: string }>;
}

export default function ProgramaCreadores() {
  const { session } = useAuth();
  const [creatorDashboard, setCreatorDashboard] = useState<CreatorDashboard | null>(null);
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [creatorLoadError, setCreatorLoadError] = useState<string | null>(null);
  const loadCreatorDashboard = useCallback(async () => {
    if (!session?.access_token) { setCreatorDashboard(null); setCreatorLoading(false); return; }
    setCreatorLoading(true);
    setCreatorLoadError(null);
    try {
      const result = await fetchApi<{ data: CreatorDashboard }>("/creators/me", { headers: { Authorization: `Bearer ${session.access_token}` } });
      setCreatorDashboard(result.data);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) setCreatorDashboard(null);
      else setCreatorLoadError("No pudimos cargar los datos del creador. Intenta de nuevo más tarde.");
    } finally { setCreatorLoading(false); }
  }, [session?.access_token]);
  useEffect(() => { void loadCreatorDashboard(); }, [loadCreatorDashboard]);
  // Punto 67: una sola marca de apertura del panel de creador por montaje.
  usePanelAdoption("creador");

  // Dashboard & Balance States
  const affiliateCode = "";
  const [copiedLink, setCopiedLink] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Matchmaking & Sponsorships States
  const [opportunities, setOpportunities] = useState<SponsoredOpportunity[]>(initialSponsoredOpportunities);
  const [selectedOpp, setSelectedOpp] = useState<SponsoredOpportunity | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const creatorVideos: CreatorVideoItem[] = (creatorDashboard?.videos ?? []).map(video => ({
    id: video.id, title: video.title, dest: video.destination_name ?? "—", views: video.views_count,
    bookings: 0, earnings: "—", status: video.status, date: video.created_at,
    ruleCode: video.moderation_rule ?? undefined, reviewNotes: video.review_notes ?? undefined,
  }));

  // Las apelaciones se cargan desde el servicio; no se precargan filas de ejemplo.
  const [creatorAppeals, setCreatorAppeals] = useState<CreatorAppealItem[]>(
    [],
  );
  const [appealsReloadKey, setAppealsReloadKey] = useState(0);

  const handleAppealSubmitted = (appeal: CreatorAppealItem) => {
    setCreatorAppeals(prev => [appeal, ...prev.filter(item => item.id !== appeal.id)]);
    setAppealsReloadKey(key => key + 1);
  };

  const handleCopyAffiliate = (url: string) => {
    if (!affiliateCode) { toast.info("El enlace personal estará disponible cuando el backend habilite el código de creador."); return; }
    navigator.clipboard.writeText(`${url}${affiliateCode}`);
    setCopiedLink(true);
    toast.success("¡Enlace de afiliado con tu código copiado al portapapeles!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAssignCreatorToHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !selectedCreatorId) {
      toast.error("Por favor selecciona una oportunidad de patrocinio y un creador del pool.");
      return;
    }

    const creator = creatorsPool.find((c: Creator) => c.id === selectedCreatorId);
    setIsAssigning(true);

    setTimeout(() => {
      setOpportunities(prev => prev.map(opp => {
        if (opp.id === selectedOpp.id) {
          return {
            ...opp,
            status: "Asignada",
            assignedCreatorId: selectedCreatorId
          };
        }
        return opp;
      }));

      setIsAssigning(false);
      toast.success(`¡Creador ${creator?.name} (${creator?.handle}) asignado exitosamente al hotel ${selectedOpp.hotelName} en ${selectedOpp.destination}! 🎉`);
      setSelectedOpp(null);
      setSelectedCreatorId("");
    }, 1200);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Programa de Creadores, Influencers y Enlaces de Afiliados | Descubre RD"
        description="Monetiza tu contenido de viajes, genera ingresos con enlaces de afiliados y postúlate a estancias patrocinadas 100% gratis en hoteles de Puerto Plata, Samaná y Punta Cana."
        keywords="creadores turismo rd, influencers republica dominicana, patrocinios hoteles pop, afiliados hoteles rd, fam trips dominicana"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 py-10">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Ecosistema de Creadores & Hoteles Patrocinadores
                </Badge>
                <h1 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  Programa de Creadores & <span className="text-primary">Matchmaking de Patrocinios</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Consulta tus métricas reales y conoce las opciones de colaboración disponibles para creadores.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button size="sm" onClick={() => setOnboardingOpen(true)} className="rounded-xl text-xs font-bold gap-1.5 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" /> Postularse al Programa
                </Button>
                <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Tu Código de Afiliado</p>
                  <p className="text-xs font-mono font-bold text-muted-foreground">{affiliateCode || "Aún no disponible"}</p>
                  </div>
                  <Button size="sm" variant="outline" disabled={!affiliateCode} onClick={() => handleCopyAffiliate("https://descubrerd.com?ref=")} className="text-xs rounded-xl h-8">
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <CreatorsMetrics profile={creatorDashboard?.profile ?? null} loading={creatorLoading} error={creatorLoadError} />

            {/* Monetization Model Info Card (3 Capas Integradas) */}
            <CreatorsMonetizationInfoCard />

            {/* Navigation Tabs */}
            <Tabs defaultValue="patrocinios" className="space-y-6">
              <TabsList className="bg-muted p-1 rounded-2xl flex flex-wrap h-auto gap-1">
                <TabsTrigger value="patrocinios" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Hotel className="h-4 w-4" /> Matchmaking Hoteles (Estadías Gratis)
                </TabsTrigger>
                <TabsTrigger value="afiliados" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Link2 className="h-4 w-4" /> Enlaces de Afiliados
                </TabsTrigger>
                <TabsTrigger value="creadores" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Users className="h-4 w-4" /> Pool de Creadores Registrados
                </TabsTrigger>
                <TabsTrigger value="videos" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Video className="h-4 w-4" /> Mis Contenidos & Vistas
                </TabsTrigger>
                <TabsTrigger value="pagos" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Wallet className="h-4 w-4" /> Retirar Fondos
                </TabsTrigger>
                <TabsTrigger value="identidad" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <ShieldCheck className="h-4 w-4" /> Identidad y reputación
                </TabsTrigger>
                <TabsTrigger value="apelaciones" className="rounded-xl text-xs font-semibold gap-1.5 py-2 px-4">
                  <Gavel className="h-4 w-4" /> Apelaciones
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Matchmaking de Hoteles Patrocinados */}
              <TabsContent value="patrocinios">
                <CreatorsSponsorshipsTab
                  opportunities={opportunities}
                  selectedOpp={selectedOpp}
                  selectedCreatorId={selectedCreatorId}
                  isAssigning={isAssigning}
                  onSelectOpp={setSelectedOpp}
                  onSelectCreatorId={setSelectedCreatorId}
                  onAssignCreator={handleAssignCreatorToHotel}
                />
              </TabsContent>

              {/* TAB 2: Enlaces de Afiliados */}
              <TabsContent value="afiliados">
                <CreatorsAffiliatesTab />
              </TabsContent>

              {/* TAB 3: Pool de Creadores Registrados */}
              <TabsContent value="creadores">
                <CreatorsPoolTab />
              </TabsContent>

              {/* TAB 4: Mis Contenidos & Vistas */}
              <TabsContent value="videos">
                <CreatorsVideosTab
                  creatorVideos={creatorVideos}
                  onAppealSubmitted={handleAppealSubmitted}
                  loading={creatorLoading}
                  hasProfile={Boolean(creatorDashboard)}
                />
              </TabsContent>

              {/* TAB 5: Pagos y Retiro */}
              <TabsContent value="pagos">
                <CreatorsPayoutsTab profile={creatorDashboard?.profile ?? null} payouts={creatorDashboard?.payouts ?? []} />
              </TabsContent>

              {/* TAB 6: Identidad y reputación del creador (punto 41) */}
              <TabsContent value="identidad">
                <CreatorsIdentityTab />
              </TabsContent>

              {/* TAB 7: Apelaciones de moderación (punto 44) */}
              <TabsContent value="apelaciones">
                <CreatorsAppealsTab appeals={creatorAppeals} reloadKey={appealsReloadKey} />
              </TabsContent>
            </Tabs>

            <div className="mt-12">
              <PanoramaAd />
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <CreatorsOnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
      />
    </PageTransition>
  );
}
