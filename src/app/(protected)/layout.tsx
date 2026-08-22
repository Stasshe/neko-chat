import { ComposeSheet } from "@/components/compose-sheet";
import { BottomTabBar } from "@/components/navigation";
import { RouteTransition } from "@/components/route-transition";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { AppProvider } from "@/state/app-provider";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppProvider>
        <RouteTransition>{children}</RouteTransition>
        <BottomTabBar />
        <ComposeSheet />
      </AppProvider>
    </AuthGuard>
  );
}
