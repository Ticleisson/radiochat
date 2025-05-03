
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
