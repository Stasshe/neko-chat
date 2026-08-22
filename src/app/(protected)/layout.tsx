import { ComposeSheet } from "@/components/compose-sheet";
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
        {children}
        <ComposeSheet />
      </AppProvider>
    </AuthGuard>
  );
}
