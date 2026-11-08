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
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <aside>
            <h1 className="font-display text-4xl font-bold tracking-tight [text-wrap:balance] md:text-5xl">Registra tu negocio</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Hoteles, restaurantes, bares, tours, transporte, comercios y servicios turísticos de todo el país.</p>
            <dl className="mt-8 space-y-5 border-l-2 border-primary pl-5">
              {VENTAJAS.map((v) => (
                <div key={v.titulo}>
                  <dt className="font-semibold">{v.titulo}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.texto}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm text-muted-foreground">¿Quiere además anunciarse? Vea los <Link to="/anunciate" className="font-medium text-primary hover:underline">paquetes de publicidad</Link>.</p>
          </aside>
          <section aria-label="Formulario de registro" className="rounded-md border border-border p-5 sm:p-8">
            <RegistroEstablecimientoModal key={tipo} asPage open tipo={tipo} onClose={() => navigate("/")} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
