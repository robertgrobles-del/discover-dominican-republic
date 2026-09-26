export interface Collectible {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  animated_url: string | null;
  collectible_type: string;
  rarity: string;
  xp_value: number | null;
  coin_value: number | null;
  total_supply: number | null;
  current_supply: number | null;
  is_tradeable: boolean | null;
  unlock_condition: string | null;
  season: string | null;
}

export interface UserCollectible {
  id: string;
  collectible_id: string;
  acquired_at: string | null;
  acquisition_method: string | null;
  is_favorite: boolean | null;
}

export interface NftTransaction {
  id: string;
  action: string;
  assetName: string;
  recipient: string;
  hash: string;
  timestamp: string;
}

export const rarityConfig: Record<string, { label: string; gradient: string; border: string; text: string }> = {
  common: { label: "Común", gradient: "from-slate-400 to-slate-500", border: "border-slate-400/30", text: "text-slate-400" },
  uncommon: { label: "Poco Común", gradient: "from-emerald-400 to-emerald-600", border: "border-emerald-400/30", text: "text-emerald-400" },
  rare: { label: "Raro", gradient: "from-blue-400 to-blue-600", border: "border-blue-400/30", text: "text-blue-400" },
  epic: { label: "Épico", gradient: "from-purple-400 to-purple-600", border: "border-purple-400/30", text: "text-purple-400" },
  legendary: { label: "Legendario", gradient: "from-amber-400 to-amber-600", border: "border-amber-400/30", text: "text-amber-400" },
};

export const typeLabels: Record<string, string> = {
  landmark: "Lugar Emblemático",
  culture: "Cultural",
  nature: "Naturaleza",
  food: "Gastronomía",
  activity: "Actividad",
  event: "Evento",
  special: "Especial",
};
