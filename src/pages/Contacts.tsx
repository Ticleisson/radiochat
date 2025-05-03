
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone, Edit, Trash, User } from "lucide-react";
import { toast } from "sonner";
import { Contact, fetchContacts, createContact, updateContact, deleteContact } from "@/services/contactsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    organization: ""
  });
  
  const queryClient = useQueryClient();
  
  // Fetch contacts using React Query
  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
  });
  
  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsAddDialogOpen(false);
      setNewContact({ name: "", phone: "", organization: "" });
    },
  });
  
  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: ({ id, contact }: { id: string; contact: Partial<Contact> }) => 
      updateContact(id, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsEditDialogOpen(false);
      setCurrentContact(null);
    },
  });
  
  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
  
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      (contact.organization && contact.organization.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }
    
    createContactMutation.mutate(newContact);
  };
  
  const handleUpdateContact = () => {
    if (!currentContact || !currentContact.name || !currentContact.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }
    
    updateContactMutation.mutate({ 
      id: currentContact.id, 
      contact: {
        name: currentContact.name,
        phone: currentContact.phone,
        organization: currentContact.organization
      }
    });
  };
  
  const handleDeleteContact = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este contato?")) {
      deleteContactMutation.mutate(id);
    }
  };
  
  const handleEditContact = (contact: Contact) => {
    setCurrentContact(contact);
    setIsEditDialogOpen(true);
  };
  
  if (error) {
    console.error("Error fetching contacts:", error);
    toast.error("Erro ao carregar contatos. Tente novamente.");
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Contatos</h1>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-radio hover:bg-radio-light"
          >
            <Plus className="mr-1 h-4 w-4" />
            Adicionar Contato
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar contatos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Último Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Carregando contatos...
                    </TableCell>
                  </TableRow>
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.organization || "-"}</TableCell>
                      <TableCell>{contact.last_contact || "Nunca"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum contato encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      
      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Contato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <Input 
                id="phone" 
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organização (Opcional)</Label>
              <Input 
                id="organization" 
                value={newContact.organization}
                onChange={(e) => setNewContact({...newContact, organization: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button 
              className="bg-radio hover:bg-radio-light" 
              onClick={handleAddContact}
              disabled={createContactMutation.isPending}
            >
              {createContactMutation.isPending ? "Salvando..." : "Salvar Contato"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input 
                id="edit-name" 
                value={currentContact?.name || ""}
                onChange={(e) => setCurrentContact(prev => prev ? {...prev, name: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Número de Telefone</Label>
              <Input 
                id="edit-phone" 
                value={currentContact?.phone || ""}
                onChange={(e) => setCurrentContact(prev => prev ? {...prev, phone: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-organization">Organização (Opcional)</Label>
              <Input 
                id="edit-organization" 
                value={currentContact?.organization || ""}
                onChange={(e) => setCurrentContact(prev => prev ? {...prev, organization: e.target.value} : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button 
              className="bg-radio hover:bg-radio-light" 
              onClick={handleUpdateContact}
              disabled={updateContactMutation.isPending}
            >
              {updateContactMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Contacts;
