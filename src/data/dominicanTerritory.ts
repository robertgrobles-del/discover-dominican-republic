/**
 * División Político-Administrativa y Destinos Turísticos de la República Dominicana
 * 31 Provincias + 1 Distrito Nacional y sus 158 Municipios oficiales.
 */

export interface DominicanProvince {
  id: string;
  name: string;
  slug: string;
  region: 'norte' | 'sur' | 'este' | 'santo-domingo';
  capitalMunicipio: string;
}

export interface DominicanMunicipality {
  id: string;
  name: string;
  slug: string;
  provinceId: string;
  isCabecera?: boolean;
}

export interface TouristDestinationRef {
  id: string;
  name: string;
  slug: string;
  provinceId: string;
  municipalityId?: string;
  isPopularZone?: boolean;
}

export const DOMINICAN_PROVINCES: DominicanProvince[] = [
  { id: "azua", name: "Azua", slug: "azua", region: "sur", capitalMunicipio: "Azua de Compostela" },
  { id: "bahoruco", name: "Bahoruco", slug: "bahoruco", region: "sur", capitalMunicipio: "Neiba" },
  { id: "barahona", name: "Barahona", slug: "barahona", region: "sur", capitalMunicipio: "Santa Cruz de Barahona" },
  { id: "dajabon", name: "Dajabón", slug: "dajabon", region: "norte", capitalMunicipio: "Dajabón" },
  { id: "distrito-nacional", name: "Distrito Nacional", slug: "distrito-nacional", region: "santo-domingo", capitalMunicipio: "Santo Domingo de Guzmán" },
  { id: "duarte", name: "Duarte", slug: "duarte", region: "norte", capitalMunicipio: "San Francisco de Macorís" },
  { id: "el-seibo", name: "El Seibo", slug: "el-seibo", region: "este", capitalMunicipio: "Santa Cruz de El Seibo" },
  { id: "elias-pina", name: "Elías Piña", slug: "elias-pina", region: "sur", capitalMunicipio: "Comendador" },
  { id: "espaillat", name: "Espaillat", slug: "espaillat", region: "norte", capitalMunicipio: "Moca" },
  { id: "hato-mayor", name: "Hato Mayor", slug: "hato-mayor", region: "este", capitalMunicipio: "Hato Mayor del Rey" },
  { id: "hermanas-mirabal", name: "Hermanas Mirabal", slug: "hermanas-mirabal", region: "norte", capitalMunicipio: "Salcedo" },
  { id: "independencia", name: "Independencia", slug: "independencia", region: "sur", capitalMunicipio: "Jimaní" },
  { id: "la-altagracia", name: "La Altagracia", slug: "la-altagracia", region: "este", capitalMunicipio: "Salvaleón de Higüey" },
  { id: "la-romana", name: "La Romana", slug: "la-romana", region: "este", capitalMunicipio: "La Romana" },
  { id: "la-vega", name: "La Vega", slug: "la-vega", region: "norte", capitalMunicipio: "Concepción de La Vega" },
  { id: "maria-trinidad-sanchez", name: "María Trinidad Sánchez", slug: "maria-trinidad-sanchez", region: "norte", capitalMunicipio: "Nagua" },
  { id: "monsenor-nouel", name: "Monseñor Nouel", slug: "monsenor-nouel", region: "norte", capitalMunicipio: "Bonao" },
  { id: "monte-cristi", name: "Monte Cristi", slug: "monte-cristi", region: "norte", capitalMunicipio: "San Fernando de Montecristi" },
  { id: "monte-plata", name: "Monte Plata", slug: "monte-plata", region: "este", capitalMunicipio: "Monte Plata" },
  { id: "pedernales", name: "Pedernales", slug: "pedernales", region: "sur", capitalMunicipio: "Pedernales" },
  { id: "peravia", name: "Peravia", slug: "peravia", region: "sur", capitalMunicipio: "Baní" },
  { id: "puerto-plata", name: "Puerto Plata", slug: "puerto-plata", region: "norte", capitalMunicipio: "San Felipe de Puerto Plata" },
  { id: "samana", name: "Samaná", slug: "samana", region: "norte", capitalMunicipio: "Samaná" },
  { id: "san-cristobal", name: "San Cristóbal", slug: "san-cristobal", region: "sur", capitalMunicipio: "San Cristóbal" },
  { id: "san-jose-de-ocoa", name: "San José de Ocoa", slug: "san-jose-de-ocoa", region: "sur", capitalMunicipio: "San José de Ocoa" },
  { id: "san-juan", name: "San Juan", slug: "san-juan", region: "sur", capitalMunicipio: "San Juan de la Maguana" },
  { id: "san-pedro-de-macoris", name: "San Pedro de Macorís", slug: "san-pedro-de-macoris", region: "este", capitalMunicipio: "San Pedro de Macorís" },
  { id: "sanchez-ramirez", name: "Sánchez Ramírez", slug: "sanchez-ramirez", region: "norte", capitalMunicipio: "Cotuí" },
  { id: "santiago", name: "Santiago", slug: "santiago", region: "norte", capitalMunicipio: "Santiago de los Caballeros" },
  { id: "santiago-rodriguez", name: "Santiago Rodríguez", slug: "santiago-rodriguez", region: "norte", capitalMunicipio: "San Ignacio de Sabaneta" },
  { id: "santo-domingo", name: "Santo Domingo", slug: "santo-domingo", region: "santo-domingo", capitalMunicipio: "Santo Domingo Este" },
  { id: "valverde", name: "Valverde", slug: "valverde", region: "norte", capitalMunicipio: "Mao" },
];

