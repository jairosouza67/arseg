-- Migration: 006_add_fire_extinguisher_products.sql
-- Adiciona novos produtos de extintores de incêndio ao catálogo

-- Extintores Veiculares Pó ABC
INSERT INTO public.products (name, type, description, in_stock, price, image_url) VALUES
('Extintor Veicular Pó ABC 1kg', 'Pó ABC', 'Extintor veicular portátil de pó químico ABC 1kg', true, 0, '/products/extintor-abc.png'),
('Extintor Veicular Pó ABC 2kg', 'Pó ABC', 'Extintor veicular portátil de pó químico ABC 2kg', true, 0, '/products/extintor-abc.png');

-- Extintores de Pó BC
INSERT INTO public.products (name, type, description, in_stock, price, image_url) VALUES
('Extintor de Pó BC 4kg', 'Pó BC', 'Extintor portátil de pó químico BC 4kg', true, 0, '/products/extintor-bc.png'),
('Extintor de Pó BC 6kg', 'Pó BC', 'Extintor portátil de pó químico BC 6kg', true, 0, '/products/extintor-bc.png'),
('Extintor de Pó BC 8kg', 'Pó BC', 'Extintor portátil de pó químico BC 8kg', true, 0, '/products/extintor-bc.png'),
('Extintor de Pó BC 10kg', 'Pó BC', 'Extintor portátil de pó químico BC 10kg', true, 0, '/products/extintor-bc.png'),
('Extintor de Pó BC 12kg', 'Pó BC', 'Extintor portátil de pó químico BC 12kg', true, 0, '/products/extintor-bc.png');

-- Extintores de Pó BC Carreta
INSERT INTO public.products (name, type, description, in_stock, price, image_url) VALUES
('Extintor de Pó BC Carreta 20kg', 'Pó BC', 'Extintor sobre rodas de pó químico BC 20kg', true, 0, '/products/extintor-bc.png'),
('Extintor de Pó BC Carreta 30kg', 'Pó BC', 'Extintor sobre rodas de pó químico BC 30kg', true, 0, '/products/extintor-bc.png'),
('Extintor de Pó BC Carreta 50kg', 'Pó BC', 'Extintor sobre rodas de pó químico BC 50kg', true, 0, '/products/extintor-bc.png');

-- Extintores de Pó ABC
INSERT INTO public.products (name, type, description, in_stock, price, image_url) VALUES
('Extintor de Pó ABC 4kg', 'Pó ABC', 'Extintor portátil de pó químico ABC 4kg', true, 0, '/products/extintor-abc.png'),
('Extintor de Pó ABC 6kg', 'Pó ABC', 'Extintor portátil de pó químico ABC 6kg', true, 0, '/products/extintor-abc.png'),
('Extintor de Pó ABC 8kg', 'Pó ABC', 'Extintor portátil de pó químico ABC 8kg', true, 0, '/products/extintor-abc.png'),
('Extintor de Pó ABC 10kg', 'Pó ABC', 'Extintor portátil de pó químico ABC 10kg', true, 0, '/products/extintor-abc.png'),
('Extintor de Pó ABC 12kg', 'Pó ABC', 'Extintor portátil de pó químico ABC 12kg', true, 0, '/products/extintor-abc.png');

-- Extintores de Pó ABC Carreta
INSERT INTO public.products (name, type, description, in_stock, price, image_url) VALUES
('Extintor de Pó ABC Carreta 20kg', 'Pó ABC', 'Extintor sobre rodas de pó químico ABC 20kg', true, 0, '/products/extintor-abc.png'),
('Extintor de Pó ABC Carreta 30kg', 'Pó ABC', 'Extintor sobre rodas de pó químico ABC 30kg', true, 0, '/products/extintor-abc.png'),
('Extintor de Pó ABC Carreta 50kg', 'Pó ABC', 'Extintor sobre rodas de pó químico ABC 50kg', true, 0, '/products/extintor-abc.png');

-- Extintores CO2
INSERT INTO public.products (name, type, description, in_stock, price, image_url) VALUES
('Extintor CO2 4kg', 'CO₂', 'Extintor portátil de dióxido de carbono 4kg', true, 0, '/products/extintor-co2.png'),
('Extintor CO2 6kg', 'CO₂', 'Extintor portátil de dióxido de carbono 6kg', true, 0, '/products/extintor-co2.png');

-- Extintores CO2 Carreta
INSERT INTO public.products (name, type, description, in_stock, price, image_url) VALUES
('Extintor CO2 Carreta 10kg', 'CO₂', 'Extintor sobre rodas de dióxido de carbono 10kg', true, 0, '/products/extintor-co2.png'),
('Extintor CO2 Carreta 20kg', 'CO₂', 'Extintor sobre rodas de dióxido de carbono 20kg', true, 0, '/products/extintor-co2.png'),
('Extintor CO2 Carreta 30kg', 'CO₂', 'Extintor sobre rodas de dióxido de carbono 30kg', true, 0, '/products/extintor-co2.png'),
('Extintor CO2 Carreta 40kg', 'CO₂', 'Extintor sobre rodas de dióxido de carbono 40kg', true, 0, '/products/extintor-co2.png'),
('Extintor CO2 Carreta 50kg', 'CO₂', 'Extintor sobre rodas de dióxido de carbono 50kg', true, 0, '/products/extintor-co2.png');

-- Observação: Execute este SQL no SQL Editor do Supabase para adicionar os produtos ao catálogo.
-- Os preços estão configurados como 0 (preço a combinar), conforme o padrão do sistema.
-- As imagens serão atribuídas automaticamente baseadas no tipo do produto.
