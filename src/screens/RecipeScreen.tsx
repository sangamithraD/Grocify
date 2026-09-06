import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Linking, 
  ActivityIndicator, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../context/ItemsContext';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import storage from '../utils/storage';
import { getExpiryStatus } from '../utils/expiryUtils';

interface Recipe {
  id: string | number;
  title: string;
  image?: string;
  sourceUrl?: string;
  itemName: string; // triggered by this item
  ingredients?: string[];
  instructions?: string[];
  prepTime?: string;
  isFallback?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isYoutube?: boolean;
  channelName?: string;
  usedIngredients?: string[];
  missedIngredients?: string[];
}

// Fallback recipe database tagged with dietary attributes
const FALLBACK_RECIPES: Record<string, Omit<Recipe, 'itemName'>>[] = [
  {
    banana: {
      id: 'fb_banana_smoothie',
      title: 'Creamy Banana Smoothie',
      prepTime: '5 mins',
      ingredients: ['2 Ripe Bananas (sliced)', '1 cup Milk (or almond milk)', '1 tbsp Honey', '1/2 cup Ice cubes'],
      instructions: [
        'Place the sliced bananas, milk, honey, and ice cubes in a blender.',
        'Blend on high speed for 1-2 minutes until completely smooth.',
        'Pour and enjoy immediately!'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: false
    }
  },
  {
    tomato: {
      id: 'fb_tomato_sauce',
      title: 'Easy Garlic Tomato Sauce',
      prepTime: '20 mins',
      ingredients: ['4 Tomatoes (diced)', '3 Garlic cloves (minced)', '1 tbsp Olive oil', '1 tsp Dried oregano', 'Salt and black pepper to taste', 'Fresh basil'],
      instructions: [
        'Heat olive oil in a pan over medium heat.',
        'Add minced garlic and sauté for 1 minute until fragrant.',
        'Add diced tomatoes, oregano, salt, and pepper. Stir well.',
        'Reduce heat to low and simmer for 15 minutes until thick.',
        'Stir in fresh basil and serve.'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: true
    }
  },
  {
    potato: {
      id: 'fb_potato_hash',
      title: 'Crispy Potato & Onion Hash',
      prepTime: '25 mins',
      ingredients: ['2 Potatoes (diced)', '1 Onion (chopped)', '2 tbsp Vegetable oil', '1 tsp Paprika', 'Salt and pepper to taste'],
      instructions: [
        'Boil diced potatoes in salted water for 5 minutes, then drain.',
        'Heat vegetable oil in a skillet over medium-high heat.',
        'Add chopped onion and sauté for 3 minutes.',
        'Add potatoes in a single layer. Cook undisturbed for 4 minutes to get crispy.',
        'Stir, add paprika, salt, and pepper, and fry for another 5 minutes.'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: true
    }
  },
  {
    onion: {
      id: 'fb_potato_hash',
      title: 'Crispy Potato & Onion Hash',
      prepTime: '25 mins',
      ingredients: ['2 Potatoes (diced)', '1 Onion (chopped)', '2 tbsp Vegetable oil', '1 tsp Paprika', 'Salt and pepper to taste'],
      instructions: [
        'Boil diced potatoes in salted water for 5 minutes, then drain.',
        'Heat vegetable oil in a skillet over medium-high heat.',
        'Add chopped onion and sauté for 3 minutes.',
        'Add potatoes in a single layer. Cook undisturbed for 4 minutes to get crispy.',
        'Stir, add paprika, salt, and pepper, and fry for another 5 minutes.'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: true
    }
  },
  {
    bread: {
      id: 'fb_french_toast',
      title: 'Classic Custardy French Toast',
      prepTime: '15 mins',
      ingredients: ['4 slices of Bread', '2 Eggs', '1/4 cup Milk', '1 tsp Cinnamon', '1 tbsp Butter'],
      instructions: [
        'In a shallow bowl, whisk together the eggs, milk, and cinnamon.',
        'Melt butter in a skillet over medium heat.',
        'Dip each slice of bread into egg mixture for 10 seconds on each side.',
        'Place bread in the skillet and cook for 3 minutes per side until golden brown.'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: false
    }
  },
  {
    milk: {
      id: 'fb_oatmeal',
      title: 'Warm Honey Oatmeal',
      prepTime: '10 mins',
      ingredients: ['1/2 cup Rolled Oats', '1 cup Milk', '1 tbsp Honey', 'Pinch of salt'],
      instructions: [
        'Combine oats, milk, and a pinch of salt in a small saucepan.',
        'Bring to a gentle boil over medium heat.',
        'Reduce heat to low and simmer for 5 minutes, stirring frequently, until creamy.',
        'Pour into a bowl and drizzle with honey before serving.'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: false
    }
  },
  {
    egg: {
      id: 'fb_scrambled_eggs',
      title: 'Fluffy Scrambled Eggs',
      prepTime: '8 mins',
      ingredients: ['3 Eggs', '1 tbsp Milk', '1 tbsp Butter', 'Salt and pepper to taste', 'Fresh herbs (chives or parsley)'],
      instructions: [
        'Crack eggs into a bowl, add milk, salt, and pepper, and whisk vigorously.',
        'Melt butter in a non-stick frying pan over low heat.',
        'Pour in the egg mixture. Let sit for 20 seconds, then fold slowly.',
        'Remove from heat, stir in herbs, and serve.'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: false
    }
  },
  {
    rice: {
      id: 'fb_fried_rice',
      title: 'Quick Pantry Fried Rice',
      prepTime: '15 mins',
      ingredients: ['2 cups Cooked Rice (cold)', '1 cup Mixed Veggies (carrots, peas)', '1 Egg (optional)', '2 tbsp Soy sauce', '1 tbsp Vegetable oil'],
      instructions: [
        'Heat oil in a skillet over high heat.',
        'Add mixed vegetables and stir-fry for 3 minutes.',
        'Push veggies to the side. Scramble egg in the empty space if using.',
        'Add cold cooked rice, drizzle soy sauce, and stir-fry for 4 minutes.'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: false
    }
  },
  {
    carrot: {
      id: 'fb_roasted_carrots',
      title: 'Honey Glazed Roasted Carrots',
      prepTime: '30 mins',
      ingredients: ['4 Carrots (sliced)', '1 tbsp Olive oil', '1 tbsp Honey (or maple syrup)', 'Salt and pepper to taste'],
      instructions: [
        'Preheat oven to 200°C (400°F).',
        'Toss carrots with olive oil, honey, salt, and pepper.',
        'Spread on a baking sheet and roast for 20 minutes until tender.'
      ],
      isFallback: true,
      isVegetarian: true,
      isVegan: true
    }
  }
];

export default function RecipeScreen({ route }: any) {
  const { items, markItemConsumed } = useContext(ItemContext);
  const { colors } = useContext(ThemeContext);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const SPOONACULAR_API_KEY = '0dcc22ffc13f42439654c5ca1e1c509d';

  const handleMarkCooked = async (recipe: Recipe) => {
    try {
      const matchingItem = items.find(
        i => i.productName.toLowerCase() === recipe.itemName.toLowerCase()
      );

      if (matchingItem) {
        await markItemConsumed(matchingItem.id, true);
        Alert.alert(
          'Success!',
          `Great job! You saved ${matchingItem.productName} from waste by cooking this recipe!`
        );
      } else {
        Alert.alert(
          'Recipe Cooked',
          `Marked as cooked! Hope you enjoyed the zero-waste ${recipe.title}.`
        );
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark recipe as cooked');
    }
  };

  const openInAppWeb = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      console.error('Error opening in-app web browser:', err);
      Linking.openURL(url).catch(e => console.error(e));
    }
  };

  const handleRecipePress = async (recipe: Recipe) => {
    if (recipe.isYoutube) {
      if (recipe.sourceUrl) {
        openInAppWeb(recipe.sourceUrl);
      }
      return;
    }

    if (recipe.isFallback) {
      setSelectedRecipe(recipe);
      setModalVisible(true);
      return;
    }

    if (recipe.sourceUrl) {
      openInAppWeb(recipe.sourceUrl);
      return;
    }

    setLoading(true);
    try {
      const detailUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=false&apiKey=${SPOONACULAR_API_KEY}`;
      const res = await axios.get(detailUrl);
      if (res.data) {
        const detailedRecipe: Recipe = {
          ...recipe,
          prepTime: `${res.data.readyInMinutes} mins`,
          ingredients: res.data.extendedIngredients?.map((ing: any) => ing.original) || [],
          instructions: res.data.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) || [res.data.instructions || 'No instructions provided.'],
          sourceUrl: res.data.sourceUrl
        };
        
        if (detailedRecipe.sourceUrl) {
          openInAppWeb(detailedRecipe.sourceUrl);
        } else {
          setSelectedRecipe(detailedRecipe);
          setModalVisible(true);
        }
      }
    } catch (err) {
      console.warn('Could not fetch detailed recipe, showing preview:', err);
      const fallbackDetail: Recipe = {
        ...recipe,
        prepTime: '15 mins',
        ingredients: recipe.usedIngredients || [],
        instructions: ['Combine ingredients and cook according to preference.']
      };
      setSelectedRecipe(fallbackDetail);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = getExpiryStatus;

  const foodItems = items.filter(
    item => item.category === 'food' && ['near', 'expired'].includes(getStatus(item.expiryDate))
  );

  const nearExpiryNames = Array.from(new Set(foodItems.map(item => item.productName)));

  useEffect(() => {
    const fetchRecipes = async () => {
      if (foodItems.length === 0) {
        setRecipes([]);
        return;
      }

      setLoading(true);
      try {
        const dietVal = await storage.getItem('recipe_diet_pref') || 'all';
        const allRecipes: Recipe[] = [];
        
        for (const item of foodItems) {
          try {
            const params: any = {
              includeIngredients: item.productName,
              number: 2,
              instructionsRequired: true,
              apiKey: SPOONACULAR_API_KEY,
            };

            if (dietVal !== 'all') {
              params.diet = dietVal;
            }

            const response = await axios.get(
              `https://api.spoonacular.com/recipes/complexSearch`,
              {
                params,
                timeout: 4000
              }
            );

            if (response.data && response.data.results && response.data.results.length > 0) {
              const results = response.data.results.map((r: any) => ({
                id: r.id.toString(),
                title: r.title,
                image: r.image,
                sourceUrl: `https://spoonacular.com/recipes/${r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${r.id}`,
                itemName: item.productName,
                isFallback: false,
              }));
              allRecipes.push(...results);
            }
          } catch (apiErr: any) {
            console.warn(`Spoonacular API failed for ${item.productName}:`, apiErr.message);
          }
        }

        // Add Fallback offline database matches
        foodItems.forEach(item => {
          const name = item.productName.toLowerCase();
          
          FALLBACK_RECIPES.forEach(recipeMap => {
            const key = Object.keys(recipeMap)[0];
            if (name.includes(key)) {
              const baseRecipe = recipeMap[key];

              let isCompliant = true;
              if (dietVal === 'vegetarian') {
                isCompliant = !!baseRecipe.isVegetarian;
              } else if (dietVal === 'vegan') {
                isCompliant = !!baseRecipe.isVegan;
              }

              if (isCompliant && !allRecipes.some(r => r.id === baseRecipe.id)) {
                allRecipes.push({
                  ...baseRecipe,
                  itemName: item.productName,
                });
              }
            }
          });
        });

        // Add dynamic YouTube recipes
        foodItems.forEach(item => {
          const query1 = encodeURIComponent(`${item.productName} leftovers zero waste recipe`);
          allRecipes.push({
            id: `yt_${item.productName}_1`,
            title: `Leftover ${item.productName}: Zero-Waste Recipe Ideas`,
            sourceUrl: `https://www.youtube.com/results?search_query=${query1}`,
            itemName: item.productName,
            prepTime: '10 mins',
            isYoutube: true,
            channelName: 'Zero-Waste Cooking',
            ingredients: [item.productName, 'Kitchen staples'],
            instructions: ['Click to search and watch this zero-waste tutorial on YouTube!']
          });

          const query2 = encodeURIComponent(`quick and easy recipes for ${item.productName}`);
          allRecipes.push({
            id: `yt_${item.productName}_2`,
            title: `Quick and Easy Recipes for ${item.productName}`,
            sourceUrl: `https://www.youtube.com/results?search_query=${query2}`,
            itemName: item.productName,
            prepTime: '10 mins',
            isYoutube: true,
            channelName: 'Quick & Easy Eats',
            ingredients: [item.productName, 'Seasonings'],
            instructions: ['Click to search and watch quick meal ideas on YouTube!']
          });

          const query3 = encodeURIComponent(`creative ways to use up expiring ${item.productName}`);
          allRecipes.push({
            id: `yt_${item.productName}_3`,
            title: `How to Save and Use Expiring ${item.productName}`,
            sourceUrl: `https://www.youtube.com/results?search_query=${query3}`,
            itemName: item.productName,
            prepTime: '15 mins',
            isYoutube: true,
            channelName: 'Eco Kitchen Hacks',
            ingredients: [item.productName],
            instructions: ['Click to search and watch preservation and cooking hacks on YouTube!']
          });
        });

        // Ensure generic dynamic card exists for match popup if needed
        foodItems.forEach(item => {
          if (!allRecipes.some(r => r.itemName === item.productName && !r.isYoutube)) {
            allRecipes.push({
              id: `generic_recipe_${item.productName}`,
              title: `Sautéed ${item.productName}`,
              itemName: item.productName,
              prepTime: '10 mins',
              isFallback: true,
              ingredients: [item.productName, "Olive Oil", "Garlic", "Salt & Pepper"],
              instructions: [
                `Wash and cut ${item.productName} into bite-sized pieces.`,
                'Heat oil in a frying pan over medium heat.',
                'Sauté garlic for 1 minute.',
                `Add ${item.productName} and sauté until tender. Season and serve.`
              ]
            });
          }
        });

        setRecipes(allRecipes);
      } catch (err) {
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [items]);

  // Handle direct modal/link opening on route params update
  useEffect(() => {
    if (route?.params?.recipeId && recipes.length > 0) {
      const match = recipes.find(r => 
        r.id === route.params.recipeId || 
        (route.params.recipeId === 'generic_recipe' && r.id.toString().startsWith('generic_recipe_'))
      );
      if (match) {
        handleRecipePress(match);
      }
    }
  }, [route?.params?.recipeId, recipes]);

  const getUsedPantryIngredients = (recipeTitle: string, recipeIngredients: string[] = []) => {
    const matches: string[] = [];
    
    if (recipeIngredients && recipeIngredients.length > 0) {
      recipeIngredients.forEach(ing => {
        const ingLower = ing.toLowerCase();
        const found = items.find(item => ingLower.includes(item.productName.toLowerCase()) || item.productName.toLowerCase().includes(ingLower));
        if (found && !matches.includes(found.productName)) {
          matches.push(found.productName);
        }
      });
    }

    if (matches.length === 0) {
      const words = recipeTitle.toLowerCase().split(/\s+/);
      items.forEach(item => {
        const itemLower = item.productName.toLowerCase();
        if (words.some(word => word.length > 2 && (itemLower.includes(word) || word.includes(itemLower)))) {
          if (!matches.includes(item.productName)) {
            matches.push(item.productName);
          }
        }
      });
    }

    if (matches.length === 0) {
      const trigger = items.find(i => recipeTitle.toLowerCase().includes(i.productName.toLowerCase()) || i.productName.toLowerCase().includes(recipeTitle.toLowerCase()));
      if (trigger) {
        matches.push(trigger.productName);
      }
    }

    return matches;
  };

  const filteredRecipes = recipes.filter(rec => {
    const matchesItem = selectedItemFilter === 'all' || rec.itemName.toLowerCase() === selectedItemFilter.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      rec.title.toLowerCase().includes(query) || 
      rec.itemName.toLowerCase().includes(query) ||
      (rec.ingredients && rec.ingredients.some(ing => ing.toLowerCase().includes(query)));
    
    return matchesItem && matchesSearch;
  });

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    const usedIngredients = item.usedIngredients || [];
    
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => handleRecipePress(item)}
          activeOpacity={0.8}
        >
          {item.isYoutube ? (
            <View style={[styles.recipeImagePlaceholder, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="logo-youtube" size={30} color="#FF0000" />
            </View>
          ) : item.image ? (
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
          ) : (
            <View style={[styles.recipeImagePlaceholder, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="restaurant" size={24} color={colors.primary} />
            </View>
          )}

          <View style={styles.cardInfo}>
            <Text style={[styles.recipeTitle, { color: colors.text, fontSize: 15 }]} numberOfLines={2}>
              {item.title}
            </Text>

            {item.isYoutube ? (
              <Text style={[styles.channelName, { color: colors.textSecondary, fontSize: 12 }]}>
                Channel: {item.channelName}
              </Text>
            ) : (
              usedIngredients.length > 0 && (
                <View style={styles.usedIngredientsContainer}>
                  <Text style={[styles.usedIngredientsLabel, { color: colors.textSecondary, fontSize: 11 }]}>Uses your</Text>
                  <View style={styles.ingredientsRow}>
                    {usedIngredients.map((ing, idx) => (
                      <Text key={idx} style={[styles.usedIngredientItem, { color: colors.success, fontSize: 11 }]}>
                        ✓ {ing}
                      </Text>
                    ))}
                  </View>
                </View>
              )
            )}

            <View style={styles.cardFooter}>
              <View style={styles.footerDetail}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.footerDetailText, { color: colors.textSecondary, fontSize: 12 }]}>
                  {item.prepTime || '15 mins'}
                </Text>
              </View>
              
              <Text style={[styles.actionLink, { color: colors.primary, fontSize: 13 }]}>
                {item.isYoutube ? 'Watch Tutorial' : item.isFallback ? 'View Recipe' : 'Open Web Recipe'} →
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.cardCookedBtn, { backgroundColor: colors.success }]}
          onPress={() => handleMarkCooked(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.cardCookedBtnText}>I Cooked This Recipe</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.subheading, { color: colors.textSecondary, fontSize: 13 }]}>
          Based on ingredients in your pantry that are expiring soon.
        </Text>

        <View style={styles.filterSectionContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, height: 44 }]}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search recipes or ingredients..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.text, fontSize: 14 }]}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border, height: 44 }]}
            onPress={() => setDropdownVisible(true)}
          >
            <Ionicons name="filter-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.dropdownText, { color: colors.text, fontSize: 13, flex: 1 }]} numberOfLines={1}>
              {selectedItemFilter === 'all' ? 'All Expiring Items' : `Item: ${selectedItemFilter}`}
            </Text>
            <Ionicons name="chevron-down-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity 
            style={styles.dropdownModalOverlay} 
            activeOpacity={1} 
            onPress={() => setDropdownVisible(false)}
          >
            <View style={[styles.dropdownModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.dropdownModalTitle, { color: colors.text, fontSize: 15 }]}>Filter Recipes by Item</Text>
              
              <TouchableOpacity
                style={[
                  styles.dropdownOption,
                  selectedItemFilter === 'all' && { backgroundColor: colors.primaryLight }
                ]}
                onPress={() => {
                  setSelectedItemFilter('all');
                  setDropdownVisible(false);
                }}
              >
                <Text style={[styles.dropdownOptionText, { color: selectedItemFilter === 'all' ? colors.primary : colors.text, fontSize: 14 }]}>
                  All Expiring Items
                </Text>
                {selectedItemFilter === 'all' && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>

              {nearExpiryNames.map(name => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.dropdownOption,
                    selectedItemFilter === name && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => {
                    setSelectedItemFilter(name);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownOptionText, { color: selectedItemFilter === name ? colors.primary : colors.text, fontSize: 14 }]}>
                    {name}
                  </Text>
                  {selectedItemFilter === name && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {foodItems.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="heart-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.noAlertsTitle, { color: colors.text, fontSize: 16 }]}>Your Pantry is Safe</Text>
            <Text style={[styles.noAlertsSubtitle, { color: colors.textSecondary, fontSize: 13 }]}>
              No items expiring soon. Good job!
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: 14 }]}>Analyzing ingredients and loading recipes...</Text>
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.noAlertsTitle, { color: colors.text, fontSize: 16 }]}>No recipes matching filter</Text>
            <Text style={[styles.noAlertsSubtitle, { color: colors.textSecondary, fontSize: 13 }]}>
              Try clearing your selected ingredient filter to view all recommendations.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRecipeItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Fallback & YouTube Instruction Modal */}
        {selectedRecipe && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                
                {/* Header */}
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.modalTitle, { color: colors.text, fontSize: 16 }]}>
                    {selectedRecipe.title}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeBtn, { backgroundColor: colors.border }]}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                  
                  {/* Meta stats */}
                  <View style={styles.metaRow}>
                    <View style={[styles.metaItem, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name={selectedRecipe.isYoutube ? "logo-youtube" : "time-outline"} size={18} color={selectedRecipe.isYoutube ? "#FF0000" : colors.primary} />
                      <Text style={[styles.metaLabel, { color: selectedRecipe.isYoutube ? "#FF0000" : colors.primary, fontSize: 12 }]}>
                        {selectedRecipe.isYoutube ? 'Video Tutorial' : `Prep Time: ${selectedRecipe.prepTime || '15 mins'}`}
                      </Text>
                    </View>
                    <View style={[styles.metaItem, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="leaf-outline" size={18} color={colors.primary} />
                      <Text style={[styles.metaLabel, { color: colors.primary, fontSize: 12 }]}>Zero Waste!</Text>
                    </View>
                  </View>

                  <Text style={[styles.ingredientSource, { color: colors.textSecondary, fontSize: 13 }]}>
                    Uses near-expiry item: <Text style={{fontWeight: 'bold', color: colors.primary, fontSize: 13}}>{selectedRecipe.itemName}</Text>
                  </Text>

                  {/* Ingredients */}
                  <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 15 }]}>Ingredients Needed</Text>
                  {selectedRecipe.ingredients?.map((ing, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={[styles.bulletDot, { color: colors.primary }]}>•</Text>
                      <Text style={[styles.bulletText, { color: colors.text, fontSize: 13 }]}>{ing}</Text>
                    </View>
                  ))}

                  {/* Instructions */}
                  <Text style={[styles.sectionHeading, { marginTop: 20, color: colors.text, fontSize: 15 }]}>
                    {selectedRecipe.isYoutube ? 'Video Tutorial' : 'Steps to Prepare'}
                  </Text>
                  {selectedRecipe.isYoutube ? (
                    <View style={{ paddingVertical: 10 }}>
                      <Text style={[styles.stepText, { color: colors.text, marginBottom: 16, fontSize: 13 }]}>
                        Watch this zero-waste video recipe directly on YouTube.
                      </Text>
                      <TouchableOpacity 
                        style={[styles.ytPlayBtn, { backgroundColor: '#FF0000' }]}
                        onPress={() => {
                          setModalVisible(false);
                          if (selectedRecipe.sourceUrl) {
                            Linking.openURL(selectedRecipe.sourceUrl).catch(err => console.error(err));
                          }
                        }}
                      >
                        <Ionicons name="logo-youtube" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={[styles.ytPlayBtnText, { fontSize: 14 }]}>Watch on YouTube</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    selectedRecipe.instructions?.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.stepNumberText}>{i + 1}</Text>
                        </View>
                        <Text style={[styles.stepText, { color: colors.text, fontSize: 13 }]}>{step}</Text>
                      </View>
                    ))
                  )}

                  {/* Cooked Button */}
                  <TouchableOpacity 
                    style={{ backgroundColor: colors.success, marginTop: 24, height: 48, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => handleMarkCooked(selectedRecipe)}
                  >
                    <Ionicons name="restaurant-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>I Cooked This Recipe!</Text>
                  </TouchableOpacity>

                  <View style={{ height: 40 }} />
                </ScrollView>

              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
  },
  container: { 
    flex: 1, 
    padding: 20 
  },
  subheading: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  filterOuterContainer: {
    marginBottom: 16,
    height: 40,
  },
  itemFilterScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  itemFilterCard: {
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemFilterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  recipeImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
    marginRight: 12,
  },
  recipeImagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  recipeTitle: { 
    fontSize: 15, 
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  usedIngredientsContainer: {
    marginBottom: 8,
  },
  usedIngredientsLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  usedIngredientItem: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDetailText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  actionLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  infoText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  noAlertsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  noAlertsSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
  },
  modalScroll: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  ingredientSource: {
    fontSize: 13,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  bulletDot: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  ytPlayBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ytPlayBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  cardCookedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
    marginTop: 12,
  },
  cardCookedBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterSectionContainer: {
    marginVertical: 12,
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontWeight: '600',
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModalCard: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  dropdownModalTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownOptionText: {
    fontWeight: '600',
  },
});
