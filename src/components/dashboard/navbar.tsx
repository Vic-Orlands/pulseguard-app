import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Layers,
  AlertCircle,
  FileText,
  GitMerge,
  AlertTriangle,
  Server,
} from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { Alert, NavItem } from "@/types/dashboard";

interface HeaderProps {
  alerts: Alert[];
  activeTab: NavItem;
  searchQuery: string;
  setActiveTab: (tab: NavItem) => void;
  setSearchQuery: (query: string) => void;
}

const navItems = [
  {
    id: "overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Overview",
  },
  { id: "sessions", icon: <Layers className="h-4 w-4" />, label: "Sessions" },
  {
    id: "errors",
    icon: <AlertCircle className="h-4 w-4" />,
    label: "Errors",
  },
  { id: "logs", icon: <FileText className="h-4 w-4" />, label: "Logs" },
  { id: "traces", icon: <GitMerge className="h-4 w-4" />, label: "Traces" },
  {
    id: "alerts",
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Alerts",
  },
  {
    id: "integrations",
    icon: <Server className="h-4 w-4" />,
    label: "Integrations",
  },
  {
    id: "settings",
    icon: <Settings className="h-4 w-4" />,
    label: "Settings",
  },
];

export default function Header({
  alerts,
  activeTab,
  searchQuery,
  setActiveTab,
  setSearchQuery,
}: HeaderProps) {
  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-black/30 border-b border-blue-900/40">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <motion.div
              className="relative"
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-80"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
            </motion.div>
            <span className="text-xl font-bold ml-2">PulseGuard</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search errors, sessions..."
              className="pl-10 w-64 bg-black/30 border border-blue-900/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {activeAlerts > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">John Doe</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-900 border border-blue-900/40"
            >
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-blue-900/40" />
              <DropdownMenuItem className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav className="flex px-6 border-t border-blue-900/40 overflow-x-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="bg-transparent p-0 h-auto w-full space-x-2 justify-start">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`rounded-none flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === item.id
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab(item.id as NavItem)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </TabsList>
        </Tabs>
      </nav>
    </header>
  );
}
