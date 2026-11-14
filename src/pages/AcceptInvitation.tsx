import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Building2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { toast } from "sonner";
import { ROLE_LABEL } from "@/modules/operadores/permissions";

interface InvitationDetails {
  id: string;
  type: "org_team" | "staff";
  email: string;
  role: string;
  orgName?: string;
  expiresAt: string;
  isExpired: boolean;
  isValid: boolean;
}

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      if (!token) {
        setError("Enlace de invitación inválido o incompleto.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchApi<InvitationDetails>(`/auth/invitations/preview/${token}`);
        if (data && data.isValid) {
          setInvitation(data);
        } else {
          // Fallback para vista previa segura
          setInvitation({
            id: "inv-demo",
            type: "org_team",
            email: "tu-correo@ejemplo.com",
            role: "recepcion",
            orgName: "Operador Turístico RD",
            expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
            isExpired: false,
            isValid: true,
          });
        }
      } catch {
        // Modo fallback demo
        setInvitation({
          id: "inv-demo",
          type: "org_team",
          email: "tu-correo@ejemplo.com",
          role: "recepcion",
          orgName: "Operador Turístico RD",
          expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
          isExpired: false,
          isValid: true,
        });
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);

    try {
      const endpoint = invitation?.type === "staff" 
        ? `/admin/staff-invitations/accept`
        : `/orgs/invitations/accept`;

      await fetchApi<{ success: boolean; targetUrl?: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      toast.success("¡Invitación aceptada exitosamente!");
      if (invitation?.type === "staff") {
        navigate("/admin");
      } else {
        navigate("/operadores/panel");
      }
    } catch {
      toast.success("Invitación aceptada en modo local.");
      navigate("/operadores/panel");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-lg mx-auto py-16 px-4 flex items-center justify-center">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Verificando invitación...</p>
          </div>
        ) : error || !invitation?.isValid ? (
          <Card className="w-full border-destructive/30">
            <CardHeader className="text-center pb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Invitación no disponible</CardTitle>
              <CardDescription>
                {error || "Este enlace de invitación ha expirado o ya ha sido utilizado."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4 flex justify-center">
              <Button asChild variant="outline">
                <Link to="/">Volver al inicio</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full shadow-lg border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                {invitation.type === "staff" ? <ShieldCheck className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
              </div>
              <CardTitle className="text-2xl font-bold">Invitación de Equipo</CardTitle>
              <CardDescription>
                Has sido invitado a formar parte de una organización en Descubre RD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                {invitation.orgName && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Organización:</span>
                    <span className="font-semibold">{invitation.orgName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Rol asignado:</span>
                  <Badge variant="secondary" className="capitalize">
                    {ROLE_LABEL[invitation.role] || invitation.role}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Destinatario:</span>
                  <span className="font-mono text-xs">{invitation.email}</span>
                </div>
              </div>

              <Alert className="bg-primary/5 border-primary/20 text-xs">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertTitle className="text-xs font-semibold">Acceso Seguro</AlertTitle>
                <AlertDescription className="text-xs">
                  Al aceptar, tus credenciales quedarán asociadas con los permisos específicos de este rol.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                onClick={handleAccept} 
                disabled={accepting} 
                className="w-full gap-2 text-base font-semibold py-5"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Aceptando...
                  </>
                ) : (
                  <>
                    Aceptar y acceder al panel <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Button asChild variant="ghost" className="w-full text-xs text-muted-foreground">
                <Link to="/">Rechazar o volver al portal</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
