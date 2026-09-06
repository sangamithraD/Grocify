import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { ItemContext } from '../context/ItemsContext';
import { ThemeContext } from '../context/ThemeContext';
import { getRecipeRecommendation, SMART_PANTRY_TIPS } from '../utils/recipeHelper';
import { getExpiryStatus } from '../utils/expiryUtils';

export default function HomeScreen({ navigation }: any) {
  const today = moment().format('dddd, MMMM Do YYYY');
  const { items, loading } = useContext(ItemContext);
  const { colors } = useContext(ThemeContext);

  const [pantryTipIndex, setPantryTipIndex] = useState<number | null>(null);

  useEffect(() => {
    // Generate a random tip index (0-5)
    const randomIndex = Math.floor(Math.random() * SMART_PANTRY_TIPS.length);
    setPantryTipIndex(randomIndex);
  }, []);

  const getStatus = getExpiryStatus;

  // 1. Compute dynamic stats
  const totalItems = items.length;
  
  const expiredCount = items.filter(item => getStatus(item.expiryDate) === 'expired').length;
  const nearExpiryCount = items.filter(item => getStatus(item.expiryDate) === 'near').length;
  const freshCount = items.filter(item => getStatus(item.expiryDate) === 'fresh').length;

  // 2. Fetch nearest-expiry list
  const alertsList = items
    .filter(item => item.category === 'food' && ['near', 'expired'].includes(getStatus(item.expiryDate)))
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  // 3. Recommended Recipe Recommendation based on near-expiry ingredients
  const suggestedRecipe = getRecipeRecommendation(alertsList);

  // 4. Pantry Health Score calculation
  let healthScore = 100;
  if (totalItems > 0) {
    const penalty = (nearExpiryCount * 10) + (expiredCount * 25);
    healthScore = Math.max(0, 100 - penalty);
  }

  let healthColor = colors.success;
  let healthText = 'Excellent';
  if (healthScore < 50) {
    healthColor = colors.danger;
    healthText = 'Attention Needed';
  } else if (healthScore < 80) {
    healthColor = colors.warning;
    healthText = 'Good';
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Simple Date & Tagline Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={[styles.dateText, { color: colors.textSecondary, fontSize: 13 }]}>{today}</Text>
          <Text style={[styles.taglineText, { color: colors.textSecondary, fontSize: 14 }]}>
            Let's keep your pantry fresh and waste-free.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary, fontSize: 14 }]}>Loading your smart pantry...</Text>
          </View>
        ) : (
          <>
            {/* Pantry Health Score Gauge */}
            <View style={[styles.healthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.healthHeader}>
                <Ionicons name="heart-half-outline" size={22} color={healthColor} style={{ marginRight: 6 }} />
                <Text style={[styles.healthTitle, { color: colors.text, fontSize: 13 }]}>Pantry Health Score</Text>
                <Text style={[styles.healthScoreValue, { color: healthColor, fontSize: 13 }]}>
                  {healthScore}/100 ({healthText})
                </Text>
              </View>
              <View style={[styles.progressBarOuter, { backgroundColor: colors.border, marginTop: 10 }]}>
                <View style={[styles.progressBarInner, { backgroundColor: healthColor, width: `${healthScore}%` }]} />
              </View>
            </View>

            {/* Statistics Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={[
                  styles.statCard, 
                  { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.primary }
                ]}>
                  <Ionicons name="basket-outline" size={24} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 26 }]}>{totalItems}</Text>
                  <Text style={[
                    styles.statLabel, 
                    { color: colors.textSecondary, fontSize: 11 }
                  ]}>Total Items</Text>
                </View>

                <View style={[
                  styles.statCard, 
                  { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.warning }
                ]}>
                  <Ionicons name="time-outline" size={24} color={colors.warning} />
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 26 }]}>{nearExpiryCount}</Text>
                  <Text style={[
                    styles.statLabel, 
                    { color: colors.textSecondary, fontSize: 11 }
                  ]}>Near Expiry</Text>
                </View>
              </View>

              <View style={[styles.statsRow, { marginTop: 12 }]}>
                <View style={[
                  styles.statCard, 
                  { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.danger }
                ]}>
                  <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 26 }]}>{expiredCount}</Text>
                  <Text style={[
                    styles.statLabel, 
                    { color: colors.textSecondary, fontSize: 11 }
                  ]}>Expired</Text>
                </View>

                <View style={[
                  styles.statCard, 
                  { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.success }
                ]}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 26 }]}>{freshCount}</Text>
                  <Text style={[
                    styles.statLabel, 
                    { color: colors.textSecondary, fontSize: 11 }
                  ]}>Fresh</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Add Groceries')}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={[styles.actionBtnText, { fontSize: 14 }]}>Add New Item</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
                onPress={() => navigation.navigate('Groceries')}
              >
                <Ionicons name="list-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary, fontSize: 14 }]}>View Pantry</Text>
              </TouchableOpacity>
            </View>

            {/* Expiry Alerts section (if any) */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="notifications-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 }]}>Pantry Expiry Alerts</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Groceries')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.sectionHeaderLink, { color: colors.primary, fontSize: 13, marginRight: 2 }]}>View All</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {alertsList.length === 0 ? (
                <View style={[styles.emptyStateCard, { backgroundColor: colors.successBg }]}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  <Text style={[styles.emptyStateText, { color: colors.success, fontSize: 14 }]}>
                    No items expiring soon. Good job!
                  </Text>
                </View>
              ) : (
                alertsList.map((item) => {
                  const status = getStatus(item.expiryDate);
                  const isExpired = status === 'expired';
                  const statusColor = isExpired ? colors.danger : colors.warning;
                  const diffDays = moment(item.expiryDate).diff(moment().startOf('day'), 'days');

                  return (
                    <View 
                      key={item.id} 
                      style={[
                        styles.alertCard, 
                        { 
                          backgroundColor: isExpired ? colors.dangerBg : colors.warningBg,
                          borderColor: colors.border
                        }
                      ]}
                    >
                      <Ionicons 
                        name={isExpired ? "alert-circle" : "warning-outline"} 
                        size={22} 
                        color={statusColor} 
                        style={{ marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.alertItemName, { color: colors.text, fontSize: 15 }]}>
                          {item.productName} ({item.quantity})
                        </Text>
                        <Text style={[styles.alertItemTime, { color: colors.textSecondary, fontSize: 12 }]}>
                          {isExpired 
                            ? `Expired ${moment(item.expiryDate).fromNow()}` 
                            : (diffDays === 1 ? '1 day left' : `${diffDays} days left`) + ` (${item.expiryDate})`}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* "Use It Before It Expires" Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16 }]}>Use It Before It Expires</Text>
              
              {!suggestedRecipe ? (
                <View style={[styles.emptyStateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="restaurant-outline" size={22} color={colors.textSecondary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary, marginLeft: 12, fontSize: 14 }]}>
                    Add items expiring soon to see recipe ideas here!
                  </Text>
                </View>
              ) : (
                <View style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.recipeHeaderRow}>
                    <View style={[styles.recipeBadge, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.recipeBadgeText, { color: colors.primary, fontSize: 11 }]}>Eco Recommended</Text>
                    </View>
                  </View>

                  <Text style={[styles.recipeTitle, { color: colors.text, fontSize: 18 }]}>
                    {suggestedRecipe.title}
                  </Text>
                  
                  <View style={styles.recipeMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: 12 }]}>10 mins</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="leaf-outline" size={16} color={colors.primary} />
                      <Text style={[styles.metaText, { color: colors.primary, fontWeight: '600', fontSize: 12 }]}>
                        Saves leftover {suggestedRecipe.itemName}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.recipeIngredientsLabel, { color: colors.text, fontSize: 14 }]}>Ingredients Needed:</Text>
                  <Text style={[styles.recipeIngredientsList, { color: colors.textSecondary, fontSize: 13 }]}>
                    {suggestedRecipe.allIngredients.join(', ')}
                  </Text>

                  <TouchableOpacity 
                    style={[styles.viewRecipeBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Recipes', { recipeId: suggestedRecipe.id, triggerItemName: suggestedRecipe.itemName })}
                  >
                    <Text style={[styles.viewRecipeBtnText, { fontSize: 14 }]}>View Recipe</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Tip of the Day */}
            {pantryTipIndex !== null ? (
              <View style={[styles.tipCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <View style={styles.tipHeader}>
                  <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                  <Text style={[styles.tipTitle, { color: colors.primary, fontSize: 14 }]}>Eco Saving Tip</Text>
                </View>
                <Text style={[styles.tipText, { color: colors.text, fontSize: 14 }]}>{SMART_PANTRY_TIPS[pantryTipIndex]}</Text>
              </View>
            ) : null}
            
            <View style={{ height: 30 }} />
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
  scrollContainer: { 
    padding: 20 
  },
  subtitleContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  taglineText: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  healthCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthScoreValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarOuter: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 3,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    marginRight: 0,
    marginLeft: 8,
    shadowOpacity: 0.02,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  sectionHeaderLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyStateCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  alertItemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  alertItemTime: {
    fontSize: 11,
    marginTop: 2,
  },
  recipeCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  recipeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recipeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    marginLeft: 6,
  },
  recipeIngredientsLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  recipeIngredientsList: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  viewRecipeBtn: {
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewRecipeBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 10,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
