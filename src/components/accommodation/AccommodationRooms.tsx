import { motion } from "framer-motion";
import { Check, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface AccommodationRoom {
  id: string;
  name: string;
  price: number;
  size: string;
  view: string;
  bed: string;
  capacity: string;
  image: string;
  amenities: string[];
  description: string;
  breakfast: boolean;
}

interface AccommodationRoomsProps {
  rooms: AccommodationRoom[];
  selectedRoomIndex: number;
  onSelectRoom: (index: number) => void;
}

export function AccommodationRooms({
  rooms,
  selectedRoomIndex,
  onSelectRoom,
}: AccommodationRoomsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Bed className="h-6 w-6 text-primary" />
            Habitaciones & Suites Disponibles
          </h2>
          <p className="text-sm text-muted-foreground">
            Tarifas transparentes por noche con impuestos y servicios detallados
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          {rooms.length} Opciones
        </Badge>
      </div>

      <div className="space-y-4">
        {rooms.map((room, idx) => {
          const isSelected = selectedRoomIndex === idx;
          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col md:flex-row gap-5 bg-card rounded-3xl overflow-hidden border transition-all duration-300 ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5"
                  : "border-border hover:border-primary/40 shadow-sm"
              }`}
            >
              <div className="md:w-64 h-52 md:h-auto relative overflow-hidden flex-shrink-0">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {room.breakfast && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    Todo Incluido
                  </div>
                )}
              </div>

              <div className="flex-1 p-5 md:py-6 md:pr-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {room.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium mb-3">
                    <span className="bg-muted px-2 py-1 rounded-md">{room.size}</span>
                    <span>•</span>
                    <span>{room.view}</span>
                    <span>•</span>
                    <span>{room.bed}</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">{room.capacity}</span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {room.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 text-xs bg-muted/60 text-foreground/80 px-2.5 py-1 rounded-lg"
                      >
                        <Check className="h-3 w-3 text-primary" /> {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <div>
                    <span className="text-xs text-muted-foreground">Tarifa por noche</span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-2xl font-black text-foreground">
                        US$ {room.price}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        / noche · aprox. RD$ {(room.price * 60).toLocaleString("es-DO")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl px-5 font-semibold"
                    onClick={() => {
                      onSelectRoom(idx);
                      toast.info(`Habitación seleccionada: ${room.name}`);
                    }}
                  >
                    {isSelected ? "Seleccionada ✓" : "Seleccionar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
