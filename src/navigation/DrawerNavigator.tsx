import React, { useState, useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useWindowDimensions } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AddItemScreen from '../screens/AddItemScreen';
import RecipeScreen from '../screens/RecipeScreen';
import SettingScreen from '../screens/SettingsScreen';
import CustomDrawer from '../components/CustomDrawer';
import ItemListScreen from '../screens/ItemListScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { ThemeContext } from '../context/ThemeContext';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { colors } = useContext(ThemeContext);
  const dimensions = useWindowDimensions();

  const isLargeScreen = dimensions.width >= 768;
  const collapsedState = isLargeScreen ? isCollapsed : false;

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawer
          {...props}
          isCollapsed={collapsedState}
          setIsCollapsed={setIsCollapsed}
        />
      )}
      screenOptions={{
        headerShown: true,
        drawerType: isLargeScreen ? 'permanent' : 'slide',
        drawerStyle: {
          width: collapsedState ? 80 : 260,
          backgroundColor: colors.card,
          borderRightWidth: 1,
          borderRightColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
          color: colors.text,
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={HomeScreen} />
      <Drawer.Screen name="Add Groceries" component={AddItemScreen} />
      <Drawer.Screen name="Groceries" component={ItemListScreen} />
      <Drawer.Screen name="Shopping List" component={ShoppingListScreen} />
      <Drawer.Screen name="Food Waste Report" component={AnalyticsScreen} />
      <Drawer.Screen name="Recipes" component={RecipeScreen} />
      <Drawer.Screen name="Settings" component={SettingScreen} />
    </Drawer.Navigator>
  );
}
