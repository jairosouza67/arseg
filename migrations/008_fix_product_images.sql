-- Corrige URLs de imagens de produtos baseados em seus nomes e tipos
-- Extintores ABC
UPDATE public.products 
SET image_url = '/products/extintor-abc.png' 
WHERE (name ILIKE '%ABC%' OR type ILIKE '%ABC%') 
AND (image_url IS NULL OR image_url = '');

-- Extintores BC
UPDATE public.products 
SET image_url = '/products/extintor-bc.png' 
WHERE (name ILIKE '%BC%' AND name NOT ILIKE '%ABC%') 
AND (image_url IS NULL OR image_url = '');

-- Extintores CO2
UPDATE public.products 
SET image_url = '/products/extintor-co2.png' 
WHERE (name ILIKE '%CO2%' OR name ILIKE '%CO²%' OR type ILIKE '%CO%' OR type ILIKE '%CO²%') 
AND (image_url IS NULL OR image_url = '');

-- Extintores de Água
UPDATE public.products 
SET image_url = '/products/extintor-agua.png' 
WHERE (name ILIKE '%água%' OR name ILIKE '%agua%' OR type ILIKE '%água%' OR type ILIKE '%agua%') 
AND (image_url IS NULL OR image_url = '');

-- Ajustes específicos para produtos conhecidos na migração 007
UPDATE public.products SET image_url = '/products/extintor-po-quimico-bc-8-kg.png' WHERE name = 'Extintor Pó Químico BC - 8 Kg';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-bc-6-kg.png' WHERE name = 'Extintor Pó Químico BC - 6 Kg';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-bc-50-kg.png' WHERE name = 'Extintor Pó Químico BC - 50 Kg';
UPDATE public.products SET image_url = '/products/extintor-co-bc-6-kg.png' WHERE name = 'Extintor CO² BC - 6 Kg';
UPDATE public.products SET image_url = '/products/extintor-agua-classe-a-10-l.png' WHERE name = 'Extintor Água Classe A - 10 L';
UPDATE public.products SET image_url = '/products/extintor-espuma-mecanica-ab-10-l.png' WHERE name = 'Extintor Espuma Mecânica AB - 10 L';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-abc-0-900-kg-fiat.png' WHERE name = 'Extintor Pó Químico ABC - 0,900 Kg (FIAT)';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-abc-2-kg-1a-10bc.png' WHERE name = 'Extintor Pó Químico ABC - 2 Kg (1A-10BC)';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-abc-2-kg-2a-20bc.png' WHERE name = 'Extintor Pó Químico ABC - 2 Kg (2A-20BC)';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-abc-4-kg.png' WHERE name = 'Extintor Pó Químico ABC - 4 Kg';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-abc-6-kg.png' WHERE name = 'Extintor Pó Químico ABC - 6 Kg';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-abc-12-kg.png' WHERE name = 'Extintor Pó Químico ABC - 12 Kg';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-abc-20-kg.png' WHERE name = 'Extintor Pó Químico ABC - 20 Kg';
UPDATE public.products SET image_url = '/products/extintor-po-quimico-abc-30-kg.png' WHERE name = 'Extintor Pó Químico ABC - 30 Kg';
UPDATE public.products SET image_url = '/products/po-quimico-bc-bicarbonato-de-sodio-95.png' WHERE name = 'Pó Químico BC - Bicarbonato de Sódio 95%';
UPDATE public.products SET image_url = '/products/valvula-m30-completa.png' WHERE name = 'Válvula M30 Completa';
UPDATE public.products SET image_url = '/products/pera-m30.png' WHERE name = 'Pera M30';
UPDATE public.products SET image_url = '/products/manometro-1-0-caixa-inox.png' WHERE name = 'Manômetro 1.0 - Caixa Inox';
UPDATE public.products SET image_url = '/products/mola-curta-altura-1-98-cm.png' WHERE name = 'Mola Curta (Altura 1,98 cm)';
UPDATE public.products SET image_url = '/products/valvula-m22.png' WHERE name = 'Válvula M22';
UPDATE public.products SET image_url = '/products/oring-grossa-26x4-mm-para-valvula-m30.png' WHERE name = 'Oring Grossa 26x4 mm para Válvula M30';
UPDATE public.products SET image_url = '/products/manometro-1-4-inox.png' WHERE name = 'Manômetro 1.4 Inox';
UPDATE public.products SET image_url = '/products/pino-completo-para-valvula-m30.png' WHERE name = 'Pino Completo para Válvula M30';
UPDATE public.products SET image_url = '/products/mola-longa-altura-4-3-cm.png' WHERE name = 'Mola Longa (Altura 4,3 cm)';
UPDATE public.products SET image_url = '/products/cordao-para-valvula-m30.png' WHERE name = 'Cordão para Válvula M30';
UPDATE public.products SET image_url = '/products/trava-para-valvula-m30.png' WHERE name = 'Trava para Válvula M30';
UPDATE public.products SET image_url = '/products/mangueira-para-extintor-p4-p6-p8-500-mm.png' WHERE name = 'Mangueira para Extintor P4/P6/P8 - 500 mm';
UPDATE public.products SET image_url = '/products/mangueira-para-extintor-p12-600-mm.png' WHERE name = 'Mangueira para Extintor P12 - 600 mm';
UPDATE public.products SET image_url = '/products/mangueira-para-extintor-ap10l-600-mm.png' WHERE name = 'Mangueira para Extintor AP10L - 600 mm';
UPDATE public.products SET image_url = '/products/sifao-plastico-para-extintor-p4-11-mm.png' WHERE name = 'Sifão Plástico para Extintor P4 - 11 mm';
UPDATE public.products SET image_url = '/products/sifao-plastico-para-extintor-p6-460-mm.png' WHERE name = 'Sifão Plástico para Extintor P6 - 460 mm';
UPDATE public.products SET image_url = '/products/sifao-plastico-para-extintor-p8-380-mm.png' WHERE name = 'Sifão Plástico para Extintor P8 - 380 mm';
UPDATE public.products SET image_url = '/products/sifao-plastico-para-extintor-p12-ap10l-535-mm.png' WHERE name = 'Sifão Plástico para Extintor P12/AP10L - 535 mm';
UPDATE public.products SET image_url = '/products/capa-para-extintores.png' WHERE name = 'Capa para Extintores';
UPDATE public.products SET image_url = '/products/mangueira-de-incendio-tipo-1-2-e-3.png' WHERE name = 'Mangueira de Incêndio - Tipo 1, 2 e 3';
UPDATE public.products SET image_url = '/products/conjunto-apag-para-co.png' WHERE name = 'Conjunto APAG para CO ²';
UPDATE public.products SET image_url = '/products/mangueira-co.png' WHERE name = 'Mangueira CO²';
UPDATE public.products SET image_url = '/products/difusor-para-co-completo.png' WHERE name = 'Difusor para CO ² Completo';
UPDATE public.products SET image_url = '/products/punho-para-co.png' WHERE name = 'Punho para CO ²';
UPDATE public.products SET image_url = '/products/quebra-jato-para-co.png' WHERE name = 'Quebra Jato para CO ²';
UPDATE public.products SET image_url = '/products/valvula-para-co-completa.png' WHERE name = 'Válvula para CO ² Completa';
UPDATE public.products SET image_url = '/products/sifao-para-extintor-co-4-kg.png' WHERE name = 'Sifão para Extintor CO² - 4 Kg';
UPDATE public.products SET image_url = '/products/sifao-para-extintor-co-6-kg.png' WHERE name = 'Sifão para Extintor CO² - 6 Kg';
UPDATE public.products SET image_url = '/products/sifao-para-extintor-co-10-kg.png' WHERE name = 'Sifão para Extintor CO² - 10 Kg';
UPDATE public.products SET image_url = '/products/valvula-abertura-lenta-co.png' WHERE name = 'Válvula Abertura Lenta CO²';
UPDATE public.products SET image_url = '/products/valvula-m30-completa-espuma-mecanica.png' WHERE name = 'Válvula M30 Completa ( Espuma Mecânica )';
UPDATE public.products SET image_url = '/products/manometro-1-0-caixa-inox-espuma-mecanica.png' WHERE name = 'Manômetro 1.0 - Caixa Inox ( Espuma Mecânica )';
UPDATE public.products SET image_url = '/products/mangueira-de-espuma-mecanica-600-mm-com-difusor.png' WHERE name = 'Mangueira de Espuma Mecânica 600 mm com Difusor';
UPDATE public.products SET image_url = '/products/liquido-gerador-de-espuma-lge-3.png' WHERE name = 'Líquido Gerador de Espuma - LGE 3%';
UPDATE public.products SET image_url = '/products/liquido-gerador-de-espuma-lge-6.png' WHERE name = 'Líquido Gerador de Espuma - LGE 6%';
UPDATE public.products SET image_url = '/products/liquido-gerador-de-espuma-lge-3-6.png' WHERE name = 'Líquido Gerador de Espuma - LGE 3%-6%';
UPDATE public.products SET image_url = '/products/manometro-1-0-caixa-inox-p2-abc.png' WHERE name = 'Manômetro 1.0 - Caixa Inox (P2 ABC)';
UPDATE public.products SET image_url = '/products/valvula-m-22-com-rosca-p2-abc.png' WHERE name = 'Válvula M-22 com Rosca (P2 ABC)';
UPDATE public.products SET image_url = '/products/mangueira-p2-abc.png' WHERE name = 'Mangueira P2 ABC';
UPDATE public.products SET image_url = '/products/valvula-m38-para-carreta-pqs-20-kg.png' WHERE name = 'Válvula M38 para Carreta - PQS 20 Kg';
UPDATE public.products SET image_url = '/products/valvula-m38-para-carreta-pqs-30-kg.png' WHERE name = 'Válvula M38 para Carreta - PQS 30 Kg';
UPDATE public.products SET image_url = '/products/valvula-m38-para-carreta-pqs-50-kg.png' WHERE name = 'Válvula M38 para Carreta - PQS 50 Kg';
UPDATE public.products SET image_url = '/products/mangueira-para-extintor-carreta-30-kg.png' WHERE name = 'Mangueira para Extintor Carreta 30 Kg';
UPDATE public.products SET image_url = '/products/mangueira-p20-3-metros.png' WHERE name = 'Mangueira P20 - 3 metros';
UPDATE public.products SET image_url = '/products/mangueira-para-extintor-carreta-50-kg.png' WHERE name = 'Mangueira para Extintor Carreta 50 Kg';
UPDATE public.products SET image_url = '/products/pistola-de-carreta-20-kg.png' WHERE name = 'Pistola de Carreta - 20 Kg';
UPDATE public.products SET image_url = '/products/adaptador-carreta-pqs-30-50-kg.png' WHERE name = 'Adaptador Carreta - PQS 30/50 Kg';
UPDATE public.products SET image_url = '/products/roda-plastica-pqs-20-kg.png' WHERE name = 'Roda Plástica PQS 20 Kg';
UPDATE public.products SET image_url = '/products/suporte-veicular-modelo-fiat.png' WHERE name = 'Suporte Veicular - Modelo FIAT';
UPDATE public.products SET image_url = '/products/suporte-veicular-modelo-universal.png' WHERE name = 'Suporte Veicular - Modelo Universal';
UPDATE public.products SET image_url = '/products/suporte-veicular-modelo-p2-abc.png' WHERE name = 'Suporte Veicular - Modelo P2 ABC';
UPDATE public.products SET image_url = '/products/suporte-veicular-modelo-p4-p6.png' WHERE name = 'Suporte Veicular - Modelo P4/P6';
UPDATE public.products SET image_url = '/products/suporte-veicular-modelo-p8-p12.png' WHERE name = 'Suporte Veicular - Modelo P8/P12';
UPDATE public.products SET image_url = '/products/suporte-parede.png' WHERE name = 'Suporte Parede';
UPDATE public.products SET image_url = '/products/suporte-tripe-desmontavel-p4-p6.png' WHERE name = 'Suporte Tripé Desmontável - P4/P6';
UPDATE public.products SET image_url = '/products/suporte-tripe-desmontavel-p8-p12-ap10.png' WHERE name = 'Suporte Tripé Desmontável - P8/P12/AP10';
UPDATE public.products SET image_url = '/products/suporte-tripe-p4-p6.png' WHERE name = 'Suporte Tripé - P4/P6';
UPDATE public.products SET image_url = '/products/suporte-tripe-p8-p12-ap10.png' WHERE name = 'Suporte Tripé - P8/P12/AP10';
UPDATE public.products SET image_url = '/products/suporte-tripe-com-haste-p4-p6.png' WHERE name = 'Suporte Tripé com Haste - P4/P6';
UPDATE public.products SET image_url = '/products/suporte-tripe-com-haste-p8-p12-ap10.png' WHERE name = 'Suporte Tripé com Haste - P8/P12/AP10';
UPDATE public.products SET image_url = '/products/suporte-solo-tripe-bicromatizado-p4-p6.png' WHERE name = 'Suporte Solo Tripé Bicromatizado - P4/P6';
UPDATE public.products SET image_url = '/products/suporte-solo-tripe-bicromatizado-p8-p12-ap10.png' WHERE name = 'Suporte Solo Tripé Bicromatizado - P8/P12/AP10';
UPDATE public.products SET image_url = '/products/suporte-solo-tripe-bicromatizado-co.png' WHERE name = 'Suporte Solo Tripé Bicromatizado - CO²';
UPDATE public.products SET image_url = '/products/suporte-solo-tripe-cromado-p4-p6.png' WHERE name = 'Suporte Solo Tripé Cromado - P4/P6';
UPDATE public.products SET image_url = '/products/suporte-solo-tripe-cromado-p8-p12-ap10.png' WHERE name = 'Suporte Solo Tripé Cromado - P8/P12/AP10';
UPDATE public.products SET image_url = '/products/suporte-solo-tripe-cromado-co.png' WHERE name = 'Suporte Solo Tripé Cromado - CO²';
UPDATE public.products SET image_url = '/products/suporte-de-solo-tripe-desmontavel-de-polietileno-p8-p12-ap-em.png' WHERE name = 'Suporte de Solo Tripé Desmontável de Polietileno - P8/P12/AP/EM';
UPDATE public.products SET image_url = '/products/suporte-de-solo-tripe-desmontavel-de-polietileno-co.png' WHERE name = 'Suporte de Solo Tripé Desmontável de Polietileno - CO²';
UPDATE public.products SET image_url = '/products/suporte-de-solo-batom-p4-p6.png' WHERE name = 'Suporte de Solo Batom - P4/P6';
UPDATE public.products SET image_url = '/products/suporte-de-solo-batom-p8-p12-ap-em.png' WHERE name = 'Suporte de Solo Batom - P8/P12/AP/EM';
UPDATE public.products SET image_url = '/products/suporte-de-solo-batom-co.png' WHERE name = 'Suporte de Solo Batom - CO²';
UPDATE public.products SET image_url = '/products/haste-para-suporte-tripe.png' WHERE name = 'Haste para Suporte Tripé';
UPDATE public.products SET image_url = '/products/adaptador-storz-2-1-2-x-1-1-2.png' WHERE name = 'Adaptador Storz 2.1/2" X 1.1/2"';
UPDATE public.products SET image_url = '/products/redutor-storz-2-1-2-x-1-1-2.png' WHERE name = 'Redutor Storz 2.1/2" X 1.1/2"';
UPDATE public.products SET image_url = '/products/uniao-storz-para-mangueira-de-incendio.png' WHERE name = 'União Storz para Mangueira de Incêndio';
UPDATE public.products SET image_url = '/products/registro-de-gaveta-bruto.png' WHERE name = 'Registro de Gaveta Bruto';
UPDATE public.products SET image_url = '/products/registro-globo-angular-pn16-220-lbs.png' WHERE name = 'Registro Globo Angular PN16 220 LBS';
UPDATE public.products SET image_url = '/products/esguicho-regulavel-em-latao-1-1-2.png' WHERE name = 'Esguicho Regulável em Latão 1.1/2"';
UPDATE public.products SET image_url = '/products/esguicho-regulavel-em-latao-2-1-2.png' WHERE name = 'Esguicho Regulável em Latão 2.1/2"';
UPDATE public.products SET image_url = '/products/tampao-storz-com-corrente.png' WHERE name = 'Tampão Storz com Corrente';
UPDATE public.products SET image_url = '/products/registro-globo-angular-pn10-120-lbs.png' WHERE name = 'Registro Globo Angular PN10 120 LBS';
UPDATE public.products SET image_url = '/products/chave-storz-dupla.png' WHERE name = 'Chave Storz Dupla';
UPDATE public.products SET image_url = '/products/manometro-glicerina.png' WHERE name = 'Manômetro Glicerina';
UPDATE public.products SET image_url = '/products/tampa-de-ferro-fundido-para-recalque-de-incendio.png' WHERE name = 'Tampa de Ferro Fundido para Recalque de Incêndio';
UPDATE public.products SET image_url = '/products/mangueira-de-incendio-tipo-1-1-1-2-15-metros.png' WHERE name = 'Mangueira de Incêndio Tipo 1 - 1.1/2" - 15 Metros';
UPDATE public.products SET image_url = '/products/mangueira-de-incendio-tipo-1-1-1-2-20-metros.png' WHERE name = 'Mangueira de Incêndio Tipo 1 - 1.1/2" - 20 Metros';
UPDATE public.products SET image_url = '/products/mangueira-de-incendio-tipo-2-1-1-2-15-metros.png' WHERE name = 'Mangueira de Incêndio Tipo 2 - 1.1/2" - 15 Metros';
UPDATE public.products SET image_url = '/products/mangueira-de-incendio-tipo-2-1-1-2-20-metros.png' WHERE name = 'Mangueira de Incêndio Tipo 2 - 1.1/2" - 20 Metros';
UPDATE public.products SET image_url = '/products/abrigo-para-hidrante-e-extintores.png' WHERE name = 'Abrigo para Hidrante e Extintores';
UPDATE public.products SET image_url = '/products/sinalizador-audiovisual.png' WHERE name = 'Sinalizador Audiovisual';
UPDATE public.products SET image_url = '/products/detector-de-temperatura.png' WHERE name = 'Detector de Temperatura';
UPDATE public.products SET image_url = '/products/central-de-alarme-12-setores-convencional.png' WHERE name = 'Central de Alarme - 12 Setores Convencional';
UPDATE public.products SET image_url = '/products/central-de-alarme-24-setores-convencional.png' WHERE name = 'Central de Alarme - 24 Setores Convencional';
UPDATE public.products SET image_url = '/products/central-de-alarme-enderecavel.png' WHERE name = 'Central de Alarme - Endereçável';
UPDATE public.products SET image_url = '/products/detector-de-fumaca.png' WHERE name = 'Detector de Fumaça';
UPDATE public.products SET image_url = '/products/acionador-de-bomba.png' WHERE name = 'Acionador de Bomba';
UPDATE public.products SET image_url = '/products/anel-de-cobre-para-empate-de-mangueira-de-incendio.png' WHERE name = 'Anel de Cobre para Empate de Mangueira de Incêndio';
UPDATE public.products SET image_url = '/products/porta-corta-fogo-p90-2100-x-890mm.png' WHERE name = 'Porta Corta-Fogo P90 2100 x 890mm';
UPDATE public.products SET image_url = '/products/porta-corta-fogo-p90-2100-x-1180mm.png' WHERE name = 'Porta Corta-Fogo P90 2100 x 1180mm';
UPDATE public.products SET image_url = '/products/luminaria-30-leds.png' WHERE name = 'Luminária 30 LEDs';
UPDATE public.products SET image_url = '/products/luminaria-bloco-farolete-2-200-lumens.png' WHERE name = 'Luminária Bloco Farolete 2.200 Lúmens';
UPDATE public.products SET image_url = '/products/luminaria-bloco-farolete-1-200-lumens.png' WHERE name = 'Luminária Bloco Farolete 1.200 Lúmens';
UPDATE public.products SET image_url = '/products/balizamento-de-saida-de-emergencia.png' WHERE name = 'Balizamento de Saída de Emergência';
UPDATE public.products SET image_url = '/products/fita-de-demarcacao-de-solo-amarela.png' WHERE name = 'Fita de Demarcação de Solo Amarela';
UPDATE public.products SET image_url = '/products/fita-de-demarcacao-de-solo-preta.png' WHERE name = 'Fita de Demarcação de Solo Preta';
UPDATE public.products SET image_url = '/products/fita-antiderrapante-preta.png' WHERE name = 'Fita Antiderrapante Preta';
UPDATE public.products SET image_url = '/products/fita-de-demarcacao-de-solo-vermelha.png' WHERE name = 'Fita de Demarcação de Solo Vermelha';
UPDATE public.products SET image_url = '/products/fita-antiderrapante-zebrada.png' WHERE name = 'Fita Antiderrapante Zebrada';
