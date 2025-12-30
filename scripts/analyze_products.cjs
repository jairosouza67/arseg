const fs = require('fs');
const path = require('path');

// Função para normalizar nomes de produtos
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

// Função para gerar nome de arquivo de imagem
function generateImageFileName(productName) {
  return '/products/' + productName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/ó/g, 'o')
    .replace(/õ/g, 'o')
    .replace(/ã/g, 'a')
    .replace(/â/g, 'a')
    .replace(/ê/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/²/g, '')
    .replace(/°/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '.png';
}

// Ler o arquivo XML extraído
const xmlPath = path.join(__dirname, '../Docs/temp_extract/word/document.xml');
const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

// Função para extrair texto de tags <w:t>
function extractText(xmlStr) {
  const textMatches = xmlStr.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  let text = '';
  for (const match of textMatches) {
    text += match[1];
  }
  return text.trim();
}

// Extrair produtos
const rowMatches = xmlContent.matchAll(/<w:tr[^>]*>.*?<\/w:tr>/gs);
let products = [];

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
      const lines = fullText.split('\n');
      const name = lines[0].trim();
      
      let description = '';
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].includes('Descrição:')) {
          description = lines[i].replace('Descrição:', '').trim();
          break;
        }
      }
      
      // Extrair rId da imagem
      const imageMatch = row.match(/r:embed="(rId\d+)"/);
      const imageId = imageMatch ? imageMatch[1] : null;
      
      products.push({
        number: num,
        name: name,
        normalizedName: normalizeName(name),
        description: description,
        imageId: imageId,
        generatedImageUrl: generateImageFileName(name)
      });
    }
  }
}

console.log('\n=== ANÁLISE DE PRODUTOS ===\n');
console.log(`Total de produtos encontrados: ${products.length}\n`);

// Ler migration atual
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
    imageUrl: match[4]
  });
}

console.log(`Produtos na migration 007: ${migrationProducts.length}\n`);

// Comparar e gerar correções
const corrections = [];

products.forEach(docProduct => {
  const migProduct = migrationProducts.find(mp => 
    normalizeName(mp.name).includes(normalizeName(docProduct.name).substring(0, 20))
  );
  
  if (migProduct) {
    if (migProduct.imageUrl !== docProduct.generatedImageUrl) {
      corrections.push({
        productName: migProduct.name,
        currentImage: migProduct.imageUrl,
        correctImage: docProduct.generatedImageUrl,
        docName: docProduct.name
      });
    }
  }
});

console.log(`\n=== CORREÇÕES NECESSÁRIAS (${corrections.length}) ===\n`);

if (corrections.length > 0) {
  corrections.forEach(c => {
    console.log(`Produto: ${c.productName}`);
    console.log(`  Nome no Doc: ${c.docName}`);
    console.log(`  Atual: ${c.currentImage}`);
    console.log(`  Correto: ${c.correctImage}`);
    console.log('');
  });
  
  // Gerar SQL de correção
  let sqlCorrection = `-- Migration: 008_fix_product_images.sql\n`;
  sqlCorrection += `-- Corrige URLs de imagens de produtos conforme catálogo DOCX\n\n`;
  
  corrections.forEach(c => {
    sqlCorrection += `UPDATE public.products SET image_url = '${c.correctImage}' WHERE name = '${c.productName.replace(/'/g, "''")}';\n`;
  });
  
  const outputPath = path.join(__dirname, '../migrations/008_fix_product_images.sql');
  fs.writeFileSync(outputPath, sqlCorrection);
  console.log(`\nArquivo de correção gerado: ${outputPath}`);
} else {
  console.log('Nenhuma correção necessária!');
}

// Mostrar produtos que estão no DOCX mas não na migration
console.log('\n=== PRODUTOS NOVOS (não estão na migration) ===\n');
const newProducts = products.filter(docProduct => {
  const found = migrationProducts.find(mp => 
    normalizeName(mp.name).includes(normalizeName(docProduct.name).substring(0, 15))
  );
  return !found;
});

if (newProducts.length > 0) {
  console.log(`Total: ${newProducts.length} produtos\n`);
  newProducts.slice(0, 20).forEach(p => {
    console.log(`${p.number}. ${p.name}`);
  });
  if (newProducts.length > 20) {
    console.log(`... e mais ${newProducts.length - 20} produtos`);
  }
}
