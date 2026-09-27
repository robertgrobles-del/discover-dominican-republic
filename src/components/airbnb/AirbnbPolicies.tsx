import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertCircle, Shield } from "lucide-react";

interface AirbnbPoliciesProps {
  checkInTime: string;
  checkOutTime: string;
  houseRules: string[];
  safetyFeatures: string[];
  cancellationDetails: string;
  cancellationPolicy: string;
  minNights: number;
  maxNights?: number;
}

export function AirbnbPolicies({
  checkInTime,
  checkOutTime,
  houseRules,
  safetyFeatures,
  cancellationDetails,
  cancellationPolicy,
  minNights,
  maxNights,
}: AirbnbPoliciesProps) {
  const getCancellationBadge = () => {
    switch (cancellationPolicy) {
      case "flexible":
        return { label: "Flexible", color: "bg-green-500" };
      case "moderate":
        return { label: "Moderada", color: "bg-yellow-500" };
      case "strict":
        return { label: "Estricta", color: "bg-red-500" };
      default:
        return { label: "Moderada", color: "bg-yellow-500" };
    }
  };

  const badge = getCancellationBadge();

  return (
    <Tabs defaultValue="rules" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="rules">Reglas de la casa</TabsTrigger>
        <TabsTrigger value="safety">Seguridad</TabsTrigger>
        <TabsTrigger value="cancellation">Cancelación</TabsTrigger>
      </TabsList>

      <TabsContent value="rules" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Check-in</p>
                  <p className="text-sm text-muted-foreground">{checkInTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Check-out</p>
                  <p className="text-sm text-muted-foreground">{checkOutTime}</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <ul className="space-y-2">
              {houseRules.map((rule, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="safety" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {safetyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cancellation" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className={badge.color}>{badge.label}</Badge>
              <span className="text-sm text-muted-foreground">Política de cancelación</span>
            </div>
            <p className="text-muted-foreground">{cancellationDetails}</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Estadía mínima:</strong> {minNights} noches
                {maxNights && (
                  <>
                    {" "}
                    • <strong>Estadía máxima:</strong> {maxNights} noches
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
