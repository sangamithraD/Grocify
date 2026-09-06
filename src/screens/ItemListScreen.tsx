import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext, Item } from '../context/ItemsContext';
import { ThemeContext } from '../context/ThemeContext';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';

import { getExpiryStatus } from '../utils/expiryUtils';

export default function MyItemsScreen() {
  const { items, deleteItem, markItemConsumed, markItemExpired, addShoppingItem, loading } = useContext(ItemContext);
  const { colors } = useContext(ThemeContext);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'fresh' | 'near' | 'expired'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'non-food'>('all');

  const getStatusInfo = (expiryDate: string) => {
    const status = getExpiryStatus(expiryDate);
    if (status === 'expired') {
      return { label: 'Expired', text: colors.danger, bg: colors.dangerBg, icon: 'close-circle-outline' };
    }
    if (status === 'near') {
      return { label: 'Near Expiry', text: colors.warning, bg: colors.warningBg, icon: 'alert-circle-outline' };
    }
    return { label: 'Fresh', text: colors.success, bg: colors.successBg, icon: 'checkmark-circle-outline' };
  };

  const handleConsume = (item: Item) => {
    Alert.alert(
      `Consume ${item.productName}?`,
      `Are you sure you want to mark ${item.productName} as consumed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Consume', 
          onPress: async () => {
            try {
              await markItemConsumed(item.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to mark consumed');
            }
          } 
        }
      ]
    );
  };

  const handleDelete = (item: Item) => {
    Alert.alert(
      `Delete ${item.productName}?`,
      `Are you sure you want to delete ${item.productName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              const status = getExpiryStatus(item.expiryDate);

              if (status === 'expired') {
                await markItemExpired(item.id);
              } else {
                await deleteItem(item.id);
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete');
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Item }) => {
    const status = getStatusInfo(item.expiryDate);
    const today = moment().startOf('day');
    const expiry = moment(item.expiryDate).startOf('day');
    const daysRemaining = expiry.diff(today, 'days');
    let expiryText = '';

    if (daysRemaining < 0) {
      expiryText = `Expired ${moment(item.expiryDate).fromNow()}`;
    } else if (daysRemaining === 0) {
      expiryText = 'Expires today';
    } else if (daysRemaining === 1) {
      expiryText = 'Expires tomorrow';
    } else {
      expiryText = `Expires in ${daysRemaining} days`;
    }

    const purchaseDisplay = item.purchaseDate ? `Purchased: ${item.purchaseDate}` : null;

    return (
      <View style={[styles.listItem, { borderBottomColor: colors.border }]}>
        <View style={styles.itemInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.productName, { color: colors.text, fontSize: 15 }]}>{item.productName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon as any} size={11} color={status.text} style={{ marginRight: 3 }} />
              <Text style={[styles.statusText, { color: status.text, fontSize: 10 }]}>{status.label}</Text>
            </View>
          </View>

          <Text style={[styles.quantityText, { color: colors.textSecondary, fontSize: 12, marginTop: 2 }]}>
            Quantity: {item.quantity} {item.quantity === 1 ? 'unit' : 'units'} {purchaseDisplay ? `| ${purchaseDisplay}` : ''}
          </Text>
          <Text style={[styles.expiryText, { color: status.text, fontSize: 12, marginTop: 2 }]}>{expiryText} ({item.expiryDate})</Text>
        </View>

        {/* Action icons (Tick to consume, Trash to discard) */}
        <View style={styles.actionsWrapper}>
          <TouchableOpacity 
            onPress={() => handleConsume(item)} 
            style={[styles.actionBtnIcon, { backgroundColor: colors.successBg }]}
            activeOpacity={0.6}
          >
            <Ionicons name="checkmark-done" size={18} color={colors.success} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleDelete(item)} 
            style={[styles.actionBtnIcon, { backgroundColor: colors.dangerBg }]}
            activeOpacity={0.6}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchText.toLowerCase());
    
    // Status filter
    const today = moment().startOf('day');
    const expiry = moment(item.expiryDate).startOf('day');
    const daysRemaining = expiry.diff(today, 'days');
    const isExpired = daysRemaining < 0;
    const isNear = daysRemaining >= 0 && daysRemaining <= 3;
    const isFresh = daysRemaining > 3;

    let matchesStatus = true;
    if (statusFilter === 'fresh') matchesStatus = isFresh;
    else if (statusFilter === 'near') matchesStatus = isNear;
    else if (statusFilter === 'expired') matchesStatus = isExpired;

    // Category filter
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      matchesCategory = item.category === categoryFilter;
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border, height: 50 }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search your pantry..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            style={[styles.searchInput, { color: colors.text, fontSize: 15 }]}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Expiry Status Filters */}
        <View style={styles.filterOuterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'fresh', label: 'Fresh' },
              { id: 'near', label: 'Near Expiry' },
              { id: 'expired', label: 'Expired' }
            ].map((filter) => (
              <TouchableOpacity 
                key={filter.id}
                style={[
                  styles.filterChip, 
                  { backgroundColor: colors.card, borderColor: colors.border },
                  statusFilter === filter.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setStatusFilter(filter.id as any)}
              >
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.textSecondary, fontSize: 12 },
                  statusFilter === filter.id && styles.filterChipTextActive
                ]}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Food / Non-Food Category Filters */}
        <View style={[styles.filterOuterContainer, { marginBottom: 20 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'food', label: 'Food Items' },
              { id: 'non-food', label: 'Non-Food' }
            ].map((filter) => (
              <TouchableOpacity 
                key={filter.id}
                style={[
                  styles.filterChip, 
                  { backgroundColor: colors.card, borderColor: colors.border },
                  categoryFilter === filter.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setCategoryFilter(filter.id as any)}
              >
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.textSecondary, fontSize: 12 },
                  categoryFilter === filter.id && styles.filterChipTextActive
                ]}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content list */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: 14 }]}>Loading pantry items...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="basket-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: 16 }]}>No items found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: 13 }]}>Add your first grocery item to start tracking expiry dates.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  filterOuterContainer: {
    marginBottom: 10,
    height: 38,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: 13,
    marginTop: 2,
  },
  expiryText: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionsWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  infoText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
