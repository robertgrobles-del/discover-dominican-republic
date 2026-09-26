import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery token in the URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast({
        variant: "destructive",
        title: "Enlace inválido",
        description: "Este enlace no es válido para restablecer contraseña.",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Las contraseñas no coinciden." });
      return;
    }
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setSuccess(true);
      toast({ title: "¡Contraseña actualizada!", description: "Ya puedes iniciar sesión con tu nueva contraseña." });
      setTimeout(() => navigate("/"), 2000);
    }
    setIsLoading(false);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Restablecer Contraseña"
        description="Crea una nueva contraseña para tu cuenta de Descubre RD y recupera el acceso de forma segura."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        {/* Minimal Auth Header */}
        <header className="p-4 sm:p-6 flex items-center justify-between border-b border-border/40">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-md">
              <span className="font-display font-black text-slate-950 text-sm">RD</span>
            </div>
            <span className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
              Descubre RD
            </span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a iniciar sesión</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4">
          <Card className="w-full max-w-md border-border shadow-lg">
            <CardContent className="p-8">
              {success ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                  <h1 className="font-display text-2xl font-bold">¡Contraseña actualizada!</h1>
                  <p className="text-muted-foreground">Redirigiendo...</p>
                </div>
              ) : (
                <>
                  <div className="mb-8 text-center">
                    <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                      Nueva Contraseña
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nueva contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Actualizando...</>
                      ) : (
                        "Restablecer Contraseña"
                      )}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Minimal Auth Footer */}
        <footer className="py-4 px-6 border-t border-border/40 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Descubre República Dominicana · Todos los derechos reservados</p>
        </footer>
      </div>
    </PageTransition>
  );
}
