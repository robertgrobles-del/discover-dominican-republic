import {
  Target, Map, BookOpen, Award, Gem, Gift, Compass, Zap, TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface HubFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
  link: string;
  color: string;
  bg: string;
}

export const features: HubFeature[] = [
  { icon: Target, title: "Retos Turísticos", desc: "Completa misiones de exploración, gastronomía y cultura", link: "/retos-turisticos", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Map, title: "Mapa de Misiones", desc: "Descubre retos cercanos en el mapa interactivo", link: "/mapa-misiones", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: BookOpen, title: "Trivia Turística", desc: "Pon a prueba tus conocimientos del país", link: "/trivia-turistica", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Award, title: "Insignias", desc: "Colecciona badges explorando destinos", link: "/badges", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Gem, title: "Coleccionables", desc: "Desbloquea un souvenir digital por cada destino visitado", link: "/souvenirs-digitales", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Gift, title: "Recompensas", desc: "Canjea tus monedas por descuentos con negocios aliados", link: "/club-recompensas", color: "text-primary", bg: "bg-primary/10" },
];

export interface HowItWorksStep {
  step: number;
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const howItWorks: HowItWorksStep[] = [
  { step: 1, icon: Compass, title: "Explora", desc: "Visita destinos, playas, restaurantes y museos en toda RD" },
  { step: 2, icon: Target, title: "Completa Retos", desc: "Activa misiones de exploración, gastronomía, cultura y fotografía" },
  { step: 3, icon: Zap, title: "Gana XP y Monedas", desc: "Cada acción te da puntos de experiencia y monedas virtuales" },
  { step: 4, icon: TrendingUp, title: "Sube de Nivel", desc: "Desbloquea nuevos retos, insignias y descuentos exclusivos" },
  { step: 5, icon: Gift, title: "Canjea Premios", desc: "Usa tus monedas para obtener experiencias y beneficios reales" },
];

export interface AmberStoryStep {
  step: number;
  title: string;
  desc: string;
  xp: number;
  icon: string;
}

export const AMBER_STORY_STEPS: AmberStoryStep[] = [
  { step: 1, title: "Rumor en Santiago", desc: "Don Tomás te habla de una vieja veta en las colinas.", xp: 30, icon: "🗣️" },
  { step: 2, title: "Mina de Puerto Plata", desc: "Explora las colinas del norte en busca de la resina.", xp: 50, icon: "⛰️" },
  { step: 3, title: "Pulido de Gema", desc: "Limpia y trabaja la resina para revelar su brillo.", xp: 40, icon: "✨" },
  { step: 4, title: "Museo del Ámbar", desc: "Presenta tu hallazgo ante arqueólogos expertos.", xp: 60, icon: "🏛️" },
  { step: 5, title: "El Secreto Revelado", desc: "Descubre el insecto prehistórico fosilizado.", xp: 100, icon: "💎" },
];

export const AMBER_STORY_REWARDS = [
  { xp: 30, coins: 10, desc: "Rumor en Santiago completado" },
  { xp: 50, coins: 15, desc: "Búsqueda en mina de Puerto Plata completada" },
  { xp: 40, coins: 10, desc: "Pulido de la gema completado" },
  { xp: 60, coins: 20, desc: "Visita al Museo del Ámbar completada" },
  { xp: 100, coins: 50, desc: "¡Revelaste el secreto del Ámbar Dominicano!" },
];
