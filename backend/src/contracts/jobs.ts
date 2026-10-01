import type { FastifyBaseLogger } from "fastify";

/** Stable command contract for registering domain work with the platform scheduler. */
export interface ScheduledJobDefinition {
  name: string;
  description: string;
  everySeconds: number;
  run: (ctx: { now: Date; log: FastifyBaseLogger }) => Promise<Record<string, unknown> | void>;
}

export interface JobRegistrar {
  register(job: ScheduledJobDefinition): void;
}

export interface ScheduledJobResult {
  status: "success" | "failed";
  result?: unknown;
  error?: string;
  request_id?: string;
}

export interface ScheduledJobRow {
  name: string;
  description: string;
  interval_seconds: number;
  enabled: boolean;
  status: string;
  last_run_at: string | null;
  next_run_at: string | null;
  last_duration_ms: number | null;
  last_result: unknown;
  error_log: string | null;
}

/** Administrative operations exposed to the control panel, independently of scheduler storage/runtime. */
export interface JobControlPort {
  runNow(name: string, opts?: { requestId?: string }): Promise<ScheduledJobResult>;
  list(): Promise<ScheduledJobRow[]>;
  update(name: string, patch: { enabled?: boolean; interval_seconds?: number }): Promise<void>;
}

/** Full platform scheduler surface used by the composition root and Fastify plugin boundary. */
export interface JobRunnerPort extends JobRegistrar, JobControlPort {
  readonly names: readonly string[];
  sync(): Promise<void>;
  start(tickMs?: number): void;
  stop(): Promise<void>;
  tick(now?: Date): Promise<string[]>;
}
