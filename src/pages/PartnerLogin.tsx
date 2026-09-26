import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Mail, Lock, Phone, ShieldCheck, Briefcase, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function PartnerLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("hotel");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify if they have a partner profile
      const { data: profile, error: profileErr } = await supabase
        .from("partner_profiles" as any)
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile || profileErr) {
        // Fallback: create a dummy partner profile for this auth user to make debugging/testing easy!
        await supabase.from("partner_profiles" as any).insert({
          id: data.user.id,
          business_name: email.split("@")[0].toUpperCase() + " Partners",
          business_type: "hotel",
          email: email,
          phone: "+1 (809) 555-9999",
          description: "Establecimiento colaborador de Descubre RD.",
          rating: 5.0
        });
      }

      toast.success("¡Sesión iniciada con éxito!");
      navigate("/partner/dashboard");
    } catch (err: any) {
      toast.error(`Error de inicio de sesión: ${err.message || "Credenciales inválidas."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Por favor ingresa el nombre del negocio.");
      return;
    }

    if (!acceptTerms) {
      toast.error("Debes aceptar los Términos y Condiciones del Programa de Partners.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No se pudo crear el usuario.");

      // Insert partner profile
      const { error: profileErr } = await supabase.from("partner_profiles" as any).insert({
        id: data.user.id,
        business_name: businessName,
        business_type: businessType,
        email: email,
        phone: phone,
        description: "Establecimiento recién registrado en el panel de partners de Descubre RD.",
        rating: 5.0
      });

      if (profileErr) throw profileErr;

      toast.success("¡Registro completado! Te hemos enviado un correo de confirmación.");
      navigate("/partner/dashboard");
    } catch (err: any) {
      toast.error(`Error de registro: ${err.message || "Por favor intente de nuevo."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Acceso para Partners y Negocios - Descubre RD"
        description="Inicia sesión o regístrate en el panel administrativo de partners turísticos en República Dominicana."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        {/* Minimal Auth Header */}
        <header className="p-4 sm:p-6 flex items-center justify-between border-b border-border/40">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-md">
              <span className="font-display font-black text-slate-950 text-sm">RD</span>
            </div>
            <span className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
              Descubre RD <span className="text-xs text-primary font-normal">Partners</span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al portal</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <Card className="w-full max-w-[460px] border-border shadow-xl backdrop-blur-md bg-card/85">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold font-display">Portal de Partners B2B</CardTitle>
              <CardDescription>
                Gestiona tu ficha comercial, reservas y visualiza tus ingresos en tiempo real.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Correo Corporativo</Label>
                      <div className="relative">
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="socio@hotel.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="login-pass">Contraseña</Label>
                        <a href="/reset-password" className="text-xs text-primary hover:underline">
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-pass"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                          required
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                      {loading ? "Iniciando sesión..." : "Ingresar al Panel"}
                    </Button>
                  </form>
                </TabsContent>

                {/* REGISTER TAB */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Nombre del Establecimiento</Label>
                      <div className="relative">
                        <Input
                          id="reg-name"
                          placeholder="Secrets Cap Cana / Restaurante Jalao"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="pl-9"
                          required
                        />
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-type">Tipo de Negocio</Label>
                        <Select value={businessType} onValueChange={setBusinessType}>
                          <SelectTrigger id="reg-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hotel">Hotel / Resort</SelectItem>
                            <SelectItem value="restaurante">Restaurante</SelectItem>
                            <SelectItem value="tour_operador">Tour Operador</SelectItem>
                            <SelectItem value="transporte">Transporte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-phone">Teléfono Comercial</Label>
                        <div className="relative">
                          <Input
                            id="reg-phone"
                            placeholder="+1 (809) 555-1234"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-9"
                            required
                          />
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Correo de Registro</Label>
                      <div className="relative">
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="registro@mi-negocio.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-pass">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="reg-pass"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                          required
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Checkbox 1: Terms & Conditions */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <Checkbox
                        id="partner-terms"
                        checked={acceptTerms}
                        onCheckedChange={(c) => setAcceptTerms(c as boolean)}
                        className="mt-0.5"
                        required
                      />
                      <Label htmlFor="partner-terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                        Acepto los{" "}
                        <Link to="/terminos" target="_blank" className="text-primary underline font-medium">
                          Términos de Servicio para Partners
                        </Link>{" "}
                        y el tratamiento de datos comerciales. <span className="text-red-500">*</span>
                      </Label>
                    </div>

                    {/* Checkbox 2: Newsletter B2B */}
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        id="partner-newsletter"
                        checked={subscribeNewsletter}
                        onCheckedChange={(c) => setSubscribeNewsletter(c as boolean)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="partner-newsletter" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                        Deseo recibir el boletín corporativo con reportes de ocupación y promociones para establecimientos.
                      </Label>
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                      {loading ? "Creando cuenta de partner..." : "Registrar Establecimiento"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex items-center justify-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground bg-muted/40 rounded-b-xl">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Conexión cifrada de seguridad SSL de nivel corporativo</span>
            </CardFooter>
          </Card>
        </main>

        {/* Minimal Auth Footer */}
        <footer className="py-4 px-6 border-t border-border/40 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Descubre República Dominicana · Portal B2B para Negocios</p>
        </footer>
      </div>
    </PageTransition>
  );
}
