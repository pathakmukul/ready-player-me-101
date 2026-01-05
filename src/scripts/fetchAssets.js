// Script to fetch all Ready Player Me assets
// Run with: node src/scripts/fetchAssets.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.REACT_APP_RPM_API_KEY;
const API_BASE = 'https://api.readyplayer.me/v1';

// Helper function to save partial results
function savePartialResults(assets, lastPage) {
  const partialData = {
    lastPage,
    fetchedAt: new Date().toISOString(),
    totalCount: assets.length,
    assets: {}
  };

  // Convert array to object keyed by ID
  assets.forEach(asset => {
    partialData.assets[asset.id] = asset;
  });

  const outputPath = path.join(__dirname, '../data/rpmAssets_partial.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(partialData, null, 2));
  console.log(`💾 Partial save: ${assets.length} assets saved (up to page ${lastPage})`);
}

async function fetchAllAssets() {
  if (!API_KEY) {
    console.error('❌ API key not found! Add REACT_APP_RPM_API_KEY to your .env file');
    return;
  }

  console.log('🔍 Fetching Ready Player Me assets...');

  const allAssets = [];
  let page = 1;
  let hasMore = true;
  let consecutiveErrors = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds

  // Check if we have a partial save from previous run
  const partialSavePath = path.join(__dirname, '../data/rpmAssets_partial.json');
  if (fs.existsSync(partialSavePath)) {
    console.log('📂 Found partial save from previous run, loading...');
    const partial = JSON.parse(fs.readFileSync(partialSavePath, 'utf8'));
    if (partial.assets && typeof partial.assets === 'object') {
      allAssets.push(...Object.values(partial.assets));
      page = partial.lastPage + 1;
      console.log(`✅ Loaded ${allAssets.length} assets, resuming from page ${page}`);
    }
  }

  try {
    while (hasMore && consecutiveErrors < MAX_RETRIES) {
      console.log(`📄 Fetching page ${page}...`);

      try {
        const response = await fetch(`${API_BASE}/assets?limit=100&page=${page}`, {
          headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 503) {
          consecutiveErrors++;
          console.log(`⚠️ Service unavailable (503). Retry ${consecutiveErrors}/${MAX_RETRIES}. Waiting ${RETRY_DELAY/1000}s...`);

          // Save partial results before retrying
          savePartialResults(allAssets, page - 1);

          if (consecutiveErrors < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          } else {
            console.log('❌ Max retries reached. Saving partial results...');
            break;
          }
        }

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        consecutiveErrors = 0; // Reset error counter on success

        if (data.data) {
          allAssets.push(...data.data);
          console.log(`✅ Found ${data.data.length} assets on page ${page}`);

          // Save partial results every 50 pages
          if (page % 50 === 0) {
            savePartialResults(allAssets, page);
          }
        }

        // Check if there are more pages
        hasMore = data.pagination?.hasNextPage || false;
        page++;

        // Add small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error on page ${page}:`, error.message);
        consecutiveErrors++;

        if (consecutiveErrors < MAX_RETRIES) {
          console.log(`⚠️ Retrying in ${RETRY_DELAY/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          console.log('❌ Max retries reached. Saving partial results...');
          break;
        }
      }
    }

    console.log(`\n📊 Total assets found: ${allAssets.length}`);

    // Organize assets by type
    const organizedAssets = {
      metadata: {
        totalCount: allAssets.length,
        fetchedAt: new Date().toISOString(),
        types: {}
      },
      assets: {},
      registry: {
        byName: {},
        byType: {},
        byGender: {}
      }
    };

    // Process and organize assets
    allAssets.forEach(asset => {
      // Store full asset data
      organizedAssets.assets[asset.id] = asset;

      // Create registry entries
      const normalizedName = asset.name?.toLowerCase() || '';
      organizedAssets.registry.byName[normalizedName] = asset.id;

      // Organize by type
      const type = asset.type || 'unknown';
      if (!organizedAssets.registry.byType[type]) {
        organizedAssets.registry.byType[type] = [];
      }
      organizedAssets.registry.byType[type].push({
        id: asset.id,
        name: asset.name,
        gender: asset.gender
      });

      // Count by type
      organizedAssets.metadata.types[type] = (organizedAssets.metadata.types[type] || 0) + 1;

      // Organize by gender
      if (asset.gender && Array.isArray(asset.gender)) {
        asset.gender.forEach(gender => {
          if (!organizedAssets.registry.byGender[gender]) {
            organizedAssets.registry.byGender[gender] = [];
          }
          organizedAssets.registry.byGender[gender].push({
            id: asset.id,
            name: asset.name,
            type: asset.type
          });
        });
      }
    });

    // Save to file
    const outputPath = path.join(__dirname, '../data/rpmAssets.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(organizedAssets, null, 2));
    console.log(`\n✅ Assets saved to: ${outputPath}`);

    // Print summary
    console.log('\n📈 Asset Summary:');
    Object.entries(organizedAssets.metadata.types).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} items`);
    });

    return organizedAssets;

  } catch (error) {
    console.error('❌ Error fetching assets:', error);
    return null;
  }
}

// Run the script
fetchAllAssets().then(result => {
  if (result) {
    console.log('\n🎉 Asset fetching complete!');
  }
});