import type React from "react";

// Color de identidad por provincia o destino ("tono saturación%"); ver .dest-theme en index.css.
// Un destino o municipio sin entrada propia hereda el de su provincia; sin ninguno queda el azul de marca.
const DEST_HS: Record<string, string> = {
  "la-altagracia": "178 80%",       // turquesa del Caribe, Punta Cana
  "samana": "150 60%",              // verde de cocoteros y ballenas
  "maria-trinidad-sanchez": "186 75%", // turquesa de cenote, Laguna Dudú
  "puerto-plata": "205 75%",        // azul atlántico y ámbar
  "santo-domingo": "8 65%",         // piedra coralina colonial
  "distrito-nacional": "8 65%",
  "la-romana": "32 70%",            // Altos de Chavón, piedra dorada
  "la-vega": "280 45%",             // carnaval, diablos cojuelos
  "santiago": "22 70%",             // tabaco y ladrillo cibaeño
  "pedernales": "190 90%",          // Bahía de las Águilas
  "barahona": "160 55%",            // larimar y sierra verde
  "monte-cristi": "40 60%",         // salinas y desierto
};

export function destinationTheme(slug?: string, provinceSlug?: string): { className?: string; style?: React.CSSProperties } {
  const hs = (slug && DEST_HS[slug]) || (provinceSlug && DEST_HS[provinceSlug]);
  return hs ? { className: "dest-theme", style: { "--dest-hs": hs } as React.CSSProperties } : {};
}
