
-- Articles table (main content in Spanish)
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text,
  image_url text,
  gallery text[],
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  author_name text,
  author_image text,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Article translations table (one row per language per article)
CREATE TABLE public.article_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, locale)
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;

-- RLS: Public can read published articles
CREATE POLICY "Public can view published articles" ON public.articles
  FOR SELECT USING (is_published = true);

-- RLS: Admins can manage articles
CREATE POLICY "Admins can manage articles" ON public.articles
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS: Public can read translations of published articles
CREATE POLICY "Public can view article translations" ON public.article_translations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.articles WHERE id = article_id AND is_published = true)
  );

-- RLS: Admins can manage translations
CREATE POLICY "Admins can manage article translations" ON public.article_translations
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_translations_updated_at BEFORE UPDATE ON public.article_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
