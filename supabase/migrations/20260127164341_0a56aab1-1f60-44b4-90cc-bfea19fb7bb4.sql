-- Create airbnb_listings table for managing Airbnb properties
CREATE TABLE public.airbnb_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  short_description TEXT,
  property_type TEXT, -- apartment, house, villa, cabin, etc.
  image_url TEXT,
  gallery TEXT[],
  address TEXT,
  destination_id UUID REFERENCES public.destinations(id),
  
  -- Host information
  host_name TEXT,
  host_image TEXT,
  host_since DATE,
  is_superhost BOOLEAN DEFAULT false,
  host_response_rate INTEGER,
  host_response_time TEXT,
  host_languages TEXT[],
  host_description TEXT,
  
  -- Property details
  guests INTEGER DEFAULT 2,
  bedrooms INTEGER DEFAULT 1,
  beds INTEGER DEFAULT 1,
  bathrooms NUMERIC DEFAULT 1,
  
  -- Pricing
  price_per_night NUMERIC,
  cleaning_fee NUMERIC,
  service_fee NUMERIC,
  price_range TEXT,
  
  -- Amenities
  amenities TEXT[],
  house_rules TEXT[],
  safety_features TEXT[],
  
  -- Policies
  check_in_time TEXT,
  check_out_time TEXT,
  cancellation_policy TEXT, -- flexible, moderate, strict
  cancellation_details TEXT,
  min_nights INTEGER DEFAULT 1,
  max_nights INTEGER,
  
  -- Location
  latitude NUMERIC,
  longitude NUMERIC,
  neighborhood_description TEXT,
  
  -- Ratings
  rating NUMERIC,
  review_count INTEGER DEFAULT 0,
  cleanliness_rating NUMERIC,
  accuracy_rating NUMERIC,
  checkin_rating NUMERIC,
  communication_rating NUMERIC,
  location_rating NUMERIC,
  value_rating NUMERIC,
  
  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  instant_book BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.airbnb_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active airbnb_listings" 
ON public.airbnb_listings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage airbnb_listings" 
ON public.airbnb_listings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_airbnb_listings_updated_at
BEFORE UPDATE ON public.airbnb_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();