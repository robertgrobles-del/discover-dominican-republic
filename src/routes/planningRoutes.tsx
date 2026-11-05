import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

// Lazy-loaded pages
const Planifica = lazy(() => import("@/pages/Planifica"));
const MiViaje = lazy(() => import("@/pages/MiViaje"));
const PlanificadorEscala = lazy(() => import("@/pages/PlanificadorEscala"));
const PlanificadorGrupal = lazy(() => import("@/pages/PlanificadorGrupal"));
const ItinerariosRecomendados = lazy(() => import("@/pages/ItinerariosRecomendados"));
const ItinerarioIA = lazy(() => import("@/pages/ItinerarioIA"));
const ListaEmpaque = lazy(() => import("@/pages/ListaEmpaque"));
const ConversorMoneda = lazy(() => import("@/pages/ConversorMoneda"));
const CostosViaje = lazy(() => import("@/pages/CostosViaje"));
const ZonasHorarias = lazy(() => import("@/pages/ZonasHorarias"));
const RequisitosViaje = lazy(() => import("@/pages/RequisitosViaje"));
const CentroSaludDetalle = lazy(() => import("@/pages/CentroSaludDetalle"));
const EspanolViajero = lazy(() => import("@/pages/EspanolViajero"));
const IdentificadorComida = lazy(() => import("@/pages/IdentificadorComida"));
const ComoLlegar = lazy(() => import("@/pages/ComoLlegar"));
const Aeropuerto = lazy(() => import("@/pages/Aeropuerto"));
const AeropuertoDetalle = lazy(() => import("@/pages/AeropuertoDetalle"));
const PuertosMarinas = lazy(() => import("@/pages/PuertosMarinas"));
const PuertoDetalle = lazy(() => import("@/pages/PuertoDetalle"));
const MarinaDetalle = lazy(() => import("@/pages/MarinaDetalle"));
const NauticaCruceros = lazy(() => import("@/pages/NauticaCruceros"));
const TransporteUrbano = lazy(() => import("@/pages/TransporteUrbano"));
const AlquilerVehiculos = lazy(() => import("@/pages/AlquilerVehiculos"));
const SeguridadVial = lazy(() => import("@/pages/SeguridadVial"));
const InfoSeguridad = lazy(() => import("@/pages/InfoSeguridad"));
const ETicket = lazy(() => import("@/pages/ETicket"));
const EmbajadasConsulados = lazy(() => import("@/pages/EmbajadasConsulados"));
const SeguroViaje = lazy(() => import("@/pages/SeguroViaje"));
const AduanasDutyFree = lazy(() => import("@/pages/AduanasDutyFree"));
const LeyesTurista = lazy(() => import("@/pages/LeyesTurista"));
const Conectividad = lazy(() => import("@/pages/Conectividad"));
const ClimaTemporadas = lazy(() => import("@/pages/ClimaTemporadas"));
const PreciosCombustible = lazy(() => import("@/pages/PreciosCombustible"));
const CalculadoraPeajes = lazy(() => import("@/pages/CalculadoraPeajes"));
const CalculadoraCarbono = lazy(() => import("@/pages/CalculadoraCarbono"));
const VuelveACasa = lazy(() => import("@/pages/VuelveACasa"));
const LoteriaDetalle = lazy(() => import("@/pages/LoteriaDetalle"));
const Loteria = lazy(() => import("@/pages/Loteria"));
const SorteosYPremios = lazy(() => import("@/pages/SorteosYPremios"));
const SilentGuide = lazy(() => import("@/pages/SilentGuide"));
const Herramientas = lazy(() => import("@/pages/Herramientas"));
const Accesibilidad = lazy(() => import("@/pages/Accesibilidad"));
const ReservaDirecta = lazy(() => import("@/pages/ReservaDirecta"));
const RDEnMovimiento = lazy(() => import("@/pages/RDEnMovimiento"));

