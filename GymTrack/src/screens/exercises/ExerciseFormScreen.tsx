import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal, FlatList,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { exerciseService } from '../../services/exerciseService';
import { MUSCLE_GROUPS } from '../../types';

export function ExerciseFormScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const exerciseId = route.params?.exerciseId;
  const isEditing = !!exerciseId;

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Exercício' : 'Novo Exercício',
    });

    if (isEditing) {
      loadExercise();
    }
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      const data = await exerciseService.getById(exerciseId);
      if (data) {
        setName(data.name);
        setMuscleGroup(data.muscle_group);
        setDescription(data.description || '');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message);
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!muscleGroup) {
      newErrors.muscleGroup = 'Selecione um grupo muscular';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;

    setLoading(true);
    try {
      const form = { name, muscle_group: muscleGroup, description };

      if (isEditing) {
        await exerciseService.update(exerciseId, form);
        Alert.alert('Sucesso', 'Exercício atualizado!');
      } else {
        await exerciseService.create(form, user.id);
        Alert.alert('Sucesso', 'Exercício cadastrado!');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
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
        {/* Nome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do exercício *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Ex: Supino reto"
            placeholderTextColor="#b2bec3"
            value={name}
            onChangeText={(t) => { setName(t); clearError('name'); }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Grupo muscular */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Grupo muscular *</Text>
          <TouchableOpacity
            style={[styles.picker, errors.muscleGroup && styles.inputError]}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={[styles.pickerText, !muscleGroup && styles.pickerPlaceholder]}>
              {muscleGroup || 'Selecione o grupo muscular'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#636e72" />
          </TouchableOpacity>
          {errors.muscleGroup && <Text style={styles.errorText}>{errors.muscleGroup}</Text>}
        </View>

        {/* Descrição */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva como executar o exercício..."
            placeholderTextColor="#b2bec3"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

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
                {isEditing ? 'Atualizar' : 'Cadastrar'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal seletor de grupo muscular */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Grupo Muscular</Text>
            <FlatList
              data={MUSCLE_GROUPS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item === muscleGroup && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setMuscleGroup(item);
                    clearError('muscleGroup');
                    setPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === muscleGroup && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === muscleGroup && (
                    <Ionicons name="checkmark" size={20} color="#6C5CE7" />
                  )}
                </TouchableOpacity>
              )}
            />
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
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#2d3436',
  },
  pickerPlaceholder: {
    color: '#b2bec3',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
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
    maxHeight: '60%',
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
  },
  modalItemSelected: {
    backgroundColor: '#6C5CE720',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2d3436',
  },
  modalItemTextSelected: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
});
