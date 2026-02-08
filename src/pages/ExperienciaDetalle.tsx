import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link, useParams } from "react-router-dom";
import { MapPin, Star, Clock, Users, ChevronRight, Heart, Share2, Play, Instagram, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { DetailPageSidebarAd, MobileStickyFooterAd, BetweenSectionsAd } from "@/components/ads";

import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";
import heroBeach from "@/assets/hero-beach.jpg";
import whaleSamana from "@/assets/whale-samana.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import merengue from "@/assets/merengue-dance.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import hotelEdenRoc from "@/assets/hotel-eden-roc.jpg";
import samana from "@/assets/samana.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";

// Experiences data
const experienciasData: Record<string, {
  id: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  heroImage: string;
  galeria: string[];
  highlights: string[];
  lugares: { nombre: string; region: string; imagen: string; link: string }[];
  rutasInfluencers: { nombre: string; handle: string; avatar: string; ruta: string; descripcion: string }[];
  recomendaciones: string[];
  actividadesRelacionadas: { nombre: string; precio: number; duracion: string; imagen: string; rating: number }[];
}> = {
  ecoturismo: {
    id: "ecoturismo",
    nombre: "Ecoturismo",
    subtitulo: "Conecta con la Naturaleza",
    descripcion: "Descubre la biodiversidad única de República Dominicana a través de experiencias sostenibles que respetan y protegen nuestros ecosistemas naturales.",
    heroImage: whaleSamana,
    galeria: [whaleSamana, adventure, samana, diving],
    highlights: ["Parques nacionales protegidos", "Observación de ballenas", "Reservas de biosfera", "Turismo comunitario"],
    lugares: [
      { nombre: "Parque Nacional Los Haitises", region: "Samaná", imagen: samana, link: "/destino/samana" },
      { nombre: "Bahía de las Águilas", region: "Pedernales", imagen: heroBeach, link: "/destino/pedernales" },
      { nombre: "Reserva Científica Valle Nuevo", region: "Constanza", imagen: adventure, link: "/destino/constanza" },
      { nombre: "Laguna Oviedo", region: "Barahona", imagen: diving, link: "/destino/barahona" },
    ],
    rutasInfluencers: [
      { nombre: "María Fernández", handle: "@viajera_eco", avatar: relaxBeach, ruta: "5 días eco en Samaná", descripcion: "Avistamiento de ballenas, kayak en manglares y senderismo al Salto del Limón." },
      { nombre: "Carlos Verde", handle: "@naturaleza_rd", avatar: adventure, ruta: "Ruta Sur Profundo", descripcion: "Bahía de las Águilas, Laguna Oviedo y Hoyo de Pelempito en 4 días." },
    ],
    recomendaciones: ["Lleva ropa cómoda y biodegradable", "Respeta los senderos marcados", "No alimentes a la fauna silvestre", "Contrata guías locales certificados"],
    actividadesRelacionadas: [
      { nombre: "Avistamiento de Ballenas", precio: 85, duracion: "4 horas", imagen: whaleSamana, rating: 4.9 },
      { nombre: "Kayak en Manglares", precio: 45, duracion: "3 horas", imagen: diving, rating: 4.7 },
      { nombre: "Senderismo Los Haitises", precio: 65, duracion: "5 horas", imagen: samana, rating: 4.8 },
    ],
  },
  aventura: {
    id: "aventura",
    nombre: "Aventura",
    subtitulo: "Adrenalina en el Paraíso",
    descripcion: "Desde los 27 charcos de Damajagua hasta el rafting en Jarabacoa, República Dominicana es el destino perfecto para los amantes de la aventura.",
    heroImage: adventure,
    galeria: [adventure, diving, samana, whaleSamana],
    highlights: ["Rafting y canyoning", "Tirolesas extremas", "Parapente", "Escalada y rappel"],
    lugares: [
      { nombre: "27 Charcos de Damajagua", region: "Puerto Plata", imagen: adventure, link: "/destino/puerto-plata" },
      { nombre: "Jarabacoa", region: "La Vega", imagen: samana, link: "/destino/jarabacoa" },
      { nombre: "Pico Duarte", region: "La Vega", imagen: adventure, link: "/destino/pico-duarte" },
      { nombre: "Cueva Fun Fun", region: "Hato Mayor", imagen: diving, link: "/destino/hato-mayor" },
    ],
    rutasInfluencers: [
      { nombre: "Pedro Aventurero", handle: "@extreme_rd", avatar: adventure, ruta: "Semana de Adrenalina", descripcion: "27 Charcos, rafting en Jarabacoa, y subida al Pico Duarte en 7 días épicos." },
      { nombre: "Ana Montaña", handle: "@alturas_rd", avatar: samana, ruta: "Conquista el Pico", descripcion: "Preparación y ascenso al punto más alto del Caribe en 3 días." },
    ],
    recomendaciones: ["Entrena previamente para actividades de alta intensidad", "Usa calzado apropiado y resistente al agua", "Contrata operadores certificados", "Lleva protección solar reef-safe"],
    actividadesRelacionadas: [
      { nombre: "27 Charcos de Damajagua", precio: 55, duracion: "4 horas", imagen: adventure, rating: 4.9 },
      { nombre: "Rafting Río Yaque", precio: 75, duracion: "3 horas", imagen: diving, rating: 4.8 },
      { nombre: "Tirolesa Anamuya", precio: 89, duracion: "2 horas", imagen: samana, rating: 4.7 },
    ],
  },
  cultura: {
    id: "cultura",
    nombre: "Cultura",
    subtitulo: "500 Años de Historia",
    descripcion: "La primera ciudad del Nuevo Mundo, ritmos de merengue y bachata, y tradiciones que definen la identidad dominicana.",
    heroImage: santoDomingo,
    galeria: [santoDomingo, merengue, gastronomy, samana],
    highlights: ["Zona Colonial UNESCO", "Música y baile", "Artesanías", "Festivales tradicionales"],
    lugares: [
      { nombre: "Zona Colonial", region: "Santo Domingo", imagen: santoDomingo, link: "/destino/santo-domingo" },
      { nombre: "Altos de Chavón", region: "La Romana", imagen: hotelEdenRoc, link: "/destino/la-romana" },
      { nombre: "Santiago de los Caballeros", region: "Santiago", imagen: adventure, link: "/destino/santiago" },
      { nombre: "La Vega (Carnaval)", region: "La Vega", imagen: merengue, link: "/destino/la-vega" },
    ],
    rutasInfluencers: [
      { nombre: "Lucía Historia", handle: "@patrimonio_rd", avatar: santoDomingo, ruta: "Ruta Colonial Completa", descripcion: "Zona Colonial, Alcázar de Colón, y los mejores museos en 3 días culturales." },
      { nombre: "Juan Música", handle: "@ritmos_rd", avatar: merengue, ruta: "Merengue y Bachata Tour", descripcion: "Clases de baile, colmadones y conciertos en vivo." },
    ],
    recomendaciones: ["Visita los museos temprano para evitar multitudes", "Reserva clases de baile con anticipación", "Prueba la gastronomía local en cada destino", "Respeta los espacios religiosos"],
    actividadesRelacionadas: [
      { nombre: "Tour Zona Colonial", precio: 35, duracion: "3 horas", imagen: santoDomingo, rating: 4.9 },
      { nombre: "Clase de Merengue", precio: 25, duracion: "2 horas", imagen: merengue, rating: 4.8 },
      { nombre: "Tour Gastronómico", precio: 65, duracion: "4 horas", imagen: gastronomy, rating: 4.7 },
    ],
  },
  romance: {
    id: "romance",
    nombre: "Romance",
    subtitulo: "Amor en el Paraíso",
    descripcion: "Bodas de ensueño, lunas de miel inolvidables y escapadas románticas en los destinos más bellos del Caribe.",
    heroImage: relaxBeach,
    galeria: [relaxBeach, heroBeach, hotelEdenRoc, samana],
    highlights: ["Bodas en la playa", "Spas de parejas", "Cenas privadas al atardecer", "Suites de luna de miel"],
    lugares: [
      { nombre: "Cap Cana", region: "Punta Cana", imagen: hotelEdenRoc, link: "/destino/punta-cana" },
      { nombre: "Samaná", region: "Samaná", imagen: samana, link: "/destino/samana" },
      { nombre: "Casa de Campo", region: "La Romana", imagen: relaxBeach, link: "/destino/la-romana" },
      { nombre: "Playa Rincón", region: "Samaná", imagen: heroBeach, link: "/destino/samana" },
    ],
    rutasInfluencers: [
      { nombre: "Carolina & Luis", handle: "@love_caribbean", avatar: relaxBeach, ruta: "Luna de Miel Perfecta", descripcion: "7 días entre spas, playas privadas y cenas románticas." },
      { nombre: "Wedding Planner RD", handle: "@bodas_rd", avatar: heroBeach, ruta: "Destination Wedding", descripcion: "Guía completa para tu boda soñada en el Caribe." },
    ],
    recomendaciones: ["Reserva con 6-12 meses de anticipación para bodas", "Pide paquetes románticos en tu hotel", "Los atardeceres en Samaná son mágicos", "Contrata fotógrafos locales especializados"],
    actividadesRelacionadas: [
      { nombre: "Cena Privada en la Playa", precio: 250, duracion: "3 horas", imagen: relaxBeach, rating: 4.9 },
      { nombre: "Spa de Parejas", precio: 180, duracion: "2 horas", imagen: hotelEdenRoc, rating: 4.8 },
      { nombre: "Navegación al Atardecer", precio: 120, duracion: "2 horas", imagen: heroBeach, rating: 4.9 },
    ],
  },
  golf: {
    id: "golf",
    nombre: "Golf",
    subtitulo: "Campos de Clase Mundial",
    descripcion: "República Dominicana cuenta con más campos de golf que cualquier otro destino del Caribe, diseñados por leyendas como Pete Dye, Jack Nicklaus y Tom Fazio.",
    heroImage: hotelEdenRoc,
    galeria: [hotelEdenRoc, puntaCana, relaxBeach, adventure],
    highlights: ["30+ campos de golf", "Diseñadores legendarios", "Torneos internacionales", "Resorts especializados"],
    lugares: [
      { nombre: "Punta Espada (Cap Cana)", region: "Punta Cana", imagen: hotelEdenRoc, link: "/destino/punta-cana" },
      { nombre: "Teeth of the Dog", region: "La Romana", imagen: relaxBeach, link: "/destino/la-romana" },
      { nombre: "Playa Dorada", region: "Puerto Plata", imagen: puertoPlata, link: "/destino/puerto-plata" },
      { nombre: "Corales (Puntacana)", region: "Punta Cana", imagen: puntaCana, link: "/destino/punta-cana" },
    ],
    rutasInfluencers: [
      { nombre: "Tiger Fan RD", handle: "@golf_paradise", avatar: hotelEdenRoc, ruta: "Top 5 Campos RD", descripcion: "Los mejores campos del Caribe en una semana de golf épica." },
      { nombre: "Pro Golfer", handle: "@fairway_rd", avatar: puntaCana, ruta: "Ruta Pete Dye", descripcion: "Todos los campos diseñados por el maestro en RD." },
    ],
    recomendaciones: ["Reserva tee times con anticipación en temporada alta", "Aprovecha los paquetes stay & play", "Juega temprano para evitar el calor", "Los caddies locales conocen cada green"],
    actividadesRelacionadas: [
      { nombre: "Green Fee Punta Espada", precio: 395, duracion: "5 horas", imagen: hotelEdenRoc, rating: 4.9 },
      { nombre: "Green Fee Teeth of the Dog", precio: 325, duracion: "5 horas", imagen: relaxBeach, rating: 4.9 },
      { nombre: "Clase con Pro", precio: 150, duracion: "2 horas", imagen: puntaCana, rating: 4.7 },
    ],
  },
  gastronomia: {
    id: "gastronomia",
    nombre: "Gastronomía",
    subtitulo: "Sabores del Caribe",
    descripcion: "Desde la tradicional Bandera Dominicana hasta la alta cocina caribeña, descubre los sabores que definen nuestra identidad culinaria.",
    heroImage: gastronomy,
    galeria: [gastronomy, merengue, santoDomingo, samana],
    highlights: ["Cocina tradicional", "Alta gastronomía", "Tours gastronómicos", "Clases de cocina"],
    lugares: [
      { nombre: "Zona Colonial (Restaurantes)", region: "Santo Domingo", imagen: santoDomingo, link: "/destino/santo-domingo" },
      { nombre: "Las Terrenas", region: "Samaná", imagen: samana, link: "/destino/samana" },
      { nombre: "Cap Cana Gourmet", region: "Punta Cana", imagen: hotelEdenRoc, link: "/destino/punta-cana" },
      { nombre: "Mercado Modelo", region: "Santo Domingo", imagen: gastronomy, link: "/guia-gastronomica" },
    ],
    rutasInfluencers: [
      { nombre: "Chef María", handle: "@sabores_rd", avatar: gastronomy, ruta: "Ruta del Sabor", descripcion: "Los mejores restaurantes y comedores del país en 5 días deliciosos." },
      { nombre: "Foodie Local", handle: "@come_rd", avatar: santoDomingo, ruta: "Street Food Tour", descripcion: "Empanadas, chimichurris y jugos naturales en un tour callejero." },
    ],
    recomendaciones: ["Prueba la Bandera Dominicana tradicional", "Los mariscos en Samaná son fresquísimos", "Reserva en restaurantes populares con anticipación", "Atrévete con el mangú y los tres golpes"],
    actividadesRelacionadas: [
      { nombre: "Tour Gastronómico Colonial", precio: 65, duracion: "4 horas", imagen: santoDomingo, rating: 4.8 },
      { nombre: "Clase de Cocina Dominicana", precio: 85, duracion: "3 horas", imagen: gastronomy, rating: 4.9 },
      { nombre: "Cata de Ron Premium", precio: 45, duracion: "2 horas", imagen: merengue, rating: 4.7 },
    ],
  },
  familia: {
    id: "familia",
    nombre: "Familia",
    subtitulo: "Aventuras para Todos",
    descripcion: "Parques acuáticos, resorts familiares y actividades para todas las edades hacen de RD el destino perfecto para vacaciones en familia.",
    heroImage: puntaCana,
    galeria: [puntaCana, diving, adventure, relaxBeach],
    highlights: ["Resorts todo incluido", "Parques acuáticos", "Actividades educativas", "Playas seguras"],
    lugares: [
      { nombre: "Bávaro Beach", region: "Punta Cana", imagen: puntaCana, link: "/destino/punta-cana" },
      { nombre: "Ocean World", region: "Puerto Plata", imagen: diving, link: "/destino/puerto-plata" },
      { nombre: "Manatí Park", region: "Bávaro", imagen: adventure, link: "/destino/punta-cana" },
      { nombre: "Playa Dorada", region: "Puerto Plata", imagen: puertoPlata, link: "/destino/puerto-plata" },
    ],
    rutasInfluencers: [
      { nombre: "Familia Viajera", handle: "@family_rd", avatar: puntaCana, ruta: "Vacaciones en Familia", descripcion: "7 días de diversión para padres e hijos." },
      { nombre: "Mom Travel RD", handle: "@mama_viajera", avatar: relaxBeach, ruta: "Tips para Viajar con Niños", descripcion: "Guía práctica para vacaciones familiares sin estrés." },
    ],
    recomendaciones: ["Los resorts todo incluido facilitan la logística", "Lleva protector solar para niños reef-safe", "Reserva actividades familiares con anticipación", "Pregunta por kids clubs en tu hotel"],
    actividadesRelacionadas: [
      { nombre: "Ocean World Adventure", precio: 89, duracion: "6 horas", imagen: diving, rating: 4.7 },
      { nombre: "Manatí Park", precio: 45, duracion: "4 horas", imagen: adventure, rating: 4.5 },
      { nombre: "Snorkel para Niños", precio: 35, duracion: "2 horas", imagen: heroBeach, rating: 4.6 },
    ],
  },
  deportes: {
    id: "deportes",
    nombre: "Deportes",
    subtitulo: "Recreación al Aire Libre",
    descripcion: "Desde ciclismo de montaña hasta tenis y running, República Dominicana ofrece instalaciones de primer nivel para deportistas.",
    heroImage: adventure,
    galeria: [adventure, hotelEdenRoc, diving, samana],
    highlights: ["Ciclismo de montaña", "Tenis profesional", "Running y trails", "Deportes extremos"],
    lugares: [
      { nombre: "Jarabacoa (MTB)", region: "La Vega", imagen: adventure, link: "/destino/jarabacoa" },
      { nombre: "Casa de Campo (Tenis)", region: "La Romana", imagen: hotelEdenRoc, link: "/destino/la-romana" },
      { nombre: "Pico Duarte Trail", region: "La Vega", imagen: samana, link: "/destino/pico-duarte" },
      { nombre: "Puerto Plata (Surf)", region: "Puerto Plata", imagen: diving, link: "/destino/puerto-plata" },
    ],
    rutasInfluencers: [
      { nombre: "MTB Pro RD", handle: "@bike_rd", avatar: adventure, ruta: "Trails de Jarabacoa", descripcion: "Los mejores senderos para mountain bike del Caribe." },
      { nombre: "Runner Caribe", handle: "@run_rd", avatar: samana, ruta: "Ultra Pico Duarte", descripcion: "Preparación para el trail más desafiante de RD." },
    ],
    recomendaciones: ["Entrena para la altitud si vas a Jarabacoa", "Hidratación es clave en el clima tropical", "Contrata guías para trails desconocidos", "Los mejores momentos son temprano en la mañana"],
    actividadesRelacionadas: [
      { nombre: "MTB Tour Jarabacoa", precio: 65, duracion: "4 horas", imagen: adventure, rating: 4.8 },
      { nombre: "Surf Lessons Cabarete", precio: 55, duracion: "2 horas", imagen: diving, rating: 4.7 },
      { nombre: "Tenis Clase Privada", precio: 80, duracion: "1.5 horas", imagen: hotelEdenRoc, rating: 4.6 },
    ],
  },
  acuaticos: {
    id: "acuaticos",
    nombre: "Deportes Acuáticos",
    subtitulo: "Aventura en el Mar",
    descripcion: "Buceo, snorkel, kitesurfing, wakeboard y más en las aguas cristalinas del Caribe dominicano.",
    heroImage: diving,
    galeria: [diving, heroBeach, puntaCana, samana],
    highlights: ["Buceo certificado", "Kitesurfing", "Snorkel en arrecifes", "Pesca deportiva"],
    lugares: [
      { nombre: "Cabarete", region: "Puerto Plata", imagen: diving, link: "/destino/cabarete" },
      { nombre: "Sosúa", region: "Puerto Plata", imagen: heroBeach, link: "/destino/sosua" },
      { nombre: "Bayahíbe", region: "La Romana", imagen: puntaCana, link: "/destino/bayahibe" },
      { nombre: "Saona Island", region: "La Romana", imagen: samana, link: "/destino/saona" },
    ],
    rutasInfluencers: [
      { nombre: "Diver Pro", handle: "@deep_rd", avatar: diving, ruta: "Los Mejores Dives", descripcion: "Top 10 sitios de buceo en República Dominicana." },
      { nombre: "Kite Master", handle: "@wind_rd", avatar: heroBeach, ruta: "Temporada de Kite", descripcion: "Guía de vientos y mejores spots de Cabarete." },
    ],
    recomendaciones: ["Cabarete es la capital del kitesurf", "Buceo PADI disponible en todos los destinos", "Temporada de vientos: Junio-Septiembre", "Usa siempre protector solar reef-safe"],
    actividadesRelacionadas: [
      { nombre: "Buceo Certificado (2 tanques)", precio: 120, duracion: "4 horas", imagen: diving, rating: 4.9 },
      { nombre: "Kitesurf Clase", precio: 150, duracion: "3 horas", imagen: heroBeach, rating: 4.8 },
      { nombre: "Pesca Deportiva", precio: 450, duracion: "6 horas", imagen: puntaCana, rating: 4.7 },
    ],
  },
  museos: {
    id: "museos",
    nombre: "Museos",
    subtitulo: "Historia y Arte",
    descripcion: "Desde el Museo del Hombre Dominicano hasta galerías de arte contemporáneo, descubre la rica herencia cultural del país.",
    heroImage: santoDomingo,
    galeria: [santoDomingo, merengue, gastronomy, hotelEdenRoc],
    highlights: ["Museos históricos", "Arte contemporáneo", "Colecciones arqueológicas", "Galerías locales"],
    lugares: [
      { nombre: "Museo de las Casas Reales", region: "Santo Domingo", imagen: santoDomingo, link: "/patrimonio" },
      { nombre: "Museo del Hombre Dominicano", region: "Santo Domingo", imagen: merengue, link: "/patrimonio" },
      { nombre: "Museo del Ámbar", region: "Puerto Plata", imagen: puertoPlata, link: "/patrimonio" },
      { nombre: "Centro Cultural Eduardo León Jimenes", region: "Santiago", imagen: gastronomy, link: "/patrimonio" },
    ],
    rutasInfluencers: [
      { nombre: "Art Lover", handle: "@arte_rd", avatar: santoDomingo, ruta: "Ruta de Museos", descripcion: "Los 10 museos imprescindibles de República Dominicana." },
      { nombre: "Historia Viva", handle: "@museum_rd", avatar: merengue, ruta: "Patrimonio Colonial", descripcion: "Zona Colonial a través de sus museos." },
    ],
    recomendaciones: ["Los museos cierran los lunes generalmente", "Compra pases combinados para ahorrar", "Los tours guiados valen la pena", "Visita temprano para evitar grupos grandes"],
    actividadesRelacionadas: [
      { nombre: "Tour Museos Zona Colonial", precio: 45, duracion: "4 horas", imagen: santoDomingo, rating: 4.8 },
      { nombre: "Visita Museo del Ámbar", precio: 10, duracion: "1.5 horas", imagen: puertoPlata, rating: 4.5 },
      { nombre: "Centro León (Santiago)", precio: 8, duracion: "2 horas", imagen: gastronomy, rating: 4.9 },
    ],
  },
  bienestar: {
    id: "bienestar",
    nombre: "Bienestar",
    subtitulo: "Tu Refugio de Paz",
    descripcion: "Spas de lujo, retiros de yoga, terapias holísticas y la energía sanadora del Caribe para renovar cuerpo y mente.",
    heroImage: relaxBeach,
    galeria: [relaxBeach, hotelEdenRoc, samana, heroBeach],
    highlights: ["Spas de clase mundial", "Retiros de yoga", "Terapias holísticas", "Meditación y mindfulness"],
    lugares: [
      { nombre: "Samaná (Retiros)", region: "Samaná", imagen: samana, link: "/destino/samana" },
      { nombre: "Cap Cana Spas", region: "Punta Cana", imagen: hotelEdenRoc, link: "/wellness" },
      { nombre: "Jarabacoa (Montaña)", region: "La Vega", imagen: adventure, link: "/destino/jarabacoa" },
      { nombre: "Casa de Campo", region: "La Romana", imagen: relaxBeach, link: "/wellness" },
    ],
    rutasInfluencers: [
      { nombre: "Yoga Master", handle: "@zen_rd", avatar: relaxBeach, ruta: "Retiro de 7 Días", descripcion: "Yoga, meditación y alimentación consciente en Samaná." },
      { nombre: "Wellness Coach", handle: "@heal_rd", avatar: samana, ruta: "Detox Tropical", descripcion: "Programa de desintoxicación y renovación." },
    ],
    recomendaciones: ["Reserva tratamientos con anticipación", "Los retiros requieren compromiso previo", "Combina spa con actividades suaves", "La temporada baja tiene mejores precios"],
    actividadesRelacionadas: [
      { nombre: "Spa Day Completo", precio: 280, duracion: "6 horas", imagen: relaxBeach, rating: 4.9 },
      { nombre: "Clase de Yoga (Playa)", precio: 35, duracion: "1.5 horas", imagen: heroBeach, rating: 4.8 },
      { nombre: "Masaje Piedras Calientes", precio: 120, duracion: "1.5 horas", imagen: hotelEdenRoc, rating: 4.9 },
    ],
  },
  lujo: {
    id: "lujo",
    nombre: "Lujo",
    subtitulo: "Experiencias Exclusivas",
    descripcion: "Resorts de cinco estrellas, yates privados, golf de campeonato y servicios de concierge para viajeros exigentes.",
    heroImage: hotelEdenRoc,
    galeria: [hotelEdenRoc, relaxBeach, puntaCana, samana],
    highlights: ["Resorts 5 estrellas", "Villas privadas", "Yates y helicópteros", "Experiencias VIP"],
    lugares: [
      { nombre: "Eden Roc Cap Cana", region: "Punta Cana", imagen: hotelEdenRoc, link: "/alojamiento/eden-roc" },
      { nombre: "Casa de Campo", region: "La Romana", imagen: relaxBeach, link: "/alojamiento/casa-campo" },
      { nombre: "Amanera", region: "Río San Juan", imagen: samana, link: "/alojamiento/amanera" },
      { nombre: "Tortuga Bay", region: "Punta Cana", imagen: puntaCana, link: "/alojamiento/tortuga-bay" },
    ],
    rutasInfluencers: [
      { nombre: "Luxury Travel", handle: "@elite_rd", avatar: hotelEdenRoc, ruta: "RD en 5 Estrellas", descripcion: "Los resorts más exclusivos del Caribe en una semana de lujo." },
      { nombre: "VIP Concierge", handle: "@vip_caribbean", avatar: relaxBeach, ruta: "Experiencias Privadas", descripcion: "Yates, helicópteros y cenas exclusivas." },
    ],
    recomendaciones: ["Usa servicios de concierge para reservas especiales", "Las villas privadas ofrecen mayor exclusividad", "Los mejores resorts tienen lista de espera", "Temporada alta: Diciembre-Abril"],
    actividadesRelacionadas: [
      { nombre: "Yate Privado (Día)", precio: 2500, duracion: "8 horas", imagen: heroBeach, rating: 5.0 },
      { nombre: "Helicóptero Panorámico", precio: 650, duracion: "1 hora", imagen: samana, rating: 4.9 },
      { nombre: "Cena Chef Privado", precio: 500, duracion: "4 horas", imagen: gastronomy, rating: 4.9 },
    ],
  },
  compras: {
    id: "compras",
    nombre: "Compras",
    subtitulo: "Tesoros del Caribe",
    descripcion: "Ámbar, larimar, artesanías, ron premium y recuerdos únicos que solo encontrarás en República Dominicana.",
    heroImage: santoDomingo,
    galeria: [santoDomingo, gastronomy, merengue, puntaCana],
    highlights: ["Ámbar y Larimar", "Artesanías locales", "Ron y tabaco", "Moda caribeña"],
    lugares: [
      { nombre: "Mercado Modelo", region: "Santo Domingo", imagen: santoDomingo, link: "/destino/santo-domingo" },
      { nombre: "Blue Mall", region: "Punta Cana", imagen: puntaCana, link: "/destino/punta-cana" },
      { nombre: "Calle El Conde", region: "Santo Domingo", imagen: merengue, link: "/destino/santo-domingo" },
      { nombre: "Altos de Chavón", region: "La Romana", imagen: hotelEdenRoc, link: "/destino/la-romana" },
    ],
    rutasInfluencers: [
      { nombre: "Shopper RD", handle: "@compras_rd", avatar: santoDomingo, ruta: "Shopping Tour", descripcion: "Dónde encontrar los mejores souvenirs y productos locales." },
      { nombre: "Artesanía Local", handle: "@handmade_rd", avatar: merengue, ruta: "Ruta Artesanal", descripcion: "Conoce a los artesanos detrás de las creaciones dominicanas." },
    ],
    recomendaciones: ["Compra ámbar y larimar en tiendas certificadas", "Negocia precios en mercados artesanales", "El ron Brugal y Barceló son excelentes regalos", "Guarda espacio en tu maleta para souvenirs"],
    actividadesRelacionadas: [
      { nombre: "Tour Mercado Modelo", precio: 25, duracion: "2 horas", imagen: santoDomingo, rating: 4.5 },
      { nombre: "Taller de Artesanías", precio: 45, duracion: "3 horas", imagen: merengue, rating: 4.7 },
      { nombre: "Visita Fábrica de Ron", precio: 35, duracion: "2 horas", imagen: gastronomy, rating: 4.8 },
    ],
  },
};

export default function ExperienciaDetalle() {
  const { id } = useParams();
  const [saved, setSaved] = useState(false);

  const experiencia = experienciasData[id || "ecoturismo"] || experienciasData.ecoturismo;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] flex items-end overflow-hidden">
          <img
            src={experiencia.heroImage}
            alt={experiencia.nombre}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              EXPERIENCIA
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              {experiencia.nombre}:<br />
              <span className="text-gradient">{experiencia.subtitulo}</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl mb-6">
              {experiencia.descripcion}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2">
                <Play className="h-4 w-4" /> Ver Video
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className={`gap-2 ${saved ? 'bg-primary/20 border-primary text-primary' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'}`}
                onClick={() => setSaved(!saved)}
              >
                <Heart className={`h-4 w-4 ${saved ? 'fill-primary' : ''}`} /> {saved ? 'Guardado' : 'Guardar'}
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Share2 className="h-4 w-4" /> Compartir
              </Button>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {experiencia.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Galería</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {experiencia.galeria.map((img, index) => (
                <div key={index} className={`rounded-xl overflow-hidden ${index === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  <img src={img} alt={`${experiencia.nombre} ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lugares donde vivirla */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Lugares Donde Vivirla</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiencia.lugares.map((lugar) => (
                <Link key={lugar.nombre} to={lugar.link} className="group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <img src={lugar.imagen} alt={lugar.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{lugar.nombre}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {lugar.region}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Rutas de Influencers */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Instagram className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">Rutas de Influencers</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {experiencia.rutasInfluencers.map((influencer) => (
                <div key={influencer.handle} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <img src={influencer.avatar} alt={influencer.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{influencer.nombre}</h3>
                      <p className="text-sm text-primary">{influencer.handle}</p>
                    </div>
                  </div>
                  <h4 className="font-display font-bold text-lg text-foreground mb-2">{influencer.ruta}</h4>
                  <p className="text-muted-foreground">{influencer.descripcion}</p>
                  <Button variant="outline" size="sm" className="mt-4 gap-2">
                    Ver Ruta Completa <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Actividades Relacionadas */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Actividades Recomendadas</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {experiencia.actividadesRelacionadas.map((actividad) => (
                <div key={actividad.nombre} className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-xl transition-shadow">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={actividad.imagen} alt={actividad.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-foreground mb-2">{actividad.nombre}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {actividad.duracion}</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {actividad.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">${actividad.precio}<span className="text-xs text-muted-foreground font-normal">/persona</span></span>
                      <Button size="sm">Reservar</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recomendaciones */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Tips y Recomendaciones</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {experiencia.recomendaciones.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              ¿Listo para vivir esta experiencia?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Planifica tu viaje perfecto con nuestras herramientas y encuentra todo lo que necesitas para disfrutar de {experiencia.nombre.toLowerCase()} en República Dominicana.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/herramientas">
                <Button size="lg" className="gap-2">
                  Planificar mi Viaje <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/actividades">
                <Button size="lg" variant="outline">
                  Explorar más Experiencias
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Banner Ad antes del footer */}
        <BetweenSectionsAd showDemo />

        {/* Footer sticky ad para móvil */}
        <MobileStickyFooterAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
