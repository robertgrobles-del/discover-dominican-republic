import { Link } from "react-router-dom";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import { useTrackedBanner } from "@/hooks/useAdBanners";

interface Fallback { to: string; img: string; alt: string; sponsor?: string; title: string; text: string }

/** Anuncio del menú desplegable: banner_type "megamenu-card", placement "megamenu", section = `megamenu-<menú>`. */
export function MegaMenuAdCard({ section, onClose, fallback }: { section: string; onClose: () => void; fallback: Fallback }) {
  const { banner: ad, trackClick } = useTrackedBanner({ section, bannerType: "megamenu-card", placement: "megamenu" });
  const sponsor = ad ? ad.sponsor : fallback.sponsor;
  return (
    <Link to={ad?.target_url || fallback.to} onClick={() => { trackClick(); onClose(); }} className="block group relative rounded-2xl overflow-hidden h-36 shadow-md">
      <img src={ad?.image_url || fallback.img} alt={ad?.alt_text || ad?.name || fallback.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        {sponsor && <SponsoredBadge sponsor={sponsor} className="mb-1 text-3xs" />}
        <h4 className="font-display text-sm font-bold text-white leading-tight">{ad?.headline || ad?.name || fallback.title}</h4>
        <p className="text-white/85 text-xs">{ad ? ad.subtext : fallback.text}</p>
      </div>
    </Link>
  );
}
