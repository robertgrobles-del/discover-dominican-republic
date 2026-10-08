import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

// Lazy-loaded pages
const OperadoresLanding = lazy(() => import("@/modules/operadores/pages/OperadoresLanding"));
const OperadoresFuncion = lazy(() => import("@/modules/operadores/pages/OperadoresFuncion"));
const OperadoresDirectorio = lazy(() => import("@/modules/operadores/pages/OperadoresDirectorio"));
const OperadorStorefront = lazy(() => import("@/modules/operadores/pages/OperadorStorefront"));
const OperadorServicio = lazy(() => import("@/modules/operadores/pages/OperadorServicio"));
const OperatorPanel = lazy(() => import("@/modules/operadores/panel/OperatorPanel"));
const PricingPlan = lazy(() => import("@/pages/PricingPlan"));
const PartnerLogin = lazy(() => import("@/pages/PartnerLogin"));
const DirectorioAgencias = lazy(() => import("@/pages/DirectorioAgencias"));
const AgenciaDetalle = lazy(() => import("@/pages/AgenciaDetalle"));
const Inversion = lazy(() => import("@/pages/Inversion"));
const ProyectosInversion = lazy(() => import("@/pages/ProyectosInversion"));
const BienesRaices = lazy(() => import("@/pages/BienesRaices"));
const CalculadoraCONFOTUR = lazy(() => import("@/pages/CalculadoraCONFOTUR"));
const CalculadoraTributaria = lazy(() => import("@/pages/CalculadoraTributaria"));
const MICEBodas = lazy(() => import("@/pages/MICEBodas"));
const EventosGrupo = lazy(() => import("@/pages/EventosGrupo"));
const ProgramaCreadores = lazy(() => import("@/pages/ProgramaCreadores"));
const EstanciasCreadores = lazy(() => import("@/pages/EstanciasCreadores"));
const ContratarInfluencers = lazy(() => import("@/pages/ContratarInfluencers"));
const AutorInvitado = lazy(() => import("@/pages/AutorInvitado"));
const SistemaAfiliados = lazy(() => import("@/pages/SistemaAfiliados"));
const Empleo = lazy(() => import("@/pages/Empleo"));
const EmpleoDetalle = lazy(() => import("@/pages/EmpleoDetalle"));
const AcademiaTuristica = lazy(() => import("@/pages/AcademiaTuristica"));

export const operatorRoutes = (
  <>
    {/* Portal de Operadores y Negocios */}
    <Route path="/operadores" element={<OperadoresLanding />} />
    <Route path="/operadores/directorio" element={<OperadoresDirectorio />} />
    <Route path="/operadores/funciones/:feature" element={<OperadoresFuncion />} />
    <Route path="/operadores/panel/*" element={<OperatorPanel />} />
    <Route path="/operador/:slug" element={<OperadorStorefront />} />
    <Route path="/operador/:slug/:listing" element={<OperadorServicio />} />
    <Route path="/partner/login" element={<PartnerLogin />} />
    <Route path="/partner/dashboard" element={<Navigate to="/operadores/panel" replace />} />
    <Route path="/panel-empresa" element={<Navigate to="/operadores/panel" replace />} />
    <Route path="/panel-negocio" element={<Navigate to="/operadores/panel" replace />} />
    
    {/* Planes Comerciales y Publicidad */}
    <Route path="/para-empresas" element={<PricingPlan />} />
    <Route path="/planes" element={<PricingPlan />} />
    <Route path="/anunciate" element={<PricingPlan />} />
    
    {/* Agencias de Viajes y Operadores */}
    <Route path="/agencias" element={<Navigate to="/directorio-agencias" replace />} />
    <Route path="/directorio-agencias" element={<DirectorioAgencias />} />
    <Route path="/agencia/:slug" element={<AgenciaDetalle />} />

    {/* Inversión y Bienes Raíces */}
    <Route path="/inversion" element={<Inversion />} />
    <Route path="/proyectos-inversion" element={<ProyectosInversion />} />
    <Route path="/bienes-raices" element={<BienesRaices />} />
    <Route path="/confotur-calculadora" element={<CalculadoraCONFOTUR />} />
    <Route path="/calculadora-confotur" element={<CalculadoraCONFOTUR />} />
    <Route path="/calculadora-tributaria" element={<CalculadoraTributaria />} />

    {/* MICE, Congresos y Bodas */}
    <Route path="/mice-bodas" element={<MICEBodas />} />
    <Route path="/bodas" element={<MICEBodas />} />
    <Route path="/mice" element={<MICEBodas />} />
    <Route path="/eventos-grupo" element={<EventosGrupo />} />

    {/* Creadores de Contenido y Afiliados */}
    <Route path="/creadores" element={<ProgramaCreadores />} />
    <Route path="/panel-creador" element={<Navigate to="/creadores" replace />} />
    <Route path="/panel-embajador" element={<Navigate to="/creadores" replace />} />
    <Route path="/creadores/estancias" element={<EstanciasCreadores />} />
    <Route path="/estancias-creadores" element={<EstanciasCreadores />} />
    <Route path="/contratar-influencers" element={<ContratarInfluencers />} />
    <Route path="/autor-invitado" element={<AutorInvitado />} />
    <Route path="/afiliados" element={<SistemaAfiliados />} />

    {/* Empleo y Academia */}
    <Route path="/empleo" element={<Empleo />} />
    <Route path="/empleo/:slug" element={<EmpleoDetalle />} />
    <Route path="/academia" element={<AcademiaTuristica />} />
  </>
);
