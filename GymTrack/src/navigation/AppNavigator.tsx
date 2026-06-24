import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Telas de autenticação
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Telas principais
import { HomeScreen } from '../screens/HomeScreen';
import { ExerciseListScreen } from '../screens/exercises/ExerciseListScreen';
import { ExerciseFormScreen } from '../screens/exercises/ExerciseFormScreen';
import { WorkoutListScreen } from '../screens/workouts/WorkoutListScreen';
import { WorkoutFormScreen } from '../screens/workouts/WorkoutFormScreen';
import { WorkoutDetailScreen } from '../screens/workouts/WorkoutDetailScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ExerciseStack = createNativeStackNavigator();
const WorkoutStack = createNativeStackNavigator();

// Stack de autenticação
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Stack de exercícios
function ExerciseNavigator() {
  return (
    <ExerciseStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#f8f9fa' },
        headerTintColor: '#2d3436',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <ExerciseStack.Screen
        name="ExerciseList"
        component={ExerciseListScreen}
        options={{ title: 'Exercícios' }}
      />
      <ExerciseStack.Screen
        name="ExerciseForm"
        component={ExerciseFormScreen}
        options={{ title: 'Novo Exercício' }}
      />
    </ExerciseStack.Navigator>
  );
}

// Stack de treinos
function WorkoutNavigator() {
  return (
    <WorkoutStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#f8f9fa' },
        headerTintColor: '#2d3436',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <WorkoutStack.Screen
        name="WorkoutList"
        component={WorkoutListScreen}
        options={{ title: 'Treinos' }}
      />
      <WorkoutStack.Screen
        name="WorkoutForm"
        component={WorkoutFormScreen}
        options={{ title: 'Novo Treino' }}
      />
      <WorkoutStack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: 'Detalhes' }}
      />
    </WorkoutStack.Navigator>
  );
}

// Navegação principal com abas
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ExercisesTab':
              iconName = focused ? 'barbell' : 'barbell-outline';
              break;
            case 'WorkoutsTab':
              iconName = focused ? 'clipboard' : 'clipboard-outline';
              break;
            case 'ReportsTab':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#b2bec3',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#dfe6e9',
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTintColor: '#2d3436',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Início', headerTitle: 'GymTrack' }}
      />
      <Tab.Screen
        name="ExercisesTab"
        component={ExerciseNavigator}
        options={{ title: 'Exercícios', headerShown: false }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutNavigator}
        options={{ title: 'Treinos', headerShown: false }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{ title: 'Relatórios', headerTitle: 'Histórico de Treinos' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerTitle: 'Meu Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Navegador raiz que alterna entre auth e app
export function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
