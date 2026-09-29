import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Reservas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["my-reservations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Reserva cancelada" });
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    }
  };

  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
    confirmed: { label: "Confirmada", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
    cancelled: { label: "Cancelada", color: "bg-destructive/10 text-destructive", icon: XCircle },
    completed: { label: "Completada", color: "bg-primary/10 text-primary", icon: CheckCircle },
  };

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-xl font-bold">Inicia sesión para ver tus reservas</h2>
                <p className="text-muted-foreground">Necesitas una cuenta para gestionar tus reservaciones.</p>
                <div className="flex gap-3 justify-center">
                  <Button asChild><Link to="/login">Iniciar Sesión</Link></Button>
                  <Button variant="outline" asChild><Link to="/registro">Registrarse</Link></Button>
                </div>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const active = reservations?.filter((r) => r.status === "pending" || r.status === "confirmed") || [];
  const past = reservations?.filter((r) => r.status === "cancelled" || r.status === "completed") || [];

  return (
    <PageTransition>
      <SEOHead title="Mis Reservas | DescubreRD" description="Gestiona tus reservaciones turísticas en República Dominicana" />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="font-display text-3xl font-bold mb-6">Mis Reservas</h1>

          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Activas ({active.length})</TabsTrigger>
              <TabsTrigger value="past">Historial ({past.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {isLoading && (
                <div className="space-y-4" aria-busy="true" aria-label="Cargando reservas">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <Skeleton className="md:w-48 h-32 md:h-auto" />
                        <CardContent className="flex-1 p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-40" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-4 w-56" />
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {!isLoading && active.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No tienes reservas activas</p>
                    <Button className="mt-4" asChild><Link to="/destinos">Explorar destinos</Link></Button>
                  </CardContent>
                </Card>
              )}
              {active.map((r) => {
                const sc = statusConfig[r.status || "pending"];
                return (
                  <Card key={r.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {r.item_image && (
                        <div className="md:w-48 h-32 md:h-auto">
                          <img src={r.item_image} alt={r.item_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="flex-1 p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{r.item_name}</h3>
                            <Badge variant="outline" className="text-xs">{r.item_type}</Badge>
                          </div>
                          <Badge className={sc.color}>{sc.label}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {r.check_in && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(r.check_in), "d MMM yyyy", { locale: es })}
                              {r.check_out && ` - ${format(new Date(r.check_out), "d MMM yyyy", { locale: es })}`}
                            </span>
                          )}
                          {r.guests && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{r.guests} personas</span>}
                          {r.total_price && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{r.currency} {Number(r.total_price).toLocaleString()}</span>}
                        </div>
                        {r.status === "pending" && (
                          <Button variant="destructive" size="sm" onClick={() => handleCancel(r.id)}>Cancelar</Button>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {past.length === 0 && (
                <Card><CardContent className="p-8 text-center text-muted-foreground">Sin historial de reservas</CardContent></Card>
              )}
              {past.map((r) => {
                const sc = statusConfig[r.status || "completed"];
                return (
                  <Card key={r.id} className="opacity-75">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{r.item_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {r.check_in && format(new Date(r.check_in), "d MMM yyyy", { locale: es })}
                          {" · "}{r.item_type}
                        </p>
                      </div>
                      <Badge className={sc.color}>{sc.label}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
