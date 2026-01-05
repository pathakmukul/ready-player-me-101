// Service to map natural language descriptions to Ready Player Me asset IDs
// Note: For demo purposes, using a subset of assets to avoid memory issues
// In production, this would query a database or API

interface AssetMatch {
  id: string;
  name: string;
  type: string;
  score: number;
  gender?: string[];
}

// Sample asset data structure - in production this would be loaded from API/DB
const SAMPLE_ASSETS = {
  // Outfits
  "outfit_leather_jacket_black": {
    id: "outfit_leather_jacket_black",
    name: "Black Leather Jacket",
    type: "outfit",
    gender: ["male", "female"],
    tags: ["jacket", "leather", "black", "casual", "cool"]
  },
  "outfit_blue_jeans": {
    id: "outfit_blue_jeans",
    name: "Blue Denim Jeans",
    type: "bottom",
    gender: ["male", "female"],
    tags: ["jeans", "denim", "blue", "casual", "pants"]
  },
  "outfit_white_tshirt": {
    id: "outfit_white_tshirt",
    name: "White T-Shirt",
    type: "top",
    gender: ["male", "female"],
    tags: ["shirt", "tshirt", "white", "casual", "basic"]
  },
  "outfit_hoodie_gray": {
    id: "outfit_hoodie_gray",
    name: "Gray Hoodie",
    type: "top",
    gender: ["male", "female"],
    tags: ["hoodie", "gray", "casual", "comfortable", "sweater"]
  },
  "outfit_business_suit": {
    id: "outfit_business_suit",
    name: "Business Suit",
    type: "outfit",
    gender: ["male", "female"],
    tags: ["suit", "business", "formal", "professional", "jacket"]
  },

  // Accessories
  "glasses_sunglasses_black": {
    id: "glasses_sunglasses_black",
    name: "Black Sunglasses",
    type: "glasses",
    gender: ["male", "female"],
    tags: ["sunglasses", "black", "cool", "glasses", "eyewear"]
  },
  "glasses_reading": {
    id: "glasses_reading",
    name: "Reading Glasses",
    type: "glasses",
    gender: ["male", "female"],
    tags: ["glasses", "reading", "eyewear", "clear"]
  },

  // Hair styles
  "hair_short_black": {
    id: "hair_short_black",
    name: "Short Black Hair",
    type: "hair",
    gender: ["male"],
    tags: ["hair", "short", "black", "neat"]
  },
  "hair_long_brown": {
    id: "hair_long_brown",
    name: "Long Brown Hair",
    type: "hair",
    gender: ["female"],
    tags: ["hair", "long", "brown", "flowing"]
  },
  "hair_beard_full": {
    id: "hair_beard_full",
    name: "Full Beard",
    type: "facialHair",
    gender: ["male"],
    tags: ["beard", "facial", "hair", "full", "masculine"]
  }
};

export class AssetMapper {
  private assets: typeof SAMPLE_ASSETS;

  constructor() {
    this.assets = SAMPLE_ASSETS;
  }

