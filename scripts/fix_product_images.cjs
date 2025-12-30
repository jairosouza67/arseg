const fs = require('fs');
const path = require('path');

// Função para normalizar nomes
function normalizeName(name) {
  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/Ó/g, 'O')
    .replace(/Õ/g, 'O')
    .replace(/Ã/g, 'A')
    .replace(/Â/g, 'A')
    .replace(/Ê/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ç/g, 'C')
    .trim();
}

// Função para gerar nome de arquivo de imagem LIMPO
function generateCleanImageFileName(productName) {
  // Remove qualquer descrição que possa estar anexada
  let cleanName = productName.split('Descrição')[0].trim();
  
  return '/products/' + cleanName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ó/g, 'o')
    .replace(/õ/g, 'o')
    .replace(/ã/g, 'a')
    .replace(/â/g, 'a')
    .replace(/ê/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/²/g, '2')
    .replace(/°/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '.png';
}

// Ler o XML
const xmlPath = path.join(__dirname, '../Docs/temp_extract/word/document.xml');
const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

function extractText(xmlStr) {
  const textMatches = xmlStr.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  let text = '';
  for (const match of textMatches) {
    text += match[1];
  }
  return text.trim();
}

// Extrair produtos do DOCX
const rowMatches = xmlContent.matchAll(/<w:tr[^>]*>.*?<\/w:tr>/gs);
let docxProducts = [];

for (const rowMatch of rowMatches) {
  const row = rowMatch[0];
  const cells = row.matchAll(/<w:tc>.*?<\/w:tc>/gs);
  const cellContents = [];
  
  for (const cell of cells) {
    cellContents.push(extractText(cell[0]));
  }
  
  if (cellContents.length >= 1 && cellContents[0]) {
    const text = cellContents[0];
    const productMatch = text.match(/^(\d+)\.\s*(.+)/);
    if (productMatch) {
      const [, num, fullText] = productMatch;
      
      // Extrair APENAS o nome (primeira linha antes de "Descrição")
      let lines = fullText.split('\n');
      let productName = lines[0].trim();
      
      // Se tiver "Descrição:" na mesma linha, separar
      if (productName.includes('Descrição:')) {
        productName = productName.split('Descrição:')[0].trim();
      }
      
      // Extrair descrição
      let description = '';
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Descrição:')) {
          description = lines[i].replace('Descrição:', '').trim();
          break;
        }
      }
      
      docxProducts.push({
        number: num,
        name: productName,
        normalizedName: normalizeName(productName),
        description: description,
        imageUrl: generateCleanImageFileName(productName)
      });
    }
  }
}

console.log(`\n✅ Extraídos ${docxProducts.length} produtos do DOCX\n`);

// Ler migration 007
const migrationPath = path.join(__dirname, '../migrations/007_add_complete_product_catalog.sql');
const migrationContent = fs.readFileSync(migrationPath, 'utf-8');

// Extrair produtos da migration
const migrationProducts = [];
const insertMatches = migrationContent.matchAll(/\('([^']+)',\s*'([^']+)',\s*'([^']*)',\s*true,\s*0,\s*'([^']+)'\)/g);

for (const match of insertMatches) {
  migrationProducts.push({
    name: match[1],
    type: match[2],
    description: match[3],
    currentImageUrl: match[4]
  });
}

console.log(`📄 Produtos na migration 007: ${migrationProducts.length}\n`);

// Comparar e criar correção
let sqlCorrection = `-- Migration: 008_fix_product_images.sql\n`;
sqlCorrection += `-- Corrige URLs de imagens conforme catálogo DOCX\n`;
sqlCorrection += `-- Gerado automaticamente em ${new Date().toISOString()}\n\n`;

let correctionCount = 0;
const processedNames = new Set();

migrationProducts.forEach(migProd => {
  // Evitar duplicatas
  if (processedNames.has(migProd.name)) return;
  processedNames.add(migProd.name);
  
  // Encontrar produto correspondente no DOCX
  const docProd = docxProducts.find(dp => {
    const migNorm = normalizeName(migProd.name);
    const docNorm = normalizeName(dp.name);
    // Match parcial para produtos similares
    return migNorm === docNorm || 
           migNorm.includes(docNorm.substring(0, 15)) ||
           docNorm.includes(migNorm.substring(0, 15));
  });
  
  if (docProd && migProd.currentImageUrl !== docProd.imageUrl) {
    sqlCorrection += `-- ${docProd.name}\n`;
    sqlCorrection += `UPDATE public.products SET image_url = '${docProd.imageUrl}' WHERE name = '${migProd.name.replace(/'/g, "''")}';\n\n`;
    correctionCount++;
  }
});

console.log(`🔧 ${correctionCount} imagens precisam ser corrigidas\n`);

// Salvar migration 008
const outputPath = path.join(__dirname, '../migrations/008_fix_product_images.sql');
fs.writeFileSync(outputPath, sqlCorrection);
console.log(`✅ Migration 008 gerada: ${outputPath}\n`);

// Identificar produtos novos
console.log(`\n📦 PRODUTOS NOVOS (no DOCX mas não na migration):\n`);
const newProducts = [];

docxProducts.forEach(docProd => {
  const found = migrationProducts.find(mp => {
    const migNorm = normalizeName(mp.name);
    const docNorm = normalizeName(docProd.name);
    return migNorm === docNorm || 
           migNorm.includes(docNorm.substring(0, 20)) ||
           docNorm.includes(migNorm.substring(0, 20));
  });
  
  if (!found) {
    newProducts.push(docProd);
  }
});

if (newProducts.length > 0) {
  console.log(`Total: ${newProducts.length} produtos novos\n`);
  
  // Gerar SQL para produtos novos
  let newProductsSQL = `-- Novos produtos a adicionar\n`;
  newProductsSQL += `-- Total: ${newProducts.length} produtos\n\n`;
  newProductsSQL += `INSERT INTO public.products (name, type, description, in_stock, price, image_url) VALUES\n`;
  
  newProducts.forEach((prod, idx) => {
    const isLast = idx === newProducts.length - 1;
    // Determinar tipo baseado no nome
    let type = 'Produto';
    if (prod.name.includes('Extintor')) type = 'Extintor';
    else if (prod.name.includes('Mangueira')) type = 'Mangueira';
    else if (prod.name.includes('Válvula')) type = 'Componentes';
    else if (prod.name.includes('Suporte')) type = 'Suporte';
    
    newProductsSQL += `('${prod.name.replace(/'/g, "''")}', '${type}', '${prod.description.replace(/'/g, "''")}', true, 0, '${prod.imageUrl}')${isLast ? ';' : ','}\n`;
    
    console.log(`${prod.number}. ${prod.name}`);
    console.log(`   Tipo: ${type}`);
    console.log(`   Imagem: ${prod.imageUrl}`);
    console.log('');
  });
  
  // Salvar SQL de produtos novos
  const newProdPath = path.join(__dirname, '../migrations/009_add_new_products.sql');
  fs.writeFileSync(newProdPath, newProductsSQL);
  console.log(`\n✅ Migration 009 gerada com produtos novos: ${newProdPath}\n`);
} else {
  console.log('Nenhum produto novo encontrado.\n');
}

console.log('\n✨ Processamento concluído!\n');
console.log('Próximos passos:');
console.log('1. Revisar migrations/008_fix_product_images.sql');
console.log('2. Revisar migrations/009_add_new_products.sql (se existir)');
console.log('3. Executar as migrations no Supabase SQL Editor');
