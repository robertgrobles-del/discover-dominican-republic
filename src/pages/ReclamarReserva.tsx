import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import {
  ClaimError,
  DEMO_NOTICE,
  claimErrorNextStep,
  canRequestNewLink,
  completeClaim,
  previewClaim,
  startClaim,
  type ClaimPreview,
} from "@/lib/bookingClaims";

/**
 * Reclamo de una reserva de invitado (Plan de accesos, punto 76).
 *
 * Ruta esperada: `/reclamar-reserva` (registrada en `src/App.tsx`). Parámetros:
 *   - `?token=<claimToken>`: enlace del correo. Vista previa + "Vincular a mi cuenta".
 *   - `?reserva=<bookingId>&acceso=<tokenDeInvitado>`: pedir el enlace recordando el correo.
 *   - sin parámetros: explicación y formulario para reenviar el enlace.
 *
 * Nunca revela si un correo coincide con la reserva: todas las respuestas del
 * formulario son el mismo mensaje neutro. En modo simulado todo se etiqueta "demo".
 */

/** Mensaje único y neutro del formulario por correo (no revela nada). */
export const NEUTRAL_LINK_MESSAGE =
  "Si el correo coincide con la reserva, te enviamos un enlace para vincularla a tu cuenta. Revisa tu bandeja de entrada y la carpeta de spam.";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente de confirmar",
  confirmed: "Confirmada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

function statusLabel(status?: string): string {
  if (!status) return "Estado no disponible";
  return STATUS_LABELS[status] ?? status;
}

