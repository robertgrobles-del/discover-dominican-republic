import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackToTop } from "@/components/BackToTop";
import { ChatbotTuristico } from "@/components/ChatbotTuristico";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { AuthProvider } from "@/hooks/useAuth";

// Critical pages - loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

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
const DestinoDetalle = lazy(() => import("./pages/DestinoDetalle"));
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
const Perfil = lazy(() => import("./pages/Perfil"));
const CalculadoraPresupuesto = lazy(() => import("./pages/CalculadoraPresupuesto"));
const EstadoPlayas = lazy(() => import("./pages/EstadoPlayas"));
const GuiasLocales = lazy(() => import("./pages/GuiasLocales"));
const DiccionarioDominicano = lazy(() => import("./pages/DiccionarioDominicano"));
const MapasTematicos = lazy(() => import("./pages/MapasTematicos"));
const FotografosLocales = lazy(() => import("./pages/FotografosLocales"));
const Conectividad = lazy(() => import("./pages/Conectividad"));
const RutasEmbajadores = lazy(() => import("./pages/RutasEmbajadores"));
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
const Museos = lazy(() => import("./pages/Museos"));
const Casinos = lazy(() => import("./pages/Casinos"));
const SpasWellness = lazy(() => import("./pages/SpasWellness"));
const Emergencias = lazy(() => import("./pages/Emergencias"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));
const SistemaAfiliados = lazy(() => import("./pages/SistemaAfiliados"));
const AudioGuias = lazy(() => import("./pages/AudioGuias"));
const CheckInDigital = lazy(() => import("./pages/CheckInDigital"));
const Badges = lazy(() => import("./pages/Badges"));
const ComparadorHoteles = lazy(() => import("./pages/ComparadorHoteles"));
const EncuestaPostViaje = lazy(() => import("./pages/EncuestaPostViaje"));
const ClimaYTemporadas = lazy(() => import("./pages/ClimaYTemporadas"));
const MuseosMonumentos = lazy(() => import("./pages/MuseosMonumentos"));
const ItinerarioIA = lazy(() => import("./pages/ItinerarioIA"));
const TraductorViajero = lazy(() => import("./pages/TraductorViajero"));
const ReservaDirecta = lazy(() => import("./pages/ReservaDirecta"));
const ListaEmpaque = lazy(() => import("./pages/ListaEmpaque"));
const ConversorMoneda = lazy(() => import("./pages/ConversorMoneda"));
const CostosViaje = lazy(() => import("./pages/CostosViaje"));
const ZonasHorarias = lazy(() => import("./pages/ZonasHorarias"));
const RequisitosViaje = lazy(() => import("./pages/RequisitosViaje"));
const ContactosEmergencia = lazy(() => import("./pages/ContactosEmergencia"));
const EscuelaViajero = lazy(() => import("./pages/EscuelaViajero"));
const EmpleoDetalle = lazy(() => import("./pages/EmpleoDetalle"));
// Static destination pages
const PuntaCana = lazy(() => import("./pages/destinos/PuntaCana"));
const Bavaro = lazy(() => import("./pages/destinos/Bavaro"));
const CapCana = lazy(() => import("./pages/destinos/CapCana"));
const Samana = lazy(() => import("./pages/destinos/Samana"));
const LasTerrenas = lazy(() => import("./pages/destinos/LasTerrenas"));
const PuertoPlata = lazy(() => import("./pages/destinos/PuertoPlata"));
const Cabarete = lazy(() => import("./pages/destinos/Cabarete"));
const Sosua = lazy(() => import("./pages/destinos/Sosua"));
const SantoDomingo = lazy(() => import("./pages/destinos/SantoDomingo"));
const ZonaColonial = lazy(() => import("./pages/destinos/ZonaColonial"));
const Jarabacoa = lazy(() => import("./pages/destinos/Jarabacoa"));
const LaRomana = lazy(() => import("./pages/destinos/LaRomana"));
const Bayahibe = lazy(() => import("./pages/destinos/Bayahibe"));
const LaAltagracia = lazy(() => import("./pages/destinos/LaAltagracia"));
const Pedernales = lazy(() => import("./pages/destinos/Pedernales"));
const BahiaDeLasAguilas = lazy(() => import("./pages/destinos/BahiaDeLasAguilas"));
const Constanza = lazy(() => import("./pages/destinos/Constanza"));
const LasGaleras = lazy(() => import("./pages/destinos/LasGaleras"));
const BocaChica = lazy(() => import("./pages/destinos/BocaChica"));
const JuanDolio = lazy(() => import("./pages/destinos/JuanDolio"));
const PlayaRincon = lazy(() => import("./pages/destinos/PlayaRincon"));
const Higuey = lazy(() => import("./pages/destinos/Higuey"));
const Santiago = lazy(() => import("./pages/destinos/Santiago"));
const LaVega = lazy(() => import("./pages/destinos/LaVega"));
const Barahona = lazy(() => import("./pages/destinos/Barahona"));

