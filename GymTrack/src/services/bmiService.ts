import { supabase } from '../lib/supabase';
import { BmiRecord } from '../types';

export const bmiService = {
  // Calcular IMC
  calculate(weight: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  },

  // Classificação do IMC
  classify(bmi: number): { label: string; color: string } {
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: '#3498db' };
    if (bmi < 25) return { label: 'Peso normal', color: '#27ae60' };
    if (bmi < 30) return { label: 'Sobrepeso', color: '#f39c12' };
    if (bmi < 35) return { label: 'Obesidade grau I', color: '#e67e22' };
    if (bmi < 40) return { label: 'Obesidade grau II', color: '#e74c3c' };
    return { label: 'Obesidade grau III', color: '#c0392b' };
  },

  // Salvar registro de IMC
  async save(weight: number, heightCm: number, userId: string): Promise<BmiRecord> {
    const bmi = this.calculate(weight, heightCm);
    const heightM = heightCm / 100;

    const { data, error } = await supabase
      .from('bmi_records')
      .insert({
        weight,
        height: heightM,
        bmi,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Listar histórico de IMC
  async list(): Promise<BmiRecord[]> {
    const { data, error } = await supabase
      .from('bmi_records')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  // Excluir registro
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bmi_records')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};
