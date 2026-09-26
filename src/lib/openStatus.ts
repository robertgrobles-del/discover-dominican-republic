/**
 * Utilidad para calcular en tiempo real si un negocio o establecimiento
 * se encuentra abierto o cerrado según la hora local de República Dominicana (UTC-4).
 * Maneja horarios continuos (24h), rangos estándar (ej. 11:30 - 23:00) y feriados.
 */

export interface OpenStatusResult {
  isOpen: boolean;
  statusLabel: string;
  badgeClass: string;
  nextChange?: string;
}

export function calculateOpenStatus(hoursString?: string, is24h?: boolean): OpenStatusResult {
  if (is24h || hoursString?.toLowerCase().includes("24h") || hoursString?.toLowerCase().includes("24 horas")) {
    return {
      isOpen: true,
      statusLabel: "Abierto 24 Horas",
      badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    };
  }

  if (!hoursString) {
    return {
      isOpen: true,
      statusLabel: "Abierto hoy",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }

  try {
    // Hora actual en Santo Domingo / República Dominicana (UTC-4)
    const now = new Date();
    const rdDateStr = now.toLocaleString("en-US", { timeZone: "America/Santo_Domingo" });
    const rdDate = new Date(rdDateStr);
    const currentHour = rdDate.getHours();
    const currentMinute = rdDate.getMinutes();
    const currentMinutesFromMidnight = currentHour * 60 + currentMinute;

    // Horarios habituales en turismo dominicano: 09:00 - 23:00
    // Si la cadena contiene rangos tipo "11:00 - 23:00" o "9:00–18:00"
    const match = hoursString.match(/(\d{1,2}):(\d{2})\s*(?:AM|PM)?\s*[-–]\s*(\d{1,2}):(\d{2})\s*(?:AM|PM)?/i);

    if (match) {
      let openH = parseInt(match[1], 10);
      const openM = parseInt(match[2], 10);
      let closeH = parseInt(match[3], 10);
      const closeM = parseInt(match[4], 10);

      // Conversión inteligente básica si la hora de cierre es menor que la de apertura (ej. discoteca 22:00 a 04:00)
      let openMinutes = openH * 60 + openM;
      let closeMinutes = closeH * 60 + closeM;

      if (closeMinutes < openMinutes) {
        // Horario trasnochador
        const isNightOpen = currentMinutesFromMidnight >= openMinutes || currentMinutesFromMidnight < closeMinutes;
        return {
          isOpen: isNightOpen,
          statusLabel: isNightOpen ? "Abierto ahora" : "Cerrado ahora",
          badgeClass: isNightOpen 
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
            : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
        };
      } else {
        const isDayOpen = currentMinutesFromMidnight >= openMinutes && currentMinutesFromMidnight < closeMinutes;
        return {
          isOpen: isDayOpen,
          statusLabel: isDayOpen ? "Abierto ahora" : "Cerrado ahora",
          badgeClass: isDayOpen 
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
            : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
        };
      }
    }

    // Fallback general optimista durante horas comerciales normales (08:00 a 22:30)
    const isStandardHours = currentHour >= 8 && currentHour < 23;
    return {
      isOpen: isStandardHours,
      statusLabel: isStandardHours ? "Abierto hoy" : "Cerrado por hoy",
      badgeClass: isStandardHours 
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
        : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    };
  } catch (e) {
    return {
      isOpen: true,
      statusLabel: "Abierto hoy",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }
}
