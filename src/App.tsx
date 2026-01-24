import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/destinos" element={<Destinos />} />
          <Route path="/actividades" element={<Actividades />} />
          <Route path="/planifica" element={<Planifica />} />
          <Route path="/cultura" element={<Cultura />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
