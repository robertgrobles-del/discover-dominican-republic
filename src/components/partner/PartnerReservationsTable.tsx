import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { ReservationItem } from "@/data/partnerDashboardData";

interface PartnerReservationsTableProps {
  reservations: ReservationItem[];
  onUpdateStatus: (id: string, newStatus: string) => void;
}

export function PartnerReservationsTable({
  reservations,
  onUpdateStatus
}: PartnerReservationsTableProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Registro de Reservas</CardTitle>
        <CardDescription>Monitorea y cambia el estado de las compras/reservas asociadas a tu servicio.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm text-left text-muted-foreground border-collapse">
          <thead>
            <tr className="border-b border-border text-foreground text-xs uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Reserva ID</th>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Check-In</th>
              <th className="py-3 px-4">Check-Out</th>
              <th className="py-3 px-4">Monto</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="py-4 px-4 font-mono font-bold text-foreground">{res.id}</td>
                <td className="py-4 px-4">
                  <div className="font-semibold text-foreground">{res.guestName}</div>
                  <div className="text-xs text-muted-foreground">{res.email}</div>
                </td>
                <td className="py-4 px-4">{res.checkIn}</td>
                <td className="py-4 px-4">{res.checkOut}</td>
                <td className="py-4 px-4 font-bold text-foreground">${res.amount} USD</td>
                <td className="py-4 px-4">
                  <Badge
                    variant={
                      res.status === "paid"
                        ? "secondary"
                        : res.status === "pending"
                        ? "outline"
                        : "destructive"
                    }
                    className={
                      res.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : res.status === "pending"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : ""
                    }
                  >
                    {res.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-4 px-4 flex justify-center gap-2">
                  {res.status === "pending" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      onClick={() => onUpdateStatus(res.id, "paid")}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Aprobar
                    </Button>
                  )}
                  {res.status === "paid" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-500/20 hover:bg-red-500/10 gap-1"
                      onClick={() => onUpdateStatus(res.id, "refunded")}
                    >
                      <XCircle className="h-3 w-3" /> Reembolsar
                    </Button>
                  )}
                  {res.status !== "cancelled" && res.status !== "refunded" && res.status !== "paid" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-500/10 gap-1"
                      onClick={() => onUpdateStatus(res.id, "cancelled")}
                    >
                      <XCircle className="h-3 w-3" /> Cancelar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
