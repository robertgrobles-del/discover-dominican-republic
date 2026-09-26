import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/hooks/useI18n";
import { CartProvider } from "@/hooks/useCart";

// Lazy load non-critical global UI
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));
const ChatbotTuristico = lazy(() => import("@/components/ChatbotTuristico").then(m => ({ default: m.ChatbotTuristico })));
const GamificationToastOverlay = lazy(() => import("@/components/gamification/GamificationToast").then(m => ({ default: m.GamificationToastOverlay })));
const ExitIntentModal = lazy(() => import("@/components/promo/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));
const CookieConsentBanner = lazy(() => import("@/components/privacy/CookieConsentBanner").then(m => ({ default: m.CookieConsentBanner })));

const Index = lazy(() => import("./pages/Index"));
import NotFound from "./pages/NotFound";
import DestinoDetalle from "./pages/DestinoDetalle";

// Lazy loaded pages for better performance
const Destinos = lazy(() => import("./pages/Destinos"));
const Actividades = lazy(() => import("./pages/Actividades"));
const Planifica = lazy(() => import("./pages/Planifica"));
const Cultura = lazy(() => import("./pages/Cultura"));
const AlojamientoDetalle = lazy(() => import("./pages/AlojamientoDetalle"));
const RestauranteDetalle = lazy(() => import("./pages/RestauranteDetalle"));
const Revista = lazy(() => import("./pages/Revista"));
const Aeropuerto = lazy(() => import("./pages/Aeropuerto"));
const VidaNocturna = lazy(() => import("./pages/VidaNocturna"));
const DirectorioAgencias = lazy(() => import("./pages/DirectorioAgencias"));
const GuiaGastronomica = lazy(() => import("./pages/GuiaGastronomica"));
const Restaurantes = lazy(() => import("./pages/Restaurantes"));
const ChefPerfil = lazy(() => import("./pages/ChefPerfil"));
const RecetaDetalle = lazy(() => import("./pages/RecetaDetalle"));
const CentroAyuda = lazy(() => import("./pages/CentroAyuda"));
const Sostenible = lazy(() => import("./pages/Sostenible"));
const Articulo = lazy(() => import("./pages/Articulo"));
const Galeria = lazy(() => import("./pages/Galeria"));
const Terminos = lazy(() => import("./pages/Terminos"));
const Playas = lazy(() => import("./pages/Playas"));
const Rios = lazy(() => import("./pages/Rios"));
const Alojamientos = lazy(() => import("./pages/Alojamientos"));
const Estadisticas = lazy(() => import("./pages/Estadisticas"));
const Partners = lazy(() => import("./pages/Partners"));
const SobreNosotros = lazy(() => import("./pages/SobreNosotros"));
// Operadores RD (reservas directas) y Tienda oficial
const Top100 = lazy(() => import("./modules/viajero/RetoTop100"));
const OperadoresLanding = lazy(() => import("./modules/operadores/pages/OperadoresLanding"));
const OperadoresFuncion = lazy(() => import("./modules/operadores/pages/OperadoresFuncion"));
const OperadoresDirectorio = lazy(() => import("./modules/operadores/pages/OperadoresDirectorio"));
const OperadorStorefront = lazy(() => import("./modules/operadores/pages/OperadorStorefront"));
const OperadorServicio = lazy(() => import("./modules/operadores/pages/OperadorServicio"));
const OperatorPanel = lazy(() => import("./modules/operadores/panel/OperatorPanel"));
const TiendaHome = lazy(() => import("./modules/tienda/pages/TiendaHome"));
const TiendaProducto = lazy(() => import("./modules/tienda/pages/TiendaProducto"));
const TiendaCheckout = lazy(() => import("./modules/tienda/pages/TiendaCheckout"));

const DestinosRegiones = lazy(() => import("./pages/DestinosRegiones"));
const Eventos = lazy(() => import("./pages/Eventos"));
const EventoDetalle = lazy(() => import("./pages/EventoDetalle"));
const ComoLlegar = lazy(() => import("./pages/ComoLlegar"));
const Herramientas = lazy(() => import("./pages/Herramientas"));
const Patrimonio = lazy(() => import("./pages/Patrimonio"));
const InfoSeguridad = lazy(() => import("./pages/InfoSeguridad"));
const InfoTransporte = lazy(() => import("./pages/InfoTransporte"));
const Wellness = lazy(() => import("./pages/Wellness"));
const Bodas = lazy(() => import("./pages/Bodas"));
const NauticaCruceros = lazy(() => import("./pages/NauticaCruceros"));
const Inversion = lazy(() => import("./pages/Inversion"));
const MICE = lazy(() => import("./pages/MICE"));
const Experiencias = lazy(() => import("./pages/Experiencias"));
const ExperienciaDetalle = lazy(() => import("./pages/ExperienciaDetalle"));
const MiViaje = lazy(() => import("./pages/MiViaje"));
const Biblioteca = lazy(() => import("./pages/Biblioteca"));
const Compras = lazy(() => import("./pages/Compras"));
const Accesibilidad = lazy(() => import("./pages/Accesibilidad"));
const RDSocial = lazy(() => import("./pages/RDSocial"));
const Empleo = lazy(() => import("./pages/Empleo"));
const EmpleoDetalle = lazy(() => import("./pages/EmpleoDetalle"));
const PasaporteDigital = lazy(() => import("./pages/PasaporteDigital"));
const CineRD = lazy(() => import("./pages/CineRD"));
const AcademiaTuristica = lazy(() => import("./pages/AcademiaTuristica"));
const Ofertas = lazy(() => import("./pages/Ofertas"));
const Encuesta = lazy(() => import("./pages/Encuesta"));
const Webcams = lazy(() => import("./pages/Webcams"));
const TurismoMedico = lazy(() => import("./pages/TurismoMedico"));
const NomadasDigitales = lazy(() => import("./pages/NomadasDigitales"));
const TurismoDeportivo = lazy(() => import("./pages/TurismoDeportivo"));
const ClubRecompensas = lazy(() => import("./pages/ClubRecompensas"));
const ComparadorDestinos = lazy(() => import("./pages/ComparadorDestinos"));
const MisLogros = lazy(() => import("./pages/MisLogros"));
const Opiniones = lazy(() => import("./pages/Opiniones"));
const Sugerencias = lazy(() => import("./pages/Sugerencias"));
const PrensaComunicacion = lazy(() => import("./pages/PrensaComunicacion"));
const Login = lazy(() => import("./pages/Login"));
const Registro = lazy(() => import("./pages/Registro"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const CalculadoraPresupuesto = lazy(() => import("./pages/CalculadoraPresupuesto"));
const EstadoPlayas = lazy(() => import("./pages/EstadoPlayas"));
const GuiasLocales = lazy(() => import("./pages/GuiasLocales"));
const DiccionarioDominicano = lazy(() => import("./pages/DiccionarioDominicano"));
const MapasTematicos = lazy(() => import("./pages/MapasTematicos"));
const FotografosLocales = lazy(() => import("./pages/FotografosLocales"));
const Conectividad = lazy(() => import("./pages/Conectividad"));
const RutasEmbajadores = lazy(() => import("./pages/RutasEmbajadores"));
const RequisitosEmbajadores = lazy(() => import("./pages/RequisitosEmbajadores"));
const GuardianCaribe = lazy(() => import("./pages/GuardianCaribe"));
const PlanificadorGrupal = lazy(() => import("./pages/PlanificadorGrupal"));
const PuertosMarinas = lazy(() => import("./pages/PuertosMarinas"));
const HechoEnRD = lazy(() => import("./pages/HechoEnRD"));
const ComparadorExperiencias = lazy(() => import("./pages/ComparadorExperiencias"));
const Biodiversidad = lazy(() => import("./pages/Biodiversidad"));
const SeguridadVial = lazy(() => import("./pages/SeguridadVial"));
const Tours360 = lazy(() => import("./pages/Tours360"));
const RDEnMovimiento = lazy(() => import("./pages/RDEnMovimiento"));
const ETicket = lazy(() => import("./pages/ETicket"));
const TurismoSensorial = lazy(() => import("./pages/TurismoSensorial"));
const Volunturismo = lazy(() => import("./pages/Volunturismo"));
const IdentificadorComida = lazy(() => import("./pages/IdentificadorComida"));
const Astroturismo = lazy(() => import("./pages/Astroturismo"));
const GuiaEtiqueta = lazy(() => import("./pages/GuiaEtiqueta"));
const PodcastRD = lazy(() => import("./pages/PodcastRD"));
const SouvenirsDigitales = lazy(() => import("./pages/SouvenirsDigitales"));
const EspanolViajero = lazy(() => import("./pages/EspanolViajero"));
const SelloCalidad = lazy(() => import("./pages/SelloCalidad"));
const PuertoDetalle = lazy(() => import("./pages/PuertoDetalle"));
const BarDetalle = lazy(() => import("./pages/BarDetalle"));
const PlayaDetalle = lazy(() => import("./pages/PlayaDetalle"));
const RioDetalle = lazy(() => import("./pages/RioDetalle"));
const AgenciaDetalle = lazy(() => import("./pages/AgenciaDetalle"));
const EstadioDetalle = lazy(() => import("./pages/EstadioDetalle"));
const ClinicaDetalle = lazy(() => import("./pages/ClinicaDetalle"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ParquesTematicos = lazy(() => import("./pages/ParquesTematicos"));
const ParqueDetalle = lazy(() => import("./pages/ParqueDetalle"));
const Ecoturismo = lazy(() => import("./pages/Ecoturismo"));
const TurismoReligioso = lazy(() => import("./pages/TurismoReligioso"));
const HistoriaVivaAR = lazy(() => import("./pages/HistoriaVivaAR"));
const CuevaDetalle = lazy(() => import("./pages/CuevaDetalle"));
const ParqueNacionalDetalle = lazy(() => import("./pages/ParqueNacionalDetalle"));
const DestinoReligiosoDetalle = lazy(() => import("./pages/DestinoReligiosoDetalle"));
const MarinaDetalle = lazy(() => import("./pages/MarinaDetalle"));
const CulturaTabaco = lazy(() => import("./pages/CulturaTabaco"));
const EscuelaRitmos = lazy(() => import("./pages/EscuelaRitmos"));
const ClimaTemporadas = lazy(() => import("./pages/ClimaTemporadas"));
const CulturaCafe = lazy(() => import("./pages/CulturaCafe"));
const TalleresArtesanales = lazy(() => import("./pages/TalleresArtesanales"));
const AirbnbDetalle = lazy(() => import("./pages/AirbnbDetalle"));
const RutasSabor = lazy(() => import("./pages/RutasSabor"));
const Provincias = lazy(() => import("./pages/Provincias"));
const ProvinciaDetalle = lazy(() => import("./pages/ProvinciaDetalle"));
const DestinosRegion = lazy(() => import("./pages/DestinosRegion"));
const DestinosCategoria = lazy(() => import("./pages/DestinosCategoria"));
const MunicipioDetalle = lazy(() => import("./pages/MunicipioDetalle"));

// New pages
const AlquilerVehiculos = lazy(() => import("./pages/AlquilerVehiculos"));
const Casinos = lazy(() => import("./pages/Casinos"));
const SpasWellness = lazy(() => import("./pages/SpasWellness"));
const SpaDetalle = lazy(() => import("./pages/SpaDetalle"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));
const SistemaAfiliados = lazy(() => import("./pages/SistemaAfiliados"));
const AudioGuias = lazy(() => import("./pages/AudioGuias"));
const CheckInDigital = lazy(() => import("./pages/CheckInDigital"));
const Badges = lazy(() => import("./pages/Badges"));
const ComparadorHoteles = lazy(() => import("./pages/ComparadorHoteles"));
const EncuestaPostViaje = lazy(() => import("./pages/EncuestaPostViaje"));
const MuseosMonumentos = lazy(() => import("./pages/MuseosMonumentos"));
const ItinerarioIA = lazy(() => import("./pages/ItinerarioIA"));
const TraductorViajero = lazy(() => import("./pages/TraductorViajero"));
const ReservaDirecta = lazy(() => import("./pages/ReservaDirecta"));
const ListaEmpaque = lazy(() => import("./pages/ListaEmpaque"));
const ConversorMoneda = lazy(() => import("./pages/ConversorMoneda"));
const CostosViaje = lazy(() => import("./pages/CostosViaje"));
const ZonasHorarias = lazy(() => import("./pages/ZonasHorarias"));
const RequisitosViaje = lazy(() => import("./pages/RequisitosViaje"));
const ReglasGamificacion = lazy(() => import("./pages/ReglasGamificacion"));
const ContactosEmergencia = lazy(() => import("./pages/ContactosEmergencia"));
const EscuelaViajero = lazy(() => import("./pages/EscuelaViajero"));
const ActividadDetalle = lazy(() => import("./pages/ActividadDetalle"));
const Tours = lazy(() => import("./pages/Tours"));
const TourDetalle = lazy(() => import("./pages/TourDetalle"));
const HistoriaRD = lazy(() => import("./pages/HistoriaRD"));
const PersonajeHistorico = lazy(() => import("./pages/PersonajeHistorico"));
const EventoHistorico = lazy(() => import("./pages/EventoHistorico"));
const ReservasNaturales = lazy(() => import("./pages/ReservasNaturales"));
const Loteria = lazy(() => import("./pages/Loteria"));
const PreciosCombustible = lazy(() => import("./pages/PreciosCombustible"));
const CalculadoraCONFOTUR = lazy(() => import("./pages/CalculadoraCONFOTUR"));
const ObservatorioSargazo = lazy(() => import("./pages/ObservatorioSargazo"));
const RutaLarimar = lazy(() => import("./pages/RutaLarimar"));
const CarnavalDominicano = lazy(() => import("./pages/CarnavalDominicano"));
const PicoDuarte = lazy(() => import("./pages/PicoDuarte"));
const RutaRonTabaco = lazy(() => import("./pages/RutaRonTabaco"));
const GolfRD = lazy(() => import("./pages/GolfRD"));
const TurismoBuceo = lazy(() => import("./pages/TurismoBuceo"));
const RecetasCriollas = lazy(() => import("./pages/RecetasCriollas"));
const BienesRaices = lazy(() => import("./pages/BienesRaices"));
const ProyectosInversion = lazy(() => import("./pages/ProyectosInversion"));
const TurismoComunitario = lazy(() => import("./pages/TurismoComunitario"));
const AutorInvitado = lazy(() => import("./pages/AutorInvitado"));
const ContratarInfluencers = lazy(() => import("./pages/ContratarInfluencers"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const SilentGuide = lazy(() => import("./pages/SilentGuide"));

// 10 New Pending Tourism and Tool Pages
const CalculadoraTributaria = lazy(() => import("./pages/CalculadoraTributaria"));
const AreasProtegidas = lazy(() => import("./pages/AreasProtegidas"));
const ReporteOlasViento = lazy(() => import("./pages/ReporteOlasViento"));
const RutaHermanasMirabal = lazy(() => import("./pages/RutaHermanasMirabal"));
const AvistamientoAves = lazy(() => import("./pages/AvistamientoAves"));
const TransporteUrbano = lazy(() => import("./pages/TransporteUrbano"));
const AguasTermales = lazy(() => import("./pages/AguasTermales"));
const CalculadoraCarbono = lazy(() => import("./pages/CalculadoraCarbono"));
const CalculadoraPeajes = lazy(() => import("./pages/CalculadoraPeajes"));
const SorteosYPremios = lazy(() => import("./pages/SorteosYPremios"));
const VacacionesRD = lazy(() => import("./pages/VacacionesRD"));
const Blog = lazy(() => import("./pages/Blog"));
const FeedSocial = lazy(() => import("./pages/FeedSocial"));
const MapaInteractivo = lazy(() => import("./pages/MapaInteractivo"));
const Establecimientos = lazy(() => import("./pages/Establecimientos"));
const Reservas = lazy(() => import("./pages/Reservas"));
const GuiaPracticaPais = lazy(() => import("./pages/GuiaPracticaPais"));
const EmbajadasConsulados = lazy(() => import("./pages/EmbajadasConsulados"));
const SeguroViaje = lazy(() => import("./pages/SeguroViaje"));
const ItinerariosRecomendados = lazy(() => import("./pages/ItinerariosRecomendados"));
const GuiaLGBTQ = lazy(() => import("./pages/GuiaLGBTQ"));
const ViajeraSola = lazy(() => import("./pages/ViajeraSola"));
const GuiaVegana = lazy(() => import("./pages/GuiaVegana"));
const ProgramaCreadores = lazy(() => import("./pages/ProgramaCreadores"));
const ConcursosFotografia = lazy(() => import("./pages/ConcursosFotografia"));
const DiarioViaje = lazy(() => import("./pages/DiarioViaje"));
const FamiliaConNinos = lazy(() => import("./pages/FamiliaConNinos"));
const CalendarioMensual = lazy(() => import("./pages/CalendarioMensual"));
const VuelveACasa = lazy(() => import("./pages/VuelveACasa"));
const AduanasDutyFree = lazy(() => import("./pages/AduanasDutyFree"));
const LeyesTurista = lazy(() => import("./pages/LeyesTurista"));
const GuiaHalalKosher = lazy(() => import("./pages/GuiaHalalKosher"));
const ViajarConMascotas = lazy(() => import("./pages/ViajarConMascotas"));
const ViajerosSenior = lazy(() => import("./pages/ViajerosSenior"));
const GamificacionHub = lazy(() => import("./pages/GamificacionHub"));
const GamificacionTuristica = lazy(() => import("./pages/GamificacionTuristica"));
const PerfilJugador = lazy(() => import("./pages/PerfilJugador"));
const ExplorerProfile = lazy(() => import("./pages/ExplorerProfile"));
const RetosTuristicos = lazy(() => import("./pages/RetosTuristicos"));
const TriviaTuristica = lazy(() => import("./pages/TriviaTuristica"));
const MapaMisiones = lazy(() => import("./pages/MapaMisiones"));
const Montanas = lazy(() => import("./pages/Montanas"));
const MontanaDetalle = lazy(() => import("./pages/MontanaDetalle"));
const AeropuertoDetalle = lazy(() => import("./pages/AeropuertoDetalle"));
const MetroSantoDomingo = lazy(() => import("./pages/MetroSantoDomingo"));
const TelefericoSantoDomingo = lazy(() => import("./pages/TelefericoSantoDomingo"));
const MonorielSantiago = lazy(() => import("./pages/MonorielSantiago"));
const CentroComercialDetalle = lazy(() => import("./pages/CentroComercialDetalle"));
const PartnerLogin = lazy(() => import("./pages/PartnerLogin"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));
const SuscripcionesSabores = lazy(() => import("./pages/SuscripcionesSabores"));
const TarjetaPrepago = lazy(() => import("./pages/TarjetaPrepago"));
const ESimTurista = lazy(() => import("./pages/ESimTurista"));
const EventosVivo = lazy(() => import("./pages/EventosVivo"));
const LIDOM = lazy(() => import("./pages/LIDOM"));
const TasasCambio = lazy(() => import("./pages/TasasCambio"));
const Loterias = lazy(() => import("./pages/Loterias"));
const LoteriaDetalle = lazy(() => import("./pages/LoteriaDetalle"));
const BebidasRD = lazy(() => import("./pages/BebidasRD"));
const Salud24h = lazy(() => import("./pages/Salud24h"));
const CentroSaludDetalle = lazy(() => import("./pages/CentroSaludDetalle"));
const MICEBodas = lazy(() => import("./pages/MICEBodas"));
const EventosGrupo = lazy(() => import("./pages/EventosGrupo"));
const ViveLocal = lazy(() => import("./pages/ViveLocal"));
const HistoriaIndex = lazy(() => import("./pages/HistoriaIndex"));
const HistoriaDetalle = lazy(() => import("./pages/HistoriaDetalle"));
const PricingPlan = lazy(() => import("./pages/PricingPlan"));
const VuelosAerolineas = lazy(() => import("./pages/VuelosAerolineas"));
// End of page imports

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — data stays fresh, no refetch
      gcTime: 15 * 60 * 1000,     // 15 min — cache kept in memory
      refetchOnWindowFocus: false, // don't refetch when tab regains focus
      retry: 1,                    // single retry on failure
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Cargando...</p>
    </div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  
  // Page view tracking
  useEffect(() => {
    import("@/hooks/useAnalytics").then(({ trackEvent }) => {
      trackEvent("page_view", { page: location.pathname });
    });
  }, [location.pathname]);
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
      <RouteErrorBoundary key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/destinos" element={<Destinos />} />
          <Route path="/actividades" element={<Actividades />} />
          <Route path="/planifica" element={<Planifica />} />
          <Route path="/cultura" element={<Cultura />} />
          <Route path="/playa" element={<Playas />} />
          <Route path="/playas" element={<Playas />} />
          <Route path="/playa/:slug" element={<PlayaDetalle />} />
          <Route path="/rios" element={<Rios />} />
          <Route path="/rio/:slug" element={<RioDetalle />} />
          <Route path="/alojamientos" element={<Alojamientos />} />
          <Route path="/alojamiento/:slug" element={<AlojamientoDetalle />} />
          <Route path="/restaurante" element={<Restaurantes />} />
          <Route path="/restaurante/:slug" element={<RestauranteDetalle />} />
          <Route path="/revista" element={<Revista />} />
          <Route path="/aeropuerto" element={<Aeropuerto />} />
          <Route path="/aeropuerto/:slug" element={<AeropuertoDetalle />} />
          <Route path="/vuelos-aerolineas" element={<VuelosAerolineas />} />
          <Route path="/aerolineas" element={<VuelosAerolineas />} />
          <Route path="/rutas-aereas" element={<VuelosAerolineas />} />
          <Route path="/wellness" element={<Navigate to="/spas-wellness" replace />} />
          <Route path="/historia-rd" element={<Navigate to="/historia" replace />} />
          <Route path="/vida-nocturna" element={<VidaNocturna />} />
          <Route path="/directorio-agencias" element={<DirectorioAgencias />} />
          <Route path="/guia-gastronomica" element={<GuiaGastronomica />} />
          <Route path="/chef/:slug" element={<ChefPerfil />} />
          <Route path="/receta/:slug" element={<RecetaDetalle />} />
          <Route path="/ayuda" element={<CentroAyuda />} />
          <Route path="/centro-ayuda" element={<CentroAyuda />} />
          <Route path="/asistencia" element={<CentroAyuda />} />
          <Route path="/sostenible" element={<Sostenible />} />
          <Route path="/articulo/:slug" element={<Articulo />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/para-empresas" element={<PricingPlan />} />
          <Route path="/planes" element={<PricingPlan />} />
          <Route path="/anunciate" element={<PricingPlan />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/destinos-regiones" element={<DestinosRegiones />} />
          <Route path="/destino/:slug" element={<DestinoDetalle />} />
          <Route path="/destinos/:slug" element={<DestinoDetalle />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/evento/:slug" element={<EventoDetalle />} />
          <Route path="/evento/:id" element={<EventoDetalle />} />
          <Route path="/eventos/:slug" element={<EventoDetalle />} />
          <Route path="/eventos/:id" element={<EventoDetalle />} />
          <Route path="/como-llegar" element={<ComoLlegar />} />
          <Route path="/herramientas" element={<Herramientas />} />
          <Route path="/patrimonio" element={<Patrimonio />} />
          <Route path="/info/seguridad" element={<InfoSeguridad />} />
          <Route path="/info/transporte" element={<InfoTransporte />} />
          <Route path="/metro-santo-domingo" element={<MetroSantoDomingo />} />
          <Route path="/teleferico-santo-domingo" element={<TelefericoSantoDomingo />} />
          <Route path="/monoriel-santiago" element={<MonorielSantiago />} />
          <Route path="/centro-comercial/:slug" element={<CentroComercialDetalle />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/bodas" element={<Bodas />} />
          <Route path="/cruceros" element={<NauticaCruceros />} />
          <Route path="/nautica" element={<NauticaCruceros />} />
          <Route path="/nautica-cruceros" element={<NauticaCruceros />} />
          <Route path="/inversion" element={<Inversion />} />
          <Route path="/mice" element={<MICE />} />
          <Route path="/experiencias" element={<Experiencias />} />
          <Route path="/experiencia/:slug" element={<ExperienciaDetalle />} />
          <Route path="/mi-viaje" element={<MiViaje />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/accesibilidad" element={<Accesibilidad />} />
          <Route path="/rd-social" element={<RDSocial />} />
          <Route path="/empleo" element={<Empleo />} />
          <Route path="/empleo/:slug" element={<EmpleoDetalle />} />
          <Route path="/pasaporte-digital" element={<PasaporteDigital />} />
          <Route path="/cine-rd" element={<CineRD />} />
          <Route path="/academia" element={<AcademiaTuristica />} />
          <Route path="/prensa" element={<PrensaComunicacion />} />
          <Route path="/newsletter" element={<PrensaComunicacion />} />
          <Route path="/prensa-comunicacion" element={<PrensaComunicacion />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/encuesta" element={<Encuesta />} />
          <Route path="/webcams" element={<Webcams />} />
          <Route path="/turismo-medico" element={<TurismoMedico />} />
          <Route path="/nomadas-digitales" element={<NomadasDigitales />} />
          <Route path="/turismo-deportivo" element={<TurismoDeportivo />} />
          <Route path="/club-recompensas" element={<ClubRecompensas />} />
          <Route path="/gamificacion" element={<GamificacionTuristica />} />
          <Route path="/gamificacion-turistica" element={<GamificacionTuristica />} />
          <Route path="/gamificacion-turistica/retos" element={<RetosTuristicos />} />
          <Route path="/gamificacion-turistica/creadores" element={<ProgramaCreadores />} />
          <Route path="/gamificacion-turistica/trivia" element={<TriviaTuristica />} />
          <Route path="/gamificacion-turistica/mapa" element={<MapaMisiones />} />
          <Route path="/gamificacion-turistica/perfil" element={<PerfilJugador />} />
          <Route path="/gamificacion-turistica/recompensas" element={<ClubRecompensas />} />
          <Route path="/gamificacion-turistica/reglas" element={<ReglasGamificacion />} />
          <Route path="/reglas-gamificacion" element={<ReglasGamificacion />} />
          <Route path="/perfil-jugador" element={<PerfilJugador />} />
          <Route path="/explorador/:id" element={<ExplorerProfile />} />
          <Route path="/retos" element={<RetosTuristicos />} />
          <Route path="/retos-turisticos" element={<RetosTuristicos />} />
          <Route path="/trivia" element={<TriviaTuristica />} />
          <Route path="/trivia-turistica" element={<TriviaTuristica />} />
          <Route path="/mapa-misiones" element={<MapaMisiones />} />
          <Route path="/comparador" element={<ComparadorDestinos />} />
          <Route path="/mis-logros" element={<MisLogros />} />
          <Route path="/opiniones" element={<Opiniones />} />
          <Route path="/sugerencias" element={<Sugerencias />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/calculadora-presupuesto" element={<CalculadoraPresupuesto />} />
          <Route path="/estado-playas" element={<EstadoPlayas />} />
          <Route path="/guias-locales" element={<GuiasLocales />} />
          <Route path="/diccionario" element={<DiccionarioDominicano />} />
          <Route path="/mapas" element={<MapasTematicos />} />
          <Route path="/fotografos" element={<FotografosLocales />} />
          <Route path="/conectividad" element={<Conectividad />} />
          <Route path="/embajadores" element={<RutasEmbajadores />} />
          <Route path="/requisitos-embajadores" element={<RequisitosEmbajadores />} />
          <Route path="/guardian-caribe" element={<GuardianCaribe />} />
          <Route path="/planificador-grupal" element={<PlanificadorGrupal />} />
          <Route path="/puertos-marinas" element={<PuertosMarinas />} />
          <Route path="/hecho-en-rd" element={<HechoEnRD />} />
          <Route path="/comparador-experiencias" element={<ComparadorExperiencias />} />
          <Route path="/biodiversidad" element={<Biodiversidad />} />
          <Route path="/seguridad-vial" element={<SeguridadVial />} />
          <Route path="/tours-360" element={<Tours360 />} />
          <Route path="/running-ciclismo" element={<RDEnMovimiento />} />
          <Route path="/e-ticket" element={<ETicket />} />
          <Route path="/turismo-sensorial" element={<TurismoSensorial />} />
          <Route path="/volunturismo" element={<Volunturismo />} />
          <Route path="/identificador-comida" element={<IdentificadorComida />} />
          <Route path="/astroturismo" element={<Astroturismo />} />
          <Route path="/guia-etiqueta" element={<GuiaEtiqueta />} />
          <Route path="/podcast" element={<PodcastRD />} />
          <Route path="/souvenirs-digitales" element={<SouvenirsDigitales />} />
          <Route path="/espanol-viajero" element={<EspanolViajero />} />
          <Route path="/sello-calidad" element={<SelloCalidad />} />
          <Route path="/puerto/:slug" element={<PuertoDetalle />} />
          <Route path="/bar/:slug" element={<BarDetalle />} />
          <Route path="/agencia/:slug" element={<AgenciaDetalle />} />
          <Route path="/estadio/:slug" element={<EstadioDetalle />} />
          <Route path="/recinto/:slug" element={<EstadioDetalle />} />
          <Route path="/teatro/:slug" element={<EstadioDetalle />} />
          <Route path="/clinica/:slug" element={<ClinicaDetalle />} />
          <Route path="/parques-tematicos" element={<ParquesTematicos />} />
          <Route path="/parque/:slug" element={<ParqueDetalle />} />
          <Route path="/ecoturismo" element={<Ecoturismo />} />
          <Route path="/turismo-religioso" element={<TurismoReligioso />} />
          <Route path="/historia-viva-ar" element={<HistoriaVivaAR />} />
          <Route path="/cueva/:slug" element={<CuevaDetalle />} />
          <Route path="/parque-nacional/:slug" element={<ParqueNacionalDetalle />} />
          <Route path="/destino-religioso/:slug" element={<DestinoReligiosoDetalle />} />
          <Route path="/marina/:slug" element={<MarinaDetalle />} />
          <Route path="/cultura-tabaco" element={<CulturaTabaco />} />
          <Route path="/escuela-ritmos" element={<EscuelaRitmos />} />
          <Route path="/clima-temporadas" element={<ClimaTemporadas />} />
          <Route path="/cultura-cafe" element={<CulturaCafe />} />
          <Route path="/talleres-artesanales" element={<TalleresArtesanales />} />
          <Route path="/rutas-sabor" element={<RutasSabor />} />
          <Route path="/airbnb/:slug" element={<AirbnbDetalle />} />
          <Route path="/provincias" element={<Provincias />} />
          <Route path="/provincia/:slug" element={<ProvinciaDetalle />} />
          <Route path="/municipio/:slug" element={<MunicipioDetalle />} />
          <Route path="/destinos/region/:region" element={<DestinosRegion />} />
          <Route path="/destinos/categoria/:categoria" element={<DestinosCategoria />} />
          
          {/* New pages */}
          <Route path="/alquiler-vehiculos" element={<AlquilerVehiculos />} />
          <Route path="/rent-a-car" element={<AlquilerVehiculos />} />
          <Route path="/museos" element={<MuseosMonumentos />} />
          <Route path="/casinos" element={<Casinos />} />
          <Route path="/spas" element={<SpasWellness />} />
          <Route path="/spas-wellness" element={<SpasWellness />} />
          <Route path="/spa/:slug" element={<SpaDetalle />} />
          <Route path="/emergencias" element={<ContactosEmergencia />} />
          <Route path="/newsletter-subscribe" element={<NewsletterPage />} />
          <Route path="/afiliados" element={<SistemaAfiliados />} />
          <Route path="/audio-guias" element={<AudioGuias />} />
          <Route path="/check-in" element={<CheckInDigital />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/comparador-hoteles" element={<ComparadorHoteles />} />
          <Route path="/encuesta-post-viaje" element={<EncuestaPostViaje />} />
          <Route path="/clima" element={<ClimaTemporadas />} />
          <Route path="/museos-monumentos" element={<MuseosMonumentos />} />
          <Route path="/itinerario-ia" element={<ItinerarioIA />} />
          <Route path="/traductor" element={<TraductorViajero />} />
          <Route path="/reserva-directa" element={<ReservaDirecta />} />
          <Route path="/lista-empaque" element={<ListaEmpaque />} />
          <Route path="/conversor-moneda" element={<ConversorMoneda />} />
          <Route path="/costos-viaje" element={<CostosViaje />} />
          <Route path="/zonas-horarias" element={<ZonasHorarias />} />
          <Route path="/requisitos-viaje" element={<RequisitosViaje />} />
          <Route path="/contactos-emergencia" element={<ContactosEmergencia />} />
          <Route path="/escuela-viajero" element={<EscuelaViajero />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tour/:slug" element={<TourDetalle />} />
          <Route path="/actividad/:slug" element={<ActividadDetalle />} />
          <Route path="/historia" element={<HistoriaIndex />} />
          <Route path="/historia/:slug" element={<HistoriaDetalle />} />
          <Route path="/historia-cronologia" element={<HistoriaRD />} />
          <Route path="/historia/personaje/:slug" element={<PersonajeHistorico />} />
          <Route path="/historia/evento/:slug" element={<EventoHistorico />} />
          <Route path="/loteria" element={<Loteria />} />
          <Route path="/precios-combustibles" element={<PreciosCombustible />} />
          <Route path="/precios-combustible" element={<PreciosCombustible />} />
          <Route path="/reservas-naturales" element={<ReservasNaturales />} />
          <Route path="/montanas" element={<Montanas />} />
          <Route path="/montana/:slug" element={<MontanaDetalle />} />
          <Route path="/turismo-comunitario" element={<TurismoComunitario />} />
          <Route path="/autor-invitado" element={<AutorInvitado />} />
          <Route path="/contratar-influencers" element={<ContratarInfluencers />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/sorteos" element={<SorteosYPremios />} />
          <Route path="/vacaciones" element={<VacacionesRD />} />
          <Route path="/guia-practica" element={<GuiaPracticaPais />} />
          <Route path="/embajadas" element={<EmbajadasConsulados />} />
          <Route path="/seguro-viaje" element={<SeguroViaje />} />
          <Route path="/itinerarios" element={<ItinerariosRecomendados />} />
          <Route path="/guia-lgbtq" element={<GuiaLGBTQ />} />
          <Route path="/viajera-sola" element={<ViajeraSola />} />
          <Route path="/guia-vegana" element={<GuiaVegana />} />
          <Route path="/familia" element={<FamiliaConNinos />} />
          <Route path="/familia-con-ninos" element={<FamiliaConNinos />} />
          <Route path="/calendario" element={<CalendarioMensual />} />
          <Route path="/vuelve-a-casa" element={<VuelveACasa />} />
          <Route path="/aduanas" element={<AduanasDutyFree />} />
          <Route path="/leyes-turista" element={<LeyesTurista />} />
          <Route path="/guia-halal-kosher" element={<GuiaHalalKosher />} />
          <Route path="/viajar-con-mascotas" element={<ViajarConMascotas />} />
          <Route path="/viajeros-senior" element={<ViajerosSenior />} />

          {/* 10 New Specialized Tourism and Tool Pages */}
          <Route path="/confotur-calculadora" element={<CalculadoraCONFOTUR />} />
          <Route path="/calculadora-confotur" element={<CalculadoraCONFOTUR />} />
          <Route path="/observatorio-sargazo" element={<ObservatorioSargazo />} />
          <Route path="/sargazo" element={<ObservatorioSargazo />} />
          <Route path="/ruta-larimar" element={<RutaLarimar />} />
          <Route path="/carnaval" element={<CarnavalDominicano />} />
          <Route path="/carnaval-dominicano" element={<CarnavalDominicano />} />
          <Route path="/pico-duarte" element={<PicoDuarte />} />
          <Route path="/ruta-ron-tabaco" element={<RutaRonTabaco />} />
          <Route path="/golf-rd" element={<GolfRD />} />
          <Route path="/golf" element={<GolfRD />} />
          <Route path="/buceo-snorkel" element={<TurismoBuceo />} />
          <Route path="/retirados-nomadas" element={<NomadasDigitales />} />
          <Route path="/recetas-criollas" element={<RecetasCriollas />} />
          <Route path="/bienes-raices" element={<BienesRaices />} />
          <Route path="/proyectos-inversion" element={<ProyectosInversion />} />

          {/* 10 New Pending Tourism and Tool Pages */}
          <Route path="/guias-ecologicos" element={<GuiasLocales />} />
          <Route path="/calculadora-tributaria" element={<CalculadoraTributaria />} />
          <Route path="/areas-protegidas" element={<AreasProtegidas />} />
          <Route path="/reporte-olas-viento" element={<ReporteOlasViento />} />
          <Route path="/ruta-hermanas-mirabal" element={<RutaHermanasMirabal />} />
          <Route path="/avistamiento-aves" element={<AvistamientoAves />} />
          <Route path="/transporte-urbano" element={<TransporteUrbano />} />
          <Route path="/aguas-termales" element={<AguasTermales />} />
          <Route path="/calculadora-carbono" element={<CalculadoraCarbono />} />
          <Route path="/calculadora-peajes" element={<CalculadoraPeajes />} />


          
          <Route path="/blog" element={<Blog />} />
          <Route path="/feed" element={<FeedSocial />} />
          <Route path="/mapa-interactivo" element={<MapaInteractivo />} />
          <Route path="/establecimientos" element={<Establecimientos />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/creadores" element={<ProgramaCreadores />} />
          <Route path="/concursos" element={<ConcursosFotografia />} />
          <Route path="/diario-viaje" element={<DiarioViaje />} />
          <Route path="/partner/login" element={<PartnerLogin />} />
          <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          <Route path="/silent-guide" element={<SilentGuide />} />
          <Route path="/suscripciones-sabores" element={<SuscripcionesSabores />} />
          <Route path="/tarjeta-prepago" element={<TarjetaPrepago />} />
          <Route path="/esim" element={<ESimTurista />} />
          <Route path="/eventos-vivo" element={<EventosVivo />} />
          <Route path="/lidom" element={<LIDOM />} />
          <Route path="/tasas-cambio" element={<TasasCambio />} />
          <Route path="/loterias" element={<Loterias />} />
          <Route path="/loteria/:slug" element={<LoteriaDetalle />} />
          <Route path="/loterias/:slug" element={<LoteriaDetalle />} />
          <Route path="/bebidas-rd" element={<BebidasRD />} />
          <Route path="/vive-local" element={<ViveLocal />} />
          <Route path="/salud-24h" element={<Salud24h />} />
          <Route path="/salud-24h/:id" element={<CentroSaludDetalle />} />
          <Route path="/centro-salud/:id" element={<CentroSaludDetalle />} />
          <Route path="/mice-bodas" element={<MICEBodas />} />
          <Route path="/bodas" element={<MICEBodas />} />
          <Route path="/mice" element={<MICEBodas />} />
          <Route path="/eventos-grupo" element={<EventosGrupo />} />
          <Route path="/top-100" element={<Top100 />} />
          <Route path="/operadores" element={<OperadoresLanding />} />
          <Route path="/operadores/directorio" element={<OperadoresDirectorio />} />
          <Route path="/operadores/funciones/:feature" element={<OperadoresFuncion />} />
          <Route path="/operadores/panel/*" element={<OperatorPanel />} />
          <Route path="/operador/:slug" element={<OperadorStorefront />} />
          <Route path="/operador/:slug/:listing" element={<OperadorServicio />} />
          <Route path="/tienda" element={<TiendaHome />} />
          <Route path="/tienda/checkout" element={<TiendaCheckout />} />
          <Route path="/tienda/:slug" element={<TiendaProducto />} />
          <Route path="/checkout" element={<TiendaCheckout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RouteErrorBoundary>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AnimatedRoutes />
              <Suspense fallback={null}>
                <BackToTop />
                <ChatbotTuristico />
                <GamificationToastOverlay />
                <ExitIntentModal />
                <CookieConsentBanner />
              </Suspense>
            </BrowserRouter>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
