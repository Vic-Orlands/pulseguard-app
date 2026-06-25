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
import { Server, Sun, Moon, Building, Key, Eye, EyeOff, Copy, RefreshCw, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList } from "@/components/ui/tabs";
import type { Alert as DashboardAlert, NavItem, Project } from "@/types/dashboard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getGreeting, normalizePostgresString } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Logo } from "@/app/(auth)/signin/page";

interface HeaderProps {
  alerts: DashboardAlert[];
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  project: Project;
}

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "sessions", label: "Sessions" },
  { id: "metrics", label: "Metrics" },
  { id: "errors", label: "Errors" },
  { id: "logs", label: "Logs" },
  { id: "traces", label: "Traces" },
  { id: "alerts", label: "Alerts" },
  { id: "integrations", label: "Integrations" },
  { id: "settings", label: "Settings" }
];

export default function Header({
  alerts,
  activeTab,
  setActiveTab,
  project,
}: HeaderProps) {
  const { user, logout, workspaces, activeWorkspace, setActiveWorkspace } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const activeAlerts = alerts.filter((a) => a.status === "active").length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Switcher & Integration Key Modal States
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(`pg_live_7a398be8e244f0b2a991c0e3a98dbcc21e${project.id.slice(-4)}`);
  const [showModalApiKey, setShowModalApiKey] = useState(false);
  const [isApiKeyCopied, setIsApiKeyCopied] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [modalCodeTab, setModalCodeTab] = useState<'curl' | 'node' | 'python'>('curl');

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleBackToProjects = () => {
    router.push("/projects");
  };

  const currentUser = user && normalizePostgresString(user.avatar);

  const getCodeSnippet = () => {
    switch (modalCodeTab) {
      case 'node':
        return `const PulseGuard = require('@pulseguard/node');\nconst client = new PulseGuard({\n  apiKey: '${apiKey}',\n  projectId: '${project.id}'\n});\n\nclient.captureMessage('Server started');`;
      case 'python':
        return `import pulseguard\n\npulseguard.init(\n    api_key="${apiKey}",\n    project_id="${project.id}"\n)\n\npulseguard.capture_message("Server started")`;
      default:
        return `curl -X POST https://api.pulseguard.dev/v1/telemetry \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"project_id": "${project.id}", "level": "info", "message": "Ping check"}'`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/60 bg-[#09090b]/70 backdrop-blur-md text-white select-none">
      {/* 1. Main Navbar Header */}
      <div className="pg-shell flex items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleBackToProjects}>
            {/* Logo */}
            <div className="scale-[0.8] origin-left pt-6">
              <Logo />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white font-sans">PulseGuard</span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Org & Team Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-900 transition-colors text-[11px] font-mono text-zinc-400 hover:text-white cursor-pointer focus:outline-none"
                id="org-switcher-button"
              >
                <Building className="w-3 h-3 text-zinc-500" />
                <span>{activeWorkspace?.name || "Workspace"}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-300 font-medium">{project.name}</span>
                <ChevronDown className="w-3 h-3 text-zinc-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60 bg-[#121212] border border-zinc-800 text-white rounded-lg shadow-xl p-2.5 z-50 text-left"
              align="start"
            >
              <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider px-2 py-1 mb-2 border-b border-zinc-800/40">
                Switch Workspace
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      router.push("/projects");
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                      activeWorkspace?.id === ws.id 
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                        : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
                    }`}
                  >
                    <span>{ws.name}</span>
                    {activeWorkspace?.id === ws.id && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
                  </button>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-zinc-850/60" />
              <button
                onClick={() => router.push("/onboarding")}
                className="w-full text-left rounded px-2.5 py-1.5 text-xs text-orange-400 hover:bg-orange-500/10 transition-all flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Workspace
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side header items */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400 hover:text-white cursor-pointer hidden lg:inline-block font-sans transition-colors">
            Discover
          </span>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-7.5 h-7.5 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer bg-transparent"
              title={`Switch theme`}
              id="dashboard-theme-toggle"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          )}

          <button
            onClick={() => setIsCliModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 h-7.5 px-2.5 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs font-mono cursor-pointer bg-transparent"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>Get integration key</span>
          </button>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-7.5 h-7.5 rounded-full overflow-hidden border border-zinc-800 hover:border-zinc-500 cursor-pointer focus:outline-none transition-colors"
                id="user-menu-avatar"
              >
                {currentUser ? (
                  <img src={currentUser} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-emerald-500 text-zinc-950 font-mono">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 bg-[#121212] border border-zinc-800 rounded-lg shadow-xl p-1 z-50 text-left text-white"
              align="end"
              forceMount
            >
              <div className="p-2 border-b border-zinc-800/60">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">{user?.email || ''}</p>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-left cursor-pointer font-sans bg-transparent border-0"
                >
                  <HugeiconsIcon icon={UserIcon} className="w-3.5 h-3.5 text-zinc-500" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-left cursor-pointer font-sans bg-transparent border-0"
                >
                  <HugeiconsIcon icon={Settings01Icon} className="w-3.5 h-3.5 text-zinc-500" />
                  <span>System Settings</span>
                </button>

                <div className="h-px bg-zinc-800/80 my-1" />

                <CustomAlertDialog
                  trigger={
                    <button
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors text-left cursor-pointer font-mono bg-transparent border-0"
                    >
                      <HugeiconsIcon icon={Logout01Icon} className="w-3.5 h-3.5 text-red-500" />
                      <span>Disarm Session</span>
                    </button>
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
            className="md:hidden h-8 w-8 text-zinc-400 hover:text-white shadow-none"
            onClick={toggleMobileMenu}
          >
            <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2. High-fidelity horizontal sub-navigation bar */}
      <div className="w-full border-t border-zinc-800/60 bg-[#09090b]/70 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center h-full text-xs font-mono">
            {/* Back to Projects button */}
            <BackToProjectButton onClick={handleBackToProjects} />

            {/* Navigation Tabs */}
            <div className="flex items-center h-full gap-1 sm:gap-2 text-xs font-sans font-medium">
              {navItems.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`h-7 px-2.5 flex items-center justify-center transition-all cursor-pointer rounded text-[11px] shrink-0 border bg-transparent ${
                      isSelected 
                        ? 'border-orange-500/80 text-orange-400 bg-orange-500/5 font-semibold shadow-sm shadow-orange-950/20' 
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status badge */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-zinc-500 shrink-0 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Pipeline Active</span>
          </div>
        </div>
      </div>

      {/* 3. Get Integration Key Modal */}
      <AnimatePresence>
        {isCliModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsCliModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#121212] border border-zinc-800 bg-dot-pattern rounded-xl max-w-lg w-full relative overflow-hidden z-10 text-left shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/30 pointer-events-none" />

              <div className="p-6 relative z-10 space-y-4">
                <button
                  onClick={() => setIsCliModalOpen(false)}
                  className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer z-20 bg-transparent border-0"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Access Authorization</span>
                  <h3 className="text-base font-bold text-white font-sans">Workspace Integration Key</h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Use this private API key to connect external pipelines, export traces, or configure custom code SDKs to stream live telemetry logs.
                  </p>
                </div>

                {/* API Key Panel */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">Active Integration Key:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-between bg-zinc-950 border border-zinc-800 text-zinc-300 px-3 py-2 rounded font-mono text-xs relative overflow-hidden">
                      <input
                        type={showModalApiKey ? "text" : "password"}
                        value={apiKey}
                        readOnly
                        className="bg-transparent border-none text-zinc-300 font-mono w-full pr-12 focus:outline-none select-all text-xs"
                      />
                      <div className="absolute right-2 top-1.5 flex items-center gap-1.5 bg-zinc-950 pl-2">
                        <button
                          type="button"
                          onClick={() => setShowModalApiKey(!showModalApiKey)}
                          className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer bg-transparent border-0"
                          title={showModalApiKey ? "Hide API key" : "Show API key"}
                        >
                          {showModalApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                            setIsApiKeyCopied(true);
                            setTimeout(() => setIsApiKeyCopied(false), 2000);
                          }}
                          className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer bg-transparent border-0"
                          title="Copy to clipboard"
                        >
                          {isApiKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsRegeneratingKey(true);
                        setTimeout(() => {
                          const chars = '0123456789abcdef';
                          let randomSuffix = '';
                          for (let i = 0; i < 32; i++) {
                            randomSuffix += chars[Math.floor(Math.random() * 16)];
                          }
                          setApiKey(`pg_live_${randomSuffix}`);
                          setIsRegeneratingKey(false);
                        }, 1000);
                      }}
                      disabled={isRegeneratingKey}
                      className="h-9.5 px-3 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                      title="Generate a new random API key"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${isRegeneratingKey ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{isRegeneratingKey ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">How to integrate in your project:</span>
                    <div className="flex bg-zinc-950 border border-zinc-800 text-zinc-400 p-0.5 rounded font-mono text-[9px] font-medium">
                      {[
                        { id: 'curl', label: 'cURL' },
                        { id: 'node', label: 'Node.js' },
                        { id: 'python', label: 'Python' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModalCodeTab(tab.id as any)}
                          className={`px-2 py-0.5 rounded cursor-pointer transition-colors border-0 ${
                            modalCodeTab === tab.id ? 'bg-zinc-800 text-white font-semibold' : 'hover:text-zinc-200 bg-transparent'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded p-3 font-mono text-[10.5px] text-zinc-300 overflow-x-auto max-h-36 whitespace-pre">
                    {getCodeSnippet()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

// BackToProjectButton
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
      className="w-full justify-start text-xs py-2 mb-2 text-zinc-400 hover:bg-zinc-900 hover:text-white shadow-none cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        <span>Back to Projects</span>
      </div>
    </Button>
  ) : (
    <button
      className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 border-zinc-800/80 mr-4 h-full pr-4 border-r transition-colors cursor-pointer shrink-0 bg-transparent"
    >
      <ChevronRight className="w-3.5 h-3.5 rotate-180 text-zinc-600" />
      <span className="font-sans text-[11px]">Back to Projects</span>
    </button>
  );

  return (
    <CustomAlertDialog
      trigger={trigger}
      title="Done monitoring this project?"
      description="Are you sure? This will take you back to your project list."
      onConfirm={onClick}
    />
  );
}

// MobileMenu
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
      className="md:hidden fixed inset-0 z-50 flex flex-col bg-[#09090b] text-white"
    >
      <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <div className="scale-[0.6] origin-left pt-6">
            <Logo />
          </div>
          <span className="text-xs font-bold text-white">PulseGuard</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 w-8 shadow-none"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col p-4 bg-[#0a0a0a] flex-grow overflow-y-auto">
        <div className="mb-2">
          <BackToProjectButton isMobile onClick={onBackToProjects} />
        </div>

        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start text-xs py-2 mb-1.5 h-10 shadow-none ${
              activeTab === item.id
                ? "bg-zinc-900 text-white font-semibold"
                : "text-zinc-400 hover:bg-zinc-950 hover:text-white"
            }`}
            onClick={() => onTabChange(item.id as NavItem)}
          >
            <div className="flex items-center gap-3">
              <span>{item.label}</span>
            </div>
          </Button>
        ))}
      </div>

      <div className="text-center text-[10px] bg-[#0a0a0a] border-t border-zinc-800 py-3 text-zinc-500">
        © {new Date().getFullYear()} PulseGuard
      </div>
    </motion.div>
  );
}
