import { readBodyCapped, traceHeaders } from "./http.js";

export type FetchJson = (url: string) => Promise<{ status: number; json(): Promise<any> }>;
const MAX_JSON_BYTES = 2_000_000;

export const defaultFetchJson: FetchJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: traceHeaders({ accept: "application/json" }) });
  const text = await readBodyCapped(res, MAX_JSON_BYTES);
  return { status: res.status, json: async () => JSON.parse(text) };
};
