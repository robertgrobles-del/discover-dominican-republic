import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

// Lazy-loaded pages
const Destinos = lazy(() => import("@/pages/Destinos"));
const DestinoDetalle = lazy(() => import("@/pages/DestinoDetalle"));
const DestinosRegiones = lazy(() => import("@/pages/DestinosRegiones"));
const DestinosRegion = lazy(() => import("@/pages/DestinosRegion"));
const DestinosCategoria = lazy(() => import("@/pages/DestinosCategoria"));
const Provincias = lazy(() => import("@/pages/Provincias"));
const ProvinciaDetalle = lazy(() => import("@/pages/ProvinciaDetalle"));
const MunicipioDetalle = lazy(() => import("@/pages/MunicipioDetalle"));
const Playas = lazy(() => import("@/pages/Playas"));
const PlayaDetalle = lazy(() => import("@/pages/PlayaDetalle"));
const EstadoPlayas = lazy(() => import("@/pages/EstadoPlayas"));
const Rios = lazy(() => import("@/pages/Rios"));
const RioDetalle = lazy(() => import("@/pages/RioDetalle"));
const Alojamientos = lazy(() => import("@/pages/Alojamientos"));
const AlojamientoDetalle = lazy(() => import("@/pages/AlojamientoDetalle"));
const AirbnbDetalle = lazy(() => import("@/pages/AirbnbDetalle"));
const Restaurantes = lazy(() => import("@/pages/Restaurantes"));
const RestauranteDetalle = lazy(() => import("@/pages/RestauranteDetalle"));
const GuiaGastronomica = lazy(() => import("@/pages/GuiaGastronomica"));
const ChefPerfil = lazy(() => import("@/pages/ChefPerfil"));
const RecetaDetalle = lazy(() => import("@/pages/RecetaDetalle"));
const RecetasCriollas = lazy(() => import("@/pages/RecetasCriollas"));
const RutasSabor = lazy(() => import("@/pages/RutasSabor"));
const BebidasRD = lazy(() => import("@/pages/BebidasRD"));
const Cultura = lazy(() => import("@/pages/Cultura"));
const MuseosMonumentos = lazy(() => import("@/pages/MuseosMonumentos"));
const Patrimonio = lazy(() => import("@/pages/Patrimonio"));
const HistoriaIndex = lazy(() => import("@/pages/HistoriaIndex"));
const HistoriaDetalle = lazy(() => import("@/pages/HistoriaDetalle"));
const HistoriaRD = lazy(() => import("@/pages/HistoriaRD"));
const PersonajeHistorico = lazy(() => import("@/pages/PersonajeHistorico"));
const EventoHistorico = lazy(() => import("@/pages/EventoHistorico"));
const HistoriaVivaAR = lazy(() => import("@/pages/HistoriaVivaAR"));
const Actividades = lazy(() => import("@/pages/Actividades"));
const ActividadDetalle = lazy(() => import("@/pages/ActividadDetalle"));
const Experiencias = lazy(() => import("@/pages/Experiencias"));
const ExperienciaDetalle = lazy(() => import("@/pages/ExperienciaDetalle"));
const ComparadorExperiencias = lazy(() => import("@/pages/ComparadorExperiencias"));
const ComparadorDestinos = lazy(() => import("@/pages/ComparadorDestinos"));
const Tours = lazy(() => import("@/pages/Tours"));
const TourDetalle = lazy(() => import("@/pages/TourDetalle"));
const Tours360 = lazy(() => import("@/pages/Tours360"));
const Eventos = lazy(() => import("@/pages/Eventos"));
const EventoDetalle = lazy(() => import("@/pages/EventoDetalle"));
const EventosVivo = lazy(() => import("@/pages/EventosVivo"));
const VidaNocturna = lazy(() => import("@/pages/VidaNocturna"));
const BarDetalle = lazy(() => import("@/pages/BarDetalle"));
const ParquesTematicos = lazy(() => import("@/pages/ParquesTematicos"));
const ParqueDetalle = lazy(() => import("@/pages/ParqueDetalle"));
const ParqueNacionalDetalle = lazy(() => import("@/pages/ParqueNacionalDetalle"));
const ReservasNaturales = lazy(() => import("@/pages/ReservasNaturales"));
const AreasProtegidas = lazy(() => import("@/pages/AreasProtegidas"));
const Montanas = lazy(() => import("@/pages/Montanas"));
const MontanaDetalle = lazy(() => import("@/pages/MontanaDetalle"));
const PicoDuarte = lazy(() => import("@/pages/PicoDuarte"));
const Ecoturismo = lazy(() => import("@/pages/Ecoturismo"));
const TurismoBuceo = lazy(() => import("@/pages/TurismoBuceo"));
const TurismoDeportivo = lazy(() => import("@/pages/TurismoDeportivo"));
const GolfRD = lazy(() => import("@/pages/GolfRD"));
const TurismoReligioso = lazy(() => import("@/pages/TurismoReligioso"));
const DestinoReligiosoDetalle = lazy(() => import("@/pages/DestinoReligiosoDetalle"));
const CuevaDetalle = lazy(() => import("@/pages/CuevaDetalle"));
const AguasTermales = lazy(() => import("@/pages/AguasTermales"));
const AvistamientoAves = lazy(() => import("@/pages/AvistamientoAves"));
const Biodiversidad = lazy(() => import("@/pages/Biodiversidad"));
const CarnavalDominicano = lazy(() => import("@/pages/CarnavalDominicano"));
const CulturaTabaco = lazy(() => import("@/pages/CulturaTabaco"));
const CulturaCafe = lazy(() => import("@/pages/CulturaCafe"));
const RutaRonTabaco = lazy(() => import("@/pages/RutaRonTabaco"));
const RutaLarimar = lazy(() => import("@/pages/RutaLarimar"));
const RutaHermanasMirabal = lazy(() => import("@/pages/RutaHermanasMirabal"));
const TalleresArtesanales = lazy(() => import("@/pages/TalleresArtesanales"));
const EscuelaRitmos = lazy(() => import("@/pages/EscuelaRitmos"));
const LIDOM = lazy(() => import("@/pages/LIDOM"));
const SpasWellness = lazy(() => import("@/pages/SpasWellness"));
const SpaDetalle = lazy(() => import("@/pages/SpaDetalle"));
const TurismoMedico = lazy(() => import("@/pages/TurismoMedico"));
const ObservatorioSargazo = lazy(() => import("@/pages/ObservatorioSargazo"));
const ReporteOlasViento = lazy(() => import("@/pages/ReporteOlasViento"));
const Webcams = lazy(() => import("@/pages/Webcams"));
const DiccionarioDominicano = lazy(() => import("@/pages/DiccionarioDominicano"));
const GuiasLocales = lazy(() => import("@/pages/GuiasLocales"));
const FotografosLocales = lazy(() => import("@/pages/FotografosLocales"));
const DescubrimientoLocal = lazy(() => import("@/pages/DescubrimientoLocal"));
const MapaInteractivo = lazy(() => import("@/pages/MapaInteractivo"));
const MapasTematicos = lazy(() => import("@/pages/MapasTematicos"));
const Establecimientos = lazy(() => import("@/pages/Establecimientos"));
const ComparadorHoteles = lazy(() => import("@/pages/ComparadorHoteles"));
const AudioGuias = lazy(() => import("@/pages/AudioGuias"));
const TurismoSensorial = lazy(() => import("@/pages/TurismoSensorial"));
const Volunturismo = lazy(() => import("@/pages/Volunturismo"));
const Astroturismo = lazy(() => import("@/pages/Astroturismo"));
const AvistamientoBallenas = lazy(() => import("@/pages/AvistamientoBallenas"));
const DestinoActividades = lazy(() => import("@/pages/DestinoActividades"));
const TurismoComunitario = lazy(() => import("@/pages/TurismoComunitario"));
const GuiaLGBTQ = lazy(() => import("@/pages/GuiaLGBTQ"));
const ViajeraSola = lazy(() => import("@/pages/ViajeraSola"));
const GuiaVegana = lazy(() => import("@/pages/GuiaVegana"));
const GuiaHalalKosher = lazy(() => import("@/pages/GuiaHalalKosher"));
const ViajarConMascotas = lazy(() => import("@/pages/ViajarConMascotas"));
const ViajerosSenior = lazy(() => import("@/pages/ViajerosSenior"));
const FamiliaConNinos = lazy(() => import("@/pages/FamiliaConNinos"));
const HechoEnRD = lazy(() => import("@/pages/HechoEnRD"));
const CineRD = lazy(() => import("@/pages/CineRD"));
const PodcastRD = lazy(() => import("@/pages/PodcastRD"));
const Casinos = lazy(() => import("@/pages/Casinos"));
const Compras = lazy(() => import("@/pages/Compras"));
const CentroComercialDetalle = lazy(() => import("@/pages/CentroComercialDetalle"));
const EstadioDetalle = lazy(() => import("@/pages/EstadioDetalle"));
const ClinicaDetalle = lazy(() => import("@/pages/ClinicaDetalle"));
const SelloCalidad = lazy(() => import("@/pages/SelloCalidad"));

