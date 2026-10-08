import { reportError } from "./errorReporter";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: Error | unknown;
}

const isDev = import.meta.env.DEV;

class Logger {
  private formatPrefix(level: LogLevel): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [DescubreRD] [${level.toUpperCase()}]`;
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (isDev) {
      console.debug(this.formatPrefix("debug"), message, context ?? "");
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    if (isDev) {
      console.info(this.formatPrefix("info"), message, context ?? "");
    }
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(this.formatPrefix("warn"), message, context ?? "");
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    console.error(this.formatPrefix("error"), message, error ?? "", context ?? "");
    if (error) {
      reportError(error, { source: "api" });
    }
  }
}

export const logger = new Logger();
