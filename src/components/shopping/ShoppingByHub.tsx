import { Link } from "react-router-dom";
import { AlertTriangle, MapPin, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePageContent } from "@/lib/pageContent";

/**
 * Dónde comprar en cada polo turístico: qué buscar y en qué zonas, para quien organiza sus compras según el
 * destino que visita. Contenido editorial; los textos se editan desde «Textos e imágenes de páginas».
 */
const polosCompras = [
  {
    polo: "Santo Domingo", destino: "/destino/santo-domingo", sello: "Artesanía, moda y centros comerciales",
    resumen: "La capital reúne la mayor oferta del país: artesanía en la Ciudad Colonial y los grandes centros comerciales en el polígono central.",
    zonas: ["Calle El Conde y sus galerías, en la Ciudad Colonial", "Mercado Modelo, para artesanía y cuadros", "Blue Mall, Ágora Mall, Sambil y Galería 360", "Tiendas de los museos del ámbar y del larimar"],
    buscar: ["Ámbar y larimar", "Pintura dominicana", "Ron y cigarros", "Moda y diseño local"],
  },
  {
    polo: "Punta Cana y Bávaro", destino: "/destino/punta-cana", sello: "Plazas abiertas y compras cerca del hotel",
    resumen: "Las compras se concentran en plazas a pocos minutos de los hoteles, además de los puestos de artesanía junto a la playa.",
    zonas: ["BlueMall Puntacana y Downtown Punta Cana", "San Juan Shopping Center y Palma Real Shopping Village", "Plaza Bibijagua, artesanía frente a la playa de Bávaro", "Tiendas de cigarros con demostración de torcido"],
    buscar: ["Cigarros hechos a mano", "Joyería de larimar", "Café y cacao", "Ropa de playa"],
  },
  {
    polo: "La Romana y Bayahíbe", destino: "/destino/la-romana", sello: "Galerías y talleres de artistas",
    resumen: "Altos de Chavón es el lugar para comprar directamente a artistas y artesanos, con la marina de Casa de Campo a un paso.",
    zonas: ["Galerías y talleres de Altos de Chavón", "Boutiques de la Marina de Casa de Campo", "Multiplaza La Romana", "Puestos de artesanía en Bayahíbe"],
    buscar: ["Cerámica y serigrafía", "Joyería de autor", "Arte contemporáneo", "Recuerdos de la isla Saona"],
  },
  {
    polo: "Puerto Plata", destino: "/destino/puerto-plata", sello: "La costa del ámbar",
    resumen: "La región da nombre a la Costa del Ámbar: aquí se encuentra buena parte del ámbar dominicano y se visita la fábrica de ron.",
    zonas: ["Museo del Ámbar y joyerías del centro histórico", "Plaza de Playa Dorada", "Tienda de la fábrica de ron Brugal", "Fábrica de chocolate Del Oro"],
    buscar: ["Ámbar, incluido el azul", "Ron añejo", "Chocolate y cacao", "Artesanía en madera"],
  },
  {
    polo: "Santiago y el Cibao", destino: "/destino/santiago", sello: "Capital del tabaco",
    resumen: "El valle del Cibao es la cuna del cigarro dominicano y de las muñecas sin rostro, símbolo de la artesanía nacional.",
    zonas: ["Fábricas de cigarros de Tamboril y Villa González", "Calle del Sol y Mercado Modelo de Santiago", "Talleres de cerámica de Higüerito, en Moca", "Centros comerciales Colinas Mall y Ágora Santiago"],
    buscar: ["Cigarros premium", "Muñecas sin rostro", "Cerámica", "Café del Cibao"],
  },
  {
    polo: "Samaná y Las Terrenas", destino: "/destino/samana", sello: "Boutiques de playa",
    resumen: "Compras tranquilas y a pie: pequeñas boutiques, diseño independiente y productos de coco.",
    zonas: ["Pueblo de los Pescadores, en Las Terrenas", "Plazas comerciales del centro de Las Terrenas", "Malecón de Santa Bárbara de Samaná", "Puestos junto al salto El Limón"],
    buscar: ["Aceite y dulces de coco", "Ropa y accesorios de playa", "Artesanía en coco y semillas", "Arte naïf"],
  },
  {
    polo: "Barahona y el suroeste", destino: "/destino/barahona", sello: "El origen del larimar",
    resumen: "La única mina de larimar del mundo está en la sierra de Bahoruco: comprarlo aquí es comprarlo en su origen.",
    zonas: ["Talleres de larimar de Bahoruco y Los Chupaderos", "Escuela-taller de larimar", "Mercado de Barahona", "Cooperativas de café de Polo"],
    buscar: ["Larimar en bruto y tallado", "Café de Polo", "Artesanía en piedra", "Miel y dulces locales"],
  },
  {
    polo: "Jarabacoa y Constanza", destino: "/destino/jarabacoa", sello: "Sabores de montaña",
    resumen: "En la cordillera se compra lo que se cultiva: café de altura, fresas, flores y conservas artesanales.",
    zonas: ["Tostadores y fincas de café de Jarabacoa", "Puestos de fresas y flores de Constanza", "Mercados municipales", "Tiendas de artesanía en madera"],
    buscar: ["Café de altura", "Fresas y mermeladas", "Flores", "Tallas en madera"],
  },
];

const avisosCompra = [
  { titulo: "Pide certificado", texto: "En ámbar y larimar, compra en joyerías establecidas y pide el certificado de autenticidad." },
  { titulo: "Lo que no se debe comprar", texto: "Carey, coral, caracoles protegidos y piezas arqueológicas taínas: su venta y su salida del país están prohibidas." },
  { titulo: "Regatear, sólo en mercados", texto: "En puestos y mercados de artesanía es habitual negociar; en tiendas y centros comerciales los precios son fijos." },
];

export function ShoppingByHub() {
  const pc = usePageContent("shopping-by-hub");
  const polosCompras = pc.data("polosCompras", __pcData.polosCompras);
  const avisosCompra = pc.data("avisosCompra", __pcData.avisosCompra);
  return (
    <section id="donde-comprar" className="scroll-mt-24 border-t border-border py-14">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <Badge variant="secondary" className="mb-3"><ShoppingBag className="mr-1.5 h-3.5 w-3.5" />{" "}{pc.tx("Badge.1", "Turismo de compras")}</Badge>
          <h2 className="font-display text-3xl font-bold text-foreground">{pc.tx("h2.1", "Dónde comprar en cada polo turístico")}</h2>
          <p className="mt-2 text-muted-foreground">{pc.tx("p.1", "Cada región tiene su especialidad. Esto es lo que conviene buscar, y dónde, según el destino que visites.")}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {polosCompras.map((p) => (
            <article key={p.polo} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{p.sello}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-foreground">{p.polo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.resumen}</p>
              <ul className="mt-4 space-y-2 text-sm text-foreground">
                {p.zonas.map((z) => <li key={z} className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{z}</li>)}
              </ul>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`Qué comprar en ${p.polo}`}>
                {p.buscar.map((b) => <li key={b} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">{b}</li>)}
              </ul>
              <Link to={p.destino} className="mt-5 text-sm font-semibold text-primary hover:underline underline-offset-4">{pc.tx("Link.1", "Ver la guía de")}{" "}{p.polo}</Link>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 md:grid-cols-3">
          {avisosCompra.map((a) => (
            <div key={a.titulo} className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
              <div><h3 className="text-sm font-bold text-foreground">{a.titulo}</h3><p className="mt-1 text-sm text-muted-foreground">{a.texto}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { polosCompras, avisosCompra };
