import { ComponentProps } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../auth/AuthContext';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EquipmentListScreen from '../screens/EquipmentListScreen';


const Tab = createBottomTabNavigator();

type IconName = ComponentProps<typeof Ionicons>['name'];
const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: string; size: number }) =>
    <Ionicons name={name} size={size} color={color} />;

const screenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontSize: 12, fontWeight: '500' as const },
  tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
};

function BorrowerTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
     <Tab.Screen name="Equipment" component={EquipmentListScreen} options={{ tabBarIcon: tabIcon('grid-outline') }} />
      <Tab.Screen
        name="My reservations"
        options={{ tabBarIcon: tabIcon('calendar-outline') }}
      >
        {() => <PlaceholderScreen title="My Reservations" note="Coming soon." />}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon('person-outline') }} />
    </Tab.Navigator>
  );
}

function StaffTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Requests" options={{ tabBarIcon: tabIcon('list-outline') }}>
        {() => <PlaceholderScreen title="Requests" note="Coming soon." />}
      </Tab.Screen>
      <Tab.Screen name="Inventory" options={{ tabBarIcon: tabIcon('cube-outline') }}>
        {() => <PlaceholderScreen title="Inventory" note="Coming soon." />}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon('person-outline') }} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      {user?.role === 'staff' ? <StaffTabs /> : <BorrowerTabs />}
    </NavigationContainer>
  );
}