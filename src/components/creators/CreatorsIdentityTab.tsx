import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import {
  AlertCircle,
  BadgeCheck,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/fastifyClient";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { useAuth } from "@/hooks/useAuth";
import { useAccessContext } from "@/hooks/useAccessContext";
import {
  CREATOR_CATEGORY_OPTIONS,
  CREATOR_LANGUAGE_OPTIONS,
  demoCreatorIdentity,
} from "./demoCreatorIdentity";

/**
 * Centro de identidad y reputación del creador (Plan de accesos, punto 41).
 *
 * Muestra el perfil público tal y como lo verá la audiencia, los sellos obtenidos y pendientes con sus
 * **criterios publicados**, y permite editar categorías, idiomas, visibilidad y biografía.
 *
 * Reglas que se respetan aquí:
 *   - Los sellos se otorgan por criterios publicados y **no conceden permisos**: la reputación no es una
 *     capacidad del sistema de accesos.
 *   - Con `IS_MOCK_DATA` no hay backend al que preguntar, así que se usa el conjunto de demostración
 *     `demoCreatorIdentity` (marcado con `demo: true`) y se anuncia con un Badge "demo".
 */

export interface CreatorProfileSummary {
  id?: string;
  display_name?: string;
  handle?: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface CreatorAudienceMetrics {
  followers?: number;
  views?: number;
  engagement_rate?: number;
}

export interface CreatorReputationFactor {
  key: string;
  label: string;
  points: number;
  max_points: number;
}

export interface CreatorIdentityDetails {
  categories?: string[];
  languages?: string[];
  public_profile?: boolean;
  bio?: string | null;
  audience_verified?: boolean;
  audience_verified_at?: string | null;
  audience_metrics?: CreatorAudienceMetrics | null;
  reputation_score?: number;
  /** Desglose por factores. El contrato base solo garantiza `reputation_score`; si falta, se dice. */
  reputation_breakdown?: CreatorReputationFactor[] | null;
}

export interface CreatorSeal {
  seal_key: string;
  awarded_at?: string | null;
  expires_at?: string | null;
  evidence?: string | null;
}

export interface CreatorSealDefinition {
  key: string;
  label: string;
  purpose: string;
  criteria: string;
}

export interface CreatorIdentityBundle {
  demo?: boolean;
  profile: CreatorProfileSummary;
  identity: CreatorIdentityDetails;
  seals: CreatorSeal[];
  seal_catalog: CreatorSealDefinition[];
}

export const CREATOR_BIO_MAX_LENGTH = 280;
export const CREATOR_CATEGORIES_MAX = 4;

const API_IDENTITY_ENDPOINT = "/creators/me/identity";

function formatNumber(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return value.toLocaleString("es-DO");
}

function formatPercent(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString("es-DO", { maximumFractionDigits: 2 })} %`;
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" });
}

function initialsOf(name?: string): string {
  if (!name) return "CR";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CreatorsIdentityTab() {
  const { can } = useAccessContext();
  const { session } = useAuth();
  const canCreatorStudio = can("creator.studio");
  const token = session?.access_token ?? null;

  const [bundle, setBundle] = useState<CreatorIdentityBundle | null>(
    IS_MOCK_DATA && canCreatorStudio ? demoCreatorIdentity : null,
  );
  const [loading, setLoading] = useState(!IS_MOCK_DATA);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Formulario de edición.
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [publicProfile, setPublicProfile] = useState(true);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!canCreatorStudio) return;
    if (IS_MOCK_DATA) {
      setBundle(demoCreatorIdentity);
      setLoading(false);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchApi<{ data: CreatorIdentityBundle }>(API_IDENTITY_ENDPOINT, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setBundle(
          res?.data ?? { profile: {}, identity: {}, seals: [], seal_catalog: [] },
        );
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setBundle(null);
        setLoadError(error instanceof Error ? error.message : "No se pudo cargar la identidad de creador.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canCreatorStudio, token, reloadKey]);

  // El formulario se rellena con lo último que devolvió el servidor (o la demo).
  useEffect(() => {
    if (!bundle) return;
    setCategories(bundle.identity.categories ?? []);
    setLanguages(bundle.identity.languages ?? []);
    setPublicProfile(bundle.identity.public_profile ?? false);
    setBio(bundle.identity.bio ?? bundle.profile.bio ?? "");
  }, [bundle]);

  const validationError = useMemo(() => {
    if (categories.length === 0) return "Selecciona al menos una categoría de contenido.";
    if (categories.length > CREATOR_CATEGORIES_MAX) {
      return `Puedes elegir como máximo ${CREATOR_CATEGORIES_MAX} categorías.`;
    }
    if (languages.length === 0) return "Selecciona al menos un idioma de publicación.";
    if (bio.trim().length > CREATOR_BIO_MAX_LENGTH) {
      return `La biografía no puede superar los ${CREATOR_BIO_MAX_LENGTH} caracteres.`;
    }
    return null;
  }, [categories, languages, bio]);

  if (!canCreatorStudio) {
    return (
      <AccessDeniedState
        description="El centro de identidad y reputación pertenece al estudio de creador y requiere la capacidad creator.studio, que tu cuenta no tiene."
        requiredRole="creator.studio"
      />
    );
  }

  if (loading && !bundle) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 rounded-2xl">
        <CardContent className="p-6 flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <AlertCircle className="h-4 w-4" /> No se pudo cargar tu identidad de creador
          </div>
          <p className="text-xs text-muted-foreground">
            {loadError ?? "El servidor no devolvió datos. Vuelve a intentarlo en unos segundos."}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-xs"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isDemo = IS_MOCK_DATA || bundle.demo === true;
  const displayName = bundle.profile.display_name ?? "Creador sin nombre público";
  const handle = bundle.profile.handle ?? "";
  const publicBio = bundle.identity.bio ?? bundle.profile.bio ?? "";
  const metrics = bundle.identity.audience_metrics ?? {};
  const reputationScore = bundle.identity.reputation_score;
  const breakdown = bundle.identity.reputation_breakdown ?? [];
  const verifiedAt = formatDate(bundle.identity.audience_verified_at);

  const toggleCategory = (option: string) => {
    setCategories((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
    );
  };

  const toggleLanguage = (option: string) => {
    setLanguages((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }
    setFormError(null);
    setSaving(true);
    const payload = {
      categories,
      languages,
      public_profile: publicProfile,
      bio: bio.trim(),
    };
    try {
      if (IS_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setBundle((prev) => (prev ? { ...prev, identity: { ...prev.identity, ...payload } } : prev));
        toast.info("Modo simulado: los cambios se guardaron solo en esta pantalla, no en un servidor.");
        return;
      }
      const res = await fetchApi<{ data: CreatorIdentityDetails }>(API_IDENTITY_ENDPOINT, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      setBundle((prev) =>
        prev ? { ...prev, identity: { ...prev.identity, ...(res?.data ?? payload) } } : prev,
      );
      toast.success("Identidad de creador actualizada.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar la identidad de creador.",
      );
    } finally {
      setSaving(false);
    }
  };

  const reputationPercent =
    typeof reputationScore === "number" ? Math.max(0, Math.min(100, reputationScore)) : null;

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3">
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
            demo
          </Badge>
          <p className="text-[11px] text-muted-foreground">
            Datos de demostración: el entorno corre con datos simulados y los endpoints de identidad aún no
            existen. Nada de lo que ves aquí proviene de un servidor.
          </p>
        </div>
      )}

      {/* Vista previa del perfil público */}
      <Card className="border-border bg-card rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold">Perfil público del creador</CardTitle>
            <CardDescription className="text-xs">
              Así te ve la audiencia en el directorio de creadores.
            </CardDescription>
          </div>
          {bundle.identity.public_profile ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              Visible
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" /> Oculto
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <Avatar className="h-20 w-20 border border-border">
              {bundle.profile.avatar_url ? (
                <AvatarImage src={bundle.profile.avatar_url} alt={displayName} />
              ) : null}
              <AvatarFallback className="text-lg font-bold">{initialsOf(displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl font-black text-foreground">{displayName}</h3>
                {handle && <span className="text-xs font-semibold text-primary">{handle}</span>}
                {bundle.identity.audience_verified && (
                  <Badge
                    className="bg-primary/10 text-primary border-primary/20 gap-1"
                    title="Audiencia verificada por auditoría de métricas"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Audiencia verificada{verifiedAt ? ` · ${verifiedAt}` : ""}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {publicBio || "Todavía no has escrito una biografía pública."}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(bundle.identity.categories ?? []).map((category) => (
                  <Badge key={category} variant="outline" className="text-[10px] font-semibold">
                    <Sparkles className="h-3 w-3 mr-1" /> {category}
                  </Badge>
                ))}
                {(bundle.identity.languages ?? []).map((language) => (
                  <Badge key={language} variant="secondary" className="text-[10px] font-semibold">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Seguidores</p>
              <p className="text-sm font-black text-foreground">{formatNumber(metrics.followers)}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Reproducciones</p>
              <p className="text-sm font-black text-foreground">{formatNumber(metrics.views)}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Engagement</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {formatPercent(metrics.engagement_rate)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Reputación</p>
              <p className="text-sm font-black text-primary flex items-center justify-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {typeof reputationScore === "number" ? `${reputationScore}/100` : "—"}
              </p>
            </div>
          </div>

          {/* Desglose de reputación */}
          <div className="rounded-xl border border-border bg-background/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">
                Desglose de la puntuación de reputación
              </h4>
              {reputationPercent !== null && (
                <span className="text-xs font-bold text-foreground">{reputationPercent}/100</span>
              )}
            </div>
            {breakdown.length > 0 ? (
              <ul className="space-y-2.5">
                {breakdown.map((factor) => {
                  const percent =
                    factor.max_points > 0
                      ? Math.max(0, Math.min(100, Math.round((factor.points / factor.max_points) * 100)))
                      : 0;
                  return (
                    <li key={factor.key} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-foreground font-semibold">{factor.label}</span>
                        <span className="text-muted-foreground font-mono">
                          {factor.points}/{factor.max_points}
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full rounded-full bg-muted"
                        role="progressbar"
                        aria-label={factor.label}
                        aria-valuenow={factor.points}
                        aria-valuemin={0}
                        aria-valuemax={factor.max_points}
                      >
                        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                El servidor no publica el desglose por factores de tu reputación; solo la puntuación total.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sellos */}
      <Card className="border-border bg-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Sellos del creador
          </CardTitle>
          <CardDescription className="text-xs">
            Los sellos se otorgan únicamente por los criterios publicados que se muestran en cada tarjeta. Un
            sello reconoce tu historial: <strong className="text-foreground">no concede permisos</strong> ni
            capacidades adicionales dentro de la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {bundle.seal_catalog.map((definition) => {
              const seal = bundle.seals.find((item) => item.seal_key === definition.key);
              const awardedAt = formatDate(seal?.awarded_at);
              const expiresAt = formatDate(seal?.expires_at);
              return (
                <div
                  key={definition.key}
                  className={`rounded-2xl border p-4 space-y-2 ${
                    seal ? "border-primary/30 bg-primary/5" : "border-dashed border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{definition.label}</p>
                      <p className="text-[11px] text-muted-foreground">{definition.purpose}</p>
                    </div>
                    {seal ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0">
                        Obtenido
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 text-muted-foreground">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <div className="rounded-xl bg-background/70 border border-border/60 p-2.5">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Criterios publicados
                    </p>
                    <p className="text-[11px] text-foreground/90 leading-relaxed">{definition.criteria}</p>
                  </div>
                  {seal ? (
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">Otorgado:</span>{" "}
                        {awardedAt ?? "fecha no disponible"}
                        {expiresAt ? ` · vence el ${expiresAt}` : " · sin vencimiento"}
                      </p>
                      {seal.evidence && (
                        <p>
                          <span className="font-semibold text-foreground">Evidencia:</span> {seal.evidence}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Aún no cumples los criterios publicados. Cuando los cumplas, la auditoría otorga el
                      sello automáticamente.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edición */}
      <Card className="border-border bg-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold">Editar identidad pública</CardTitle>
          <CardDescription className="text-xs">
            Categorías, idiomas, visibilidad en el directorio y biografía.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase text-muted-foreground">
                Categorías ({categories.length}/{CREATOR_CATEGORIES_MAX})
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {CREATOR_CATEGORY_OPTIONS.map((option) => {
                  const selected = categories.includes(option);
                  return (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      aria-pressed={selected}
                      onClick={() => toggleCategory(option)}
                      className="rounded-full text-[11px] h-7"
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase text-muted-foreground">Idiomas</legend>
              <div className="flex flex-wrap gap-1.5">
                {CREATOR_LANGUAGE_OPTIONS.map((option) => {
                  const selected = languages.includes(option);
                  return (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      aria-pressed={selected}
                      onClick={() => toggleLanguage(option)}
                      className="rounded-full text-[11px] h-7"
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
              <div>
                <p className="text-xs font-bold text-foreground">Perfil visible en el directorio</p>
                <p className="text-[11px] text-muted-foreground">
                  Si lo desactivas, tu ficha deja de mostrarse a hoteles y visitantes.
                </p>
              </div>
              <Switch
                checked={publicProfile}
                onCheckedChange={setPublicProfile}
                aria-label="Perfil visible en el directorio"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="creator-public-bio"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                Biografía pública
              </label>
              <Textarea
                id="creator-public-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                maxLength={CREATOR_BIO_MAX_LENGTH + 40}
                className="rounded-xl text-xs"
                placeholder="Cuenta qué tipo de contenido creas y qué destinos dominicanos cubres."
              />
              <p
                className={`text-[11px] ${
                  bio.trim().length > CREATOR_BIO_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {bio.trim().length}/{CREATOR_BIO_MAX_LENGTH} caracteres
              </p>
            </div>

            {formError && (
              <p className="text-[11px] text-destructive flex items-center gap-1.5" role="alert">
                <AlertCircle className="h-3.5 w-3.5" /> {formError}
              </p>
            )}

            <Button type="submit" disabled={saving} className="rounded-xl text-xs font-bold gap-2">
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Guardando..." : "Guardar identidad"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
