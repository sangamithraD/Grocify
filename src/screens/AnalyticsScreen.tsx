import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../context/ItemsContext';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

type FilterType = 'week' | 'month' | 'last_month' | 'last_3_months' | 'all';

export default function AnalyticsScreen() {
  const { historyList, fetchHistory, loading } = useContext(ItemContext);
  const { colors } = useContext(ThemeContext);
  const [timeFilter, setTimeFilter] = useState<FilterType>('month');

  useEffect(() => {
    fetchHistory();
  }, []);

  const startOfWeek = moment().startOf('week');
  const startOfMonth = moment().startOf('month');
  const startOfLastMonth = moment().subtract(1, 'month').startOf('month');
  const endOfLastMonth = moment().subtract(1, 'month').endOf('month');
  const startOfLast3Months = moment().subtract(3, 'months').startOf('day');

  const filterByPeriod = (item: any) => {
    let targetDateStr = item.createdAt;
    if (item.status === 'consumed') targetDateStr = item.consumedAt;
    else if (item.status === 'expired') targetDateStr = item.wastedAt;

    if (!targetDateStr) return false;
    const targetDate = moment(targetDateStr);

    if (timeFilter === 'week') return targetDate.isSameOrAfter(startOfWeek);
    if (timeFilter === 'month') return targetDate.isSameOrAfter(startOfMonth);
    if (timeFilter === 'last_month') return targetDate.isSameOrAfter(startOfLastMonth) && targetDate.isSameOrBefore(endOfLastMonth);
    if (timeFilter === 'last_3_months') return targetDate.isSameOrAfter(startOfLast3Months);
    return true;
  };

  const filteredHistory = historyList.filter(filterByPeriod);

  const totalAddedCount = filteredHistory.filter(i => {
    if (!i.createdAt) return false;
    const created = moment(i.createdAt);
    if (timeFilter === 'week') return created.isSameOrAfter(startOfWeek);
    if (timeFilter === 'month') return created.isSameOrAfter(startOfMonth);
    if (timeFilter === 'last_month') return created.isSameOrAfter(startOfLastMonth) && created.isSameOrBefore(endOfLastMonth);
    if (timeFilter === 'last_3_months') return created.isSameOrAfter(startOfLast3Months);
    return true;
  }).length;

  const usedItems = filteredHistory.filter(i => i.status === 'consumed');
  const usedCount = usedItems.length;

  const wastedItems = filteredHistory.filter(i => i.status === 'expired');
  const wastedCount = wastedItems.length;

  const savedItems = usedItems.filter(i => {
    if (!i.expiryDate || !i.consumedAt) return false;
    const expiry = moment(i.expiryDate).startOf('day');
    const consumed = moment(i.consumedAt).startOf('day');
    const diffDays = expiry.diff(consumed, 'days');
    return diffDays >= 0 && diffDays <= 3;
  });
  const savedCount = savedItems.length;

  const totalOutcomes = usedCount + wastedCount;
  const wastePreventionRate = totalOutcomes > 0 
    ? Math.round((usedCount / totalOutcomes) * 100) 
    : 100;

  let ratingText = 'Optimal';
  let ratingColor = colors.success;
  if (wastePreventionRate < 60) {
    ratingText = 'Needs Attention';
    ratingColor = colors.danger;
  } else if (wastePreventionRate < 85) {
    ratingText = 'Good Control';
    ratingColor = colors.warning;
  }

  const getProductCategory = (name: string): string => {
    const lower = name.toLowerCase();
    if (/spinach|lettuce|onion|tomato|potato|garlic|carrot|cucumber|pepper|broccoli|cabbage|veg/.test(lower)) return 'Vegetables';
    if (/milk|butter|cheese|yogurt|cream|dairy/.test(lower)) return 'Dairy';
    if (/bread|toast|croissant|bagel|bun|muffin|bakery/.test(lower)) return 'Bakery';
    if (/banana|apple|orange|strawberry|berry|grapes|lemon|avocado|lime|fruit/.test(lower)) return 'Fruits';
    if (/egg|chicken|beef|pork|fish|turkey|tofu|meat|protein/.test(lower)) return 'Proteins';
    return 'Staples';
  };

  const categoryWaste: { [key: string]: number } = {
    'Vegetables': 0,
    'Dairy': 0,
    'Bakery': 0,
    'Fruits': 0,
    'Proteins': 0,
    'Staples': 0
  };

  wastedItems.forEach(item => {
    const subCat = getProductCategory(item.productName);
    categoryWaste[subCat] += 1;
  });

  const sortedCategories = Object.keys(categoryWaste)
    .map(name => ({ name, count: categoryWaste[name] }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const milestones = [
    { key: 'first_save', title: 'First Pantry Save', desc: 'Used an item before expiration', icon: 'leaf-outline', unlocked: savedCount >= 1 },
    { key: 'waste_warrior', title: 'Pantry Efficiency', desc: 'Saved 10 items near expiry', icon: 'shield-checkmark-outline', unlocked: savedCount >= 10 },
    { key: 'eco_guardian', title: 'Zero Waste Guard', desc: 'Maintained 80%+ efficiency rate', icon: 'trophy-outline', unlocked: wastePreventionRate >= 80 && totalOutcomes >= 5 },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Title */}
        <Text style={[styles.pageTitle, { color: colors.text, fontSize: 20 }]}>Food Waste Report</Text>

        {/* Time Filters Chips Row */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'last_3_months', label: 'Last 3 Months' },
              { id: 'all', label: 'All Time' }
            ].map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  timeFilter === filter.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setTimeFilter(filter.id as FilterType)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  timeFilter === filter.id && { color: '#FFFFFF' }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 14 }}>Loading metrics...</Text>
          </View>
        ) : (
          <>
            {/* Efficiency Overview Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: colors.text, fontSize: 13 }]}>Pantry Efficiency Rate</Text>
                <Text style={[styles.ratingBadgeText, { color: ratingColor, fontSize: 13 }]}>{ratingText}</Text>
              </View>
              
              <Text style={[styles.largePercentage, { color: colors.primary, fontSize: 36 }]}>{wastePreventionRate}%</Text>
              
              <View style={[styles.progressBarOuter, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBarInner, { backgroundColor: colors.primary, width: `${wastePreventionRate}%` }]} />
              </View>
              <Text style={[styles.cardSubtext, { color: colors.textSecondary, fontSize: 12 }]}>
                {usedCount} items consumed, {wastedCount} expired in selected period.
              </Text>
            </View>

            {/* KPI Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="basket-outline" size={20} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.text, fontSize: 20 }]}>{totalAddedCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 11 }]}>Total Tracked</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                  <Text style={[styles.statNumber, { color: colors.text, fontSize: 20 }]}>{usedCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 11 }]}>Consumed</Text>
                </View>
              </View>

              <View style={[styles.statsRow, { marginTop: 10 }]}>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
                  <Text style={[styles.statNumber, { color: colors.text, fontSize: 20 }]}>{wastedCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 11 }]}>Expired</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="leaf-outline" size={20} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.text, fontSize: 20 }]}>{savedCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 11 }]}>Saved Near Expiry</Text>
                </View>
              </View>
            </View>

            {/* Category Breakdown (If any expired) */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 13 }]}>Expiration Breakdown by Category</Text>
              {sortedCategories.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 13 }]}>
                  No item expirations recorded for this time period.
                </Text>
              ) : (
                <View style={{ marginTop: 12 }}>
                  {sortedCategories.map((item, index) => {
                    const maxWasted = Math.max(...sortedCategories.map(c => c.count), 1);
                    return (
                      <View key={index} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{item.name}</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.count} expired</Text>
                        </View>
                        <View style={[styles.outcomeTrack, { backgroundColor: colors.border, height: 6 }]}>
                          <View style={[styles.outcomeBar, { backgroundColor: colors.danger, height: 6, width: `${(item.count / maxWasted) * 100}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Achievements */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 30 }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 13, marginBottom: 12 }]}>Efficiency Achievements</Text>
              {milestones.map((milestone) => (
                <View key={milestone.key} style={[styles.milestoneRow, !milestone.unlocked && { opacity: 0.4 }]}>
                  <View style={[
                    styles.iconBadge, 
                    { backgroundColor: milestone.unlocked ? colors.primaryLight : colors.border }
                  ]}>
                    <Ionicons 
                      name={milestone.icon as any} 
                      size={18} 
                      color={milestone.unlocked ? colors.primary : colors.textSecondary} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{milestone.title}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 1 }}>{milestone.desc}</Text>
                  </View>
                  {milestone.unlocked && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  pageTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
    height: 38,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingBadgeText: {
    fontWeight: '700',
  },
  largePercentage: {
    fontWeight: '800',
    marginVertical: 6,
  },
  progressBarOuter: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 3,
  },
  cardSubtext: {
    marginTop: 10,
  },
  statsGrid: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontWeight: '600',
    marginTop: 2,
  },
  outcomeTrack: {
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  outcomeBar: {
    borderRadius: 3,
  },
  emptyText: {
    marginTop: 10,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
