import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { workoutService } from '../../services/workoutService';
import { Workout } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function WorkoutListScreen({ navigation }: any) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const data = await workoutService.list();
      setWorkouts(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await workoutService.delete(deleteTarget.id);
      setWorkouts(prev => prev.filter(w => w.id !== deleteTarget.id));
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
    setDeleteTarget(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="clipboard" size={24} color="#6C5CE7" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        ) : null}
        <Text style={styles.cardDate}>Criado em {formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('WorkoutForm', { workoutId: item.id })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.actionBtn}
        >
          <Ionicons name="create-outline" size={20} color="#636e72" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDeleteTarget(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.actionBtn}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />
      ) : workouts.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title="Nenhum treino"
          message="Monte seu primeiro treino tocando no botão +"
        />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('WorkoutForm')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Excluir treino"
        message={`Deseja excluir "${deleteTarget?.name}"? Todos os exercícios vinculados serão removidos.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6C5CE720',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  cardDesc: {
    fontSize: 13,
    color: '#636e72',
    marginTop: 2,
  },
  cardDate: {
    fontSize: 11,
    color: '#b2bec3',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
