
CREATE TABLE public.lottery_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_name text NOT NULL,
  slug text UNIQUE,
  logo_url text,
  draw_date date NOT NULL,
  draw_time text,
  draw_type text DEFAULT 'regular',
  winning_numbers integer[] DEFAULT '{}',
  bonus_number integer,
  prize_pool text,
  jackpot_amount text,
  next_draw_date date,
  next_jackpot_estimate text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active lottery results"
  ON public.lottery_results FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage lottery results"
  ON public.lottery_results FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_lottery_results_date ON public.lottery_results (draw_date DESC);
CREATE INDEX idx_lottery_results_name ON public.lottery_results (lottery_name);
