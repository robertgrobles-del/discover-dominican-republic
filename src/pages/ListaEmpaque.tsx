import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Luggage, Sun, Umbrella, Camera, Shirt, Plus, 
  Download, Share2, Trash2, Sparkles, Plane
} from "lucide-react";

const categoriasDefault = [
  {
    id: "documentos",
    nombre: "Documentos",
    icon: "📄",
    items: [
      { id: "pasaporte", nombre: "Pasaporte (válido 6+ meses)", esencial: true },
      { id: "eticket", nombre: "E-Ticket o visa de turista", esencial: true },
      { id: "reservas", nombre: "Confirmaciones de reservas", esencial: true },
      { id: "seguro", nombre: "Seguro de viaje", esencial: true },
      { id: "licencia", nombre: "Licencia de conducir", esencial: false },
      { id: "tarjetas", nombre: "Tarjetas de crédito/débito", esencial: true },
    ]
  },
  {
    id: "ropa",
    nombre: "Ropa",
    icon: "👕",
    items: [
      { id: "trajes-bano", nombre: "Trajes de baño", esencial: true },
      { id: "ropa-ligera", nombre: "Ropa ligera de algodón", esencial: true },
      { id: "sandalias", nombre: "Sandalias/Chancletas", esencial: true },
      { id: "zapatos-comodos", nombre: "Zapatos cómodos para caminar", esencial: true },
      { id: "sombrero", nombre: "Sombrero o gorra", esencial: true },
      { id: "ropa-formal", nombre: "Ropa para cenas elegantes", esencial: false },
      { id: "chubasquero", nombre: "Chubasquero/impermeable", esencial: false },
    ]
  },
  {
    id: "salud",
    nombre: "Salud y Cuidado",
    icon: "💊",
    items: [
      { id: "protector-solar", nombre: "Protector solar SPF 50+", esencial: true },
      { id: "repelente", nombre: "Repelente de insectos", esencial: true },
      { id: "medicamentos", nombre: "Medicamentos personales", esencial: true },
      { id: "botiquin", nombre: "Botiquín básico", esencial: false },
      { id: "gafas-sol", nombre: "Gafas de sol", esencial: true },
      { id: "aloe", nombre: "Gel de aloe vera", esencial: false },
    ]
  },
  {
    id: "tecnologia",
    nombre: "Tecnología",
    icon: "📱",
    items: [
      { id: "telefono", nombre: "Teléfono móvil", esencial: true },
      { id: "cargador", nombre: "Cargadores", esencial: true },
      { id: "camara", nombre: "Cámara fotográfica", esencial: false },
      { id: "powerbank", nombre: "Power bank", esencial: true },
      { id: "auriculares", nombre: "Auriculares", esencial: false },
      { id: "adaptador", nombre: "Adaptador de enchufe (si aplica)", esencial: false },
    ]
  },
  {
    id: "playa",
    nombre: "Playa y Actividades",
    icon: "🏖️",
    items: [
      { id: "toalla-playa", nombre: "Toalla de playa", esencial: true },
      { id: "snorkel", nombre: "Kit de snorkel", esencial: false },
      { id: "bolsa-impermeable", nombre: "Bolsa impermeable", esencial: true },
      { id: "flotador", nombre: "Flotador/inflable", esencial: false },
      { id: "libro", nombre: "Libro o e-reader", esencial: false },
    ]
  },
];

export default function ListaEmpaque() {
  const [categorias, setCategorias] = useState(categoriasDefault);
  const [itemsChecked, setItemsChecked] = useState<Set<string>>(new Set());
  const [nuevoItem, setNuevoItem] = useState({ categoria: "", nombre: "" });

  const toggleItem = (itemId: string) => {
    setItemsChecked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const totalItems = categorias.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = itemsChecked.size;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const addItem = (categoriaId: string, nombre: string) => {
    if (!nombre.trim()) return;
    setCategorias(prev => prev.map(cat => {
      if (cat.id === categoriaId) {
        return {
          ...cat,
          items: [...cat.items, { id: `custom-${Date.now()}`, nombre, esencial: false }]
        };
      }
      return cat;
    }));
    setNuevoItem({ categoria: "", nombre: "" });
  };

  const removeItem = (categoriaId: string, itemId: string) => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === categoriaId) {
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        };
      }
      return cat;
    }));
    setItemsChecked(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Lista de Empaque para República Dominicana"
        description="Lista completa de qué empacar para tu viaje a RD. Personalizable e interactiva con todo lo esencial."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
            <div className="container mx-auto px-4 text-center">
              <Luggage className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Lista de Empaque</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Todo lo que necesitas para tu viaje al Caribe
              </p>
            </div>
          </section>

          {/* Progress Section */}
          <section className="py-8 border-b sticky top-16 bg-background/95 backdrop-blur z-10">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Tu progreso</h2>
                  <p className="text-sm text-muted-foreground">
                    {checkedItems} de {totalItems} items empacados
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="h-3" />
              {progress === 100 && (
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg text-center">
                  <Sparkles className="h-5 w-5 inline mr-2 text-green-500" />
                  <span className="text-green-600 font-medium">¡Listo para viajar! ✈️</span>
                </div>
              )}
            </div>
          </section>

          {/* Tips */}
          <section className="py-8 bg-primary/5">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="text-center p-4">
                  <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-medium">Clima Tropical</p>
                  <p className="text-xs text-muted-foreground">25-32°C todo el año</p>
                </Card>
                <Card className="text-center p-4">
                  <Umbrella className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">Temporada Lluviosa</p>
                  <p className="text-xs text-muted-foreground">Mayo - Noviembre</p>
                </Card>
                <Card className="text-center p-4">
                  <Shirt className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Vestimenta</p>
                  <p className="text-xs text-muted-foreground">Casual y ligera</p>
                </Card>
                <Card className="text-center p-4">
                  <Plane className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Equipaje</p>
                  <p className="text-xs text-muted-foreground">23kg facturado típico</p>
                </Card>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="space-y-8">
                {categorias.map((categoria) => (
                  <Card key={categoria.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{categoria.icon}</span>
                        {categoria.nombre}
                        <Badge variant="secondary" className="ml-auto">
                          {categoria.items.filter(i => itemsChecked.has(i.id)).length}/{categoria.items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {categoria.items.map((item) => (
                        <div 
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            itemsChecked.has(item.id) 
                              ? 'bg-green-500/10' 
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={itemsChecked.has(item.id)}
                              onCheckedChange={() => toggleItem(item.id)}
                            />
                            <span className={itemsChecked.has(item.id) ? 'line-through text-muted-foreground' : ''}>
                              {item.nombre}
                            </span>
                            {item.esencial && (
                              <Badge variant="destructive" className="text-xs">Esencial</Badge>
                            )}
                          </div>
                          {!item.esencial && item.id.startsWith('custom') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => removeItem(categoria.id, item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {/* Add new item */}
                      <div className="flex gap-2 pt-2">
                        <Input 
                          placeholder="Añadir item..."
                          value={nuevoItem.categoria === categoria.id ? nuevoItem.nombre : ""}
                          onChange={(e) => setNuevoItem({ categoria: categoria.id, nombre: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addItem(categoria.id, nuevoItem.nombre);
                            }
                          }}
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => addItem(categoria.id, nuevoItem.nombre)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setItemsChecked(new Set())}
                >
                  Reiniciar lista
                </Button>
                <Button 
                  onClick={() => {
                    const allItems = categorias.flatMap(c => c.items.map(i => i.id));
                    setItemsChecked(new Set(allItems));
                  }}
                >
                  Marcar todo
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
