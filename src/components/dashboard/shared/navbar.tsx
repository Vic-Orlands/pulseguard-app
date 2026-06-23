"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  Alert01Icon,
  AlertCircleIcon,
  ArrowLeft01Icon,
  Cancel01Icon,
  ChartLineData02Icon,
  DashboardCircleIcon,
  GitMergeIcon,
  Layers01Icon,
  Logout01Icon,
  Menu01Icon,
  Notification01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { Server, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList } from "@/components/ui/tabs";
import type { Alert as DashboardAlert, NavItem } from "@/types/dashboard";
import { PulseGuardLogo } from "../../Icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { getGreeting, normalizePostgresString } from "@/lib/utils";
import { useTheme } from "next-themes";

interface HeaderProps {
  alerts: DashboardAlert[];
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
}

const navItems = [
  {
    id: "overview",
    icon: <HugeiconsIcon icon={DashboardCircleIcon} className="h-3.5 w-3.5" />,
    label: "Overview",
  },
  {
    id: "sessions",
    icon: <HugeiconsIcon icon={Layers01Icon} className="h-3.5 w-3.5" />,
    label: "Sessions",
  },
  {
    id: "metrics",
    icon: <HugeiconsIcon icon={ChartLineData02Icon} className="h-3.5 w-3.5" />,
    label: "Metrics",
  },
  {
    id: "errors",
    icon: <HugeiconsIcon icon={AlertCircleIcon} className="h-3.5 w-3.5" />,
    label: "Errors",
  },
  {
    id: "logs",
    icon: <HugeiconsIcon icon={Activity01Icon} className="h-3.5 w-3.5" />,
    label: "Logs",
  },
  {
    id: "traces",
    icon: <HugeiconsIcon icon={GitMergeIcon} className="h-3.5 w-3.5" />,
    label: "Traces",
  },
  {
    id: "alerts",
    icon: <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5" />,
    label: "Alerts",
  },
  {
    id: "integrations",
    icon: <Server className="h-3.5 w-3.5" />,
    label: "Integrations",
  },
  {
    id: "settings",
    icon: <HugeiconsIcon icon={Settings01Icon} className="h-3.5 w-3.5" />,
    label: "Settings",
  },
];

export default function Header({
  alerts,
  activeTab,
  setActiveTab,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const activeAlerts = alerts.filter((a) => a.status === "active").length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleBackToProjects = () => {
    router.push("/projects");
  };

  const currentUser = user && normalizePostgresString(user.avatar);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e4e4df] bg-[#f7f7f5]/90 backdrop-blur-md text-[#1d1d1b]">
      {/* Top Bar */}
      <div className="pg-shell flex items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-1 scale-[0.9] origin-left">
          <PulseGuardLogo />
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground h-8 w-8 shadow-none"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 text-muted-foreground hover:text-foreground shadow-none"
          >
            <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4" />
            {activeAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive"></span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 h-8 px-2.5 shadow-none"
              >
                {`${getGreeting()}, ${user?.name || ""}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white border border-[#dfdfda] text-[#1d1d1b] shadow-sm rounded-lg"
              forceMount
              sideOffset={8}
              align="end"
            >
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex items-center space-x-2.5">
                  {currentUser ? (
                    <Image
                      className="h-8 w-8 rounded-full object-cover border border-border"
                      src={currentUser}
                      alt={user.name}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                      <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col space-y-0.5 w-36">
                    <p className="text-xs font-semibold leading-none text-foreground truncate">
                      {user?.name || "Loading..."}
                    </p>
                    <p className="text-[10px] leading-none text-muted-foreground truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-border" />

              <div className="p-1">
                <Button
                  onClick={() => router.push("/settings")}
                  variant="ghost"
                  className="w-full justify-start rounded-md h-8 text-xs text-[#73736e] hover:text-[#1d1d1b] hover:bg-[#f7f7f5] transition-all group shadow-none cursor-pointer"
                >
                  <HugeiconsIcon icon={Settings01Icon} className="h-3.5 w-3.5 mr-2" />
                  <span className="font-medium">Account Settings</span>
                </Button>
              </div>

              <DropdownMenuSeparator className="bg-[#dfdfda]" />

              <div className="p-1">
                <CustomAlertDialog
                  trigger={
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md h-8 text-xs text-[#73736e] hover:text-destructive hover:bg-destructive/10 transition-all group shadow-none cursor-pointer"
                    >
                      <HugeiconsIcon icon={Logout01Icon} className="h-3.5 w-3.5 mr-2" />
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
            size="icon"
            className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground shadow-none"
            onClick={toggleMobileMenu}
          >
            <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex border-t border-[#dfdfda] overflow-x-auto bg-transparent">
        <div className="pg-shell flex px-6">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="bg-transparent p-0 h-auto w-full space-x-1 justify-start">
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
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
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
        )}
      </AnimatePresence>
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
  const isActive = activeTab === item.id;
  return (
    <Button
      variant="ghost"
      className={`rounded-none flex items-center px-3 py-2 text-xs font-medium border-b-2 transition-all duration-75 h-9 shadow-none cursor-pointer ${
        isActive
          ? "border-[#ff5a1f] text-[#1d1d1b] bg-[#f7f7f5]/40 font-semibold"
          : "border-transparent text-[#73736e] hover:text-[#1d1d1b] hover:bg-[#f7f7f5]/40"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5">
        <div className="flex-shrink-0 text-current">{item.icon}</div>
        <span>{item.label}</span>
      </div>
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
      className="w-full justify-start text-xs py-2 mb-2 text-[#73736e] hover:bg-[#f7f7f5] hover:text-[#1d1d1b] shadow-none cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        <span>Back to Projects</span>
      </div>
    </Button>
  ) : (
    <Button
      variant="ghost"
      className="rounded-none flex items-center gap-1.5 py-2 text-xs font-medium border-b-2 border-transparent text-[#73736e] hover:text-[#1d1d1b] hover:bg-[#f7f7f5]/40 mr-4 h-9 shadow-none cursor-pointer"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="h-3.5 w-3.5" />
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="md:hidden fixed inset-0 z-50 flex flex-col bg-background text-foreground"
    >
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <div className="w-3 h-3 bg-background rounded-full"></div>
            </div>
          </div>
          <span className="text-xs font-bold text-foreground">PulseGuard</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="border border-border text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 shadow-none"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Menu Items */}
      <div className="flex flex-col p-4 bg-card flex-grow overflow-y-auto">
        <div className="mb-2">
          <BackToProjectButton isMobile onClick={onBackToProjects} />
        </div>

        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start text-xs py-2 mb-1.5 h-10 shadow-none ${
              activeTab === item.id
                ? "bg-accent text-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            onClick={() => onTabChange(item.id as NavItem)}
          >
            <div className="flex items-center gap-3">
              <span className="text-current">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* App Info */}
      <div className="text-center text-[10px] bg-card border-t border-border py-3 text-muted-foreground">
        © {new Date().getFullYear()} PulseGuard by MezieIV
      </div>
    </motion.div>
  );
}