export const DOMINICAN_MUNICIPALITIES: DominicanMunicipality[] = [
  // 1. Azua
  { id: "azua-de-compostela", name: "Azua de Compostela", slug: "azua-de-compostela", provinceId: "azua", isCabecera: true },
  { id: "estebania", name: "Estebanía", slug: "estebania", provinceId: "azua" },
  { id: "guayabal-azua", name: "Guayabal", slug: "guayabal", provinceId: "azua" },
  { id: "las-charcas", name: "Las Charcas", slug: "las-charcas", provinceId: "azua" },
  { id: "las-yayas-de-viajama", name: "Las Yayas de Viajama", slug: "las-yayas-de-viajama", provinceId: "azua" },
  { id: "padre-las-casas", name: "Padre Las Casas", slug: "padre-las-casas", provinceId: "azua" },
  { id: "peralta", name: "Peralta", slug: "peralta", provinceId: "azua" },
  { id: "pueblo-viejo", name: "Pueblo Viejo", slug: "pueblo-viejo", provinceId: "azua" },
  { id: "sabana-yegua", name: "Sabana Yegua", slug: "sabana-yegua", provinceId: "azua" },
  { id: "tabara-arriba", name: "Tábara Arriba", slug: "tabara-arriba", provinceId: "azua" },

  // 2. Bahoruco
  { id: "neiba", name: "Neiba", slug: "neiba", provinceId: "bahoruco", isCabecera: true },
  { id: "galvan", name: "Galván", slug: "galvan", provinceId: "bahoruco" },
  { id: "los-rios", name: "Los Ríos", slug: "los-rios", provinceId: "bahoruco" },
  { id: "tamayo", name: "Tamayo", slug: "tamayo", provinceId: "bahoruco" },
  { id: "villa-jaragua", name: "Villa Jaragua", slug: "villa-jaragua", provinceId: "bahoruco" },

  // 3. Barahona
  { id: "santa-cruz-de-barahona", name: "Santa Cruz de Barahona", slug: "santa-cruz-de-barahona", provinceId: "barahona", isCabecera: true },
  { id: "cabral", name: "Cabral", slug: "cabral", provinceId: "barahona" },
  { id: "el-penon", name: "El Peñón", slug: "el-penon", provinceId: "barahona" },
  { id: "enriquillo", name: "Enriquillo", slug: "enriquillo", provinceId: "barahona" },
  { id: "fundacion", name: "Fundación", slug: "fundacion", provinceId: "barahona" },
  { id: "jaquimeyes", name: "Jaquimeyes", slug: "jaquimeyes", provinceId: "barahona" },
  { id: "la-cienaga", name: "La Ciénaga", slug: "la-cienaga", provinceId: "barahona" },
  { id: "las-salinas", name: "Las Salinas", slug: "las-salinas", provinceId: "barahona" },
  { id: "paraiso", name: "Paraíso", slug: "paraiso", provinceId: "barahona" },
  { id: "polo", name: "Polo", slug: "polo", provinceId: "barahona" },
  { id: "vicente-noble", name: "Vicente Noble", slug: "vicente-noble", provinceId: "barahona" },

  // 4. Dajabón
  { id: "dajabon", name: "Dajabón", slug: "dajabon", provinceId: "dajabon", isCabecera: true },
  { id: "el-pino", name: "El Pino", slug: "el-pino", provinceId: "dajabon" },
  { id: "loma-de-cabrera", name: "Loma de Cabrera", slug: "loma-de-cabrera", provinceId: "dajabon" },
  { id: "partido", name: "Partido", slug: "partido", provinceId: "dajabon" },
  { id: "restauracion", name: "Restauración", slug: "restauracion", provinceId: "dajabon" },

  // 5. Distrito Nacional
  { id: "santo-domingo-de-guzman", name: "Santo Domingo de Guzmán", slug: "santo-domingo-de-guzman", provinceId: "distrito-nacional", isCabecera: true },

  // 6. Duarte
  { id: "san-francisco-de-macoris", name: "San Francisco de Macorís", slug: "san-francisco-de-macoris", provinceId: "duarte", isCabecera: true },
  { id: "arenoso", name: "Arenoso", slug: "arenoso", provinceId: "duarte" },
  { id: "castillo", name: "Castillo", slug: "castillo", provinceId: "duarte" },
  { id: "eugenio-maria-de-hostos", name: "Eugenio María de Hostos", slug: "eugenio-maria-de-hostos", provinceId: "duarte" },
  { id: "las-guaranas", name: "Las Guáranas", slug: "las-guaranas", provinceId: "duarte" },
  { id: "pimentel", name: "Pimentel", slug: "pimentel", provinceId: "duarte" },
  { id: "villa-riva", name: "Villa Riva", slug: "villa-riva", provinceId: "duarte" },

  // 7. El Seibo
  { id: "santa-cruz-de-el-seibo", name: "Santa Cruz de El Seibo", slug: "santa-cruz-de-el-seibo", provinceId: "el-seibo", isCabecera: true },
  { id: "miches", name: "Miches", slug: "miches", provinceId: "el-seibo" },

  // 8. Elías Piña
  { id: "comendador", name: "Comendador", slug: "comendador", provinceId: "elias-pina", isCabecera: true },
  { id: "banica", name: "Bánica", slug: "banica", provinceId: "elias-pina" },
  { id: "el-llano", name: "El Llano", slug: "el-llano", provinceId: "elias-pina" },
  { id: "hondo-valle", name: "Hondo Valle", slug: "hondo-valle", provinceId: "elias-pina" },
  { id: "juan-santiago", name: "Juan Santiago", slug: "juan-santiago", provinceId: "elias-pina" },
  { id: "pedro-santana", name: "Pedro Santana", slug: "pedro-santana", provinceId: "elias-pina" },

  // 9. Espaillat
  { id: "moca", name: "Moca", slug: "moca", provinceId: "espaillat", isCabecera: true },
  { id: "cayetano-germosen", name: "Cayetano Germosén", slug: "cayetano-germosen", provinceId: "espaillat" },
  { id: "gaspar-hernandez", name: "Gaspar Hernández", slug: "gaspar-hernandez", provinceId: "espaillat" },
  { id: "jamao-al-norte", name: "Jamao al Norte", slug: "jamao-al-norte", provinceId: "espaillat" },

  // 10. Hato Mayor
  { id: "hato-mayor-del-rey", name: "Hato Mayor del Rey", slug: "hato-mayor-del-rey", provinceId: "hato-mayor", isCabecera: true },
  { id: "el-valle", name: "El Valle", slug: "el-valle", provinceId: "hato-mayor" },
  { id: "sabana-de-la-mar", name: "Sabana de la Mar", slug: "sabana-de-la-mar", provinceId: "hato-mayor" },

  // 11. Hermanas Mirabal
  { id: "salcedo", name: "Salcedo", slug: "salcedo", provinceId: "hermanas-mirabal", isCabecera: true },
  { id: "tenares", name: "Tenares", slug: "tenares", provinceId: "hermanas-mirabal" },
  { id: "villa-tapia", name: "Villa Tapia", slug: "villa-tapia", provinceId: "hermanas-mirabal" },

  // 12. Independencia
  { id: "jimani", name: "Jimaní", slug: "jimani", provinceId: "independencia", isCabecera: true },
  { id: "cristobal", name: "Cristóbal", slug: "cristobal", provinceId: "independencia" },
  { id: "duverge", name: "Duvergé", slug: "duverge", provinceId: "independencia" },
  { id: "la-descubierta", name: "La Descubierta", slug: "la-descubierta", provinceId: "independencia" },
  { id: "mella", name: "Mella", slug: "mella", provinceId: "independencia" },
  { id: "postrer-rio", name: "Postrer Río", slug: "postrer-rio", provinceId: "independencia" },

  // 13. La Altagracia
  { id: "salvaleon-de-higuey", name: "Salvaleón de Higüey", slug: "salvaleon-de-higuey", provinceId: "la-altagracia", isCabecera: true },
  { id: "san-rafael-del-yuma", name: "San Rafael del Yuma", slug: "san-rafael-del-yuma", provinceId: "la-altagracia" },

  // 14. La Romana
  { id: "la-romana", name: "La Romana", slug: "la-romana", provinceId: "la-romana", isCabecera: true },
  { id: "guaymate", name: "Guaymate", slug: "guaymate", provinceId: "la-romana" },
  { id: "villa-hermosa", name: "Villa Hermosa", slug: "villa-hermosa", provinceId: "la-romana" },

  // 15. La Vega
  { id: "concepcion-de-la-vega", name: "Concepción de La Vega", slug: "concepcion-de-la-vega", provinceId: "la-vega", isCabecera: true },
  { id: "constanza", name: "Constanza", slug: "constanza", provinceId: "la-vega" },
  { id: "jarabacoa", name: "Jarabacoa", slug: "jarabacoa", provinceId: "la-vega" },
  { id: "jima-abajo", name: "Jima Abajo", slug: "jima-abajo", provinceId: "la-vega" },

  // 16. María Trinidad Sánchez
  { id: "nagua", name: "Nagua", slug: "nagua", provinceId: "maria-trinidad-sanchez", isCabecera: true },
  { id: "cabrera", name: "Cabrera", slug: "cabrera", provinceId: "maria-trinidad-sanchez" },
  { id: "el-factor", name: "El Factor", slug: "el-factor", provinceId: "maria-trinidad-sanchez" },
  { id: "rio-san-juan", name: "Río San Juan", slug: "rio-san-juan", provinceId: "maria-trinidad-sanchez" },

  // 17. Monseñor Nouel
  { id: "bonao", name: "Bonao", slug: "bonao", provinceId: "monsenor-nouel", isCabecera: true },
  { id: "maimon", name: "Maimón", slug: "maimon", provinceId: "monsenor-nouel" },
  { id: "piedra-blanca", name: "Piedra Blanca", slug: "piedra-blanca", provinceId: "monsenor-nouel" },

  // 18. Monte Cristi
  { id: "san-fernando-de-montecristi", name: "San Fernando de Montecristi", slug: "san-fernando-de-montecristi", provinceId: "monte-cristi", isCabecera: true },
  { id: "castanuela", name: "Castañuela", slug: "castanuela", provinceId: "monte-cristi" },
  { id: "guayubin", name: "Guayubín", slug: "guayubin", provinceId: "monte-cristi" },
  { id: "las-matas-de-santa-cruz", name: "Las Matas de Santa Cruz", slug: "las-matas-de-santa-cruz", provinceId: "monte-cristi" },
  { id: "pepillo-salcedo", name: "Pepillo Salcedo (Manzanillo)", slug: "pepillo-salcedo", provinceId: "monte-cristi" },
  { id: "villa-vasquez", name: "Villa Vásquez", slug: "villa-vasquez", provinceId: "monte-cristi" },

  // 19. Monte Plata
  { id: "monte-plata", name: "Monte Plata", slug: "monte-plata", provinceId: "monte-plata", isCabecera: true },
  { id: "bayaguana", name: "Bayaguana", slug: "bayaguana", provinceId: "monte-plata" },
  { id: "peralvillo", name: "Peralvillo", slug: "peralvillo", provinceId: "monte-plata" },
  { id: "sabana-grande-de-boya", name: "Sabana Grande de Boyá", slug: "sabana-grande-de-boya", provinceId: "monte-plata" },
  { id: "yamasa", name: "Yamasá", slug: "yamasa", provinceId: "monte-plata" },

  // 20. Pedernales
  { id: "pedernales", name: "Pedernales", slug: "pedernales", provinceId: "pedernales", isCabecera: true },
  { id: "oviedo", name: "Oviedo", slug: "oviedo", provinceId: "pedernales" },

  // 21. Peravia
  { id: "bani", name: "Baní", slug: "bani", provinceId: "peravia", isCabecera: true },
  { id: "nizao", name: "Nizao", slug: "nizao", provinceId: "peravia" },

  // 22. Puerto Plata
  { id: "san-felipe-de-puerto-plata", name: "San Felipe de Puerto Plata", slug: "san-felipe-de-puerto-plata", provinceId: "puerto-plata", isCabecera: true },
  { id: "altamira", name: "Altamira", slug: "altamira", provinceId: "puerto-plata" },
  { id: "guananico", name: "Guananico", slug: "guananico", provinceId: "puerto-plata" },
  { id: "imbert", name: "Imbert", slug: "imbert", provinceId: "puerto-plata" },
  { id: "los-hidalgos", name: "Los Hidalgos (El Mamey)", slug: "los-hidalgos", provinceId: "puerto-plata" },
  { id: "luperon", name: "Luperón", slug: "luperon", provinceId: "puerto-plata" },
  { id: "sosua", name: "Sosúa", slug: "sosua", provinceId: "puerto-plata" },
  { id: "villa-isabela", name: "Villa Isabela", slug: "villa-isabela", provinceId: "puerto-plata" },
  { id: "villa-montellano", name: "Villa Montellano", slug: "villa-montellano", provinceId: "puerto-plata" },

  // 23. Samaná
  { id: "samana", name: "Samaná", slug: "samana", provinceId: "samana", isCabecera: true },
  { id: "las-terrenas", name: "Las Terrenas", slug: "las-terrenas", provinceId: "samana" },
  { id: "sanchez", name: "Sánchez", slug: "sanchez", provinceId: "samana" },

  // 24. San Cristóbal
  { id: "san-cristobal", name: "San Cristóbal", slug: "san-cristobal", provinceId: "san-cristobal", isCabecera: true },
  { id: "bajos-de-haina", name: "Bajos de Haina", slug: "bajos-de-haina", provinceId: "san-cristobal" },
  { id: "cambita-garabito", name: "Cambita Garabito", slug: "cambita-garabito", provinceId: "san-cristobal" },
  { id: "los-cacaos", name: "Los Cacaos", slug: "los-cacaos", provinceId: "san-cristobal" },
  { id: "sabana-grande-de-palenque", name: "Sabana Grande de Palenque", slug: "sabana-grande-de-palenque", provinceId: "san-cristobal" },
  { id: "san-gregorio-de-nigua", name: "San Gregorio de Nigua", slug: "san-gregorio-de-nigua", provinceId: "san-cristobal" },
  { id: "villa-altagracia", name: "Villa Altagracia", slug: "villa-altagracia", provinceId: "san-cristobal" },
  { id: "yaguate", name: "Yaguate", slug: "yaguate", provinceId: "san-cristobal" },

  // 25. San José de Ocoa
  { id: "san-jose-de-ocoa", name: "San José de Ocoa", slug: "san-jose-de-ocoa", provinceId: "san-jose-de-ocoa", isCabecera: true },
  { id: "rancho-arriba", name: "Rancho Arriba", slug: "rancho-arriba", provinceId: "san-jose-de-ocoa" },
  { id: "sabana-larga", name: "Sabana Larga", slug: "sabana-larga", provinceId: "san-jose-de-ocoa" },

  // 26. San Juan
  { id: "san-juan-de-la-maguana", name: "San Juan de la Maguana", slug: "san-juan-de-la-maguana", provinceId: "san-juan", isCabecera: true },
  { id: "bohechio", name: "Bohechío", slug: "bohechio", provinceId: "san-juan" },
  { id: "el-cercado", name: "El Cercado", slug: "el-cercado", provinceId: "san-juan" },
  { id: "juan-de-herrera", name: "Juan de Herrera", slug: "juan-de-herrera", provinceId: "san-juan" },
  { id: "las-matas-de-farfan", name: "Las Matas de Farfán", slug: "las-matas-de-farfan", provinceId: "san-juan" },
  { id: "vallejuelo", name: "Vallejuelo", slug: "vallejuelo", provinceId: "san-juan" },

  // 27. San Pedro de Macorís
  { id: "san-pedro-de-macoris", name: "San Pedro de Macorís", slug: "san-pedro-de-macoris", provinceId: "san-pedro-de-macoris", isCabecera: true },
  { id: "consuelo", name: "Consuelo", slug: "consuelo", provinceId: "san-pedro-de-macoris" },
  { id: "guayacanes", name: "Guayacanes", slug: "guayacanes", provinceId: "san-pedro-de-macoris" },
  { id: "quisqueya", name: "Quisqueya", slug: "quisqueya", provinceId: "san-pedro-de-macoris" },
  { id: "ramon-santana", name: "Ramón Santana", slug: "ramon-santana", provinceId: "san-pedro-de-macoris" },
  { id: "san-jose-de-los-llanos", name: "San José de Los Llanos", slug: "san-jose-de-los-llanos", provinceId: "san-pedro-de-macoris" },

  // 28. Sánchez Ramírez
  { id: "cotui", name: "Cotuí", slug: "cotui", provinceId: "sanchez-ramirez", isCabecera: true },
  { id: "cevicos", name: "Cevicos", slug: "cevicos", provinceId: "sanchez-ramirez" },
  { id: "fantino", name: "Fantino", slug: "fantino", provinceId: "sanchez-ramirez" },
  { id: "la-mata", name: "La Mata", slug: "la-mata", provinceId: "sanchez-ramirez" },

  // 29. Santiago
  { id: "santiago-de-los-caballeros", name: "Santiago de los Caballeros", slug: "santiago-de-los-caballeros", provinceId: "santiago", isCabecera: true },
  { id: "bisono-navarrete", name: "Bisonó (Navarrete)", slug: "bisono-navarrete", provinceId: "santiago" },
  { id: "janico", name: "Jánico", slug: "janico", provinceId: "santiago" },
  { id: "licey-al-medio", name: "Licey al Medio", slug: "licey-al-medio", provinceId: "santiago" },
  { id: "punal", name: "Puñal", slug: "punal", provinceId: "santiago" },
  { id: "sabana-iglesia", name: "Sabana Iglesia", slug: "sabana-iglesia", provinceId: "santiago" },
  { id: "san-jose-de-las-matas", name: "San José de las Matas", slug: "san-jose-de-las-matas", provinceId: "santiago" },
  { id: "tamboril", name: "Tamboril", slug: "tamboril", provinceId: "santiago" },
  { id: "villa-gonzalez", name: "Villa González", slug: "villa-gonzalez", provinceId: "santiago" },

  // 30. Santiago Rodríguez
  { id: "san-ignacio-de-sabaneta", name: "San Ignacio de Sabaneta", slug: "san-ignacio-de-sabaneta", provinceId: "santiago-rodriguez", isCabecera: true },
  { id: "los-almacigos", name: "Los Almácigos", slug: "los-almacigos", provinceId: "santiago-rodriguez" },
  { id: "moncion", name: "Monción", slug: "moncion", provinceId: "santiago-rodriguez" },

  // 31. Santo Domingo
  { id: "santo-domingo-este", name: "Santo Domingo Este", slug: "santo-domingo-este", provinceId: "santo-domingo", isCabecera: true },
  { id: "boca-chica", name: "Boca Chica", slug: "boca-chica", provinceId: "santo-domingo" },
  { id: "los-alcarrizos", name: "Los Alcarrizos", slug: "los-alcarrizos", provinceId: "santo-domingo" },
  { id: "pedro-brand", name: "Pedro Brand", slug: "pedro-brand", provinceId: "santo-domingo" },
  { id: "san-antonio-de-guerra", name: "San Antonio de Guerra", slug: "san-antonio-de-guerra", provinceId: "santo-domingo" },
  { id: "santo-domingo-norte", name: "Santo Domingo Norte", slug: "santo-domingo-norte", provinceId: "santo-domingo" },
  { id: "santo-domingo-oeste", name: "Santo Domingo Oeste", slug: "santo-domingo-oeste", provinceId: "santo-domingo" },

  // 32. Valverde
  { id: "mao", name: "Mao", slug: "mao", provinceId: "valverde", isCabecera: true },
  { id: "esperanza", name: "Esperanza", slug: "esperanza", provinceId: "valverde" },
  { id: "laguna-salada", name: "Laguna Salada", slug: "laguna-salada", provinceId: "valverde" },
];

