import { supabase } from '../lib/supabase';
import { Exercise, ExerciseForm } from '../types';

export const exerciseService = {
  // Listar todos os exercícios do usuário
  async list(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  // Buscar exercício por ID
  async getById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Criar novo exercício
  async create(form: ExerciseForm, userId: string): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        name: form.name.trim(),
        muscle_group: form.muscle_group,
        description: form.description.trim() || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Atualizar exercício
  async update(id: string, form: ExerciseForm): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .update({
        name: form.name.trim(),
        muscle_group: form.muscle_group,
        description: form.description.trim() || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Excluir exercício
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  // Buscar por nome
  async search(query: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
