import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { TopBar } from "@/components/top-bar/top-bar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TopBar />
      {/* top margin to account for the top bar & bottom margin for the bottom navigation */}
      <div className="mt-16 mb-16">{children}</div>
      <BottomNavigation />
    </>
  );
}
