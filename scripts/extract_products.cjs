const fs = require('fs');
const path = require('path');

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

// Extrair relações de imagens
const relsPath = path.join(__dirname, '../Docs/temp_extract/word/_rels/document.xml.rels');
if (fs.existsSync(relsPath)) {
  const relsContent = fs.readFileSync(relsPath, 'utf-8');
  const imageRels = {};
  const relMatches = relsContent.matchAll(/Relationship Id="(rId\d+)"[^>]*Target="([^"]+)"/g);
  for (const match of relMatches) {
    if (match[2].includes('media/image')) {
      imageRels[match[1]] = match[2];
    }
  }
  console.log('Image Relations:', JSON.stringify(imageRels, null, 2));
}

// Extrair produtos
const rowMatches = xmlContent.matchAll(/<w:tr[^>]*>.*?<\/w:tr>/gs);
let products = [];
let currentProduct = null;

for (const rowMatch of rowMatches) {
  const row = rowMatch[0];
  const cells = row.matchAll(/<w:tc>.*?<\/w:tc>/gs);
  const cellContents = [];
  
  for (const cell of cells) {
    cellContents.push(extractText(cell[0]));
  }
  
  if (cellContents.length >= 1 && cellContents[0]) {
    const text = cellContents[0];
    // Procurar por número no início (produto)
    const productMatch = text.match(/^(\d+)\.\s*(.+)/);
    if (productMatch) {
      const [, num, name] = productMatch;
      
      // Extrair rId da imagem
      const imageMatch = row.match(/r:embed="(rId\d+)"/);
      const imageId = imageMatch ? imageMatch[1] : null;
      
      products.push({
        number: num,
        name: name.split('\n')[0].trim(),
        description: text.includes('Descrição:') ? text.split('Descrição:')[1].trim() : '',
        imageId: imageId
      });
    }
  }
}

console.log('\n=== PRODUTOS EXTRAÍDOS ===\n');
products.forEach(p => {
  console.log(`${p.number}. ${p.name}`);
  console.log(`   Desc: ${p.description.substring(0, 80)}...`);
  console.log(`   Image: ${p.imageId}`);
  console.log('');
});

console.log(`\nTotal: ${products.length} produtos`);
