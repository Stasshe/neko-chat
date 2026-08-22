import { ComposeSheet } from "@/components/compose-sheet";
import { BottomTabBar } from "@/components/navigation";
import { RouteTransition, TabTransitionProvider } from "@/components/route-transition";
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
        <TabTransitionProvider>
          <RouteTransition>{children}</RouteTransition>
          <BottomTabBar />
          <ComposeSheet />
        </TabTransitionProvider>
      </AppProvider>
    </AuthGuard>
  );
}
