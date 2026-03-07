
-- Create historical_figures table
CREATE TABLE public.historical_figures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  title text,
  birth_date text,
  death_date text,
  birth_place text,
  era text,
  category text DEFAULT 'politica',
  short_description text,
  description text,
  biography text,
  achievements text[] DEFAULT '{}',
  quotes text[] DEFAULT '{}',
  image_url text,
  gallery text[] DEFAULT '{}',
  related_events text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.historical_figures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active historical_figures"
  ON public.historical_figures FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage historical_figures"
  ON public.historical_figures FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_historical_figures_updated_at
  BEFORE UPDATE ON public.historical_figures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create historical_events table
CREATE TABLE public.historical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  event_date text,
  end_date text,
  year integer,
  era text,
  category text DEFAULT 'politica',
  location text,
  short_description text,
  description text,
  significance text,
  key_figures text[] DEFAULT '{}',
  consequences text[] DEFAULT '{}',
  image_url text,
  gallery text[] DEFAULT '{}',
  sources text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.historical_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active historical_events"
  ON public.historical_events FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage historical_events"
  ON public.historical_events FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_historical_events_updated_at
  BEFORE UPDATE ON public.historical_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed historical figures
INSERT INTO public.historical_figures (name, slug, title, birth_date, death_date, birth_place, era, category, short_description, description, biography, achievements, quotes, image_url, is_featured)
VALUES
(
  'Juan Pablo Duarte',
  'juan-pablo-duarte',
  'Padre de la Patria',
  '26 de enero de 1813',
  '15 de julio de 1876',
  'Santo Domingo',
  'Independencia',
  'politica',
  'Fundador de la República Dominicana y líder del movimiento independentista La Trinitaria.',
  'Juan Pablo Duarte es considerado el padre fundador de la República Dominicana. Su visión de una nación libre, soberana e independiente inspiró la creación de La Trinitaria, sociedad secreta que lideró la separación de Haití el 27 de febrero de 1844.',
  'Nacido en Santo Domingo el 26 de enero de 1813 en el seno de una familia de comerciantes. Viajó a Europa donde se inspiró en los ideales liberales y republicanos. A su regreso fundó La Trinitaria el 16 de julio de 1838 junto a Ramón Matías Mella y Francisco del Rosario Sánchez. Tras lograr la independencia fue exiliado por las fuerzas conservadoras de Pedro Santana. Murió en el exilio en Caracas, Venezuela, el 15 de julio de 1876, sin haber podido regresar permanentemente a su patria.',
  ARRAY['Fundación de La Trinitaria (1838)', 'Proclamación de la Independencia Nacional (1844)', 'Redacción del proyecto de Constitución liberal', 'Ideólogo del movimiento separatista dominicano', 'Símbolo de la identidad y soberanía dominicana'],
  ARRAY['Vivir sin patria es lo mismo que vivir sin honor.', 'Ser justos es la primera necesidad de la República.', 'La Nación dominicana es libre e independiente y no es ni puede ser jamás integrante de ninguna otra potencia.'],
  'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=600&h=400&fit=crop',
  true
),
(
  'Gregorio Luperón',
  'gregorio-luperon',
  'Héroe de la Restauración',
  '8 de septiembre de 1839',
  '20 de mayo de 1897',
  'Puerto Plata',
  'Restauración',
  'militar',
  'General y héroe de la Guerra de la Restauración contra la anexión española.',
  'Gregorio Luperón fue un militar y político dominicano, héroe principal de la Guerra de la Restauración (1863-1865). Luchó contra la anexión de República Dominicana a España y fue presidente provisional del país. Es considerado uno de los más grandes estrategas militares de la historia dominicana.',
  'Nacido en Puerto Plata el 8 de septiembre de 1839. Desde joven mostró un carácter rebelde y patriótico. Durante la Guerra de la Restauración demostró excepcionales habilidades militares, liderando guerrillas que expulsaron a las tropas españolas. Fue presidente del gobierno restaurador y gobernó con visión progresista, promoviendo la educación y el desarrollo económico. Sus memorias son una fuente invaluable de la historia dominicana.',
  ARRAY['Héroe de la Guerra de la Restauración (1863-1865)', 'Presidente del gobierno restaurador', 'Promotor de la educación pública', 'Defensor de la soberanía nacional', 'Autor de memorias históricas fundamentales'],
  ARRAY['La patria no se vende ni se hipoteca.', 'La educación es la base fundamental del progreso de los pueblos.'],
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
  true
),
(
  'Salomé Ureña',
  'salome-urena',
  'Poetisa Nacional',
  '21 de octubre de 1850',
  '6 de marzo de 1897',
  'Santo Domingo',
  'República',
  'cultura',
  'La más grande poetisa dominicana y pionera de la educación femenina en el país.',
  'Salomé Ureña de Henríquez fue una poetisa, educadora y activista dominicana. Es considerada la voz poética más importante de República Dominicana en el siglo XIX. Fundó el Instituto de Señoritas, primera institución de educación superior para mujeres en el país.',
  'Nacida en Santo Domingo el 21 de octubre de 1850, hija del también poeta Nicolás Ureña de Mendoza. Desde temprana edad demostró talento literario. Sus poemas patrióticos como "Ruinas", "La Fe en el Porvenir" y "Anacaona" la consagraron como la principal voz poética de su época. Fundó el Instituto de Señoritas en 1881, revolucionando la educación femenina. Madre de Pedro Henríquez Ureña, uno de los intelectuales más importantes de América Latina.',
  ARRAY['Poetisa Nacional de República Dominicana', 'Fundadora del Instituto de Señoritas (1881)', 'Pionera de la educación femenina', 'Madre de Pedro Henríquez Ureña', 'Su poesía patriótica es estudiada en todo el país'],
  ARRAY['La patria la forman no las extensiones de tierra, sino las grandezas del alma.'],
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=400&fit=crop',
  true
),
(
  'Las Hermanas Mirabal',
  'hermanas-mirabal',
  'Las Mariposas',
  '1924-1935',
  '25 de noviembre de 1960',
  'Ojo de Agua, Salcedo',
  'Era de Trujillo',
  'politica',
  'Heroínas de la resistencia contra la dictadura de Trujillo, símbolo mundial contra la violencia de género.',
  'Patria, Minerva y María Teresa Mirabal, conocidas como Las Mariposas, fueron activistas políticas que se opusieron valientemente a la dictadura de Rafael Leónidas Trujillo. Su asesinato el 25 de noviembre de 1960 conmocionó al país y aceleró la caída del régimen.',
  'Las tres hermanas nacieron en Ojo de Agua, provincia Salcedo (hoy Hermanas Mirabal). Minerva fue la primera en desafiar abiertamente a Trujillo. Junto a sus hermanas Patria y María Teresa, se unieron al movimiento clandestino 14 de Junio. Fueron asesinadas por agentes del régimen el 25 de noviembre de 1960. En su honor, la ONU declaró esa fecha como el Día Internacional de la Eliminación de la Violencia contra la Mujer.',
  ARRAY['Símbolo de la resistencia antitrujiillista', 'Miembros del Movimiento 14 de Junio', 'Su asesinato aceleró la caída de Trujillo', 'El 25 de noviembre es Día Internacional contra la Violencia de Género', 'Su historia inspiró la novela "En el tiempo de las mariposas"'],
  ARRAY['Si me matan, sacaré los brazos de la tumba y seré más fuerte. — Minerva Mirabal'],
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
  true
),
(
  'Pedro Henríquez Ureña',
  'pedro-henriquez-urena',
  'Maestro de América',
  '29 de junio de 1884',
  '11 de mayo de 1946',
  'Santo Domingo',
  'República',
  'cultura',
  'Filólogo, crítico literario y humanista dominicano, considerado el más grande intelectual del Caribe.',
  'Pedro Henríquez Ureña fue un filólogo, crítico literario, educador y humanista dominicano. Es considerado uno de los intelectuales más influyentes de América Latina en el siglo XX. Hijo de Salomé Ureña, continuó el legado intelectual de su madre.',
  'Nacido en Santo Domingo el 29 de junio de 1884. Hijo de Salomé Ureña y Francisco Henríquez y Carvajal. Vivió en Cuba, México, España y Argentina, donde dejó una huella indeleble en la vida académica. Fue profesor en la Universidad de Buenos Aires y en La Plata. Sus obras sobre la cultura y las letras hispanoamericanas son referencia obligada en los estudios literarios del continente.',
  ARRAY['Autor de "Seis ensayos en busca de nuestra expresión"', 'Profesor en universidades de México y Argentina', 'Referente de los estudios literarios latinoamericanos', 'Nombrado "Maestro de América"', 'Defensor de la identidad cultural latinoamericana'],
  ARRAY['La cultura es el único camino hacia la verdadera libertad.'],
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=400&fit=crop',
  false
);

