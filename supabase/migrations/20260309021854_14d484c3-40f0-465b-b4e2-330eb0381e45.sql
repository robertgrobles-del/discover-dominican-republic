
-- Trivia questions table
CREATE TABLE public.trivia_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  explanation TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  times_answered INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User trivia sessions
CREATE TABLE public.trivia_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_sessions ENABLE ROW LEVEL SECURITY;

-- Everyone can read questions
CREATE POLICY "Anyone can read active trivia questions" ON public.trivia_questions
  FOR SELECT USING (is_active = true);

-- Admins can manage questions
CREATE POLICY "Admins can manage trivia questions" ON public.trivia_questions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Users can insert their own sessions
CREATE POLICY "Users can insert own trivia sessions" ON public.trivia_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can read own sessions
CREATE POLICY "Users can read own trivia sessions" ON public.trivia_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can read all sessions
CREATE POLICY "Admins can read all trivia sessions" ON public.trivia_sessions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
