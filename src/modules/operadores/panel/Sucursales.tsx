import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Building, Phone, Mail, Clock, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useOrg } from "./OrgContext";

export interface BranchLocation {
  id: string;
  name: string;
  address: string;
  province: string;
  phone: string;
  email: string;
  hours: string;
  isMain: boolean;
}

export default function Sucursales() {
  const { org } = useOrg();
  const [branches, setBranches] = useState<BranchLocation[]>([
    {
      id: "br_main",
      name: `Sede Principal - ${org.business_name}`,
      address: "Av. Winston Churchill 101, Piantini",
      province: org.province || "Santo Domingo",
      phone: org.phone || "+1 (809) 555-0100",
      email: org.email || "contacto@empresa.com",
      hours: "Lun - Sab: 8:00 AM - 6:00 PM",
      isMain: true,
    },
    {
      id: "br_2",
      name: "Sucursal Bávaro - Punta Cana",
      address: "Plaza Turística Bávaro, Local 14",
      province: "La Altagracia (Punta Cana)",
      phone: "+1 (809) 555-0240",
      email: "bavaro@empresa.com",
      hours: "Lun - Dom: 7:00 AM - 8:00 PM",
      isMain: false,
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    address: "",
    province: "",
    phone: "",
    email: "",
    hours: "Lun - Sab: 8:00 AM - 5:00 PM",
  });

  const [isAdding, setIsAdding] = useState(false);

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) {
      toast.error("Por favor completa el nombre y dirección de la sucursal");
      return;
    }

    const newBranch: BranchLocation = {
      id: `br_${Date.now()}`,
      name: form.name.trim(),
      address: form.address.trim(),
      province: form.province || "Santo Domingo",
      phone: form.phone || org.phone || "",
      email: form.email || org.email || "",
      hours: form.hours,
      isMain: false,
    };

    setBranches((prev) => [...prev, newBranch]);
    setForm({ name: "", address: "", province: "", phone: "", email: "", hours: "Lun - Sab: 8:00 AM - 5:00 PM" });
    setIsAdding(false);
    toast.success(`Sucursal "${newBranch.name}" registrada exitosamente`);
  };

  const handleDeleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    toast.success("Sucursal eliminada");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Sucursales y Ubicaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona las oficinas físicas, puntos de encuentro y ubicaciones operativas de tu empresa.
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2 text-xs font-semibold rounded-xl">
            <Plus className="h-4 w-4" /> Agregar Sucursal
          </Button>
        )}
      </div>

      {/* Form modal/card */}
      {isAdding && (
        <Card className="border border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Registrar Nueva Sucursal / Punto Operativo
            </CardTitle>
            <CardDescription className="text-xs">
              Asigna miembros del equipo (recepción/guías) a ubicaciones específicas en la sección de Equipo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBranch} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="br-name" className="text-xs font-medium">Nombre de la Sucursal</Label>
                  <Input
                    id="br-name"
                    placeholder="Ej. Oficina Aeropuerto POP"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="br-prov" className="text-xs font-medium">Provincia / Zona</Label>
                  <Input
                    id="br-prov"
                    placeholder="Ej. Puerto Plata"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="br-addr" className="text-xs font-medium">Dirección Física Completa</Label>
                  <Input
                    id="br-addr"
                    placeholder="Calle, número, plaza o punto de referencia"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="br-phone" className="text-xs font-medium">Teléfono / Celular</Label>
                  <Input
                    id="br-phone"
                    placeholder="+1 (809) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="br-hours" className="text-xs font-medium">Horario de Operación</Label>
                  <Input
                    id="br-hours"
                    placeholder="Lun - Sab: 8:00 AM - 5:00 PM"
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Guardar Sucursal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List of branches */}
      <div className="grid md:grid-cols-2 gap-4">
        {branches.map((b) => (
          <Card key={b.id} className="border border-border/80 bg-card hover:border-primary/30 transition-all">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-foreground">{b.name}</h3>
                    {b.isMain && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] gap-1">
                        Sede Principal
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {b.province}
                  </p>
                </div>
                {!b.isMain && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBranch(b.id)}
                    className="text-destructive h-7 w-7"
                    title="Eliminar sucursal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <p className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" /> {b.address}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {b.phone}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {b.hours}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
