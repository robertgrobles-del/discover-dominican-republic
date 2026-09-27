export function PricingFaqSection() {
  return (
    <section className="container mx-auto px-4 lg:px-8 max-w-4xl py-8">
      <h2 className="text-2xl font-bold font-display text-center text-foreground mb-8">
        Preguntas Frecuentes de Empresas
      </h2>
      <div className="space-y-4">
        <div className="bg-card border border-border p-5 rounded-2xl">
          <h4 className="font-bold text-sm text-foreground mb-1">
            ¿Cómo reclamo un negocio que ya aparece en el portal?
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Busca la ficha de tu hotel, restaurante o bar en el directorio y haz clic en el botón <strong>"¿Eres el propietario? Reclama tu ficha"</strong>. Tras validar tus datos y titularidad con el RNC o licencia comercial, recibirás acceso a tu panel.
          </p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl">
          <h4 className="font-bold text-sm text-foreground mb-1">
            ¿Emiten comprobante fiscal (NCF) en República Dominicana?
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sí. Todas nuestras suscripciones y planes publicitarios cuentan con factura electrónica fiscal (B01 con valor fiscal o B02 consumidor final) autorizada por la DGII.
          </p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl">
          <h4 className="font-bold text-sm text-foreground mb-1">
            ¿Puedo cambiar de plan o cancelar en cualquier momento?
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Totalmente. Los planes no tienen permanencia forzosa. Puedes actualizar a Destacado o volver al plan básico gratuito cuando lo desees desde tu panel.
          </p>
        </div>
      </div>
    </section>
  );
}
