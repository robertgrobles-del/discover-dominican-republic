import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Compass } from "lucide-react";

interface ProfileSettingsProps {
  user: any;
  profile: {
    display_name: string | null;
    bio: string | null;
    preferred_language: string | null;
    travel_interests: string[] | null;
  };
  setProfile: React.Dispatch<React.SetStateAction<any>>;
  handleSaveProfile: () => void;
  toggleInterest: (interest: string) => void;
  signOut: () => void;
}

const interestOptions = [
  "Playas", "Aventura", "Cultura", "Gastronomía", "Historia",
  "Ecoturismo", "Vida Nocturna", "Bienestar", "Golf", "Buceo"
];

export function ProfileSettings({
  user,
  profile,
  setProfile,
  handleSaveProfile,
  toggleInterest,
  signOut,
}: ProfileSettingsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input value={user?.email || ""} disabled className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">El email no puede ser modificado</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Nombre para mostrar</label>
            <Input
              value={profile.display_name || ""}
              onChange={(e) => setProfile((p: any) => ({ ...p, display_name: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Bio</label>
            <Textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile((p: any) => ({ ...p, bio: e.target.value }))}
              placeholder="Cuéntanos sobre ti como viajero..."
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> Idioma preferido
            </label>
            <select
              value={profile.preferred_language || "es"}
              onChange={(e) => setProfile((p: any) => ({ ...p, preferred_language: e.target.value }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
              title="Idioma preferido"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <Button onClick={handleSaveProfile} className="w-full">Guardar Cambios</Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" /> Intereses de Viaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Selecciona tus intereses para recibir recomendaciones personalizadas.
            </p>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <Badge
                  key={interest}
                  variant={(profile.travel_interests || []).includes(interest) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <Button onClick={handleSaveProfile} variant="outline" className="w-full mt-6">
              Guardar Intereses
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Cerrar Sesión</h3>
              <p className="text-sm text-muted-foreground">Cierra tu sesión en este dispositivo.</p>
            </div>
            <Button variant="destructive" onClick={signOut}>Cerrar Sesión</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
