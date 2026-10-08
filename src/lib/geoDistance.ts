/**
 * Utilidades geoespaciales y cálculo de distancias por carretera para República Dominicana
 */

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;
const DOMINICAN_ROAD_FACTOR = 1.35; // Factor de corrección topográfica para carreteras dominicanas
const AVG_DR_DRIVE_SPEED_KMH = 60; // Velocidad promedio de traslado en RD (60 km/h)

/**
 * Calcula la distancia en línea recta (fórmula de Haversine) entre dos coordenadas
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estima la distancia real por carretera en kilómetros
 */
export function estimateRoadDistanceKm(straightDistanceKm: number): number {
  return Math.round(straightDistanceKm * DOMINICAN_ROAD_FACTOR);
}

/**
 * Estima el tiempo de conducción en carretera dominicana
 */
export function formatDriveTime(roadKm: number): string {
  const hours = roadKm / AVG_DR_DRIVE_SPEED_KMH;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
