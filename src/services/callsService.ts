
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Call {
  id: string;
  title: string;
  type: "audio" | "video";
  status: string;
  user_id: string;
  contact_id?: string;
  recording?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const fetchCalls = async (): Promise<Call[]> => {
  try {
    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Erro ao buscar chamadas: ${error.message}`);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching calls:", error);
    throw error;
  }
};

export const getCall = async (id: string): Promise<Call> => {
  try {
    // Verificar se o ID é "new" - neste caso, retornamos um objeto de chamada vazio
    if (id === "new") {
      console.log("Criando nova chamada temporária");
      return {
        id: "new",
        title: "Nova Chamada",
        type: "audio",
        status: "pending",
        user_id: "",
      };
    }

    // Se não for "new", buscamos do banco de dados normalmente
    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      toast.error(`Erro ao buscar detalhes da chamada: ${error.message}`);
      throw error;
    }
    
    if (!data) {
      toast.error("Chamada não encontrada");
      throw new Error("Call not found");
    }

    return data;
  } catch (error) {
    console.error("Error fetching call:", error);
    throw error;
  }
};

export const createCall = async (call: Omit<Call, "id" | "user_id" | "created_at" | "updated_at">): Promise<Call> => {
  try {
    // Se estamos vindo de uma chamada temporária (id "new"), garantimos que não usamos esse ID
    const callToCreate = { ...call };
    
    const { data, error } = await supabase
      .from("calls")
      .insert([callToCreate])
      .select()
      .single();

    if (error) {
      toast.error(`Erro ao criar chamada: ${error.message}`);
      throw error;
    }

    toast.success("Chamada criada com sucesso!");
    return data;
  } catch (error) {
    console.error("Error creating call:", error);
    throw error;
  }
};

export const updateCallStatus = async (id: string, status: string): Promise<Call> => {
  try {
    // Se o ID for "new", não tentamos atualizar no banco
    if (id === "new") {
      console.log("Chamada temporária, não atualizando status no banco");
      return {
        id: "new",
        title: "Nova Chamada",
        type: "audio",
        status: status,
        user_id: "",
      };
    }
    
    const { data, error } = await supabase
      .from("calls")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast.error(`Erro ao atualizar status da chamada: ${error.message}`);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating call status:", error);
    throw error;
  }
};

export const deleteCall = async (id: string): Promise<void> => {
  try {
    // Se o ID for "new", não há nada a excluir no banco
    if (id === "new") {
      console.log("Chamada temporária, não há nada a excluir no banco");
      return;
    }
    
    const { error } = await supabase
      .from("calls")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(`Erro ao excluir chamada: ${error.message}`);
      throw error;
    }

    toast.success("Chamada excluída com sucesso!");
  } catch (error) {
    console.error("Error deleting call:", error);
    throw error;
  }
};
