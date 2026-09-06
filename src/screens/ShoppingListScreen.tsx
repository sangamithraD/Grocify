import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../context/ItemsContext';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ShoppingListScreen() {
  const { shoppingList, addShoppingItem, toggleShoppingItem, deleteShoppingItem, clearShoppingList, items } = useContext(ItemContext);
  const { colors } = useContext(ThemeContext);
  const [inputVal, setInputVal] = useState('');

  const handleAddItem = () => {
    if (inputVal.trim()) {
      addShoppingItem(inputVal.trim());
      setInputVal('');
    }
  };

  // Smart suggestions: items consumed or common staples not currently in the pantry
  const commonStaples = ['Milk', 'Eggs', 'Bread', 'Butter', 'Cheese', 'Tomatoes', 'Onions', 'Potatoes'];
  const suggestions = commonStaples.filter(staple => {
    const inPantry = items.some(item => item.productName.toLowerCase().includes(staple.toLowerCase()));
    const inShopping = shoppingList.some(item => item.name.toLowerCase().includes(staple.toLowerCase()));
    return !inPantry && !inShopping;
  });

  const renderShoppingItem = ({ item }: { item: any }) => (
    <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.checkWrapper} 
        onPress={() => toggleShoppingItem(item.id)}
      >
        <Ionicons 
          name={item.checked ? "checkbox" : "square-outline"} 
          size={22} 
          color={item.checked ? colors.primary : colors.textSecondary} 
        />
        <Text style={[
          styles.itemName, 
          { color: colors.text, fontSize: 15 },
          item.checked && { textDecorationLine: 'line-through', color: colors.textSecondary }
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteShoppingItem(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const checkedCount = shoppingList.filter(i => i.checked).length;
  const totalCount = shoppingList.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          
          {/* Page Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="cart-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.infoBannerText, { color: colors.textSecondary, fontSize: 12, flex: 1 }]}>
              Track items to buy, check off items as you shop, and tap low-stock suggestions to add staples instantly.
            </Text>
          </View>

          {/* Quick Input Bar */}
          <View style={[styles.inputContainer, { height: 50 }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text, fontSize: 15, height: 50 }]}
              placeholder="Add item to buy..."
              placeholderTextColor={colors.textSecondary}
              value={inputVal}
              onChangeText={setInputVal}
              onSubmitEditing={handleAddItem}
            />
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: colors.primary, height: 50, justifyContent: 'center', alignItems: 'center' }]}
              onPress={handleAddItem}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* List Section */}
          {shoppingList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 14 }]}>
                Your shopping list is empty.
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.headerRow}>
                <Text style={[styles.countHeader, { color: colors.textSecondary, fontSize: 12 }]}>
                  {checkedCount} / {totalCount} checked
                </Text>
                <TouchableOpacity onPress={clearShoppingList}>
                  <Text style={[styles.clearBtnText, { color: '#EF4444', fontSize: 12 }]}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={shoppingList}
                keyExtractor={(item) => item.id}
                renderItem={renderShoppingItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Smart Low Stock Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsHeader, { color: colors.textSecondary, fontSize: 11 }]}>
                Pantry Low Stock Suggestions
              </Text>
              <View style={styles.chipsWrapper}>
                {suggestions.slice(0, 4).map((staple) => (
                  <TouchableOpacity
                    key={staple}
                    style={[styles.suggestionChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                    onPress={() => addShoppingItem(staple)}
                  >
                    <Ionicons name="add-circle-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.chipText, { color: colors.primary, fontSize: 12 }]}>{staple}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoBannerText: {
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  deleteBtn: {
    padding: 6,
  },
  suggestionsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 10,
  },
  suggestionsHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
