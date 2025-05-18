import React, { useState } from "react";
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
import { CustomAlertDialog } from "@/components/dashboard/custom-alert-dialog";
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
  ChevronLeft,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { Alert, NavItem } from "@/types/dashboard";
import { PulseGuardLogo } from "../Icons";

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
  { id: "errors", icon: <AlertCircle className="h-4 w-4" />, label: "Errors" },
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
  { id: "settings", icon: <Settings className="h-4 w-4" />, label: "Settings" },
];

export default function Header({
  alerts,
  activeTab,
  searchQuery,
  setActiveTab,
  setSearchQuery,
}: HeaderProps) {
  const activeAlerts = alerts.filter((a) => a.status === "active").length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleBackToProjects = () => {
    window.location.href = "/projects";
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-black/30 border-b border-blue-900/40">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <PulseGuardLogo />
          <span className="text-xl font-bold">PulseGuard</span>
        </div>

        <div className="flex items-center gap-2">
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
              className="border border-blue-900/40"
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

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex px-6 border-t border-blue-900/40 overflow-x-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="bg-transparent p-0 h-auto w-full space-x-2 justify-start">
            <BackToProjectButton
              isMobile={false}
              onClick={handleBackToProjects}
            />
            {navItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                activeTab={activeTab}
                onClick={() => setActiveTab(item.id as NavItem)}
              />
            ))}
          </TabsList>
        </Tabs>
      </nav>

      {/* Mobile Navigation */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={toggleMobileMenu}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onTabChange={(tab) => {
          setActiveTab(tab);
          toggleMobileMenu();
        }}
        onBackToProjects={handleBackToProjects}
      />
    </header>
  );
}

// Reusable NavButton component
function NavButton({
  item,
  activeTab,
  onClick,
}: {
  item: { id: string; icon: React.ReactNode; label: string };
  activeTab: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className={`rounded-none flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
        activeTab === item.id
          ? "border-blue-500 text-white"
          : "border-transparent text-gray-400 hover:text-white"
      }`}
      onClick={onClick}
    >
      {item.icon}
      <span>{item.label}</span>
    </Button>
  );
}

// BackToProjectButton component
function BackToProjectButton({
  isMobile = false,
  onClick,
}: {
  isMobile?: boolean;
  onClick: () => void;
}) {
  const trigger = isMobile ? (
    <Button
      variant="ghost"
      className={`w-full justify-start text-lg py-4 mb-2 ${
        false
          ? "bg-blue-900/40 text-white"
          : "text-gray-300 hover:bg-gray-800/70"
      }`}
    >
      <div className="flex items-center gap-4">
        <ChevronLeft className="h-5 w-5" />
        <span>Back to Projects</span>
      </div>
    </Button>
  ) : (
    <Button
      variant="ghost"
      className="rounded-none flex items-center gap-2 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white mr-4"
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Back to Projects</span>
    </Button>
  );

  return (
    <CustomAlertDialog
      trigger={trigger}
      title="Leaving Already?"
      description="Are you sure you want to leave? This will log you out and take you back to your project dashboard."
      onConfirm={onClick}
    />
  );
}

// MobileMenu component
function MobileMenu({
  isOpen,
  onClose,
  activeTab,
  searchQuery,
  onSearchChange,
  onTabChange,
  onBackToProjects,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: NavItem) => void;
  onBackToProjects: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col">
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 border-b border-blue-900/40 bg-black">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-80"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold">PulseGuard</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-blue-900/20 hover:bg-blue-900/30"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Search */}
      <div className="p-4 bg-black">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search errors, sessions..."
            className="pl-10 w-full bg-black/70 border border-blue-900/40"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Menu Items */}
      <div className="flex flex-col p-2 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <BackToProjectButton isMobile onClick={onBackToProjects} />
        </motion.div>

        {navItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
          >
            <Button
              variant="ghost"
              className={`w-full justify-start text-lg py-4 mb-2 ${
                activeTab === item.id
                  ? "bg-blue-900/40 text-white"
                  : "text-gray-300 hover:bg-gray-800/70"
              }`}
              onClick={() => onTabChange(item.id as NavItem)}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Button>
          </motion.div>
        ))}

        {/* Additional Mobile Menu Options */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (navItems.length + 1) * 0.1 }}
          className="mt-4 pt-4 border-t border-blue-900/40"
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-lg py-4 mb-2 text-gray-300 hover:bg-gray-800/70"
          >
            <div className="flex items-center gap-4">
              <User className="h-5 w-5" />
              <span>Profile Settings</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-lg py-4 mb-2 text-gray-300 hover:bg-gray-800/70"
          >
            <div className="flex items-center gap-4">
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </div>
          </Button>
        </motion.div>
      </div>

      {/* App Info */}
      <div className="mt-auto p-4 text-gray-400 text-center text-sm bg-black">
        <p>PulseGuard v2.5.3</p>
        <p className="mt-1">© 2025 PulseGuard Technologies</p>
      </div>
    </div>
  );
}
