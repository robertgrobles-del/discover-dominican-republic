import React, { useState } from 'react';
import { 
  FileText, 
  Utensils, 
  ExternalLink, 
  Download, 
  ChevronRight, 
  Sparkles, 
  Filter,
  Eye,
  CheckCircle2,
  Share2,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface MenuItem {
  id: string;
  name: string;
  category: 'entradas' | 'platos_fuertes' | 'postres' | 'bebidas' | 'especiales';
  description: string;
  priceDOP: number;
  priceUSD?: number;
  dietary?: ('vegano' | 'vegetariano' | 'sin_gluten' | 'mariscos' | 'picante' | 'tipico_rd')[];
  isSignature?: boolean;
  image?: string;
}

export interface RestaurantMenuData {
  restaurantId: string;
  restaurantName: string;
  cuisine: string;
  location: string;
  menuMode: 'pdf' | 'items' | 'both';
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfLastUpdated?: string;
  currencyDefault?: 'DOP' | 'USD';
  items?: MenuItem[];
  advertisingBadges?: string[];
  activeSponsorship?: {
    type: 'regalo_usuario' | 'degustacion_influencer' | 'rifa_seguidores';
    title: string;
    description: string;
    expiresAt?: string;
  };
}

interface RestaurantMenuViewerProps {
  menuData: RestaurantMenuData;
  isOpen: boolean;
  onClose: () => void;
}

export const RestaurantMenuViewer: React.FC<RestaurantMenuViewerProps> = ({
  menuData,
  isOpen,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [selectedCurrency, setSelectedCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [viewMode, setViewMode] = useState<'items' | 'pdf'>(
    menuData.menuMode === 'pdf' ? 'pdf' : 'items'
  );
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: 'todos', label: 'Todo el Menú' },
    { id: 'entradas', label: 'Entradas' },
    { id: 'platos_fuertes', label: 'Platos Fuertes' },
    { id: 'postres', label: 'Postres' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'especiales', label: 'Especiales del Chef' }
  ];

  const filteredItems = (menuData.items || []).filter(item => {
    if (activeCategory === 'todos') return true;
    return item.category === activeCategory;
  });

  const getDietaryBadgeColor = (tag: string) => {
    switch (tag) {
      case 'tipico_rd': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300';
      case 'vegano': return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'vegetariano': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/50 dark:text-green-300';
      case 'sin_gluten': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300';
      case 'picante': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getDietaryLabel = (tag: string) => {
    switch (tag) {
      case 'tipico_rd': return '🇩🇴 Auténtico Dominicano';
      case 'vegano': return '🌱 Vegano';
      case 'vegetariano': return '🥬 Vegetariano';
      case 'sin_gluten': return '🌾 Sin Gluten';
      case 'mariscos': return '🦐 Mariscos';
      case 'picante': return '🌶️ Picante';
      default: return tag;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-card flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                {menuData.cuisine}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                📍 {menuData.location}
              </Badge>
              {menuData.menuMode === 'both' && (
                <Badge className="bg-emerald-600 text-white text-xs">
                  ⚡ Menú Dual: PDF + Digital
                </Badge>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {menuData.restaurantName}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Carta gastronómica oficial verificada con ingredientes locales y especialidades caribeñas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors z-10"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Active Sponsorship Banner if available */}
        {menuData.activeSponsorship && (
          <div className="bg-gradient-to-r from-amber-500/15 via-primary/15 to-amber-500/15 border-b border-amber-500/20 px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse flex-shrink-0" />
              <span>
                <strong className="font-semibold">{menuData.activeSponsorship.title}:</strong> {menuData.activeSponsorship.description}
              </span>
            </div>
            <Badge variant="outline" className="bg-amber-500/20 border-amber-400 text-amber-800 dark:text-amber-300 text-[11px] whitespace-nowrap">
              {menuData.activeSponsorship.type === 'regalo_usuario' && '🎁 Bono Viajero'}
              {menuData.activeSponsorship.type === 'degustacion_influencer' && '📸 Prensa / Creadores'}
              {menuData.activeSponsorship.type === 'rifa_seguidores' && '🎟️ Sorteo Activo'}
            </Badge>
          </div>
        )}

        {/* View Mode Controls & Currency */}
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {menuData.menuMode === 'both' && (
              <div className="bg-background border border-border p-1 rounded-lg flex items-center shadow-sm">
                <Button
                  size="sm"
                  variant={viewMode === 'items' ? 'default' : 'ghost'}
                  className="text-xs h-7 px-3"
                  onClick={() => setViewMode('items')}
                >
                  <Utensils className="w-3.5 h-3.5 mr-1.5" />
                  Platos Detallados ({menuData.items?.length || 0})
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'pdf' ? 'default' : 'ghost'}
                  className="text-xs h-7 px-3"
                  onClick={() => setViewMode('pdf')}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Menú PDF Original
                </Button>
              </div>
            )}

            {menuData.menuMode === 'pdf' && (
              <Badge variant="outline" className="gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-red-500" />
                Carta Oficial en Formato PDF
              </Badge>
            )}
            
            {menuData.menuMode === 'items' && (
              <Badge variant="outline" className="gap-1.5 text-xs">
                <Utensils className="w-3.5 h-3.5 text-primary" />
                Carta Digital Interactiva
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Moneda:</span>
            <div className="inline-flex rounded-md border border-border p-0.5 bg-background text-xs">
              <button
                onClick={() => setSelectedCurrency('DOP')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  selectedCurrency === 'DOP'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                DOP (RD$)
              </button>
              <button
                onClick={() => setSelectedCurrency('USD')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  selectedCurrency === 'USD'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {viewMode === 'pdf' ? (
            /* PDF Menu Viewer */
            <div className="space-y-4">
              <Card className="border border-border/80 bg-card/60 overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {menuData.pdfFileName || `Menu_${menuData.restaurantName.replace(/\s+/g, '_')}.pdf`}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Documento PDF verificado • {menuData.pdfFileSize || '2.4 MB'} • Actualizado {menuData.pdfLastUpdated || 'este mes'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button 
                      asChild 
                      className="bg-primary hover:bg-primary/90 gap-2 shadow-md"
                    >
                      <a 
                        href={menuData.pdfUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Eye className="w-4 h-4" />
                        Ver PDF Completo
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      asChild
                      className="gap-2"
                    >
                      <a 
                        href={menuData.pdfUrl || '#'} 
                        download={menuData.pdfFileName || 'menu.pdf'}
                      >
                        <Download className="w-4 h-4" />
                        Descargar Carta PDF
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Embedded PDF iframe preview simulation */}
              <div className="border border-border rounded-xl bg-muted/40 p-4 min-h-[350px] flex flex-col items-center justify-center text-muted-foreground text-sm">
                <p className="mb-2">📄 Vista previa de la carta física oficial del establecimiento</p>
                <div className="w-full max-w-md h-64 border border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-2 bg-background/50">
                  <FileText className="w-10 h-10 text-muted-foreground/60" />
                  <p className="font-medium text-foreground text-sm">Diseño de Menú de Mesa Verificado</p>
                  <p className="text-xs text-muted-foreground">
                    Incluye cartas de vinos, cócteles artesanales y sugerencias del chef del día.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Item by Item Menu Viewer */
            <div className="space-y-6">
              {/* Category selector pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Items grid */}
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Utensils className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No hay platos listados en esta categoría.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map(item => {
                    const price = selectedCurrency === 'DOP' 
                      ? `RD$ ${item.priceDOP.toLocaleString('es-DO')}`
                      : `$ ${item.priceUSD ? item.priceUSD.toFixed(2) : (item.priceDOP / 60).toFixed(2)} USD`;

                    return (
                      <Card 
                        key={item.id} 
                        className={`group border border-border/80 hover:border-primary/40 transition-all hover:shadow-md bg-card/60 relative overflow-hidden ${
                          item.isSignature ? 'ring-1 ring-amber-500/30' : ''
                        }`}
                      >
                        {item.isSignature && (
                          <div className="bg-amber-500 text-amber-950 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 absolute top-0 right-0 rounded-bl-lg shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Especialidad de la Casa
                          </div>
                        )}

                        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                          <div className="space-y-1.5 pr-6">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                                {item.name}
                              </h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-2 border-t border-border/50">
                            {/* Dietary tags */}
                            {item.dietary && item.dietary.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.dietary.map(diet => (
                                  <Badge 
                                    key={diet} 
                                    variant="outline" 
                                    className={`text-[10px] px-1.5 py-0 h-4 border ${getDietaryBadgeColor(diet)}`}
                                  >
                                    {getDietaryLabel(diet)}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-primary">
                                {price}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleLike(item.id)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    likedItems[item.id]
                                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800'
                                      : 'border-border/60 text-muted-foreground hover:text-foreground'
                                  }`}
                                  title="Guardar en favoritos"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${likedItems[item.id] ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-card flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Precios e impuestos aplican según la legislación dominicana (18% ITBIS + 10% Propina Legal).</span>
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="h-8">
            Cerrar Carta
          </Button>
        </div>

      </div>
    </div>
  );
};
