import { Honeypot } from "@/components/forms/Honeypot";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  ChevronRight, ChevronLeft, Check, Building2,
  MapPin, Phone, Mail, Globe, Clock,
  User, FileText, Star, Loader2, PartyPopper, CheckCircle2, ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isValidEmail } from "@/lib/security";
import { saveClaimLocally } from "@/lib/leadStorage";
import { fetchApi } from "@/lib/fastifyClient";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import {
  TipoEstablecimiento,
  tipoConfig,
  TIPOS_SELECCIONABLES,
  provincias,
  StepIndicator,
  FieldRow,
  FormField,
} from "./registro/RegistroFormHelpers";
import {
  CamposRestaurante,
  CamposBar,
  CamposHotel,
  CamposAirbnb,
  CamposTour,
  CamposSpa,
  CamposTienda,
  CamposGenericos,
  tieneCamposGenericos,
  camposRequeridosPendientes,
} from "./registro/CamposEspecificos";
import { ArchivosNegocio, type Archivo } from "./registro/ArchivosNegocio";

export type { TipoEstablecimiento };

interface Props {
  open: boolean;
  onClose: () => void;
  /** Tipo con el que se abre el formulario. `general` = sin elegir: la persona lo escoge en el primer paso. */
  tipo: TipoEstablecimiento;
  /** Se muestra como página (/registra-tu-negocio) en lugar de ventana. */
  asPage?: boolean;
  /** Si es admin, permite publicar la empresa directamente sin pasar a revisión */
  isAdmin?: boolean;
}

/** Tipos que pueden adjuntar su menú en PDF (las discotecas se registran como bar). */
const CON_MENU: TipoEstablecimiento[] = ["restaurante", "bar", "cafe"];

