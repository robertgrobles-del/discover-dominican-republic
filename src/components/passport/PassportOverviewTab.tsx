import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, CheckCircle2 } from "lucide-react";

interface PassportOverviewTabProps {
  recentStamps: any[];
  leaderboard: any[];
}

export function PassportOverviewTab({ recentStamps, leaderboard }: PassportOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Stamps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Sellos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentStamps.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aún no tienes sellos. ¡Visita destinos para comenzar!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentStamps.map((stamp) => (
                    <div
                      key={stamp.id}
                      className="flex items-center gap-4 p-3 rounded-lg border"
                    >
                      {stamp.stamp_image && (
                        <img
                          src={stamp.stamp_image}
                          alt={stamp.stamp_name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{stamp.stamp_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {stamp.stamp_location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(stamp.visited_at).toLocaleDateString("es-DO")}
                        </p>
                      </div>
                      {stamp.is_verified && (
                        <Badge className="bg-green-500/10 text-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Exploradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={entry.user_id} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-white"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : "bg-orange-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.total_xp.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
