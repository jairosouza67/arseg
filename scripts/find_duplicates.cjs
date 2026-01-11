/**
 * Script to find duplicate products in the database
 * This will identify products with similar or identical names
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const equalIndex = line.indexOf('=');
    if (equalIndex > 0) {
      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });
  
  return env;
}

const env = loadEnv();
console.log('Environment variables loaded:', Object.keys(env));
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Normalize product name for comparison
 */
function normalizeName(name) {
  return name
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/²/g, '2')
    .replace(/CO2/g, 'CO²')
    .replace(/CO ²/g, 'CO²');
}

async function findDuplicates() {
  console.log('🔍 Searching for duplicate products...\n');

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`📦 Total products in database: ${products.length}\n`);

    // Group products by normalized name
    const nameGroups = {};
    
    products.forEach(product => {
      const normalized = normalizeName(product.name);
      if (!nameGroups[normalized]) {
        nameGroups[normalized] = [];
      }
      nameGroups[normalized].push(product);
    });

    // Find duplicates
    const duplicates = Object.entries(nameGroups)
      .filter(([_, group]) => group.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} groups of duplicate products:\n`);
    console.log('='.repeat(100));

    duplicates.forEach(([normalizedName, group], index) => {
      console.log(`\n📍 Duplicate Group ${index + 1} (${group.length} products):`);
      console.log(`   Normalized name: ${normalizedName}\n`);
      
      group.forEach((product, idx) => {
        console.log(`   ${idx + 1}. ID: ${product.id}`);
        console.log(`      Name: ${product.name}`);
        console.log(`      Type: ${product.type}`);
        console.log(`      Description: ${product.description || 'N/A'}`);
        console.log(`      Created: ${new Date(product.created_at).toLocaleString()}`);
        console.log('');
      });
      
      console.log('-'.repeat(100));
    });

    // Summary
    const totalDuplicates = duplicates.reduce((sum, [_, group]) => sum + group.length - 1, 0);
    console.log(`\n📊 Summary:`);
    console.log(`   Total duplicate groups: ${duplicates.length}`);
    console.log(`   Total duplicate records: ${totalDuplicates}`);
    console.log(`   Products to keep: ${duplicates.length}`);
    console.log(`   Products to remove: ${totalDuplicates}`);
    console.log(`   Database size after cleanup: ${products.length - totalDuplicates} products\n`);

    // Generate deletion SQL
    console.log('\n📝 SQL to remove duplicates (keeps oldest record in each group):\n');
    console.log('-- Remove duplicate products (keeps oldest record)');
    
    duplicates.forEach(([normalizedName, group]) => {
      // Sort by created_at to keep the oldest
      const sorted = [...group].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);
      
      toDelete.forEach(product => {
        console.log(`DELETE FROM products WHERE id = '${product.id}'; -- ${product.name}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findDuplicates();
