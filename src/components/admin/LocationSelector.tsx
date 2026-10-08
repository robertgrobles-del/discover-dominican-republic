import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DOMINICAN_PROVINCES, 
  getMunicipalitiesByProvince, 
  getDestinationsByProvince 
} from '@/data/dominicanTerritory';
import { MapPin, Globe2 } from 'lucide-react';

export interface LocationValue {
  provinceId?: string;
  provinceName?: string;
  municipalityId?: string;
  destinationId?: string;
  destinationName?: string;
  isProvinceWide?: boolean;
}

interface LocationSelectorProps {
  value: LocationValue;
  onChange: (val: LocationValue) => void;
  allowProvinceWide?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
}

export function LocationSelector({
  value,
  onChange,
  allowProvinceWide = true,
  required = false,
  label = "Ubicación Geográfica",
  helperText = "Define la provincia y el municipio o polo turístico donde se encuentra o realiza."
}: LocationSelectorProps) {
  const selectedProvince = value.provinceId || '';
  const selectedMunicipality = value.municipalityId || '';
  const selectedDestination = value.destinationId || '';
  const isProvinceWide = !!value.isProvinceWide;

  // Municipios de la provincia seleccionada
  const availableMunicipalities = useMemo(() => {
    if (!selectedProvince) return [];
    return getMunicipalitiesByProvince(selectedProvince);
  }, [selectedProvince]);

  // Destinos / Polos turísticos de la provincia seleccionada
  const availableDestinations = useMemo(() => {
    if (!selectedProvince) return [];
    return getDestinationsByProvince(selectedProvince);
  }, [selectedProvince]);

  const handleProvinceChange = (newProvinceId: string) => {
    const prov = DOMINICAN_PROVINCES.find((p) => p.id === newProvinceId);
    onChange({
      ...value,
      provinceId: newProvinceId,
      provinceName: prov?.name || '',
      municipalityId: undefined,
      destinationId: undefined,
      destinationName: undefined,
    });
  };

  const handleMunicipalityChange = (newMuniId: string) => {
    const muni = availableMunicipalities.find((m) => m.id === newMuniId);
    onChange({
      ...value,
      municipalityId: newMuniId,
      // Si no hay un destino turístico específico elegido, podemos enlazarlo al municipio
      destinationId: value.destinationId || newMuniId,
      destinationName: value.destinationName || muni?.name,
    });
  };

  const handleDestinationChange = (newDestId: string) => {
    const dest = availableDestinations.find((d) => d.id === newDestId);
    onChange({
      ...value,
      destinationId: newDestId,
      destinationName: dest?.name || '',
      // Si el destino tiene municipio asociado por defecto, se autocompleta
      municipalityId: dest?.municipalityId || value.municipalityId,
    });
  };

  const handleProvinceWideToggle = (checked: boolean) => {
    onChange({
      ...value,
      isProvinceWide: checked,
      ...(checked ? { destinationId: undefined, municipalityId: undefined } : {})
    });
  };

  return (
    <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold tracking-tight text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </h4>
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Selector de Provincia */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            Provincia {required && <span className="text-destructive">*</span>}
          </Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger className="bg-background text-sm">
              <SelectValue placeholder="Selecciona una provincia..." />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {DOMINICAN_PROVINCES.map((prov) => (
                <SelectItem key={prov.id} value={prov.id}>
                  {prov.name} ({prov.region.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destino / Polo Turístico (Ej. Bávaro, Punta Cana, Cabarete) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            Polo o Destino Turístico
          </Label>
          <Select 
            value={selectedDestination} 
            onValueChange={handleDestinationChange}
            disabled={!selectedProvince || isProvinceWide}
          >
            <SelectTrigger className="bg-background text-sm">
              <SelectValue placeholder={!selectedProvince ? "Primero elige provincia" : "Selecciona destino..."} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {availableDestinations.length > 0 ? (
                availableDestinations.map((dest) => (
                  <SelectItem key={dest.id} value={dest.id}>
                    📍 {dest.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  Sin polos específicos, usa el municipio abajo
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Municipio Oficial (158 municipios) */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium text-foreground">
            Municipio Oficial (Cabecera o Demarcación)
          </Label>
          <Select 
            value={selectedMunicipality} 
            onValueChange={handleMunicipalityChange}
            disabled={!selectedProvince || isProvinceWide}
          >
            <SelectTrigger className="bg-background text-sm">
              <SelectValue placeholder={!selectedProvince ? "Primero elige provincia" : "Selecciona municipio..."} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {availableMunicipalities.map((muni) => (
                <SelectItem key={muni.id} value={muni.id}>
                  🏛️ {muni.name} {muni.isCabecera ? '(Cabecera)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Checkbox para cobertura / alcance provincial */}
      {allowProvinceWide && (
        <div className="pt-2 border-t border-border/50 flex items-center space-x-2">
          <Checkbox 
            id="province-wide-check" 
            checked={isProvinceWide} 
            onCheckedChange={handleProvinceWideToggle}
            disabled={!selectedProvince}
          />
          <Label 
            htmlFor="province-wide-check" 
            className="text-xs text-muted-foreground font-normal cursor-pointer flex items-center gap-1.5"
          >
            <Globe2 className="h-3.5 w-3.5 text-primary" />
            <span>Esta publicación/actividad o evento cubre <strong>toda la provincia</strong> (no está limitada a un solo municipio).</span>
          </Label>
        </div>
      )}
    </div>
  );
}
