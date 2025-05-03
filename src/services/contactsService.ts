
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
    
    if (evolutionContacts && evolutionContacts.length > 0) {
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
    throw error;
  }
};

const fetchEvolutionContacts = async (): Promise<Contact[]> => {
  try {
    // URL da API Evolution - substitua pela URL correta do seu ambiente
    const evolutionApiUrl = "https://api.evolutionchat.com.br/v1/contacts";
    
    const response = await fetch(evolutionApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getEvolutionApiKey()
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar contatos da API Evolution: ${response.status}`);
    }

    const data = await response.json();
    
    // Mapeie a resposta da API Evolution para o formato de contato usado na aplicação
    return data.map((contact: any) => ({
      id: contact.id || contact.wa_id,
      name: contact.name || contact.pushname,
      phone: contact.number || contact.wa_id,
      organization: contact.organization || "",
      user_id: "evolution_api", // Identificador para saber que veio da Evolution API
      created_at: new Date().toISOString(),
      last_contact: contact.last_seen || ""
    }));
  } catch (error) {
    console.error("Erro ao buscar contatos da API Evolution:", error);
    // Retorne um array vazio caso haja erro para que o fluxo continue
    return [];
  }
};

// Função para obter a chave da API Evolution
const getEvolutionApiKey = (): string => {
  // Idealmente, isso deveria vir de uma variável de ambiente ou configuração segura
  return "seu_token_aqui"; // Substitua pelo token real de integração
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
