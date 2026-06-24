import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Alert, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { workoutService } from '../services/workoutService';
import { WorkoutLog } from '../types';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function ReportsScreen() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutLog | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await workoutService.getLogs();
      setLogs(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await workoutService.deleteLog(deleteTarget.id);
      setLogs(prev => prev.filter(l => l.id !== deleteTarget.id));
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
    setDeleteTarget(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Agrupa logs por data
  const groupedLogs = logs.reduce((groups, log) => {
    const date = new Date(log.completed_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {} as Record<string, WorkoutLog[]>);

  const sections = Object.entries(groupedLogs).map(([date, items]) => ({
    date: formatDate(items[0].completed_at),
    data: items,
  }));

  const renderItem = ({ item }: { item: WorkoutLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logIcon}>
        <Ionicons name="checkmark-circle" size={24} color="#00b894" />
      </View>
      <View style={styles.logContent}>
        <Text style={styles.logTitle}>{item.workout_name}</Text>
        <View style={styles.logMeta}>
          <Text style={styles.logTime}>
            <Ionicons name="time-outline" size={12} color="#b2bec3" />{' '}
            {formatTime(item.completed_at)}
          </Text>
          {item.duration_minutes && (
            <Text style={styles.logDuration}>
              {item.duration_minutes} min
            </Text>
          )}
        </View>
        {item.notes ? (
          <Text style={styles.logNotes} numberOfLines={2}>{item.notes}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => setDeleteTarget(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* Resumo */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{logs.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)}
          </Text>
          <Text style={styles.summaryLabel}>Minutos</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{sections.length}</Text>
          <Text style={styles.summaryLabel}>Dias</Text>
        </View>
      </View>

      {logs.length === 0 ? (
        <EmptyState
          icon="stats-chart-outline"
          title="Nenhum registro"
          message="Conclua treinos para ver seu histórico aqui"
        />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.date}
          renderItem={({ item: section }) => (
            <View>
              <Text style={styles.dateHeader}>{section.date}</Text>
              {section.data.map(log => (
                <View key={log.id}>{renderItem({ item: log })}</View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Excluir registro"
        message="Deseja remover este registro do histórico?"
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
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6C5CE7',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#dfe6e9',
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#636e72',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  logIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
  },
  logMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#b2bec3',
  },
  logDuration: {
    fontSize: 12,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  logNotes: {
    fontSize: 13,
    color: '#636e72',
    marginTop: 6,
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: 6,
  },
});
