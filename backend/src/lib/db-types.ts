export type ColType = "uuid" | "text" | "integer" | "numeric" | "boolean" | "jsonb" | "array" | "timestamp" | "date";

/** Normaliza tipos PostgreSQL a los tipos compartidos por contratos de contenido y administración. */
export const normalizeType = (dataType: string): ColType => {
  switch (dataType) {
    case "uuid": return "uuid";
    case "integer": case "smallint": case "bigint": return "integer";
    case "numeric": case "double precision": case "real": return "numeric";
    case "boolean": return "boolean";
    case "jsonb": case "json": return "jsonb";
    case "ARRAY": return "array";
    case "timestamp with time zone": case "timestamp without time zone": return "timestamp";
    case "date": return "date";
    default: return "text";
  }
};
