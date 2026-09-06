export interface DisplayRecipe {
  id: string;
  title: string;
  itemName: string; // The item that triggered this recipe
  ingredientsUsed: string[];
  allIngredients: string[];
}

export const SMART_PANTRY_TIPS = [
  "Use items with the earliest expiry date first to reduce food waste (FIFO - First In, First Out).",
  "Freeze extra veggies, meats, or herbs to extend their lifespan.",
  "Store leafy greens wrapped in a paper towel to absorb excess moisture.",
  "Keep bananas, apples, and tomatoes separate from other fruits, as they release ethylene gas which speeds up ripening.",
  "If milk is nearing expiry, use it to cook porridge, bake, or freeze it in ice cube trays for coffee.",
  "Revive wilted celery or carrots by placing them in a jar of ice water for a few hours."
];

// Predefined recipes with trigger keywords to suggest before items expire
export const SUGGESTED_RECIPES = [
  {
    keywords: ["bread"],
    recipe: {
      id: "fb_vegetable_sandwich",
      title: "Vegetable Sandwich",
      allIngredients: ["Bread", "Tomato", "Onion", "Cheese", "Butter"],
    }
  },
  {
    keywords: ["banana"],
    recipe: {
      id: "fb_banana_smoothie",
      title: "Creamy Banana Smoothie",
      allIngredients: ["Banana", "Milk", "Honey", "Ice cubes"],
    }
  },
  {
    keywords: ["tomato"],
    recipe: {
      id: "fb_tomato_sauce",
      title: "Easy Garlic Tomato Sauce",
      allIngredients: ["Tomatoes", "Garlic", "Olive oil", "Oregano", "Basil"],
    }
  },
  {
    keywords: ["potato", "onion"],
    recipe: {
      id: "fb_potato_hash",
      title: "Crispy Potato & Onion Hash",
      allIngredients: ["Potatoes", "Onion", "Vegetable oil", "Paprika", "Salt"],
    }
  },
  {
    keywords: ["milk", "dairy"],
    recipe: {
      id: "fb_oatmeal",
      title: "Warm Honey Oatmeal",
      allIngredients: ["Milk", "Rolled oats", "Honey", "Salt"],
    }
  },
  {
    keywords: ["egg"],
    recipe: {
      id: "fb_scrambled_eggs",
      title: "Fluffy Scrambled Eggs",
      allIngredients: ["Eggs", "Milk", "Butter", "Herbs"],
    }
  },
  {
    keywords: ["rice"],
    recipe: {
      id: "fb_fried_rice",
      title: "Quick Pantry Fried Rice",
      allIngredients: ["Rice", "Veggies", "Soy sauce", "Oil"],
    }
  },
  {
    keywords: ["carrot"],
    recipe: {
      id: "fb_roasted_carrots",
      title: "Honey Glazed Roasted Carrots",
      allIngredients: ["Carrots", "Olive oil", "Honey", "Thyme"],
    }
  }
];

/**
 * Dynamically finds a matching recipe suggestion based on near-expiry items.
 */
export function getRecipeRecommendation(nearExpiryItems: { productName: string }[]): DisplayRecipe | null {
  if (nearExpiryItems.length === 0) return null;

  // Search for the first near-expiry item that matches a recipe keyword
  for (const item of nearExpiryItems) {
    const nameLower = item.productName.toLowerCase();
    
    // Find matching entry
    const match = SUGGESTED_RECIPES.find(entry => 
      entry.keywords.some(keyword => nameLower.includes(keyword))
    );

    if (match) {
      // Find what matching ingredients are in the user's near-expiry list (or overall items)
      return {
        id: match.recipe.id,
        title: match.recipe.title,
        itemName: item.productName,
        ingredientsUsed: match.recipe.allIngredients.filter(ing => 
          ing.toLowerCase() === nameLower || nameLower.includes(ing.toLowerCase())
        ),
        allIngredients: match.recipe.allIngredients,
      };
    }
  }

  // Fallback: If no custom keyword match, return a default dynamic recipe using the first near-expiry item
  const firstItem = nearExpiryItems[0].productName;
  return {
    id: "generic_recipe",
    title: `Sautéed ${firstItem}`,
    itemName: firstItem,
    ingredientsUsed: [firstItem],
    allIngredients: [firstItem, "Olive Oil", "Garlic", "Salt & Pepper"],
  };
}

/**
 * Returns a random smart pantry tip.
 */
export function getRandomPantryTip(): string {
  const index = Math.floor(Math.random() * SMART_PANTRY_TIPS.length);
  return SMART_PANTRY_TIPS[index];
}
