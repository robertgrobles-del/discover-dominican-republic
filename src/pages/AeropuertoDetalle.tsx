import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Plane, MapPin, Star, ChevronRight, Phone, Globe, 
  Car, ShoppingBag, Wifi, Navigation, PlaneTakeoff, 
  ExternalLink, Check, Search, QrCode, FileCheck2,
  Crown, Banknote, Utensils, Cross, Smartphone, Key, 
  Bus, Headphones, ShieldAlert, Sun, Landmark, Waves, 
  Palmtree, Building2, HelpCircle, Navigation2
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateAirportSchema } from "@/components/SEOHead";
import { useTranslation } from "@/i18n";
import { getAirportBySlug, airports, type AirlineContact } from "@/data/airports";

export default function AeropuertoDetalle() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const airport = slug ? getAirportBySlug(slug) : undefined;

  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [airlineSearch, setAirlineSearch] = useState<string>("");

  // Filtrado de aerolíneas en tiempo real
  const filteredAirlines = useMemo<AirlineContact[]>(() => {
    if (!airport) return [];
    const list: AirlineContact[] = airport.airlinesDetailed && airport.airlinesDetailed.length > 0 
      ? airport.airlinesDetailed 
      : airport.airlines.map(name => ({ name, website: "https://www.google.com/search?q=" + encodeURIComponent(name) }));
    
    if (!airlineSearch.trim()) return list;
    const q = airlineSearch.toLowerCase();
    return list.filter(a => 
      a.name.toLowerCase().includes(q) || 
      (a.code && a.code.toLowerCase().includes(q)) ||
      (a.terminal && a.terminal.toLowerCase().includes(q))
    );
  }, [airport, airlineSearch]);

  // Lista de destinos agrupados
  const destinationGroups = useMemo(() => {
    if (!airport) return [];
    return airport.destinationsByContinent || [
      { region: "Norteamérica", destinations: ["Miami (MIA)", "New York (JFK/EWR)", "Atlanta (ATL)", "Boston (BOS)", "Toronto (YYZ)"] },
      { region: "Caribe y Centroamérica", destinations: ["Panamá (PTY)", "San Juan (SJU)", "San José (SJO)", "Curazao (CUR)"] },
      { region: "Sudamérica", destinations: ["Bogotá (BOG)", "Medellín (MDE)"] },
      { region: "Europa", destinations: ["Madrid (MAD)", "Frankfurt (FRA)", "París (ORY)"] }
    ];
  }, [airport]);

  // Destinos mostrados según la región elegida
  const displayedDestinations = useMemo(() => {
    if (!airport) return [];
    if (activeRegion === "all") {
      const all: string[] = [];
      destinationGroups.forEach(g => all.push(...g.destinations));
      return all.length > 0 ? Array.from(new Set(all)) : airport.destinations;
    }
    const group = destinationGroups.find(g => g.region === activeRegion);
    return group ? group.destinations : [];
  }, [airport, activeRegion, destinationGroups]);

  if (!airport) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center max-w-lg">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4 border border-border">
              <Plane className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3">{t("common.noResults") || "Aeropuerto no encontrado"}</h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              El aeropuerto solicitado no se encuentra en el registro o fue actualizado con su nueva nomenclatura.
            </p>
            <Link to="/aeropuerto">
              <button className="rounded-xl px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/95 transition-all">
                {t("common.viewAll") || "Ver todos los aeropuertos"}
              </button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const isSDQ = airport.code === "SDQ";

  return (
    <PageTransition>
      <SEOHead
        title={`${airport.name} (${airport.code}) | Guía Oficial República Dominicana`}
        description={airport.shortDescription}
        keywords={`${airport.name}, ${airport.code}, ${airport.icao}, vuelos ${airport.city}, terminal ${airport.code}, aerolineas ${airport.code}, salas vip ${airport.code}, parqueo ${airport.code}, transporte aeropuerto ${airport.city}`}
        image={airport.imageUrl}
        url={`/aeropuerto/${airport.slug}`}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Red Aeroportuaria Nacional", url: "/aeropuerto" },
          { name: airport.city, url: `/aeropuerto` },
          { name: `${airport.name} (${airport.code})`, url: `/aeropuerto/${airport.slug}` }
        ]}
        geo={{
          latitude: airport.coordinates.lat,
          longitude: airport.coordinates.lng,
          placename: `${airport.city}, ${airport.provinceName}`,
          region: "DO"
        }}
        jsonLd={generateAirportSchema({
          name: airport.name,
          code: airport.code,
          icao: airport.icao,
          description: airport.description,
          image: airport.imageUrl,
          url: `https://descubrerd.com/aeropuerto/${airport.slug}`,
          city: airport.city,
          provinceName: airport.provinceName,
          coordinates: airport.coordinates,
          phone: airport.phone,
          website: airport.website,
          faqs: airport.parkingInfo?.faqs
        })}
      />

      <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#005ea6] selection:text-white">
        
        {/* BEGIN: TopBar Oficial */}
        <div className="bg-[#0b1d3a] text-slate-300 text-xs py-2 px-4 border-b border-slate-700/60" data-purpose="official-topbar">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-600/20 text-red-300 font-semibold text-[10px] tracking-wide border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                PORTAL OFICIAL
              </span>
              <span className="text-slate-200 font-medium hidden sm:inline">República Dominicana</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-[#00a3e0] font-normal hidden md:inline">El mejor destino del Caribe</span>
            </div>

            <div className="flex items-center space-x-4 ml-auto text-[11px]">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{airport.code} / {airport.city}: <strong>28°C</strong> Soleado</span>
              </div>
              <div className="h-3 w-px bg-slate-700 hidden sm:block" />
              <div className="flex items-center space-x-1 cursor-pointer hover:text-white">
                <Globe className="w-3.5 h-3.5" />
                <span className="font-medium">ES</span>
              </div>
              <div className="h-3 w-px bg-slate-700 hidden sm:block" />
              <a className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors" href="tel:+18092003500">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Línea Turista POLITUR 24/7</span>
              </a>
            </div>
          </div>
        </div>
        {/* END: TopBar Oficial */}

        {/* Global Site Header */}
        <Header />

        {/* BEGIN: Breadcrumb */}
        <section className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8" data-purpose="breadcrumbs">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#005ea6] flex items-center">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link to="/aeropuerto" className="hover:text-[#005ea6]">
              Red Aeroportuaria Nacional
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-500">{airport.provinceName || airport.city}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-semibold">{airport.name} ({airport.code})</span>
          </div>
        </section>
        {/* END: Breadcrumb */}

        {/* BEGIN: HeroSection */}
        <section className="relative bg-[#0b1d3a] text-white overflow-hidden py-14 lg:py-20" data-purpose="airport-hero">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              alt={airport.name} 
              className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter contrast-125 scale-105" 
              src={airport.imageUrl} 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1d3a] via-[#0b1d3a]/90 to-[#0b1d3a]/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d3a] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#0284c7]/20 text-cyan-300 border border-[#0284c7]/40 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#0284c7]" />
                {isSDQ ? "Punta Caucedo, Santo Domingo" : `${airport.city}, ${airport.provinceName}`}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <PlaneTakeoff className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                {isSDQ ? "Hub Principal de Arajet" : (airport.highlights?.[0] || "Terminal Internacional")}
              </span>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
                {airport.rating.toFixed(1)} <span className="text-amber-200/80 ml-1 font-normal">({airport.reviewCount.toLocaleString()}+ reseñas verificadas)</span>
              </div>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 font-display">
                {airport.name}
              </h1>
              <p className="text-lg sm:text-xl font-medium text-[#00a3e0] mb-4">
                {isSDQ ? "Doctor José Francisco Peña Gómez" : airport.city} (IATA: <strong className="text-white">{airport.code}</strong> • ICAO: <strong className="text-white">{airport.icao}</strong>)
              </p>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {airport.description}
              </p>
            </div>

            {/* Quick Airport Metric Cards (Horizontal Ribbon) */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-700/60">
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 hover:border-[#0284c7]/40 transition">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Código IATA / ICAO</span>
                <span className="text-base font-bold text-white flex items-center mt-1">
                  {airport.code} / {airport.icao}
                </span>
              </div>

              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 hover:border-[#0284c7]/40 transition">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Tráfico Anual</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {airport.passengersAnnual || "> 5.81M pax/año"}
                </span>
              </div>

              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 hover:border-[#0284c7]/40 transition">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Pista Principal</span>
                <span className="text-xs font-bold text-white mt-1 block leading-tight">
                  {airport.runwayLength || "3,354 m (11,004 ft)"}
                  {isSDQ && <span className="text-[10px] text-[#00a3e0] block font-normal">Más extensa del país</span>}
                </span>
              </div>

              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 hover:border-[#0284c7]/40 transition">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Elevación</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {airport.elevation || "18 m (59 ft) MSL"}
                </span>
              </div>

              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 hover:border-[#0284c7]/40 transition">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Terminales</span>
                <span className="text-xs font-bold text-white mt-1 block leading-tight">
                  {airport.terminals.slice(0, 2).join(" y ")}
                  <span className="text-[10px] text-slate-400 block font-normal">+ Terminal Carga Int.</span>
                </span>
              </div>

              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 hover:border-[#0284c7]/40 transition">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Operador Oficial</span>
                <span className="text-xs font-bold text-white mt-1 block leading-tight">
                  {airport.operator?.split("(")[0]?.trim() || "AERODOM"}
                  <span className="text-[10px] text-emerald-400 block font-semibold">VINCI Airports</span>
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* END: HeroSection */}

        {/* BEGIN: ETicketBanner Floating */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20" data-purpose="mandatory-notice-banner" id="eticket-section">
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden">
            {/* Decorative background watermark */}
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
              <QrCode className="w-72 h-72 text-emerald-300" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start space-x-4 max-w-3xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                      Requisito Migratorio Obligatorio
                    </span>
                    <span className="text-xs text-emerald-300 font-semibold">100% Gratuito en Portal Estatal</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    E-Ticket Electrónico de Entrada y Salida a República Dominicana
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                    Todos los pasajeros nacionales y extranjeros que entren o salgan por el <strong className="text-white">{airport.name} ({airport.code})</strong> deben completar la declaración jurada digital de Migración, Aduanas y Salud Pública antes de abordar para generar su código QR único.
                  </p>
                  <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3 text-xs text-emerald-200">
                    <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Válido por familia o individual</span>
                    <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Sin costo alguno en el sitio gubernamental</span>
                    <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Genera código QR descargable</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
                <a 
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95" 
                  href="https://eticket.gob.do/" 
                  rel="noopener noreferrer" 
                  target="_blank"
                >
                  <span>Completar E-Ticket Oficial</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
                <Link 
                  to="/e-ticket" 
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-200 border border-emerald-500/30 font-medium text-xs transition" 
                  data-purpose="open-eticket-guide"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                  <span>Ver Guía Oficial y Pasos</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* END: ETicketBanner Floating */}

        {/* BEGIN: InteractiveTabNav */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8" data-purpose="quick-jump-navigation">
          <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            <a className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#005ea6] text-white shadow-sm transition" href="#aerolineas">
              Aerolíneas &amp; Vuelos
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#destinos">
              Rutas y Destinos
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#servicios">
              Salas VIP &amp; Amenidades
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#transporte">
              Transporte &amp; Tarifas
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#historia-terminal">
              Sobre el Aeropuerto
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#galeria">
              Galería Visual
            </a>
          </div>
        </section>
        {/* END: InteractiveTabNav */}

        {/* BEGIN: MainContentGrid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ========================================== */}
            {/* LEFT COLUMN: PRIMARY TRAVEL CONTENT (8 Cols) */}
            {/* ========================================== */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* SECTION: Airlines & Flights */}
              <section className="scroll-mt-24" data-purpose="airlines-section" id="aerolineas">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Conexiones Globales</span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Aerolíneas Comerciales Operando en {airport.code}</h2>
                    <p className="text-xs text-slate-500 mt-1">Compañías que operan vuelos regulares y chárter en las terminales activas.</p>
                  </div>
                  
                  {/* Quick Airline Filter Input */}
                  <div className="relative w-full sm:w-64">
                    <input 
                      type="text"
                      value={airlineSearch}
                      onChange={(e) => setAirlineSearch(e.target.value)}
                      placeholder="Buscar aerolínea..." 
                      className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#005ea6] focus:ring-1 focus:ring-[#005ea6] outline-none transition" 
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Airlines Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredAirlines.map((airline, idx) => {
                    const isHub = airline.isHub || (isSDQ && airline.name.toLowerCase().includes("arajet"));
                    return (
                      <div 
                        key={idx}
                        className={`airline-card p-3.5 rounded-xl border transition group ${
                          isHub
                            ? "bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border-2 border-[#005ea6]/30 hover:border-[#005ea6] hover:shadow-md"
                            : "bg-white border-slate-200/90 hover:border-[#005ea6] hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-[#005ea6] transition truncate max-w-[150px]">
                              {airline.name}
                            </span>
                            {isHub && (
                              <span className="text-[9px] bg-[#005ea6] text-white px-1.5 py-0.2 rounded font-semibold shrink-0">
                                HUB {airport.code}
                              </span>
                            )}
                          </div>
                          {airline.code ? (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium shrink-0">
                              {airline.code}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono text-3xs shrink-0">
                              IATA
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span className="truncate max-w-[130px]">
                            {airline.website.replace("https://", "").replace("http://", "").replace("www.", "").replace(/\/$/, "")}
                          </span>
                          <a 
                            className="text-[#005ea6] hover:underline inline-flex items-center font-semibold" 
                            href={airline.website} 
                            rel="noopener noreferrer" 
                            target="_blank"
                          >
                            Web <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-[10px] text-slate-400">
                          <Check className="w-3 h-3 text-emerald-500 mr-1 shrink-0" />
                          <span className="truncate">{airline.terminal || "Mostrador en Terminal"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredAirlines.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                    No se encontraron aerolíneas con el término «{airlineSearch}».
                  </div>
                )}

                {/* Footer notice of remaining airlines */}
                <div className="mt-4 p-3 bg-slate-100/80 rounded-xl text-center text-xs text-slate-600">
                  Otras aerolíneas regulares y estacionales: <span className="font-medium text-slate-800">Sky High Aviation, Air Antilles, Condor, Laser, Rutaca, Turpial, Sunrise Airways, World2Fly y GlobalX</span>.
                </div>
              </section>

              {/* SECTION: Destinations & Network */}
              <section className="scroll-mt-24" data-purpose="destinations-section" id="destinos">
                <div className="mb-4">
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Rutas Directas</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Destinos Conectados sin Escalas</h2>
                  <p className="text-xs text-slate-500 mt-1">Conexión inmediata con las principales capitales de América y Europa.</p>
                </div>

                {/* Region Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button 
                    onClick={() => setActiveRegion("all")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeRegion === "all" 
                        ? "bg-[#0b1d3a] text-white shadow-xs" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Todos ({destinationGroups.reduce((acc, g) => acc + g.destinations.length, 0)})
                  </button>
                  {destinationGroups.map((group) => (
                    <button 
                      key={group.region}
                      onClick={() => setActiveRegion(group.region)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeRegion === group.region 
                          ? "bg-[#0b1d3a] text-white font-semibold shadow-xs" 
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {group.region} ({group.destinations.length})
                    </button>
                  ))}
                </div>

                {/* Connected Cities Cloud */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap gap-2">
                  {displayedDestinations.map((city, idx) => {
                    const isKeyCity = city.includes("MAD") || city.includes("Madrid");
                    return (
                      <span 
                        key={idx}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-default ${
                          isKeyCity 
                            ? "bg-blue-50 text-[#005ea6] font-semibold border border-blue-200" 
                            : "bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-[#005ea6] hover:text-[#005ea6]"
                        }`}
                      >
                        <Plane className={`w-3 h-3 mr-1.5 ${isKeyCity ? "text-[#005ea6]" : "text-slate-400"}`} />
                        {city}
                      </span>
                    );
                  })}
                </div>
              </section>

              {/* SECTION: Services & Amenities */}
              <section className="scroll-mt-24" data-purpose="airport-amenities" id="servicios">
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Comodidades y Confort</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Servicios en Terminal</h2>
                  <p className="text-xs text-slate-500 mt-1">Infraestructura de estándar mundial para una experiencia placentera de llegada y salida.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service 1: VIP Lounges */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                      <Crown className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Salones VIP Before Boarding &amp; Copa Club</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      5 salas VIP premium con Wi-Fi dedicado, barra de cócteles caribeños, buffet gourmet, duchas privadas, salas de descanso y gestión expedita de seguridad y migración.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-[#005ea6]">
                      <span>Acceso con Priority Pass &amp; Tarjetas Platino</span>
                    </div>
                  </div>

                  {/* Service 2: Duty Free */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Zona Comercial Duty Free Dufrý</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Paseo comercial de más de 3,000 m² libre de impuestos con reconocidas marcas de perfumes, cosméticos, licores internacionales y tiendas exclusivas de ron dominicano, cigarros y café.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-slate-600">
                      <span>Ubicado en Terminal A y Terminal B</span>
                    </div>
                  </div>

                  {/* Service 3: Wi-Fi */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0284c7] flex items-center justify-center mb-3">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Wi-Fi Gratuito Ilimitado Aerodom</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Conexión a internet gratuita en todos los niveles del aeropuerto, zonas de check-in, salas de embarque y pasillos de reclamo de equipaje. Red oficial <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">VINCI-Airports_WiFi</code>.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
                      <Check className="w-3.5 h-3.5 mr-1" /> Alta velocidad sin registro previo complejo
                    </div>
                  </div>

                  {/* Service 4: Banking & Exchange */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Bancos &amp; Cambio Oficial</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Sucursales del Banco de Reservas (Banreservas), Banco Popular y cajeros automáticos multimoneda (DOP, USD, EUR) 24/7 en el área pública y de llegadas internacionales.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-slate-600">
                      <span>Casas de cambio certificadas por Banco Central</span>
                    </div>
                  </div>

                  {/* Service 5: Dining & Gastronomy */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Food Court &amp; Sabores Dominicanos</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Cafeterías y restaurantes con franquicias internacionales y degustaciones de gastronomía criolla (mangú tradicional, sancocho, pescado frito caribeño y café local recién tostado).
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-slate-600">
                      <span>Opciones 24 horas en pre y post-seguridad</span>
                    </div>
                  </div>

                  {/* Service 6: Health & Pharmacy */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                      <Cross className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Farmacia 24 Horas &amp; Sanidad Médica</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Dispensario médico y farmacia continua en el nivel de llegadas. Atención de primeros auxilios y orientación de sanidad fronteriza para pasajeros y tripulaciones.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-red-600">
                      <Phone className="w-3.5 h-3.5 mr-1" /> Asistencia de Emergencia interna Ext. 2222
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: Ground Transportation */}
              <section className="scroll-mt-24" data-purpose="ground-transportation" id="transporte">
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Movilidad y Traslados</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Cómo Moverse desde el {airport.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">Opciones verificadas y reguladas para trasladarse a {airport.city} y los principales destinos turísticos.</p>
                </div>

                {/* Transport Cards Stack */}
                <div className="space-y-3.5">
                  {/* Taxi Oficial SICHOPROA */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#005ea6]/60 transition shadow-xs">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Taxi Oficial {airport.code} (SICHOPROA)</h3>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Oficial y Seguro</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-md">
                          Sindicato de Choferes de Las Américas con tarifa fija por zona. Mostrador de prepago disponible directamente a la salida de la sala de aduanas.
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Tarifa a Sto. Dgo.</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">US$ 30 - 40</span>
                      <span className="text-[11px] text-slate-500 block">o ~RD$ 1,800 - 2,400</span>
                    </div>
                  </div>

                  {/* Ridesharing: Uber / DiDi */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#005ea6]/60 transition shadow-xs">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Uber / DiDi Ridesharing</h3>
                          <span className="bg-blue-100 text-[#005ea6] text-[10px] font-bold px-2 py-0.5 rounded">Bahía Autorizada</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-md">
                          Puntos de recogida delimitados frente a la salida exterior de la Terminal A y B (Nivel 1). Solicite su vehículo una vez tenga su equipaje en mano.
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Estimado en App</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">RD$ 1,100 - 1,600</span>
                      <span className="text-[11px] text-slate-500 block">Sujeto a demanda horaria</span>
                    </div>
                  </div>

                  {/* Car Rental */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#005ea6]/60 transition shadow-xs">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005ea6] flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Renta de Autos Multimarca</h3>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">8 Agencias</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-md">
                          Avis, Budget, Hertz, Sixt, Europcar, Alamo, National y Dollar con mostradores en el vestíbulo y entrega de vehículos en estacionamiento exclusivo.
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Desde</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">US$ 35 / día</span>
                      <Link to="/contacto" className="text-xs text-[#005ea6] font-semibold hover:underline block mt-0.5">
                        Reservar con anticipación →
                      </Link>
                    </div>
                  </div>

                  {/* Public Interurban Bus */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#005ea6]/60 transition shadow-xs">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Autobús Interurbano y Transfers</h3>
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">Económico</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-md">
                          Parada de microbuses hacia Boca Chica y el Parque Enriquillo / Zona Colonial en el ramal de la autopista exterior. Traslados turísticos privados a hoteles del litoral.
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Pasaje Local</span>
                      <span className="text-base sm:text-lg font-black text-emerald-700">RD$ 75 - 100</span>
                      <span className="text-[11px] text-slate-500 block">Solo pago en efectivo local</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: History & Infrastructure Story */}
              <section className="bg-gradient-to-br from-slate-900 to-[#0b1d3a] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden" data-purpose="about-airport" id="historia-terminal">
                <div className="max-w-2xl relative z-10">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Reseña e Infraestructura</span>
                  <h2 className="text-2xl font-bold text-white mt-1 font-display">
                    {isSDQ ? "El Gran Centro de Conectividad de la Capital" : `Infraestructura Oficial de ${airport.name}`}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                    {isSDQ ? (
                      "Inaugurado originalmente en 1959 en Punta Caucedo, el Aeropuerto Las Américas fue rebautizado en honor al prominente líder político Dr. José Francisco Peña Gómez. Con su pista de 3,354 metros apta para aeronaves de fuselaje ancho como Boeing 777 y Airbus A350, representa el punto neurálgico del comercio aéreo y turismo internacional dominicano."
                    ) : airport.description}
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm mt-2.5 leading-relaxed">
                    {isSDQ ? (
                      "Con la moderna concesión de AERODOM operada por el conglomerado global VINCI Airports, el aeropuerto ha completado la ampliación de la Terminal Pública Central con una inversión superior a US$ 250 millones, fortaleciendo a Santo Domingo como el gran Hub Continental de bajo costo de la región."
                    ) : (
                      "La terminal aeroportuaria dispone de sistemas de radionavegación satelital y certificación internacional OACI para operaciones nocturnas e intercontinentales continuas."
                    )}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-[#00a3e0] font-bold block text-sm">Hub Arajet</span>
                      <span className="text-slate-400">Base estratégica del Caribe</span>
                    </div>
                    <div>
                      <span className="text-[#00a3e0] font-bold block text-sm">Terminal Carga #1</span>
                      <span className="text-slate-400">111,000+ tons/año</span>
                    </div>
                    <div>
                      <span className="text-[#00a3e0] font-bold block text-sm">Autovía del Este</span>
                      <span className="text-slate-400">Acceso a playas en 10 min</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: Photo Gallery */}
              <section className="scroll-mt-24" data-purpose="airport-gallery" id="galeria">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Visuales de la Terminal</span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Galería Fotográfica</h2>
                  </div>
                  <span className="text-xs text-slate-500 hidden sm:inline">Instalaciones renovadas 2024-2026</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="group relative overflow-hidden rounded-xl h-44 bg-slate-200 shadow-xs">
                    <img 
                      alt="Terminal Aérea y Plataforma" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      src={airport.gallery[0] || airport.imageUrl} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-white text-xs font-medium">Plataforma de Aeronaves</span>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl h-44 bg-slate-200 shadow-xs">
                    <img 
                      alt="Pasillos de Salidas y Duty Free" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      src={airport.gallery[1] || airport.imageUrl} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-white text-xs font-medium">Concourse y Puertas de Embarque</span>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl h-44 bg-slate-200 col-span-2 sm:col-span-1 shadow-xs">
                    <img 
                      alt="Aproximación sobre el Mar Caribe" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      src={airport.gallery[2] || airport.imageUrl} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-white text-xs font-medium">Aproximación sobre el Mar Caribe</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* ========================================== */}
            {/* RIGHT COLUMN: VISITOR UTILITY SIDEBAR (4 Cols) */}
            {/* ========================================== */}
            <aside className="lg:col-span-4 space-y-6">

              {/* SIDEBAR CARD: Passenger Assistance & Key Contacts */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm" id="asistencia">
                <div className="flex items-center space-x-2 text-[#005ea6] mb-3 pb-3 border-b border-slate-100">
                  <Headphones className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Atención al Pasajero</h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Teléfono de Terminal</span>
                      <a className="text-slate-900 font-bold hover:text-[#005ea6] transition" href={`tel:${airport.phone}`}>
                        {airport.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <ShieldAlert className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">POLITUR (Policía de Turismo)</span>
                      <span className="text-slate-900 font-semibold block">Mostrador 24/7 en Hall de Llegadas</span>
                      <a href="tel:+18092003500" className="text-emerald-700 block font-medium hover:underline">
                        +1 (809) 200-3500
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Navigation className="w-4 h-4 text-[#0284c7] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Asistencia Movilidad Reducida</span>
                      <span className="text-slate-700">Solicitar a su aerolínea con 48h de antelación o en mostrador de información.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Sitio Oficial Operador</span>
                      <a 
                        className="text-[#005ea6] font-bold hover:underline inline-flex items-center" 
                        href={airport.website} 
                        rel="noopener noreferrer" 
                        target="_blank"
                      >
                        {airport.website.replace("https://", "").replace("http://", "").replace(/\/$/, "")} 
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link 
                    to="/e-ticket" 
                    className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    <span>Guía Oficial del E-Ticket</span>
                  </Link>
                </div>
              </div>

              {/* SIDEBAR CARD: Travel Times to Key Destinations */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-800 mb-3 pb-3 border-b border-slate-100">
                  <Navigation className="w-5 h-5 text-[#005ea6]" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Destinos Conectados</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">Tiempos promedio de traslado desde {airport.code} por vías principales:</p>
                
                <div className="space-y-2.5 text-xs">
                  {airport.nearbyDestinations && airport.nearbyDestinations.length > 0 ? (
                    airport.nearbyDestinations.map((dest, i) => {
                      const icon = i === 0 ? <Landmark className="w-4 h-4 text-amber-600" /> :
                                   i === 1 ? <Waves className="w-4 h-4 text-cyan-500" /> :
                                   i === 2 ? <Palmtree className="w-4 h-4 text-emerald-600" /> :
                                             <Building2 className="w-4 h-4 text-indigo-500" />;
                      return (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                          <div className="flex items-center space-x-2">
                            {icon}
                            <span className="font-semibold text-slate-800">{dest.name}</span>
                          </div>
                          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">
                            {dest.distance}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                        <div className="flex items-center space-x-2">
                          <Landmark className="w-4 h-4 text-amber-600" />
                          <span className="font-semibold text-slate-800">Zona Colonial (UNESCO)</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">25 min</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                        <div className="flex items-center space-x-2">
                          <Waves className="w-4 h-4 text-cyan-500" />
                          <span className="font-semibold text-slate-800">Boca Chica &amp; Club Náutico</span>
                        </div>
                        <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">10 min</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                        <div className="flex items-center space-x-2">
                          <Palmtree className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">Juan Dolio &amp; Guavaberry</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">20 min</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-indigo-500" />
                          <span className="font-semibold text-slate-800">Santo Domingo Centro (Piantini)</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">30 min</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SIDEBAR CARD: Dominican Republic Airport Network */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <PlaneTakeoff className="w-5 h-5 text-[#0284c7]" />
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Otros Aeropuertos</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Red Nacional</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  {airports
                    .filter(a => a.id !== airport.id)
                    .slice(0, 4)
                    .map((other) => (
                      <Link 
                        key={other.id} 
                        to={`/aeropuerto/${other.slug}`} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#005ea6] bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {other.code}
                          </span>
                          <span className="font-medium text-slate-700 group-hover:text-slate-900 truncate max-w-[180px]">
                            {other.name}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#005ea6]" />
                      </Link>
                    ))}
                </div>
              </div>

              {/* SIDEBAR CARD: Map & Location */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-800 mb-3 pb-3 border-b border-slate-100">
                  <MapPin className="w-5 h-5 text-[#005ea6]" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Ubicación Geográfica</h3>
                </div>

                <div className="bg-slate-100 rounded-xl p-3 border border-slate-200/80 mb-3">
                  <div className="text-[11px] text-slate-500 font-mono">
                    <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Coordenadas GPS</span>
                    {airport.coordinates.lat.toFixed(4)}° N, {Math.abs(airport.coordinates.lng).toFixed(4)}° W
                  </div>
                  <div className="text-xs text-slate-700 mt-1 font-medium">
                    {isSDQ 
                      ? "Ruta 66, Punta Caucedo, Boca Chica, Santo Domingo" 
                      : `${airport.city}, ${airport.provinceName}, República Dominicana`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a 
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition" 
                    href={`https://maps.google.com/?q=${airport.coordinates.lat},${airport.coordinates.lng}`} 
                    rel="noopener noreferrer" 
                    target="_blank"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#005ea6]" />
                    <span>Google Maps</span>
                  </a>
                  <a 
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition" 
                    href={`https://waze.com/ul?ll=${airport.coordinates.lat},${airport.coordinates.lng}&navigate=yes`} 
                    rel="noopener noreferrer" 
                    target="_blank"
                  >
                    <Navigation2 className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Abrir Waze</span>
                  </a>
                </div>
              </div>

            </aside>
          </div>
        </main>
        {/* END: MainContentGrid */}

        {/* BEGIN: AdvertisingRibbon */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6" data-purpose="ad-banner-placement">
          <Link 
            to="/anunciate"
            className="w-full bg-slate-900 rounded-2xl py-8 px-4 text-center border border-slate-700 text-slate-400 flex flex-col items-center justify-center min-h-[140px] shadow-sm relative overflow-hidden group hover:border-[#005ea6] transition block"
          >
            <div className="absolute inset-0 bg-radial from-[#005ea6]/20 to-transparent opacity-50 group-hover:opacity-75 transition" />
            <span className="text-2xl sm:text-4xl font-black tracking-tight text-white/90">1920 × 250</span>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#00a3e0] font-semibold mt-1">
              Espacio Oficial de Publicidad Disponible
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Comuníquese con el Departamento de Alianzas Turísticas B2B ↗
            </span>
          </Link>
        </section>
        {/* END: AdvertisingRibbon */}

        {/* Global Footer */}
        <Footer />
      </div>
    </PageTransition>
  );
}
