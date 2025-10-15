-- Create products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  description text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read, admin write)
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial products
INSERT INTO public.products (name, type, price, in_stock) VALUES
  ('Extintor ABC 4kg', 'ABC - Pó Químico', 69.90, true),
  ('Extintor ABC 6kg', 'ABC - Pó Químico', 89.90, true),
  ('Extintor ABC 12kg', 'ABC - Pó Químico', 159.90, true),
  ('Extintor CO₂ 6kg', 'CO₂', 199.90, true),
  ('Extintor CO₂ 10kg', 'CO₂', 299.90, true),
  ('Extintor AB 10L', 'AB - Água Pressurizada', 149.90, true),
  ('Extintor AB 50L', 'AB - Água Pressurizada', 0, false),
  ('Extintor Pó Químico 20kg', 'ABC - Pó Químico', 0, false);