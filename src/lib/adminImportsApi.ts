import { fetchApi } from "@/lib/fastifyClient";
import { adminPathOf } from "@/lib/adminApi";

export interface ImportEstablecimientosResult {
  job_id: string;
  total: number;
  delimiter: string;
  dry_run: boolean;
}

export interface ImportNote {
  row: number;
  reason: string;
}

export interface ImportJobDetail {
  id: string;
  kind: string;
  status: "queued" | "running" | "done" | "failed";
  dry_run: boolean;
  file_name: string | null;
  delimiter: string | null;
  total: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: ImportNote[];
  warnings: ImportNote[];
  error: string | null;
  progress: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface ImportJobSummary {
  id: string;
  kind: string;
  status: string;
  dry_run: boolean;
  file_name: string | null;
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  created_by: string;
  created_at: string;
  finished_at: string | null;
}

export async function submitEstablecimientosImport(
  csvText: string,
  options?: { fileName?: string; dryRun?: boolean }
): Promise<ImportEstablecimientosResult> {
  const res = await fetchApi<{ data: ImportEstablecimientosResult }>("/admin/imports/establecimientos", {
    method: "POST",
    body: JSON.stringify({
      csv_text: csvText,
      file_name: options?.fileName,
      dry_run: options?.dryRun ?? false,
    }),
  });
  return res.data;
}

export async function getImportJob(jobId: string): Promise<ImportJobDetail> {
  const res = await fetchApi<{ data: ImportJobDetail }>(`/admin/imports/${jobId}`);
  return res.data;
}

export async function listAdminImports(): Promise<ImportJobSummary[]> {
  const res = await fetchApi<{ data: ImportJobSummary[] }>("/admin/imports");
  return res.data;
}

export async function pollImportJobUntilFinished(
  jobId: string,
  onUpdate?: (job: ImportJobDetail) => void,
  intervalMs = 700,
  maxWaitMs = 120000
): Promise<ImportJobDetail> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const job = await getImportJob(jobId);
    if (onUpdate) onUpdate(job);
    if (job.status === "done" || job.status === "failed") {
      return job;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("La importación excedió el tiempo máximo de espera.");
}

export async function importCmsCollection(
  entity: string,
  rows: Record<string, unknown>[],
  dryRun = false
): Promise<{ dry_run: boolean; inserted: number; updated: number }> {
  const path = adminPathOf(entity);
  const res = await fetchApi<{ data: { dry_run: boolean; inserted: number; updated: number } }>(
    `/admin/${path}/import?dry_run=${dryRun ? "true" : "false"}`,
    {
      method: "POST",
      body: JSON.stringify({ rows }),
    }
  );
  return res.data;
}
