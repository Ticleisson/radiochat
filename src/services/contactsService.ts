
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  organization?: string;
  user_id: string;
  created_at?: string;
  last_contact?: string;
}

export const fetchContacts = async (): Promise<Contact[]> => {
  try {
    // Primeiro tentamos buscar contatos da Evolution API
    const evolutionContacts = await fetchEvolutionContacts();
    
    // Se conseguir contatos da Evolution API, retorna eles
    if (evolutionContacts && evolutionContacts.length > 0) {
      console.log("Contatos da Evolution API:", evolutionContacts);
      return evolutionContacts;
    }

    // Se não conseguir ou não tiver contatos na Evolution API, busca do Supabase
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Erro ao buscar contatos: ${error.message}`);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching contacts:", error);
    // Em caso de erro, tentamos buscar do Supabase como fallback
    try {
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    } catch (secondError) {
      console.error("Fallback error:", secondError);
      return [];
    }
  }
};

const fetchEvolutionContacts = async (): Promise<Contact[]> => {
  try {
    // URL da API Evolution
    const evolutionApiUrl = "https://api.evolutionapi.com.br/instances/lovechat/contact";
    
    // Usando a API key correta da Evolution API
    const apiKey = "evolution-api-key-123456"; // Substitua pelo token real da sua implementação
    
    console.log("Tentando buscar contatos da Evolution API...");
    
    const response = await fetch(evolutionApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      }
    });

    if (!response.ok) {
      console.error("Resposta da API não OK:", response.status);
      throw new Error(`Erro ao buscar contatos da API Evolution: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dados recebidos da Evolution API:", data);
    
    // Verifica se a resposta tem o formato esperado
    if (!Array.isArray(data) && data.contacts && Array.isArray(data.contacts)) {
      // Se a resposta tiver uma propriedade contacts, usa ela
      return data.contacts.map(formatEvolutionContact);
    } else if (Array.isArray(data)) {
      // Se a resposta já for um array
      return data.map(formatEvolutionContact);
    }
    
    console.log("Formato de resposta não reconhecido:", data);
    return [];
  } catch (error) {
    console.error("Erro ao buscar contatos da API Evolution:", error);
    // Retorne um array vazio caso haja erro para que o fluxo continue
    return [];
  }
};

const formatEvolutionContact = (contact: any): Contact => {
  return {
    id: contact.id || contact.wa_id || `evolution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: contact.name || contact.pushname || contact.numero || "Sem nome",
    phone: contact.number || contact.wa_id || contact.numero || "",
    organization: contact.organization || contact.empresa || "",
    user_id: "evolution_api",
    created_at: new Date().toISOString(),
    last_contact: contact.last_seen || contact.ultimo_contato || ""
  };
};

export const createContact = async (contact: Omit<Contact, "id" | "user_id" | "created_at">): Promise<Contact> => {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .insert([contact])
      .select()
      .single();

    if (error) {
      toast.error(`Erro ao criar contato: ${error.message}`);
      throw error;
    }

    toast.success("Contato adicionado com sucesso!");
    return data;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

export const updateContact = async (id: string, contact: Partial<Contact>): Promise<Contact> => {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .update(contact)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast.error(`Erro ao atualizar contato: ${error.message}`);
      throw error;
    }

    toast.success("Contato atualizado com sucesso!");
    return data;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(`Erro ao excluir contato: ${error.message}`);
      throw error;
    }

    toast.success("Contato excluído com sucesso!");
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};
