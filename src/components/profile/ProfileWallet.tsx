import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Compass, Wifi, Coins, QrCode, Ticket, CreditCard } from "lucide-react";

interface ProfileWalletProps {
  profile: { display_name: string | null };
  rdPassBalance: number;
  setRdPassBalance: React.Dispatch<React.SetStateAction<number>>;
  setIsRechargeModalOpen: (open: boolean) => void;
  setSelectedTicket: (ticket: { title: string; qrValue: string; type: string } | null) => void;
}

export function ProfileWallet({
  profile,
  rdPassBalance,
  setRdPassBalance,
  setIsRechargeModalOpen,
  setSelectedTicket,
}: ProfileWalletProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mi Billetera Digital</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Visualiza y gestiona tu tarjeta turística prepago RD Pass, tus eSIMs móviles y tus boletos comprados para eventos.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Col 1 & 2: RD Pass y eSIM */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* RD Pass Premium Card Container */}
          <Card className="border border-amber-500/20 bg-gradient-to-br from-amber-600/90 via-amber-700/80 to-amber-950/90 text-white relative overflow-hidden shadow-2xl rounded-3xl">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Compass className="h-64 w-64 text-white" />
            </div>
            
            <CardContent className="p-6 md:p-8 space-y-6 relative z-10">
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-mono text-[9px] uppercase tracking-wider">
                    RD Pass Prepago
                  </Badge>
                  <h3 className="text-xs text-white/70 font-semibold tracking-widest uppercase mt-2">Descubre República Dominicana</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-white/80 rotate-90" />
                  <div className="h-8 w-12 bg-white/10 rounded-md border border-white/20 flex items-center justify-center font-bold text-sm tracking-tighter">
                    RD
                  </div>
                </div>
              </div>

              {/* Card Chip & Balance */}
              <div className="flex justify-between items-end pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/60 uppercase tracking-wider">Balance Disponible</p>
                  <h2 className="text-3xl md:text-4xl font-mono font-extrabold text-white">
                    RD$ {rdPassBalance.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="text-xs text-white/70 font-mono">
                    ≈ USD ${(rdPassBalance / 59.0).toFixed(2)}
                  </p>
                </div>
                
                {/* Simulated Gold Chip */}
                <div className="w-10 h-8 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-md border border-amber-600 shadow-inner flex flex-col justify-between p-1.5 opacity-90">
                  <div className="w-full h-0.5 bg-amber-700/30" />
                  <div className="w-full h-0.5 bg-amber-700/30" />
                  <div className="w-full h-0.5 bg-amber-700/30" />
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end pt-4 border-t border-white/10">
                <div>
                  <p className="text-[8px] text-white/50 uppercase tracking-widest">Titular</p>
                  <p className="text-sm font-semibold tracking-wide">{profile.display_name || "Turista Invitado"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-white/50 uppercase tracking-widest">Número de Cuenta</p>
                  <p className="text-sm font-mono tracking-widest">•••• •••• •••• 8290</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Recharge Balance Actions */}
          <Card className="border bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-amber-500" /> Recargar Saldo RD Pass
              </CardTitle>
              <CardDescription className="text-xs">
                Añade saldo instantáneo a tu tarjeta prepagada para usar en comercios turísticos aliados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="border-amber-500/20 text-amber-500 hover:bg-amber-500/5 text-xs font-bold"
                  onClick={() => {
                    setRdPassBalance(prev => prev + 500);
                    toast.success("¡Recarga de RD$ 500.00 completada con éxito!");
                  }}
                >
                  + RD$ 500
                </Button>
                <Button 
                  variant="outline" 
                  className="border-amber-500/20 text-amber-500 hover:bg-amber-500/5 text-xs font-bold"
                  onClick={() => {
                    setRdPassBalance(prev => prev + 1000);
                    toast.success("¡Recarga de RD$ 1,000.00 completada con éxito!");
                  }}
                >
                  + RD$ 1,000
                </Button>
                <Button 
                  variant="outline" 
                  className="border-amber-500/20 text-amber-500 hover:bg-amber-500/5 text-xs font-bold"
                  onClick={() => {
                    setRdPassBalance(prev => prev + 2000);
                    toast.success("¡Recarga de RD$ 2,000.00 completada con éxito!");
                  }}
                >
                  + RD$ 2,000
                </Button>
              </div>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                onClick={() => setIsRechargeModalOpen(true)}
              >
                Recarga Personalizada
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions list */}
          <Card className="border bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Historial de Transacciones Recientes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                <div className="p-4 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-foreground">Texaco - Combustible</p>
                    <p className="text-[10px] text-muted-foreground">Hace 2 horas • Bayahíbe, RD</p>
                  </div>
                  <span className="font-mono font-bold text-red-500">- RD$ 800.00</span>
                </div>
                <div className="p-4 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-foreground">eSIM Turista - Descubre RD</p>
                    <p className="text-[10px] text-muted-foreground">Hace 1 día • Tienda App</p>
                  </div>
                  <span className="font-mono font-bold text-red-500">- RD$ 450.00</span>
                </div>
                <div className="p-4 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-foreground">Bono Cashback - Reserva de Hotel</p>
                    <p className="text-[10px] text-muted-foreground">Hace 2 días • Recompensa</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-500">+ RD$ 250.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Col 3: eSIM y Boletos QR */}
        <div className="space-y-6">
          
          {/* eSIM Card details */}
          <Card className="border bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Wifi className="h-4 w-4 text-emerald-500" /> Mi eSIM Activa
              </CardTitle>
              <CardDescription className="text-xs">Perfil eSIM de Internet Celular Prepago.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/40 p-4 rounded-xl border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Operadora:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px]">Claro RD LTE</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-sans">Estado:</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> CONECTADO
                  </span>
                </div>
                
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Datos Consumidos:</span>
                    <span className="font-bold text-foreground">2.4 GB / 10 GB</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[24%]" />
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full text-xs font-bold gap-1.5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5"
                onClick={() => setSelectedTicket({
                  title: "eSIM Claro Dominicana",
                  type: "eSIM Móvil Turista",
                  qrValue: "LPA:1$RSP.CLARO.DO$DESCUBRERDESIMPROMO2026"
                })}
              >
                <QrCode className="h-3.5 w-3.5" /> Mostrar QR de Activación
              </Button>
            </CardContent>
          </Card>

          {/* Boletos & Eventos QR List */}
          <Card className="border bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Ticket className="h-4 w-4 text-primary" /> Mis Boletos y Reservas
              </CardTitle>
              <CardDescription className="text-xs">Muestra estos códigos QR en las entradas de los recintos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Ticket 1: LIDOM */}
              <div className="p-3 bg-muted/30 border border-border/80 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] uppercase">
                      Béisbol Invernal LIDOM
                    </Badge>
                    <h4 className="font-bold text-xs text-foreground mt-1.5">Licey vs. Águilas Cibaeñas</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Estadio Quisqueya • Sto Dgo, RD</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/60 pt-2">
                  <span>Preferencia C • Fila 4, As. 12</span>
                  <span>Hoy, 19:30</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full text-[11px] font-bold gap-1.5 h-8"
                  onClick={() => setSelectedTicket({
                    title: "Licey vs. Águilas (LIDOM)",
                    type: "Boleto de Entrada Estadio",
                    qrValue: "TICKET-LIDOM-LIC-AGU-2026-PREF-C4-12"
                  })}
                >
                  <QrCode className="h-3.5 w-3.5" /> Ver QR de Entrada
                </Button>
              </div>

              {/* Ticket 2: Tour */}
              <div className="p-3 bg-muted/30 border border-border/80 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] uppercase">
                      Excursión Certificada
                    </Badge>
                    <h4 className="font-bold text-xs text-foreground mt-1.5">Tour Express - Cayo Arena</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Operado por Runners Adventures</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/60 pt-2">
                  <span>Punto: Muelle Punta Rucia</span>
                  <span>Mañana, 08:00 AM</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full text-[11px] font-bold gap-1.5 h-8"
                  onClick={() => setSelectedTicket({
                    title: "Tour Express Cayo Arena",
                    type: "Voucher de Excursión",
                    qrValue: "VOUCHER-RUNNERS-CAYO-ARENA-29302-2026"
                  })}
                >
                  <QrCode className="h-3.5 w-3.5" /> Ver QR de Voucher
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
