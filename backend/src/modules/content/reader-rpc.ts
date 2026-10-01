import { z } from "zod";
import type { ContentReaderPort } from "../../contracts/content-reader.js";

const text = z.string().max(200);
const paths = z.array(z.string().max(60)).max(80);
const ids = (max: number) => z.array(z.string().uuid()).max(max);
const lat = z.number().min(-90).max(90);
const lng = z.number().min(-180).max(180);

/**
 * Argumentos de cada lectura de `ContentReaderPort` al viajar por HTTP. Varias consultas interpolan
 * límites en el SQL, así que el servicio valida aquí todo lo que llega antes de tocar el lector.
 */
export const CONTENT_READER_RPC = {
  getPublicPlace: z.tuple([text, text]),
  countPublicProvinces: z.tuple([]),
  listPublicProvinces: z.tuple([]),
  getPublicProvince: z.tuple([text]),
  getPublicProvinceById: z.tuple([text]),
  listProvinceVerificationPoints: z.tuple([text]),
  findPublicCandidates: z.tuple([z.object({
    paths,
    keywords: z.array(z.string().max(100)).max(50),
    perType: z.number().int().min(1).max(100),
    exclude: ids(1000).optional(),
    verifiedIds: ids(50_000).optional(),
  })]),
  searchPublicContent: z.tuple([paths, text, z.number().int().min(1).max(100), z.boolean()]),
  listPublicMapLayers: z.tuple([paths]),
  listPublicMapFeatures: z.tuple([paths, z.tuple([lng, lat, lng, lat]).optional(), z.number().int().min(1).max(1000)]),
  findNearbyPublicPlaces: z.tuple([paths, lat, lng, z.number().min(1).max(500_000), z.number().int().min(1).max(200)]),
  reverseGeocode: z.tuple([lat, lng]),
  listPublicSectionItems: z.tuple([text, z.number().int().min(1).max(100), z.object({
    excludeIds: ids(1000).optional(),
    upcomingFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).optional()]),
} satisfies Record<keyof ContentReaderPort, z.ZodTypeAny>;

export type ContentReaderMethod = keyof typeof CONTENT_READER_RPC;
export const isContentReaderMethod = (name: string): name is ContentReaderMethod => Object.hasOwn(CONTENT_READER_RPC, name);
export const CONTENT_READER_RPC_PREFIX = "/internal/content/read";
