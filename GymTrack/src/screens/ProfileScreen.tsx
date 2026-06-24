import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { bmiService } from '../services/bmiService';
import { BmiRecord } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  // Campos do IMC
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<{ bmi: number; label: string; color: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Histórico de IMC
  const [records, setRecords] = useState<BmiRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Confirmação de logout
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const loadRecords = async () => {
    try {
      const data = await bmiService.list();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const w = parseFloat(weight.replace(',', '.'));
    const h = parseFloat(height.replace(',', '.'));

    if (!weight || isNaN(w) || w <= 0 || w > 500) {
      newErrors.weight = 'Peso inválido (1-500 kg)';
    }
    if (!height || isNaN(h) || h < 50 || h > 300) {
      newErrors.height = 'Altura inválida (50-300 cm)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validate() || !user) return;

    const w = parseFloat(weight.replace(',', '.'));
    const h = parseFloat(height.replace(',', '.'));
    const bmi = bmiService.calculate(w, h);
    const classification = bmiService.classify(bmi);

    setResult({ bmi, ...classification });

    // Salva no banco
    setSaving(true);
    try {
      await bmiService.save(w, h, user.id);
      await loadRecords();
    } catch (err: any) {
      Alert.alert('Erro ao salvar', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await bmiService.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Informações do usuário */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#6C5CE7" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <Text style={styles.profileDate}>
            Membro desde {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
              : '-'}
          </Text>
        </View>
      </View>

      {/* Calculadora de IMC - Recurso Extra */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calculator" size={22} color="#e17055" />
          <Text style={styles.sectionTitle}>Calculadora de IMC</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Recurso extra: acompanhe seu Índice de Massa Corporal</Text>

        <View style={styles.bmiForm}>
          <View style={styles.bmiField}>
            <Text style={styles.fieldLabel}>Peso (kg)</Text>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              placeholder="Ex: 75"
              placeholderTextColor="#b2bec3"
              value={weight}
              onChangeText={(t) => { setWeight(t); setErrors(e => ({ ...e, weight: undefined } as any)); }}
              keyboardType="decimal-pad"
              maxLength={6}
            />
            {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
          </View>

          <View style={styles.bmiField}>
            <Text style={styles.fieldLabel}>Altura (cm)</Text>
            <TextInput
              style={[styles.input, errors.height && styles.inputError]}
              placeholder="Ex: 175"
              placeholderTextColor="#b2bec3"
              value={height}
              onChangeText={(t) => { setHeight(t); setErrors(e => ({ ...e, height: undefined } as any)); }}
              keyboardType="decimal-pad"
              maxLength={5}
            />
            {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.calcButton, saving && { opacity: 0.7 }]}
          onPress={handleCalculate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="calculator-outline" size={18} color="#fff" />
              <Text style={styles.calcButtonText}>Calcular IMC</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resultado */}
        {result && (
          <View style={[styles.resultCard, { borderLeftColor: result.color }]}>
            <Text style={styles.resultBmi}>{result.bmi}</Text>
            <Text style={[styles.resultLabel, { color: result.color }]}>{result.label}</Text>
          </View>
        )}

        {/* Referência de faixas */}
        <View style={styles.referenceCard}>
          <Text style={styles.referenceTitle}>Faixas de IMC</Text>
          {[
            { range: '< 18.5', label: 'Abaixo do peso', color: '#3498db' },
            { range: '18.5 - 24.9', label: 'Peso normal', color: '#27ae60' },
            { range: '25.0 - 29.9', label: 'Sobrepeso', color: '#f39c12' },
            { range: '30.0 - 34.9', label: 'Obesidade grau I', color: '#e67e22' },
            { range: '35.0 - 39.9', label: 'Obesidade grau II', color: '#e74c3c' },
            { range: '≥ 40.0', label: 'Obesidade grau III', color: '#c0392b' },
          ].map(item => (
            <View key={item.range} style={styles.referenceRow}>
              <View style={[styles.referenceColor, { backgroundColor: item.color }]} />
              <Text style={styles.referenceRange}>{item.range}</Text>
              <Text style={styles.referenceLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Histórico de IMC */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de IMC</Text>

        {loadingRecords ? (
          <ActivityIndicator color="#6C5CE7" />
        ) : records.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum registro ainda</Text>
        ) : (
          records.map(record => {
            const classification = bmiService.classify(record.bmi);
            return (
              <View key={record.id} style={styles.historyCard}>
                <View style={[styles.historyDot, { backgroundColor: classification.color }]} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyBmi}>IMC: {record.bmi}</Text>
                  <Text style={styles.historyDetails}>
                    {record.weight}kg · {(record.height * 100).toFixed(0)}cm
                  </Text>
                  <Text style={styles.historyDate}>{formatDate(record.recorded_at)}</Text>
                </View>
                <Text style={[styles.historyLabel, { color: classification.color }]}>
                  {classification.label}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Botão sair */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setLogoutConfirm(true)}
      >
        <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={logoutConfirm}
        title="Sair"
        message="Tem certeza que deseja sair da sua conta?"
        confirmLabel="Sair"
        onConfirm={() => { setLogoutConfirm(false); signOut(); }}
        onCancel={() => setLogoutConfirm(false)}
        destructive
      />
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
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C5CE720',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  profileDate: {
    fontSize: 13,
    color: '#636e72',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#636e72',
    marginBottom: 16,
  },
  bmiForm: {
    flexDirection: 'row',
    gap: 12,
  },
  bmiField: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3436',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    color: '#2d3436',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    fontSize: 11,
    color: '#e74c3c',
  },
  calcButton: {
    backgroundColor: '#e17055',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  calcButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  resultBmi: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2d3436',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  referenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 10,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  referenceColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  referenceRange: {
    fontSize: 13,
    color: '#636e72',
    width: 90,
  },
  referenceLabel: {
    fontSize: 13,
    color: '#2d3436',
  },
  emptyText: {
    fontSize: 14,
    color: '#b2bec3',
    textAlign: 'center',
    padding: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyBmi: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
  },
  historyDetails: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 1,
  },
  historyDate: {
    fontSize: 11,
    color: '#b2bec3',
    marginTop: 1,
  },
  historyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e74c3c30',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e74c3c',
  },
});
