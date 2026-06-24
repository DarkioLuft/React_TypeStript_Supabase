import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { workoutService } from '../services/workoutService';

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalWorkouts: 0, totalLogs: 0, totalExercises: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      if (user) {
        const data = await workoutService.getStats(user.id);
        setStats(data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const statCards = [
    { label: 'Exercícios', value: stats.totalExercises, icon: 'fitness' as const, color: '#00b894' },
    { label: 'Treinos', value: stats.totalWorkouts, icon: 'barbell' as const, color: '#6C5CE7' },
    { label: 'Concluídos', value: stats.totalLogs, icon: 'checkmark-circle' as const, color: '#fdcb6e' },
  ];

  const quickActions = [
    { label: 'Novo Exercício', icon: 'add-circle' as const, color: '#00b894',
      onPress: () => navigation.navigate('ExercisesTab', { screen: 'ExerciseForm' }) },
    { label: 'Novo Treino', icon: 'clipboard' as const, color: '#6C5CE7',
      onPress: () => navigation.navigate('WorkoutsTab', { screen: 'WorkoutForm' }) },
    { label: 'Relatórios', icon: 'stats-chart' as const, color: '#fdcb6e',
      onPress: () => navigation.navigate('ReportsTab') },
    { label: 'Calc. IMC', icon: 'calculator' as const, color: '#e17055',
      onPress: () => navigation.navigate('ProfileTab') },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.welcome}>
        <Text style={styles.greeting}>Olá! 💪</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Resumo</Text>
      <View style={styles.statsRow}>
        {statCards.map((card) => (
          <View key={card.label} style={styles.statCard}>
            <Ionicons name={card.icon} size={28} color={card.color} />
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Acesso Rápido</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBg, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon} size={28} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  welcome: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2d3436',
  },
  email: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2d3436',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
});
