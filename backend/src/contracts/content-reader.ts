export interface PublicPlace {
  entity_type: string;
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  province_id: string | null;
  destination_id: string | null;
  image: string | null;
}

export interface PublicProvince {
  id: string;
  name: string;
  slug: string | null;
  region: string | null;
}

export interface GeoPoint { lat: number; lng: number }

export interface PublicContentCandidate {
  type: string;
  ref: string;
  name: string;
  summary: string | null;
  is_verified: boolean;
  is_sponsored: boolean;
}

export interface PublicContentCandidateQuery {
  paths: string[];
  keywords: string[];
  perType: number;
  exclude?: string[];
  verifiedIds?: string[];
}

export interface PublicContentSearchHit {
  type: string;
  collection: string;
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  image: string | null;
  score: number;
}

export interface PublicContentSearchResult {
  hits: PublicContentSearchHit[];
  fallbackUsed: boolean;
  failedCollections: string[];
}

export interface PublicMapLayer { id: string; type: string; label: string; group: string; count: number }
export interface PublicMapFeature { collection: string; id: string; slug: string | null; name: string; lat: number; lng: number; image: string | null; rating: number | null }
export interface PublicNearbyPlace { type: string; collection: string; id: string; slug: string | null; name: string; image: string | null; rating: number | null; distance_m: number }
export interface ReverseGeocodeResult {
  province: { id: string; name: string | null; slug: string | null } | null;
  municipality: { id: string; name: string; slug: string | null; distance_m: number } | null;
  destination: { id: string; name: string; slug: string | null; distance_m: number } | null;
}
export interface PublicContentSectionItem { id: string; slug: string | null; title: string; subtitle: string | null; image: string | null; rating: number | null }

/** Read-only use-case contract for other domains; writes remain owned by their current domain. */
export interface ContentReaderPort {
  getPublicPlace(typeOrPath: string, id: string): Promise<PublicPlace | null>;
  countPublicProvinces(): Promise<number>;
  listPublicProvinces(): Promise<PublicProvince[]>;
  getPublicProvince(slugOrId: string): Promise<PublicProvince | null>;
  getPublicProvinceById(id: string): Promise<Pick<PublicProvince, "id" | "name"> | null>;
  listProvinceVerificationPoints(provinceId: string): Promise<GeoPoint[]>;
  findPublicCandidates(query: PublicContentCandidateQuery): Promise<PublicContentCandidate[]>;
  searchPublicContent(paths: string[], query: string, limit: number, titleOnly: boolean): Promise<PublicContentSearchResult>;
  listPublicMapLayers(paths: string[]): Promise<PublicMapLayer[]>;
  listPublicMapFeatures(paths: string[], bbox: [number, number, number, number] | undefined, perLayerLimit: number): Promise<PublicMapFeature[]>;
  findNearbyPublicPlaces(paths: string[], lat: number, lng: number, radius: number, perCollectionLimit: number): Promise<PublicNearbyPlace[]>;
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult>;
  listPublicSectionItems(path: string, limit: number, options?: { excludeIds?: string[]; upcomingFrom?: string }): Promise<PublicContentSectionItem[]>;
}
