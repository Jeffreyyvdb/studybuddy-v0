"use client";

import { usePathname } from "next/navigation";
import { NavItem } from "./nav-item";
import { User, Bot, Home } from "lucide-react";
import { ModeToggle } from "../ui/mode-toggle";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="h-5 w-5"> </Home>,
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
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-10">
      <nav className="h-16 max-w-screen-lg mx-auto  px-4">
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