const queryClient = new QueryClient();

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
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/destinos" element={<Destinos />} />
          <Route path="/actividades" element={<Actividades />} />
          <Route path="/planifica" element={<Planifica />} />
          <Route path="/cultura" element={<Cultura />} />
          <Route path="/playas" element={<Playas />} />
          <Route path="/playa/:slug" element={<PlayaDetalle />} />
          <Route path="/rios" element={<Rios />} />
          <Route path="/rio/:slug" element={<RioDetalle />} />
          <Route path="/alojamientos" element={<Alojamientos />} />
          <Route path="/alojamiento/:id" element={<AlojamientoDetalle />} />
          <Route path="/restaurante" element={<Restaurantes />} />
          <Route path="/restaurante/:id" element={<RestauranteDetalle />} />
          <Route path="/revista" element={<Revista />} />
          <Route path="/aeropuerto" element={<Aeropuerto />} />
          <Route path="/vida-nocturna" element={<VidaNocturna />} />
          <Route path="/directorio-agencias" element={<DirectorioAgencias />} />
          <Route path="/guia-gastronomica" element={<GuiaGastronomica />} />
          <Route path="/chef/:id" element={<ChefPerfil />} />
          <Route path="/receta/:id" element={<RecetaDetalle />} />
          <Route path="/ayuda" element={<CentroAyuda />} />
          <Route path="/centro-ayuda" element={<CentroAyuda />} />
          <Route path="/asistencia" element={<CentroAyuda />} />
          <Route path="/sostenible" element={<Sostenible />} />
          <Route path="/articulo/:id" element={<Articulo />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/destino/:id" element={<DestinoDetalle />} />
          <Route path="/destinos-regiones" element={<DestinosRegiones />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/evento/:id" element={<EventoDetalle />} />
          <Route path="/como-llegar" element={<ComoLlegar />} />
          <Route path="/herramientas" element={<Herramientas />} />
          <Route path="/patrimonio" element={<Patrimonio />} />
          <Route path="/info/seguridad" element={<InfoSeguridad />} />
          <Route path="/info/transporte" element={<InfoTransporte />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/bodas" element={<Bodas />} />
          <Route path="/cruceros" element={<NauticaCruceros />} />
          <Route path="/nautica" element={<NauticaCruceros />} />
          <Route path="/nautica-cruceros" element={<NauticaCruceros />} />
          <Route path="/inversion" element={<Inversion />} />
          <Route path="/mice" element={<MICE />} />
          <Route path="/experiencias" element={<Experiencias />} />
          <Route path="/experiencia/:id" element={<ExperienciaDetalle />} />
          <Route path="/mi-viaje" element={<MiViaje />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/accesibilidad" element={<Accesibilidad />} />
          <Route path="/rd-social" element={<RDSocial />} />
          <Route path="/empleo" element={<Empleo />} />
          <Route path="/empleo/:id" element={<EmpleoDetalle />} />
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
          <Route path="/comparador" element={<ComparadorDestinos />} />
          <Route path="/mis-logros" element={<MisLogros />} />
          <Route path="/opiniones" element={<Opiniones />} />
          <Route path="/sugerencias" element={<Sugerencias />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/calculadora-presupuesto" element={<CalculadoraPresupuesto />} />
          <Route path="/estado-playas" element={<EstadoPlayas />} />
          <Route path="/guias-locales" element={<GuiasLocales />} />
          <Route path="/diccionario" element={<DiccionarioDominicano />} />
          <Route path="/mapas" element={<MapasTematicos />} />
          <Route path="/fotografos" element={<FotografosLocales />} />
          <Route path="/conectividad" element={<Conectividad />} />
          <Route path="/embajadores" element={<RutasEmbajadores />} />
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
          <Route path="/puerto/:id" element={<PuertoDetalle />} />
          <Route path="/bar/:id" element={<BarDetalle />} />
          <Route path="/agencia/:id" element={<AgenciaDetalle />} />
          <Route path="/estadio/:id" element={<EstadioDetalle />} />
          <Route path="/clinica/:id" element={<ClinicaDetalle />} />
          <Route path="/parques-tematicos" element={<ParquesTematicos />} />
          <Route path="/parque/:id" element={<ParqueDetalle />} />
          <Route path="/ecoturismo" element={<Ecoturismo />} />
          <Route path="/turismo-religioso" element={<TurismoReligioso />} />
          <Route path="/historia-viva-ar" element={<HistoriaVivaAR />} />
          <Route path="/cueva/:id" element={<CuevaDetalle />} />
          <Route path="/parque-nacional/:id" element={<ParqueNacionalDetalle />} />
          <Route path="/destino-religioso/:id" element={<DestinoReligiosoDetalle />} />
          <Route path="/marina/:id" element={<MarinaDetalle />} />
          <Route path="/cultura-tabaco" element={<CulturaTabaco />} />
          <Route path="/escuela-ritmos" element={<EscuelaRitmos />} />
          <Route path="/clima-temporadas" element={<ClimaTemporadas />} />
          <Route path="/cultura-cafe" element={<CulturaCafe />} />
          <Route path="/talleres-artesanales" element={<TalleresArtesanales />} />
          <Route path="/rutas-sabor" element={<RutasSabor />} />
          <Route path="/airbnb/:id" element={<AirbnbDetalle />} />
          <Route path="/provincias" element={<Provincias />} />
          <Route path="/provincia/:slug" element={<ProvinciaDetalle />} />
          <Route path="/municipio/:slug" element={<MunicipioDetalle />} />
          <Route path="/destinos/region/:region" element={<DestinosRegion />} />
          <Route path="/destinos/categoria/:categoria" element={<DestinosCategoria />} />
          
          {/* New pages */}
          <Route path="/alquiler-vehiculos" element={<AlquilerVehiculos />} />
          <Route path="/rent-a-car" element={<AlquilerVehiculos />} />
          <Route path="/museos" element={<Museos />} />
          <Route path="/casinos" element={<Casinos />} />
          <Route path="/spas" element={<SpasWellness />} />
          <Route path="/spas-wellness" element={<SpasWellness />} />
          <Route path="/emergencias" element={<Emergencias />} />
          <Route path="/newsletter-subscribe" element={<NewsletterPage />} />
          <Route path="/afiliados" element={<SistemaAfiliados />} />
          <Route path="/audio-guias" element={<AudioGuias />} />
          <Route path="/check-in" element={<CheckInDigital />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/comparador-hoteles" element={<ComparadorHoteles />} />
          <Route path="/encuesta-post-viaje" element={<EncuestaPostViaje />} />
          <Route path="/clima" element={<ClimaYTemporadas />} />
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
          
          {/* Static destination pages - /destino/slug */}
          <Route path="/destino/punta-cana" element={<PuntaCana />} />
          <Route path="/destino/bavaro" element={<Bavaro />} />
          <Route path="/destino/cap-cana" element={<CapCana />} />
          <Route path="/destino/samana" element={<Samana />} />
          <Route path="/destino/las-terrenas" element={<LasTerrenas />} />
          <Route path="/destino/puerto-plata" element={<PuertoPlata />} />
          <Route path="/destino/cabarete" element={<Cabarete />} />
          <Route path="/destino/sosua" element={<Sosua />} />
          <Route path="/destino/santo-domingo" element={<SantoDomingo />} />
          <Route path="/destino/zona-colonial" element={<ZonaColonial />} />
          <Route path="/destino/jarabacoa" element={<Jarabacoa />} />
          <Route path="/destino/la-romana" element={<LaRomana />} />
          <Route path="/destino/bayahibe" element={<Bayahibe />} />
          <Route path="/destino/la-altagracia" element={<LaAltagracia />} />
          <Route path="/destino/pedernales" element={<Pedernales />} />
          <Route path="/destino/bahia-de-las-aguilas" element={<BahiaDeLasAguilas />} />
          <Route path="/destino/constanza" element={<Constanza />} />
          <Route path="/destino/las-galeras" element={<LasGaleras />} />
          <Route path="/destino/boca-chica" element={<BocaChica />} />
          <Route path="/destino/juan-dolio" element={<JuanDolio />} />
          <Route path="/destino/playa-rincon" element={<PlayaRincon />} />
          <Route path="/destino/higuey" element={<Higuey />} />
          <Route path="/destino/santiago" element={<Santiago />} />
          <Route path="/destino/la-vega" element={<LaVega />} />
          <Route path="/destino/barahona" element={<Barahona />} />
          
          {/* Compatibility redirects for old routes */}
          <Route path="/destinos/punta-cana" element={<PuntaCana />} />
          <Route path="/destinos/bavaro" element={<Bavaro />} />
          <Route path="/destinos/cap-cana" element={<CapCana />} />
          <Route path="/destinos/samana" element={<Samana />} />
          <Route path="/destinos/las-terrenas" element={<LasTerrenas />} />
          <Route path="/destinos/puerto-plata" element={<PuertoPlata />} />
          <Route path="/destinos/cabarete" element={<Cabarete />} />
          <Route path="/destinos/sosua" element={<Sosua />} />
          <Route path="/destinos/santo-domingo" element={<SantoDomingo />} />
          <Route path="/destinos/zona-colonial" element={<ZonaColonial />} />
          <Route path="/destinos/jarabacoa" element={<Jarabacoa />} />
          <Route path="/destinos/la-romana" element={<LaRomana />} />
          <Route path="/destinos/bayahibe" element={<Bayahibe />} />
          <Route path="/destinos/la-altagracia" element={<LaAltagracia />} />
          <Route path="/destinos/pedernales" element={<Pedernales />} />
          <Route path="/destinos/bahia-de-las-aguilas" element={<BahiaDeLasAguilas />} />
          <Route path="/destinos/constanza" element={<Constanza />} />
          <Route path="/destinos/las-galeras" element={<LasGaleras />} />
          <Route path="/destinos/boca-chica" element={<BocaChica />} />
          <Route path="/destinos/juan-dolio" element={<JuanDolio />} />
          <Route path="/destinos/playa-rincon" element={<PlayaRincon />} />
          <Route path="/destinos/higuey" element={<Higuey />} />
          <Route path="/destinos/santiago" element={<Santiago />} />
          <Route path="/destinos/la-vega" element={<LaVega />} />
          <Route path="/destinos/barahona" element={<Barahona />} />
          
          <Route path="/admin" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <FavoritesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AnimatedRoutes />
            <BackToTop />
            <ChatbotTuristico />
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
