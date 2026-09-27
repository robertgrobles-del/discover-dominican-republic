import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Building2,
  Compass,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";

interface PartnerPublicFichaEditorProps {
  userEmail?: string;
  userId?: string;
  businessType?: string;
}

export function PartnerPublicFichaEditor({
  userEmail = "",
  userId,
  businessType = "agencia"
}: PartnerPublicFichaEditorProps) {
  const [activeTab, setActiveTab] = useState<"agencia" | "guia">(
    businessType === "guia" ? "guia" : "agencia"
  );

  // Estados de carga y búsqueda
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fichaEncontrada, setFichaEncontrada] = useState<boolean | null>(null);
  const [searchEmail, setSearchEmail] = useState(userEmail);

  // Campos de travel_agencies
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [agencyDescription, setAgencyDescription] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyEmail, setAgencyEmail] = useState(userEmail);
  const [agencyWebsite, setAgencyWebsite] = useState("");
  const [agencyAddress, setAgencyAddress] = useState("");
  const [agencyType, setAgencyType] = useState("Tour Operador");
  const [agencySpecialties, setAgencySpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [agencyIsActive, setAgencyIsActive] = useState(true);

  // Campos de tour_guides
  const [guideId, setGuideId] = useState<string | null>(null);
  const [guideName, setGuideName] = useState("");
  const [guideBio, setGuideBio] = useState("");
  const [guidePhone, setGuidePhone] = useState("");
  const [guideEmail, setGuideEmail] = useState(userEmail);
  const [guideLocation, setGuideLocation] = useState("");
  const [guideLanguages, setGuideLanguages] = useState<string[]>(["Español"]);
  const [newLanguage, setNewLanguage] = useState("");
  const [guideDailyRate, setGuideDailyRate] = useState<number | "">("");

  // Cargar ficha existente
  const fetchFicha = useCallback(async () => {
    const targetEmail = searchEmail.trim().toLowerCase();
    if (!targetEmail) return;

    setLoading(true);
    setFichaEncontrada(null);

    try {
      if (activeTab === "agencia") {
        const { data, error } = await supabase
          .from("travel_agencies")
          .select("*")
          .ilike("email", targetEmail)
          .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setAgencyId(data.id);
          setAgencyName(data.name || "");
          setAgencyDescription(data.description || "");
          setAgencyPhone(data.phone || "");
          setAgencyEmail(data.email || "");
          setAgencyWebsite(data.website || "");
          setAgencyAddress(data.address || "");
          setAgencyType(data.agency_type || "Tour Operador");
          setAgencySpecialties(data.specialties || []);
          setAgencyIsActive(data.is_active ?? true);
          setFichaEncontrada(true);
        } else {
          setAgencyId(null);
          setFichaEncontrada(false);
        }
      } else {
        const { data, error } = await supabase
          .from("tour_guides")
          .select("*")
          .ilike("email", targetEmail)
          .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setGuideId(data.id);
          setGuideName(data.name || "");
          setGuideBio(data.bio || "");
          setGuidePhone(data.phone || "");
          setGuideEmail(data.email || "");
          setGuideLocation(data.location || "");
          setGuideLanguages(data.languages || ["Español"]);
          setGuideDailyRate(data.daily_rate ?? "");
          setFichaEncontrada(true);
        } else {
          setGuideId(null);
          setFichaEncontrada(false);
        }
      }
    } catch (err: any) {
      console.error("Error al buscar ficha pública:", err);
      toast.error("Error consultando la base de datos pública");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchEmail]);

  useEffect(() => {
    if (userEmail) {
      setSearchEmail(userEmail);
      fetchFicha();
    }
  }, [userEmail, activeTab, fetchFicha]);

  // Guardar cambios en la ficha de Agencia
  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) {
      toast.error("El nombre de la agencia es obligatorio");
      return;
    }

    setSaving(true);
    try {
      if (agencyId) {
        // Actualizar registro existente
        const { error } = await supabase
          .from("travel_agencies")
          .update({
            name: agencyName,
            description: agencyDescription,
            phone: agencyPhone,
            email: agencyEmail,
            website: agencyWebsite,
            address: agencyAddress,
            agency_type: agencyType,
            specialties: agencySpecialties,
            is_active: agencyIsActive,
            updated_at: new Date().toISOString()
          })
          .eq("id", agencyId);

        if (error) throw error;
        toast.success("¡Ficha pública de Agencia actualizada correctamente!");
      } else {
        // Crear nueva ficha vinculada
        const slug = agencyName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const { data, error } = await supabase
          .from("travel_agencies")
          .insert({
            name: agencyName,
            slug,
            description: agencyDescription,
            phone: agencyPhone,
            email: agencyEmail || userEmail,
            website: agencyWebsite,
            address: agencyAddress,
            agency_type: agencyType,
            specialties: agencySpecialties,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setAgencyId(data.id);
        setFichaEncontrada(true);
        toast.success("¡Nueva ficha pública creada y vinculada!");
      }
    } catch (err: any) {
      console.error("Error al guardar ficha:", err);
      toast.error(err.message || "Error guardando los cambios de la ficha");
    } finally {
      setSaving(false);
    }
  };

  // Guardar cambios en la ficha de Guía
  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideName.trim()) {
      toast.error("El nombre del guía es obligatorio");
      return;
    }

    setSaving(true);
    try {
      if (guideId) {
        const { error } = await supabase
          .from("tour_guides")
          .update({
            name: guideName,
            bio: guideBio,
            phone: guidePhone,
            email: guideEmail,
            location: guideLocation,
            languages: guideLanguages,
            daily_rate: guideDailyRate === "" ? null : Number(guideDailyRate),
            updated_at: new Date().toISOString()
          })
          .eq("id", guideId);

        if (error) throw error;
        toast.success("¡Ficha pública de Guía actualizada correctamente!");
      } else {
        const { data, error } = await supabase
          .from("tour_guides")
          .insert({
            name: guideName,
            bio: guideBio,
            phone: guidePhone,
            email: guideEmail || userEmail,
            location: guideLocation,
            languages: guideLanguages,
            daily_rate: guideDailyRate === "" ? null : Number(guideDailyRate)
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setGuideId(data.id);
        setFichaEncontrada(true);
        toast.success("¡Ficha de Guía Turístico creada con éxito!");
      }
    } catch (err: any) {
      console.error("Error al guardar guía:", err);
      toast.error(err.message || "Error al actualizar la ficha del guía");
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !agencySpecialties.includes(newSpecialty.trim())) {
      setAgencySpecialties([...agencySpecialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (item: string) => {
    setAgencySpecialties(agencySpecialties.filter((s) => s !== item));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !guideLanguages.includes(newLanguage.trim())) {
      setGuideLanguages([...guideLanguages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (item: string) => {
    setGuideLanguages(guideLanguages.filter((l) => l !== item));
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Gestión de Ficha Pública Oficial
            </CardTitle>
            <CardDescription className="mt-1">
              Edita la información visible en el Directorio Nacional de Agencias o Guías Locales de Descubre RD.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
            <Button
              type="button"
              size="sm"
              variant={activeTab === "agencia" ? "default" : "ghost"}
              className="gap-1.5 text-xs font-semibold"
              onClick={() => setActiveTab("agencia")}
            >
              <Building2 className="h-3.5 w-3.5" /> Agencia / Operador
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "guia" ? "default" : "ghost"}
              className="gap-1.5 text-xs font-semibold"
              onClick={() => setActiveTab("guia")}
            >
              <Compass className="h-3.5 w-3.5" /> Guía Turístico
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Barra de vinculación por email */}
        <div className="p-4 bg-muted/60 border border-border/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              Email de Vinculación de Ficha
            </span>
            {loading ? (
              <Badge variant="outline" className="gap-1 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" /> Buscando...
              </Badge>
            ) : fichaEncontrada === true ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ficha Vinculada en Supabase
              </Badge>
            ) : fichaEncontrada === false ? (
              <Badge variant="secondary" className="gap-1 text-xs text-amber-600 bg-amber-500/10">
                <AlertCircle className="h-3.5 w-3.5" /> Sin ficha previa (Se creará nueva)
              </Badge>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="correo@tuagencia.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="bg-background text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={fetchFicha}
              disabled={loading}
              className="shrink-0 gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Sincronizar
            </Button>
          </div>
        </div>

        {/* Formulario Agencia */}
        {activeTab === "agencia" && (
          <form onSubmit={handleSaveAgency} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pub-ag-name">Nombre Comercial de la Agencia *</Label>
                <Input
                  id="pub-ag-name"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Ej: Colonial Tours RD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-ag-type">Tipo de Establecimiento</Label>
                <select
                  id="pub-ag-type"
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Tour Operador">Tour Operador</option>
                  <option value="Agencia de Viajes">Agencia de Viajes</option>
                  <option value="Ecoturismo">Ecoturismo y Aventura</option>
                  <option value="Náutica y Catamarán">Náutica y Catamarán</option>
                  <option value="Transporte Turístico">Transporte Turístico</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-ag-phone">Teléfono / WhatsApp Directo</Label>
                <Input
                  id="pub-ag-phone"
                  value={agencyPhone}
                  onChange={(e) => setAgencyPhone(e.target.value)}
                  placeholder="+1 (809) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-ag-email">Email Público de Contacto</Label>
                <Input
                  id="pub-ag-email"
                  type="email"
                  value={agencyEmail}
                  onChange={(e) => setAgencyEmail(e.target.value)}
                  placeholder="info@tuagencia.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-ag-web">Sitio Web Oficial</Label>
                <Input
                  id="pub-ag-web"
                  type="url"
                  value={agencyWebsite}
                  onChange={(e) => setAgencyWebsite(e.target.value)}
                  placeholder="https://tuagencia.do"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-ag-address">Ubicación / Destino Base</Label>
                <Input
                  id="pub-ag-address"
                  value={agencyAddress}
                  onChange={(e) => setAgencyAddress(e.target.value)}
                  placeholder="Ej: Calle El Conde, Santo Domingo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-ag-desc">Descripción Comercial y Servicios</Label>
              <Textarea
                id="pub-ag-desc"
                rows={4}
                value={agencyDescription}
                onChange={(e) => setAgencyDescription(e.target.value)}
                placeholder="Describe tu propuesta de valor, excursiones exclusivas y atención a viajeros..."
              />
            </div>

            {/* Especialidades */}
            <div className="space-y-3">
              <Label>Especialidades y Tipos de Excursión</Label>
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Ej: Buceo, Avistamiento Ballenas, Bodas de Destino..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSpecialty}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {agencySpecialties.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1.5 py-1 px-3">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(item)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Eliminar especialidad ${item}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              {agencyId && (
                <a
                  href={`/directorio-agencias`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Ver en Directorio Nacional
                </a>
              )}
              <div className="ml-auto flex items-center gap-3">
                <Button type="submit" disabled={saving} className="gap-2 font-bold min-w-[160px]">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar Ficha Pública
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Formulario Guía */}
        {activeTab === "guia" && (
          <form onSubmit={handleSaveGuide} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pub-guide-name">Nombre Completo del Guía *</Label>
                <Input
                  id="pub-guide-name"
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  placeholder="Ej: Manuel Alejandro Peralta"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-guide-loc">Zona o Destino Principal</Label>
                <Input
                  id="pub-guide-loc"
                  value={guideLocation}
                  onChange={(e) => setGuideLocation(e.target.value)}
                  placeholder="Ej: Zona Colonial / Santo Domingo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-guide-phone">WhatsApp para Reservas</Label>
                <Input
                  id="pub-guide-phone"
                  value={guidePhone}
                  onChange={(e) => setGuidePhone(e.target.value)}
                  placeholder="+1 (809) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-guide-email">Email de Contacto</Label>
                <Input
                  id="pub-guide-email"
                  type="email"
                  value={guideEmail}
                  onChange={(e) => setGuideEmail(e.target.value)}
                  placeholder="guia@descubrerd.do"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pub-guide-rate">Tarifa Diaria Referencial (USD)</Label>
                <Input
                  id="pub-guide-rate"
                  type="number"
                  min="0"
                  value={guideDailyRate}
                  onChange={(e) => setGuideDailyRate(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Ej: 75"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-guide-bio">Biografía y Trayectoria del Guía</Label>
              <Textarea
                id="pub-guide-bio"
                rows={4}
                value={guideBio}
                onChange={(e) => setGuideBio(e.target.value)}
                placeholder="Comparte tu experiencia, conocimientos históricos, áreas de especialización..."
              />
            </div>

            {/* Idiomas */}
            <div className="space-y-3">
              <Label>Idiomas Dominados</Label>
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Ej: Francés, Alemán, Ruso..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLanguage();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addLanguage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {guideLanguages.map((lang, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1.5 py-1 px-3">
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Eliminar idioma ${lang}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              {guideId && (
                <a
                  href={`/guias-locales`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Ver en Catálogo de Guías
                </a>
              )}
              <div className="ml-auto flex items-center gap-3">
                <Button type="submit" disabled={saving} className="gap-2 font-bold min-w-[160px]">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar Perfil de Guía
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
