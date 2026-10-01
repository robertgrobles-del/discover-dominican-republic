/** Captación de un contacto comercial con su consentimiento; el embudo de leads es de `marketing`. */
export interface LeadCapturePort {
  capture(lead: { name: string; email: string; phone?: string | null; company?: string | null; message?: string | null; source?: string | null; interest?: string | null }): Promise<void>;
}

/** Apertura de un ticket de soporte desde otro dominio; la bandeja de soporte es de `forms`. */
export interface SupportIntakePort {
  /** Devuelve el id del ticket creado. */
  openTicket(ticket: { subject: string; description: string; category: string; contactName: string; contactEmail: string }): Promise<string>;
}