export const touristRoutes = (
  <>
    {/* Destinos y Geografía */}
    <Route path="/destinos" element={<Destinos />} />
    <Route path="/destinos-regiones" element={<DestinosRegiones />} />
    <Route path="/destino/:slug" element={<DestinoDetalle />} />
    <Route path="/destino/:slug/actividades" element={<DestinoActividades />} />
    <Route path="/destinos/:slug" element={<DestinoDetalle />} />
    <Route path="/destinos/region/:region" element={<DestinosRegion />} />
    <Route path="/destinos/categoria/:categoria" element={<DestinosCategoria />} />
    <Route path="/provincias" element={<Provincias />} />
    <Route path="/provincia/:slug" element={<ProvinciaDetalle />} />
    <Route path="/municipio/:slug" element={<MunicipioDetalle />} />
    <Route path="/comparador" element={<ComparadorDestinos />} />
    <Route path="/descubrimiento-local" element={<DescubrimientoLocal />} />
    <Route path="/mapa-interactivo" element={<MapaInteractivo />} />
    <Route path="/mapas" element={<MapasTematicos />} />

    {/* Playas, Ríos y Naturaleza */}
    <Route path="/playa" element={<Navigate to="/playas" replace />} />
    <Route path="/playas" element={<Playas />} />
    <Route path="/playa/:slug" element={<PlayaDetalle />} />
    <Route path="/estado-playas" element={<EstadoPlayas />} />
    <Route path="/rios" element={<Rios />} />
    <Route path="/rio/:slug" element={<RioDetalle />} />
    <Route path="/parques-tematicos" element={<ParquesTematicos />} />
    <Route path="/parque/:slug" element={<ParqueDetalle />} />
    <Route path="/parque-nacional/:slug" element={<ParqueNacionalDetalle />} />
    <Route path="/reservas-naturales" element={<ReservasNaturales />} />
    <Route path="/areas-protegidas" element={<AreasProtegidas />} />
    <Route path="/montanas" element={<Montanas />} />
    <Route path="/montana/:slug" element={<MontanaDetalle />} />
    <Route path="/pico-duarte" element={<PicoDuarte />} />
    <Route path="/ecoturismo" element={<Ecoturismo />} />
    <Route path="/cueva/:slug" element={<CuevaDetalle />} />
    <Route path="/aguas-termales" element={<AguasTermales />} />
    <Route path="/avistamiento-aves" element={<AvistamientoAves />} />
    <Route path="/biodiversidad" element={<Biodiversidad />} />
    <Route path="/astroturismo" element={<Astroturismo />} />
    <Route path="/avistamiento-ballenas" element={<AvistamientoBallenas />} />

    {/* Alojamientos */}
    <Route path="/alojamientos" element={<Alojamientos />} />
    <Route path="/alojamiento/:slug" element={<AlojamientoDetalle />} />
    <Route path="/airbnb/:slug" element={<AirbnbDetalle />} />
    <Route path="/comparador-hoteles" element={<ComparadorHoteles />} />
    <Route path="/establecimientos" element={<Establecimientos />} />

    {/* Gastronomía */}
    <Route path="/restaurante" element={<Navigate to="/restaurantes" replace />} />
    <Route path="/restaurantes" element={<Restaurantes />} />
    <Route path="/restaurante/:slug" element={<RestauranteDetalle />} />
    <Route path="/guia-gastronomica" element={<GuiaGastronomica />} />
    <Route path="/chef/:slug" element={<ChefPerfil />} />
    <Route path="/receta/:slug" element={<RecetaDetalle />} />
    <Route path="/recetas-criollas" element={<RecetasCriollas />} />
    <Route path="/rutas-sabor" element={<RutasSabor />} />
    <Route path="/bebidas-rd" element={<BebidasRD />} />

    {/* Cultura, Historia & Patrimonio */}
    <Route path="/cultura" element={<Cultura />} />
    <Route path="/patrimonio" element={<Patrimonio />} />
    <Route path="/museos" element={<MuseosMonumentos />} />
    <Route path="/museos-monumentos" element={<MuseosMonumentos />} />
    <Route path="/historia" element={<HistoriaIndex />} />
    <Route path="/historia/:slug" element={<HistoriaDetalle />} />
    <Route path="/historia-rd" element={<Navigate to="/historia" replace />} />
    <Route path="/historia-cronologia" element={<HistoriaRD />} />
    <Route path="/historia/personaje/:slug" element={<PersonajeHistorico />} />
    <Route path="/historia/evento/:slug" element={<EventoHistorico />} />
    <Route path="/historia-viva-ar" element={<HistoriaVivaAR />} />
    <Route path="/turismo-religioso" element={<TurismoReligioso />} />
    <Route path="/destino-religioso/:slug" element={<DestinoReligiosoDetalle />} />
    <Route path="/carnaval" element={<CarnavalDominicano />} />
    <Route path="/carnaval-dominicano" element={<CarnavalDominicano />} />
    <Route path="/cultura-tabaco" element={<CulturaTabaco />} />
    <Route path="/cultura-cafe" element={<CulturaCafe />} />
    <Route path="/ruta-ron-tabaco" element={<RutaRonTabaco />} />
    <Route path="/ruta-larimar" element={<RutaLarimar />} />
    <Route path="/ruta-hermanas-mirabal" element={<RutaHermanasMirabal />} />
    <Route path="/talleres-artesanales" element={<TalleresArtesanales />} />
    <Route path="/escuela-ritmos" element={<EscuelaRitmos />} />
    <Route path="/cine-rd" element={<CineRD />} />
    <Route path="/podcast" element={<PodcastRD />} />
    <Route path="/diccionario" element={<DiccionarioDominicano />} />
    <Route path="/hecho-en-rd" element={<HechoEnRD />} />

    {/* Actividades, Tours & Experiencias */}
    <Route path="/actividades" element={<Actividades />} />
    <Route path="/actividad/:slug" element={<ActividadDetalle />} />
    <Route path="/experiencias" element={<Experiencias />} />
    <Route path="/experiencia/:slug" element={<ExperienciaDetalle />} />
    <Route path="/comparador-experiencias" element={<ComparadorExperiencias />} />
    <Route path="/tours" element={<Tours />} />
    <Route path="/tour/:slug" element={<TourDetalle />} />
    <Route path="/tours-360" element={<Tours360 />} />
    <Route path="/audio-guias" element={<AudioGuias />} />
    <Route path="/turismo-sensorial" element={<TurismoSensorial />} />
    <Route path="/volunturismo" element={<Volunturismo />} />
    <Route path="/turismo-comunitario" element={<TurismoComunitario />} />

    {/* Ocio, Eventos, Deportes & Vida Nocturna */}
    <Route path="/eventos" element={<Eventos />} />
    <Route path="/evento/:slug" element={<EventoDetalle />} />
    <Route path="/evento/:id" element={<EventoDetalle />} />
    <Route path="/eventos/:slug" element={<Navigate to="/evento/:slug" replace />} />
    <Route path="/eventos/:id" element={<Navigate to="/evento/:id" replace />} />
    <Route path="/eventos-vivo" element={<EventosVivo />} />
    <Route path="/vida-nocturna" element={<VidaNocturna />} />
    <Route path="/bar/:slug" element={<BarDetalle />} />
    <Route path="/casinos" element={<Casinos />} />
    <Route path="/turismo-deportivo" element={<TurismoDeportivo />} />
    <Route path="/golf-rd" element={<GolfRD />} />
    <Route path="/golf" element={<GolfRD />} />
    <Route path="/buceo-snorkel" element={<TurismoBuceo />} />
    <Route path="/lidom" element={<LIDOM />} />
    <Route path="/estadio/:slug" element={<EstadioDetalle />} />
    <Route path="/recinto/:slug" element={<EstadioDetalle />} />
    <Route path="/teatro/:slug" element={<EstadioDetalle />} />

    {/* Wellness, Salud & Clima */}
    <Route path="/wellness" element={<Navigate to="/spas-wellness" replace />} />
    <Route path="/spas" element={<SpasWellness />} />
    <Route path="/spas-wellness" element={<SpasWellness />} />
    <Route path="/spa/:slug" element={<SpaDetalle />} />
    <Route path="/turismo-medico" element={<TurismoMedico />} />
    <Route path="/clinica/:slug" element={<ClinicaDetalle />} />
    <Route path="/observatorio-sargazo" element={<ObservatorioSargazo />} />
    <Route path="/sargazo" element={<ObservatorioSargazo />} />
    <Route path="/reporte-olas-viento" element={<ReporteOlasViento />} />
    <Route path="/webcams" element={<Webcams />} />

    {/* Guías Temáticas e Inclusivas */}
    <Route path="/guias-locales" element={<GuiasLocales />} />
    <Route path="/guias-ecologicos" element={<GuiasLocales />} />
    <Route path="/fotografos" element={<FotografosLocales />} />
    <Route path="/guia-lgbtq" element={<GuiaLGBTQ />} />
    <Route path="/viajera-sola" element={<ViajeraSola />} />
    <Route path="/guia-vegana" element={<GuiaVegana />} />
    <Route path="/guia-halal-kosher" element={<GuiaHalalKosher />} />
    <Route path="/viajar-con-mascotas" element={<ViajarConMascotas />} />
    <Route path="/viajeros-senior" element={<ViajerosSenior />} />
    <Route path="/familia" element={<FamiliaConNinos />} />
    <Route path="/familia-con-ninos" element={<FamiliaConNinos />} />
    <Route path="/compras" element={<Compras />} />
    <Route path="/centro-comercial/:slug" element={<CentroComercialDetalle />} />
    <Route path="/sello-calidad" element={<SelloCalidad />} />
  </>
);