  /**
   * Parse a natural language description and return matching asset IDs
   * Example: "black leather jacket" -> returns jacket asset IDs
   */
  findAssets(description: string): AssetMatch[] {
    const searchTerms = this.extractSearchTerms(description);
    const matches: AssetMatch[] = [];

    // Search through all assets
    Object.entries(this.assets).forEach(([id, asset]) => {
      const score = this.calculateMatchScore(asset, searchTerms);
      if (score > 0) {
        matches.push({
          id,
          name: asset.name,
          type: asset.type,
          score,
          gender: asset.gender
        });
      }
    });

    // Sort by score (highest first)
    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * Extract search terms from natural language description
   */
  private extractSearchTerms(description: string): {
    colors: string[];
    materials: string[];
    types: string[];
    styles: string[];
    gender: string[];
    keywords: string[];
  } {
    const lowerDesc = description.toLowerCase();
    const words = lowerDesc.split(/\s+/);

    // Common color terms
    const colors = [
      'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'navy', 'beige', 'tan', 'gold', 'silver'
    ];

    // Common material terms
    const materials = [
      'leather', 'denim', 'cotton', 'silk', 'wool', 'polyester', 'velvet',
      'suede', 'canvas', 'nylon', 'satin', 'lace', 'metal', 'plastic'
    ];

    // Common clothing types
    const clothingTypes = [
      'jacket', 'coat', 'shirt', 'tshirt', 't-shirt', 'pants', 'jeans',
      'shorts', 'dress', 'skirt', 'suit', 'hoodie', 'sweater', 'vest',
      'blazer', 'hat', 'cap', 'glasses', 'sunglasses', 'shoes', 'boots',
      'sneakers', 'hair', 'beard', 'mustache', 'top', 'bottom', 'outfit'
    ];

    // Style descriptors
    const styles = [
      'casual', 'formal', 'business', 'sporty', 'athletic', 'vintage',
      'modern', 'classic', 'punk', 'gothic', 'hipster', 'preppy', 'street',
      'elegant', 'simple', 'fancy', 'retro', 'trendy'
    ];

    // Gender terms
    const genderTerms = [
      'male', 'female', 'man', 'woman', 'men', 'women', 'boy', 'girl',
      'masculine', 'feminine', 'unisex', 'neutral'
    ];

    return {
      colors: words.filter(w => colors.includes(w)),
      materials: words.filter(w => materials.includes(w)),
      types: words.filter(w => clothingTypes.includes(w)),
      styles: words.filter(w => styles.includes(w)),
      gender: words.filter(w => genderTerms.includes(w)),
      keywords: words
    };
  }

  /**
   * Calculate how well an asset matches the search terms
   */
  private calculateMatchScore(
    asset: typeof SAMPLE_ASSETS[keyof typeof SAMPLE_ASSETS],
    searchTerms: ReturnType<typeof this.extractSearchTerms>
  ): number {
    let score = 0;
    const assetName = asset.name?.toLowerCase() || '';
    const assetTags = asset.tags || [];

    // Check type matches (highest weight)
    searchTerms.types.forEach(type => {
      if (assetName.includes(type) || asset.type === type || assetTags.includes(type)) {
        score += 10;
      }
    });

    // Check color matches
    searchTerms.colors.forEach(color => {
      if (assetName.includes(color) || assetTags.includes(color)) {
        score += 5;
      }
    });

    // Check material matches
    searchTerms.materials.forEach(material => {
      if (assetName.includes(material) || assetTags.includes(material)) {
        score += 5;
      }
    });

    // Check style matches
    searchTerms.styles.forEach(style => {
      if (assetName.includes(style) || assetTags.includes(style)) {
        score += 3;
      }
    });

    // Check gender matches
    if (searchTerms.gender.length > 0 && asset.gender) {
      const genderMatch = searchTerms.gender.some(g => {
        const normalizedGender = g.replace(/s$/, ''); // Remove plural
        return asset.gender.some((ag: string) =>
          ag.toLowerCase().includes(normalizedGender)
        );
      });
      if (genderMatch) score += 2;
    }

    // General keyword matches (lowest weight)
    searchTerms.keywords.forEach(keyword => {
      if (keyword.length > 3) {
        if (assetName.includes(keyword) || assetTags.some(tag => tag.includes(keyword))) {
          score += 1;
        }
      }
    });

    return score;
  }

  /**
   * Get asset details by ID
   */
  getAssetById(id: string): typeof SAMPLE_ASSETS[keyof typeof SAMPLE_ASSETS] | undefined {
    return this.assets[id as keyof typeof SAMPLE_ASSETS];
  }

  /**
   * Build a complete avatar configuration from a text description
   * Example: "Indian man with black leather jacket and sunglasses"
   */
  buildAvatarConfig(description: string): {
    gender: string;
    assets: AssetMatch[];
    config: Record<string, string>;
  } {
    // Determine gender from description
    const genderMatch = description.match(/\b(man|male|boy|gentleman)\b/i) ? 'male' :
                       description.match(/\b(woman|female|girl|lady)\b/i) ? 'female' :
                       'neutral';

    // Find matching assets
    const assets = this.findAssets(description);

    // Build configuration object for Ready Player Me
    const config: Record<string, string> = {};

    // Group assets by type and pick the best match for each
    const assetsByType: Record<string, AssetMatch> = {};
    assets.forEach(asset => {
      if (!assetsByType[asset.type] || assetsByType[asset.type].score < asset.score) {
        assetsByType[asset.type] = asset;
      }
    });

    // Map to Ready Player Me configuration format
    Object.entries(assetsByType).forEach(([type, asset]) => {
      // Map type to Ready Player Me config key
      const configKey = this.mapTypeToConfigKey(type);
      if (configKey) {
        config[configKey] = asset.id;
      }
    });

    return {
      gender: genderMatch,
      assets: Object.values(assetsByType),
      config
    };
  }

  /**
   * Map asset type to Ready Player Me configuration key
   */
  private mapTypeToConfigKey(type: string): string | null {
    const typeMap: Record<string, string> = {
      'hair': 'hairStyle',
      'facialHair': 'facialHairStyle',
      'eyebrows': 'eyebrowStyle',
      'eyes': 'eyeColor',
      'outfit': 'outfit',
      'top': 'outfit',
      'bottom': 'outfit',
      'footwear': 'footwear',
      'glasses': 'glasses',
      'headwear': 'headwear',
      'facewear': 'facewear',
      'neckwear': 'neckwear',
      'earrings': 'earrings',
      'makeup': 'makeup'
    };

    return typeMap[type] || null;
  }
}