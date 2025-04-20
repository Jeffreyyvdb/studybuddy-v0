"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
  navBarsVisible: boolean;
  hideNavBars: () => void;
  showNavBars: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [navBarsVisible, setNavBarsVisible] = useState(true);

  const hideNavBars = () => setNavBarsVisible(false);
  const showNavBars = () => setNavBarsVisible(true);

  return (
    <UIContext.Provider value={{ navBarsVisible, hideNavBars, showNavBars }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}