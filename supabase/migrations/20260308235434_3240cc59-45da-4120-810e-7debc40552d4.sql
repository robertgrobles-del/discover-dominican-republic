-- Create stamps table for digital passport
CREATE TABLE public.passport_stamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  beach_id UUID REFERENCES public.beaches(id) ON DELETE CASCADE,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  
  stamp_type TEXT NOT NULL CHECK (stamp_type IN ('destination', 'beach', 'hotel', 'restaurant', 'experience', 'custom')),
  stamp_name TEXT NOT NULL,
  stamp_location TEXT,
  stamp_image TEXT,
  
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  verification_method TEXT CHECK (verification_method IN ('qr_scan', 'check_in', 'gps', 'manual', 'purchase')),
  verification_data JSONB,
  
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  
  notes TEXT,
  photos TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create gamified routes table
CREATE TABLE public.gamified_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  
  route_type TEXT NOT NULL DEFAULT 'adventure' CHECK (route_type IN ('adventure', 'culture', 'gastronomy', 'nature', 'beach', 'history', 'wellness')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  
  duration_days INTEGER,
  distance_km NUMERIC,
  
  total_xp_reward INTEGER DEFAULT 0,
  total_coin_reward INTEGER DEFAULT 0,
  completion_badge_id UUID REFERENCES public.gamification_prizes(id),
  
  image_url TEXT,
  gallery TEXT[],
  
  min_level INTEGER DEFAULT 1,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create route checkpoints table
CREATE TABLE public.route_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.gamified_routes(id) ON DELETE CASCADE,
  
  checkpoint_order INTEGER NOT NULL,
  checkpoint_name TEXT NOT NULL,
  checkpoint_description TEXT,
  
  checkpoint_type TEXT NOT NULL CHECK (checkpoint_type IN ('destination', 'activity', 'photo_spot', 'challenge', 'rest_stop')),
  
  destination_id UUID REFERENCES public.destinations(id),
  beach_id UUID REFERENCES public.beaches(id),
  hotel_id UUID REFERENCES public.hotels(id),
  restaurant_id UUID REFERENCES public.restaurants(id),
  experience_id UUID REFERENCES public.experiences(id),
  
  latitude NUMERIC,
  longitude NUMERIC,
  
  xp_reward INTEGER DEFAULT 10,
  coin_reward INTEGER DEFAULT 0,
  
  challenge_task TEXT,
  photo_required BOOLEAN DEFAULT false,
  
  is_mandatory BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user route progress table
CREATE TABLE public.user_route_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_id UUID NOT NULL REFERENCES public.gamified_routes(id) ON DELETE CASCADE,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  current_checkpoint INTEGER DEFAULT 0,
  checkpoints_completed INTEGER DEFAULT 0,
  total_checkpoints INTEGER DEFAULT 0,
  
  total_xp_earned INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 0,
  
  is_completed BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, route_id)
);

-- Create user checkpoint completions table
CREATE TABLE public.user_checkpoint_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_id UUID NOT NULL REFERENCES public.gamified_routes(id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES public.route_checkpoints(id) ON DELETE CASCADE,
  
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  photo_url TEXT,
  notes TEXT,
  verification_data JSONB,
  
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, checkpoint_id)
);

-- Create digital collectibles table
CREATE TABLE public.digital_collectibles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  
  collectible_type TEXT NOT NULL CHECK (collectible_type IN ('landmark', 'culture', 'nature', 'food', 'activity', 'event', 'special')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  
  image_url TEXT,
  animated_url TEXT,
  thumbnail_url TEXT,
  
  unlock_condition TEXT,
  unlock_requirement JSONB,
  
  total_supply INTEGER,
  current_supply INTEGER DEFAULT 0,
  
  xp_value INTEGER DEFAULT 0,
  coin_value INTEGER DEFAULT 0,
  
  is_tradeable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  season TEXT,
  event_id UUID REFERENCES public.events(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user collectibles inventory
CREATE TABLE public.user_collectibles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  collectible_id UUID NOT NULL REFERENCES public.digital_collectibles(id) ON DELETE CASCADE,
  
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acquisition_method TEXT CHECK (acquisition_method IN ('mission', 'route', 'event', 'purchase', 'gift', 'trade')),
  
  is_favorite BOOLEAN DEFAULT false,
  display_order INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, collectible_id)
);

-- Enable RLS
ALTER TABLE public.passport_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamified_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_route_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checkpoint_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collectibles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for passport_stamps
CREATE POLICY "Users view own stamps"
  ON public.passport_stamps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own stamps"
  ON public.passport_stamps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage stamps"
  ON public.passport_stamps FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for gamified_routes
CREATE POLICY "Anyone can view active routes"
  ON public.gamified_routes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage routes"
  ON public.gamified_routes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for route_checkpoints
CREATE POLICY "Anyone can view checkpoints"
  ON public.route_checkpoints FOR SELECT
  USING (true);

CREATE POLICY "Admins manage checkpoints"
  ON public.route_checkpoints FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_route_progress
CREATE POLICY "Users view own progress"
  ON public.user_route_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress"
  ON public.user_route_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON public.user_route_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_checkpoint_completions
CREATE POLICY "Users view own completions"
  ON public.user_checkpoint_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own completions"
  ON public.user_checkpoint_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for digital_collectibles
CREATE POLICY "Anyone can view active collectibles"
  ON public.digital_collectibles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage collectibles"
  ON public.digital_collectibles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_collectibles
CREATE POLICY "Users view own collectibles"
  ON public.user_collectibles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own collectibles"
  ON public.user_collectibles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own collectibles"
  ON public.user_collectibles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_passport_stamps_user_id ON public.passport_stamps(user_id);
CREATE INDEX idx_passport_stamps_visited_at ON public.passport_stamps(visited_at DESC);
CREATE INDEX idx_route_checkpoints_route_id ON public.route_checkpoints(route_id);
CREATE INDEX idx_route_checkpoints_order ON public.route_checkpoints(route_id, checkpoint_order);
CREATE INDEX idx_user_route_progress_user_id ON public.user_route_progress(user_id);
CREATE INDEX idx_user_checkpoint_completions_user_route ON public.user_checkpoint_completions(user_id, route_id);
CREATE INDEX idx_user_collectibles_user_id ON public.user_collectibles(user_id);
CREATE INDEX idx_digital_collectibles_rarity ON public.digital_collectibles(rarity);

-- Create trigger for updating updated_at
CREATE TRIGGER update_gamified_routes_updated_at
  BEFORE UPDATE ON public.gamified_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_route_progress_updated_at
  BEFORE UPDATE ON public.user_route_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_digital_collectibles_updated_at
  BEFORE UPDATE ON public.digital_collectibles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();