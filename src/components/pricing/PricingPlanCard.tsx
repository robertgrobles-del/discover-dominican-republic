import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";
import { PricingPlanItem } from "@/data/pricingPlansData";

interface PricingPlanCardProps {
  plan: PricingPlanItem;
  billingCycle: "monthly" | "annual";
}

export function PricingPlanCard({ plan, billingCycle }: PricingPlanCardProps) {
  const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
        plan.popular
          ? "bg-card border-2 border-primary shadow-2xl scale-[1.02] z-10"
          : "bg-card/70 border border-border shadow-md hover:border-border/80"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground font-bold text-xs uppercase px-4 py-1 shadow-md">
            {plan.badge}
          </Badge>
        </div>
      )}

      <div>
        {!plan.popular && (
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {plan.badge}
          </div>
        )}

        <h3 className="text-2xl font-bold font-display text-foreground mb-2">
          {plan.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-6 min-h-[36px]">
          {plan.tagline}
        </p>

        {/* Pricing Display */}
        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold font-display text-foreground">
              ${price}
            </span>
            <span className="text-xs text-muted-foreground">
              USD / mes {billingCycle === "annual" && price > 0 ? "(facturado anualmente)" : ""}
            </span>
          </div>
          {price === 0 && (
            <span className="text-xs text-emerald-500 font-semibold mt-1 inline-block">
              Sin tarjeta de crédito requerida
            </span>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          <div className="text-xs font-bold uppercase text-foreground/80 tracking-wider">
            Qué incluye:
          </div>
          {plan.features.map((feat, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{feat}</span>
            </div>
          ))}

          {plan.notIncluded.length > 0 && (
            <div className="pt-2 space-y-2 opacity-50">
              {plan.notIncluded.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs line-through text-muted-foreground">
                  <span className="h-4 w-4 flex items-center justify-center text-xs flex-shrink-0">✕</span>
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div>
        <ClaimBusinessModal
          businessName="Tu Empresa"
          businessType="otro"
          triggerButton={
            <Button
              variant={plan.popular ? "default" : "outline"}
              className={`w-full rounded-xl py-6 font-bold text-sm shadow-sm gap-2 ${
                plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
              }`}
            >
              {plan.ctaText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
