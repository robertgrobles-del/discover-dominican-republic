export interface RecipeItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  badges: string[];
  time: string;
  prepTime?: string;
  cookTime?: string;
  difficulty: "Fácil" | "Medio" | "Media-Alta" | "Complejo";
  servings: string;
  region: string;
  history: string;
  quote: string;
  heroImage: string;
  videoImage?: string;
  maridaje?: string;
  description: string;
  ingredients: {
    [category: string]: string[];
  };
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
  relatedRecipes: {
    slug: string;
    title: string;
    category: string;
    time: string;
    image: string;
  }[];
}

export const recipesData: Record<string, RecipeItem> = {
  "chivo-guisado": {
    id: "chivo-guisado",
    slug: "chivo-guisado",
    title: "Chivo Guisado Liniero",
    tagline: '"El sabor rústico y apasionado de la Línea Noroeste y el Sur profundo."',
    badges: ["Patrimonio Gastronómico", "Línea Noroeste", "Montecristi", "Azua"],
    time: "2.5 Horas",
    prepTime: "30 min",
    cookTime: "2 Horas",
    difficulty: "Media-Alta",
    servings: "6-8 Personas",
    region: "Montecristi, Dajabón, Azua & Pedernales",
    description: "Carne de chivo criada en tierras semiáridas alimentada de orégano silvestre, marinada en naranja agria, ajo y ají gustoso, y cocinada a fuego lento hasta quedar tierna y jugosa con un toque de ron o vino tinto.",
    history: `El chivo liniero es una de las joyas gastronómicas más codiciadas de la República Dominicana. En las zonas semiáridas del Noroeste (Montecristi, Mao, Dajabón) y el Suroeste (Azua, Pedernales), los chivos pastan libremente entre matorrales de orégano silvestre silvestre y cambrón, lo que impregna su carne de un aroma y sabor natural único e inconfundible.

Su preparación tradicional exige paciencia, un buen caldero de hierro curado y el balance justo entre la acidez de la naranja agria criolla, el ardor tenue del ají caballero o picante lareño, y la cocción lenta que ablanda la carne hasta deshacerse con el tenedor. Servido tradicionalmente con moro de guandules con coco, tostones o yuca con mojo.`,
    quote: '"El secreto del chivo liniero no está en esconder su bravura, sino en enamorarla con orégano silvestre, naranja agria y fuego pausado."',
    heroImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&h=800&fit=crop",
    videoImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=450&fit=crop",
    maridaje: "Cerveza Presidente vestida de novia, ron dominicano añejo o vino tinto tempranillo con cuerpo.",
    ingredients: {
      "Carne & Marinado": [
        "4 lbs de carne de chivo (cortada en trozos medianos con hueso)",
        "Jugo de 3 naranjas agrias criollas",
        "8 dientes de ajo majados en pilón",
        "2 cucharadas soperas de orégano silvestre dominicano recién molido",
        "2 cucharadas de salsa de soya o salsa inglesa criolla",
        "1 cucharada de vinagre blanco de caña",
        "1 cucharadita de sal en grano y pimienta negra al gusto"
      ],
      "Sofrito & Verduras": [
        "1 cebolla roja dominicana grande picada en brunoise",
        "1 pimiento verde criollo picado",
        "4 ajíes gustosos triturados",
        "1 ají cubanela picadito",
        "1 atado de recao (cilantro ancho) y cilantro verde",
        "2 tomates barceló maduros pelados y picados",
        "1 cucharadita de pasta de achiote o pasta de tomate criolla",
        "1 cucharada de azúcar morena (para caramelizar el fondo del caldero)"
      ],
      "Cocción & Toque Especial": [
        "3 cucharadas de aceite vegetal o manteca",
        "1/2 taza de ron dominicano añejo o vino tinto seco",
        "Agua caliente o caldo según necesidad (aprox. 3 tazas)",
        "1 ramita de tomillo fresco"
      ]
    },
    steps: [
      {
        number: 1,
        title: "Limpieza profunda y adobo en pilón",
        description: "Lava la carne de chivo con abundante agua fría y frota vigorosamente con el jugo de naranja agria para neutralizar los aromas fuertes. En un pilón de madera, maja el ajo con la sal, el orégano silvestre y los ajíes gustosos. Embadurna los trozos de chivo con este sofrito, añade la pimienta, la cebolla picada y el toque de vinagre. Deja marinar tapado en refrigeración por un mínimo de 2 horas (idealmente toda la noche)."
      },
      {
        number: 2,
        title: "Caramelizado y sellado en caldero",
        description: "En un caldero grande de hierro fundido a fuego vivo, calienta el aceite y agrega la cucharada de azúcar morena. Deja que el azúcar burbujee y tome un color avellana/ámbar oscuro (sin quemarse). Incorpora los trozos de carne escurridos del adobo y sella a fuego alto hasta que adquieran un dorado caoba uniforme."
      },
      {
        number: 3,
        title: "Sofrito e incorporación de líquidos",
        description: "Añade el líquido restante del marinado, los tomates, los pimientos, el ají cubanela y la pasta de achiote/tomate. Vierte el ron añejo o vino tinto para desglasar el fondo del caldero, liberando todos los azúcares concentrados. Cocina por 5 minutos hasta que el alcohol se evapore."
      },
      {
        number: 4,
        title: "Cocción lenta y reducción aromática",
        description: "Agrega 2 tazas de agua caliente y el atado de recao/cilantro. Reduce el fuego a medio-bajo, tapa bien y deja cocinar durante aproximadamente 1 hora y media a 2 horas, removiendo ocasionalmente y añadiendo pequeños chorritos de agua tibia si se seca. La carne debe quedar tan tierna que se desprenda del hueso y la salsa densa, sedosa y profundamente especiada."
      }
    ],
    relatedRecipes: [
      { slug: "pescado-frito", title: "Pescado Frito Boca Chica", category: "Costa / Almuerzo", time: "45 min", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=200&h=150&fit=crop" },
      { slug: "casabe", title: "Casabe Artesanal Taíno", category: "Herencia / Guarnición", time: "30 min", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=150&fit=crop" },
      { slug: "sancocho", title: "Sancocho de Siete Carnes", category: "Plato Insignia", time: "3.5 Horas", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop" },
      { slug: "mangu", title: "Mangú de Los Tres Golpes", category: "Desayuno", time: "30 min", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=150&fit=crop" }
    ]
  },

  "pescado-frito": {
    id: "pescado-frito",
    slug: "pescado-frito",
    title: "Pescado Frito al Estilo Boca Chica",
    tagline: '"La crujiente gloria del mar Caribe servida con tostones dorados y yaniqueque."',
    badges: ["Costa Caribeña", "Boca Chica", "Samaná", "Barahona"],
    time: "45 Minutos",
    prepTime: "25 min",
    cookTime: "20 min",
    difficulty: "Medio",
    servings: "4 Personas",
    region: "Boca Chica, Samaná, Las Terrenas & Palenque",
    description: "Pescado entero fresco (chillo, mero o colorado) sazonado con orégano, ajo y limón, enharinado ligeramente y frito a temperatura precisa hasta lograr una piel ultra crujiente y una carne blanca jugosa.",
    history: `El pescado frito playero es el alma culinaria de las costas dominicanas, con epicentro legendario en las casetas de Boca Chica, los muelles de Samaná y las bahías de Barahona. El ritual data de generaciones de pescadores que preparaban la pesca del día en pailas de hierro al borde de la orilla.

El secreto radica en realizar cortes diagonales profundos en la carne para que el adobo penetre hasta la espina central, una capa finísima de harina para asegurar que la piel quede crujiente como cristal, y el innegociable acompañamiento: tostones fritos dos veces, un yaniqueque gigante crujiente, tajadas de aguacate fresco y cuartos de limón criollo.`,
    quote: '"Comerse un chillo frito a la orilla del mar con los pies en la arena y las manos con limón es la definición dominicana de la felicidad."',
    heroImage: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=1920&h=800&fit=crop",
    videoImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=450&fit=crop",
    maridaje: "Cerveza rubia helada, agua de coco fresca recién cortada de la palma o cóctel Santo Libre.",
    ingredients: {
      "El Pescado & Sazón": [
        "2 pescados enteros frescos de 1.5 a 2 lbs c/u (Chillo / Pargo rojo, Mero o Colirrubia)",
        "Jugo de 4 limones criollos frescos",
        "6 dientes de ajo machacados con sal marina en pilón",
        "1 cucharada de orégano seco molido",
        "1 cucharadita de pimienta negra recién molida",
        "1 cucharada de sal en grano"
      ],
      "Para el Rebozado Crujiente": [
        "1 taza de harina de trigo todo uso (o mezcla 50/50 con harina de maíz fina)",
        "1 cucharadita de pimentón dulce / paprika",
        "1/2 cucharadita de sal marina fina",
        "Aceite de maíz o girasol abundante para freír por inmersión"
      ],
      "Acompañamientos Tradicionales": [
        "3 plátanos verdes cortados en ruedas gruesas para tostones",
        "Yaniqueque crujiente de harina de trigo",
        "Aguacate dominicano mantequilla en rodajas",
        "Gajos de limón criollo para exprimir al momento"
      ]
    },
    steps: [
      {
        number: 1,
        title: "Limpieza y cortes diagonales",
        description: "Limpia y desescama muy bien los pescados, retirando agallas e impurezas internas. Sécalos minuciosamente por dentro y por fuera con papel absorbente. Realiza de 3 a 4 cortes diagonales profundos a lo largo de cada lomo, llegando casi hasta la espina central para permitir que el calor y el sazón penetren parejos."
      },
      {
        number: 2,
        title: "Adobo aromático criollo",
        description: "En un tazón pequeño, mezcla el ajo machacado, el jugo de limón, el orégano, la sal y la pimienta. Frota esta pasta intensamente por toda la cavidad interna del pescado, en las agallas y dentro de las incisiones de la piel. Deja reposar de 15 a 20 minutos a temperatura ambiente."
      },
      {
        number: 3,
        title: "Enharinado sutil y sacudida",
        description: "Pasa cada pescado por la mezcla de harina sazonada con paprika y sal, cubriendo cada rincón. Sacude enérgicamente para eliminar todo exceso de harina suelta (debe quedar solo un velo fino y translúcido, evitando que el aceite se queme)."
      },
      {
        number: 4,
        title: "Fritura dorada y crujiente",
        description: "Calienta abundante aceite en una sartén honda o caldero a 180°C (350°F). Introduce el pescado suavemente con la cabeza orientada hacia el fondo. Fríe durante 8-10 minutos por lado sin moverlo constantemente hasta que la piel esté dorada, rígida y crujiente. Escurre en rejilla y sirve inmediatamente rociado con limón."
      }
    ],
    relatedRecipes: [
      { slug: "chivo-guisado", title: "Chivo Guisado Liniero", category: "Guiso / Tradicional", time: "2.5 Horas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=150&fit=crop" },
      { slug: "casabe", title: "Casabe Artesanal Taíno", category: "Herencia / Guarnición", time: "30 min", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=150&fit=crop" },
      { slug: "pescado-al-coco", title: "Pescado al Coco de Samaná", category: "Costa / Especialidad", time: "40 min", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&h=150&fit=crop" },
      { slug: "morir-sonando", title: "Morir Soñando", category: "Bebida Típica", time: "10 min", image: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=200&h=150&fit=crop" }
    ]
  },

  "casabe": {
    id: "casabe",
    slug: "casabe",
    title: "Casabe Artesanal Dominicano",
    tagline: '"El pan sagrado de los taínos: crujiente, milenario y patrimonio inmaterial."',
    badges: ["Herencia Taína", "Monción", "San José de las Matas", "Patrimonio UNESCO"],
    time: "45 Minutos",
    prepTime: "30 min",
    cookTime: "15 min",
    difficulty: "Medio",
    servings: "6-8 Tortas",
    region: "Monción (Santiago Rodríguez), San José de las Matas & Palenque",
    description: "El alimento aborigen por excelencia de la Quisqueya precolombina. Torta plana y crujiente hecha 100% de harina de yuca amarga o dulce prensada y cocida a la plancha en un burén de barro o hierro fundido.",
    history: `El Casabe es el eslabón vivo más antiguo de la gastronomía dominicana y caribeña. Creado por los aborígenes taínos hace más de mil años, el proceso de rallar la yuca en guayos de piedra, exprimir su jugo mediante el 'cibucán' (prensa de fibras vegetales) y cocer la harina resultante sobre un 'burén' ardiente permitió almacenar alimento no perecedero durante meses y travesías marítimas.

Hoy en día, el municipio de Monción en la provincia de Santiago Rodríguez es la capital mundial del casabe artesanal, produciendo variedades tradicionales tostadas al natural, aromatizadas con ajo criollo, queso de hoja dorado, semillas de ajonjolí o rellenos de dulce de guayaba. En 2023, la tradición del casabe fue declarada Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO.`,
    quote: '"El casabe no es solo pan; es la memoria viva de los primeros habitantes de Quisqueya horneada en el barro."',
    heroImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&h=800&fit=crop",
    videoImage: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&h=450&fit=crop",
    maridaje: "Queso geo criollo, pasta de aguacate, café con leche al atardecer o como base crujiente para sancocho y chivo.",
    ingredients: {
      "Ingredientes Base": [
        "4 lbs de yuca fresca (yuca dulce o amarga procesada)",
        "1 cucharadita de sal marina fina (opcional al gusto)",
        "Agua fría para el lavado"
      ],
      "Variedades & Coberturas Criollas": [
        "2 cucharadas de pasta de ajo criollo con aceite de oliva (para Casabe al Ajo)",
        "100g de queso de hoja o queso blanco criollo rallado (para Casabe con Queso)",
        "2 cucharadas de semillas de ajonjolí tostadas",
        "Dulce de pasta de guayaba dominicana para versión dulce"
      ]
    },
    steps: [
      {
        number: 1,
        title: "Pelado, lavado y rallado fino",
        description: "Pela las raíces de yuca retirando la corteza leñosa exterior y la capa rosácea interior. Lava con abundante agua fría y corta en trozos manejables. Ralla la yuca por el lado más fino del guayo o procesador de alimentos hasta obtener una masa húmeda y homogénea."
      },
      {
        number: 2,
        title: "Prensado y extracción del almidón húmedo",
        description: "Coloca la masa rallada dentro de un lienzo de algodón limpio o bolsa de prensado. Exprime con fuerza extrema para extraer toda el agua y almidón líquido (el 'yare'). La masa resultante ('catibía') debe quedar casi seca, desmoronadiza y granulada."
      },
      {
        number: 3,
        title: "Tamizado y moldeado en burén",
        description: "Pasa la harina seca por un tamiz o cedazo fino para romper grumos. Calienta un burén, plancha de hierro fundido o comal plano a fuego medio (aprox. 160°C). Con un aro o con las manos, esparce una capa uniforme de harina de unos 3-4 mm de grosor, presionando ligeramente con una espátula de madera para compactar los bordes."
      },
      {
        number: 4,
        title: "Cocción, tostado y variedades",
        description: "Cocina durante 4 a 6 minutos hasta que la torta se una en una sola pieza y los bordes comiencen a levantarse. Voltea con una espátula ancha y cocina por el otro lado durante 3 a 5 minutos más hasta que esté seca y crujiente. Si deseas casabe al ajo o con queso, barniza la superficie en el último minuto de cocción."
      }
    ],
    relatedRecipes: [
      { slug: "chivo-guisado", title: "Chivo Guisado Liniero", category: "Guiso / Tradicional", time: "2.5 Horas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=150&fit=crop" },
      { slug: "pescado-frito", title: "Pescado Frito Boca Chica", category: "Costa / Almuerzo", time: "45 min", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=200&h=150&fit=crop" },
      { slug: "sancocho", title: "Sancocho de Siete Carnes", category: "Plato Insignia", time: "3.5 Horas", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop" },
      { slug: "mangu", title: "Mangú de Los Tres Golpes", category: "Desayuno", time: "30 min", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=150&fit=crop" }
    ]
  },

  "sancocho": {
    id: "sancocho",
    slug: "sancocho",
    title: "Sancocho de Siete Carnes",
    tagline: '"El abrazo cálido de la República Dominicana en un plato."',
    badges: ["Plato Insignia", "Cibao", "Cordillera Central", "Tradición Nacional"],
    time: "3.5 Horas",
    prepTime: "40 min",
    cookTime: "2.5 Horas",
    difficulty: "Complejo",
    servings: "8-10 Personas",
    region: "Cibao Central, Santo Domingo & Cordillera",
    description: "El caldo supremo y ritual dominicano. Cocinado lentamente con siete carnes selectas, víveres frescos de la huerta, auyama espesante, hierbas aromáticas y naranja agria.",
    history: `El Sancocho no es solo una sopa, es un ritual sagrado de los domingos y ocasiones memorables. Su origen es un tapiz tejido con influencias españolas (por el cocido) e indígenas y africanas, evolucionando en las islas del Caribe hasta convertirse en el plato de bandera indiscutible de la República Dominicana.

Se dice que el "verdadero" sancocho de lujo debe tener siete tipos de carnes diferentes, una muestra de abundancia reservada para grandes celebraciones familiares. Cocinado lentamente en grandes calderos de hierro, a menudo sobre leña de campamento, el caldo absorbe la esencia de los tubérculos locales (yuca, yautía, plátano, auyama) hasta lograr esa textura sedosa, dorada y reconfortante.`,
    quote: '"En cada cucharada de Sancocho hay siglos de historia, resistencia y la alegría inquebrantable del pueblo dominicano."',
    heroImage: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1920&h=800&fit=crop",
    videoImage: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=450&fit=crop",
    maridaje: "Arroz blanco con concón crujiente, tajadas de aguacate mantequilla y salsa picante agridulce.",
    ingredients: {
      "Las Carnes": [
        "1.5 lbs de carne de res (pecho o falda)",
        "1 lb de chivo o cabrito limpio",
        "1 lb de longaniza criolla dominicana",
        "1.5 lbs de costillas de cerdo tiernas",
        "1 pollo de campo entero cortado en presas",
        "1 lb de chuletas de cerdo ahumadas",
        "1/2 lb de tocino o tocineta dorada"
      ],
      "Los Víveres de la Huerta": [
        "3 plátanos verdes en rodajas",
        "2 plátanos maduros (para toque sutil)",
        "1.5 lbs de yuca fresca en trozos",
        "1 lb de yautía blanca o amarilla",
        "1 lb de auyama criolla (para dar color y cuerpo)",
        "3 mazorcas de maíz dulce cortadas en ruedas",
        "1 lb de ñame criollo"
      ],
      "Sazón & Aromas": [
        "Jugo de 3 naranjas agrias",
        "1 atado grande de cilantro ancho y recao verde",
        "2 cucharadas de orégano silvestre tostado",
        "8 dientes de ajo majados en pilón",
        "1 cebolla roja picada",
        "1 ají cubanela picadito",
        "Sal en grano y pimienta al gusto"
      ]
    },
    steps: [
      {
        number: 1,
        title: "Limpieza y Marinado de las Carnes",
        description: "Corta todas las carnes en trozos medianos. Lávalas con abundante agua y frótalas con las naranjas agrias. En un tazón grande, sazona las carnes con orégano, ajo majado, cebolla picada, sal y pimienta. Deja marinar por al menos 1 hora para que los sabores penetren."
      },
      {
        number: 2,
        title: "El Sofrito Inicial y Caramelizado",
        description: "En un caldero grande, calienta un poco de aceite con una cucharadita de azúcar. Agrega la carne de res y cerdo primero (que son más duras) y sofríe hasta que doren bien. Agrega un chorrito de agua gradualmente para permitir que se cocinen en su propio jugo."
      },
      {
        number: 3,
        title: "Hervor y Víveres de Base",
        description: "Añade el resto de las carnes (pollo, longaniza, chivo) y continúa sofriendo. Agrega suficiente agua caliente para cubrir todo generosamente (aprox. 4-5 litros). Cuando hierva, añade el plátano verde y la yautía. Deja cocer a fuego medio hasta que los víveres comiencen a ablandarse."
      },
      {
        number: 4,
        title: "El Toque de Espesor y Cierre",
        description: "Agrega la yuca, la auyama y el maíz. La auyama es crucial, ya que al desbaratarse dará el color amarillo y el espesor característico al caldo. Tritura algunos trozos de auyama y plátano y regrésalos al caldero. Rectifica la sal y deja hervir hasta que todo esté tierno y el caldo tenga cuerpo cremoso. Termina agregando el cilantro fresco picado justo antes de apagar el fuego."
      }
    ],
    relatedRecipes: [
      { slug: "chivo-guisado", title: "Chivo Guisado Liniero", category: "Guiso / Tradicional", time: "2.5 Horas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=150&fit=crop" },
      { slug: "pescado-frito", title: "Pescado Frito Boca Chica", category: "Costa / Almuerzo", time: "45 min", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=200&h=150&fit=crop" },
      { slug: "casabe", title: "Casabe Artesanal Taíno", category: "Herencia / Guarnición", time: "30 min", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=150&fit=crop" },
      { slug: "mangu", title: "Mangú de Los Tres Golpes", category: "Desayuno", time: "30 min", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=150&fit=crop" }
    ]
  },

  "mangu": {
    id: "mangu",
    slug: "mangu",
    title: "Mangú de Los Tres Golpes",
    tagline: '"El desayuno de los campeones dominicanos: plátano, queso, salami y huevo."',
    badges: ["Desayuno Insignia", "Cibao", "Orgullo Nacional"],
    time: "30 Minutos",
    prepTime: "10 min",
    cookTime: "20 min",
    difficulty: "Fácil",
    servings: "4 Personas",
    region: "Nacional / Cibao",
    description: "Puré suave y aterciopelado de plátanos verdes machacados con mantequilla y agua fría, coronado con cebollitas moradas al vinagre y acompañado de salami dominicano frito, queso de freír y huevos.",
    history: `El Mangú es el desayuno identitario por excelencia de la República Dominicana. Su origen se remonta a las tradiciones africanas de machacar plátanos y tubérculos (como el fufú), refinada con los ingredientes de la vida cotidiana criolla. La frase "Los Tres Golpes" hace referencia al trío canónico que lo acompaña: queso frito crujiente por fuera y tierno por dentro, salami dominicano sellado y huevo frito con yema tierna.`,
    quote: '"El dominicano que come mangú de desayuno tiene energía y optimismo para conquistar el mundo entero."',
    heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=800&fit=crop",
    videoImage: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=450&fit=crop",
    maridaje: "Café dominicano recién colado con leche evaporada o jugo de naranja dulce.",
    ingredients: {
      "El Mangú": [
        "4 plátanos verdes frescos",
        "2 cucharadas de mantequilla",
        "1/2 taza de agua helada (el secreto de la cremosidad)",
        "1 cucharadita de sal"
      ],
      "Las Cebollitas": [
        "1 cebolla roja grande en rodajas finas",
        "2 cucharadas de vinagre de manzana o blanco",
        "1 cucharada de aceite de oliva o maíz",
        "Una pizca de sal"
      ],
      "Los Tres Golpes": [
        "8 rodajas de salami dominicano de calidad",
        "8 rodajas de queso de freír dominicano",
        "4 huevos frescos de campo",
        "1 aguacate maduro en rebanadas"
      ]
    },
    steps: [
      {
        number: 1,
        title: "Hervir los plátanos",
        description: "Pela los plátanos verdes, córtalos en trozos medianos y hiérvelos en abundante agua con una cucharadita de sal hasta que estén completamente tiernos (aprox. 20 minutos)."
      },
      {
        number: 2,
        title: "Saltear las cebollitas",
        description: "Remoja las cebollas en el vinagre y la sal por 5 minutos. Calienta una sartén con aceite y saltéalas brevemente hasta que se tornen de color fucsia traslúcido y suaves."
      },
      {
        number: 3,
        title: "Freír los tres golpes",
        description: "En sartenes calientes dora el queso de freír por ambos lados, el salami hasta que quede crujiente y prepara los huevos fritos al punto de tu preferencia."
      },
      {
        number: 4,
        title: "El majado maestro",
        description: "Escurre los plátanos y machácalos inmediatamente con la mantequilla. Ve vertiendo el agua helada poco a poco mientras majas: el contraste térmico detiene la gelatinización y crea una textura de puré suave sin grumos. Corona con las cebollas y acompaña con los tres golpes."
      }
    ],
    relatedRecipes: [
      { slug: "chivo-guisado", title: "Chivo Guisado Liniero", category: "Guiso / Tradicional", time: "2.5 Horas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=150&fit=crop" },
      { slug: "pescado-frito", title: "Pescado Frito Boca Chica", category: "Costa / Almuerzo", time: "45 min", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=200&h=150&fit=crop" },
      { slug: "casabe", title: "Casabe Artesanal Taíno", category: "Herencia / Guarnición", time: "30 min", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=150&fit=crop" },
      { slug: "morir-sonando", title: "Morir Soñando", category: "Bebida", time: "10 min", image: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=200&h=150&fit=crop" }
    ]
  },

  "pescado-al-coco": {
    id: "pescado-al-coco",
    slug: "pescado-al-coco",
    title: "Pescado al Coco al Estilo Samaná",
    tagline: '"La cremosidad sedosa del coco fresco abrazando la pesca del Atlántico."',
    badges: ["Samaná", "Costa Atlántica", "Cocina Afrocaribeña"],
    time: "45 Minutos",
    prepTime: "20 min",
    cookTime: "25 min",
    difficulty: "Medio",
    servings: "4 Personas",
    region: "Península de Samaná, Las Galeras & Las Terrenas",
    description: "Filetes o postas de mero o chillo fresco cocidos en una reducción cremosa de leche de coco pura recién rallada con pimientos, ajo, cebolla y orégano criollo.",
    history: `La cocina con coco es la insignia indiscutible de la península de Samaná, fruto de la herencia de los libertos afroamericanos llegados en el siglo XIX y de las comunidades pesqueras ancestrales. La leche de coco natural confiere una untuosidad dulce y aterciopelada que equilibra la salinidad marina del pescado.`,
    quote: '"En Samaná, el coco no es un ingrediente; es la bendición con la que la naturaleza bautiza cada plato del mar."',
    heroImage: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1920&h=800&fit=crop",
    videoImage: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&h=450&fit=crop",
    maridaje: "Moro de guandules con coco, tostones y vino blanco frío.",
    ingredients: {
      "El Pescado": [
        "4 filetes gruesos de chillo o mero fresco (aprox. 2 lbs)",
        "Jugo de 2 limones criollos",
        "4 dientes de ajo machacados",
        "1 cucharadita de sal marina y pimienta"
      ],
      "La Salsa de Coco": [
        "2 tazas de leche de coco natural recién exprimida",
        "1 pimiento rojo y 1 pimiento verde en juliana",
        "1 cebolla blanca picada en aros",
        "2 tomates maduros en concassé",
        "1 cucharadita de orégano criollo seco",
        "1 cucharadita de achiote para un tono dorado",
        "1 atado de cilantro fresco picado"
      ]
    },
    steps: [
      {
        number: 1,
        title: "Sazonar el pescado",
        description: "Frota los filetes de pescado con el limón, el ajo, la sal y el orégano. Deja reposar 15 minutos."
      },
      {
        number: 2,
        title: "El sofrito de pimientos y coco",
        description: "En una sartén ancha y honda con un poco de aceite de coco, saltea la cebolla, los tomates y los pimientos morrones hasta que estén fragantes. Añade la leche de coco y el achiote. Cocina a fuego lento durante 8-10 minutos hasta que la salsa empiece a reducir y espesar."
      },
      {
        number: 3,
        title: "Cocinar el pescado en la salsa",
        description: "Coloca delicadamente los filetes de pescado en la sartén. Baña la parte superior con la salsa hirviendo, tapa y cocina a fuego medio-bajo durante 10-12 minutos hasta que el pescado esté tierno y jugoso."
      },
      {
        number: 4,
        title: "Toque verde y presentación",
        description: "Espolvorea abundante cilantro fresco justo antes de servir sobre un plato de moro de guandules con coco y tostones crujientes."
      }
    ],
    relatedRecipes: [
      { slug: "pescado-frito", title: "Pescado Frito Boca Chica", category: "Costa / Almuerzo", time: "45 min", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=200&h=150&fit=crop" },
      { slug: "chivo-guisado", title: "Chivo Guisado Liniero", category: "Guiso / Tradicional", time: "2.5 Horas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=150&fit=crop" },
      { slug: "casabe", title: "Casabe Artesanal Taíno", category: "Herencia / Guarnición", time: "30 min", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=150&fit=crop" },
      { slug: "morir-sonando", title: "Morir Soñando", category: "Bebida", time: "10 min", image: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=200&h=150&fit=crop" }
    ]
  },

  "habichuelas-con-dulce": {
    id: "habichuelas-con-dulce",
    slug: "habichuelas-con-dulce",
    title: "Habichuelas con Dulce Tradicionales",
    tagline: '"El milagro dulce y especiado de la Cuaresma dominicana, único en el mundo."',
    badges: ["Postre Insignia", "Cuaresma", "Sur & Cibao", "Patrimonio Único"],
    time: "1.5 Horas",
    prepTime: "25 min",
    cookTime: "1 Hora",
    difficulty: "Medio",
    servings: "8 Personas",
    region: "Nacional (Sur y Cibao)",
    description: "Crema dulce sedosa de habichuelas rojas licuadas con leche evaporada, leche de coco, canela, clavo dulce, nuez moscada, batata cocida caramelizada, pasas y galletitas de leche con cruz.",
    history: `Las Habichuelas con Dulce son una preparación culinaria única en el mundo entero, exclusiva de la República Dominicana durante la Cuaresma y Semana Santa. Nace de un mestizaje extraordinario de legumbres del nuevo mundo, técnicas de cocción francesas y españolas de cremas de frutas y dulces de leche, y especias traídas de las Indias Orientales. Servirlas frías o tibias rodeadas de familiares es uno de los momentos más entrañables de la cultura dominicana.`,
    quote: '"No existe otro lugar en el planeta que transforme las habichuelas en un manjar tan dulce, aromático y celestial."',
    heroImage: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1920&h=800&fit=crop",
    videoImage: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=450&fit=crop",
    maridaje: "Galletitas crujientes de leche con cruz de azúcar glas y canela en polvo.",
    ingredients: {
      "Base de Habichuelas & Leches": [
        "1 lb de habichuelas rojas hervidas suaves sin sal",
        "2 latas de leche evaporada",
        "1 lata de leche de coco cremosa",
        "1 lata de leche condensada (o 1 taza de azúcar morena)"
      ],
      "Especias & Acompañamientos": [
        "2 ramas de canela dulce",
        "8 clavos de olor enteros",
        "1/2 cucharadita de nuez moscada rallada",
        "1 cucharada de extracto de vainilla dominicana",
        "1 lb de batata dulce pelada, cortada en cubitos y hervida al dente",
        "1/2 taza de pasas negras",
        "1 paquete de galletitas de leche con cruz tradicional"
      ]
    },
    steps: [
      {
        number: 1,
        title: "Licuado y colado doble",
        description: "Licúa las habichuelas cocidas con parte de su agua y la leche de coco. Cuela dos veces por un colador fino para eliminar todos los hollejos y conseguir una textura completamente lisa y sedosa."
      },
      {
        number: 2,
        title: "Cocción especiada en caldero",
        description: "Vierte el licuado en una olla gruesa. Agrega la leche evaporada, la leche condensada o azúcar, las ramas de canela, los clavos de olor, la nuez moscada y la vainilla. Cocina a fuego medio-bajo revolviendo constantemente con cuchara de madera."
      },
      {
        number: 3,
        title: "Incorporación de batatas y pasas",
        description: "Cuando la mezcla empiece a espesar y tomar aroma profundo (aprox. 25-30 minutos), incorpora los cubitos de batata cocida y las pasas. Cocina 15 minutos más a fuego bajo hasta que alcance la densidad deseada."
      },
      {
        number: 4,
        title: "Reposo y servido tradicional",
        description: "Deja enfriar a temperatura ambiente o refrigera según tu gusto personal. Sirve en copas o platos hondos decorando la superficie con las tradicionales galletitas de leche."
      }
    ],
    relatedRecipes: [
      { slug: "sancocho", title: "Sancocho de Siete Carnes", category: "Plato Insignia", time: "3.5 Horas", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop" },
      { slug: "mangu", title: "Mangú de Los Tres Golpes", category: "Desayuno", time: "30 min", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=150&fit=crop" },
      { slug: "chivo-guisado", title: "Chivo Guisado Liniero", category: "Guiso / Tradicional", time: "2.5 Horas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=150&fit=crop" },
      { slug: "morir-sonando", title: "Morir Soñando", category: "Bebida", time: "10 min", image: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=200&h=150&fit=crop" }
    ]
  },

  "morir-sonando": {
    id: "morir-sonando",
    slug: "morir-sonando",
    title: "Morir Soñando Dominicano",
    tagline: '"La alquimia mágica entre el cítrico de la naranja y la cremosidad de la leche helada."',
    badges: ["Bebida Tradicional", "Refrescante", "Caribe Criollo"],
    time: "10 Minutos",
    prepTime: "10 min",
    cookTime: "0 min",
    difficulty: "Fácil",
    servings: "4 Vasos",
    region: "Nacional",
    description: "La bebida más famosa y refrescante de las tardes dominicanas. Jugo de naranja natural recién exprimido combinado con leche evaporada bien fría, azúcar de caña, vainilla y hielo picado.",
    history: `El nombre "Morir Soñando" evoca la sensación placentera de alivio y delicia que produce beber este elixir helado bajo el calor tropical de la isla. El desafío clásico de las abuelas dominicanas radica en que la leche no se corte con el ácido de la naranja: la técnica consiste en enfriar ambos líquidos al extremo antes de mezclarlos velozmente con abundante hielo.`,
    quote: '"Un vaso de Morir Soñando bien frío cura el calor, alegra el alma y te transporta a las tardes caribeñas."',
    heroImage: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=1920&h=800&fit=crop",
    videoImage: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=800&h=450&fit=crop",
    maridaje: "Empanadas de yuca o harina recién fritas, quipes o tostadas de queso criollo.",
    ingredients: {
      "Ingredientes Principales": [
        "2 tazas de jugo de naranja natural recién exprimido y colado",
        "2 tazas de leche evaporada muy fría (casi al punto de escarcha)",
        "1/2 taza de azúcar de caña (al gusto)",
        "1 cucharadita de extracto de vainilla dominicana",
        "Abundante hielo picado (mínimo 3 tazas)"
      ]
    },
    steps: [
      {
        number: 1,
        title: "Disolver el azúcar en el cítrico",
        description: "En una jarra fría, mezcla el jugo de naranja recién exprimido con el azúcar y la vainilla. Remueve bien hasta que el azúcar esté completamente disuelto."
      },
      {
        number: 2,
        title: "Añadir hielo en abundancia",
        description: "Llena la jarra con abundante hielo picado. El frío extremo es el secreto para que los ácidos no corten la proteína de la leche."
      },
      {
        number: 3,
        title: "Batido continuo y unión láctea",
        description: "Vierte lentamente la leche evaporada muy fría mientras bates enérgicamente con una cuchara de mango largo o batidor de alambre."
      },
      {
        number: 4,
        title: "Servir al instante",
        description: "Sirve inmediatamente en vasos altos con pajita y decora con una rodaja de naranja fresca."
      }
    ],
    relatedRecipes: [
      { slug: "mangu", title: "Mangú de Los Tres Golpes", category: "Desayuno", time: "30 min", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=150&fit=crop" },
      { slug: "pescado-frito", title: "Pescado Frito Boca Chica", category: "Costa / Almuerzo", time: "45 min", image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=200&h=150&fit=crop" },
      { slug: "chivo-guisado", title: "Chivo Guisado Liniero", category: "Guiso / Tradicional", time: "2.5 Horas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=150&fit=crop" },
      { slug: "casabe", title: "Casabe Artesanal Taíno", category: "Herencia / Guarnición", time: "30 min", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=150&fit=crop" }
    ]
  }
};

// Map alternate slug names or IDs to corresponding recipe keys
export const recipeSlugMap: Record<string, string> = {
  "chivo": "chivo-guisado",
  "chivo-guisado": "chivo-guisado",
  "chivo-liniero": "chivo-guisado",
  "pescado-frito": "pescado-frito",
  "pescado-frito-boca-chica": "pescado-frito",
  "chillo-frito": "pescado-frito",
  "casabe": "casabe",
  "casabe-artesanal": "casabe",
  "casabe-taino": "casabe",
  "sancocho": "sancocho",
  "sancocho-siete-carnes": "sancocho",
  "sancocho-de-siete-carnes": "sancocho",
  "mangu": "mangu",
  "mangu-tres-golpes": "mangu",
  "mangu-dominicano": "mangu",
  "pescado-al-coco": "pescado-al-coco",
  "pescado-al-coco-samana": "pescado-al-coco",
  "habichuelas-con-dulce": "habichuelas-con-dulce",
  "morir-sonando": "morir-sonando"
};

export function getRecipeBySlug(slug?: string): RecipeItem {
  if (!slug) return recipesData["chivo-guisado"];
  const normalized = slug.toLowerCase().trim();
  const targetKey = recipeSlugMap[normalized] || normalized;
  return recipesData[targetKey] || recipesData["chivo-guisado"];
}
