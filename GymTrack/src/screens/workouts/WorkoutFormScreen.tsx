import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal, FlatList,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/workoutService';
import { exerciseService } from '../../services/exerciseService';
import { Exercise, WorkoutExerciseForm } from '../../types';

export function WorkoutFormScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const workoutId = route.params?.workoutId;
  const isEditing = !!workoutId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseForm[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Treino' : 'Novo Treino',
    });
    loadData();
  }, [workoutId]);

  const loadData = async () => {
    try {
      // Carrega exercícios disponíveis
      const exercises = await exerciseService.list();
      setAvailableExercises(exercises);

      // Se editando, carrega dados do treino
      if (isEditing) {
        const { workout, exercises: wExercises } = await workoutService.getById(workoutId);
        setName(workout.name);
        setDescription(workout.description || '');
        setWorkoutExercises(
          wExercises.map(we => ({
            exercise_id: we.exercise_id,
            exercise_name: we.exercise?.name || '',
            sets: String(we.sets),
            reps: String(we.reps),
            weight: we.weight ? String(we.weight) : '',
            rest_seconds: String(we.rest_seconds),
          }))
        );
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (workoutExercises.length === 0) {
      newErrors.exercises = 'Adicione pelo menos 1 exercício ao treino';
    }

    // Valida cada exercício
    workoutExercises.forEach((ex, i) => {
      const sets = parseInt(ex.sets);
      const reps = parseInt(ex.reps);
      if (!sets || sets <= 0) newErrors[`sets_${i}`] = 'Séries inválidas';
      if (!reps || reps <= 0) newErrors[`reps_${i}`] = 'Repetições inválidas';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addExercise = (exercise: Exercise) => {
    // Evita duplicatas
    if (workoutExercises.some(we => we.exercise_id === exercise.id)) {
      Alert.alert('Atenção', 'Este exercício já foi adicionado.');
      return;
    }

    setWorkoutExercises(prev => [
      ...prev,
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        sets: '3',
        reps: '12',
        weight: '',
        rest_seconds: '60',
      },
    ]);
    setErrors(prev => { const next = { ...prev }; delete next.exercises; return next; });
    setExercisePickerVisible(false);
  };

  const removeExercise = (index: number) => {
    setWorkoutExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExerciseField = (index: number, field: keyof WorkoutExerciseForm, value: string) => {
    setWorkoutExercises(prev =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const handleSave = async () => {
    if (!validate() || !user) return;

    setLoading(true);
    try {
      if (isEditing) {
        await workoutService.update(workoutId, name, description, workoutExercises);
        Alert.alert('Sucesso', 'Treino atualizado!');
      } else {
        await workoutService.create(name, description, workoutExercises, user.id);
        Alert.alert('Sucesso', 'Treino criado!');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Informações do treino */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do treino *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Ex: Treino A - Peito e Tríceps"
            placeholderTextColor="#b2bec3"
            value={name}
            onChangeText={(t) => { setName(t); setErrors(e => ({ ...e, name: undefined } as any)); }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observações sobre o treino..."
            placeholderTextColor="#b2bec3"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Lista de exercícios do treino */}
        <View style={styles.exercisesHeader}>
          <Text style={styles.label}>Exercícios *</Text>
          <TouchableOpacity
            style={styles.addExerciseBtn}
            onPress={() => setExercisePickerVisible(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addExerciseText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {errors.exercises && <Text style={styles.errorText}>{errors.exercises}</Text>}

        {workoutExercises.length === 0 ? (
          <View style={styles.emptyExercises}>
            <Ionicons name="barbell-outline" size={32} color="#b2bec3" />
            <Text style={styles.emptyText}>Nenhum exercício adicionado</Text>
          </View>
        ) : (
          workoutExercises.map((ex, index) => (
            <View key={`${ex.exercise_id}_${index}`} style={styles.exerciseCard}>
              <View style={styles.exerciseCardHeader}>
                <Text style={styles.exerciseCardTitle}>{ex.exercise_name}</Text>
                <TouchableOpacity onPress={() => removeExercise(index)}>
                  <Ionicons name="close-circle" size={22} color="#e74c3c" />
                </TouchableOpacity>
              </View>

              <View style={styles.exerciseFields}>
                <View style={styles.fieldSmall}>
                  <Text style={styles.fieldLabel}>Séries</Text>
                  <TextInput
                    style={[styles.fieldInput, errors[`sets_${index}`] && styles.inputError]}
                    value={ex.sets}
                    onChangeText={(v) => updateExerciseField(index, 'sets', v)}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={styles.fieldSmall}>
                  <Text style={styles.fieldLabel}>Reps</Text>
                  <TextInput
                    style={[styles.fieldInput, errors[`reps_${index}`] && styles.inputError]}
                    value={ex.reps}
                    onChangeText={(v) => updateExerciseField(index, 'reps', v)}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <View style={styles.fieldSmall}>
                  <Text style={styles.fieldLabel}>Peso (kg)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={ex.weight}
                    onChangeText={(v) => updateExerciseField(index, 'weight', v)}
                    keyboardType="decimal-pad"
                    placeholder="-"
                    placeholderTextColor="#b2bec3"
                    maxLength={6}
                  />
                </View>
                <View style={styles.fieldSmall}>
                  <Text style={styles.fieldLabel}>Desc (s)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={ex.rest_seconds}
                    onChangeText={(v) => updateExerciseField(index, 'rest_seconds', v)}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>
            </View>
          ))
        )}

        {/* Botão salvar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Atualizar Treino' : 'Criar Treino'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal seletor de exercícios */}
      <Modal visible={exercisePickerVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setExercisePickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Exercício</Text>
            {availableExercises.length === 0 ? (
              <View style={styles.emptyExercises}>
                <Text style={styles.emptyText}>
                  Nenhum exercício cadastrado. Cadastre exercícios primeiro.
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableExercises}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const alreadyAdded = workoutExercises.some(we => we.exercise_id === item.id);
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, alreadyAdded && styles.modalItemDisabled]}
                      onPress={() => !alreadyAdded && addExercise(item)}
                      disabled={alreadyAdded}
                    >
                      <View>
                        <Text style={[styles.modalItemText, alreadyAdded && styles.modalItemTextDisabled]}>
                          {item.name}
                        </Text>
                        <Text style={styles.modalItemSub}>{item.muscle_group}</Text>
                      </View>
                      {alreadyAdded && (
                        <Ionicons name="checkmark-circle" size={20} color="#00b894" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    color: '#2d3436',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  textArea: {
    minHeight: 70,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 2,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00b894',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
  },
  addExerciseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyExercises: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  emptyText: {
    color: '#b2bec3',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    flex: 1,
  },
  exerciseFields: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldSmall: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#636e72',
    fontWeight: '500',
  },
  fieldInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    color: '#2d3436',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
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
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemDisabled: {
    opacity: 0.5,
  },
  modalItemText: {
    fontSize: 16,
    color: '#2d3436',
  },
  modalItemTextDisabled: {
    color: '#b2bec3',
  },
  modalItemSub: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 2,
  },
});
