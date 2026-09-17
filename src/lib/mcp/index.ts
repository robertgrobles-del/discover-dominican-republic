import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchDestinations from "./tools/search-destinations";
import searchPlaces from "./tools/search-places";
import listUpcomingEvents from "./tools/list-events";
import listArticles from "./tools/list-articles";
import listMyFavorites from "./tools/list-my-favorites";
import addFavorite from "./tools/add-favorite";
import getMyTravelProfile from "./tools/get-my-travel-profile";

// Issuer must be the direct Supabase host, built from the project ref that Vite
// inlines at build time (import-safe: no runtime env read at module scope).
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "discover-dominican-republic",
  title: "Discover Dominican Republic",
  version: "0.1.0",
  instructions:
    "Herramientas del portal de turismo Descubre República Dominicana. Usa search_destinations y search_places para encontrar destinos, playas, hoteles, restaurantes, bares y experiencias; list_upcoming_events para eventos; list_articles para el blog; list_my_favorites, add_favorite y get_my_travel_profile para el usuario conectado. Cita siempre el enlace de la página fuente.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchDestinations,
    searchPlaces,
    listUpcomingEvents,
    listArticles,
    listMyFavorites,
    addFavorite,
    getMyTravelProfile,
  ],
});
