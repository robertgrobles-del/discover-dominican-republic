import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Phone, MapPin, Stethoscope, AlertTriangle, ShieldCheck, 
  HeartPulse, Clock, Navigation, CheckCircle2, Building2, 
  Globe, ArrowLeft, Star, Share2, Award, Pill, Hospital, 
  FileText, Calendar, Mail, Ambulance
} from "lucide-react";
import { toast } from "sonner";
import { centrosSalud, CentroSalud } from "@/data/healthCenters";
import { PreFooterPresidenteBanner, DetailPageSidebarAd, BillboardAd, MobileStickyFooterAd } from "@/components/promo";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";

export default function CentroSaludDetalle() {
  const { id } = useParams<{ id: string }>();

  // Find center by id or fallback to first
  const centro: CentroSalud = useMemo(() => {
    return centrosSalud.find((c) => c.id === id) || centrosSalud[0];
  }, [id]);

  const [bookingDate, setBookingDate] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${centro.name} - Centro de Salud RD`,
        text: `Información y urgencias de ${centro.name} en ${centro.region}.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace del centro copiado al portapapeles.");
    }
  };

  const handleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`¡Solicitud enviada a ${centro.name}! Un asesor bilingüe te contactará pronto.`);
      setPatientName("");
      setPatientEmail("");
      setPatientPhone("");
      setAppointmentReason("");
      setBookingDate("");
    }, 1000);
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${centro.name} - ${centro.region} | Centro de Salud & Urgencias Descubre RD`}
        description={`Servicios médicos, emergencias, seguros aceptados y contacto para ${centro.name} en ${centro.address}, ${centro.region}. Atención turística bilingüe.`}
      />

      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-10">

            {/* Breadcrumbs & Share */}
            <div className="flex items-center justify-between">
              <Link
                to="/salud-24h"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Directorio de Salud 24h</span>
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 rounded-xl text-xs">
                  <Share2 className="h-3.5 w-3.5" /> Compartir
                </Button>
              </div>
            </div>

            {/* Hero Header with Visual Backdrop / Image */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
              {centro.imageUrl && (
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img 
                    src={centro.imageUrl} 
                    alt={centro.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/30" />
                </div>
              )}
              
              <div className="relative p-6 sm:p-10 -mt-16 sm:-mt-20 z-10 backdrop-blur-md bg-background/80 mx-4 sm:mx-6 mb-6 rounded-2xl border border-border/80 shadow-lg">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[11px] font-bold">
                        {centro.type === "hospital" ? "Hospital / Clínica" : centro.type === "pharmacy" ? "Farmacia" : centro.type === "dental" ? "Clínica Dental" : "Laboratorio Clínico"}
                      </Badge>
                      {centro.is24h && (
                        <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30 text-[11px] font-bold gap-1">
                          <Clock className="h-3 w-3" /> Abierto 24 Horas
                        </Badge>
                      )}
                      {centro.verified && (
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[11px] font-bold gap-1">
                          <ShieldCheck className="h-3 w-3" /> Centro Certificado
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1 border-border/80">
                        <Calendar className="h-3 w-3 text-primary" /> Verificado: Septiembre 2026
                      </Badge>
                      <ClaimBusinessModal
                        businessName={centro.name}
                        businessType="salud"
                        businessId={centro.id}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-muted-foreground hover:text-rose-500 gap-1 px-1.5"
                        onClick={() => toast.info("Gracias por colaborar. Tu reporte sobre este centro médico ha sido enviado a revisión.")}
                      >
                        <AlertTriangle className="h-3 w-3" /> Reportar dato incorrecto
                      </Button>
                    </div>

                    <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
                      {centro.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{centro.address}, {centro.region}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>Idiomas: {centro.languages?.join(", ") || "Español, Inglés"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency CTA Card */}
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                    <a href={`tel:${centro.phone.replace(/-/g, "")}`}>
                      <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-2xl shadow-lg">
                        <Phone className="h-5 w-5" /> Llamar Directo: {centro.phone}
                      </Button>
                    </a>
                    {centro.emergencyPhone && (
                      <a href={`tel:${centro.emergencyPhone.replace(/-/g, "")}`}>
                        <Button size="lg" variant="destructive" className="w-full font-bold gap-2 rounded-2xl shadow-lg">
                          <Ambulance className="h-5 w-5" /> Urgencias 24h
                        </Button>
                      </a>
                    )}
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${centro.latitude},${centro.longitude}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" variant="outline" className="w-full gap-2 rounded-2xl">
                        <Navigation className="h-5 w-5 text-primary" /> Abrir en Google Maps
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Details Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left 2 Cols: Services, Insurance, Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Medical Services Card */}
                <Card className="rounded-3xl border-border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold font-display text-foreground">Servicios Médicos Disponibles</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    {centro.services.map((svc, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-foreground">{svc}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Insurance Accepted Card */}
                <Card className="rounded-3xl border-border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    <h2 className="text-xl font-bold font-display text-foreground">Seguros Médicos y Coberturas</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Este centro colabora con las principales aseguradoras nacionales e internacionales para viajeros y turistas.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {centro.insuranceAccepted?.map((ins, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1 text-xs font-semibold rounded-xl">
                        {ins}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* International Patient Care Info */}
                <Card className="rounded-3xl border-border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-amber-500" />
                    <h2 className="text-xl font-bold font-display text-foreground">Atención para Turistas & Viajeros</h2>
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <p>
                      • <strong>Personal Bilingüe:</strong> Médicos, enfermeros y traductores disponibles para pacientes internacionales.
                    </p>
                    <p>
                      • <strong>Facturación para Reembolso:</strong> Emisión de facturas médicas detalladas con códigos internacionales ICD para reclamar con tu seguro de viaje.
                    </p>
                    <p>
                      • <strong>Traslados en Ambulancia:</strong> Coordinación de emergencias hacia y desde hoteles, aeropuertos y puertos de cruceros.
                    </p>
                  </div>
                </Card>
              </div>

              {/* Right Column: Appointment Request Form & Info */}
              <div className="space-y-6">
                
                {/* Appointment Card */}
                <Card className="rounded-3xl border-border bg-card shadow-lg p-6 space-y-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Solicitar Cita o Consulta
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Envía tus datos y el centro médico se comunicará contigo para confirmar tu turno.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <form onSubmit={handleAppointment} className="space-y-3 text-xs sm:text-sm">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Nombre del Paciente</label>
                        <input
                          type="text"
                          placeholder="Tu nombre completo"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-primary"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Correo Electrónico</label>
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-primary"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Teléfono / WhatsApp</label>
                        <input
                          type="tel"
                          placeholder="+1 (809) 000-0000"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-primary"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Fecha Preferida</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-primary"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Motivo de Consulta / Especialidad</label>
                        <textarea
                          placeholder="Ej: Chequeo general, odontología, medicina hiperbárica..."
                          value={appointmentReason}
                          onChange={(e) => setAppointmentReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-primary resize-none"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full font-bold rounded-xl" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando solicitud..." : "Agendar Consulta"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Direct Help Call */}
                <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>¿Emergencia en República Dominicana?</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Si te encuentras ante una urgencia de gravedad, llama de inmediato al <strong>9-1-1</strong> (Sistema Nacional de Emergencias) o contacta a <strong>POLITUR al (809) 222-2010</strong>.
                  </p>
                </div>

                {/* Sidebar Standard Ad */}
                <DetailPageSidebarAd showDemo variant="standard" industry="banks" />

              </div>
            </div>

            {/* Standard IAB Billboard Ad */}
            <div className="mt-12">
              <BillboardAd showDemo section="salud-24h" />
            </div>

            {/* PreFooter Promo */}
            <div className="mt-8">
              <PreFooterPresidenteBanner />
            </div>

          </div>
        </main>

        <MobileStickyFooterAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
}
