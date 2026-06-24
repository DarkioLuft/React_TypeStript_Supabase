import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/workoutService';
import { Workout, WorkoutExercise } from '../../types';

export function WorkoutDetailScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { workoutId } = route.params;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      const data = await workoutService.getById(workoutId);
      setWorkout(data.workout);
      setExercises(data.exercises);
      navigation.setOptions({ title: data.workout.name });
    } catch (err: any) {
      Alert.alert('Erro', err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLogWorkout = async () => {
    if (!user || !workout) return;

    setSaving(true);
    try {
      await workoutService.logWorkout(
        workout.id,
        workout.name,
        user.id,
        duration ? parseInt(duration) : undefined,
        notes || undefined
      );
      Alert.alert('Treino concluído! 🎉', 'Seu treino foi registrado no histórico.');
      setLogModalVisible(false);
      setDuration('');
      setNotes('');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Info do treino */}
        {workout?.description ? (
          <View style={styles.descriptionCard}>
            <Ionicons name="information-circle-outline" size={18} color="#636e72" />
            <Text style={styles.descriptionText}>{workout.description}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          Exercícios ({exercises.length})
        </Text>

        {exercises.map((item, index) => (
          <View key={item.id} style={styles.exerciseCard}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>
                {item.exercise?.name || 'Exercício'}
              </Text>
              <Text style={styles.exerciseMuscle}>
                {item.exercise?.muscle_group}
              </Text>
              <View style={styles.exerciseDetails}>
                <View style={styles.detailChip}>
                  <Text style={styles.detailText}>{item.sets} séries</Text>
                </View>
                <View style={styles.detailChip}>
                  <Text style={styles.detailText}>{item.reps} reps</Text>
                </View>
                {item.weight && (
                  <View style={styles.detailChip}>
                    <Text style={styles.detailText}>{item.weight} kg</Text>
                  </View>
                )}
                <View style={styles.detailChip}>
                  <Text style={styles.detailText}>{item.rest_seconds}s desc.</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botão concluir treino */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => setLogModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.completeButtonText}>Concluir Treino</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de registro */}
      <Modal visible={logModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLogModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Registrar Treino</Text>
            <Text style={styles.modalSubtitle}>{workout?.name}</Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Duração (minutos)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: 45"
                placeholderTextColor="#b2bec3"
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Observações (opcional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Como foi o treino?"
                placeholderTextColor="#b2bec3"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSaveBtn, saving && { opacity: 0.7 }]}
              onPress={handleLogWorkout}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalSaveText}>Confirmar Conclusão</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setLogModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  descriptionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#6C5CE7',
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 14,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  exerciseNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  exerciseMuscle: {
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '500',
    marginTop: 2,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  detailChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  detailText: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#dfe6e9',
  },
  completeButton: {
    backgroundColor: '#00b894',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  modalField: {
    marginBottom: 16,
    gap: 6,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    color: '#2d3436',
  },
  modalTextArea: {
    minHeight: 70,
  },
  modalSaveBtn: {
    backgroundColor: '#00b894',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalCancelBtn: {
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#636e72',
  },
});
