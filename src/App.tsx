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
import Index from "./pages/Index";
import Destinos from "./pages/Destinos";
import Actividades from "./pages/Actividades";
import Planifica from "./pages/Planifica";
import Cultura from "./pages/Cultura";
import AlojamientoDetalle from "./pages/AlojamientoDetalle";
import RestauranteDetalle from "./pages/RestauranteDetalle";
import Revista from "./pages/Revista";
import Aeropuerto from "./pages/Aeropuerto";
import VidaNocturna from "./pages/VidaNocturna";
import DirectorioAgencias from "./pages/DirectorioAgencias";
import GuiaGastronomica from "./pages/GuiaGastronomica";
import ChefPerfil from "./pages/ChefPerfil";
import RecetaDetalle from "./pages/RecetaDetalle";
import CentroAyuda from "./pages/CentroAyuda";
import Sostenible from "./pages/Sostenible";
import Articulo from "./pages/Articulo";
import Galeria from "./pages/Galeria";
import Terminos from "./pages/Terminos";
import Playas from "./pages/Playas";
import Rios from "./pages/Rios";
import Alojamientos from "./pages/Alojamientos";
import Estadisticas from "./pages/Estadisticas";
import Partners from "./pages/Partners";
import SobreNosotros from "./pages/SobreNosotros";
import DestinoDetalle from "./pages/DestinoDetalle";
import DestinosRegiones from "./pages/DestinosRegiones";
import Eventos from "./pages/Eventos";
import ComoLlegar from "./pages/ComoLlegar";
import Herramientas from "./pages/Herramientas";
import Patrimonio from "./pages/Patrimonio";
import InfoSeguridad from "./pages/InfoSeguridad";
import InfoTransporte from "./pages/InfoTransporte";
import NotFound from "./pages/NotFound";
import Wellness from "./pages/Wellness";
import Bodas from "./pages/Bodas";
import NauticaCruceros from "./pages/NauticaCruceros";
import Inversion from "./pages/Inversion";
import MICE from "./pages/MICE";
import Experiencias from "./pages/Experiencias";
import ExperienciaDetalle from "./pages/ExperienciaDetalle";
import MiViaje from "./pages/MiViaje";
import Biblioteca from "./pages/Biblioteca";
import Compras from "./pages/Compras";
import Accesibilidad from "./pages/Accesibilidad";
import RDSocial from "./pages/RDSocial";
import Empleo from "./pages/Empleo";
import PasaporteDigital from "./pages/PasaporteDigital";
import CineRD from "./pages/CineRD";
import AcademiaTuristica from "./pages/AcademiaTuristica";
import Ofertas from "./pages/Ofertas";
import Encuesta from "./pages/Encuesta";
import Webcams from "./pages/Webcams";
import TurismoMedico from "./pages/TurismoMedico";
import NomadasDigitales from "./pages/NomadasDigitales";
import TurismoDeportivo from "./pages/TurismoDeportivo";
import ClubRecompensas from "./pages/ClubRecompensas";
import ComparadorDestinos from "./pages/ComparadorDestinos";
import MisLogros from "./pages/MisLogros";
import Opiniones from "./pages/Opiniones";
import Sugerencias from "./pages/Sugerencias";
import PrensaComunicacion from "./pages/PrensaComunicacion";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import CalculadoraPresupuesto from "./pages/CalculadoraPresupuesto";
import EstadoPlayas from "./pages/EstadoPlayas";
import GuiasLocales from "./pages/GuiasLocales";
import DiccionarioDominicano from "./pages/DiccionarioDominicano";
import MapasTematicos from "./pages/MapasTematicos";
import FotografosLocales from "./pages/FotografosLocales";
import Conectividad from "./pages/Conectividad";
import RutasEmbajadores from "./pages/RutasEmbajadores";
import GuardianCaribe from "./pages/GuardianCaribe";
import PlanificadorGrupal from "./pages/PlanificadorGrupal";
import PuertosMarinas from "./pages/PuertosMarinas";
import HechoEnRD from "./pages/HechoEnRD";
import ComparadorExperiencias from "./pages/ComparadorExperiencias";
import Biodiversidad from "./pages/Biodiversidad";
import SeguridadVial from "./pages/SeguridadVial";
import Tours360 from "./pages/Tours360";
import RDEnMovimiento from "./pages/RDEnMovimiento";
import ETicket from "./pages/ETicket";
import TurismoSensorial from "./pages/TurismoSensorial";
import Volunturismo from "./pages/Volunturismo";
import IdentificadorComida from "./pages/IdentificadorComida";
import Astroturismo from "./pages/Astroturismo";
import GuiaEtiqueta from "./pages/GuiaEtiqueta";
import PodcastRD from "./pages/PodcastRD";
import SouvenirsDigitales from "./pages/SouvenirsDigitales";
import EspanolViajero from "./pages/EspanolViajero";
import SelloCalidad from "./pages/SelloCalidad";
import PuertoDetalle from "./pages/PuertoDetalle";
import BarDetalle from "./pages/BarDetalle";
import AgenciaDetalle from "./pages/AgenciaDetalle";
import EstadioDetalle from "./pages/EstadioDetalle";
import ClinicaDetalle from "./pages/ClinicaDetalle";

// Backwards-compatible aliases
const Asistencia = CentroAyuda;
const Ayuda = CentroAyuda;
const Nautica = NauticaCruceros;
const Cruceros = NauticaCruceros;
const Prensa = PrensaComunicacion;
const Newsletter = PrensaComunicacion;
const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/destinos" element={<Destinos />} />
        <Route path="/actividades" element={<Actividades />} />
        <Route path="/planifica" element={<Planifica />} />
        <Route path="/cultura" element={<Cultura />} />
        <Route path="/playas" element={<Playas />} />
        <Route path="/rios" element={<Rios />} />
        <Route path="/alojamientos" element={<Alojamientos />} />
        <Route path="/alojamiento/:id" element={<AlojamientoDetalle />} />
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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
