import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { TopBar } from "@/components/top-bar/top-bar";
import { UIProvider } from "@/lib/ui-context";
import { LayoutContent } from "@/components/ui/layout-content";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UIProvider>
      <TopBar />
      <LayoutContent>{children}</LayoutContent>
      <BottomNavigation />
    </UIProvider>
  );
}
