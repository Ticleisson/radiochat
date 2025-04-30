
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar = ({ toggleSidebar }: TopBarProps) => {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            <Menu size={20} />
          </Button>
          
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-72 pl-10"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <div className="hidden items-center space-x-2 sm:flex">
            <div className="live-indicator"></div>
            <span className="text-xs font-medium text-red-600">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
