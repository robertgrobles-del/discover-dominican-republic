// Etapa 8: equipo y roles del operador.
import type { OperatorOrg, TeamMember } from "./types";

export type PanelRole = "owner" | "admin" | "recepcion" | "guia";

export const ROLE_LABEL: Record<PanelRole, string> = {
  owner: "Propietario", admin: "Administrador", recepcion: "Recepción", guia: "Guía",
};

export const MEMBER_ROLES: Exclude<PanelRole, "owner">[] = ["admin", "recepcion", "guia"];

export const ROLE_DESC: Record<Exclude<PanelRole, "owner">, string> = {
  admin: "Todo el panel, excepto equipo y perfil de la organización.",
  recepcion: "Reservas, solicitudes, calendario y mensajes.",
  guia: "Solo lectura: ve la agenda de las excursiones que le asignes.",
};

/** Secciones del panel (primer segmento de la ruta; "" = inicio) permitidas por rol. */
const ALL = ["", "calendario", "tarifas", "automatizaciones", "anuncios", "mensajes", "reservas", "solicitudes", "ingresos", "informacion", "promocion", "comunidades", "reportes"];
export const ALLOWED: Record<PanelRole, string[]> = {
  owner: [...ALL, "perfil", "equipo"],
  admin: ALL,
  recepcion: ["", "calendario", "reservas", "solicitudes", "mensajes"],
  guia: ["", "calendario", "reservas"],
};

const norm = (s?: string | null) => (s || "").trim().toLowerCase();

export function findMember(org: Pick<OperatorOrg, "team">, email?: string | null): TeamMember | undefined {
  const e = norm(email);
  return e ? org.team?.find((m) => norm(m.email) === e) : undefined;
}
