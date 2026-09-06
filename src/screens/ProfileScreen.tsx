import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ItemContext } from '../context/ItemsContext';
import { ThemeContext } from '../context/ThemeContext';
import moment from 'moment';

import { getExpiryStatus } from '../utils/expiryUtils';

export default function ProfileScreen() {
  const { logout, user } = useContext(AuthContext);
  const { items } = useContext(ItemContext);
  const { colors } = useContext(ThemeContext);

  const email = user?.email || 'pantry@grocify.com';
  const username = email.split('@')[0];

  const getStatus = getExpiryStatus;

  const totalTracked = items.length;
  const freshCount = items.filter(item => getStatus(item.expiryDate) === 'fresh').length;
  const expiredCount = items.filter(item => getStatus(item.expiryDate) === 'expired').length;
  const nearExpiryCount = items.filter(item => getStatus(item.expiryDate) === 'near').length;

  let ecoScore = 100;
  if (totalTracked > 0) {
    const totalWastedOrExp = expiredCount;
    const ratio = totalWastedOrExp / totalTracked;
    ecoScore = Math.max(0, Math.round((1 - ratio) * 100));
  }

  const getPantryRating = () => {
    if (totalTracked === 0) return { label: 'Empty Pantry', color: '#94A3B8' };
    if (ecoScore >= 85) return { label: 'Master Eco Chef', color: '#2E7D32' };
    if (ecoScore >= 60) return { label: 'Waste Preventive', color: '#F59E0B' };
    return { label: 'Waste Warrior Cadet', color: '#EF4444' };
  };

  const rating = getPantryRating();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarContainer, { borderColor: colors.border }]}>
            <Image source={require('../../assets/profile.png')} style={styles.avatar} />
          </View>
          <Text style={[styles.username, { color: colors.text, fontSize: 18 }]}>@{username}</Text>
          <Text style={[styles.email, { color: colors.textSecondary, fontSize: 13 }]}>{email}</Text>
          <View style={[styles.badge, { backgroundColor: rating.color + '15' }]}>
            <Text style={[styles.badgeText, { color: rating.color, fontSize: 11 }]}>{rating.label}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 }]}>Pantry Stats</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border, padding: 12 }]}>
            <MaterialCommunityIcons name="scale-balance" size={22} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text, fontSize: 18 }]}>{ecoScore}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 11, textAlign: 'center' }]}>Eco Score</Text>
          </View>
          
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border, padding: 12 }]}>
            <MaterialCommunityIcons name="basket" size={22} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text, fontSize: 18 }]}>{totalTracked}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 11, textAlign: 'center' }]}>Tracked Items</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border, padding: 12 }]}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text, fontSize: 18 }]}>{freshCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 11, textAlign: 'center' }]}>Fresh Items</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border, padding: 12 }]}>
            <MaterialCommunityIcons name="alert-octagon-outline" size={22} color={colors.danger} />
            <Text style={[styles.statNumber, { color: colors.text, fontSize: 18 }]}>{expiredCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 11, textAlign: 'center' }]}>Expired Food</Text>
          </View>
        </View>

        {/* Sustainable Guidelines */}
        <View style={[styles.tipsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { marginTop: 0, color: colors.text, fontSize: 15 }]}>Food Waste Prevention Tips</Text>
          
          <View style={styles.tipRow}>
            <View style={[styles.tipIconBg, { backgroundColor: colors.background }]}>
              <MaterialCommunityIcons name="snowflake" size={18} color={colors.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text, fontSize: 13 }]}>Freeze leftovers</Text>
              <Text style={[styles.tipDesc, { color: colors.textSecondary, fontSize: 12 }]}>Leftovers can be frozen to consume later. Label with dates!</Text>
            </View>
          </View>

          <View style={styles.tipRow}>
            <View style={[styles.tipIconBg, { backgroundColor: colors.background }]}>
              <MaterialCommunityIcons name="leaf" size={18} color={colors.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text, fontSize: 13 }]}>First In, First Out</Text>
              <Text style={[styles.tipDesc, { color: colors.textSecondary, fontSize: 12 }]}>Place newer items at the back of shelves to eat older ones first.</Text>
            </View>
          </View>

          <View style={[styles.tipRow, { marginBottom: 0 }]}>
            <View style={[styles.tipIconBg, { backgroundColor: colors.background }]}>
              <MaterialCommunityIcons name="water" size={18} color={colors.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text, fontSize: 13 }]}>Control moisture</Text>
              <Text style={[styles.tipDesc, { color: colors.textSecondary, fontSize: 12 }]}>Keep berries and leafy greens dry with paper towels to prevent mold.</Text>
            </View>
          </View>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.danger, height: 48, justifyContent: 'center', alignItems: 'center' }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { fontSize: 14 }]}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarContainer: {
    padding: 3,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  tipsSection: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipIconBg: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