/**
 * Zonas y Destinos turísticos reconocidos (incluyendo distritos municipales y polos de atracción)
 */
export const TOURIST_DESTINATIONS_REF: TouristDestinationRef[] = [
  // La Altagracia
  { id: "bavaro", name: "Bávaro", slug: "bavaro", provinceId: "la-altagracia", municipalityId: "salvaleon-de-higuey", isPopularZone: true },
  { id: "punta-cana", name: "Punta Cana", slug: "punta-cana", provinceId: "la-altagracia", municipalityId: "salvaleon-de-higuey", isPopularZone: true },
  { id: "cap-cana", name: "Cap Cana", slug: "cap-cana", provinceId: "la-altagracia", municipalityId: "salvaleon-de-higuey", isPopularZone: true },
  { id: "uvero-alto", name: "Uvero Alto", slug: "uvero-alto", provinceId: "la-altagracia", municipalityId: "salvaleon-de-higuey", isPopularZone: true },
  { id: "bayahibe", name: "Bayahíbe", slug: "bayahibe", provinceId: "la-altagracia", municipalityId: "san-rafael-del-yuma", isPopularZone: true },
  { id: "boca-de-yuma", name: "Boca de Yuma", slug: "boca-de-yuma", provinceId: "la-altagracia", municipalityId: "san-rafael-del-yuma", isPopularZone: true },
  
  // Samaná
  { id: "las-terrenas", name: "Las Terrenas", slug: "las-terrenas", provinceId: "samana", municipalityId: "las-terrenas", isPopularZone: true },
  { id: "las-galeras", name: "Las Galeras", slug: "las-galeras", provinceId: "samana", municipalityId: "samana", isPopularZone: true },
  { id: "cayo-levantado", name: "Cayo Levantado", slug: "cayo-levantado", provinceId: "samana", municipalityId: "samana", isPopularZone: true },

  // Puerto Plata
  { id: "cabarete", name: "Cabarete", slug: "cabarete", provinceId: "puerto-plata", municipalityId: "sosua", isPopularZone: true },
  { id: "sosua", name: "Sosúa", slug: "sosua", provinceId: "puerto-plata", municipalityId: "sosua", isPopularZone: true },
  { id: "playa-dorada", name: "Playa Dorada", slug: "playa-dorada", provinceId: "puerto-plata", municipalityId: "san-felipe-de-puerto-plata", isPopularZone: true },

  // La Vega
  { id: "jarabacoa", name: "Jarabacoa", slug: "jarabacoa", provinceId: "la-vega", municipalityId: "jarabacoa", isPopularZone: true },
  { id: "constanza", name: "Constanza", slug: "constanza", provinceId: "la-vega", municipalityId: "constanza", isPopularZone: true },

  // Santo Domingo / Distrito Nacional
  { id: "ciudad-colonial", name: "Ciudad Colonial", slug: "ciudad-colonial", provinceId: "distrito-nacional", municipalityId: "santo-domingo-de-guzman", isPopularZone: true },
  { id: "malecon-sd", name: "Malecón de Santo Domingo", slug: "malecon-sd", provinceId: "distrito-nacional", municipalityId: "santo-domingo-de-guzman", isPopularZone: true },
  { id: "boca-chica", name: "Boca Chica", slug: "boca-chica", provinceId: "santo-domingo", municipalityId: "boca-chica", isPopularZone: true },
  { id: "juan-dolio", name: "Juan Dolio", slug: "juan-dolio", provinceId: "san-pedro-de-macoris", municipalityId: "guayacanes", isPopularZone: true },

  // Sur y Suroeste
  { id: "bahia-de-las-aguilas", name: "Bahía de las Águilas", slug: "bahia-de-las-aguilas", provinceId: "pedernales", municipalityId: "pedernales", isPopularZone: true },
  { id: "cabo-rojo", name: "Cabo Rojo", slug: "cabo-rojo", provinceId: "pedernales", municipalityId: "pedernales", isPopularZone: true },
  { id: "bahia-de-neiba", name: "Bahía de Neiba / Costera", slug: "bahia-de-neiba", provinceId: "barahona", municipalityId: "santa-cruz-de-barahona", isPopularZone: true },
];

// Helper functions
export function getProvinces(): DominicanProvince[] {
  return DOMINICAN_PROVINCES;
}

export function getMunicipalitiesByProvince(provinceId: string): DominicanMunicipality[] {
  return DOMINICAN_MUNICIPALITIES.filter((m) => m.provinceId === provinceId);
}

export function getDestinationsByProvince(provinceId: string): TouristDestinationRef[] {
  return TOURIST_DESTINATIONS_REF.filter((d) => d.provinceId === provinceId);
}

export function findProvinceByIdOrSlug(idOrSlug: string): DominicanProvince | undefined {
  const norm = idOrSlug.trim().toLowerCase();
  return DOMINICAN_PROVINCES.find((p) => p.id === norm || p.slug === norm || p.name.toLowerCase() === norm);
}
