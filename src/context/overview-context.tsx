import type { Alert, Error as ErrorType, NavItem } from "@/types/dashboard";
import { createContext, useContext } from "react";

interface OverviewContextProps {
  alerts: Alert[];
  errors: ErrorType[];
  setActiveTab?: (tab: NavItem) => void;
}

const OverviewContext = createContext<OverviewContextProps | undefined>(
  undefined
);

export const useOverviewContext = () => {
  const ctx = useContext(OverviewContext);
  if (!ctx)
    throw new Error("useOverviewContext must be used inside OverviewProvider");
  return ctx;
};

export const OverviewProvider = ({
  children,
  alerts,
  errors,
  setActiveTab,
}: React.PropsWithChildren<OverviewContextProps>) => (
  <OverviewContext.Provider value={{ alerts, errors, setActiveTab }}>
    {children}
  </OverviewContext.Provider>
);
