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
const ContactosEmergencia = lazy(() => import("@/pages/ContactosEmergencia"));
const Salud24h = lazy(() => import("@/pages/Salud24h"));
const CentroSaludDetalle = lazy(() => import("@/pages/CentroSaludDetalle"));
const EscuelaViajero = lazy(() => import("@/pages/EscuelaViajero"));
const GuiaEtiqueta = lazy(() => import("@/pages/GuiaEtiqueta"));
const EspanolViajero = lazy(() => import("@/pages/EspanolViajero"));
const TraductorViajero = lazy(() => import("@/pages/TraductorViajero"));
const IdentificadorComida = lazy(() => import("@/pages/IdentificadorComida"));
const ComoLlegar = lazy(() => import("@/pages/ComoLlegar"));
const Aeropuerto = lazy(() => import("@/pages/Aeropuerto"));
const AeropuertoDetalle = lazy(() => import("@/pages/AeropuertoDetalle"));
const VuelosAerolineas = lazy(() => import("@/pages/VuelosAerolineas"));
const PuertosMarinas = lazy(() => import("@/pages/PuertosMarinas"));
const PuertoDetalle = lazy(() => import("@/pages/PuertoDetalle"));
const MarinaDetalle = lazy(() => import("@/pages/MarinaDetalle"));
const NauticaCruceros = lazy(() => import("@/pages/NauticaCruceros"));
const InfoTransporte = lazy(() => import("@/pages/InfoTransporte"));
const TransporteUrbano = lazy(() => import("@/pages/TransporteUrbano"));
const MetroSantoDomingo = lazy(() => import("@/pages/MetroSantoDomingo"));
const TelefericoSantoDomingo = lazy(() => import("@/pages/TelefericoSantoDomingo"));
const MonorielSantiago = lazy(() => import("@/pages/MonorielSantiago"));
const AlquilerVehiculos = lazy(() => import("@/pages/AlquilerVehiculos"));
const SeguridadVial = lazy(() => import("@/pages/SeguridadVial"));
const InfoSeguridad = lazy(() => import("@/pages/InfoSeguridad"));
const ETicket = lazy(() => import("@/pages/ETicket"));
const GuiaPracticaPais = lazy(() => import("@/pages/GuiaPracticaPais"));
const EmbajadasConsulados = lazy(() => import("@/pages/EmbajadasConsulados"));
const SeguroViaje = lazy(() => import("@/pages/SeguroViaje"));
const AduanasDutyFree = lazy(() => import("@/pages/AduanasDutyFree"));
const LeyesTurista = lazy(() => import("@/pages/LeyesTurista"));
const Conectividad = lazy(() => import("@/pages/Conectividad"));
const ESimTurista = lazy(() => import("@/pages/ESimTurista"));
const ClimaTemporadas = lazy(() => import("@/pages/ClimaTemporadas"));
const PreciosCombustible = lazy(() => import("@/pages/PreciosCombustible"));
const CalculadoraPeajes = lazy(() => import("@/pages/CalculadoraPeajes"));
const CalculadoraCarbono = lazy(() => import("@/pages/CalculadoraCarbono"));
const CalculadoraPresupuesto = lazy(() => import("@/pages/CalculadoraPresupuesto"));
const VacacionesRD = lazy(() => import("@/pages/VacacionesRD"));
const CalendarioMensual = lazy(() => import("@/pages/CalendarioMensual"));
const VuelveACasa = lazy(() => import("@/pages/VuelveACasa"));
const TasasCambio = lazy(() => import("@/pages/TasasCambio"));
const Loterias = lazy(() => import("@/pages/Loterias"));
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
    <Route path="/calculadora-presupuesto" element={<CalculadoraPresupuesto />} />
    <Route path="/vacaciones" element={<VacacionesRD />} />
    <Route path="/calendario" element={<CalendarioMensual />} />
    <Route path="/vuelve-a-casa" element={<VuelveACasa />} />

    {/* Llegada, Vuelos y Puertos */}
    <Route path="/como-llegar" element={<ComoLlegar />} />
    <Route path="/aeropuerto" element={<Aeropuerto />} />
    <Route path="/aeropuerto/:slug" element={<AeropuertoDetalle />} />
    <Route path="/vuelos-aerolineas" element={<VuelosAerolineas />} />
    <Route path="/aerolineas" element={<Navigate to="/vuelos-aerolineas" replace />} />
    <Route path="/rutas-aereas" element={<Navigate to="/vuelos-aerolineas" replace />} />
    <Route path="/puertos-marinas" element={<PuertosMarinas />} />
    <Route path="/puerto/:slug" element={<PuertoDetalle />} />
    <Route path="/marina/:slug" element={<MarinaDetalle />} />
    <Route path="/cruceros" element={<NauticaCruceros />} />
    <Route path="/nautica" element={<Navigate to="/cruceros" replace />} />
    <Route path="/nautica-cruceros" element={<Navigate to="/cruceros" replace />} />

    {/* Movilidad y Transporte */}
    <Route path="/info/transporte" element={<InfoTransporte />} />
    <Route path="/transporte-urbano" element={<TransporteUrbano />} />
    <Route path="/metro-santo-domingo" element={<MetroSantoDomingo />} />
    <Route path="/teleferico-santo-domingo" element={<TelefericoSantoDomingo />} />
    <Route path="/monoriel-santiago" element={<MonorielSantiago />} />
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
    <Route path="/guia-practica" element={<GuiaPracticaPais />} />
    <Route path="/embajadas" element={<EmbajadasConsulados />} />
    <Route path="/seguro-viaje" element={<SeguroViaje />} />
    <Route path="/info/seguridad" element={<InfoSeguridad />} />
    <Route path="/aduanas" element={<AduanasDutyFree />} />
    <Route path="/leyes-turista" element={<LeyesTurista />} />
    <Route path="/emergencias" element={<ContactosEmergencia />} />
    <Route path="/contactos-emergencia" element={<ContactosEmergencia />} />
    <Route path="/salud-24h" element={<Salud24h />} />
    <Route path="/salud-24h/:id" element={<CentroSaludDetalle />} />
    <Route path="/centro-salud/:id" element={<CentroSaludDetalle />} />

    {/* Conectividad, Clima y Finanzas */}
    <Route path="/conectividad" element={<Conectividad />} />
    <Route path="/esim" element={<ESimTurista />} />
    <Route path="/clima" element={<ClimaTemporadas />} />
    <Route path="/clima-temporadas" element={<ClimaTemporadas />} />
    <Route path="/tasas-cambio" element={<TasasCambio />} />
    <Route path="/loteria" element={<Loteria />} />
    <Route path="/loterias" element={<Loterias />} />
    <Route path="/loteria/:slug" element={<LoteriaDetalle />} />
    <Route path="/loterias/:slug" element={<LoteriaDetalle />} />
    <Route path="/sorteos" element={<SorteosYPremios />} />

    {/* Ayudas y Herramientas del Viajero */}
    <Route path="/herramientas" element={<Herramientas />} />
    <Route path="/accesibilidad" element={<Accesibilidad />} />
    <Route path="/escuela-viajero" element={<EscuelaViajero />} />
    <Route path="/guia-etiqueta" element={<GuiaEtiqueta />} />
    <Route path="/espanol-viajero" element={<EspanolViajero />} />
    <Route path="/traductor" element={<TraductorViajero />} />
    <Route path="/identificador-comida" element={<IdentificadorComida />} />
    <Route path="/silent-guide" element={<SilentGuide />} />
  </>
);
