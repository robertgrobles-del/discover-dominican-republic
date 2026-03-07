import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Building2, Phone, MapPin, Globe, Search, Mail, Clock, AlertTriangle } from "lucide-react";

const embajadas = [
  { pais: "Estados Unidos", bandera: "🇺🇸", tipo: "Embajada", direccion: "Av. República de Colombia #57, Santo Domingo", telefono: "+1 809-567-7775", emergencia: "+1 809-567-7775 ext. 0", email: "SDOAmericans@state.gov", web: "do.usembassy.gov", horario: "Lun-Vie 7:30-16:30" },
  { pais: "Canadá", bandera: "🇨🇦", tipo: "Embajada", direccion: "Av. Winston Churchill 1099, Torre Citigroup, Piso 18, Santo Domingo", telefono: "+1 809-262-3100", emergencia: "+1 613-996-8885", email: "sdmgo@international.gc.ca", web: "canada.ca/dr", horario: "Lun-Vie 8:00-16:30" },
  { pais: "España", bandera: "🇪🇸", tipo: "Embajada", direccion: "Av. Independencia 1205, Santo Domingo", telefono: "+1 809-535-1615", emergencia: "+34 913-794-900", email: "emb.santodomingo@maec.es", web: "exteriores.gob.es", horario: "Lun-Vie 8:00-15:00" },
  { pais: "Francia", bandera: "🇫🇷", tipo: "Embajada", direccion: "Calle Las Damas 42, Zona Colonial, Santo Domingo", telefono: "+1 809-695-4300", emergencia: "+1 809-695-4300", email: "contact@ambafrance-do.org", web: "do.ambafrance.org", horario: "Lun-Vie 8:00-14:00" },
  { pais: "Alemania", bandera: "🇩🇪", tipo: "Embajada", direccion: "Calle Arzobispo Nouel 12, Zona Colonial, Santo Domingo", telefono: "+1 809-542-8949", emergencia: "+49 30-18170", email: "info@santo-domingo.diplo.de", web: "santo-domingo.diplo.de", horario: "Lun-Vie 8:30-12:00" },
  { pais: "Italia", bandera: "🇮🇹", tipo: "Embajada", direccion: "Av. Rodríguez Objío 4, Santo Domingo", telefono: "+1 809-682-0830", emergencia: "+39 06-36225", email: "ambasciata.santodomingo@esteri.it", web: "ambsantodomingo.esteri.it", horario: "Lun-Vie 8:30-13:30" },
  { pais: "Reino Unido", bandera: "🇬🇧", tipo: "Embajada", direccion: "Av. 27 de Febrero 233, Torre Empresarial, Piso 8, Santo Domingo", telefono: "+1 809-472-7111", emergencia: "+44 20-7008-5000", email: "ukindr@fcdo.gov.uk", web: "gov.uk/world/dominican-republic", horario: "Lun-Vie 8:30-15:30" },
  { pais: "Colombia", bandera: "🇨🇴", tipo: "Embajada", direccion: "Calle Abraham Lincoln 908, Piantini, Santo Domingo", telefono: "+1 809-562-2122", emergencia: "+57 1-381-4000", email: "esantodomingo@cancilleria.gov.co", web: "cancilleria.gov.co", horario: "Lun-Vie 8:00-16:00" },
  { pais: "México", bandera: "🇲🇽", tipo: "Embajada", direccion: "Av. Anacaona 50, Los Cacicazgos, Santo Domingo", telefono: "+1 809-687-6444", emergencia: "+52 55-3686-5100", email: "embrdominicana@sre.gob.mx", web: "embamex.sre.gob.mx", horario: "Lun-Vie 8:00-14:00" },
  { pais: "Brasil", bandera: "🇧🇷", tipo: "Embajada", direccion: "Calle Eduardo Vicioso 46, Bella Vista, Santo Domingo", telefono: "+1 809-532-0868", emergencia: "+55 61-3411-6000", email: "brasemb.sdomingos@itamaraty.gov.br", web: "santodomingo.itamaraty.gov.br", horario: "Lun-Vie 9:00-13:00" },
  { pais: "Argentina", bandera: "🇦🇷", tipo: "Embajada", direccion: "Av. Máximo Gómez 10, Santo Domingo", telefono: "+1 809-682-2977", emergencia: "+54 11-4819-7000", email: "esdom@mrecic.gov.ar", web: "erepd.cancilleria.gob.ar", horario: "Lun-Vie 8:00-14:00" },
  { pais: "Chile", bandera: "🇨🇱", tipo: "Embajada", direccion: "Av. Anacaona 11, Los Cacicazgos, Santo Domingo", telefono: "+1 809-530-8567", emergencia: "+56 2-2827-4000", email: "echile.rdominicanoa@minrel.gob.cl", web: "chile.gob.cl", horario: "Lun-Vie 8:00-14:00" },
  { pais: "Venezuela", bandera: "🇻🇪", tipo: "Embajada", direccion: "Calle Arzobispo Meriño 10, Zona Colonial, Santo Domingo", telefono: "+1 809-221-7271", emergencia: "+1 809-221-7271", email: "embavenesd@hotmail.com", web: "", horario: "Lun-Vie 8:00-14:00" },
  { pais: "Puerto Rico", bandera: "🇵🇷", tipo: "Consulado EE.UU.", direccion: "Aplica Embajada de EE.UU.", telefono: "+1 809-567-7775", emergencia: "+1 809-567-7775", email: "SDOAmericans@state.gov", web: "do.usembassy.gov", horario: "Lun-Vie 7:30-16:30" },
  { pais: "Haití", bandera: "🇭🇹", tipo: "Embajada", direccion: "Calle Juan Sánchez Ramírez 33, Zona Universitaria, Santo Domingo", telefono: "+1 809-686-7115", emergencia: "+1 809-686-7115", email: "", web: "", horario: "Lun-Vie 8:00-14:00" },
  { pais: "China", bandera: "🇨🇳", tipo: "Embajada", direccion: "Av. Anacaona 5, Los Cacicazgos, Santo Domingo", telefono: "+1 809-533-4543", emergencia: "+86 10-12308", email: "", web: "do.china-embassy.gov.cn", horario: "Lun-Vie 9:00-12:00" },
];

