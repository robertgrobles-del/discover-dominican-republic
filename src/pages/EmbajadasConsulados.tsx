import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Phone, MapPin, Globe, Search, Mail, Clock,
  AlertTriangle, ExternalLink, HeartPulse, Shield, Copy, Star
} from "lucide-react";
import { toast } from "sonner";

// ── Data ────────────────────────────────────────────────────────────────────
const embajadas = [
  { pais: "Estados Unidos", bandera: "🇺🇸", tipo: "Embajada", region: "América del Norte", direccion: "Av. República de Colombia #57, Santo Domingo", telefono: "+1 809-567-7775", emergencia: "+1 809-567-7775 ext. 0", email: "SDOAmericans@state.gov", web: "do.usembassy.gov", horario: "Lun-Vie 7:30–16:30", featured: true },
  { pais: "Canadá", bandera: "🇨🇦", tipo: "Embajada", region: "América del Norte", direccion: "Av. Winston Churchill 1099, Torre Citigroup, Piso 18, Santo Domingo", telefono: "+1 809-262-3100", emergencia: "+1 613-996-8885", email: "sdmgo@international.gc.ca", web: "canada.ca/dr", horario: "Lun-Vie 8:00–16:30", featured: true },
  { pais: "España", bandera: "🇪🇸", tipo: "Embajada", region: "Europa", direccion: "Av. Independencia 1205, Santo Domingo", telefono: "+1 809-535-1615", emergencia: "+34 913-794-900", email: "emb.santodomingo@maec.es", web: "exteriores.gob.es", horario: "Lun-Vie 8:00–15:00", featured: true },
  { pais: "Francia", bandera: "🇫🇷", tipo: "Embajada", region: "Europa", direccion: "Calle Las Damas 42, Zona Colonial, Santo Domingo", telefono: "+1 809-695-4300", emergencia: "+1 809-695-4300", email: "contact@ambafrance-do.org", web: "do.ambafrance.org", horario: "Lun-Vie 8:00–14:00", featured: false },
  { pais: "Alemania", bandera: "🇩🇪", tipo: "Embajada", region: "Europa", direccion: "Calle Arzobispo Nouel 12, Zona Colonial, Santo Domingo", telefono: "+1 809-542-8949", emergencia: "+49 30-18170", email: "info@santo-domingo.diplo.de", web: "santo-domingo.diplo.de", horario: "Lun-Vie 8:30–12:00", featured: false },
  { pais: "Italia", bandera: "🇮🇹", tipo: "Embajada", region: "Europa", direccion: "Av. Rodríguez Objío 4, Santo Domingo", telefono: "+1 809-682-0830", emergencia: "+39 06-36225", email: "ambasciata.santodomingo@esteri.it", web: "ambsantodomingo.esteri.it", horario: "Lun-Vie 8:30–13:30", featured: false },
  { pais: "Reino Unido", bandera: "🇬🇧", tipo: "Embajada", region: "Europa", direccion: "Av. 27 de Febrero 233, Torre Empresarial, Piso 8, Santo Domingo", telefono: "+1 809-472-7111", emergencia: "+44 20-7008-5000", email: "ukindr@fcdo.gov.uk", web: "gov.uk/world/dominican-republic", horario: "Lun-Vie 8:30–15:30", featured: false },
  { pais: "Colombia", bandera: "🇨🇴", tipo: "Embajada", region: "América Latina", direccion: "Calle Abraham Lincoln 908, Piantini, Santo Domingo", telefono: "+1 809-562-2122", emergencia: "+57 1-381-4000", email: "esantodomingo@cancilleria.gov.co", web: "cancilleria.gov.co", horario: "Lun-Vie 8:00–16:00", featured: false },
  { pais: "México", bandera: "🇲🇽", tipo: "Embajada", region: "América Latina", direccion: "Av. Anacaona 50, Los Cacicazgos, Santo Domingo", telefono: "+1 809-687-6444", emergencia: "+52 55-3686-5100", email: "embrdominicana@sre.gob.mx", web: "embamex.sre.gob.mx", horario: "Lun-Vie 8:00–14:00", featured: false },
  { pais: "Brasil", bandera: "🇧🇷", tipo: "Embajada", region: "América Latina", direccion: "Calle Eduardo Vicioso 46, Bella Vista, Santo Domingo", telefono: "+1 809-532-0868", emergencia: "+55 61-3411-6000", email: "brasemb.sdomingos@itamaraty.gov.br", web: "santodomingo.itamaraty.gov.br", horario: "Lun-Vie 9:00–13:00", featured: false },
  { pais: "Argentina", bandera: "🇦🇷", tipo: "Embajada", region: "América Latina", direccion: "Av. Máximo Gómez 10, Santo Domingo", telefono: "+1 809-682-2977", emergencia: "+54 11-4819-7000", email: "esdom@mrecic.gov.ar", web: "erepd.cancilleria.gob.ar", horario: "Lun-Vie 8:00–14:00", featured: false },
  { pais: "Chile", bandera: "🇨🇱", tipo: "Embajada", region: "América Latina", direccion: "Av. Anacaona 11, Los Cacicazgos, Santo Domingo", telefono: "+1 809-530-8567", emergencia: "+56 2-2827-4000", email: "echile.rdominicanoa@minrel.gob.cl", web: "chile.gob.cl", horario: "Lun-Vie 8:00–14:00", featured: false },
  { pais: "Venezuela", bandera: "🇻🇪", tipo: "Embajada", region: "América Latina", direccion: "Calle Arzobispo Meriño 10, Zona Colonial, Santo Domingo", telefono: "+1 809-221-7271", emergencia: "+1 809-221-7271", email: "embavenesd@hotmail.com", web: "", horario: "Lun-Vie 8:00–14:00", featured: false },
  { pais: "China", bandera: "🇨🇳", tipo: "Embajada", region: "Asia & Pacífico", direccion: "Av. Anacaona 5, Los Cacicazgos, Santo Domingo", telefono: "+1 809-533-4543", emergencia: "+86 10-12308", email: "", web: "do.china-embassy.gov.cn", horario: "Lun-Vie 9:00–12:00", featured: false },
  { pais: "Haití", bandera: "🇭🇹", tipo: "Embajada", region: "Caribe", direccion: "Calle Juan Sánchez Ramírez 33, Zona Universitaria, Santo Domingo", telefono: "+1 809-686-7115", emergencia: "+1 809-686-7115", email: "", web: "", horario: "Lun-Vie 8:00–14:00", featured: false },
  { pais: "Puerto Rico", bandera: "🇵🇷", tipo: "Consulado EE.UU.", region: "Caribe", direccion: "Aplica Embajada de EE.UU.", telefono: "+1 809-567-7775", emergencia: "+1 809-567-7775", email: "SDOAmericans@state.gov", web: "do.usembassy.gov", horario: "Lun-Vie 7:30–16:30", featured: false },
];

