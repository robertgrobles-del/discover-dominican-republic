import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Clock, Users, ChefHat, Printer, Share2, Bookmark, Play, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const recipe = {
  title: "Sancocho de Siete Carnes",
  tagline: '"El abrazo cálido de la República Dominicana en un plato."',
  badges: ["Plato Insignia", "Cibao"],
  time: "3.5 Horas",
  difficulty: "Media-Alta",
  servings: "8-10 Personas",
  history: `El Sancocho no es solo una sopa, es un ritual sagrado de los domingos. Su origen es un tapiz tejido con influencias españolas (por el cocido) y africanas, evolucionando en las islas del Caribe hasta convertirse en el plato de bandera de la República Dominicana.

Se dice que el "verdadero" sancocho de lujo debe tener siete tipos de carnes diferentes, una muestra de abundancia reservada para grandes celebraciones. Cocinado lentamente en grandes calderos, a menudo sobre leña, el caldo absorbe la esencia de la tierra a través de los tubérculos locales y el plátano, logrando esa textura espesa y reconfortante que une a las familias.`,
  quote: '"En cada cucharada de Sancocho hay siglos de historia, resistencia y la alegría inquebrantable del pueblo dominicano."',
  ingredients: {
    carnes: [
      "1 lb de carne de res (pecho)",
      "1 lb de chivo",
      "1 lb de longaniza dominicana",
      "1 lb de costillas de cerdo",
      "1 pollo entero cortado en piezas"
    ],
    viveres: [
      "2 plátanos verdes",
      "1 lb de yuca",
      "1 lb de yautía blanca",
      "1 lb de auyama (calabaza)",
      "2 mazorcas de maíz"
    ],
    sazon: [
      "Jugo de 2 naranjas agrias",
      "Cilantro y orégano fresco"
    ]
  },
  steps: [
    {
      number: 1,
      title: "Limpieza y Marinado",
      description: "Corta todas las carnes en trozos medianos. Lávalas con abundante agua y frótalas con las naranjas agrias. En un tazón grande, sazona las carnes con orégano, ajo majado, cebolla picada, sal y pimienta. Deja marinar por al menos 30 minutos (idealmente un par de horas) para que los sabores penetren."
    },
    {
      number: 2,
      title: "El Sofrito Inicial",
      description: "En un caldero grande, calienta un poco de aceite. Agrega la carne de res y cerdo primero (que son más duras) y sofríe hasta que doren bien. Agrega un chorrito de agua gradualmente para evitar que se quemen, permitiendo que se cocinen en su propio jugo."
    },
    {
      number: 3,
      title: "Hervor y Víveres",
      description: "Añade el resto de las carnes (pollo, longaniza) y continúa sofriendo. Agrega suficiente agua caliente para cubrir todo generosamente (aprox. 3-4 litros). Cuando hierva, añade el plátano y la yautía. Deja cocer a fuego medio hasta que los víveres comiencen a ablandarse."
    },
    {
      number: 4,
      title: "El Toque de Espesor",
      description: "Agrega la yuca, la auyama y el maíz. La auyama es crucial, ya que al desbaratarse dará el color amarillo y el espesor característico al caldo. Rectifica la sal y deja hervir hasta que todo esté tierno y el caldo tenga cuerpo. Termina agregando el cilantro fresco picado justo antes de apagar el fuego."
    }
  ],
  relatedRecipes: [
    { title: "Mangú de Los Tres Golpes", category: "Desayuno", time: "30 min", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=150&fit=crop" },
    { title: "Pescado Frito Boca Chica", category: "Almuerzo", time: "45 min", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=200&h=150&fit=crop" },
    { title: "Habichuelas con Dulce", category: "Postre", time: "1.5 horas", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=150&fit=crop" },
    { title: "Morir Soñando", category: "Bebida", time: "10 min", image: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=200&h=150&fit=crop" }
  ]
};

export default function RecetaDetalle() {
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f6f6]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1920&h=800&fit=crop"
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f6f6] via-black/30 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex gap-2 mb-4">
              {recipe.badges.map((badge) => (
                <span key={badge} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  {badge}
                </span>
              ))}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
              {recipe.title}
            </h1>
            <p className="text-lg text-white/80 italic">
              {recipe.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Recipe Meta Bar */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Tiempo Total</p>
                  <p className="font-bold text-gray-900">{recipe.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Dificultad</p>
                  <p className="font-bold text-gray-900">{recipe.difficulty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Porciones</p>
                  <p className="font-bold text-gray-900">{recipe.servings}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Printer className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Ingredients Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Ingredientes</h2>
              
              {/* Carnes */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Las Carnes</h3>
                <div className="space-y-3">
                  {recipe.ingredients.carnes.map((ing) => (
                    <div key={ing} className="flex items-start gap-3">
                      <Checkbox 
                        checked={checkedIngredients.includes(ing)}
                        onCheckedChange={() => toggleIngredient(ing)}
                      />
                      <span className={`text-sm ${checkedIngredients.includes(ing) ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {ing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Víveres */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Los Víveres</h3>
                <div className="space-y-3">
                  {recipe.ingredients.viveres.map((ing) => (
                    <div key={ing} className="flex items-start gap-3">
                      <Checkbox 
                        checked={checkedIngredients.includes(ing)}
                        onCheckedChange={() => toggleIngredient(ing)}
                      />
                      <span className={`text-sm ${checkedIngredients.includes(ing) ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {ing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sazón */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Sazón y Toques Finales</h3>
                <div className="space-y-3">
                  {recipe.ingredients.sazon.map((ing) => (
                    <div key={ing} className="flex items-start gap-3">
                      <Checkbox 
                        checked={checkedIngredients.includes(ing)}
                        onCheckedChange={() => toggleIngredient(ing)}
                      />
                      <span className={`text-sm ${checkedIngredients.includes(ing) ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {ing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* History Section */}
            <section>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-6">Historia del Origen</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  <span className="text-6xl font-display text-red-600 float-left mr-4 leading-none">E</span>
                  {recipe.history}
                </p>
              </div>
              
              <blockquote className="mt-8 p-6 bg-red-50 border-l-4 border-red-600 rounded-r-xl">
                <p className="text-lg text-red-800 italic">
                  {recipe.quote}
                </p>
              </blockquote>

              {/* Video Section */}
              <div className="mt-8 relative rounded-xl overflow-hidden aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=450&fit=crop"
                  alt="Video de preparación"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button size="lg" className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700">
                    <Play className="h-8 w-8 fill-white" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-bold">Ver preparación paso a paso</p>
                  <p className="text-sm text-white/80">Duración: 12:45</p>
                </div>
              </div>
            </section>

            {/* Preparation Steps */}
            <section>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">Preparación</h2>
              <div className="space-y-8">
                {recipe.steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Related Recipes */}
            <section className="pt-8 border-t border-gray-200">
              <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-8">
                Explora otros sabores de la isla
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recipe.relatedRecipes.map((related, index) => (
                  <motion.div
                    key={related.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2">
                      <img 
                        src={related.image} 
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors text-sm">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-500">{related.category} • {related.time}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}