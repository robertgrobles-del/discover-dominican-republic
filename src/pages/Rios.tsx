import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { MapPin, Star, Droplets, TreePine, Mountain, Compass, Shield, User, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";

import rafting from "@/assets/rafting.jpg";
import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";

const rios = [
  {
    id: "damajagua",
    nombre: "27 Charcos de Damajagua",
    ubicacion: "Puerto Plata",
    rating: 4.9,
    imagen: diving,
    descripcion: "Una serie de cascadas naturales con toboganes y saltos profundos en medio del bosque tropical.",
    actividades: ["Canyoning", "Saltos", "Natación"],
    tipo: "Aventura",
    longitud: "27 charcos",
    adrenalina: "Alta",
    dificultad: 3,
    mejorEpoca: "Junio - Septiembre",
    popular: true
  },
  {
    id: "el-limon",
    nombre: "Salto El Limón",
    ubicacion: "Samaná",
    rating: 4.7,
    imagen: adventure,
    descripcion: "Accesible a caballo o caminando, esta cascada icónica ofrece una piscina natural refrescante.",
    actividades: ["Senderismo", "Natación", "Fotografía", "Cabalgata"],
    tipo: "Cascada",
    longitud: "40m altura",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "salto-jalda",
    nombre: "Salto de la Jalda",
    ubicacion: "Miches",
    rating: 5.0,
    imagen: rafting,
    descripcion: "La cascada más alta del Caribe. Una caminata exigente o viaje en helicóptero para verla.",
    actividades: ["Senderismo extremo", "Fotografía", "Helicóptero"],
    tipo: "Naturaleza Pura",
    longitud: "120m altura",
    adrenalina: "Extrema",
    dificultad: 5,
    mejorEpoca: "Enero - Marzo",
    destacado: "Más Alta del Caribe"
  },
  {
    id: "baiguate",
    nombre: "Salto Baiguate",
    ubicacion: "Jarabacoa",
    rating: 4.5,
    imagen: adventure,
    descripcion: "Perfecto para familias. Una hermosa cascada que cae en una piscina escalonada y tranquila.",
    actividades: ["Natación", "Picnic", "Fotografía"],
    tipo: "Familiar",
    longitud: "25m altura",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "yaque-norte",
    nombre: "Río Yaque del Norte",
    ubicacion: "Jarabacoa",
    rating: 4.9,
    imagen: rafting,
    descripcion: "El río más largo de RD, perfecto para rafting y kayak con rápidos de clase II-IV.",
    actividades: ["Rafting", "Kayak", "Tubing"],
    tipo: "Aventura",
    longitud: "296 km",
    adrenalina: "Alta",
    dificultad: 4,
    mejorEpoca: "Mayo - Octubre"
  },
  {
    id: "yasica",
    nombre: "Río Yasica",
    ubicacion: "Puerto Plata",
    rating: 4.5,
    imagen: diving,
    descripcion: "Aventura de tubing por aguas cristalinas entre paisajes montañosos.",
    actividades: ["Tubing", "Natación", "Picnic"],
    tipo: "Familiar",
    longitud: "28 km",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  // === CASCADAS (SALTOS) ===
  {
    id: "aguas-blancas",
    nombre: "Salto de Aguas Blancas",
    ubicacion: "Constanza",
    rating: 4.8,
    imagen: adventure,
    descripcion: "Espectacular cascada de 83 metros en las montañas de Constanza, rodeada de bosque de pinos y temperaturas frescas.",
    actividades: ["Senderismo", "Fotografía", "Natación"],
    tipo: "Cascada",
    longitud: "83m altura",
    adrenalina: "Media",
    dificultad: 3,
    mejorEpoca: "Todo el año"
  },
  {
    id: "jimenoa-1",
    nombre: "Salto de Jimenoa I",
    ubicacion: "Jarabacoa",
    rating: 4.6,
    imagen: rafting,
    descripcion: "Cascada de 40 metros accesible por un sendero con puentes colgantes sobre el río Jimenoa.",
    actividades: ["Senderismo", "Fotografía", "Natación"],
    tipo: "Cascada",
    longitud: "40m altura",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "jimenoa-2",
    nombre: "Salto de Jimenoa II",
    ubicacion: "Jarabacoa",
    rating: 4.5,
    imagen: adventure,
    descripcion: "Segunda cascada del complejo Jimenoa, más íntima y menos visitada que su hermana mayor.",
    actividades: ["Senderismo", "Natación", "Fotografía"],
    tipo: "Cascada",
    longitud: "30m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "socoa",
    nombre: "Salto de Socoa",
    ubicacion: "Monte Plata",
    rating: 4.4,
    imagen: diving,
    descripcion: "Cascada escondida en las montañas de Monte Plata con piscina natural cristalina.",
    actividades: ["Senderismo", "Natación", "Picnic"],
    tipo: "Cascada",
    longitud: "20m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Mayo - Noviembre"
  },
  {
    id: "salto-alto",
    nombre: "Salto Alto",
    ubicacion: "Bayaguana",
    rating: 4.3,
    imagen: rafting,
    descripcion: "Impresionante caída de agua en la zona oriental, ideal para excursionistas.",
    actividades: ["Senderismo", "Fotografía", "Natación"],
    tipo: "Cascada",
    longitud: "35m altura",
    adrenalina: "Media",
    dificultad: 3,
    mejorEpoca: "Todo el año"
  },
  {
    id: "yanigua",
    nombre: "Salto de Yanigua",
    ubicacion: "El Seibo",
    rating: 4.5,
    imagen: adventure,
    descripcion: "Cascada virgen en la región oriental con acceso por senderos naturales.",
    actividades: ["Senderismo", "Natación", "Fotografía"],
    tipo: "Naturaleza Pura",
    longitud: "30m altura",
    adrenalina: "Media",
    dificultad: 3,
    mejorEpoca: "Enero - Junio"
  },
  {
    id: "rio-partido",
    nombre: "Salto de Río Partido",
    ubicacion: "Dajabón",
    rating: 4.2,
    imagen: diving,
    descripcion: "Cascada fronteriza con pozas naturales, un tesoro poco conocido del noroeste dominicano.",
    actividades: ["Senderismo", "Natación", "Picnic"],
    tipo: "Cascada",
    longitud: "15m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Mayo - Octubre"
  },
  {
    id: "guayabo",
    nombre: "Salto de Guayabo",
    ubicacion: "San José de Ocoa",
    rating: 4.4,
    imagen: rafting,
    descripcion: "Hermosa cascada en las montañas de Ocoa rodeada de vegetación exuberante.",
    actividades: ["Senderismo", "Natación", "Fotografía"],
    tipo: "Cascada",
    longitud: "25m altura",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "las-golondrinas",
    nombre: "Salto de Las Golondrinas",
    ubicacion: "Barahona",
    rating: 4.5,
    imagen: adventure,
    descripcion: "Cascada escénica en la Sierra de Bahoruco con vistas al paisaje sureño.",
    actividades: ["Senderismo", "Fotografía", "Natación"],
    tipo: "Naturaleza Pura",
    longitud: "30m altura",
    adrenalina: "Media",
    dificultad: 3,
    mejorEpoca: "Abril - Noviembre"
  },
  {
    id: "los-bueyes",
    nombre: "Salto de Los Bueyes",
    ubicacion: "Puerto Plata",
    rating: 4.3,
    imagen: diving,
    descripcion: "Cascada tropical en las montañas de Puerto Plata con ambiente sereno.",
    actividades: ["Senderismo", "Natación", "Picnic"],
    tipo: "Cascada",
    longitud: "18m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "arroyo-bonito",
    nombre: "Salto de Arroyo Bonito",
    ubicacion: "Jarabacoa",
    rating: 4.4,
    imagen: rafting,
    descripcion: "Pequeña cascada pintoresca en un arroyo de aguas cristalinas cerca de Jarabacoa.",
    actividades: ["Natación", "Picnic", "Fotografía"],
    tipo: "Familiar",
    longitud: "12m altura",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "rio-grande-pp",
    nombre: "Salto de Río Grande",
    ubicacion: "Puerto Plata",
    rating: 4.3,
    imagen: adventure,
    descripcion: "Cascada del Río Grande con acceso por senderos naturales en la costa norte.",
    actividades: ["Senderismo", "Natación", "Fotografía"],
    tipo: "Cascada",
    longitud: "20m altura",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Mayo - Octubre"
  },
  {
    id: "el-rodeo",
    nombre: "Salto del Rodeo",
    ubicacion: "Pedernales",
    rating: 4.6,
    imagen: diving,
    descripcion: "Cascada remota en el suroeste profundo, para aventureros que buscan lo inexplorado.",
    actividades: ["Senderismo extremo", "Fotografía", "Natación"],
    tipo: "Naturaleza Pura",
    longitud: "35m altura",
    adrenalina: "Alta",
    dificultad: 4,
    mejorEpoca: "Marzo - Junio"
  },
  {
    id: "anamuya",
    nombre: "Salto de Anamuya",
    ubicacion: "Higüey",
    rating: 4.3,
    imagen: rafting,
    descripcion: "Cascada en la zona este con piscina natural y vegetación tropical.",
    actividades: ["Natación", "Senderismo", "Picnic"],
    tipo: "Cascada",
    longitud: "15m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "rio-sonador",
    nombre: "Salto de Río Sonador",
    ubicacion: "Bonao",
    rating: 4.4,
    imagen: adventure,
    descripcion: "Cascada musical en las montañas de Bonao que produce un sonido constante al caer.",
    actividades: ["Senderismo", "Natación", "Fotografía"],
    tipo: "Cascada",
    longitud: "20m altura",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "rio-blanco-bonao",
    nombre: "Salto de Río Blanco",
    ubicacion: "Bonao",
    rating: 4.3,
    imagen: diving,
    descripcion: "Cascada de aguas blanquecinas en un entorno natural prístino.",
    actividades: ["Natación", "Senderismo", "Picnic"],
    tipo: "Cascada",
    longitud: "18m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "el-jamo",
    nombre: "Salto del Jamo",
    ubicacion: "San Cristóbal",
    rating: 4.2,
    imagen: rafting,
    descripcion: "Cascada accesible cerca de la capital con piscina natural refrescante.",
    actividades: ["Natación", "Picnic", "Fotografía"],
    tipo: "Familiar",
    longitud: "15m altura",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "el-zumbador",
    nombre: "Salto El Zumbador",
    ubicacion: "San Cristóbal",
    rating: 4.3,
    imagen: adventure,
    descripcion: "Cascada con fuerte corriente que produce un zumbido característico al caer.",
    actividades: ["Senderismo", "Fotografía", "Natación"],
    tipo: "Cascada",
    longitud: "22m altura",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Mayo - Noviembre"
  },
  {
    id: "la-tinaja",
    nombre: "Salto de La Tinaja",
    ubicacion: "Monseñor Nouel",
    rating: 4.3,
    imagen: diving,
    descripcion: "Cascada que forma una poza profunda en forma de tinaja natural.",
    actividades: ["Natación", "Senderismo", "Fotografía"],
    tipo: "Cascada",
    longitud: "16m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "arroyo-toro",
    nombre: "Salto de Arroyo Toro",
    ubicacion: "Bonao",
    rating: 4.2,
    imagen: rafting,
    descripcion: "Cascada en el arroyo Toro con ambiente selvático y pozas para nadar.",
    actividades: ["Natación", "Senderismo", "Picnic"],
    tipo: "Cascada",
    longitud: "14m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Mayo - Octubre"
  },
  {
    id: "el-chorro-ocoa",
    nombre: "Salto El Chorro",
    ubicacion: "San José de Ocoa",
    rating: 4.4,
    imagen: adventure,
    descripcion: "Cascada refrescante en las montañas de Ocoa, accesible por un corto sendero.",
    actividades: ["Natación", "Senderismo", "Fotografía"],
    tipo: "Cascada",
    longitud: "20m altura",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "el-corozo",
    nombre: "Salto de El Corozo",
    ubicacion: "Samaná",
    rating: 4.3,
    imagen: diving,
    descripcion: "Cascada menos conocida en Samaná con piscina natural rodeada de palmeras.",
    actividades: ["Natación", "Senderismo", "Fotografía"],
    tipo: "Cascada",
    longitud: "18m altura",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  // === BALNEARIOS NATURALES ===
  {
    id: "la-toma",
    nombre: "Balneario La Toma",
    ubicacion: "San Cristóbal",
    rating: 4.6,
    imagen: diving,
    descripcion: "Balneario natural de aguas frías provenientes de un acueducto colonial. Uno de los más populares del país.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Poza natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año",
    popular: true
  },
  {
    id: "la-planta-bonao",
    nombre: "Balneario La Planta",
    ubicacion: "Bonao",
    rating: 4.5,
    imagen: adventure,
    descripcion: "Refrescante balneario natural en las montañas de Bonao con aguas cristalinas.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "rio-camu",
    nombre: "Balneario Río Camú",
    ubicacion: "La Vega",
    rating: 4.4,
    imagen: rafting,
    descripcion: "Aguas frescas del Río Camú con zonas de baño ideales para familias.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "las-marias-neiba",
    nombre: "Balneario Las Marías",
    ubicacion: "Neiba",
    rating: 4.3,
    imagen: diving,
    descripcion: "Oasis de aguas frescas en la zona suroeste, perfecto para escapar del calor.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Poza natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "boca-de-bao",
    nombre: "Balneario Boca de Bao",
    ubicacion: "Bonao",
    rating: 4.4,
    imagen: adventure,
    descripcion: "Popular balneario donde se juntan dos ríos creando pozas naturales profundas.",
    actividades: ["Natación", "Picnic", "Saltos"],
    tipo: "Balneario",
    longitud: "Confluencia de ríos",
    adrenalina: "Media",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "rio-masipedro",
    nombre: "Balneario Río Masipedro",
    ubicacion: "Bonao",
    rating: 4.3,
    imagen: rafting,
    descripcion: "Río de aguas cristalinas con piedras lisas y pozas naturales.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "los-quemados",
    nombre: "Balneario Los Quemados",
    ubicacion: "Bonao",
    rating: 4.2,
    imagen: diving,
    descripcion: "Tranquilo balneario en las montañas con aguas frescas y sombreado natural.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "arroyo-hondo-jarabacoa",
    nombre: "Balneario Arroyo Hondo",
    ubicacion: "Jarabacoa",
    rating: 4.4,
    imagen: adventure,
    descripcion: "Aguas frías y cristalinas en un arroyo de montaña rodeado de pinos.",
    actividades: ["Natación", "Picnic", "Senderismo"],
    tipo: "Balneario",
    longitud: "Arroyo de montaña",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "la-represa-jarabacoa",
    nombre: "Balneario La Represa",
    ubicacion: "Jarabacoa",
    rating: 4.3,
    imagen: rafting,
    descripcion: "Zona de baño junto a la represa con vistas a las montañas de Jarabacoa.",
    actividades: ["Natación", "Picnic", "Fotografía"],
    tipo: "Balneario",
    longitud: "Embalse",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "rio-yuna-bonao",
    nombre: "Balneario Río Yuna",
    ubicacion: "Bonao",
    rating: 4.3,
    imagen: diving,
    descripcion: "Amplio balneario en el Río Yuna con múltiples pozas y áreas recreativas.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río caudaloso",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "el-dique",
    nombre: "Balneario El Dique",
    ubicacion: "Monseñor Nouel",
    rating: 4.2,
    imagen: adventure,
    descripcion: "Refrescante balneario con aguas represadas formando una piscina natural.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Poza represada",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "el-baden-ocoa",
    nombre: "Balneario El Badén",
    ubicacion: "San José de Ocoa",
    rating: 4.3,
    imagen: rafting,
    descripcion: "Zona de baño natural en las montañas de Ocoa con aguas frescas.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río de montaña",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "rio-maimon",
    nombre: "Balneario Río Maimón",
    ubicacion: "Puerto Plata",
    rating: 4.3,
    imagen: diving,
    descripcion: "Balneario en la costa norte con aguas frescas del río Maimón.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "charco-azul-barahona",
    nombre: "Balneario Charco Azul",
    ubicacion: "Barahona",
    rating: 4.6,
    imagen: adventure,
    descripcion: "Poza de aguas azul turquesa en medio de las montañas de Barahona. Uno de los más bellos del sur.",
    actividades: ["Natación", "Fotografía", "Senderismo"],
    tipo: "Balneario",
    longitud: "Poza natural",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Todo el año",
    popular: true
  },
  {
    id: "rio-san-juan",
    nombre: "Balneario Río San Juan",
    ubicacion: "María Trinidad Sánchez",
    rating: 4.4,
    imagen: rafting,
    descripcion: "Aguas cristalinas del río San Juan con zonas de baño y manglares cercanos.",
    actividades: ["Natación", "Picnic", "Kayak"],
    tipo: "Balneario",
    longitud: "Río costero",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "charco-del-militar",
    nombre: "Balneario Charco del Militar",
    ubicacion: "Barahona",
    rating: 4.3,
    imagen: diving,
    descripcion: "Poza natural profunda en las montañas de Barahona, perfecta para nadar.",
    actividades: ["Natación", "Senderismo", "Picnic"],
    tipo: "Balneario",
    longitud: "Poza profunda",
    adrenalina: "Baja",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "el-nueve-azua",
    nombre: "Balneario El Nueve",
    ubicacion: "Azua",
    rating: 4.2,
    imagen: adventure,
    descripcion: "Balneario popular en Azua con pozas naturales y ambiente familiar.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "las-yayitas-azua",
    nombre: "Balneario Las Yayitas",
    ubicacion: "Azua",
    rating: 4.2,
    imagen: rafting,
    descripcion: "Tranquilo balneario en el río con sombra natural y acceso fácil.",
    actividades: ["Natación", "Picnic", "Familia"],
    tipo: "Balneario",
    longitud: "Río natural",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "rio-inoa",
    nombre: "Balneario Río Inoa",
    ubicacion: "San José de las Matas",
    rating: 4.4,
    imagen: diving,
    descripcion: "Aguas prístinas del río Inoa en las montañas del Cibao con pozas profundas.",
    actividades: ["Natación", "Picnic", "Senderismo"],
    tipo: "Balneario",
    longitud: "Río de montaña",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  }
];

const guias = [
  {
    nombre: "Carlos M.",
    especialidad: "Guía Charcos",
    certificaciones: ["Primeros auxilios", "Rescate acuático"],
    imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    nombre: "Ana R.",
    especialidad: "Guía Senderismo",
    certificaciones: ["Supervivencia", "Botánica local"],
    imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  }
];

const RioCard = ({ rio, index }: { rio: typeof rios[0]; index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getAdrenalinaColor = (nivel: string) => {
    switch (nivel) {
      case "Alta": return "bg-red-500/90";
      case "Media": return "bg-amber-500/90";
      case "Baja": return "bg-green-500/90";
      case "Extrema": return "bg-purple-500/90";
      default: return "bg-emerald-500/90";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && <Skeleton className="absolute inset-0" />}
        <img
          src={rio.imagen}
          alt={rio.nombre}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge className={`${getAdrenalinaColor(rio.adrenalina)} text-white`}>
            {rio.adrenalina === "Extrema" ? "🔥" : ""} Adrenalina {rio.adrenalina}
          </Badge>
          {rio.popular && (
            <Badge className="bg-primary/90 text-primary-foreground">Popular</Badge>
          )}
          {rio.destacado && (
            <Badge className="bg-amber-500/90 text-white">{rio.destacado}</Badge>
          )}
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{rio.rating}</span>
        </div>

        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          <span className="text-white/90 text-sm font-medium">{rio.longitud}</span>
          <span className="text-white/70 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {rio.mejorEpoca}
          </span>
        </div>

        {/* Dificultad */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1">
          <span className="text-white/70 text-xs mr-1">Físico</span>
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-2 h-2 rounded-full ${
                level <= rio.dificultad ? "bg-emerald-400" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{rio.ubicacion}</span>
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">{rio.nombre}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{rio.descripcion}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {rio.actividades.map((act) => (
            <span key={act} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
              {act}
            </span>
          ))}
        </div>

        <Link to={`/actividades`}>
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            Ver Detalles
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default function Rios() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroAdrenalina, setFiltroAdrenalina] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);

  const tiposUnicos = Array.from(new Set(rios.map(r => r.tipo)));

  const riosFiltrados = rios.filter((rio) => {
    const matchSearch = rio.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rio.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAdrenalina = !filtroAdrenalina || rio.adrenalina === filtroAdrenalina;
    const matchTipo = !filtroTipo || rio.tipo === filtroTipo;
    return matchSearch && matchAdrenalina && matchTipo;
  });

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <img
            src={rafting}
            alt="Ríos de República Dominicana"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 text-center px-4">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Droplets className="w-4 h-4 mr-2" />
              Aventura Natural
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Descubre el <span className="text-emerald-400">Corazón Vibrante</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
              Desde el imponente Salto de la Jalda hasta la adrenalina de los 27 Charcos
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar Aventura..."
                  className="pl-10 bg-background/90 border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="bg-background/90">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Droplets, label: "30+ Ríos", desc: "Para explorar" },
                { icon: Mountain, label: "Cascadas", desc: "Impresionantes" },
                { icon: TreePine, label: "Naturaleza", desc: "Virgen y exuberante" },
                { icon: Compass, label: "Aventura", desc: "Para todos los niveles" }
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-8 bg-card/30">
          <div className="container mx-auto px-4 space-y-4">
            {/* Filtro por tipo */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Tipo:</span>
              {tiposUnicos.map((tipo) => (
                <Button
                  key={tipo}
                  variant={filtroTipo === tipo ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo(filtroTipo === tipo ? null : tipo)}
                >
                  {tipo}
                </Button>
              ))}
              {filtroTipo && (
                <Button variant="ghost" size="sm" onClick={() => setFiltroTipo(null)}>
                  Limpiar
                </Button>
              )}
            </div>
            {/* Filtro por adrenalina */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Nivel Adrenalina:</span>
              {["Baja", "Media", "Alta", "Extrema"].map((nivel) => (
                <Button
                  key={nivel}
                  variant={filtroAdrenalina === nivel ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroAdrenalina(filtroAdrenalina === nivel ? null : nivel)}
                  className={filtroAdrenalina === nivel ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                  {nivel}
                </Button>
              ))}
              {filtroAdrenalina && (
                <Button variant="ghost" size="sm" onClick={() => setFiltroAdrenalina(null)}>
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Rios Grid */}
        <section className="py-16 flex-1">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Destinos Icónicos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Mostrando {riosFiltrados.length} resultados
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {riosFiltrados.map((rio, index) => (
                <RioCard key={rio.id} rio={rio} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Sección de Seguridad */}
        <section className="py-16 bg-emerald-500/5 border-y border-emerald-500/20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <Shield className="w-4 h-4 mr-2" />
                  SEGURIDAD PRIMERO
                </Badge>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Explora con Expertos Locales
                </h2>
                <p className="text-muted-foreground mb-6">
                  Para garantizar tu seguridad y la mejor experiencia, todos nuestros destinos de aventura requieren o recomiendan guías certificados. Ellos conocen el río como la palma de su mano.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Primeros auxilios certificados",
                    "Equipos de seguridad incluidos (Cascos, Chalecos)",
                    "Conocimiento experto del caudal y clima"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link to="/guias-locales">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    Encontrar un Guía
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {guias.map((guia) => (
                  <div key={guia.nombre} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={guia.imagen}
                        alt={guia.nombre}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">{guia.nombre}</h4>
                        <p className="text-xs text-muted-foreground">{guia.especialidad}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {guia.certificaciones.map((cert) => (
                        <Badge key={cert} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ad before footer */}
        <BetweenSectionsAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
