import type { FastifyBaseLogger } from "fastify";
import type { ContentReaderPort, PublicContentCandidateQuery } from "../../contracts/content-reader.js";
import { AppError } from "../../lib/errors.js";
import { CONTENT_READER_RPC_PREFIX, type ContentReaderMethod } from "./reader-rpc.js";

type Result<M extends ContentReaderMethod> = Awaited<ReturnType<ContentReaderPort[M]>>;

/** Cliente del servicio de contenido: mismas lecturas que `PostgresContentReader`, sin tocar sus tablas. */
export class HttpContentReader implements ContentReaderPort {
  constructor(private readonly baseUrl: string, private readonly token: string, private readonly log: FastifyBaseLogger, private readonly timeoutMs = 5000) {}

  getPublicPlace(typeOrPath: string, id: string) { return this.call("getPublicPlace", [typeOrPath, id]); }
  countPublicProvinces() { return this.call("countPublicProvinces", []); }
  listPublicProvinces() { return this.call("listPublicProvinces", []); }
  getPublicProvince(slugOrId: string) { return this.call("getPublicProvince", [slugOrId]); }
  getPublicProvinceById(id: string) { return this.call("getPublicProvinceById", [id]); }
  listProvinceVerificationPoints(provinceId: string) { return this.call("listProvinceVerificationPoints", [provinceId]); }
  findPublicCandidates(query: PublicContentCandidateQuery) { return this.call("findPublicCandidates", [query]); }
  searchPublicContent(paths: string[], query: string, limit: number, titleOnly: boolean) { return this.call("searchPublicContent", [paths, query, limit, titleOnly]); }
  listPublicMapLayers(paths: string[]) { return this.call("listPublicMapLayers", [paths]); }
  listPublicMapFeatures(paths: string[], bbox: [number, number, number, number] | undefined, perLayerLimit: number) { return this.call("listPublicMapFeatures", [paths, bbox, perLayerLimit]); }
  findNearbyPublicPlaces(paths: string[], lat: number, lng: number, radius: number, perCollectionLimit: number) { return this.call("findNearbyPublicPlaces", [paths, lat, lng, radius, perCollectionLimit]); }
  reverseGeocode(lat: number, lng: number) { return this.call("reverseGeocode", [lat, lng]); }
  listPublicSectionItems(path: string, limit: number, options?: { excludeIds?: string[]; upcomingFrom?: string }) { return this.call("listPublicSectionItems", [path, limit, options]); }

  private async call<M extends ContentReaderMethod>(method: M, args: unknown[]): Promise<Result<M>> {
    try {
      const response = await fetch(new URL(`${CONTENT_READER_RPC_PREFIX}/${method}`, this.baseUrl), {
        method: "POST",
        headers: { authorization: `Bearer ${this.token}`, "content-type": "application/json" },
        body: JSON.stringify({ args }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      const result = await response.json() as { data?: unknown; error?: { message?: string } };
      if (!response.ok) throw new Error(`${response.status} ${result.error?.message ?? ""}`.trim());
      return result.data as Result<M>;
    } catch (error) {
      this.log.warn({ err: error, method }, "Servicio de contenido no disponible");
      throw new AppError("SERVICE_UNAVAILABLE", "Servicio de contenido no disponible");
    }
  }
}
