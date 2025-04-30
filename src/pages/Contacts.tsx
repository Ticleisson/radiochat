
import { useState } from "react";
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

interface Contact {
  id: string;
  name: string;
  phone: string;
  organization: string;
  lastContact?: string;
}

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    organization: ""
  });
  
  // Mock contacts data
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Maria Silva", phone: "+55 11 99999-8888", organization: "Daily News", lastContact: "Apr 28, 2025" },
    { id: "2", name: "João Santos", phone: "+55 11 97777-6666", organization: "Sports Tribune", lastContact: "Apr 25, 2025" },
    { id: "3", name: "Ana Costa", phone: "+55 11 96666-5555", organization: "City Hall", lastContact: "Apr 22, 2025" },
    { id: "4", name: "Carlos Oliveira", phone: "+55 11 95555-4444", organization: "Local Business Association" },
    { id: "5", name: "Paula Souza", phone: "+55 11 94444-3333", organization: "University" },
  ]);
  
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and phone are required");
      return;
    }
    
    const newId = (contacts.length + 1).toString();
    setContacts([
      ...contacts,
      {
        id: newId,
        name: newContact.name,
        phone: newContact.phone,
        organization: newContact.organization
      }
    ]);
    
    setNewContact({ name: "", phone: "", organization: "" });
    setIsAddDialogOpen(false);
    toast.success("Contact added successfully");
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-radio hover:bg-radio-light"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Contact
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.organization}</TableCell>
                      <TableCell>{contact.lastContact || "Never"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No contacts found.
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
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization (Optional)</Label>
              <Input 
                id="organization" 
                value={newContact.organization}
                onChange={(e) => setNewContact({...newContact, organization: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button className="bg-radio hover:bg-radio-light" onClick={handleAddContact}>Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Contacts;
