-- Allow anyone to create quotes (for public quote requests)
CREATE POLICY "Anyone can create quotes" 
ON public.quotes 
FOR INSERT 
WITH CHECK (true);

-- Update admin policy to also allow updates and deletes
DROP POLICY IF EXISTS "Admins can manage quotes" ON public.quotes;

CREATE POLICY "Admins can view all quotes" 
ON public.quotes 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update quotes" 
ON public.quotes 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete quotes" 
ON public.quotes 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));