
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Users, Settings, LogOut, Home } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const [user] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Calls", path: "/calls", icon: <Phone size={20} /> },
    { name: "Contacts", path: "/contacts", icon: <Users size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div
      className={`bg-radio text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-center border-b border-radio-light px-4">
          <div className={`flex items-center ${!isOpen && 'justify-center'}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-radio-accent text-white">
              <Phone className="h-5 w-5" />
            </div>
            <div className={`ml-2 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              <h1 className="text-lg font-bold">Radio Chat</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-4">
          <nav className="flex-1 space-y-2 px-2">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div
                  className={`flex items-center rounded-md px-3 py-2 hover:bg-radio-light ${
                    location.pathname === item.path ? "bg-radio-light" : ""
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                  </div>
                  <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                    {item.name}
                  </span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-3 py-4">
          <div className={`mb-4 flex items-center ${!isOpen && 'justify-center'}`}>
            <div className="h-8 w-8 rounded-full bg-white text-radio">
              <div className="flex h-full w-full items-center justify-center font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
            <div className={`ml-2 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              <div className="text-sm font-medium">{user?.name || "User"}</div>
              <div className="text-xs opacity-70">{user?.company || "Company"}</div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-radio-light"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className={`ml-2 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              Logout
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
