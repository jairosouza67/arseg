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
const relMatches = relsXml.matchAll(/Relationship Id="(rId\d+)" .*? Target="(media\/image\d+\.(png|jpg|jpeg|gif))"/g);
for (const match of relMatches) {
    relations[match[1]] = match[2];
}

// Extract Row Blobs
const rowMatches = docXml.matchAll(/<w:tr[\s\S]*?<\/w:tr>/g);
const products = [];

for (const match of rowMatches) {
    const rowContent = match[0];

    // STRIP ALL TAGS to get plain text
    let text = rowContent.replace(/<[^>]+>/g, ' ');
    // Clean up whitespace and entities
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    text = text.replace(/\s+/g, ' ').trim();

    // Extract image rId
    const imgMatch = rowContent.match(/r:embed="(rId\d+)"/);
    const rId = imgMatch ? imgMatch[1] : null;

    if (text && rId && relations[rId]) {
        if (text.toLowerCase().includes('produto e descrição')) continue;

        let name = '';
        let description = '';

        const descLower = text.toLowerCase();
        const descTerm = 'descrição';
        const descIdx = descLower.indexOf(descTerm);

        if (descIdx !== -1) {
            name = text.substring(0, descIdx).trim();
            // Find colon after "descrição"
            const afterDesc = text.substring(descIdx + descTerm.length).trim();
            description = afterDesc.replace(/^[:]\s*/, '').trim();
        } else {
            name = text;
        }

        // Clean name
        name = name.replace(/^\d+[\.\s]+/, '').trim();
        // Fix spaces inside words if they exist (sometimes Word breaks them)
        name = name.replace(/E\s+xtintor/gi, 'Extintor');
        name = name.replace(/P\s+ó/gi, 'Pó');
        name = name.replace(/C\s+O²/gi, 'CO²');

        if (name.length > 200) name = name.substring(0, 200);
        if (!name) name = `Produto-${rId}`;

        const filename = name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '.png';

        products.push({
            name,
            description,
            rId,
            mediaPath: relations[rId],
            filename
        });
    }
}

console.log(`Found ${products.length} products in docx.`);

let sql = '-- Migration: 007_add_complete_product_catalog.sql\n';
sql += '-- Catálogo atualizado conforme documento DOCX\n\n';
sql += 'INSERT INTO public.products (name, type, description, in_stock, price, image_url)\n';
sql += 'SELECT name, type, description, in_stock, price, image_url FROM (VALUES\n';

const values = [];
const seenNames = new Set();

for (const p of products) {
    if (seenNames.has(p.name)) continue;
    seenNames.add(p.name);

    const src = path.join('Docs/temp_extract/word', p.mediaPath);
    const dest = path.join(outputDir, p.filename);

    if (fs.existsSync(src)) {
        try {
            fs.copyFileSync(src, dest);

            // Determine type
            let type = 'Acessórios';
            const n = p.name.toLowerCase();
            if (n.includes('extintor')) type = 'Extintor';
            else if (n.includes('válvula')) type = 'Componentes';
            else if (n.includes('mangueira')) type = 'Mangueira';
            else if (n.includes('sifão')) type = 'Sifão';
            else if (n.includes('placa') || n.match(/^[spea]-\d+/i)) type = 'Sinalização';
            else if (n.includes('tripé') || n.includes('suporte')) type = 'Suporte';
            else if (n.includes('luminária') || n.includes('balizamento')) type = 'Iluminação';
            else if (n.includes('fita')) type = 'Fitas';
            else if (n.includes('pó')) type = 'Agente Extintor';
            else if (n.includes('registro') || n.includes('esguicho') || n.includes('storz')) type = 'Combate a Incêndio';

            const escapedName = p.name.replace(/'/g, "''");
            const escapedDesc = p.description.replace(/'/g, "''");
            const imageUrl = '/products/' + p.filename;

            values.push(`('${escapedName}', '${type}', '${escapedDesc}', true, 0, '${imageUrl}')`);
        } catch (e) {
            console.error(`Failed to copy ${src} to ${dest}: ${e.message}`);
        }
    }
}

sql += values.join(',\n');
sql += '\n) AS t (name, type, description, in_stock, price, image_url)\n';
sql += 'WHERE NOT EXISTS (\n';
sql += '    SELECT 1 FROM public.products p WHERE p.name = t.name\n';
sql += ');\n';

fs.writeFileSync('migrations/007_add_complete_product_catalog.sql', sql);
console.log(`Generated migration with ${values.length} unique products.`);
