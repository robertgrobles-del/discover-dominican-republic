import { Artesano } from "@/data/marketplaceData";
import { ArtesanosTab } from "@/components/marketplace/ArtesanosTab";

interface VendorProfileProps {
  artesanos: Artesano[];
  onOpenChat: (artesano: Artesano) => void;
}

export function VendorProfile({ artesanos, onOpenChat }: VendorProfileProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 rounded-2xl border border-amber-500/20 mb-6">
        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">
          🎨 Creadores & Artesanos Dominicanos
        </h3>
        <p className="text-sm text-muted-foreground">
          Conecta directamente con maestros artesanos y talleres locales. Cada compra apoya a familias y preserva las tradiciones dominicanas.
        </p>
      </div>

      <ArtesanosTab artesanos={artesanos} onChat={onOpenChat} />
    </div>
  );
}
