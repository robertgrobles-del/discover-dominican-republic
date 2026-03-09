import { motion } from "framer-motion";
import { 
  BookOpen, Mountain, Palette, Landmark, DollarSign, Users, 
  MapPin, Sparkles, Compass
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DestinationAboutData {
  history?: string;
  geography?: string;
  artAndCulture?: string;
  politicalDivision?: string;
  economy?: string;
  demographics?: string;
  location?: string;
  pointsOfInterest?: { name: string; type: string; description?: string }[];
  whatToDo?: string[];
}

interface DestinationAboutTabsProps {
  name: string;
  data: DestinationAboutData;
}

const sectionIcon: Record<string, React.ReactNode> = {
  history: <BookOpen className="h-4 w-4" />,
  geography: <Mountain className="h-4 w-4" />,
  culture: <Palette className="h-4 w-4" />,
  politics: <Landmark className="h-4 w-4" />,
  economy: <DollarSign className="h-4 w-4" />,
  demographics: <Users className="h-4 w-4" />,
};

function TextBlock({ title, icon, text }: { title: string; icon: React.ReactNode; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>
    </motion.div>
  );
}

export function DestinationAboutTabs({ name, data }: DestinationAboutTabsProps) {
  const hasContent = data.history || data.geography || data.artAndCulture || 
    data.politicalDivision || data.economy || data.demographics || 
    data.location || (data.pointsOfInterest && data.pointsOfInterest.length > 0) ||
    (data.whatToDo && data.whatToDo.length > 0);

  if (!hasContent) return null;

  // Build available tabs
  const tabs: { id: string; label: string; icon: React.ReactNode }[] = [];
  if (data.history || data.geography || data.location) tabs.push({ id: "general", label: "General", icon: <BookOpen className="h-4 w-4" /> });
  if (data.artAndCulture || data.economy || data.demographics || data.politicalDivision) tabs.push({ id: "sociedad", label: "Sociedad", icon: <Users className="h-4 w-4" /> });
  if ((data.pointsOfInterest && data.pointsOfInterest.length > 0) || (data.whatToDo && data.whatToDo.length > 0)) tabs.push({ id: "explorar", label: "Qué hacer", icon: <Compass className="h-4 w-4" /> });

  if (tabs.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            Conoce {name}
          </h2>

          <Tabs defaultValue={tabs[0].id} className="w-full">
            <TabsList className={`grid w-full max-w-md grid-cols-${tabs.length}`}>
              {tabs.map(t => (
                <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-1.5 text-xs sm:text-sm">
                  {t.icon} {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="mt-6 space-y-8">
              {data.history && (
                <TextBlock title="Historia" icon={sectionIcon.history} text={data.history} />
              )}
              {data.geography && (
                <TextBlock title="Geografía" icon={sectionIcon.geography} text={data.geography} />
              )}
              {data.location && (
                <TextBlock title="Ubicación" icon={<MapPin className="h-4 w-4" />} text={data.location} />
              )}
            </TabsContent>

            {/* Society Tab */}
            <TabsContent value="sociedad" className="mt-6 space-y-8">
              {data.artAndCulture && (
                <TextBlock title="Arte y Cultura" icon={sectionIcon.culture} text={data.artAndCulture} />
              )}
              {data.politicalDivision && (
                <TextBlock title="División Política" icon={sectionIcon.politics} text={data.politicalDivision} />
              )}
              {data.economy && (
                <TextBlock title="Economía" icon={sectionIcon.economy} text={data.economy} />
              )}
              {data.demographics && (
                <TextBlock title="Demografía" icon={sectionIcon.demographics} text={data.demographics} />
              )}
            </TabsContent>

            {/* Explore Tab */}
            <TabsContent value="explorar" className="mt-6 space-y-8">
              {data.pointsOfInterest && data.pointsOfInterest.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Lugares de Interés
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.pointsOfInterest.map((poi, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="h-full hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-foreground">{poi.name}</h4>
                              <Badge variant="outline" className="text-xs capitalize">{poi.type}</Badge>
                            </div>
                            {poi.description && (
                              <p className="text-sm text-muted-foreground">{poi.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {data.whatToDo && data.whatToDo.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-primary" /> Qué Hacer
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {data.whatToDo.map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-foreground text-sm">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
