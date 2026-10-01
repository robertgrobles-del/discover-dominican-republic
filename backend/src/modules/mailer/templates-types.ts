// Compatibility re-export while templates are owned by the mailer implementation.
export type { EmailTemplateData as TemplateData, EmailTemplateKey as TemplateKey } from "../../contracts/email.js";
export interface Rendered { subject: string; text: string; html: string }
