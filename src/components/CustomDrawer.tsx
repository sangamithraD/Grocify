import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function CustomDrawer(props: any) {
  const { user, logout } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const { isCollapsed, setIsCollapsed, isLargeScreen } = props;

  const displayName = user?.email ? user.email.split('@')[0] : 'Grocify User';
  const emailDisplay = user?.email || 'pantry@grocify.com';

  const menuItems = [
    { name: 'Dashboard', label: 'Dashboard', icon: 'speedometer-outline', activeIcon: 'speedometer' },
    { name: 'Add Groceries', label: 'Add Groceries', icon: 'add-circle-outline', activeIcon: 'add-circle' },
    { name: 'Groceries', label: 'Groceries', icon: 'basket-outline', activeIcon: 'basket' },
    { name: 'Shopping List', label: 'Shopping List', icon: 'cart-outline', activeIcon: 'cart' },
    { name: 'Food Waste Report', label: 'Waste Report', icon: 'analytics-outline', activeIcon: 'analytics' },
    { name: 'Recipes', label: 'Recipes', icon: 'restaurant-outline', activeIcon: 'restaurant' },
    { name: 'Settings', label: 'Settings', icon: 'options-outline', activeIcon: 'options' },
  ];

  const activeRouteName = props.state.routeNames[props.state.index];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[
          styles.profileContainer, 
          { backgroundColor: colors.primaryLight, borderBottomColor: colors.border },
          isCollapsed && { paddingVertical: 16, paddingHorizontal: 0 }
        ]}>
          {isCollapsed ? (
            <Ionicons name="person-circle-outline" size={32} color={colors.primary} style={{ alignSelf: 'center' }} />
          ) : (
            <>
              <Text style={[styles.name, { color: colors.text, fontSize: 15 }]}>Welcome, {displayName}</Text>
              <Text style={[styles.email, { color: colors.textSecondary, fontSize: 11 }]}>{emailDisplay}</Text>
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={[styles.menuList, isCollapsed && { paddingHorizontal: 8 }]}>
          {menuItems.map((item) => {
            const isActive = activeRouteName === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuItem,
                  { backgroundColor: isActive ? colors.primaryLight : 'transparent' },
                  isCollapsed && { justifyContent: 'center', paddingHorizontal: 0, height: 46 }
                ]}
                onPress={() => props.navigation.navigate(item.name)}
              >
                <Ionicons 
                  name={isActive ? (item.activeIcon as any) : (item.icon as any)} 
                  size={22} 
                  color={isActive ? colors.primary : colors.textSecondary} 
                />
                {!isCollapsed && (
                  <Text style={[
                    styles.menuItemText, 
                    { color: isActive ? colors.primary : colors.text, fontSize: 14 },
                    isActive && { fontWeight: '700' }
                  ]}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Drawer Footer (Logout & Collapse Toggle) */}
      <View style={[
        styles.footer, 
        { borderTopColor: colors.border },
        isCollapsed && { paddingHorizontal: 8, alignItems: 'center' }
      ]}>
        {/* Log Out */}
        <TouchableOpacity
          style={[
            styles.menuItem, 
            styles.logoutBtn,
            isCollapsed && { justifyContent: 'center', paddingHorizontal: 0, height: 46 }
          ]}
          onPress={() => {
            if (Platform.OS === 'web') {
              const confirmLogout = window.confirm('Are you sure you want to sign out?');
              if (confirmLogout) {
                logout();
              }
            } else {
              Alert.alert(
                'Logout',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: "cancel" },
                  { text: 'Logout', style: "destructive", onPress: logout }
                ]
              );
            }
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          {!isCollapsed && (
            <Text style={[styles.menuItemText, { color: '#EF4444', fontSize: 14 }]}>Logout</Text>
          )}
        </TouchableOpacity>

        {/* Collapse Button */}
        {isLargeScreen && setIsCollapsed && (
          <TouchableOpacity
            style={[
              styles.collapseBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
              isCollapsed && { marginLeft: 0 }
            ]}
            onPress={() => setIsCollapsed(!isCollapsed)}
          >
            <Ionicons 
              name={isCollapsed ? "chevron-forward-outline" : "chevron-back-outline"} 
              size={18} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  image: {
    height: 70,
    width: 70,
    borderRadius: 35,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  email: {
    fontSize: 11,
    marginTop: 2,
  },
  menuList: {
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    height: 48,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  logoutBtn: {
    marginBottom: 12,
  },
  collapseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
});
