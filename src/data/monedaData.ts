import { DollarSign, Euro, PoundSterling } from "lucide-react";

export interface ExchangeRate {
  id: string;
  rate_date: string;
  currency_code: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'MXN';
  buy_rate: number;
  sell_rate: number;
  created_at: string;
}

export const staticTasas = {
  USD: { buy_rate: 59.20, sell_rate: 59.80, name: "Dólar Estadounidense", symbol: "$", icon: DollarSign, flag: "🇺🇸" },
  EUR: { buy_rate: 64.20, sell_rate: 65.10, name: "Euro", symbol: "€", icon: Euro, flag: "🇪🇺" },
  GBP: { buy_rate: 74.80, sell_rate: 76.00, name: "Libra Esterlina", symbol: "£", icon: PoundSterling, flag: "🇬🇧" },
  CAD: { buy_rate: 43.10, sell_rate: 44.00, name: "Dólar Canadiense", symbol: "C$", icon: DollarSign, flag: "🇨🇦" },
  MXN: { buy_rate: 3.30, sell_rate: 3.50, name: "Peso Mexicano", symbol: "MX$", icon: DollarSign, flag: "🇲🇽" },
};

export const consejosCambio = [
  {
    titulo: "Casas de Cambio",
    descripcion: "Generalmente ofrecen mejores tasas que hoteles y aeropuertos.",
    icon: "🏦"
  },
  {
    titulo: "Tarjetas de Crédito",
    descripcion: "Ampliamente aceptadas en zonas turísticas. Verificar cargos por transacción extranjera.",
    icon: "💳"
  },
  {
    titulo: "Cajeros ATM",
    descripcion: "Disponibles en toda la isla. Pueden cobrar comisión de $3-5 USD por transacción.",
    icon: "🏧"
  },
  {
    titulo: "Propinas",
    descripcion: "10-15% en restaurantes. En pesos dominicanos preferiblemente.",
    icon: "💵"
  },
];

export const preciosReferencia = [
  { item: "Cerveza local (bar)", precio: "150-250 DOP", usd: "$2.50-4" },
  { item: "Almuerzo típico", precio: "300-500 DOP", usd: "$5-8" },
  { item: "Taxi aeropuerto-hotel", precio: "1,500-3,000 DOP", usd: "$25-50" },
  { item: "Tour de medio día", precio: "2,500-5,000 DOP", usd: "$40-85" },
  { item: "Cena en restaurante", precio: "800-2,000 DOP", usd: "$13-35" },
  { item: "Guagua (bus local)", precio: "25-50 DOP", usd: "$0.40-0.85" },
];
