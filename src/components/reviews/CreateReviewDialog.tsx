import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/reviews/StarRating";
import { travelerTypes } from "@/components/reviews/ReviewCard";
import { CategoryFilterItem } from "@/components/reviews/ReviewsSidebar";

interface CreateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    title: string;
    content: string;
    rating: number;
    traveler_type: string;
    location: string;
    category: string;
  };
  onFormDataChange: React.Dispatch<
    React.SetStateAction<{
      title: string;
      content: string;
      rating: number;
      traveler_type: "solo" | "couple" | "family" | "business" | "";
      location: string;
      category: string;
    }>
  >;
  locations: string[];
  categoryFilters: CategoryFilterItem[];
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  isLoggedIn: boolean;
}

export function CreateReviewDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  locations,
  categoryFilters,
  onSubmit,
  submitting,
  isLoggedIn,
}: CreateReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Escribir Reseña
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comparte tu Experiencia</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Tu calificación *</Label>
            <StarRating
              rating={formData.rating}
              interactive
              onRate={(r) => onFormDataChange((prev) => ({ ...prev, rating: r }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de viaje *</Label>
              <Select
                value={formData.traveler_type}
                onValueChange={(v) =>
                  onFormDataChange((prev) => ({ ...prev, traveler_type: v as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {travelerTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destino *</Label>
              <Select
                value={formData.location}
                onValueChange={(v) =>
                  onFormDataChange((prev) => ({ ...prev, location: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(v) =>
                onFormDataChange((prev) => ({ ...prev, category: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {categoryFilters.map((c) => (
                  <SelectItem key={c.label} value={c.label}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Título de tu reseña *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                onFormDataChange((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ej: Una experiencia inolvidable en Samaná"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tu experiencia *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                onFormDataChange((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Cuéntanos los detalles de tu viaje..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting || !isLoggedIn}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : !isLoggedIn ? (
              "Inicia sesión para publicar"
            ) : (
              "Publicar Reseña"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
