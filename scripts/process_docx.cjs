const fs = require('fs');
const path = require('path');

const docXmlPath = 'Docs/temp_extract/word/document.xml';
const relsXmlPath = 'Docs/temp_extract/word/_rels/document.xml.rels';
const mediaDir = 'Docs/temp_extract/word/media';
const outputDir = 'public/products';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

let docXml = fs.readFileSync(docXmlPath, 'utf8');
const relsXml = fs.readFileSync(relsXmlPath, 'utf8');

// Parse relations
const relations = {};
// Fix: Use [^>]*? to avoid consuming multiple tags if Target is not an image
const relMatches = relsXml.matchAll(/Relationship Id="(rId\d+)"[^>]*?Target="(media\/image\d+\.(png|jpg|jpeg|gif))"/g);
for (const match of relMatches) {
    relations[match[1]] = match[2];
}

// Extract Row Blobs
const rowMatches = docXml.matchAll(/<w:tr[\s\S]*?<\/w:tr>/g);
const products = [];

let lastProductName = '';
let lastProductDescription = '';

for (const match of rowMatches) {
    const rowContent = match[0];

    // STRIP ALL TAGS to get plain text
    let text = rowContent.replace(/<[^>]+>/g, ' ');
    // Clean up whitespace and entities
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    text = text.replace(/\s+/g, ' ').trim();

    // Extract image rId
    // Fix: Robust regex for potential namespaces or spacing
    const imgMatch = rowContent.match(/(?:embed|id)\s*=\s*["'](rId\d+)["']/);
    const rId = imgMatch ? imgMatch[1] : null;

    // Check if this row has meaningful text (product info)
    let name = '';
    let description = '';

    // Logic to identify valid product rows vs headers or empty
    if (text && !text.toLowerCase().includes('produto e descrição') && text.length > 5) {
        const descLower = text.toLowerCase();
        const descTerm = 'descrição';
        const descIdx = descLower.indexOf(descTerm);

        if (descIdx !== -1) {
            name = text.substring(0, descIdx).trim();
            const afterDesc = text.substring(descIdx + descTerm.length).trim();
            description = afterDesc.replace(/^[:]\s*/, '').trim();
        } else {
            // Only update if it looks like a product name (has numbers or specific keywords)
            if (/\d/.test(text) || text.toLowerCase().includes('extintor') ||
                text.toLowerCase().includes('mangueira') || text.toLowerCase().includes('válvula') ||
                text.toLowerCase().includes('suporte') || text.toLowerCase().includes('sifão')) {
                name = text;
            }
        }

        // Clean name if we got one
        if (name) {
            name = name.replace(/^\d+[\.\s]+/, '').trim();
            name = name.replace(/E\s+xtintor/gi, 'Extintor');
            name = name.replace(/P\s+ó/gi, 'Pó');
            name = name.replace(/C\s+O²/gi, 'CO²');

            if (name.length > 200) name = name.substring(0, 200);

            // Update last known product info
            // This handles merged cells where image is in a subsequent row without name
            lastProductName = name;
            lastProductDescription = description;
        }
    }

    // Process if we have an image and a valid product name (current or from previous row)
    if (rId && relations[rId]) {
        const productName = name || lastProductName;
        const productDesc = name ? description : lastProductDescription;

        if (productName) {
            const filename = productName.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') + '.png';

            products.push({
                name: productName,
                description: productDesc,
                rId,
                mediaPath: relations[rId],
                filename
            });
        }
    }
}

console.log(`Found ${products.length} products in docx.`);

let sql = '-- Migration: 007_add_complete_product_catalog.sql\n';
sql += '-- Catálogo sincronizado conforme documento DOCX\n\n';
sql += '-- Garantir unicidade para UPSERT\n';
sql += 'DELETE FROM public.products a USING public.products b WHERE a.id < b.id AND a.name = b.name;\n';
sql += 'CREATE UNIQUE INDEX IF NOT EXISTS products_name_key ON public.products (name);\n\n';
sql += 'INSERT INTO public.products (name, type, description, in_stock, price, image_url)\n';
sql += 'VALUES\n';

const values = [];
const seenNames = {};

for (const p of products) {
    let finalName = p.name;
    let finalFilename = p.filename;

    // Normalizar nome para comparação
    const normalizedName = p.name.toUpperCase().trim();

    // Contar ocorrências para gerar nomes únicos
    if (seenNames[normalizedName] === undefined) {
        seenNames[normalizedName] = 1;
    } else {
        seenNames[normalizedName]++;

        // Se já existe, adicionar sufixo para torná-lo único
        const count = seenNames[normalizedName];
        finalName = `${p.name} (${count})`;

        // Ajustar nome do arquivo também para evitar sobrescrever
        finalFilename = finalFilename.replace('.png', `-${count}.png`);
    }

    const src = path.join('Docs/temp_extract/word', p.mediaPath);
    const dest = path.join(outputDir, finalFilename);

    if (fs.existsSync(src)) {
        try {
            fs.copyFileSync(src, dest);

            // Determine type logic
            let type = 'Acessórios';
            const n = finalName.toLowerCase();
            if (n.includes('extintor')) type = 'Extintor';
            else if (n.includes('válvula') || n.includes('valvula')) type = 'Componentes';
            else if (n.includes('mangueira')) type = 'Mangueira';
            else if (n.includes('sifão') || n.includes('sifao')) type = 'Sifão';
            else if (n.includes('placa') || n.match(/^[spea]-\d+/i) || n.includes('sinalização')) type = 'Sinalização';
            else if (n.includes('tripé') || n.includes('suporte')) type = 'Suporte';
            else if (n.includes('luminária') || n.includes('balizamento') || n.includes('iluminação')) type = 'Iluminação';
            else if (n.includes('fita')) type = 'Fitas';
            else if (n.includes('pó') || n.includes('agente')) type = 'Agente Extintor';
            else if (n.includes('registro') || n.includes('esguicho') || n.includes('storz') || n.includes('uniao') || n.includes('adaptador')) type = 'Combate a Incêndio';
            else if (n.includes('alarme') || n.includes('detector') || n.includes('acionador')) type = 'Alarme';

            const escapedName = finalName.replace(/'/g, "''").toUpperCase();
            const escapedDesc = p.description.replace(/'/g, "''");
            const imageUrl = '/products/' + finalFilename;

            values.push(`('${escapedName}', '${type}', '${escapedDesc}', true, 0, '${imageUrl}')`);
        } catch (e) {
            console.error(`Failed to copy ${src} to ${dest}: ${e.message}`);
        }
    }
}

sql += values.join(',\n');
sql += '\nON CONFLICT (name) DO UPDATE SET \n';
sql += '  image_url = EXCLUDED.image_url,\n';
sql += '  description = EXCLUDED.description,\n';
sql += '  type = EXCLUDED.type;\n';

fs.writeFileSync('migrations/007_add_complete_product_catalog.sql', sql);
console.log(`Generated migration with ${values.length} products (UPSERT mode).`);
