-- Create soil_data table to store soil health measurements
CREATE TABLE public.soil_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  municipality TEXT NOT NULL,
  specific_location TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  temperature DECIMAL(5, 2) NOT NULL,
  ph_level DECIMAL(4, 2) NOT NULL,
  overall_fertility DECIMAL(5, 2) NOT NULL,
  point_scale INTEGER NOT NULL CHECK (point_scale BETWEEN 1 AND 5),
  nitrogen_level DECIMAL(5, 2),
  phosphorus_level DECIMAL(5, 2),
  potassium_level DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.soil_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view soil data (public dataset)
CREATE POLICY "Anyone can view soil data"
  ON public.soil_data
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own data
CREATE POLICY "Authenticated users can insert soil data"
  ON public.soil_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own soil data"
  ON public.soil_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own data
CREATE POLICY "Users can delete their own soil data"
  ON public.soil_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.soil_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries by location
CREATE INDEX idx_soil_data_location ON public.soil_data(latitude, longitude);
CREATE INDEX idx_soil_data_user ON public.soil_data(user_id);
CREATE INDEX idx_soil_data_created ON public.soil_data(created_at DESC);