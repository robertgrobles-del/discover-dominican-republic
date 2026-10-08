import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { fetchApi } from "@/lib/fastifyClient";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ShieldCheck,
  Loader2,
  CheckCircle,
  QrCode,
  Download,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    type: string; // 'hotel' | 'tour' | 'restaurante' | 'experiencia' | 'producto'
    price: number;
    image?: string;
  } | null;
}

export function CheckoutModal({ isOpen, onClose, item }: CheckoutModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"billing" | "payment" | "processing" | "success">("billing");
  const [loading, setLoading] = useState(false);
  // La reserva se guardó sólo en la demostración local: no hubo cobro y no debe anunciarse como pagada.
  const [demoBooking, setDemoBooking] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const [insuranceOptIn, setInsuranceOptIn] = useState(false);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [adultsCount, setAdultsCount] = useState(1);

  if (!item) return null;

  // Pricing calculations
  const price = item.price;
  const itbis = Number((price * 0.18).toFixed(2)); // 18% ITBIS tax
  const serviceFee = Number((price * 0.05).toFixed(2)); // 5% platform fee
  const insuranceCost = insuranceOptIn ? 10.00 : 0.00;
  const totalPrice = Number((price + itbis + serviceFee + donationAmount + insuranceCost).toFixed(2));
  const commission = Number((price * 0.10).toFixed(2)); // 10% commission charged to business

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ").substring(0, 19);
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = value;
    if (value.length > 2) {
      formattedValue = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setExpiry(formattedValue.substring(0, 5));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setCvc(value);
  };

  const validateBilling = () => {
    if (!fullName.trim()) {
      toast.error("Por favor ingresa tu nombre completo.");
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Por favor ingresa un correo electrónico válido.");
      return false;
    }
    if (!phone.trim()) {
      toast.error("Por favor ingresa tu número de teléfono.");
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (HAS_BACKEND_SESSION) return true;
    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length < 16) {
      toast.error("Número de tarjeta inválido. Debe tener 16 dígitos.");
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      toast.error("Fecha de expiración inválida (MM/AA).");
      return false;
    }
    if (cvc.length < 3) {
      toast.error("CVC inválido. Debe tener 3 o 4 dígitos.");
      return false;
    }
    return true;
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "billing") {
      if (validateBilling()) {
        trackEvent("booking_start", { type: item.type, total: totalPrice });
        setStep("payment");
      }
      return;
    }

    if (!validatePayment()) return;

    setStep("processing");
    setLoading(true);

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isOperatorType = ["hotel", "tour", "restaurante", "experiencia"].includes(item.type.toLowerCase());
    const isRealOperatorListing = isOperatorType && UUID_REGEX.test(item.id);

    try {
      const idempotencyKey = crypto.randomUUID();
      let demo = false;
      
      if (isRealOperatorListing) {
        // Llamada autoritativa a la API de Fastify para anuncios reales de operadores
        await fetchApi("/bookings", {
          method: "POST",
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            request: {
              listing_id: item.id,
              date: bookingDate,
              adults: adultsCount,
              children: 0,
              infants: 0,
            },
            contact: {
              name: fullName.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim() || undefined,
            },
            payment_mode: HAS_BACKEND_SESSION ? "pay_later" : "pay_now",
            payment_method_token: HAS_BACKEND_SESSION ? undefined : `pm_sim_${cardNumber.replace(/\s/g, "").slice(-4)}`,
            notes: `${donationAmount > 0 ? `Donación: $${donationAmount} USD. ` : ""}${insuranceOptIn ? "Seguro incluido. " : ""}`,
          }),
        }).catch(async (apiError) => {
          // Con el backend real un fallo es un fallo: no se cobra ni se confirma nada
          if (HAS_BACKEND_SESSION) throw apiError;
          demo = true;
          await supabase.from("reservations").insert({
            user_id: user?.id || "00000000-0000-0000-0000-000000000000",
            item_id: item.id,
            item_name: item.name,
            item_type: item.type,
            item_image: item.image || null,
            guests: adultsCount,
            total_price: totalPrice,
            currency: "USD",
            status: "pending",
            contact_name: fullName,
            contact_email: email,
            contact_phone: phone,
            check_in: new Date(bookingDate).toISOString(),
            check_out: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            notes: `Reserva de demostración, sin cobro. ${donationAmount > 0 ? `Donación: $${donationAmount} USD. ` : ""}${insuranceOptIn ? "Seguro incluido." : ""}`,
          });
        });
      } else {
        // El elemento no es un listing con UUID (es esim, producto de tienda, tarjeta prepago, donación o mock)
        demo = true;
        await supabase.from("reservations").insert({
          user_id: user?.id || "00000000-0000-0000-0000-000000000000",
          item_id: item.id,
          item_name: item.name,
          item_type: item.type,
          item_image: item.image || null,
          guests: adultsCount,
          total_price: totalPrice,
          currency: "USD",
          status: "pending",
          contact_name: fullName,
          contact_email: email,
          contact_phone: phone,
          check_in: new Date(bookingDate).toISOString(),
          check_out: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          notes: `Solicitud de servicio (${item.type}), sin cobro en pasarela. ${donationAmount > 0 ? `Donación: $${donationAmount} USD. ` : ""}${insuranceOptIn ? "Seguro incluido." : ""}`,
        }).catch(() => {});
      }

      // Track ambassador sale if referral code is present in session
      const affiliateRef = localStorage.getItem("affiliate_ref");
      if (affiliateRef && totalPrice > 0 && !demo) {
        try {
          await supabase.rpc("track_ambassador_sale", {
            ref_code: affiliateRef,
            purchase_amount: totalPrice,
            buyer_email: email.trim().toLowerCase(),
          });
        } catch {
          // Silent catch for resilience
        }
      }

      setDemoBooking(demo);
      setStep("success");
      if (!demo) trackEvent("booking_complete", { type: item.type, total: totalPrice, has_referral: !!affiliateRef });
      if (demo) {
        if (!isOperatorType) {
          toast.success(`Solicitud de ${item.name} registrada (modo demostración / confirmación directa).`);
        } else {
          toast.success("Reserva de demostración registrada. No se realizó ningún cobro.");
        }
      } else {
        toast.success("¡Reserva confirmada con el operador con éxito!");
      }
    } catch (err: any) {
      toast.error(`Error al procesar la reserva: ${err.message || "Por favor intente nuevamente."}`);
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep("billing");
    setCardNumber("");
    setExpiry("");
    setCvc("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
      <DialogContent className="sm:max-w-[480px] overflow-hidden max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {step === "success" ? (
              <span className="text-emerald-500 flex items-center gap-1.5">
                <CheckCircle className="h-6 w-6" /> Confirmación de Reserva
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" /> Pago Seguro
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "success"
              ? demoBooking ? "Reserva de demostración: no se realizó ningún cobro." : "Tu pago ha sido procesado. Guarda tu recibo con código QR."
              : "Checkout directo y seguro procesado por Stripe."}
          </DialogDescription>
        </DialogHeader>

        {!user && step !== "success" ? (
          <div className="p-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Inicia Sesión para Reservar</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Debes iniciar sesión con tu cuenta de viajero para procesar pagos y guardar tu historial de reservas.
              </p>
            </div>
            <Button className="w-full mt-2" onClick={() => window.location.href = "/login"}>
              Ir a Iniciar Sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={processPayment} className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
            <AnimatePresence mode="wait">
              {/* STEP 1: BILLING DETAILS */}
              {step === "billing" && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2 mb-4 border border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-bold">${price} USD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Impuestos (ITBIS 18%)</span>
                      <span className="text-muted-foreground">${itbis} USD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cargo de servicio (5%)</span>
                      <span className="text-muted-foreground">${serviceFee} USD</span>
                    </div>
                    {donationAmount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-500 font-medium">
                        <span>Donación Parques Nacionales</span>
                        <span>+${donationAmount} USD</span>
                      </div>
                    )}
                    {insuranceOptIn && (
                      <div className="flex justify-between text-sm text-emerald-500 font-medium">
                        <span>Seguro de Cancelación</span>
                        <span>+$10.00 USD</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between font-bold text-base text-primary">
                      <span>Total a pagar</span>
                      <span>${totalPrice} USD</span>
                    </div>
                  </div>

                  {/* National Parks Conservation Donation Checkbox / Selector */}
                  <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20 space-y-3 mb-4">
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg">🌱</span>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Donar a Parques Nacionales (Opcional)</h4>
                        <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                          Apoya la conservación de áreas protegidas dominicanas (Los Haitises, Jaragua, Cotubanamá, etc.).
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[0, 1, 5, 10].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setDonationAmount(amount)}
                          className={`py-1.5 rounded-lg text-xs font-bold font-mono border transition-all ${
                            donationAmount === amount
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-background hover:bg-muted text-foreground border-border"
                          }`}
                        >
                          {amount === 0 ? "No donar" : `+$${amount}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cancellation Insurance Option */}
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 space-y-2 mb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={insuranceOptIn}
                        onChange={(e) => setInsuranceOptIn(e.target.checked)}
                        className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          🛡️ Seguro de Cancelación Protegida <span className="text-[10px] text-primary font-mono font-bold">(+$10.00 USD)</span>
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                          Recupera el 100% de tu dinero si cancelas hasta 24 horas antes de la reserva.
                        </p>
                      </div>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="bookingDate">Fecha deseada</Label>
                      <Input
                        id="bookingDate"
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="adultsCount">Personas</Label>
                      <Input
                        id="adultsCount"
                        type="number"
                        min={1}
                        max={20}
                        value={adultsCount}
                        onChange={(e) => setAdultsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      placeholder="Juan Pérez"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (809) 555-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4">
                    Continuar al Pago
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: CONFIRMATION / PAYMENT */}
              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center bg-primary/5 rounded-lg p-3 text-sm border border-primary/10">
                    <span className="font-medium">Total de la reserva:</span>
                    <span className="font-bold text-primary">${totalPrice} USD</span>
                  </div>

                  {HAS_BACKEND_SESSION ? (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5">
                        <p className="font-bold text-sm flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Confirmación Directa con el Operador
                        </p>
                        <p className="leading-relaxed">
                          Tu reserva se emitirá directamente en el sistema oficial del destino. La liquidación se realiza al presentarte en el establecimiento o según las políticas del operador, sin requerir datos de tarjeta de crédito en línea.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep("billing")}>
                          Atrás
                        </Button>
                        <Button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white">
                          Confirmar Reserva
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cardNum">Número de Tarjeta (Modo Demostración)</Label>
                        <div className="relative">
                          <Input
                            id="cardNum"
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className="pr-10 font-mono"
                            required
                          />
                          <CreditCard className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Vencimiento</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={expiry}
                            onChange={handleExpiryChange}
                            className="font-mono text-center"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            type="password"
                            value={cvc}
                            onChange={handleCvcChange}
                            className="font-mono text-center"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg mt-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        <span>Demostración local. No se realizará ningún cargo real.</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep("billing")}>
                          Atrás
                        </Button>
                        <Button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white">
                          Confirmar Demo
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* STEP 3: PROCESSING */}
              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center gap-4"
                >
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <div>
                    <h3 className="font-bold text-lg">Procesando pago seguro</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Autorizando fondos con tu banco. No cierres esta ventana.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS RECEIPT */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center"
                >
                  <div className="bg-muted/40 border border-border rounded-2xl p-6 text-left space-y-4 max-w-sm mx-auto">
                    <div className="text-center pb-4 border-b border-border space-y-1">
                      <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">TICKET DIGITAL</span>
                      <h4 className="font-bold text-lg text-foreground">{item.name}</h4>
                      <Badge variant="secondary" className="mt-1">{item.type.toUpperCase()}</Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Titular:</span>
                        <span className="font-medium text-foreground">{fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground">{email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Localización:</span>
                        <span className="font-medium text-foreground">República Dominicana</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monto Pagado:</span>
                        <span className="font-bold text-emerald-500">${totalPrice} USD</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center border border-border max-w-[160px] mx-auto">
                      <QrCode className="h-28 w-28 text-black" />
                      <span className="text-[10px] font-mono text-black/60 mt-1">Check-in ID: {Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center max-w-sm mx-auto">
                    <Button variant="outline" className="w-1/2 gap-2" onClick={() => window.print()}>
                      <Download className="h-4 w-4" /> Recibo
                    </Button>
                    <Button className="w-1/2" onClick={resetState}>
                      Terminar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
