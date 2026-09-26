import { 
  Compass, 
  Mountain, 
  Waves, 
  Palmtree, 
  Music, 
  Heart, 
  Utensils, 
  Users 
} from "lucide-react";

import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";
import whaleSamana from "@/assets/whale-samana.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import merengue from "@/assets/merengue-dance.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import hotelEdenRoc from "@/assets/hotel-eden-roc.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puntaCana from "@/assets/punta-cana.jpg";

export interface ExperienceCategory {
  id: string;
  label: string;
  icon: any;
}

export interface StaticExperienceItem {
  id: string;
  nombre: string;
  imagen: string;
  desc: string;
  cat: string;
  link?: string;
}

export const experienceCategories: ExperienceCategory[] = [
  { id: "todos", label: "Todos", icon: Compass },
  { id: "naturaleza", label: "Naturaleza", icon: Palmtree },
  { id: "aventura", label: "Aventura", icon: Mountain },
  { id: "cultura", label: "Cultura", icon: Music },
  { id: "acuaticos", label: "Acuáticos", icon: Waves },
  { id: "gastronomia", label: "Gastronomía", icon: Utensils },
  { id: "bienestar", label: "Bienestar", icon: Heart },
  { id: "familia", label: "Familia", icon: Users },
];

export const staticExperiencias: StaticExperienceItem[] = [
  { id: "ecoturismo", nombre: "Ecoturismo", imagen: whaleSamana, desc: "Conecta con la naturaleza virgen de RD", cat: "naturaleza" },
  { id: "aventura", nombre: "Aventura", imagen: adventure, desc: "Adrenalina en el paraíso caribeño", cat: "aventura" },
  { id: "parques-tematicos", nombre: "Parques Temáticos", imagen: puntaCana, desc: "Diversión extrema y emociones para todos", link: "/parques-tematicos", cat: "aventura" },
  { id: "cultura", nombre: "Cultura", imagen: santoDomingo, desc: "500 años de historia viva", cat: "cultura" },
  { id: "romance", nombre: "Romance", imagen: relaxBeach, desc: "Amor en el Caribe", cat: "bienestar" },
  { id: "golf", nombre: "Golf", imagen: hotelEdenRoc, desc: "Campos de clase mundial", cat: "aventura" },
  { id: "gastronomia", nombre: "Gastronomía", imagen: gastronomy, desc: "Sabores del Caribe", cat: "gastronomia" },
  { id: "familia", nombre: "Familia", imagen: puntaCana, desc: "Diversión para todas las edades", cat: "familia" },
  { id: "deportes", nombre: "Deportes", imagen: adventure, desc: "Recreación al aire libre", cat: "aventura" },
  { id: "acuaticos", nombre: "Deportes Acuáticos", imagen: diving, desc: "Aventura en el mar", cat: "acuaticos" },
  { id: "museos", nombre: "Museos", imagen: santoDomingo, desc: "Historia y arte", cat: "cultura" },
  { id: "bienestar", nombre: "Bienestar y Salud", imagen: relaxBeach, desc: "Tu refugio de paz y sanación", link: "/wellness", cat: "bienestar" },
  { id: "turismo-medico", nombre: "Turismo Médico", imagen: hotelEdenRoc, desc: "Salud de clase mundial a precios accesibles", link: "/turismo-medico", cat: "bienestar" },
  { id: "nomadas", nombre: "Nómadas Digitales", imagen: puntaCana, desc: "Trabaja desde el paraíso caribeño", link: "/nomadas-digitales", cat: "bienestar" },
  { id: "lujo", nombre: "Lujo", imagen: hotelEdenRoc, desc: "Experiencias exclusivas", cat: "bienestar" },
  { id: "compras", nombre: "Compras", imagen: merengue, desc: "Tesoros del Caribe", cat: "cultura" },
];
