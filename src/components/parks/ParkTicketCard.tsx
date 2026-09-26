import { Users, Baby, Accessibility, Ticket, Heart, Phone, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ParqueItem } from "@/data/parquesData";

interface ParkTicketCardProps {
  parque: ParqueItem;
}

export function ParkTicketCard({ parque }: ParkTicketCardProps) {
  return (
    <div className="sticky top-24 space-y-6">
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <div className="bg-primary/5 p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Entradas y Tarifas</span>
          </div>
          <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
            Tarifa Oficial
          </span>
        </div>

        <CardContent className="p-6 space-y-5">
          <div className="flex items-baseline justify-between pb-2 border-b border-border/40">
            <div>
              <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">Desde</span>
              <span className="text-3xl font-extrabold text-foreground">${parque.precioNino || parque.precioAdulto}</span>
              <span className="text-xs text-muted-foreground ml-1">USD / persona</span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Acceso seguro
              </span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-xs font-semibold uppercase">Categoría</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase">Tarifa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/40">
                <TableCell className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  Adulto (13+)
                </TableCell>
                <TableCell className="text-right font-bold text-primary text-base">
                  ${parque.precioAdulto} <span className="text-xs font-normal text-muted-foreground">USD</span>
                </TableCell>
              </TableRow>
              <TableRow className="border-border/40">
                <TableCell className="flex items-center gap-2 font-medium">
                  <Baby className="h-4 w-4 text-emerald-600" />
                  Niño (4-12)
                </TableCell>
                <TableCell className="text-right font-bold text-base">
                  ${parque.precioNino} <span className="text-xs font-normal text-muted-foreground">USD</span>
                </TableCell>
              </TableRow>
              {parque.precioSenior && (
                <TableRow className="border-border/40">
                  <TableCell className="flex items-center gap-2 font-medium">
                    <Accessibility className="h-4 w-4 text-amber-600" />
                    Senior (65+)
                  </TableCell>
                  <TableCell className="text-right font-bold text-base">
                    ${parque.precioSenior} <span className="text-xs font-normal text-muted-foreground">USD</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="space-y-3 pt-2">
            <Button className="w-full gap-2 font-semibold shadow-md" size="lg" asChild>
              <a href={parque.website} target="_blank" rel="noopener noreferrer">
                <Ticket className="h-5 w-5" />
                Comprar / Reservar en Sitio Oficial
              </a>
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Heart className="h-4 w-4" />
              Guardar en Mi Itinerario
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            *Precios e impuestos sujetos a cambios por el parque.
          </p>
        </CardContent>
      </Card>

      {/* Support / agency card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            ¿Necesitas asistencia o traslados?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <a href={`tel:${parque.telefono}`}>
              <Phone className="h-4 w-4 text-primary" />
              {parque.telefono}
            </a>
          </Button>
          <Link to="/directorio-agencias">
            <Button variant="ghost" className="w-full justify-start gap-2 text-primary hover:text-primary">
              <Users className="h-4 w-4" />
              Ver agencias de excursiones
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
