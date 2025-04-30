
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Users, Clock, Plus, Video, Mic } from "lucide-react";
import ActiveCallCard from "@/components/calls/ActiveCallCard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Demo data
  const recentCalls = [
    { id: "1", name: "Morning Show Interview", participants: 3, duration: "45:22", date: "Today, 8:30 AM", status: "completed" },
    { id: "2", name: "News Update", participants: 2, duration: "12:14", date: "Yesterday, 6:15 PM", status: "completed" },
    { id: "3", name: "Sports Roundup", participants: 4, duration: "32:56", date: "Apr 28, 2025", status: "completed" },
  ];
  
  const activeCalls = [
    { 
      id: "active1", 
      name: "Live Interview", 
      participants: [
        { id: "p1", name: "John Smith", status: "connected" as "connected", audio: true, video: false },
        { id: "p2", name: "Maria Garcia", status: "connecting" as "connecting", audio: false, video: false },
      ], 
      startTime: new Date(Date.now() - 15 * 60000), // 15 minutes ago
      type: "audio" as "audio" | "video"
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/new-call")}
              className="bg-radio hover:bg-radio-light"
            >
              <Plus className="mr-1 h-4 w-4" />
              New Call
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{activeCalls.length}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">24</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Call Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">42.5</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Calls</TabsTrigger>
            <TabsTrigger value="recent">Recent Calls</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeCalls.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeCalls.map((call) => (
                  <ActiveCallCard key={call.id} call={call} />
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <Phone className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No active calls</h3>
                  <p className="text-sm text-muted-foreground">Start a new call to connect with participants.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate("/new-call")}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    New Call
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 bg-muted p-4 text-xs font-medium text-muted-foreground">
                      <div>Name</div>
                      <div>Date</div>
                      <div className="text-center">Participants</div>
                      <div className="text-center">Duration</div>
                      <div className="text-right">Actions</div>
                    </div>
                    {recentCalls.map((call) => (
                      <div key={call.id} className="grid grid-cols-5 items-center border-t p-4 text-sm">
                        <div className="font-medium">{call.name}</div>
                        <div className="text-muted-foreground">{call.date}</div>
                        <div className="text-center">{call.participants}</div>
                        <div className="text-center">{call.duration}</div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
