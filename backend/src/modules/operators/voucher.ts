import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import type { BookingDto } from "./bookings.js";

const BLUE = "#0b5cab", GRAY = "#6b7280", DARK = "#1f2937";
const money = (n: number, cur: string) => `${cur === "USD" ? "US$" : "RD$"} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const STATUS: Record<string, string> = { confirmed: "CONFIRMADA", in_progress: "EN CURSO", completed: "COMPLETADA" };
const PAYMENT: Record<string, string> = { paid: "Pagada", partial: "Pago parcial", unpaid: "Por pagar", refunded: "Reembolsada" };

/** Formatos de fecha legibles ("12 de marzo de 2027") sin depender del huso horario del servidor. */
const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Voucher de una reserva en PDF (docs §5.8): datos de la reserva y un QR con su referencia, que el personal del operador valida
 * en `POST /tickets/verify`. Se arma en memoria; no se guarda nada.
 */
export async function renderVoucher(b: BookingDto, opts: { webBaseUrl: string }): Promise<Buffer> {
  const qr = await QRCode.toBuffer(b.reference, { margin: 1, width: 240, errorCorrectionLevel: "M" });
  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Voucher ${b.reference}`, Author: "Descubre RD", Subject: b.listing.title } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res, rej) => { doc.on("end", () => res(Buffer.concat(chunks))); doc.on("error", rej); });

  const W = doc.page.width - 96;
  doc.rect(0, 0, doc.page.width, 84).fill(BLUE);
  doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text("Descubre RD", 48, 28);
  doc.fontSize(11).font("Helvetica").text("Voucher de reserva", 48, 56);
  doc.fontSize(11).font("Helvetica-Bold").text(STATUS[b.status] ?? b.status.toUpperCase(), 48, 36, { width: W, align: "right" });

  doc.fillColor(GRAY).fontSize(10).font("Helvetica").text("REFERENCIA", 48, 112);
  doc.fillColor(DARK).fontSize(28).font("Helvetica-Bold").text(b.reference, 48, 126);
  doc.image(qr, doc.page.width - 48 - 130, 104, { width: 130 });
  doc.fillColor(GRAY).fontSize(8).font("Helvetica").text("Presenta este código al llegar", doc.page.width - 48 - 140, 238, { width: 150, align: "center" });

  let y = 184;
  const row = (label: string, value: string, bold = false) => {
    doc.fillColor(GRAY).fontSize(9).font("Helvetica").text(label.toUpperCase(), 48, y, { width: 130 });
    doc.fillColor(DARK).fontSize(11).font(bold ? "Helvetica-Bold" : "Helvetica").text(value, 180, y - 1, { width: 230 });
    y = Math.max(y + 22, doc.y + 8);
  };
  row("Servicio", b.listing.title, true);
  row("Operador", b.operator.name);
  if (b.room_name) row("Habitación", b.room_name);
  row(b.check_out ? "Llegada" : "Fecha", `${longDate(b.date)}${b.time ? ` · ${b.time}` : ""}`, true);
  if (b.check_out) row("Salida", longDate(b.check_out));
  row("Personas", `${b.adults} adulto${b.adults === 1 ? "" : "s"}${b.children ? `, ${b.children} niño${b.children === 1 ? "" : "s"}` : ""}${b.infants ? `, ${b.infants} bebé${b.infants === 1 ? "" : "s"}` : ""}`);
  row("A nombre de", b.contact.name);
  if (b.contact.phone) row("Teléfono", b.contact.phone);

  y = Math.max(y, 268) + 10;
  doc.moveTo(48, y).lineTo(48 + W, y).strokeColor("#e5e7eb").stroke();
  y += 14;
  row("Total", money(b.total_price, b.currency), true);
  row("Pagado", money(b.amount_paid, b.currency));
  if (b.balance_due > 0) row("Saldo por pagar", money(b.balance_due, b.currency), true);
  row("Estado del pago", PAYMENT[b.payment_status] ?? b.payment_status);

  y += 6;
  doc.moveTo(48, y).lineTo(48 + W, y).strokeColor("#e5e7eb").stroke();
  y += 14;
  row("Cancelación", b.cancellation.description);
  if (b.notes) row("Notas", b.notes);

  doc.fillColor(GRAY).fontSize(8).font("Helvetica").text(`Gestiona tu reserva en ${opts.webBaseUrl}/reservas/${b.reference}. Este voucher no es un comprobante fiscal.`, 48, doc.page.height - 60, { width: W, align: "center" });
  doc.end();
  return done;
}
