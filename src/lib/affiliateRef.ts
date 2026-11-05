/**
 * Código de afiliado vigente (embajador o enlace de creador) que guardó `AffiliateReferralCapture` tras validarlo.
 * Se envía como `ref_code` al crear un pedido; el servidor vuelve a validarlo y descarta las autocompras.
 */
export function getAffiliateRef(): string | undefined {
  try {
    const ref = localStorage.getItem("affiliate_ref");
    const expiresAt = Number(localStorage.getItem("affiliate_ref_expires_at") || 0);
    return ref && expiresAt > Date.now() ? ref : undefined;
  } catch {
    return undefined;
  }
}
