-- Migration: 004_update_product_image_urls.sql
-- Atualiza os campos `image_url` da tabela `products` para apontar
-- para as imagens PNG adicionadas em `public/products/`.

UPDATE public.products
SET image_url = '/products/extintor-abc.png'
WHERE LOWER(type) LIKE '%abc%'
	OR LOWER(name) LIKE '%abc%';

UPDATE public.products
SET image_url = '/products/extintor-bc.png'
-- Evita sobrescrever extintores ABC (pois 'abc' contém 'bc').
WHERE (LOWER(type) LIKE '%bc%' OR LOWER(name) LIKE '%bc%')
	AND LOWER(type) NOT LIKE '%abc%'
	AND LOWER(name) NOT LIKE '%abc%';

-- Extintor CO2
UPDATE public.products
SET image_url = '/products/extintor-co2.png'
WHERE LOWER(type) LIKE '%co2%'
	OR LOWER(type) LIKE '%co₂%'
	OR LOWER(name) LIKE '%co2%'
	OR LOWER(name) LIKE '%co₂%';

-- Água Pressurizada
UPDATE public.products
SET image_url = '/products/extintor-agua.png'
WHERE LOWER(type) LIKE '%água%' OR LOWER(type) LIKE '%agua%' OR LOWER(name) LIKE '%água%' OR LOWER(name) LIKE '%agua%';

-- Observação: execute este SQL no editor do Supabase caso queira atualizar imagens
-- existentes. Ajuste as cláusulas WHERE se seus produtos usarem nomes/tipos diferentes.