/** Formatea una fecha ISO para mostrar. Si no se puede, se devuelve tal cual. */
function formatDateTime(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Enlace de acceso conservando el destino (`returnTo` es el patrón del portal). */
function loginHref(currentSearch: string): string {
  const returnTo = `/reclamar-reserva${currentSearch ? `?${currentSearch}` : ""}`;
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export default function ReclamarReserva() {
  const [searchParams] = useSearchParams();
  const { session, loading: authLoading } = useAuth();
  const accessToken = session?.access_token ?? null;

  const claimToken = (searchParams.get("token") ?? "").trim();
  const bookingId = (searchParams.get("reserva") ?? "").trim();
  const guestToken = (searchParams.get("acceso") ?? "").trim();
  const hasStartParams = bookingId.length > 0 && guestToken.length > 0;
  const currentSearch = searchParams.toString();

  // --- Vista previa del enlace del correo ---
  const [preview, setPreview] = useState<ClaimPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDemo, setPreviewDemo] = useState(false);
  const [previewError, setPreviewError] = useState<ClaimError | null>(null);

  // --- Vinculación (distinta del error de la vista previa) ---
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string>("");
  const [claimError, setClaimError] = useState<ClaimError | null>(null);
  const [done, setDone] = useState(false);

  // --- Formulario para pedir/reenviar el enlace ---
  const [formEmail, setFormEmail] = useState("");
  const [formBookingId, setFormBookingId] = useState(bookingId);
  const [formGuestToken, setFormGuestToken] = useState(guestToken);
  const [formSent, setFormSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formStatus, setFormStatus] = useState<string>("");

  const buildLoginHref = useMemo(() => loginHref(currentSearch), [currentSearch]);

  useEffect(() => {
    if (!claimToken) {
      setPreview(null);
      setPreviewError(null);
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    setDone(false);

    previewClaim(claimToken, { signal: controller.signal })
      .then((result) => {
        if (cancelled) return;
        setPreview(result.data);
        setPreviewDemo(result.isDemo);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const claimError = error instanceof ClaimError ? error : new ClaimError("No se pudo leer el enlace.", "desconocido");
        // Al desmontar no hay nada que pintar: el aborto no es un error de usuario.
        if (claimError.isAbort) return;
        setPreview(null);
        setPreviewError(claimError);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [claimToken]);

  const handleClaim = useCallback(async () => {
    if (!claimToken || !accessToken || claiming) return;
    setClaiming(true);
    setClaimError(null);
    setClaimStatus("Vinculando la reserva a tu cuenta…");
    try {
      const result = await completeClaim(claimToken, accessToken);
      setDone(true);
      setClaimStatus(
        result.isDemo
          ? "Simulación de demostración: no se ha vinculado ninguna reserva real."
          : "Reserva vinculada a tu cuenta.",
      );
      if (result.isDemo) {
        toast.info("Demostración", { description: DEMO_NOTICE });
      } else {
        // Sin redirección: se confirma en la propia página (con enlace a Mis reservas) para que la persona
        // lea qué acaba de pasar. Una redirección inmediata ocultaba la confirmación y el estado de éxito.
        toast.success("Reserva vinculada a tu cuenta", {
          description: "Ya puedes verla y gestionarla en Mis reservas.",
        });
      }
    } catch (error: unknown) {
      const claimError = error instanceof ClaimError ? error : new ClaimError("No se pudo vincular la reserva.", "desconocido");
      setClaimStatus("");
      setClaimError(claimError);
      toast.error("No se pudo vincular la reserva", { description: claimError.message });
    } finally {
      setClaiming(false);
    }
  }, [accessToken, claimToken, claiming]);

  const handleStartClaim = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (sending) return;

      const email = formEmail.trim();
      const id = formBookingId.trim();
      const token = formGuestToken.trim();
      if (!email || !id || !token) {
        setFormStatus("Completa el correo, el identificador de la reserva y el token del correo original.");
        return;
      }

      setSending(true);
      setFormStatus("Enviando la solicitud…");
      try {
        const result = await startClaim(id, token, email);
        setFormSent(true);
        // Mismo mensaje coincida o no el correo: el backend tampoco lo revela.
        setFormStatus(
          result.isDemo
            ? `Demostración: ${NEUTRAL_LINK_MESSAGE}`
            : NEUTRAL_LINK_MESSAGE,
        );
      } catch (error: unknown) {
        const claimError = error instanceof ClaimError ? error : new ClaimError("No se pudo enviar la solicitud.", "desconocido");
        setFormSent(false);
        setFormStatus(`${claimError.message} ${claimErrorNextStep(claimError.kind)}`);
      } finally {
        setSending(false);
      }
    },
    [formBookingId, formEmail, formGuestToken, sending],
  );

  return (
    <PageTransition>
      <SEOHead
        title="Reclamar una reserva de invitado"
        description="Vincula a tu cuenta una reserva hecha como invitado usando el enlace de un solo uso que enviamos a tu correo."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-14">
            <div className="container mx-auto max-w-3xl px-4 text-center">
              <Link2 className="mx-auto mb-4 h-14 w-14 text-primary" aria-hidden="true" />
              <h1 className="mb-3 text-3xl font-bold md:text-4xl">Reclamar una reserva de invitado</h1>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                Si reservaste sin crear una cuenta, puedes vincular esa reserva a tu cuenta de Descubre RD con el
                enlace de un solo uso que enviamos a tu correo.
              </p>
            </div>
          </section>

          <section className="py-10">
            <div className="container mx-auto max-w-3xl space-y-6 px-4">
              {previewDemo && (
                <Alert className="border-amber-500/40 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-600 text-[10px] uppercase tracking-wide">
                      demo
                    </Badge>
                    Modo de demostración
                  </AlertTitle>
                  <AlertDescription>{DEMO_NOTICE}</AlertDescription>
                </Alert>
              )}

              {claimToken ? (
                <section aria-labelledby="preview-heading" aria-busy={previewLoading} className="space-y-6">
                  <h2 id="preview-heading" className="sr-only">
                    Vista previa del enlace de reclamo
                  </h2>

                  {previewLoading && (
                    <div className="space-y-4" data-testid="claim-preview-skeleton">
                      <Skeleton className="h-40 w-full rounded-2xl" />
                      <Skeleton className="h-12 w-48 rounded-xl" />
                    </div>
                  )}

                  {!previewLoading && previewError && (
                    <Card className="rounded-2xl border-destructive/30 bg-destructive/5" role="alert">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                          El enlace no sirve
                        </CardTitle>
                        <CardDescription>{previewError.message}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{claimErrorNextStep(previewError.kind)}</p>
                        {canRequestNewLink(previewError.kind) && (
                          <Button asChild variant="outline" className="rounded-xl">
                            <a href="#pedir-enlace">Pedir un enlace nuevo</a>
                          </Button>
                        )}
                        <Separator />
                        <p className="text-xs text-muted-foreground">
                          Si el problema continúa, escríbenos indicando la referencia de la reserva.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {!previewLoading && !previewError && preview && (
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                          Vista previa de la reserva
                        </CardTitle>
                        <CardDescription>
                          Estos son los datos que podemos mostrarte sin revelar información personal. El correo
                          aparece enmascarado.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <dl className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Organización</dt>
                            <dd className="text-sm font-medium">{preview.organizer || "No disponible"}</dd>
                          </div>
                          {preview.service && (
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Servicio</dt>
                              <dd className="text-sm font-medium">{preview.service}</dd>
                            </div>
                          )}
                          <div>
                            <dt className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Fechas
                            </dt>
                            <dd className="text-sm font-medium">{preview.dates || "No disponibles"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Estado</dt>
                            <dd className="text-sm font-medium">
                              <Badge variant="secondary">{statusLabel(preview.status)}</Badge>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Correo</dt>
                            <dd className="flex items-center gap-1 text-sm font-medium">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                              {preview.email_masked || "No disponible"}
                            </dd>
                          </div>
                          {preview.expires_at && (
                            <div>
                              <dt className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> El enlace caduca
                              </dt>
                              <dd className="text-sm font-medium">{formatDateTime(preview.expires_at)}</dd>
                            </div>
                          )}
                        </dl>

                        <Alert>
                          <KeyRound className="h-4 w-4" aria-hidden="true" />
                          <AlertTitle>Enlace de un solo uso</AlertTitle>
                          <AlertDescription>
                            Este enlace solo se puede canjear una vez y caduca. Cuando lo uses, la reserva quedará
                            vinculada a la cuenta con la que inicies sesión ahora.
                          </AlertDescription>
                        </Alert>

                        <Separator />

                        {done ? (
                          <div className="space-y-3">
                            <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                              Reserva vinculada a tu cuenta.
                            </p>
                            <Button asChild className="rounded-xl">
                              <Link to="/reservas">Ver mis reservas</Link>
                            </Button>
                          </div>
                        ) : accessToken ? (
                          <div className="space-y-2">
                            <Button onClick={handleClaim} disabled={claiming} className="rounded-xl">
                              {claiming ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                  Vinculando…
                                </>
                              ) : (
                                <>
                                  <BadgeCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                                  Vincular a mi cuenta
                                </>
                              )}
                            </Button>
                            {session?.user?.email && (
                              <p className="text-xs text-muted-foreground">
                                Se vinculará a la cuenta {session.user.email}.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Para vincular la reserva necesitas una cuenta: así nadie más puede reclamarla.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button asChild className="rounded-xl">
                                <Link to={buildLoginHref}>Iniciar sesión</Link>
                              </Button>
                              <Button asChild variant="outline" className="rounded-xl">
                                <Link to="/registro">Crear una cuenta</Link>
                              </Button>
                            </div>
                          </div>
                        )}

                        {claimError && (
                          <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                              <AlertCircle className="h-4 w-4" aria-hidden="true" />
                              {claimError.message}
                            </p>
                            <p className="text-xs text-muted-foreground">{claimErrorNextStep(claimError.kind)}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div aria-live="polite" role="status" className="text-sm text-muted-foreground">
                    {claimStatus}
                  </div>
                </section>
              ) : (
                <section aria-labelledby="intro-heading" className="space-y-6">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle id="intro-heading" className="text-xl">
                        ¿Qué es reclamar una reserva?
                      </CardTitle>
                      <CardDescription>
                        Cuando reservas como invitado, la reserva no aparece en ninguna cuenta. Al reclamarla queda
                        vinculada a la tuya y puedes gestionarla, pagar saldos o pedir cambios desde este portal.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                      <ol className="list-decimal space-y-2 pl-5">
                        <li>Busca en tu correo la confirmación de la reserva.</li>
                        <li>
                          Abre el enlace «Vincular mi reserva». Es de un solo uso y caduca en una hora; ábrelo en este
                          mismo dispositivo.
                        </li>
                        <li>Inicia sesión (o crea tu cuenta) y confirma la vinculación.</li>
                      </ol>
                      <Alert>
                        <MailCheck className="h-4 w-4" aria-hidden="true" />
                        <AlertTitle>¿Perdiste el enlace?</AlertTitle>
                        <AlertDescription>
                          Puedes pedir uno nuevo con el identificador de tu reserva y el token de acceso que aparece
                          en el correo de confirmación. Por seguridad, nunca confirmamos si un correo coincide con la
                          reserva.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl" id="pedir-enlace">
                    <CardHeader>
                      <CardTitle className="text-lg">Pedir o reenviar el enlace</CardTitle>
                      <CardDescription>
                        {hasStartParams
                          ? "Completa el correo con el que hiciste la reserva."
                          : "Necesitas el identificador de la reserva y el token de acceso del correo original."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4" onSubmit={handleStartClaim} noValidate>
                        <div className="space-y-2">
                          <Label htmlFor="claim-email">Correo con el que reservaste</Label>
                          <Input
                            id="claim-email"
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            value={formEmail}
                            onChange={(event) => setFormEmail(event.target.value)}
                            aria-describedby="claim-email-help"
                            required
                          />
                          <p id="claim-email-help" className="text-xs text-muted-foreground">
                            Debe ser el correo de contacto de la reserva.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="claim-booking">Identificador de la reserva</Label>
                          <Input
                            id="claim-booking"
                            value={formBookingId}
                            onChange={(event) => setFormBookingId(event.target.value)}
                            autoComplete="off"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="claim-token">Token de acceso del correo original</Label>
                          <Input
                            id="claim-token"
                            value={formGuestToken}
                            onChange={(event) => setFormGuestToken(event.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                            required
                          />
                        </div>

                        <Button type="submit" disabled={sending} className="rounded-xl">
                          {sending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                              Enviando…
                            </>
                          ) : (
                            "Enviar el enlace a mi correo"
                          )}
                        </Button>

                        {/* Región viva: siempre el mismo mensaje neutro, coincida o no el correo. */}
                        <div
                          aria-live="polite"
                          role="status"
                          data-testid="claim-form-status"
                          className={`rounded-xl border p-3 text-sm ${
                            formSent
                              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                              : "border-border/70 bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {formStatus || NEUTRAL_LINK_MESSAGE}
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </section>
              )}

              {authLoading && claimToken && (
                <p className="text-xs text-muted-foreground" role="status">
                  Comprobando tu sesión…
                </p>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