export function RegistroEstablecimientoModal({ open, onClose, tipo: tipoInicial, asPage = false, isAdmin = false }: Props) {
  // Un solo formulario para todo tipo de negocio. Quien llega desde un botón concreto («Registrar mi restaurante»)
  // ya trae el tipo elegido y puede cambiarlo; los campos del paso 2 dependen del tipo.
  const [tipo, setTipoState] = useState<TipoEstablecimiento>(tipoInicial);
  const config = tipoConfig[tipo];
  const Icon = config.icon;
  const TOTAL_STEPS = 6;
  // Los alojamientos operan 24/7: en lugar de horario piden check-in y check-out.
  const esAlojamiento = tipo === "hotel" || tipo === "airbnb";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [publishImmediately, setPublishImmediately] = useState(isAdmin);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdStatus, setCreatedStatus] = useState<string>("pending");

  // Step 1 - Basic info
  const [basicData, setBasicData] = useState({
    nombre: "", responsable: "", email: "", telefono: "",
    direccion: "", provincia: "", website: "", foto_url: "",
    descripcion: "", rnc: "", horario: "",
  });

  // Step 2 - Specific fields
  const [specificData, setSpecificData] = useState<Record<string, string>>({});

  const [fotos, setFotos] = useState<Archivo[]>([]);
  const [menu, setMenu] = useState<Archivo | null>(null);
  const conMenu = CON_MENU.includes(tipo);

  // Step 3 - Terms
  const [acceptTerms, setAcceptTerms] = useState(false);

  const updateBasic = (k: string, v: string) => setBasicData(prev => ({ ...prev, [k]: v }));
  const updateSpecific = (k: string, v: string) => setSpecificData(prev => ({ ...prev, [k]: v }));
  /** Cambiar de tipo descarta los detalles del anterior: sus campos no aplican al nuevo. */
  const setTipo = (next: TipoEstablecimiento) => { if (next !== tipo) setSpecificData({}); setTipoState(next); };
  const pendientesPaso2 = camposRequeridosPendientes(tipo, specificData);

  // Cada paso exige lo suyo antes de seguir: 0 negocio y contacto, 1 ubicación, 2 horario y descripción,
  // 3 detalles según el tipo, 4 fotos y menú (opcionales), 5 confirmación.
  const stepValid = (n: number): boolean => {
    if (n === 0) return tipo !== "general" && Boolean(basicData.nombre.trim() && basicData.responsable.trim() && basicData.telefono.trim()) && isValidEmail(basicData.email);
    if (n === 1) return Boolean(basicData.direccion.trim() && basicData.provincia);
    if (n === 2) return Boolean((!esAlojamiento || (specificData.checkin && specificData.checkout)) && basicData.descripcion.trim());
    if (n === 3) return pendientesPaso2.length === 0;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const horario = esAlojamiento
    ? `24/7 · Check-in ${specificData.checkin || "-"} · Check-out ${specificData.checkout || "-"}`
    : basicData.horario.trim();

  const handleSubmit = async () => {
    if (!acceptTerms) return;
    setLoading(true);

    if (HAS_BACKEND_SESSION) {
      try {
        const backendType = tipo;
        const statusToSend = isAdmin && publishImmediately ? "approved" : "pending";
        const res = await fetchApi<{ data: { id: string; status: string } }>("/establishments/register", {
          method: "POST",
          body: JSON.stringify({
            type: backendType,
            name: basicData.nombre.trim(),
            contact_name: basicData.responsable.trim(),
            email: basicData.email.trim().toLowerCase(),
            phone: basicData.telefono.trim(),
            address: basicData.direccion.trim(),
            province: basicData.provincia.trim(),
            website: basicData.website?.trim() || undefined,
            photo_url: basicData.foto_url?.trim() || undefined,
            description: basicData.descripcion.trim(),
            rnc: basicData.rnc?.trim() || undefined,
            schedule: horario || undefined,
            details: specificData,
            photo_ids: fotos.map((f) => f.id),
            menu_id: conMenu && menu ? menu.id : undefined,
            status: statusToSend,
          }),
        });

        if (res?.data?.id) {
          setCreatedId(res.data.id);
          setCreatedStatus(res.data.status || statusToSend);
        }
        setSuccess(true);
        toast.success(statusToSend === "approved" ? "¡Empresa registrada y publicada en la web!" : "¡Solicitud de registro enviada con éxito!");
      } catch (err) {
        console.error("Error al registrar establecimiento en backend:", err);
        toast.error((err instanceof Error && err.message) || "No se pudo registrar el establecimiento. Revisa los datos e intenta de nuevo.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // 1. Guardar localmente en el registro offline garantizado
      saveClaimLocally({
        business_name: basicData.nombre,
        business_type: tipo,
        applicant_name: basicData.responsable,
        applicant_email: basicData.email,
        applicant_phone: basicData.telefono,
        role: "Propietario / Administrador",
        rnc: basicData.rnc || null,
        notes: `Provincia: ${basicData.provincia}. Dirección: ${basicData.direccion}. Horario: ${horario || "N/A"}. Detalles: ${JSON.stringify(specificData)}`,
      });

      // 2. Intentar inserción remota en Supabase — graceful fallback si la tabla no existe
      const payload = {
        tipo_establecimiento: tipo,
        nombre: basicData.nombre,
        responsable: basicData.responsable,
        email: basicData.email,
        telefono: basicData.telefono,
        direccion: basicData.direccion,
        provincia: basicData.provincia,
        website: basicData.website || null,
        foto_url: basicData.foto_url || null,
        descripcion: basicData.descripcion,
        rnc: basicData.rnc || null,
        horario: horario || null,
        detalles: specificData,
        status: "pendiente",
      };

      const { error } = await supabase
        .from("establishment_registrations")
        .insert(payload);

      if (error && error.code !== "42P01") {
        console.error("Supabase error:", error);
      }
    } catch {
      // Ignore — fallback to offline demo
    }

    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(0);
      setSuccess(false);
      setBasicData({ nombre: "", responsable: "", email: "", telefono: "", direccion: "", provincia: "", website: "", foto_url: "", descripcion: "", rnc: "", horario: "" });
      setTipoState(tipoInicial);
      setSpecificData({});
      setFotos([]);
      setMenu(null);
      setAcceptTerms(false);
    }, 300);
  };

  const stepLabels = ["Negocio y contacto", "Ubicación", "Horario y descripción", "Detalles del negocio", conMenu ? "Fotos y menú" : "Fotos", "Confirmación"];

  const Titulo = asPage ? "h2" : DialogTitle;
  const Descripcion = asPage ? "p" : DialogDescription;
  const header = (
    <div className="flex items-center gap-3 mb-1">
      <div className="p-2 rounded-xl bg-muted">
        <Icon className={`h-6 w-6 ${config.color}`} />
      </div>
      <div>
        <Titulo className="text-xl font-display font-bold">
          Registrar {tipo === "general" ? "mi negocio" : config.label}
        </Titulo>
        <Descripcion className="text-sm text-muted-foreground">
          {config.descripcion}
        </Descripcion>
      </div>
    </div>
  );

  const body = (
        <AnimatePresence mode="wait">
          {/* ── SUCCESS ── */}
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-4"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                {createdStatus === "approved" ? (
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                ) : (
                  <PartyPopper className="h-10 w-10 text-emerald-500" />
                )}
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                {createdStatus === "approved" ? "¡Empresa Publicada con Éxito!" : "¡Solicitud recibida!"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {createdStatus === "approved" ? (
                  <>
                    La empresa <strong>{basicData.nombre}</strong> ya está activa. Puedes ver su página oficial y su card en el directorio turístico.
                  </>
                ) : (
                  <>
                    Recibimos la solicitud de <strong>{basicData.nombre}</strong>. Nuestro equipo la revisará en 2 o 3 días hábiles y te escribirá a <strong>{basicData.email}</strong> con el resultado y los siguientes pasos.
                  </>
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {createdStatus === "approved" ? (
                  <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Publicada y Activa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-300">
                    <Clock className="h-3 w-3" /> Pendiente de revisión
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-3">
                {createdId && (
                  <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Link to={`/negocios/${createdId}`}>
                      <ExternalLink className="h-4 w-4" /> Ver página pública
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link to="/negocios">Ver directorio de empresas</Link>
                </Button>
                <Button onClick={handleClose} variant="ghost">
                  {asPage ? "Volver al inicio" : "Cerrar"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Step Indicator */}
              <StepIndicator step={step} total={TOTAL_STEPS} labels={stepLabels} />
              <p className="text-center text-xs text-muted-foreground mb-6 -mt-3 sm:hidden">
                Paso {step + 1} de {TOTAL_STEPS} — <span className="font-medium text-foreground">{stepLabels[step]}</span>
              </p>

              <AnimatePresence mode="wait">
                {/* ── STEP 1 ── Basic Info ── */}
                {step === 0 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    {/* Tipo de negocio */}
                    <FormField label="¿Qué tipo de negocio vas a registrar?" required>
                      <Select value={tipo === "general" ? "" : tipo} onValueChange={v => setTipo(v as TipoEstablecimiento)}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          {TIPOS_SELECCIONABLES.map((t) => {
                            const TipoIcon = tipoConfig[t].icon;
                            return (
                              <SelectItem key={t} value={t}>
                                <span className="flex items-center gap-2">
                                  <TipoIcon className={`h-4 w-4 shrink-0 ${tipoConfig[t].color}`} aria-hidden="true" />
                                  {tipoConfig[t].label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FieldRow>
                      <FormField label="Nombre del Establecimiento" required>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" maxLength={120} placeholder={`Nombre del ${config.label.toLowerCase()}`} value={basicData.nombre} onChange={e => updateBasic("nombre", e.target.value)} />
                        </div>
                      </FormField>
                      <FormField label="Nombre del Responsable" required>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" maxLength={120} placeholder="Nombre completo" value={basicData.responsable} onChange={e => updateBasic("responsable", e.target.value)} />
                        </div>
                      </FormField>
                    </FieldRow>
                    <FieldRow>
                      <FormField label="Email de Contacto" required>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" type="email" maxLength={254} placeholder="negocio@ejemplo.com" value={basicData.email} onChange={e => updateBasic("email", e.target.value)} />
                        </div>
                      </FormField>
                      <FormField label="Teléfono / WhatsApp" required>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" maxLength={25} placeholder="+1 (809) 000-0000" value={basicData.telefono} onChange={e => updateBasic("telefono", e.target.value)} />
                        </div>
                      </FormField>
                    </FieldRow>
                  </motion.div>
                )}

                {/* ── PASO 2 ── Ubicación ── */}
                {step === 1 && (
                  <motion.div key="step-ubicacion" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <FieldRow>
                      <FormField label="Dirección Física" required>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" maxLength={200} placeholder="Calle, sector, número..." value={basicData.direccion} onChange={e => updateBasic("direccion", e.target.value)} />
                        </div>
                      </FormField>
                      <FormField label="Provincia" required>
                        <Select value={basicData.provincia} onValueChange={v => updateBasic("provincia", v)}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>{provincias.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormField>
                    </FieldRow>
                    <FieldRow>
                      <FormField label="Sitio Web o Redes Sociales">
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="https://... o @instagram" value={basicData.website} onChange={e => updateBasic("website", e.target.value)} />
                        </div>
                      </FormField>
                      <FormField label="RNC / Registro Comercial">
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" maxLength={20} placeholder="Número RNC..." value={basicData.rnc} onChange={e => updateBasic("rnc", e.target.value)} />
                        </div>
                      </FormField>
                    </FieldRow>
                  </motion.div>
                )}

                {/* ── PASO 3 ── Horario y descripción ── */}
                {step === 2 && (
                  <motion.div key="step-horario" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    {esAlojamiento ? (
                      <FieldRow>
                        <FormField label="Hora de check-in" required>
                          <Input type="time" value={specificData.checkin || ""} onChange={e => setSpecificData(prev => ({ ...prev, checkin: e.target.value }))} />
                        </FormField>
                        <FormField label="Hora de check-out" required>
                          <Input type="time" value={specificData.checkout || ""} onChange={e => setSpecificData(prev => ({ ...prev, checkout: e.target.value }))} />
                        </FormField>
                      </FieldRow>
                    ) : (
                      <FormField label="Horario de Operación">
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="Ej. Lun-Vie 9AM-6PM, Sáb-Dom 10AM-4PM" value={basicData.horario} onChange={e => updateBasic("horario", e.target.value)} />
                        </div>
                      </FormField>
                    )}
                    <FormField label="Descripción del Establecimiento" required>
                      <Textarea
                        placeholder={`Describe brevemente tu ${config.label.toLowerCase()}: qué ofreces, qué te hace especial...`}
                        className="min-h-[140px]"
                        value={basicData.descripcion}
                        onChange={e => updateBasic("descripcion", e.target.value)}
                      />
                    </FormField>
                  </motion.div>
                )}

                {/* ── PASO 4 ── Detalles según el tipo ── */}
                {step === 3 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-5 p-3 bg-muted/50 rounded-xl flex items-center gap-3">
                      <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
                      <p className="text-sm text-muted-foreground">Completa los detalles específicos para <strong className="text-foreground">{config.label}</strong>. Más información = mayor visibilidad en la plataforma.</p>
                    </div>
                    {tipo === "restaurante" && <CamposRestaurante data={specificData} onChange={updateSpecific} />}
                    {tipo === "bar" && <CamposBar data={specificData} onChange={updateSpecific} />}
                    {tipo === "hotel" && <CamposHotel data={specificData} onChange={updateSpecific} />}
                    {tipo === "airbnb" && <CamposAirbnb data={specificData} onChange={updateSpecific} />}
                    {tipo === "tour" && <CamposTour data={specificData} onChange={updateSpecific} />}
                    {tipo === "spa" && <CamposSpa data={specificData} onChange={updateSpecific} />}
                    {tipo === "tienda" && <CamposTienda data={specificData} onChange={updateSpecific} />}
                    {tieneCamposGenericos(tipo) && <CamposGenericos tipo={tipo} data={specificData} onChange={updateSpecific} />}
                  </motion.div>
                )}

                {/* ── PASO 5 ── Fotos y menú ── */}
                {step === 4 && (
                  <motion.div key="step-archivos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <ArchivosNegocio fotos={fotos} onFotos={setFotos} menu={menu} onMenu={setMenu} conMenu={conMenu} />
                  </motion.div>
                )}

                {/* ── PASO 6 ── Confirmación ── */}
                {step === 5 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    {/* Summary Card */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Resumen del Registro</h4>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        {[
                          ["Establecimiento", basicData.nombre],
                          ["Tipo", config.label],
                          ["Responsable", basicData.responsable],
                          ["Email", basicData.email],
                          ["Teléfono", basicData.telefono],
                          ["Provincia", basicData.provincia],
                          ["Dirección", basicData.direccion],
                          basicData.website ? ["Web / RRSS", basicData.website] : null,
                          basicData.rnc ? ["RNC", basicData.rnc] : null,
                          ["Fotos", String(fotos.length)],
                          conMenu ? ["Menú", menu ? menu.nombre : "Sin menú"] : null,
                        ].filter(Boolean).map(([label, value]) => (
                          <div key={label}>
                            <span className="text-muted-foreground">{label}: </span>
                            <span className="font-medium text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                      {basicData.descripcion && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">{basicData.descripcion}</p>
                        </div>
                      )}
                    </div>

                    {/* What happens next */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground text-sm">¿Qué pasa después?</h4>
                      {[
                        "Nuestro equipo revisará tu solicitud en 2-3 días hábiles.",
                        "Recibirás un email de confirmación con los próximos pasos.",
                        "Una vez aprobado, tu establecimiento aparecerá en la plataforma.",
                        "Podrás gestionar tu perfil desde el Portal de Partners.",
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                          {step}
                        </div>
                      ))}
                    </div>

                    {/* Admin Publication Option */}
                    {isAdmin && (
                      <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm text-foreground">Modo Administrador: Publicar Empresa</p>
                            <p className="text-xs text-muted-foreground">Aprobar y publicar de inmediato con su página y card en el directorio.</p>
                          </div>
                          <Checkbox
                            id="publish-immediately"
                            checked={publishImmediately}
                            onCheckedChange={(v) => setPublishImmediately(Boolean(v))}
                          />
                        </div>
                      </div>
                    )}

                    {/* Terms */}
                    <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={v => setAcceptTerms(Boolean(v))}
                        className="mt-0.5"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                        Acepto los <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-primary underline">Términos y Condiciones</a> y la <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline">Política de Privacidad</a> de Descubre RD. Confirmo que la información proporcionada es verídica y me comprometo a mantenerla actualizada.
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={step === 0 ? handleClose : handleBack}
                  disabled={loading}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {step === 0 ? (asPage ? "Volver" : "Cancelar") : "Anterior"}
                </Button>

                <div className="text-xs text-muted-foreground">
                  {step + 1} / {TOTAL_STEPS}
                </div>

                {step < TOTAL_STEPS - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!stepValid(step)}
                    className="gap-2"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!acceptTerms || loading}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                    ) : (
                      <><Check className="h-4 w-4" /> Enviar Registro</>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
  );

  if (asPage) {
    return (
      <div className="relative">
        <Honeypot />
        <div className="pb-4">{header}</div>
        {body}
      </div>
    );
  }
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto sm:p-8"><Honeypot />
        <DialogHeader className="pb-2">{header}</DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
