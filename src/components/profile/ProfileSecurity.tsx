import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Laptop, Key, Bell, Trash2, LogOut, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProfileSecurityProps {
  user: any;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export function ProfileSecurity({ user }: ProfileSecurityProps) {
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: "sess_1",
      device: "Windows PC",
      browser: "Chrome 128.0",
      location: "Santo Domingo, República Dominicana",
      ip: "190.166.45.12",
      lastActive: "Ahora mismo",
      isCurrent: true,
    },
    {
      id: "sess_2",
      device: "iPhone 15 Pro",
      browser: "Safari Mobile",
      location: "Punta Cana, República Dominicana",
      ip: "186.6.120.4",
      lastActive: "Hace 2 horas",
      isCurrent: false,
    },
  ]);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    loginAlerts: true,
    bookingReminders: true,
    marketingPromos: false,
  });

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success("Sesión revocada correctamente");
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success("Se han cerrado todas las demás sesiones remotas");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Session Security Overview */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Centro de Seguridad de la Cuenta</CardTitle>
                <CardDescription>Gestiona tus sesiones activas, doble factor (MFA) y alertas de seguridad</CardDescription>
              </div>
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeAllOtherSessions}
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" /> Cerrar demás sesiones
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sesiones y Dispositivos Activos</h4>
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/70"
              >
                <div className="flex items-center gap-3">
                  {sess.device.includes("iPhone") || sess.device.includes("Mobile") ? (
                    <Smartphone className="h-5 w-5 text-primary" />
                  ) : (
                    <Laptop className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{sess.device}</span>
                      <span className="text-xs text-muted-foreground">({sess.browser})</span>
                      {sess.isCurrent && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px] gap-1 border">
                          Dispositivo actual
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sess.location} • <span className="font-mono">{sess.ip}</span> • {sess.lastActive}
                    </p>
                  </div>
                </div>
                {!sess.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    Revocar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MFA & Passwords */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500" /> Autenticación de Doble Factor (MFA)
            </CardTitle>
            <CardDescription className="text-xs">Añade una capa de protección adicional a tu cuenta de viajero</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <p className="font-medium text-sm text-foreground">Estado de MFA</p>
                <p className="text-xs text-muted-foreground">
                  {mfaEnabled ? "Protección de doble factor activa" : "Sin doble factor configurado"}
                </p>
              </div>
              <Badge variant={mfaEnabled ? "default" : "outline"} className="text-xs">
                {mfaEnabled ? "Activo" : "Desactivado"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMfaModalOpen(true)}
              className="w-full text-xs font-semibold rounded-xl"
            >
              {mfaEnabled ? "Configurar Métodos de MFA" : "Activar MFA / Llave de Seguridad"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications & Opt-in Settings */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Centro de Notificaciones y Seguridad
            </CardTitle>
            <CardDescription className="text-xs">Configura tus alertas de inicio de sesión y comunicaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <p className="font-medium text-sm text-foreground">Alertas de nuevos inicios de sesión</p>
                <p className="text-xs text-muted-foreground">Recibe avisos cuando se acceda desde un nuevo dispositivo</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNotifications((n) => ({ ...n, loginAlerts: !n.loginAlerts }));
                  toast.success("Preferencia actualizada");
                }}
                className="text-xs"
              >
                {notifications.loginAlerts ? "Activado" : "Desactivado"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA Modal */}
      <Dialog open={mfaModalOpen} onOpenChange={setMfaModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Configuración de Doble Factor (MFA)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Escanea el código QR desde tu aplicación autenticadora (Google Authenticator, Authy o 1Password).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center space-y-3">
            <div className="w-40 h-40 bg-muted/80 rounded-2xl mx-auto flex items-center justify-center border border-dashed border-primary/40">
              <span className="text-xs text-muted-foreground font-mono">Código QR Demo MFA</span>
            </div>
            <p className="text-xs text-muted-foreground">
              O ingresa la clave manual: <span className="font-mono font-bold text-foreground">DESCUBRE-RD-MFA-9921</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMfaModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                setMfaEnabled(true);
                setMfaModalOpen(false);
                toast.success("MFA activado exitosamente");
              }}
            >
              Confirmar y Activar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
