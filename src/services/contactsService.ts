
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
    console.log("Tentando buscar contatos da API Evolution...");
    let contacts: Contact[] = [];
    
    try {
      const evolutionContacts = await fetchEvolutionContacts();
      if (evolutionContacts && evolutionContacts.length > 0) {
        console.log("Contatos da Evolution API recuperados:", evolutionContacts.length);
        contacts = [...evolutionContacts];
      }
    } catch (evolutionError) {
      console.error("Falha ao buscar contatos da API Evolution:", evolutionError);
      // Continua o fluxo para buscar do Supabase
    }

    // Buscar contatos do Supabase (complementando os da Evolution API ou como única fonte)
    console.log("Buscando contatos do Supabase...");
    const { data: supabaseContacts, error: supabaseError } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (supabaseError) {
      console.error("Erro ao buscar contatos do Supabase:", supabaseError);
      // Se já tivermos contatos da Evolution, não mostramos erro
      if (contacts.length === 0) {
        toast.error(`Erro ao buscar contatos: ${supabaseError.message}`);
      }
    } else if (supabaseContacts) {
      console.log("Contatos do Supabase recuperados:", supabaseContacts.length);
      
      // Filtra contatos do Supabase que possam duplicar os da Evolution (comparando por telefone)
      const uniqueSupabaseContacts = supabaseContacts.filter(supabaseContact => 
        !contacts.some(evolutionContact => 
          evolutionContact.phone === supabaseContact.phone
        )
      );
      
      contacts = [...contacts, ...uniqueSupabaseContacts];
    }

    console.log("Total de contatos únicos recuperados:", contacts.length);
    return contacts;
  } catch (error) {
    console.error("Erro geral ao buscar contatos:", error);
    throw error;
  }
};

const fetchEvolutionContacts = async (): Promise<Contact[]> => {
  try {
    // URL da API Evolution
    const evolutionApiUrl = "https://api.evolutionapi.com.br/instances/lovechat/contact";
    
    // Usando a API key correta da Evolution API
    const apiKey = "evolution-api-key-123456"; // Substitua pelo token real da sua implementação
    
    console.log("Fazendo requisição para API Evolution:", evolutionApiUrl);
    
    const response = await fetch(evolutionApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      // Adicionando um timeout para a requisição
      signal: AbortSignal.timeout(5000) // 5 segundos de timeout
    });

    if (!response.ok) {
      console.error("Resposta da API não OK:", response.status, response.statusText);
      throw new Error(`Erro ao buscar contatos da API Evolution: ${response.status}`);
    }

    const data = await response.json();
    console.log("Formato de dados da Evolution API:", typeof data);
    
    // Verifica se a resposta tem o formato esperado
    if (!Array.isArray(data) && data.contacts && Array.isArray(data.contacts)) {
      // Se a resposta tiver uma propriedade contacts, usa ela
      return data.contacts.map(formatEvolutionContact);
    } else if (Array.isArray(data)) {
      // Se a resposta já for um array
      return data.map(formatEvolutionContact);
    } else if (typeof data === 'object' && data !== null) {
      // Tenta extrair contatos de alguma propriedade do objeto
      for (const key in data) {
        if (Array.isArray(data[key])) {
          console.log("Encontrada array em data." + key);
          return data[key].map(formatEvolutionContact);
        }
      }
    }
    
    console.log("Formato de resposta não reconhecido:", data);
    return [];
  } catch (error) {
    console.error("Erro ao buscar contatos da API Evolution:", error);
    throw error;
  }
};

const formatEvolutionContact = (contact: any): Contact => {
  // Verificando se o objeto tem as propriedades necessárias
  if (!contact) return createDummyContact();
  
  return {
    id: contact.id || contact.wa_id || `evolution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: contact.name || contact.pushname || contact.numero || contact.phone || "Sem nome",
    phone: contact.number || contact.wa_id || contact.numero || contact.phone || "",
    organization: contact.organization || contact.empresa || contact.company || "",
    user_id: "evolution_api", // Marca especial para identificar contatos da API Evolution
    created_at: new Date().toISOString(),
    last_contact: contact.last_seen || contact.ultimo_contato || ""
  };
};

// Função auxiliar para criar um contato fictício em caso de erro
const createDummyContact = (): Contact => {
  const id = `dummy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    name: "Contato Inválido",
    phone: "-",
    user_id: "evolution_api",
    created_at: new Date().toISOString()
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
