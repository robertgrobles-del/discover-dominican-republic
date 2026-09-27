import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, Upload } from "lucide-react";

export interface CreatorVideoItem {
  id: string;
  title: string;
  dest: string;
  views: number;
  bookings: number;
  earnings: string;
  status: string;
  date: string;
}

interface CreatorsVideosTabProps {
  creatorVideos: CreatorVideoItem[];
  videoTitle: string;
  videoUrl: string;
  videoDestination: string;
  isUploading: boolean;
  onVideoTitleChange: (val: string) => void;
  onVideoUrlChange: (val: string) => void;
  onVideoDestinationChange: (val: string) => void;
  onUploadVideo: (e: React.FormEvent) => void;
}

export function CreatorsVideosTab({
  creatorVideos,
  videoTitle,
  videoUrl,
  videoDestination,
  isUploading,
  onVideoTitleChange,
  onVideoUrlChange,
  onVideoDestinationChange,
  onUploadVideo
}: CreatorsVideosTabProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Upload Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Publicar Nuevo Contenido</CardTitle>
          <CardDescription className="text-xs">Sube el enlace de tu Reel, TikTok o YouTube para auditar vistas y cobrar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onUploadVideo} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Título del Vídeo</label>
              <Input
                placeholder="Ej: 5 Hoteles Imperdibles en POP"
                value={videoTitle}
                onChange={(e) => onVideoTitleChange(e.target.value)}
                required
                className="mt-1 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Enlace del Vídeo (Instagram / TikTok / YouTube)</label>
              <Input
                placeholder="https://instagram.com/reel/..."
                value={videoUrl}
                onChange={(e) => onVideoUrlChange(e.target.value)}
                required
                className="mt-1 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Destino Cubierto</label>
              <select
                value={videoDestination}
                onChange={(e) => onVideoDestinationChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="Puerto Plata (POP)">Puerto Plata (POP)</option>
                <option value="Samaná">Samaná</option>
                <option value="Punta Cana">Punta Cana</option>
                <option value="Santo Domingo">Santo Domingo (Zona Colonial)</option>
                <option value="Jarabacoa / Constanza">Jarabacoa / Constanza</option>
              </select>
            </div>
            <Button type="submit" disabled={isUploading} className="w-full rounded-xl text-xs font-bold gap-2">
              <Upload className="h-3.5 w-3.5" />
              {isUploading ? "Enviando..." : "Registrar para Monetización"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Right: Published List */}
      <div className="lg:col-span-2">
        <Card className="border-border bg-card h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">Tus Contenidos Auditados</CardTitle>
            <CardDescription className="text-xs">Rendimiento, reproducciones y pagos acumulados.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase">
                  <th className="py-2.5 font-bold">Título</th>
                  <th className="py-2.5 font-bold">Destino</th>
                  <th className="py-2.5 font-bold">Vistas</th>
                  <th className="py-2.5 font-bold">Ganancia</th>
                  <th className="py-2.5 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {creatorVideos.map(video => (
                  <tr key={video.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 font-semibold text-foreground flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary shrink-0" />
                      <span>{video.title}</span>
                    </td>
                    <td className="py-3 text-muted-foreground">{video.dest}</td>
                    <td className="py-3 font-bold text-foreground">{video.views.toLocaleString()}</td>
                    <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">{video.earnings || "$0.00"}</td>
                    <td className="py-3">
                      <Badge className={video.status === "Aprobado" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                        {video.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
