import type { PoolClient } from "pg";

/**
 * Parte de un dominio en el borrado de una cuenta (Ley 172-13): elimina o anonimiza sólo sus propios datos,
 * dentro de la transacción del orquestador. Mientras las bases estén juntas es atómico; al separarlas,
 * cada participante pasa a reaccionar a un evento `account.erased`.
 */
export type AccountErasureParticipant = (c: PoolClient, userId: string) => Promise<void>;
