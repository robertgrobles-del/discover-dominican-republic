import historyImg from "@/assets/history.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import colonialDoorImg from "@/assets/colonial-door.jpg";

export interface TimelineEvent {
  yearOrDate: string;
  title: string;
  description: string;
}

export interface RelatedItem {
  title: string;
  slug: string;
  type: "biografia" | "evento" | "monumento";
}

export interface HistoryArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "biografia" | "evento" | "epoca" | "batalla" | "documento";
  era: "Prehispánica" | "Colonial" | "Independencia" | "Restauración" | "Siglo XX" | "Contemporánea";
  period: string; // ej: "1813 - 1876" o "1821"
  heroImage: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  readTime: string;
  summary: string;
  quote?: {
    text: string;
    author: string;
  };
  contentSections: {
    heading?: string;
    content: string;
  }[];
  timeline?: TimelineEvent[];
  relatedItems?: RelatedItem[];
  associatedMonumentSlugs?: string[]; // IDs de monumentos o patrimonio vinculados
}

export const historyArticles: HistoryArticle[] = [
  {
    id: "h1",
    slug: "juan-pablo-duarte",
    title: "Juan Pablo Duarte y Díez",
    subtitle: "Padre de la Patria y fundador de La Trinitaria",
    category: "biografia",
    era: "Independencia",
    period: "1813 – 1876",
    heroImage: historyImg,
    author: {
      name: "Comité de Historia Dominicana",
      role: "Historiador Oficial MITUR / AGN",
    },
    readTime: "7 min",
    summary: "Ideólogo, prócer y figura máxima de la emancipación dominicana. Concibió la República Dominicana como un Estado soberano, democrático y libre de toda dominación extranjera.",
    quote: {
      text: "Nunca me fue tan necesario como hoy el tener salud, corazón y juicio; hoy que hombres sin juicio y sin corazón conspiran contra la salud de la Patria.",
      author: "Juan Pablo Duarte, 1844"
    },
    contentSections: [
      {
        heading: "Primeros Años y Formación Europea",
        content: "Juan Pablo Duarte nació en la ciudad de Santo Domingo el 26 de enero de 1813, durante el período conocido como la España Boba. Siendo joven, viajó a Europa y Estados Unidos, donde absorbió los ideales del liberalismo, el romanticismo y las revoluciones democráticas de la época. Al regresar a su tierra natal, constató el yugo de la ocupación haitiana y juró dedicar su vida a forjar una patria independiente."
      },
      {
        heading: "La Fundación de La Trinitaria (1838)",
        content: "El 16 de julio de 1838, en la modesta residencia de Doña Chepita Pérez (frente a la Iglesia del Carmen en Santo Domingo), Duarte fundó junto a ocho compañeros la sociedad secreta 'La Trinitaria'. Cada miembro debía reclutar a otros tres bajo estricto juramento de lealtad. A través de representaciones teatrales con 'La Dramática' y campañas cívicas con 'La Filantrópica', concientizaron al pueblo dominicano sobre la imperiosa necesidad de la soberanía."
      },
      {
        heading: "El Proyecto de Constitución y el Exilio",
        content: "Duarte redactó un célebre proyecto de Ley Fundamental que proclamaba la igualdad ante la ley, la división en cuatro poderes del Estado (incluyendo el Poder Municipal) y la defensa intransigente de las libertades individuales. Perseguido por las autoridades invasoras y posteriormente por facciones anexionistas internas encabezadas por Pedro Santana, sufrió el destierro en Venezuela, donde falleció en Caracas en 1876 con absoluta dignidad y modestia."
      }
    ],
    timeline: [
      { yearOrDate: "26 Ene 1813", title: "Nacimiento", description: "Nace en Santo Domingo en el seno de la familia formada por Vicente Celestino Duarte y Manuela Díez." },
      { yearOrDate: "16 Jul 1838", title: "Fundación de La Trinitaria", description: "Crea la sociedad secreta independentista junto a Mella, Sánchez y seis jóvenes patriotas." },
      { yearOrDate: "27 Feb 1844", title: "Proclamación de la Independencia", description: "Sus compañeros proclaman la República Dominicana en la Puerta del Conde mientras Duarte coordinaba en el exterior." },
      { yearOrDate: "15 Jul 1876", title: "Inmortalidad", description: "Fallece en Caracas, Venezuela. Sus restos descansan hoy en el Altar de la Patria en Santo Domingo." }
    ],
    relatedItems: [
      { title: "Independencia Nacional 1844", slug: "independencia-nacional-1844", type: "evento" },
      { title: "Francisco del Rosario Sánchez", slug: "francisco-del-rosario-sanchez", type: "biografia" },
      { title: "Matías Ramón Mella", slug: "matias-ramon-mella", type: "biografia" }
    ],
    associatedMonumentSlugs: ["altar-de-la-patria", "puerta-del-conde", "casa-de-duarte"]
  },
  {
    id: "h2",
    slug: "independencia-efimera",
    title: "La Independencia Efímera de 1821",
    subtitle: "El primer intento soberano del Estado Independiente de Haití Español",
    category: "evento",
    era: "Independencia",
    period: "1 Dic 1821 – 9 Feb 1822",
    heroImage: colonialDoorImg,
    author: {
      name: "Archivo General de la Nación",
      role: "Investigación Histórica Dominicana",
    },
    readTime: "6 min",
    summary: "Narra la proclamación liderada por el ilustrado José Núñez de Cáceres el 1 de diciembre de 1821, separando la parte oriental de Santo Domingo de la Corona española para adherirse a la Gran Colombia de Simón Bolívar.",
    quote: {
      text: "No más sumisión a un poder colonial distante. El pueblo del Santo Domingo español reclama su lugar en el concierto de las naciones libres de América.",
      author: "José Núñez de Cáceres, Acta Constitutiva de 1821"
    },
    contentSections: [
      {
        heading: "Antecedentes: La España Boba y el Descontento Criollo",
        content: "Entre 1809 y 1821, Santo Domingo vivió el período de la 'España Boba', una etapa de profundo aislamiento económico y desatención por parte de la metrópoli española. La élite intelectual y burocrática criolla, inspirada por los triunfos de Simón Bolívar en Sudamérica y la difusión de la prensa libre, empezó a fraguar la ruptura definitiva con España."
      },
      {
        heading: "El Golpe del 1 de Diciembre de 1821",
        content: "En la noche del 30 de noviembre al 1 de diciembre de 1821, un contingente de tropas comandado por Núñez de Cáceres tomó por sorpresa la fortaleza y depuso al gobernador español Pascual Real. De inmediato se izó la bandera de la Gran Colombia y se promulgó la 'Declaratoria de Independencia del Pueblo del Estado de Haití Español'."
      },
      {
        heading: "¿Por qué duró solo 9 semanas?",
        content: "El nuevo Estado careció de dos factores vitales: el respaldo militar y diplomático de Simón Bolívar (quien se hallaba combatiendo en el sur de América) y el apoyo de las masas campesinas y libertos del interior del país. Aprovechando este vacío de poder y debilidad defensiva, el presidente Jean-Pierre Boyer avanzó con un ejército de más de 10,000 soldados, culminando el 9 de febrero de 1822 con la entrega pacífica de las llaves de la ciudad de Santo Domingo y el inicio de 22 años de ocupación."
      }
    ],
    timeline: [
      { yearOrDate: "1 Dic 1821", title: "Proclamación Soberana", description: "José Núñez de Cáceres declara el Estado Independiente del Haití Español." },
      { yearOrDate: "15 Dic 1821", title: "Misión Diplomática a Bolívar", description: "Se envía a Antonio María Pineda a Caracas para solicitar la incorporación formal a la Gran Colombia." },
      { yearOrDate: "9 Feb 1822", title: "Entrada de Boyer", description: "Las tropas haitianas cruzan la frontera y asumen el control de la isla, poniendo fin a los 70 días del gobierno efímero." }
    ],
    relatedItems: [
      { title: "Juan Pablo Duarte", slug: "juan-pablo-duarte", type: "biografia" },
      { title: "Gesta de la Restauración 1863", slug: "gesta-de-la-restauracion", type: "evento" }
    ],
    associatedMonumentSlugs: ["fortaleza-ozama", "catedral-primada"]
  },
  {
    id: "h3",
    slug: "gesta-de-la-restauracion",
    title: "Guerra de la Restauración (1863 - 1865)",
    subtitle: "El Grito de Capotillo y el rescate de la soberanía nacional",
    category: "evento",
    era: "Restauración",
    period: "1863 – 1865",
    heroImage: santoDomingoImg,
    author: {
      name: "Academia Dominicana de la Historia",
      role: "Publicaciones Históricas",
    },
    readTime: "8 min",
    summary: "La gesta patriótica que revirtió la traición de la Anexión a España perpetrada por Pedro Santana, reafirmando para siempre el carácter inalienable de la República Dominicana.",
    quote: {
      text: "La República Dominicana no admite protectorados ni cesión de su suelo; los dominicanos sabemos morir antes que ser esclavos.",
      author: "General Gregorio Luperón, 1864"
    },
    contentSections: [
      {
        heading: "La Anexión a España de 1861",
        content: "En marzo de 1861, el presidente Pedro Santana anexó inconsultamente el país a España a cambio de títulos nobiliarios y prebendas personales. La presencia de tropas peninsulares, el monopolio del tabaco y la imposición de nuevos tributos desataron la furia popular en el Cibao y el Sur."
      },
      {
        heading: "El Grito de Capotillo (16 de Agosto de 1863)",
        content: "Un grupo de 14 valientes patriotas comandados por Santiago Rodríguez, Benito Monción y José Cabrera cruzó la frontera noroeste y en el Cerro de Capotillo izó el pabellón tricolor. En pocas semanas, la insurrección se expandió como pólvora por toda la geografía nacional."
      },
      {
        heading: "El Liderazgo de Gregorio Luperón y la Victoria",
        content: "Bajo la genialidad táctica de Gregorio Luperón y Gaspar Polanco mediante tácticas de guerra de guerrillas, las fuerzas restauradoras sitiaron a las tropas españolas en las principales fortalezas hasta lograr la firma del pacto de desocupación en 1865."
      }
    ],
    timeline: [
      { yearOrDate: "18 Mar 1861", title: "Proclama de Anexión", description: "Pedro Santana baja la bandera dominicana y proclama el retorno al dominio de la reina Isabel II." },
      { yearOrDate: "16 Ago 1863", title: "Grito de Capotillo", description: "Inicio formal de la Guerra Restauradora en Dajabón." },
      { yearOrDate: "11 Jul 1865", title: "Evacuación Española", description: "Salida del último soldado de la corona española de territorio dominicano." }
    ],
    relatedItems: [
      { title: "Gregorio Luperón", slug: "gregorio-luperon", type: "biografia" },
      { title: "Monumento a los Héroes de la Restauración", slug: "monumento-heroes-santiago", type: "monumento" }
    ],
    associatedMonumentSlugs: ["monumento-heroes-santiago", "fortaleza-san-luis"]
  },
  {
    id: "h4",
    slug: "matias-ramon-mella",
    title: "Matías Ramón Mella",
    subtitle: "El estratega militar del Trabuco de la Independencia",
    category: "biografia",
    era: "Independencia",
    period: "1816 – 1864",
    heroImage: historyImg,
    author: {
      name: "Archivo General de la Nación",
      role: "Investigación Histórica Dominicana",
    },
    readTime: "6 min",
    summary: "Héroe nacional, estratega y diplomático. Disparó el histórico trabucazo en la Puerta de la Misericordia la noche del 27 de febrero de 1844.",
    quote: {
      text: "¡No hay tiempo que perder! ¡Juguémonos el todo por el todo!",
      author: "Matías Ramón Mella, 27 de febrero de 1844"
    },
    contentSections: [
      {
        heading: "El Héroe del 27 de Febrero",
        content: "Matías Ramón Mella Castillo fue uno de los más decididos miembros de La Trinitaria. Ante las vacilaciones de algunos conjurados en la noche del 27 de febrero de 1844, disparó su legendario trabuco, sellando irrevocablemente el compromiso libertador."
      },
      {
        heading: "Manual de Guerra de Guerrillas",
        content: "Durante la Guerra Restauradora, Mella redactó el famoso 'Manual de Guerra de Guerrillas', pieza fundamental que instruyó al ejército campesino dominicano sobre cómo derrotar a las disciplinadas tropas peninsulares españolas."
      }
    ],
    timeline: [
      { yearOrDate: "25 Feb 1816", title: "Nacimiento", description: "Nace en Santo Domingo." },
      { yearOrDate: "27 Feb 1844", title: "El Trabucazo", description: "Dispara el tiro que sella el inicio de la Independencia en la Puerta de la Misericordia." },
      { yearOrDate: "4 Jun 1864", title: "Muerte y Testamento", description: "Fallece en Santiago de los Caballeros envuelto en la bandera dominicana." }
    ],
    relatedItems: [
      { title: "Juan Pablo Duarte", slug: "juan-pablo-duarte", type: "biografia" },
      { title: "Francisco del Rosario Sánchez", slug: "francisco-del-rosario-sanchez", type: "biografia" }
    ],
    associatedMonumentSlugs: ["altar-de-la-patria", "puerta-del-conde"]
  },
  {
    id: "h5",
    slug: "alcazar-de-colon-historia",
    title: "El Virreinato y el Alcázar de Colón",
    subtitle: "Sede del primer gobierno virreinal en el Nuevo Mundo",
    category: "epoca",
    era: "Colonial",
    period: "1511 – 1526",
    heroImage: colonialDoorImg,
    author: {
      name: "Museo Alcázar de Colón",
      role: "Patrimonio Cultural de la Humanidad UNESCO",
    },
    readTime: "5 min",
    summary: "El palacio construido para Diego Colón, hijo del Gran Almirante Cristóbal Colón, y su esposa María de Toledo. Epicentro desde donde se planificaron las expediciones de conquista y exploración del continente americano.",
    contentSections: [
      {
        heading: "Arquitectura Gótica y Mudéjar",
        content: "Edificado con piedra de cantería de coral entre 1510 y 1514, el palacio contaba originalmente con 55 habitaciones. Es la única residencia conocida de un miembro directo de la familia Colón en América."
      },
      {
        heading: "Centro de Decisiones Continentales",
        content: "Desde los salones del Alcázar partieron expediciones históricas comandadas por Hernán Cortés hacia México, Diego Velázquez hacia Cuba y Juan Ponce de León hacia Puerto Rico y la Florida."
      }
    ],
    relatedItems: [
      { title: "Alcázar de Colón (Monumento)", slug: "alcazar-de-colon", type: "monumento" }
    ],
    associatedMonumentSlugs: ["alcazar-de-colon", "plaza-espana"]
  }
];

export function getHistoryArticleBySlug(slug: string): HistoryArticle | undefined {
  return historyArticles.find(a => a.slug === slug);
}

export function getHistoryArticlesByMonumentSlug(monumentSlug: string): HistoryArticle[] {
  return historyArticles.filter(a => 
    a.associatedMonumentSlugs?.includes(monumentSlug) ||
    a.relatedItems?.some(r => r.slug === monumentSlug)
  );
}