-- Seed historical events
INSERT INTO public.historical_events (name, slug, event_date, year, era, category, location, short_description, description, significance, key_figures, consequences, image_url, is_featured)
VALUES
(
  'Independencia Nacional',
  'independencia-nacional-1844',
  '27 de febrero de 1844',
  1844,
  'Independencia',
  'politica',
  'Puerta del Conde, Santo Domingo',
  'Proclamación de la independencia de República Dominicana de la dominación haitiana.',
  'El 27 de febrero de 1844, los patriotas dominicanos liderados por los Trinitarios proclamaron la independencia de la República Dominicana en la Puerta del Conde, Santo Domingo. Este acto marcó la culminación de años de planificación y lucha por la soberanía nacional, iniciada con la fundación de La Trinitaria en 1838.',
  'Nacimiento de la República Dominicana como nación libre y soberana. Este evento es la piedra angular de la identidad nacional dominicana y se celebra cada año como la fiesta patria más importante del país.',
  ARRAY['Juan Pablo Duarte', 'Francisco del Rosario Sánchez', 'Ramón Matías Mella', 'Tomás Bobadilla'],
  ARRAY['Creación de la República Dominicana', 'Establecimiento de la primera Constitución', 'Inicio de las luchas por consolidar la independencia', 'Formación del primer gobierno nacional'],
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
  true
),
(
  'Guerra de la Restauración',
  'guerra-restauracion-1863',
  '16 de agosto de 1863',
  1863,
  'Restauración',
  'militar',
  'Capotillo, Dajabón',
  'Levantamiento armado contra la anexión a España y restauración de la soberanía dominicana.',
  'La Guerra de la Restauración comenzó el 16 de agosto de 1863 con el Grito de Capotillo, cuando un grupo de patriotas se alzó en armas contra la anexión de República Dominicana a España, decretada por Pedro Santana en 1861. Tras dos años de guerrilla, las tropas españolas fueron expulsadas y la soberanía nacional fue restaurada.',
  'Consolidación definitiva de la independencia dominicana y fin de cualquier intento de dominio extranjero directo sobre el territorio.',
  ARRAY['Gregorio Luperón', 'Santiago Rodríguez', 'Gaspar Polanco', 'Benito Monción'],
  ARRAY['Expulsión definitiva de España', 'Restauración de la soberanía', 'Ascenso del liderazgo militar restaurador', 'Fortalecimiento de la identidad nacional'],
  'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop',
  true
),
(
  'Fundación de Santo Domingo',
  'fundacion-santo-domingo-1496',
  '4 de agosto de 1496',
  1496,
  'Colonial',
  'fundacion',
  'Santo Domingo',
  'Establecimiento de la primera ciudad europea permanente del Nuevo Mundo.',
  'Santo Domingo fue fundada por Bartolomé Colón, hermano de Cristóbal Colón, el 4 de agosto de 1496. Se convirtió en la primera ciudad europea permanente en el continente americano, sirviendo como base de las expediciones de conquista y colonización del Nuevo Mundo.',
  'Santo Domingo fue la capital del imperio español en América durante sus primeros años, albergando las primeras instituciones europeas del continente: primera catedral, primera universidad, primer hospital y primera corte de justicia.',
  ARRAY['Bartolomé Colón', 'Cristóbal Colón', 'Nicolás de Ovando'],
  ARRAY['Ciudad Primada de América', 'Centro de conquista y colonización', 'Patrimonio de la Humanidad UNESCO', 'Primera catedral, universidad y hospital de América'],
  'https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?w=600&h=400&fit=crop',
  true
),
(
  'Ajusticiamiento de Trujillo',
  'ajusticiamiento-trujillo-1961',
  '30 de mayo de 1961',
  1961,
  'Era de Trujillo',
  'politica',
  'Autopista 30 de Mayo, Santo Domingo',
  'Fin de 31 años de dictadura con la muerte de Rafael Leónidas Trujillo.',
  'El 30 de mayo de 1961, un grupo de conspiradores emboscó y dio muerte al dictador Rafael Leónidas Trujillo en la autopista que hoy lleva el nombre de esa fecha. Este evento puso fin a 31 años de una de las dictaduras más sangrientas de América Latina.',
  'El ajusticiamiento de Trujillo abrió las puertas a la democratización de República Dominicana, aunque el proceso fue largo y turbulento, incluyendo la Revolución de Abril de 1965.',
  ARRAY['Antonio de la Maza', 'Antonio Imbert Barrera', 'Luis Amiama Tió', 'Juan Tomás Díaz'],
  ARRAY['Fin de la dictadura de 31 años', 'Inicio del proceso democrático', 'Transición política turbulenta', 'Revolución de Abril de 1965'],
  'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=600&h=400&fit=crop',
  true
),
(
  'Revolución de Abril',
  'revolucion-abril-1965',
  '24 de abril de 1965',
  1965,
  'Post-Trujillo',
  'militar',
  'Santo Domingo',
  'Insurrección cívico-militar por el retorno a la constitucionalidad que derivó en intervención estadounidense.',
  'El 24 de abril de 1965 estalló una insurrección cívico-militar que buscaba restituir al presidente constitucional Juan Bosch, derrocado por un golpe de Estado en 1963. El conflicto derivó en una intervención militar estadounidense que marcó profundamente la historia dominicana.',
  'La Revolución de Abril representó la lucha del pueblo dominicano por la democracia y el respeto a la constitución. La intervención estadounidense dejó heridas profundas pero también aceleró el proceso electoral que llevó a Joaquín Balaguer al poder.',
  ARRAY['Francisco Alberto Caamaño', 'Juan Bosch', 'Coronel Rafael Fernández Domínguez'],
  ARRAY['Intervención militar de Estados Unidos', 'Elecciones de 1966', 'Inicio de la era de Balaguer', 'Fortalecimiento de la conciencia democrática'],
  'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop',
  true
);
