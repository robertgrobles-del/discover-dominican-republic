import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import Ayuda from "./pages/Ayuda";
import Sostenible from "./pages/Sostenible";
import Articulo from "./pages/Articulo";
import Prensa from "./pages/Prensa";
import Galeria from "./pages/Galeria";
import Terminos from "./pages/Terminos";
import Newsletter from "./pages/Newsletter";
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
import NotFound from "./pages/NotFound";

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
        <Route path="/ayuda" element={<Ayuda />} />
        <Route path="/sostenible" element={<Sostenible />} />
        <Route path="/articulo/:id" element={<Articulo />} />
        <Route path="/prensa" element={<Prensa />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/destino/:id" element={<DestinoDetalle />} />
        <Route path="/destinos-regiones" element={<DestinosRegiones />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/como-llegar" element={<ComoLlegar />} />
        <Route path="/herramientas" element={<Herramientas />} />
        <Route path="/patrimonio" element={<Patrimonio />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
