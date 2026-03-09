import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Gift, MapIcon, Calendar } from "lucide-react";
import { EntityList } from "./EntityList";
import { GamificationStats } from "./GamificationStats";
import { EntityType } from "@/hooks/useAdminEntities";

export function AdminGamification() {
  // Configuración de campos para Logros
  const achievementFields = {
    name: { label: "Nombre", type: "text" as const, required: true },
    slug: { label: "Slug", type: "text" as const },
    description: { label: "Descripción", type: "textarea" as const },
    short_description: { label: "Descripción corta", type: "textarea" as const },
    achievement_type: { label: "Tipo", type: "text" as const },
    category: { label: "Categoría", type: "text" as const },
    rarity: { label: "Rareza", type: "text" as const },
    xp_reward: { label: "Recompensa XP", type: "number" as const },
    coin_reward: { label: "Recompensa Monedas", type: "number" as const },
    icon: { label: "Icono", type: "text" as const },
    image_url: { label: "Imagen URL", type: "url" as const },
    badge_color: { label: "Color de insignia", type: "text" as const },
    unlock_condition: { label: "Condición de desbloqueo", type: "textarea" as const },
    min_level: { label: "Nivel mínimo", type: "number" as const },
    is_hidden: { label: "Oculto", type: "boolean" as const },
    is_active: { label: "Activo", type: "boolean" as const },
  };

  // Configuración de campos para Misiones
  const missionFields = {
    name: { label: "Nombre", type: "text" as const, required: true },
    description: { label: "Descripción", type: "textarea" as const },
    short_description: { label: "Descripción corta", type: "textarea" as const },
    mission_type: { label: "Tipo", type: "text" as const },
    category: { label: "Categoría", type: "text" as const },
    target_action: { label: "Acción objetivo", type: "text" as const },
    target_count: { label: "Cantidad objetivo", type: "number" as const },
    xp_reward: { label: "Recompensa XP", type: "number" as const },
    coin_reward: { label: "Recompensa Monedas", type: "number" as const },
    icon: { label: "Icono", type: "text" as const },
    min_level: { label: "Nivel mínimo", type: "number" as const },
    start_date: { label: "Fecha inicio", type: "date" as const },
    end_date: { label: "Fecha fin", type: "date" as const },
    is_active: { label: "Activa", type: "boolean" as const },
    is_featured: { label: "Destacada", type: "boolean" as const },
  };

  // Configuración de campos para Premios
  const prizeFields = {
    name: { label: "Nombre", type: "text" as const, required: true },
    description: { label: "Descripción", type: "textarea" as const },
    short_description: { label: "Descripción corta", type: "textarea" as const },
    prize_type: { label: "Tipo", type: "text" as const },
    coin_cost: { label: "Costo en monedas", type: "number" as const },
    image_url: { label: "Imagen URL", type: "url" as const },
    sponsor: { label: "Patrocinador", type: "text" as const },
    terms: { label: "Términos y condiciones", type: "textarea" as const },
    quantity_available: { label: "Cantidad disponible", type: "number" as const },
    quantity_redeemed: { label: "Cantidad canjeada", type: "number" as const },
    min_level: { label: "Nivel mínimo", type: "number" as const },
    valid_until: { label: "Válido hasta", type: "date" as const },
    is_active: { label: "Activo", type: "boolean" as const },
    is_featured: { label: "Destacado", type: "boolean" as const },
  };

  // Configuración de campos para Rutas Gamificadas
  const routeFields = {
    name: { label: "Nombre", type: "text" as const, required: true },
    slug: { label: "Slug", type: "text" as const },
    description: { label: "Descripción", type: "textarea" as const },
    short_description: { label: "Descripción corta", type: "textarea" as const },
    route_type: { label: "Tipo", type: "text" as const },
    difficulty: { label: "Dificultad", type: "text" as const },
    duration_days: { label: "Duración (días)", type: "number" as const },
    distance_km: { label: "Distancia (km)", type: "number" as const },
    total_xp_reward: { label: "Recompensa XP total", type: "number" as const },
    total_coin_reward: { label: "Recompensa monedas total", type: "number" as const },
    min_level: { label: "Nivel mínimo", type: "number" as const },
    image_url: { label: "Imagen URL", type: "url" as const },
    is_active: { label: "Activa", type: "boolean" as const },
    is_featured: { label: "Destacada", type: "boolean" as const },
  };

  // Configuración de campos para Temporadas
  const seasonFields = {
    name: { label: "Nombre", type: "text" as const, required: true },
    description: { label: "Descripción", type: "textarea" as const },
    short_description: { label: "Descripción corta", type: "textarea" as const },
    season_number: { label: "Número de temporada", type: "number" as const },
    start_date: { label: "Fecha inicio", type: "date" as const },
    end_date: { label: "Fecha fin", type: "date" as const },
    theme: { label: "Tema", type: "text" as const },
    xp_multiplier: { label: "Multiplicador XP", type: "number" as const },
    coin_multiplier: { label: "Multiplicador monedas", type: "number" as const },
    image_url: { label: "Imagen URL", type: "url" as const },
    is_active: { label: "Activa", type: "boolean" as const },
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <GamificationStats />

      {/* Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Gestión de Gamificación
          </CardTitle>
          <CardDescription>
            Administra logros, misiones, premios, rutas y temporadas del sistema de gamificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="achievements" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Logros</span>
              </TabsTrigger>
              <TabsTrigger value="missions" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Misiones</span>
              </TabsTrigger>
              <TabsTrigger value="prizes" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Premios</span>
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex items-center gap-2">
                <MapIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Rutas</span>
              </TabsTrigger>
              <TabsTrigger value="seasons" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Temporadas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-4">
              <EntityList
                entity={"achievements" as EntityType}
                entityName="Logro"
                fields={achievementFields}
              />
            </TabsContent>

            <TabsContent value="missions" className="space-y-4">
              <EntityList
                entity={"gamification_missions" as EntityType}
                entityName="Misión"
                fields={missionFields}
              />
            </TabsContent>

            <TabsContent value="prizes" className="space-y-4">
              <EntityList
                entity={"gamification_prizes" as EntityType}
                entityName="Premio"
                fields={prizeFields}
              />
            </TabsContent>

            <TabsContent value="routes" className="space-y-4">
              <EntityList
                entity={"gamified_routes" as EntityType}
                entityName="Ruta"
                fields={routeFields}
              />
            </TabsContent>

            <TabsContent value="seasons" className="space-y-4">
              <EntityList
                entity={"gamification_seasons" as EntityType}
                entityName="Temporada"
                fields={seasonFields}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
