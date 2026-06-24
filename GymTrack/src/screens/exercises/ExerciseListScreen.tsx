import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { exerciseService } from '../../services/exerciseService';
import { Exercise } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function ExerciseListScreen({ navigation }: any) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);

  const loadExercises = async () => {
    try {
      const data = search.trim()
        ? await exerciseService.search(search.trim())
        : await exerciseService.list();
      setExercises(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadExercises();
    }, [search])
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await exerciseService.delete(deleteTarget.id);
      setExercises(prev => prev.filter(e => e.id !== deleteTarget.id));
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
    setDeleteTarget(null);
  };

  // Ícone do grupo muscular
  const getMuscleIcon = (group: string): keyof typeof Ionicons.glyphMap => {
    const map: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Peito': 'body',
      'Costas': 'body',
      'Pernas': 'walk',
      'Ombros': 'accessibility',
      'Bíceps': 'fitness',
      'Tríceps': 'fitness',
      'Abdômen': 'body',
      'Glúteos': 'walk',
      'Corpo inteiro': 'accessibility',
    };
    return map[group] || 'barbell';
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ExerciseForm', { exerciseId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={getMuscleIcon(item.muscle_group)} size={24} color="#6C5CE7" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.muscle_group}</Text>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => setDeleteTarget(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#b2bec3" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercício..."
          placeholderTextColor="#b2bec3"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#b2bec3" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />
      ) : exercises.length === 0 ? (
        <EmptyState
          icon="barbell-outline"
          title="Nenhum exercício"
          message="Cadastre seu primeiro exercício tocando no botão +"
        />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ExerciseForm')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Excluir exercício"
        message={`Deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2d3436',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 8,
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
  cardSubtitle: {
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '500',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 2,
  },
  deleteBtn: {
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
