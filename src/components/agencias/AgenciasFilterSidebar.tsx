import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AgenciasFilterSidebarProps {
  typeFilter: string[];
  onTypeToggle: (type: string, checked: boolean) => void;
  regionFilter: string;
  onRegionChange: (val: string) => void;
  onlyVerified: boolean;
  onOnlyVerifiedChange: (val: boolean) => void;
  onReset: () => void;
}

export function AgenciasFilterSidebar({
  typeFilter,
  onTypeToggle,
  regionFilter,
  onRegionChange,
  onlyVerified,
  onOnlyVerifiedChange,
  onReset,
}: AgenciasFilterSidebarProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-foreground">Filtros</h3>
        <Button variant="link" className="text-primary text-sm p-0" onClick={onReset}>
          Limpiar
        </Button>
      </div>

      {/* Type Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Tipo de Empresa</h4>
        <div className="space-y-3">
          {["Tour Operador", "Agencias de Viajes", "Ecoturismo", "Cultural", "Transporte Turístico"].map(
            (type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={typeFilter.includes(type)}
                  onCheckedChange={(checked) => onTypeToggle(type, !!checked)}
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {type}
                </label>
              </div>
            )
          )}
        </div>
      </div>

      {/* Region Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Región</h4>
        <Select value={regionFilter} onValueChange={onRegionChange}>
          <SelectTrigger className="bg-surface">
            <SelectValue placeholder="Todas las regiones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las regiones</SelectItem>
            <SelectItem value="punta cana">Zona Este (Punta Cana)</SelectItem>
            <SelectItem value="santiago">Zona Norte (Cibao)</SelectItem>
            <SelectItem value="barahona">Zona Sur</SelectItem>
            <SelectItem value="santo domingo">Santo Domingo</SelectItem>
            <SelectItem value="samaná">Samaná</SelectItem>
            <SelectItem value="puerto plata">Puerto Plata</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Verified Only */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Estado</h4>
        <div className="flex items-center gap-2">
          <Switch checked={onlyVerified} onCheckedChange={onOnlyVerifiedChange} />
          <span className="text-sm text-muted-foreground">Solo Verificados</span>
        </div>
      </div>

      {/* Marketing Kit CTA */}
      <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
        <h4 className="font-display font-bold text-foreground mb-2">Kit de Marketing 2026</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Descarga fotos y logos oficiales para tus promociones.
        </p>
        <Button className="w-full">Acceder al Portal B2B</Button>
      </div>
    </div>
  );
}
