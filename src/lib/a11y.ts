import type { KeyboardEvent } from "react";

/** Enter/Espacio sobre un elemento con role="button" dispara su propio onClick (sólo si la tecla no viene de un hijo). */
export function activateOnKey(e: KeyboardEvent<HTMLElement>) {
  if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
  e.preventDefault();
  e.currentTarget.click();
}
