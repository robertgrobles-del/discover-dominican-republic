export interface Ingredient {
  name: string;
  amountPerServing: number;
  unit: string;
}

export interface CriolloRecipe {
  id: string;
  name: string;
  category: "fuerte" | "postre" | "bebida" | "desayuno";
  region: string;
  prepTime: string;
  cookTime: string;
  difficulty: "Fácil" | "Medio" | "Complejo";
  description: string;
  calories: string;
  maridaje: string;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl: string;
  heroImage: string;
}

export const criolloRecipes: CriolloRecipe[] = [
  {
    id: "mangu-tres-golpes",
    name: "Mangú Dominicano (Los Tres Golpes)",
    category: "desayuno",
    region: "Nacional / Cibao",
    prepTime: "15 min",
    cookTime: "20 min",
    difficulty: "Fácil",
    calories: "580 kcal",
    maridaje: "Café dominicano colado con leche evaporada o jugo de naranja agria",
    description: "El desayuno nacional por excelencia. Plátanos verdes hervidos y machacados hasta lograr una textura aterciopelada, acompañados de salami frito, queso de freír dorado y huevos, coronado con cebollas rojas al vinagre.",
    ingredients: [
      { name: "Plátanos verdes", amountPerServing: 1, unit: "unidad(es)" },
      { name: "Mantequilla", amountPerServing: 0.25, unit: "cda(s)" },
      { name: "Agua fría con hielo (para suavizar)", amountPerServing: 0.1, unit: "taza(s)" },
      { name: "Cebolla roja en aros", amountPerServing: 0.25, unit: "unidad(es)" },
      { name: "Vinagre blanco o de manzana", amountPerServing: 1, unit: "cdta(s)" },
      { name: "Queso de freír dominicano", amountPerServing: 2, unit: "rodaja(s)" },
      { name: "Salami dominicano", amountPerServing: 2, unit: "rodaja(s)" },
      { name: "Huevo fresco", amountPerServing: 1, unit: "unidad(es)" }
    ],
    instructions: [
      "Pela los plátanos verdes, córtalos en rodajas de 2 pulgadas y ponlos a hervir en agua abundante con una cucharadita de sal hasta que estén tiernos al pincharlos con un tenedor (aprox. 15-20 min).",
      "Corta la cebolla roja en aros finos y déjala reposar en un tazón con vinagre y una pizca de sal durante 10 minutos. Luego, pásala por una sartén con una cucharada de aceite a fuego medio hasta que adquiera un tono fucsia traslúcido.",
      "Fríe en sartenes independientes las rodajas de queso de freír hasta que doren, el salami hasta que esté crujiente y prepara el huevo frito al término de tu preferencia.",
      "Escurre los plátanos reservando un poco del agua de cocción. Machácalos calientes con la mantequilla y añade gradualmente el agua fría con hielo; esto detiene la cocción y crea un puré cremoso y suave sin grumos.",
      "Sirve el mangú caliente, decóralo con las cebollas salteadas por encima y acompaña con los tres golpes tradicionales."
    ],
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&auto=format&fit=crop&q=80"
  },
  {
    id: "sancocho-siete-carnes",
    name: "Sancocho Dominicano de Siete Carnes",
    category: "fuerte",
    region: "Cordillera Central / Cibao",
    prepTime: "35 min",
    cookTime: "90 min",
    difficulty: "Complejo",
    calories: "720 kcal",
    maridaje: "Cerveza Presidente bien fría o Ron Añejo en las rocas",
    description: "El rey de las celebraciones dominicanas. Un guiso denso y suculento de tubérculos locales (yuca, plátano, auyama, yautía) y carnes maceradas con cilantro ancho, orégano y naranja agria.",
    ingredients: [
      { name: "Carne de res tierna en cubos", amountPerServing: 75, unit: "g" },
      { name: "Pollo de campo en piezas", amountPerServing: 75, unit: "g" },
      { name: "Chuleta ahumada o costilla de cerdo", amountPerServing: 60, unit: "g" },
      { name: "Longaniza criolla", amountPerServing: 40, unit: "g" },
      { name: "Yuca fresca en trozos", amountPerServing: 0.25, unit: "unidad(es)" },
      { name: "Plátano verde en rodajas", amountPerServing: 0.25, unit: "unidad(es)" },
      { name: "Auyama para espesar", amountPerServing: 60, unit: "g" },
      { name: "Mazorca de maíz dulce", amountPerServing: 0.3, unit: "unidad(es)" },
      { name: "Cilantro ancho (recaito)", amountPerServing: 0.25, unit: "atado(s)" },
      { name: "Zumo de naranja agria", amountPerServing: 1, unit: "cda(s)" }
    ],
    instructions: [
      "Macerar todas las carnes cortadas en trozos con ajo triturado, orégano silvestre, cilantro, sal y naranja agria durante al menos 30 minutos.",
      "En un caldero grande de hierro fundido, carameliza una cucharada de azúcar en aceite caliente y dora las carnes hasta que alcancen un color caoba intenso.",
      "Agrega 2 tazas de agua caliente, tapa y cocina a fuego medio durante 30 minutos para concentrar el jugo de las carnes.",
      "Incorpora los víveres: yuca, plátano verde, auyama y mazorcas de maíz. Añade agua hirviendo hasta cubrir todo generosamente.",
      "Cocina a fuego medio-bajo hasta que los víveres estén suaves. Retira algunos trozos de auyama y plátano, tritúralos con un tenedor y regrésalos al caldo para lograr ese espesor legendario del sancocho.",
      "Ajusta de sal, rocía un toque final de naranja agria y cilantro fresco. Sirve con arroz blanco, aguacate y salsa picante criolla."
    ],
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1400&auto=format&fit=crop&q=80"
  },
  {
    id: "pescado-al-coco-samana",
    name: "Pescado al Coco al Estilo Samaná",
    category: "fuerte",
    region: "Península de Samaná / Costa Atlántica",
    prepTime: "20 min",
    cookTime: "25 min",
    difficulty: "Medio",
    calories: "510 kcal",
    maridaje: "Vino blanco Sauvignon Blanc o agua de coco fresca",
    description: "Plato insignia de la costa nordeste. Mero o chillo fresco cocinado en una reducción untuosa de leche de coco natural, pimientos tricolores, orégano criollo y cilantro.",
    ingredients: [
      { name: "Filete de chillo o mero fresco", amountPerServing: 180, unit: "g" },
      { name: "Leche de coco natural recién exprimida", amountPerServing: 0.5, unit: "taza(s)" },
      { name: "Pimientos morrones picados", amountPerServing: 0.25, unit: "unidad(es)" },
      { name: "Cebolla blanca y ajo", amountPerServing: 0.25, unit: "unidad(es)" },
      { name: "Tomate maduro en cubos", amountPerServing: 0.5, unit: "unidad(es)" },
      { name: "Orégano seco y achiote para color", amountPerServing: 0.5, unit: "cdta(s)" }
    ],
    instructions: [
      "Sazona los filetes de pescado con zumo de limón, ajo machacado, orégano criollo y una pizca de sal marina.",
      "En una sartén honda, saltea la cebolla, el ajo y los pimientos morrones en aceite caliente hasta que comiencen a ablandarse.",
      "Añade la leche de coco natural y el achiote. Cocina a fuego suave durante 8 minutos hasta que la salsa reduzca y espese.",
      "Coloca con cuidado los filetes de pescado dentro de la salsa de coco y cocina tapado a fuego medio-bajo durante 10-12 minutos, bañando el pescado con la salsa constantemente.",
      "Sirve con tostones crujientes de plátano verde o moro de guandules con coco."
    ],
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1400&auto=format&fit=crop&q=80"
  },
  {
    id: "habichuelas-con-dulce",
    name: "Habichuelas con Dulce Tradicionales",
    category: "postre",
    region: "Nacional (Sur y Cibao)",
    prepTime: "20 min",
    cookTime: "45 min",
    difficulty: "Medio",
    calories: "420 kcal",
    maridaje: "Galletitas de leche con cruz de azúcar",
    description: "El postre más emblemático de la República Dominicana, único en el mundo. Crema sedosa de frijoles rojos cocidos con leche de vaca, leche de coco, batata caramelizada, pasas y especias dulces.",
    ingredients: [
      { name: "Frijoles rojos hervidos sin sal", amountPerServing: 0.5, unit: "taza(s)" },
      { name: "Leche evaporada", amountPerServing: 0.4, unit: "lata(s)" },
      { name: "Leche de coco cremosa", amountPerServing: 0.3, unit: "lata(s)" },
      { name: "Azúcar morena", amountPerServing: 0.25, unit: "taza(s)" },
      { name: "Batata dulce en cubitos hervida", amountPerServing: 50, unit: "g" },
      { name: "Canela en rama, clavo y nuez moscada", amountPerServing: 1, unit: "pizca(s)" },
      { name: "Pasas y galletitas de leche", amountPerServing: 15, unit: "g" }
    ],
    instructions: [
      "Licúa los frijoles rojos hervidos con parte de su agua y la leche de coco. Cuela la mezcla dos veces para asegurar una textura perfectamente lisa sin hollejos.",
      "Vierte la mezcla en una olla gruesa, agrega la leche evaporada, el azúcar morena, las ramas de canela, los clavos de olor y una pizca de nuez moscada.",
      "Cocina a fuego medio revolviendo constantemente con una cuchara de madera para que no se pegue al fondo.",
      "Cuando comience a espesar (aprox. 25 min), incorpora los cubos de batata cocida y las pasas.",
      "Cocina por 15 minutos adicionales hasta que alcance la densidad deseada. Deja enfriar a temperatura ambiente o refrigera. Sirve coronado con las tradicionales galletitas de cruz."
    ],
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1400&auto=format&fit=crop&q=80"
  },
  {
    id: "chivo-guisado",
    name: "Chivo Guisado Liniero",
    category: "fuerte",
    region: "Montecristi / Línea Noroeste",
    prepTime: "30 min",
    cookTime: "120 min",
    difficulty: "Complejo",
    calories: "640 kcal",
    maridaje: "Moro de guandules con coco, tostones y cerveza Presidente vestida de novia",
    description: "Carne de chivo criada con orégano silvestre, marinada en naranja agria, ajo y ají gustoso, y cocinada a fuego lento hasta quedar tierna y jugosa con un toque de ron añejo.",
    ingredients: [
      { name: "Carne de chivo en trozos con hueso", amountPerServing: 180, unit: "g" },
      { name: "Zumo de naranja agria criolla", amountPerServing: 1.5, unit: "cda(s)" },
      { name: "Orégano silvestre dominicano", amountPerServing: 1, unit: "cdta(s)" },
      { name: "Ajo majado con sal en pilón", amountPerServing: 2, unit: "dientes" },
      { name: "Ají gustoso y cubanela picado", amountPerServing: 0.5, unit: "unidad(es)" },
      { name: "Cebolla roja dominicana", amountPerServing: 0.25, unit: "unidad(es)" },
      { name: "Ron dominicano añejo para desglasar", amountPerServing: 1, unit: "cda(s)" }
    ],
    instructions: [
      "Lava la carne con agua y jugo de naranja agria. Sazona en pilón con ajo, sal, orégano silvestre y ajíes gustosos. Deja marinar 2 horas.",
      "En un caldero de hierro fundido, dora una cucharadita de azúcar en aceite caliente e incorpora la carne para sellarla hasta un color caoba.",
      "Añade la cebolla, pimientos, tomates y desglasa con un chorro de ron dominicano añejo.",
      "Agrega agua caliente y recao. Tapa y cocina a fuego lento por 2 horas hasta que la carne esté tierna que se desprenda del hueso y la salsa esté espesa."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1400&auto=format&fit=crop&q=80"
  },
  {
    id: "pescado-frito",
    name: "Pescado Frito al Estilo Boca Chica",
    category: "fuerte",
    region: "Boca Chica / Costa Caribeña",
    prepTime: "25 min",
    cookTime: "20 min",
    difficulty: "Medio",
    calories: "530 kcal",
    maridaje: "Tostones crujientes, yaniqueque gigante, aguacate y cerveza fría",
    description: "Pescado entero fresco (chillo o mero) sazonado con orégano, ajo y limón, enharinado ligeramente y frito a temperatura precisa hasta lograr una piel ultra crujiente y una carne blanca jugosa.",
    ingredients: [
      { name: "Pescado entero fresco (Chillo o Mero)", amountPerServing: 250, unit: "g" },
      { name: "Jugo de limón criollo", amountPerServing: 1, unit: "cda(s)" },
      { name: "Ajo machacado con sal marina", amountPerServing: 1.5, unit: "dientes" },
      { name: "Orégano seco molido", amountPerServing: 0.5, unit: "cdta(s)" },
      { name: "Harina de trigo sazonada para rebozado", amountPerServing: 2, unit: "cda(s)" },
      { name: "Aceite abundante para freír", amountPerServing: 0.25, unit: "taza(s)" }
    ],
    instructions: [
      "Limpia y seca bien el pescado. Realiza 3-4 cortes diagonales profundos en los lomos.",
      "Sazona por dentro, agallas e incisiones con ajo machacado, limón, orégano y sal marina. Reposa 15 min.",
      "Pasa ligeramente por harina sazonada sacudiendo el exceso.",
      "Fríe en aceite bien caliente por 8-10 minutos por lado hasta que quede dorado y crujiente. Sirve con tostones y limón."
    ],
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&auto=format&fit=crop&q=80"
  },
  {
    id: "casabe",
    name: "Casabe Artesanal Taíno",
    category: "fuerte",
    region: "Monción / Santiago Rodríguez",
    prepTime: "30 min",
    cookTime: "15 min",
    difficulty: "Medio",
    calories: "280 kcal",
    maridaje: "Queso de hoja, pasta de ajo criollo o como acompañante de sancocho y chivo",
    description: "Torta crujiente milenaria 100% de yuca prensada en burén. Patrimonio Cultural Inmaterial UNESCO, alimento aborigen sagrado de los taínos.",
    ingredients: [
      { name: "Yuca fresca rallada y exprimida (catibía)", amountPerServing: 150, unit: "g" },
      { name: "Sal marina fina", amountPerServing: 0.25, unit: "cdta(s)" },
      { name: "Pasta de ajo con aceite de oliva (opcional)", amountPerServing: 0.5, unit: "cda(s)" },
      { name: "Queso criollo rallado (opcional)", amountPerServing: 20, unit: "g" }
    ],
    instructions: [
      "Pela y ralla la yuca muy fina. Exprime intensamente en un lienzo para retirar todo el almidón líquido.",
      "Pasa la harina seca por un tamiz fino para desmenuzar grumos.",
      "Esparce la harina uniformemente en un burén o plancha caliente formando una torta de 3 mm.",
      "Cocina 5 minutos por lado hasta que esté seca y crujiente. Barniza con ajo o queso si deseas."
    ],
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=1400&auto=format&fit=crop&q=80"
  },
  {
    id: "morir-sonando",
    name: "Morir Soñando Dominicano",
    category: "bebida",
    region: "Nacional",
    prepTime: "5 min",
    cookTime: "0 min",
    difficulty: "Fácil",
    calories: "210 kcal",
    maridaje: "Tostadas de queso o empanadas criollas",
    description: "Bebida caribeña legendaria que combina la frescura cítrica del jugo de naranja agria o dulce con la cremosidad de la leche evaporada y hielo granizado.",
    ingredients: [
      { name: "Zumo de naranja natural recién exprimido", amountPerServing: 0.5, unit: "taza(s)" },
      { name: "Leche evaporada muy fría", amountPerServing: 0.5, unit: "taza(s)" },
      { name: "Azúcar de caña", amountPerServing: 1.5, unit: "cda(s)" },
      { name: "Extracto de vainilla dominicana", amountPerServing: 0.25, unit: "cdta(s)" },
      { name: "Hielo picado abundante", amountPerServing: 1, unit: "taza(s)" }
    ],
    instructions: [
      "El secreto para que la leche no se corte: todos los ingredientes deben estar helados.",
      "En una jarra fría, disuelve el azúcar y la vainilla en el zumo de naranja.",
      "Agrega abundante hielo picado a la jarra de zumo.",
      "Vierte la leche evaporada helada lentamente mientras bates vigorosamente con un batidor de globo o cuchara larga.",
      "Sirve inmediatamente en vasos altos con un sorbete."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534353473418-4cfa0b79efbe?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=1400&auto=format&fit=crop&q=80"
  }
];