const regions = ["Todas", "América del Norte", "Europa", "América Latina", "Asia & Pacífico", "Caribe"];

const tips = [
  { icon: Shield, title: "Documenta tu viaje", text: "Registra tu estancia en la embajada de tu país. En caso de emergencia facilitará la asistencia consular." },
  { icon: HeartPulse, title: "Seguro de viaje", text: "Contrata un seguro que incluya repatriación médica y asistencia consular 24/7 antes de viajar." },
  { icon: Phone, title: "Guarda los números", text: "Salva el número de emergencia consular antes de llegar a RD. El roaming puede ser costoso en urgencias." },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function EmbajadasConsulados() {
  const [busqueda, setBusqueda] = useState("");
  const [region, setRegion] = useState("Todas");

  const filtradas = useMemo(() =>
    embajadas.filter((e) => {
      const matchBusqueda = e.pais.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.tipo.toLowerCase().includes(busqueda.toLowerCase());
      const matchRegion = region === "Todas" || e.region === region;
      return matchBusqueda && matchRegion;
    }),
    [busqueda, region]
  );

  const featured = embajadas.filter((e) => e.featured);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado`);
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Embajadas y Consulados en República Dominicana | Directorio Consular"
        description="Directorio completo de embajadas y consulados en Santo Domingo. Teléfonos de emergencia 24h, direcciones, horarios y correos de atención consular."
        keywords="embajadas dominicana, consulados Santo Domingo, emergencia consular, embajada EEUU RD"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-background" />
          <div className="relative container mx-auto px-4 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 gap-1.5 py-1.5 px-3">
                <Building2 className="h-3.5 w-3.5" />
                Directorio Consular Oficial
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-black text-foreground tracking-tight mb-4 leading-none">
                Embajadas y<br className="hidden md:block" /> Consulados
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Directorio completo con teléfonos de emergencia, direcciones y horarios.
                Encuentra tu representación diplomática en República Dominicana.
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
                {[
                  { n: `${embajadas.length}`, l: "Representaciones diplomáticas" },
                  { n: "24/7", l: "Líneas de emergencia" },
                  { n: "6", l: "Regiones cubiertas" },
                ].map(({ n, l }) => (
                  <div key={l} className="flex flex-col items-center">
                    <span className="font-display text-2xl font-black text-primary">{n}</span>
                    <span className="text-xs text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── EMERGENCY BANNER ─────────────────────────────────────────── */}
        <section className="border-y border-red-500/20 bg-red-500/8">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">¿Emergencia en República Dominicana?</p>
                <p className="text-xs text-muted-foreground">Llama al 911 para policía, bomberos y ambulancias</p>
              </div>
            </div>
            <div className="h-px sm:h-8 sm:w-px bg-red-500/20" />
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">POLITUR — Policía Turística</p>
                <a href="tel:+18092003500" className="text-xs text-primary font-semibold hover:underline">+1 809-200-3500</a>
              </div>
            </div>
          </div>
        </section>

        <main className="flex-1 py-14">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

            {/* ── FEATURED / MOST VISITED ──────────────────────────────── */}
            <section className="mb-12">
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Embajadas más consultadas
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {featured.map((e, i) => (
                  <motion.div
                    key={e.pais}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="group bg-card border border-border hover:border-primary/30 hover:shadow-lg rounded-2xl p-5 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{e.bandera}</span>
                      <div>
                        <p className="font-bold text-foreground text-sm">{e.pais}</p>
                        <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{e.tipo}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5 mb-2">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                      {e.direccion}
                    </p>
                    <a
                      href={`tel:${e.telefono}`}
                      className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mt-1"
                    >
                      <Phone className="h-3 w-3" /> {e.telefono}
                    </a>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── FILTERS ──────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10 bg-card border-border"
                  placeholder="Buscar por país o tipo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      region === r
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-5">
              Mostrando <strong className="text-foreground">{filtradas.length}</strong> de {embajadas.length} representaciones
            </p>

            {/* ── CARDS GRID ───────────────────────────────────────────── */}
            <AnimatePresence mode="popLayout">
              <div className="grid md:grid-cols-2 gap-4">
                {filtradas.map((e, i) => (
                  <motion.div
                    key={e.pais}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.03 }}
                    className="group bg-card border border-border hover:border-primary/30 hover:shadow-md rounded-2xl overflow-hidden transition-all"
                  >
                    {/* Card header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-secondary/20">
                      <span className="text-2xl shrink-0">{e.bandera}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground truncate">{e.pais}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4">{e.tipo}</Badge>
                          <span className="text-[10px] text-muted-foreground">{e.region}</span>
                        </div>
                      </div>
                      {e.web && (
                        <a
                          href={`https://${e.web}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                          aria-label={`Sitio web ${e.pais}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-5 space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground text-xs leading-relaxed">{e.direccion}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Teléfono */}
                        <div className="bg-secondary/40 rounded-xl p-2.5 flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] text-muted-foreground uppercase font-semibold">Teléfono</p>
                            <a href={`tel:${e.telefono}`} className="text-xs font-semibold text-primary hover:underline truncate block">
                              {e.telefono}
                            </a>
                          </div>
                        </div>

                        {/* Horario */}
                        <div className="bg-secondary/40 rounded-xl p-2.5 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-semibold">Horario</p>
                            <p className="text-xs text-foreground">{e.horario}</p>
                          </div>
                        </div>
                      </div>

                      {/* Emergencia */}
                      {e.emergencia && (
                        <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] text-red-500 uppercase font-bold">Emergencia</span>
                            <a href={`tel:${e.emergencia}`} className="block text-xs font-bold text-red-600 dark:text-red-400 hover:underline truncate">
                              {e.emergencia}
                            </a>
                          </div>
                          <button
                            onClick={() => copyToClipboard(e.emergencia, "Número de emergencia")}
                            className="h-6 w-6 rounded-full bg-red-500/15 flex items-center justify-center text-red-500 hover:bg-red-500/25 transition-colors shrink-0"
                            aria-label="Copiar número de emergencia"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {/* Email */}
                      {e.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                          <a
                            href={`mailto:${e.email}`}
                            className="text-xs text-muted-foreground hover:text-primary truncate transition-colors"
                          >
                            {e.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {filtradas.length === 0 && (
              <div className="text-center py-16 bg-card rounded-2xl border border-border mt-4">
                <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">No se encontró representación diplomática con esos filtros.</p>
                <p className="text-xs text-muted-foreground mt-1">En caso de emergencia, llama al <strong>911</strong>.</p>
              </div>
            )}

            {/* ── TRAVEL TIPS ──────────────────────────────────────────── */}
            <section className="mt-16 pt-12 border-t border-border">
              <h2 className="font-display font-bold text-xl text-foreground mb-6">Consejos para viajeros</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {tips.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all hover:border-primary/25">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
