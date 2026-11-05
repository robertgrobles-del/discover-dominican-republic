import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Megaphone, 
  PenTool, 
  Compass, 
  Newspaper, 
  ExternalLink,
  Flame,
  Eye,
  Trash2,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { blogPosts, BlogPost } from "@/data/blogData";
import { useEditorialArticles } from "@/lib/editorialApi";
import { EntityList } from "@/components/admin/EntityList";
import { getFieldsConfig } from "@/components/admin/AdminEntityConfigs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { adminCreateEntity } from "@/lib/adminApi";

export function AdminEditorialManager() {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isNewArticleOpen, setIsNewArticleOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "noticias",
    excerpt: "",
    authorName: "",
    readTime: "5 min",
    imageUrl: ""
  });

  const { data: remoteArticles = [] } = useEditorialArticles();
  const articlesList = remoteArticles.length > 0 ? remoteArticles : blogPosts;
  const fieldsConfig = getFieldsConfig("articles");

  return (
    <div className="space-y-6">
      {/* Header con estadísticas rápidas estilo Amerivex / Jobie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-mono font-bold">Total Publicaciones</span>
              <p className="text-2xl font-black font-display text-foreground mt-1">{articlesList.length}</p>
              <span className="text-2xs text-emerald-500 font-medium">100% Indexadas</span>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-mono font-bold">Notas de Prensa (PR)</span>
              <p className="text-2xl font-black font-display text-foreground mt-1">
                {articlesList.filter(p => p.category === "prensa").length}
              </p>
              <span className="text-2xs text-purple-500 font-medium">Aliados & Hoteles</span>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
              <Megaphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-mono font-bold">Bitácora de Viajes</span>
              <p className="text-2xl font-black font-display text-foreground mt-1">
                {articlesList.filter(p => p.category === "experiencias").length}
              </p>
              <span className="text-2xs text-amber-500 font-medium">Rutas & Ecoturismo</span>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
              <Compass className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-mono font-bold">Firmas Invitadas</span>
              <p className="text-2xl font-black font-display text-foreground mt-1">
                {articlesList.filter(p => p.category === "invitados").length}
              </p>
              <span className="text-2xs text-blue-500 font-medium">Comunidad Activa</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
              <PenTool className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor y CRUD de Entidades Unificadas */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Mesa Editorial & Magazine
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Administración unificada de reportajes, noticias, comunicados de prensa y colaboraciones ciudadanas.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="rounded-xl text-xs gap-1.5">
              <a href="/revista" target="_blank" rel="noopener noreferrer">
                <Eye className="h-3.5 w-3.5" /> Ver en Vivo
              </a>
            </Button>
            <Button size="sm" onClick={() => setIsNewArticleOpen(true)} className="rounded-xl text-xs gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" /> Crear Publicación
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <EntityList
            entity="articles"
            entityName="Editorial & Magazine (Artículos)"
            fields={fieldsConfig}
          />
        </CardContent>
      </Card>

      {/* Modal Rápido de Creación de Publicación */}
      <Dialog open={isNewArticleOpen} onOpenChange={setIsNewArticleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Nueva Publicación Editorial</DialogTitle>
            <DialogDescription className="text-xs">
              Ingresa los datos esenciales para redactar o programar la publicación en Descubre RD.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (HAS_BACKEND_SESSION) {
                const slug = newArticle.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                const PUB_TYPES: Record<string, string> = {
                  noticias: "noticia",
                  experiencias: "experiencia",
                  prensa: "prensa",
                  invitados: "invitado",
                };
                const publication_type = PUB_TYPES[newArticle.category] || "magazine";

                await adminCreateEntity("articles", {
                  title: newArticle.title.trim(),
                  slug: `${slug.slice(0, 50)}-${Date.now().toString(36)}`,
                  category: newArticle.category,
                  publication_type,
                  author_name: newArticle.authorName.trim() || "Redacción Descubre RD",
                  content: newArticle.excerpt.trim() || newArticle.title.trim(),
                  excerpt: newArticle.excerpt.trim() || undefined,
                  image_url: newArticle.imageUrl.trim() || undefined,
                  read_time_min: parseInt(newArticle.readTime) || 5,
                  status: "draft",
                });
              }
              toast.success("Borrador editorial guardado exitosamente.");
              setIsNewArticleOpen(false);
              setNewArticle({ title: "", category: "noticias", excerpt: "", authorName: "", readTime: "5 min", imageUrl: "" });
            } catch (err: any) {
              toast.error(err.message || "Error al crear la publicación");
            }
          }} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Titular de la Publicación *</Label>
              <Input 
                required
                placeholder="Ej. Inversión turística sostenible en Samaná..."
                value={newArticle.title}
                onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
                className="text-xs h-9 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Canal Editorial</Label>
                <Select 
                  value={newArticle.category} 
                  onValueChange={val => setNewArticle({ ...newArticle, category: val })}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noticias">Noticias del Sector</SelectItem>
                    <SelectItem value="experiencias">Blog de Viajes</SelectItem>
                    <SelectItem value="prensa">Nota de Prensa (PR)</SelectItem>
                    <SelectItem value="invitados">Firma Invitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tiempo Estimado</Label>
                <Input 
                  placeholder="Ej. 4 min"
                  value={newArticle.readTime}
                  onChange={e => setNewArticle({ ...newArticle, readTime: e.target.value })}
                  className="text-xs h-9 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Autor o Firma Editorial</Label>
              <Input 
                placeholder="Ej. Redacción Descubre RD / Carlos Méndez"
                value={newArticle.authorName}
                onChange={e => setNewArticle({ ...newArticle, authorName: e.target.value })}
                className="text-xs h-9 mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Extracto o Bajada Periodística</Label>
              <Textarea 
                placeholder="Breve introducción de 2 a 3 oraciones..."
                value={newArticle.excerpt}
                onChange={e => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                className="text-xs min-h-[80px] mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">URL Imagen de Portada</Label>
              <Input 
                placeholder="https://images.unsplash.com/..."
                value={newArticle.imageUrl}
                onChange={e => setNewArticle({ ...newArticle, imageUrl: e.target.value })}
                className="text-xs h-9 mt-1"
              />
            </div>

            <Button type="submit" className="w-full text-xs h-10 rounded-xl font-bold">
              Guardar y Publicar en la Revista
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
