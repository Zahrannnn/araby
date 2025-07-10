import { SuperAdminSidebar } from "@/components/ui/super-admin-sidebar"

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function SuperAdminLayout({
  children,
  params,
}: SuperAdminLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex h-screen bg-background">
      <SuperAdminSidebar locale={locale} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}