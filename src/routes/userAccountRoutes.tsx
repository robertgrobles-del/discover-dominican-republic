import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

// Lazy-loaded pages
const Login = lazy(() => import("@/pages/Login"));
const Registro = lazy(() => import("@/pages/Registro"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Perfil = lazy(() => import("@/pages/Perfil"));
const PasaporteDigital = lazy(() => import("@/pages/PasaporteDigital"));
const MembresiasPasaporte = lazy(() => import("@/pages/MembresiasPasaporte"));
const CheckInDigital = lazy(() => import("@/pages/CheckInDigital"));
const Badges = lazy(() => import("@/pages/Badges"));
const MisLogros = lazy(() => import("@/pages/MisLogros"));
const Top100 = lazy(() => import("@/modules/viajero/RetoTop100"));
const GanaConDescubreRD = lazy(() => import("@/pages/GanaConDescubreRD"));
const ClubRecompensas = lazy(() => import("@/pages/ClubRecompensas"));
const GamificacionTuristica = lazy(() => import("@/pages/GamificacionTuristica"));
const RetosTuristicos = lazy(() => import("@/pages/RetosTuristicos"));
const ProgramaCreadores = lazy(() => import("@/pages/ProgramaCreadores"));
const TriviaTuristica = lazy(() => import("@/pages/TriviaTuristica"));
const MapaMisiones = lazy(() => import("@/pages/MapaMisiones"));
const PerfilJugador = lazy(() => import("@/pages/PerfilJugador"));
const ReglasGamificacion = lazy(() => import("@/pages/ReglasGamificacion"));
const ExplorerProfile = lazy(() => import("@/pages/ExplorerProfile"));
const DiarioViaje = lazy(() => import("@/pages/DiarioViaje"));
const ConcursosFotografia = lazy(() => import("@/pages/ConcursosFotografia"));
const FeedSocial = lazy(() => import("@/pages/FeedSocial"));
const RDSocial = lazy(() => import("@/pages/RDSocial"));
const RutasEmbajadores = lazy(() => import("@/pages/RutasEmbajadores"));
const RequisitosEmbajadores = lazy(() => import("@/pages/RequisitosEmbajadores"));
const GuardianCaribe = lazy(() => import("@/pages/GuardianCaribe"));
const NomadasDigitales = lazy(() => import("@/pages/NomadasDigitales"));
const ViveLocal = lazy(() => import("@/pages/ViveLocal"));
const Reservas = lazy(() => import("@/pages/Reservas"));
const ReclamarReserva = lazy(() => import("@/pages/ReclamarReserva"));
const AcceptInvitation = lazy(() => import("@/pages/AcceptInvitation"));

export const userAccountRoutes = (
  <>
    {/* Autenticación & Cuenta */}
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Registro />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/perfil" element={<Perfil />} />

    {/* Pasaporte Digital & Membresías */}
    <Route path="/pasaporte-digital" element={<PasaporteDigital />} />
    <Route path="/membresias-pasaporte" element={<MembresiasPasaporte />} />
    <Route path="/check-in" element={<CheckInDigital />} />
    <Route path="/badges" element={<Badges />} />
    <Route path="/mis-logros" element={<MisLogros />} />
    <Route path="/top-100" element={<Top100 />} />

    {/* Gamificación & Retos Turísticos */}
    <Route path="/gana-con-descubre-rd" element={<GanaConDescubreRD />} />
    <Route path="/club-recompensas" element={<ClubRecompensas />} />
    <Route path="/gamificacion" element={<Navigate to="/gamificacion-turistica" replace />} />
    <Route path="/gamificacion-turistica" element={<GamificacionTuristica />} />
    <Route path="/gamificacion-turistica/retos" element={<RetosTuristicos />} />
    <Route path="/gamificacion-turistica/creadores" element={<ProgramaCreadores />} />
    <Route path="/gamificacion-turistica/trivia" element={<TriviaTuristica />} />
    <Route path="/gamificacion-turistica/mapa" element={<MapaMisiones />} />
    <Route path="/gamificacion-turistica/perfil" element={<PerfilJugador />} />
    <Route path="/gamificacion-turistica/recompensas" element={<ClubRecompensas />} />
    <Route path="/gamificacion-turistica/reglas" element={<ReglasGamificacion />} />
    <Route path="/reglas-gamificacion" element={<Navigate to="/gamificacion-turistica/reglas" replace />} />
    <Route path="/perfil-jugador" element={<Navigate to="/gamificacion-turistica/perfil" replace />} />
    <Route path="/explorador/:id" element={<ExplorerProfile />} />
    <Route path="/retos" element={<Navigate to="/retos-turisticos" replace />} />
    <Route path="/retos-turisticos" element={<RetosTuristicos />} />
    <Route path="/trivia" element={<Navigate to="/trivia-turistica" replace />} />
    <Route path="/trivia-turistica" element={<TriviaTuristica />} />
    <Route path="/mapa-misiones" element={<MapaMisiones />} />

    {/* Comunidad, Diario & Social */}
    <Route path="/diario-viaje" element={<DiarioViaje />} />
    <Route path="/concursos" element={<ConcursosFotografia />} />
    <Route path="/feed" element={<FeedSocial />} />
    <Route path="/rd-social" element={<RDSocial />} />
    <Route path="/embajadores" element={<RutasEmbajadores />} />
    <Route path="/requisitos-embajadores" element={<RequisitosEmbajadores />} />
    <Route path="/guardian-caribe" element={<GuardianCaribe />} />
    <Route path="/nomadas-digitales" element={<NomadasDigitales />} />
    <Route path="/retirados-nomadas" element={<NomadasDigitales />} />
    <Route path="/vive-local" element={<ViveLocal />} />

    {/* Gestión de Reservas & Invitaciones */}
    <Route path="/reservas" element={<Reservas />} />
    <Route path="/reclamar-reserva" element={<ReclamarReserva />} />
    <Route path="/reservas/reclamar" element={<ReclamarReserva />} />
    <Route path="/invitacion/:token" element={<AcceptInvitation />} />
    <Route path="/invitaciones/:token" element={<AcceptInvitation />} />
  </>
);