export const planningRoutes = (
  <>
    {/* Planificación e Itinerarios */}
    <Route path="/planifica" element={<Planifica />} />
    <Route path="/biblioteca" element={<Navigate to="/planifica" replace />} />
    <Route path="/guias-descargables" element={<Navigate to="/planifica" replace />} />
    <Route path="/guia-viajero-responsable" element={<Navigate to="/viaje-responsable" replace />} />
    <Route path="/mi-viaje" element={<MiViaje />} />
    <Route path="/planifica-escala" element={<PlanificadorEscala />} />
    <Route path="/planificador-grupal" element={<PlanificadorGrupal />} />
    <Route path="/itinerarios" element={<ItinerariosRecomendados />} />
    <Route path="/itinerario-ia" element={<ItinerarioIA />} />
    <Route path="/reserva-directa" element={<ReservaDirecta />} />
    <Route path="/lista-empaque" element={<ListaEmpaque />} />
    <Route path="/conversor-moneda" element={<ConversorMoneda />} />
    <Route path="/costos-viaje" element={<CostosViaje />} />
    <Route path="/zonas-horarias" element={<ZonasHorarias />} />
    <Route path="/vuelve-a-casa" element={<VuelveACasa />} />

    {/* Llegada, Vuelos y Puertos */}
    <Route path="/como-llegar" element={<ComoLlegar />} />
    <Route path="/aeropuerto" element={<Aeropuerto />} />
    <Route path="/aeropuerto/:slug" element={<AeropuertoDetalle />} />
    <Route path="/puertos-marinas" element={<PuertosMarinas />} />
    <Route path="/puerto/:slug" element={<PuertoDetalle />} />
    <Route path="/marina/:slug" element={<MarinaDetalle />} />
    <Route path="/cruceros" element={<NauticaCruceros />} />
    <Route path="/nautica" element={<Navigate to="/cruceros" replace />} />
    <Route path="/nautica-cruceros" element={<Navigate to="/cruceros" replace />} />

    {/* Movilidad y Transporte */}
    <Route path="/transporte-urbano" element={<TransporteUrbano />} />
    <Route path="/alquiler-vehiculos" element={<AlquilerVehiculos />} />
    <Route path="/rent-a-car" element={<AlquilerVehiculos />} />
    <Route path="/seguridad-vial" element={<SeguridadVial />} />
    <Route path="/precios-combustibles" element={<PreciosCombustible />} />
    <Route path="/precios-combustible" element={<PreciosCombustible />} />
    <Route path="/calculadora-peajes" element={<CalculadoraPeajes />} />
    <Route path="/calculadora-carbono" element={<CalculadoraCarbono />} />
    <Route path="/running-ciclismo" element={<RDEnMovimiento />} />

    {/* Trámites, Requisitos y Seguridad */}
    <Route path="/e-ticket" element={<ETicket />} />
    <Route path="/requisitos-viaje" element={<RequisitosViaje />} />
    <Route path="/embajadas" element={<EmbajadasConsulados />} />
    <Route path="/seguro-viaje" element={<SeguroViaje />} />
    <Route path="/info/seguridad" element={<InfoSeguridad />} />
    <Route path="/aduanas" element={<AduanasDutyFree />} />
    <Route path="/leyes-turista" element={<LeyesTurista />} />
    <Route path="/salud-24h/:id" element={<CentroSaludDetalle />} />
    <Route path="/centro-salud/:id" element={<CentroSaludDetalle />} />

    {/* Conectividad, Clima y Finanzas */}
    <Route path="/conectividad" element={<Conectividad />} />
    <Route path="/clima" element={<ClimaTemporadas />} />
    <Route path="/loterias" element={<Loteria />} />
    <Route path="/loteria/:slug" element={<LoteriaDetalle />} />
    <Route path="/loterias/:slug" element={<LoteriaDetalle />} />
    <Route path="/sorteos" element={<SorteosYPremios />} />

    {/* Ayudas y Herramientas del Viajero */}
    <Route path="/herramientas" element={<Herramientas />} />
    <Route path="/accesibilidad" element={<Accesibilidad />} />
    <Route path="/espanol-viajero" element={<EspanolViajero />} />
    <Route path="/identificador-comida" element={<IdentificadorComida />} />
    <Route path="/silent-guide" element={<SilentGuide />} />
  </>
);
