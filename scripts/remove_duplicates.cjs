/**
 * Script to remove duplicate products from the database
 * This keeps the oldest record in each duplicate group
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
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

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

async function removeDuplicates() {
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

    console.log(`⚠️  Found ${duplicates.length} groups of duplicate products\n`);

    // Collect IDs to delete
    const idsToDelete = [];
    const sqlStatements = [];

    duplicates.forEach(([normalizedName, group]) => {
      // Sort by created_at to keep the oldest
      const sorted = [...group].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);
      
      console.log(`📍 ${normalizedName}:`);
      console.log(`   Keeping: ${toKeep.name} (ID: ${toKeep.id}, Created: ${new Date(toKeep.created_at).toLocaleString()})`);
      
      toDelete.forEach(product => {
        console.log(`   Deleting: ${product.name} (ID: ${product.id}, Created: ${new Date(product.created_at).toLocaleString()})`);
        idsToDelete.push(product.id);
        sqlStatements.push(`DELETE FROM products WHERE id = '${product.id}'; -- ${product.name}`);
      });
      
      console.log('');
    });

    // Summary
    const totalDuplicates = idsToDelete.length;
    console.log(`\n📊 Summary:`);
    console.log(`   Total duplicate groups: ${duplicates.length}`);
    console.log(`   Total duplicate records to remove: ${totalDuplicates}`);
    console.log(`   Database size after cleanup: ${products.length - totalDuplicates} products\n`);

    // Generate migration SQL file
    const migrationContent = `-- Migration: 010_remove_duplicate_products.sql
-- Generated: ${new Date().toISOString()}
-- Removes ${totalDuplicates} duplicate products, keeping the oldest record in each group

${sqlStatements.join('\n')}
`;

    const migrationPath = path.join(__dirname, '..', 'migrations', '010_remove_duplicate_products.sql');
    fs.writeFileSync(migrationPath, migrationContent);
    console.log(`✅ Migration SQL saved to: ${migrationPath}\n`);

    // Ask for confirmation
    console.log('⚠️  WARNING: This will delete ${totalDuplicates} products from the database!\n');
    console.log('Do you want to proceed with the deletion? (yes/no)');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Type "yes" to confirm: ', async (answer) => {
      readline.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Deletion cancelled. The migration SQL file has been saved for manual execution.');
        return;
      }

      console.log('\n🗑️  Deleting duplicate products...\n');

      let deletedCount = 0;
      let errorCount = 0;

      for (const id of idsToDelete) {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`❌ Error deleting product ${id}:`, error);
          errorCount++;
        } else {
          deletedCount++;
          if (deletedCount % 10 === 0) {
            console.log(`   Deleted ${deletedCount}/${totalDuplicates} products...`);
          }
        }
      }

      console.log(`\n✅ Deletion complete!`);
      console.log(`   Successfully deleted: ${deletedCount} products`);
      if (errorCount > 0) {
        console.log(`   Errors: ${errorCount}`);
      }

      // Verify final count
      const { data: finalProducts } = await supabase
        .from('products')
        .select('id');

      console.log(`   Final product count: ${finalProducts?.length || 0}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeDuplicates();
