
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Transcription {
  id: string;
  title: string;
  content: string;
  call_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchTranscriptions = async (): Promise<Transcription[]> => {
  try {
    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Erro ao buscar transcrições: ${error.message}`);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching transcriptions:", error);
    throw error;
  }
};

export const getTranscription = async (id: string): Promise<Transcription> => {
  try {
    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      toast.error(`Erro ao buscar transcrição: ${error.message}`);
      throw error;
    }
    
    if (!data) {
      toast.error("Transcrição não encontrada");
      throw new Error("Transcription not found");
    }

    return data;
  } catch (error) {
    console.error("Error fetching transcription:", error);
    throw error;
  }
};

export const saveTranscription = async (transcription: Omit<Transcription, "id" | "user_id" | "created_at" | "updated_at">): Promise<Transcription> => {
  try {
    const { data, error } = await supabase
      .from("transcriptions")
      .insert([transcription])
      .select()
      .single();

    if (error) {
      toast.error(`Erro ao salvar transcrição: ${error.message}`);
      throw error;
    }

    toast.success("Transcrição salva com sucesso!");
    return data;
  } catch (error) {
    console.error("Error saving transcription:", error);
    throw error;
  }
};

export const updateTranscription = async (id: string, updates: Partial<Transcription>): Promise<Transcription> => {
  try {
    const { data, error } = await supabase
      .from("transcriptions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast.error(`Erro ao atualizar transcrição: ${error.message}`);
      throw error;
    }

    toast.success("Transcrição atualizada com sucesso!");
    return data;
  } catch (error) {
    console.error("Error updating transcription:", error);
    throw error;
  }
};

export const deleteTranscription = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("transcriptions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(`Erro ao excluir transcrição: ${error.message}`);
      throw error;
    }

    toast.success("Transcrição excluída com sucesso!");
  } catch (error) {
    console.error("Error deleting transcription:", error);
    throw error;
  }
};
