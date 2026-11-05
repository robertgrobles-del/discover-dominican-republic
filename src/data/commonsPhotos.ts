// Fotos de Wikimedia Commons (licencias CC: exigen citar autor y licencia, ver PhotoCredits).
// shortcut: se enlazan desde Commons; antes de producción conviene descargarlas a /assets o al CDN propio.
const wm = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1600`;

export interface CommonsPhoto { url: string; credit: string; }

const photo = (file: string, author: string, license: string): CommonsPhoto => ({ url: wm(file), credit: `${author} (${license})` });

export const PHOTOS = {
  ballenaSamana: photo("Mother Humpback Whale in Samaná Bay, Dominican Republic.jpg", "Caballero1967", "CC BY-SA 4.0"),
  cayoLevantado: photo("Cayo Levantado, Samaná 32000, Dominican Republic - panoramio.jpg", "Panoramio", "CC BY 3.0"),
  saltoLimon: photo("DOM Santa Bárbara de Samaná, El Limón, Monumento Natural Salto El Limón 0008.jpg", "-wuppertaler", "CC BY 4.0"),
  playaRincon: photo("Playa Rincón Dec 2020.jpg", "Danu Widjajanto", "CC BY-SA 4.0"),
  puentesSamana: photo("DOM Santa Bárbara de Samaná, Los Puentes de Samaná 0008.jpg", "-wuppertaler", "CC BY 4.0"),
  maleconSamana: photo("DOM Santa Bárbara de Samaná, Malecón de Samaná 0001.jpg", "-wuppertaler", "CC BY 4.0"),
  haitises: photo("Los Haitises Park.jpeg", "Anton Bielousov", "CC BY-SA 3.0"),
  sanchezManglar: photo("Sánchez Las Garitas Los Haitises Trail (Mangrove).jpg", "Dr. Thomas Liptak", "CC BY-SA 4.0"),
  sanchezIglesia: photo("Sánchez (Samaná) Iglesia Nuestra Señora de Lourdes.jpg", "Dr. Thomas Liptak", "CC BY-SA 4.0"),
  lasTerrenas: photo("Las Terrenas beach 7.JPG", "Captain-tucker", "CC BY-SA 3.0"),
  lagunaDudu: photo("Dudu lagoon (2359528937).jpg", "gosheshe", "CC BY 2.0"),
  lagunaGriGri: photo("Laguna Gri-Gri.jpg", "Pelie777", "CC BY-SA 4.0"),
  playaGrande: photo("Playa Grande RSJ.jpg", "Pelie777", "CC BY-SA 4.0"),
  nagua: photo("Nagua Dominican Republic.jpg", "CristoRey99", "CC BY-SA 4.0"),
  riaNagua: photo("Area de desembocadura, Rio Nagua, Sector Rio Mar.jpg", "Andres1008", "CC BY-SA 4.0"),
  cabrera: photo("Municipio de Cabrera.jpg", "Acostamike", "CC BY-SA 4.0"),
  saltaderoCabrera: photo("El Saltadero, Cabrera, República Dominicana - panoramio.jpg", "josealfonso", "CC BY-SA 3.0"),
  pescadorRioSanJuan: photo("Local fisherman Rio San Juan - panoramio.jpg", "Scotia", "CC BY 3.0"),
} satisfies Record<string, CommonsPhoto>;

/** Créditos únicos de las fotos usadas, para mostrarlos al pie de la página. */
export const creditsFor = (photos: CommonsPhoto[]) => [...new Set(photos.map((p) => p.credit))];
