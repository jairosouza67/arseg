-- Migration: 005_fix_abc_bc_images.sql
-- Ajusta imagens de produtos ABC e BC garantindo que ABC não seja sobrescrito por BC.
-- Execute após 004_update_product_image_urls.sql caso tenha ocorrido sobreposição.

-- Corrige/força imagem dos produtos ABC
UPDATE public.products
SET image_url = '/products/extintor-abc.png'
WHERE LOWER(type) LIKE '%abc%' OR LOWER(name) LIKE '%abc%';

-- Corrige imagem dos produtos BC sem afetar ABC
UPDATE public.products
SET image_url = '/products/extintor-bc.png'
WHERE (LOWER(type) LIKE '%bc%' OR LOWER(name) LIKE '%bc%')
  AND LOWER(type) NOT LIKE '%abc%'
  AND LOWER(name) NOT LIKE '%abc%';

-- Observação: se existirem produtos genéricos "pó químico" sem ABC/BC
-- e você quiser usar a imagem ABC, adicione abaixo:
-- UPDATE public.products
-- SET image_url = '/products/extintor-abc.png'
-- WHERE (LOWER(type) LIKE '%pó químico%' OR LOWER(type) LIKE '%po quimico%' OR LOWER(name) LIKE '%pó químico%' OR LOWER(name) LIKE '%po quimico%')
--   AND image_url IS NULL;