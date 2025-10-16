-- Remover todos os produtos existentes
DELETE FROM products;

-- Inserir os novos produtos específicos

-- Po BC
INSERT INTO products (name, type, price, in_stock, description) VALUES
('Extintor Pó BC 4kg', 'Pó BC', 0, true, 'Extintor de Pó BC com capacidade de 4kg'),
('Extintor Pó BC 6kg', 'Pó BC', 0, true, 'Extintor de Pó BC com capacidade de 6kg'),
('Extintor Pó BC 8kg', 'Pó BC', 0, true, 'Extintor de Pó BC com capacidade de 8kg'),
('Extintor Pó BC 10kg', 'Pó BC', 0, true, 'Extintor de Pó BC com capacidade de 10kg');

-- Po ABC
INSERT INTO products (name, type, price, in_stock, description) VALUES
('Extintor Pó ABC 4kg', 'Pó ABC', 0, true, 'Extintor de Pó ABC com capacidade de 4kg'),
('Extintor Pó ABC 6kg', 'Pó ABC', 0, true, 'Extintor de Pó ABC com capacidade de 6kg'),
('Extintor Pó ABC 8kg', 'Pó ABC', 0, true, 'Extintor de Pó ABC com capacidade de 8kg'),
('Extintor Pó ABC 10kg', 'Pó ABC', 0, true, 'Extintor de Pó ABC com capacidade de 10kg');

-- Água
INSERT INTO products (name, type, price, in_stock, description) VALUES
('Extintor Água Pressurizada 10L', 'Água Pressurizada', 0, true, 'Extintor de Água Pressurizada com capacidade de 10 litros');

-- CO2
INSERT INTO products (name, type, price, in_stock, description) VALUES
('Extintor CO₂ 6kg', 'CO₂', 0, true, 'Extintor de CO₂ com capacidade de 6kg');