// /registra-tu-negocio: el formulario de registro de negocios como página propia (antes solo era una ventana).
// ?tipo=hotel|restaurante|bar|… abre el formulario con ese tipo elegido (enlaces de las campañas de correo).
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { RegistroEstablecimientoModal, type TipoEstablecimiento } from "@/components/forms/RegistroEstablecimientoModal";
import { TIPOS_SELECCIONABLES } from "@/components/forms/registro/RegistroFormHelpers";

const VENTAJAS = [
  { titulo: "Gratis y sin comisiones", texto: "La ficha no tiene costo y los clientes le contactan directamente." },
  { titulo: "Su ficha con fotos", texto: "Fotos, descripción, horario, ubicación y, si tiene restaurante o bar, su menú en PDF." },
  { titulo: "Ante quienes viajan", texto: "Viajeros extranjeros, dominicanos en el exterior y turismo local que planifican su viaje en el portal." },
  { titulo: "Revisión en 2-3 días", texto: "Revisamos cada solicitud y le escribimos con el resultado." },
];

export default function RegistroNegocio() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const pedido = params.get("tipo") as TipoEstablecimiento | null;
  const tipo: TipoEstablecimiento = pedido && TIPOS_SELECCIONABLES.includes(pedido) ? pedido : "general";

  return (
    <>
      <SEOHead
        title="Registra tu Negocio Turístico Gratis | Descubre RD"
        description="Registra gratis tu hotel, restaurante, bar, operador de tours o comercio turístico en el directorio oficial de Descubre República Dominicana."
        url="/registra-tu-negocio"
        keywords="registrar negocio turistico republica dominicana, directorio turismo rd, agregar hotel republica dominicana, promocionar restaurante rd"
        geo={{ placename: "República Dominicana", region: "DO" }}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Registra tu negocio", url: "/registra-tu-negocio" },
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 pb-20 pt-24 lg:px-8 lg:pt-28">
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link> <span aria-hidden="true">/</span> <span aria-current="page">Registra tu negocio</span>
        </nav>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
          <aside>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Directorio de Proveedores Turísticos
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight [text-wrap:balance] md:text-5xl text-foreground">Registra tu negocio</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Hoteles, restaurantes, bares, tours, transporte, comercios y servicios turísticos de todo el país.</p>
            
            <div className="mt-8 space-y-4">
              {VENTAJAS.map((v) => (
                <div key={v.titulo} className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-sm">
                  <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">✓</span>
                    {v.titulo}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground pl-7">{v.texto}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
              ¿Quieres destacar tu negocio con máxima exposición? Consulta nuestros{" "}
              <Link to="/anunciate" className="font-semibold text-primary hover:underline">
                paquetes de publicidad y patrocinios ↗
              </Link>.
            </div>
          </aside>
          
          {/* Double-Bezel Architecture */}
          <div className="rounded-[2rem] border border-border/60 bg-muted/20 p-2 sm:p-2.5 shadow-xl shadow-black/5 ring-1 ring-black/5 dark:ring-white/5">
            <section aria-label="Formulario de registro" className="rounded-[calc(2rem-0.5rem)] border border-border/50 bg-card p-5 sm:p-8 shadow-sm">
              <RegistroEstablecimientoModal key={tipo} asPage open tipo={tipo} onClose={() => navigate("/")} />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
