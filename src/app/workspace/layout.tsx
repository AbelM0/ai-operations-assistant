import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="bg-[#050505]">
      {children}
    </SidebarProvider>
  );
}
