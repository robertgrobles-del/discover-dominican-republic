import { lazy } from "react";
import { Route } from "react-router-dom";

// Lazy-loaded pages
const TiendaHome = lazy(() => import("@/modules/tienda/pages/TiendaHome"));
const TiendaProducto = lazy(() => import("@/modules/tienda/pages/TiendaProducto"));
const TiendaCheckout = lazy(() => import("@/modules/tienda/pages/TiendaCheckout"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const TarjetaPrepago = lazy(() => import("@/pages/TarjetaPrepago"));
const SuscripcionesSabores = lazy(() => import("@/pages/SuscripcionesSabores"));
const SouvenirsDigitales = lazy(() => import("@/pages/SouvenirsDigitales"));

export const storeRoutes = (
  <>
    {/* Tienda Oficial & Checkout */}
    <Route path="/tienda" element={<TiendaHome />} />
    <Route path="/tienda/checkout" element={<TiendaCheckout />} />
    <Route path="/tienda/:slug" element={<TiendaProducto />} />
    <Route path="/checkout" element={<TiendaCheckout />} />

    {/* Marketplace & Productos Especiales */}
    <Route path="/marketplace" element={<Marketplace />} />
    <Route path="/tarjeta-prepago" element={<TarjetaPrepago />} />
    <Route path="/suscripciones-sabores" element={<SuscripcionesSabores />} />
    <Route path="/souvenirs-digitales" element={<SouvenirsDigitales />} />
  </>
);
