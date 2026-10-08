import React, { useState } from "react";
import { 
  Sparkles, 
  ChefHat, 
  UtensilsCrossed, 
  Wine, 
  Clock, 
  Heart, 
  CheckCircle2, 
  Plus, 
  Minus, 
  ShoppingBag,
  Info,
  DollarSign,
  QrCode,
  Flame,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Entradas" | "Fuertes" | "Postres" | "Coctelería";
  isChefSpecial?: boolean;
  dietary?: ("Sin Gluten" | "Vegano" | "Pesca Fresca" | "Orgánico")[];
  imageUrl: string;
  calories?: string;
  prepTime?: string;
}

interface RestaurantInteractiveMenuPosProps {
  restaurantName: string;
  chefName?: string;
  currency?: string;
  items?: MenuItem[];
  onOrderSubmit?: (orderItems: { item: MenuItem; count: number }[], total: number) => void;
}

const DEFAULT_MENU: MenuItem[] = [
  {
    id: "m1",
    name: "Chillo Fresco al Coco de Samaná",
    description: "Pescado entero dorado al punto crujiente, bañado en salsa cremosa de leche de coco de campo y tostones.",
    price: 850,
    category: "Fuertes",
    isChefSpecial: true,
    dietary: ["Pesca Fresca", "Sin Gluten"],
    imageUrl: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&fit=crop",
    calories: "520 kcal",
    prepTime: "20 min"
  },
  {
    id: "m2",
    name: "Carpaccio de Pulpo de las Costas del Este",
    description: "Láminas finas con aceite de oliva extravirgen, limón agrio criollo, alcaparras baby y pimentón ahumado.",
    price: 620,
    category: "Entradas",
    dietary: ["Sin Gluten", "Pesca Fresca"],
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop",
    calories: "280 kcal",
    prepTime: "12 min"
  },
  {
    id: "m3",
    name: "Mofongo de Chicharrón con Caldo Rústico",
    description: "Plátano verde majado en pilón con ajo rostizado, chicharrones crujientes y caldo de res reducido 12 horas.",
    price: 580,
    category: "Fuertes",
    isChefSpecial: true,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&fit=crop",
    calories: "690 kcal",
    prepTime: "15 min"
  },
  {
    id: "m4",
    name: "Cóctel Larimar Blue & Ron Añejo",
    description: "Ron dominicano ultra premium, infusión botánica de curaçao azul, jugo de piña fresca y romero tostado.",
    price: 420,
    category: "Coctelería",
    isChefSpecial: true,
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&fit=crop",
    prepTime: "5 min"
  },
  {
    id: "m5",
    name: "Domo de Cacao Orgánico y Maracuyá",
    description: "Mousse de chocolate al 70% de San Francisco de Macorís con núcleo de chinola y tierra de avellanas.",
    price: 390,
    category: "Postres",
    dietary: ["Orgánico"],
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&fit=crop",
    calories: "340 kcal",
    prepTime: "8 min"
  }
];

