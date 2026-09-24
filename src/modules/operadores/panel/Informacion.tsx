import { Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORM_ANNOUNCEMENTS } from "../constants";

export default function Informacion() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Información</h1>
      <div className="space-y-3 max-w-3xl">
        {PLATFORM_ANNOUNCEMENTS.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-5 flex gap-4">
              <Megaphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">{a.date}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