export default function EmbajadasConsulados() {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = embajadas.filter(e =>
    e.pais.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <PageTransition>
      <SEOHead
        title="Embajadas y Consulados en República Dominicana"
        description="Directorio completo de embajadas y consulados en Santo Domingo. Teléfonos de emergencia, direcciones y horarios de atención."
        keywords="embajadas dominicana, consulados Santo Domingo, emergencia consular, embajada EEUU RD"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Building2 className="h-3 w-3 mr-1" /> Directorio Consular
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Embajadas y Consulados
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Directorio completo con teléfonos de emergencia, direcciones y horarios. Encuentra tu representación diplomática.
            </p>
          </div>
        </section>

        {/* Emergencia */}
        <section className="py-6 bg-destructive/10 border-y border-destructive/20">
          <div className="container mx-auto px-4 flex items-center justify-center gap-3 text-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-foreground">
              <strong>Emergencia general:</strong> llama al <strong>911</strong> · Policía turística (POLITUR): <strong>+1 809-200-3500</strong>
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Buscador */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar por país..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filtradas.map(e => (
                <Card key={e.pais} className="overflow-hidden hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{e.bandera}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{e.pais}</h3>
                        <Badge variant="outline" className="text-[10px]">{e.tipo}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{e.direccion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                        <a href={`tel:${e.telefono}`} className="text-primary hover:underline">{e.telefono}</a>
                      </div>
                      {e.emergencia && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                          <span className="text-muted-foreground">Emergencia: <a href={`tel:${e.emergencia}`} className="text-destructive hover:underline">{e.emergencia}</a></span>
                        </div>
                      )}
                      {e.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                          <a href={`mailto:${e.email}`} className="text-muted-foreground hover:text-primary truncate">{e.email}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{e.horario}</span>
                      </div>
                      {e.web && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                          <a href={`https://${e.web}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">{e.web}</a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtradas.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No se encontró representación de ese país. Contacta al 911 en caso de emergencia.</p>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
