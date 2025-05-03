
import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, MicOff } from "lucide-react";

export const QuickActions = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="justify-start">
          <Bell className="mr-2 h-4 w-4" />
          Alert All
        </Button>
        <Button variant="outline" className="justify-start">
          <MessageSquare className="mr-2 h-4 w-4" />
          Message
        </Button>
        <Button variant="outline" className="justify-start">
          <MicOff className="mr-2 h-4 w-4" />
          Mute All
        </Button>
      </div>
    </div>
  );
};
