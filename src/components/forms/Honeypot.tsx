/** Campo trampa: invisible para personas; si un bot lo rellena, fetchApi lo envía y la API descarta el envío. */
export const HP_FIELD = "hp_website";

export function Honeypot() {
  return (
    <input type="text" name={HP_FIELD} tabIndex={-1} autoComplete="off" aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0" />
  );
}
