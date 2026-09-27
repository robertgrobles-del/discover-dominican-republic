import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

interface PassportRoutesTabProps {
  routes: any[];
  activeRoutes: any[];
  userRouteProgress: any[];
}

export function PassportRoutesTab({ routes, activeRoutes, userRouteProgress }: PassportRoutesTabProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Rutas Activas ({activeRoutes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeRoutes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tienes rutas activas
            </p>
          ) : (
            <div className="space-y-4">
              {activeRoutes.map((progress) => {
                const route = routes.find(r => r.id === progress.route_id);
                if (!route) return null;
                
                return (
                  <div key={progress.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{route.name}</h4>
                    <ProgressBar
                      value={progress.completion_percentage}
                      label="Progreso"
                      variant="gradient"
                    />
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        {progress.checkpoints_completed} / {progress.total_checkpoints} checkpoints
                      </span>
                      <span className="text-primary">
                        +{progress.total_xp_earned} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rutas Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.filter(r => !userRouteProgress.some(p => p.route_id === r.id)).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay rutas nuevas disponibles
            </p>
          ) : (
            <div className="space-y-4">
              {routes
                .filter(r => !userRouteProgress.some(p => p.route_id === r.id))
                .slice(0, 3)
                .map((route) => (
                  <div key={route.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{route.name}</h4>
                      {route.is_featured && (
                        <Badge className="bg-yellow-500/10 text-yellow-500">
                          Destacada
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {route.short_description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-xs">
                        <span className="text-primary">+{route.total_xp_reward} XP</span>
                        {route.difficulty && (
                          <Badge variant="outline">{route.difficulty}</Badge>
                        )}
                      </div>
                      <Button size="sm">Iniciar</Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
