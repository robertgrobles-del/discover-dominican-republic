import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Calendar,
  ChevronRight,
  Award,
  Users,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

const golfCourses = [
  {
    id: "teeth-of-the-dog",
    nombre: "Teeth of the Dog",
    ubicacion: "Casa de Campo, La Romana",
    diseñador: "Pete Dye (1971)",
    hoyos: 18,
    par: 72,
    yardas: "7,471",
    rating: 5.0,
    imagen: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop",
    descripcion: "El campo #1 del Caribe y Latinoamérica. 7 hoyos bordean el mar con vistas espectaculares.",
    precio: "Desde $395 USD",
    destacado: true,
    amenidades: ["Pro Shop", "Caddie obligatorio", "Restaurante", "Driving Range"],
  },
  {
    id: "punta-espada",
    nombre: "Punta Espada",
    ubicacion: "Cap Cana, Punta Cana",
    diseñador: "Jack Nicklaus (2006)",
    hoyos: 18,
    par: 72,
    yardas: "7,396",
    rating: 4.9,
    imagen: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop",
    descripcion: "8 hoyos frente al océano. Sede del PGA Champions Tour y considerado una obra maestra.",
    precio: "Desde $375 USD",
    destacado: true,
    amenidades: ["Clubhouse de lujo", "Spa", "Restaurantes gourmet", "Academia"],
  },
  {
    id: "corales",
    nombre: "Corales Golf Course",
    ubicacion: "Puntacana Resort",
    diseñador: "Tom Fazio (2010)",
    hoyos: 18,
    par: 72,
    yardas: "7,650",
    rating: 4.8,
    imagen: "https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop",
    descripcion: "Sede del PGA Tour Corales Championship. 6 hoyos costeros impresionantes.",
    precio: "Desde $295 USD",
    destacado: false,
    amenidades: ["Pro Shop", "Restaurante", "Práctica de putting"],
  },
  {
    id: "la-cana",
    nombre: "La Cana Golf Course",
    ubicacion: "Puntacana Resort",
    diseñador: "P.B. Dye (2000)",
    hoyos: 27,
    par: 72,
    yardas: "7,152",
    rating: 4.7,
    imagen: "https://images.unsplash.com/photo-1600684802635-47e88c6d8a11?w=600&h=400&fit=crop",
    descripcion: "27 hoyos con vistas al Atlántico. Tres recorridos de 9 hoyos con personalidad única.",
    precio: "Desde $225 USD",
    destacado: false,
    amenidades: ["3 recorridos", "Academia Six Senses", "Tienda"],
  },
  {
    id: "playa-dorada",
    nombre: "Playa Dorada Golf Course",
    ubicacion: "Puerto Plata",
    diseñador: "Robert Trent Jones Sr. (1976)",
    hoyos: 18,
    par: 72,
    yardas: "6,880",
    rating: 4.5,
    imagen: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&h=400&fit=crop",
    descripcion: "El campo clásico del norte. Diseño tradicional rodeado de montañas y palmeras.",
    precio: "Desde $95 USD",
    destacado: false,
    amenidades: ["Asequible", "Pro Shop", "Restaurante"],
  },
];

const golfPackages = [
  {
    nombre: "Golf & Stay Casa de Campo",
    noches: 4,
    rondas: 3,
    precio: "$1,850",
    incluye: ["Teeth of the Dog x2", "Dye Fore x1", "Villa de lujo", "Traslados"],
  },
  {
    nombre: "Ultimate Punta Cana Golf",
    noches: 5,
    rondas: 4,
    precio: "$2,200",
    incluye: ["Punta Espada", "Corales", "La Cana x2", "Resort 5*", "All-Inclusive"],
  },
  {
    nombre: "Caribbean Golf Tour",
    noches: 7,
    rondas: 5,
    precio: "$3,500",
    incluye: ["3 destinos", "Los 5 mejores campos", "Transporte privado", "Caddie incluido"],
  },
];

export function GolfSection() {
  return (
    <>
      {/* Golf Hero */}
      <section className="py-20 bg-gradient-to-br from-emerald-900/90 to-green-800/80">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Award className="w-4 h-4 mr-2" />
              #1 Destino de Golf del Caribe
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Golf de Clase Mundial
            </h2>
            <p className="text-xl text-white/80 mb-8">
              12 campos diseñados por leyendas como Pete Dye, Jack Nicklaus y Tom Fazio. 
              Juega donde los profesionales compiten.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 bg-white text-emerald-900 hover:bg-white/90">
                <Calendar className="h-4 w-4" />
                Reservar Tee Time
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                Ver Paquetes
              </Button>
              <Link to="/golf-rd">
                <Button size="lg" variant="ghost" className="gap-2 text-white hover:bg-white/10">
                  Guía Completa de Golf en RD <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Campos <span className="text-gradient">Legendarios</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada campo es una obra maestra de diseño con hoyos frente al mar Caribe.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {golfCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group bg-card rounded-2xl overflow-hidden border border-border hover:border-emerald-500/50 transition-all ${
                  course.destacado ? "lg:col-span-1 ring-2 ring-emerald-500/30" : ""
                }`}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={course.imagen}
                    alt={course.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {course.destacado && (
                    <Badge className="absolute top-4 left-4 bg-emerald-500 text-white">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      Top Rated
                    </Badge>
                  )}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-sm font-medium">{course.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="font-display text-xl font-bold">{course.nombre}</h4>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {course.ubicacion}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4">{course.descripcion}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Hoyos</p>
                      <p className="font-bold text-foreground">{course.hoyos}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Par</p>
                      <p className="font-bold text-foreground">{course.par}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Yardas</p>
                      <p className="font-bold text-foreground">{course.yardas}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.amenidades.slice(0, 3).map((amenidad) => (
                      <Badge key={amenidad} variant="secondary" className="text-xs">
                        {amenidad}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Green Fee</p>
                      <p className="font-bold text-emerald-600">{course.precio}</p>
                    </div>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                      Reservar <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Golf Packages */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="font-display text-3xl font-bold mb-4">
              Paquetes de <span className="text-gradient">Golf</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Todo incluido: hospedaje, green fees, transporte y más.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {golfPackages.map((pkg, index) => (
              <motion.div
                key={pkg.nombre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-2xl border border-border p-6"
              >
                <h4 className="font-display text-xl font-bold text-foreground mb-2">
                  {pkg.nombre}
                </h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{pkg.noches} noches</span>
                  <span>•</span>
                  <span>{pkg.rondas} rondas</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {pkg.incluye.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Desde</p>
                    <p className="text-2xl font-bold text-emerald-600">{pkg.precio}</p>
                  </div>
                  <Button variant="outline">Cotizar</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tee Time Reservation CTA */}
      <section className="py-16 bg-emerald-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">
                ¿Listo para tu próxima ronda?
              </h3>
              <p className="text-white/80">
                Reserva tu tee time en los mejores campos del Caribe.
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="gap-2 bg-white text-emerald-900 hover:bg-white/90">
                <Calendar className="h-4 w-4" />
                Reservar Ahora
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                <Phone className="h-4 w-4" />
                Contactar
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
