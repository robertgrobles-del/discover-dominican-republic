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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
