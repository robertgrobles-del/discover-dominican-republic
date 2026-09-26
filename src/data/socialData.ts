export interface SocialPost {
  id: number;
  platform: "instagram" | "tiktok" | "twitter";
  user: string;
  avatar: string;
  image?: string;
  caption: string;
  likes: number;
  comments: number;
  location?: string;
  isVideo?: boolean;
  isText?: boolean;
}

export interface TopSpot {
  name: string;
  location: string;
  description: string;
  image: string;
}

export interface WeeklyWinner {
  title: string;
  author: string;
  image: string;
  isWinner?: boolean;
}

export interface MockReel {
  id: string;
  videoUrl: string;
  user: string;
  desc: string;
  likes: string;
  comments: number;
}

export const socialFilters = ["Todos", "Instagram", "TikTok", "Punta Cana", "Samaná", "Mejores Fotos"];

export const staticSocialPosts: SocialPost[] = [
  {
    id: 1,
    platform: "instagram",
    user: "@island_girl_22",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=800&fit=crop",
    caption: "Los colores de Punta Cana son irreales 🌴 #LaIslaEnRedes",
    likes: 2400,
    comments: 89,
    location: "Punta Cana"
  },
  {
    id: 2,
    platform: "instagram",
    user: "@foodie_travels",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=400&fit=crop",
    caption: "No hay nada como un desayuno dominicano auténtico. El Mangú es vida. 🍳🥑 #Gastronomía #RD",
    likes: 1256,
    comments: 142,
    location: "Santo Domingo"
  },
  {
    id: 3,
    platform: "instagram",
    user: "@sunset_chaser",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=600&fit=crop",
    caption: "Atardeceres mágicos en Samaná 🌅 #Paradise",
    likes: 3890,
    comments: 234,
    location: "Samaná"
  },
  {
    id: 4,
    platform: "tiktok",
    user: "@adventure_mike",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=800&fit=crop",
    caption: "Salto El Limón 💦🌴 La mejor experiencia! #RepúblicaDominicana",
    likes: 12500,
    comments: 456,
    location: "Samaná",
    isVideo: true
  },
  {
    id: 5,
    platform: "instagram",
    user: "@coastory_buff",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=600&fit=crop",
    caption: "Recorriendo la Zona Colonial 🏛️ #SantoDomingo",
    likes: 890,
    comments: 67,
    location: "Santo Domingo"
  },
  {
    id: 6,
    platform: "twitter",
    user: "@caribe_fan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop",
    caption: "Acabo de reservar mis vuelos para Puerto Plata! ✈️ ¿Alguna recomendación de restaurantes con vista al mar? #RDReady #LaIslaEnRedes",
    likes: 234,
    comments: 45,
    location: "Puerto Plata",
    isText: true
  }
];

export const topSpots: TopSpot[] = [
  { name: "Montaña Redonda", location: "Miches", description: "El famoso columpio sobre las nubes. Vista panorámica 360.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop" },
  { name: "Bahía de las Águilas", location: "Pedernales", description: "Aguas cristalinas y arena blanca virgen.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop" },
  { name: "Calle de las Damas", location: "Santo Domingo", description: "La calle más antigua de América. Arquitectura colonial.", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop" },
  { name: "Hoyo Azul", location: "Punta Cana", description: "Cenote de aguas turquesas profundas escondido en un acantilado.", image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=100&h=100&fit=crop" },
];

export const weeklyWinners: WeeklyWinner[] = [
  { title: "Samaná Inolvidable", author: "@traveler_jane", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=500&fit=crop", isWinner: true },
  { title: "Colores del Caribe", author: "@photo_master", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=300&h=300&fit=crop" },
  { title: "Amanecer Colonial", author: "@dawn_hunter", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300&h=400&fit=crop" },
  { title: "Palmeras al Viento", author: "@island_vibes", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop" },
];

export const mockReels: MockReel[] = [
  {
    id: "r1",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-caribbean-beach-with-palm-trees-1524-large.mp4",
    user: "@explorer_rd",
    desc: "¡Descubriendo una playa secreta en Las Terrenas! El agua está increíble 🌴☀️ #DescubreRD #LasTerrenas #Naturaleza",
    likes: "14.2k",
    comments: 540
  },
  {
    id: "r2",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-diving-in-a-clear-blue-sea-44026-large.mp4",
    user: "@submarino_dr",
    desc: "Haciendo buceo libre en las cristalinas aguas de Cayo Arena. ¡Vimos un banco de peces cirujano! 🐠🤿 #Buceo #CayoArena",
    likes: "9.8k",
    comments: 320
  },
  {
    id: "r3",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-driving-on-a-curved-road-surrounded-by-forest-34316-large.mp4",
    user: "@ruteros_rd",
    desc: "Cruzando la sinuosa carretera de montaña en Constanza. ¡El clima aquí arriba es un sueño! 🏔️🚗 #Constanza #Roadtrip #Frio",
    likes: "18.5k",
    comments: 710
  }
];
