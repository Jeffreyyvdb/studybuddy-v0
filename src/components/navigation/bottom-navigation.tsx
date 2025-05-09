"use client";

import { usePathname } from "next/navigation";
import { NavItem } from "./nav-item";
import { User, Bot, GraduationCap, Gamepad } from "lucide-react";
import { ModeToggle } from "../ui/mode-toggle";
import { useUI } from "@/lib/ui-context";

const navItems = [
  {
    href: "/learn",
    label: "Learn",
    icon: <GraduationCap className="h-5 w-5"> </GraduationCap>,
  },
  {
    href: "/chat",
    label: "Buddy",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    href: "/game",
    label: "Game",
    icon: <Gamepad className="h-5 w-5" />,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { navBarsVisible } = useUI();

  // Don't render the BottomNavigation if it should be hidden
  if (!navBarsVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-10">
      <nav className="h-16 max-w-screen-lg mx-auto px-4">
        <ul className="flex items-center justify-around h-full">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </ul>
        <ModeToggle />
      </nav>
    </div>
  );
}
