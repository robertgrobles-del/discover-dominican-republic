import { createHash, randomBytes } from "node:crypto";

/** Token opaco de alta entropía; sólo su hash SHA-256 se guarda en la base de datos. */
export const newOpaqueToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
