import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface PassportCollectiblesTabProps {
  collectibles: any[];
  userCollectibles: any[];
  ownedCollectiblesCount: number;
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-500/10 text-gray-500",
  uncommon: "bg-green-500/10 text-green-500",
  rare: "bg-blue-500/10 text-blue-500",
  epic: "bg-purple-500/10 text-purple-500",
  legendary: "bg-yellow-500/10 text-yellow-500",
};

export function PassportCollectiblesTab({
  collectibles,
  userCollectibles,
  ownedCollectiblesCount
}: PassportCollectiblesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colección ({ownedCollectiblesCount} / {collectibles.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {collectibles.map((collectible) => {
            const owned = userCollectibles.some((uc: any) => uc.collectible_id === collectible.id);

            return (
              <div
                key={collectible.id}
                className={`border rounded-lg p-4 text-center ${
                  !owned && "opacity-40 grayscale"
                }`}
              >
                {collectible.image_url && (
                  <img
                    src={collectible.image_url}
                    alt={collectible.name}
                    className="w-full h-24 object-contain mb-2"
                  />
                )}
                <h4 className="font-semibold text-sm mb-1">{collectible.name}</h4>
                <Badge className={rarityColors[collectible.rarity] || "bg-muted text-foreground"}>
                  {collectible.rarity}
                </Badge>
                {!owned && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <Lock className="h-3 w-3 inline mr-1" />
                    Bloqueado
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
