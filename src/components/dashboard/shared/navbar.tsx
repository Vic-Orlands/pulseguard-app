import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Layers,
  AlertCircle,
  GitMerge,
  AlertTriangle,
  Server,
  ChevronLeft,
  X,
  Activity
} from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import type { Alert, NavItem } from "@/types/dashboard";
import { PulseGuardLogo } from "../../Icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { getGreeting } from "@/lib/utils";

interface HeaderProps {
  alerts: Alert[];
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
}

const navItems = [
  {
    id: "overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Overview",
  },
  { id: "sessions", icon: <Layers className="h-4 w-4" />, label: "Sessions" },
  { id: "errors", icon: <AlertCircle className="h-4 w-4" />, label: "Errors" },
  { id: "logs", icon: <Activity className="h-4 w-4" />, label: "Logs" },
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
  setActiveTab,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const activeAlerts = alerts.filter((a) => a.status === "active").length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleBackToProjects = () => {
    router.push("/projects");
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {activeAlerts > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative ring-2 ring-transparent hover:ring-blue-500/20 transition-all duration-200"
              >
                {`${getGreeting()}, ${user?.name || ""}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 lg:mr-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 shadow-2xl shadow-black/50 rounded-xl"
              forceMount
              sideOffset={12}
            >
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex items-center space-x-3">
                  {user?.avatar ? (
                    <Image
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-600"
                      src={user.avatar}
                      alt={user.name}
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-600">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col space-y-1 w-35">
                    <p className="text-sm font-semibold leading-none text-white">
                      {user?.name || "Loading..."}
                    </p>
                    <p className="text-xs leading-none text-gray-400 truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-2" />

              <div className="p-2">
                <Button
                  onClick={() => router.push("/settings")}
                  variant="ghost"
                  className="w-full justify-start rounded-lg h-10 text-gray-300 hover:text-white hover:bg-gray-800/80 transition-all duration-200 group"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Account Settings</span>
                </Button>
              </div>

              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-2" />

              <div className="p-2">
                <CustomAlertDialog
                  trigger={
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-lg h-10 text-gray-300 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200 group"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Sign out</span>
                    </Button>
                  }
                  title="Leaving Already?"
                  description="Are you sure you want to leave? This will log you out of your project dashboard."
                  onConfirm={logout}
                />
              </div>
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
          ? "border-b-[2px] border-transparent border-b-blue-400 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          : "border-b border-transparent text-gray-400 hover:text-white/80"
      }`}
      onClick={onClick}
    >
      {activeTab === item.id ? (
        <div className="flex items-center">
          <svg width="0" height="0" className="absolute">
            <linearGradient id="blue-purple" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop stopColor="#2563eb" offset="0%" />
              <stop stopColor="#9333ea" offset="100%" />
            </linearGradient>
          </svg>
          <div className="[&>svg]:stroke-[url(#blue-purple)]">{item.icon}</div>
        </div>
      ) : (
        item.icon
      )}
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
          ? "bg-blue-900/40 text-white/80"
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
      className="rounded-none flex items-center gap-2 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white/80 mr-4"
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Back to Projects</span>
    </Button>
  );

  return (
    <CustomAlertDialog
      trigger={trigger}
      title="Done monitoring this project?"
      description="Are you sure? This will take you to your project dashboard."
      onConfirm={onClick}
    />
  );
}

// MobileMenu component
function MobileMenu({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onBackToProjects,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: NavItem) => void;
  onBackToProjects: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col">
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 bg-slate-950">
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

      {/* Mobile Menu Items */}
      <div className="flex flex-col p-6 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950">
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
      </div>

      {/* App Info */}
      <p className="text-center text-sm bg-slate-950 py-3">
        ©{" 0"}
        <span className="font-mono">
          {new Date().getFullYear()} PulseGuard by MezieIV
        </span>
      </p>
    </div>
  );
}
