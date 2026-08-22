import { AuthGuard } from "@/lib/auth/auth-guard";
import { GroupGuard } from "@/lib/auth/group-guard";
import { AppProvider } from "@/state/app-provider";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppProvider>
        <GroupGuard>{children}</GroupGuard>
      </AppProvider>
    </AuthGuard>
  );
}