export const RestaurantInteractiveMenuPos: React.FC<RestaurantInteractiveMenuPosProps> = ({
  restaurantName,
  chefName = "Chef Ejecutivo Certificado RNT",
  currency = "RD$",
  items = DEFAULT_MENU,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [orderCart, setOrderCart] = useState<Record<string, number>>({});
  const [activeItemModal, setActiveItemModal] = useState<MenuItem | null>(null);
  const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);

  const categories = ["all", "Entradas", "Fuertes", "Coctelería", "Postres"];

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(it => it.category === selectedCategory);

  const addItemToCart = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOrderCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    toast.success("Plato agregado a tu pre-orden");
  };

  const removeItemFromCart = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOrderCart(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const totalItemsCount = Object.values(orderCart).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(orderCart).reduce((sum, [id, count]) => {
    const item = items.find(it => it.id === id);
    return sum + (item ? item.price * count : 0);
  }, 0);

  return (
    <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm my-8">
      {/* Encabezado con estética POS moderna */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5">
              <ChefHat className="h-3.5 w-3.5 mr-1" /> Carta Interactiva & Recomendaciones
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Menú en Vivo</span>
          </div>
          <h3 className="text-2xl font-display font-extrabold text-foreground">
            Especialidades de la Casa • {restaurantName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curaduría gastronómica por {chefName}. Precios oficiales sin intermediarios.
          </p>
        </div>

        {/* Botón Flotante de Pre-orden para la Mesa */}
        {totalItemsCount > 0 && (
          <Button 
            onClick={() => setIsPreorderModalOpen(true)}
            className="rounded-2xl gap-2 font-bold shadow-lg animate-bounce duration-1000 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 px-4"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Ver Pre-orden ({totalItemsCount})</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono">{currency} {totalAmount.toLocaleString()}</span>
          </Button>
        )}
      </div>

      {/* Selector de Categorías (Píldoras tipo POS moderno) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                : "bg-muted/50 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
            }`}
          >
            {cat === "all" ? "Todos los Platos" : cat}
          </button>
        ))}
      </div>

      {/* Grid de Platos Interactivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(dish => {
          const inCartCount = orderCart[dish.id] || 0;
          return (
            <div
              key={dish.id}
              onClick={() => setActiveItemModal(dish)}
              className="bg-muted/30 hover:bg-muted/60 border border-border/70 hover:border-primary/40 rounded-3xl p-4 transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-2xs"
            >
              <div>
                <div className="aspect-[16/10] rounded-2xl overflow-hidden relative mb-3">
                  <img 
                    src={dish.imageUrl} 
                    alt={dish.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {dish.isChefSpecial && (
                    <Badge className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 font-bold text-[10px] border-none shadow-xs">
                      <Flame className="h-3 w-3 mr-0.5" /> Recomendación del Chef
                    </Badge>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="text-sm font-extrabold font-mono bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl">
                      {currency} {dish.price}
                    </span>
                    {dish.prepTime && (
                      <span className="text-[10px] font-mono flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg">
                        <Clock className="h-3 w-3" /> {dish.prepTime}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
                  {dish.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {dish.description}
                </p>
              </div>

              {/* Botonera de Pre-orden en la tarjeta */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="flex gap-1">
                  {dish.dietary?.map(diet => (
                    <span key={diet} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {diet}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  {inCartCount > 0 ? (
                    <div className="flex items-center gap-1 bg-primary/10 rounded-xl p-0.5 border border-primary/20">
                      <button 
                        onClick={(e) => removeItemFromCart(dish.id, e)}
                        className="h-7 w-7 rounded-lg bg-card hover:bg-muted flex items-center justify-center text-foreground transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold font-mono px-2 text-primary">{inCartCount}</span>
                      <button 
                        onClick={(e) => addItemToCart(dish.id, e)}
                        className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => addItemToCart(dish.id, e)}
                      className="rounded-xl text-xs h-8 px-3 gap-1 hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="h-3 w-3" /> Añadir
                    </Button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal de Detalle Completo del Plato */}
      <Dialog open={!!activeItemModal} onOpenChange={() => setActiveItemModal(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl">
          {activeItemModal && (
            <div>
              <div className="aspect-[16/10] relative">
                <img src={activeItemModal.imageUrl} alt={activeItemModal.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-black/60 backdrop-blur-md text-white text-xs">
                    {activeItemModal.category}
                  </Badge>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-extrabold text-xl text-foreground">
                      {activeItemModal.name}
                    </h3>
                    <span className="text-lg font-bold font-mono text-primary">
                      {currency} {activeItemModal.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeItemModal.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/40 border border-border text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-mono">Calorías Aprox.</span>
                    <span className="font-semibold text-foreground">{activeItemModal.calories || "450 kcal"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-mono">Tiempo de Marcha</span>
                    <span className="font-semibold text-foreground">{activeItemModal.prepTime || "15 min"}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    addItemToCart(activeItemModal.id);
                    setActiveItemModal(null);
                  }}
                  className="w-full rounded-2xl text-xs font-bold h-11 gap-2"
                >
                  <ShoppingBag className="h-4 w-4" /> Agregar a mi selección ({currency} {activeItemModal.price})
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Pre-orden para el camarero o reserva */}
      <Dialog open={isPreorderModalOpen} onOpenChange={setIsPreorderModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Tu Selección de Mesa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Presenta este resumen al llegar al restaurante o envíalo por WhatsApp con tu reserva.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-4 max-h-60 overflow-y-auto pr-1">
            {Object.entries(orderCart).map(([id, count]) => {
              const dish = items.find(it => it.id === id);
              if (!dish) return null;
              return (
                <div key={id} className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/40 border border-border/60 text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-foreground block truncate">{dish.name}</span>
                    <span className="text-[10px] text-muted-foreground">{currency} {dish.price} c/u</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-primary">x{count}</span>
                    <span className="font-mono font-extrabold text-foreground">{currency} {dish.price * count}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex items-center justify-between font-display font-black text-lg">
              <span>Total Estimado:</span>
              <span className="text-primary font-mono">{currency} {totalAmount.toLocaleString()}</span>
            </div>

            <Button 
              onClick={() => {
                const text = encodeURIComponent(`Hola ${restaurantName}, me gustaría ordenar los siguientes platos con mi reserva:\n` + 
                  Object.entries(orderCart).map(([id, count]) => {
                    const dish = items.find(it => it.id === id);
                    return `- ${count}x ${dish?.name} (${currency} ${(dish?.price || 0) * count})`;
                  }).join("\n") + `\nTotal: ${currency} ${totalAmount.toLocaleString()}`
                );
                window.open(`https://wa.me/18095550198?text=${text}`, "_blank");
                setIsPreorderModalOpen(false);
              }}
              className="w-full rounded-2xl text-xs font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Enviar Pre-orden a Restaurante vía WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
export default RestaurantInteractiveMenuPos;
