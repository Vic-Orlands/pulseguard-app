import {
  Sun,
  Bell,
  Moon,
  HeartPulse,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const tabList = [
  "sessions",
  "errors",
  "logs",
  "traces",
  "dashboards",
  "alerts",
  "integrations",
  "connect",
];

function Navbar() {
  return (
    <>
      <header className="bg-background text-foreground">
        <div className="container mx-auto flex items-center justify-between h-14">
          <h1 className="flex items-center space-x-1 font-semibold">
            <span className="w-5 h-5 flex items-center justify-center mr-1">
              <HeartPulse />
            </span>
            PulseGuard
          </h1>

          <div className="flex items-center space-x-2">
            <button
              className="rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:bg-sidebar-hover transition-colors"
              //   aria-label={
              //     isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              //   }
            >
              {/* {isDarkMode ? <Sun size={20} /> :*/}
              <Moon size={20} />
              {/* } */}
            </button>
            <button className="p-2 rounded hover:bg-gray-100">
              <Bell size={20} />
              {/* {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-accent-red rounded-full"></span>
              )} */}
            </button>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <section className="mb-4 border-b border-gray-300">
        <div className="container mx-auto">
          {/* <Tabs defaultValue="logs" className="w-full"> */}
          <TabsList className="flex h-full space-x-4">
            {tabList.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="cursor-pointer data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-none text-zinc-500 data-[state=active]:text-gray-900"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* </Tabs> */}
        </div>
      </section>
    </>
  );
}

export default Navbar;
