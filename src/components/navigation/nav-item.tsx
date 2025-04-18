import Link from "next/link";
import React from "react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

export function NavItem({ href, icon, label, isActive = false }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={`flex flex-col items-center justify-center h-full ${
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-primary transition-colors"
        }`}
      >
        {icon}
        <span className="text-xs font-medium mt-1">{label}</span>
      </Link>
    </li>
  );
}
