"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function WorkspaceSidebar({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isLoaded, user } = useUser();
  const emailAddress =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/8 bg-[#08080A]/95 text-white backdrop-blur-xl"
    >
      <SidebarHeader className="border-b border-white/8 px-4 py-[23.5px] group-data-[collapsible=icon]:px-2">
        <Link
          href="/"
          className="flex w-fit items-center gap-2.5 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          aria-label={t("nav.homeAria")}
        >
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
          <span className="text-sm font-semibold tracking-[0.17em] text-white group-data-[collapsible=icon]:hidden">
            NEXUS<span className="text-[#71717A]">/OPS</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">{children}</SidebarContent>

      <SidebarFooter className="border-t border-white/[0.07] bg-[#08080A]/95 px-2.5 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<div />}
              size="lg"
              tooltip={emailAddress ?? t("nav.account")}
              className="min-h-14 gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2.5 text-[#D4D4D8] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-[#2DD4BF]/25 hover:bg-[#2DD4BF]/[0.055] hover:text-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.045)] active:translate-y-px group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:min-h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0!"
            >
              <UserButton
                appearance={{
                  elements: {
                    userButtonBox: "h-9 w-9 shrink-0 rounded-lg",
                    avatarBox:
                      "h-9 w-9 rounded-lg ring-1 ring-white/10 shadow-[0_6px_18px_rgba(0,0,0,0.28)]",
                    userButtonTrigger:
                      "rounded-lg transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] focus:ring-2 focus:ring-[#5EEAD4] focus:ring-offset-2 focus:ring-offset-[#08080A]",
                  },
                }}
              />
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                {isLoaded ? (
                  <span
                    className="block truncate text-[13px] font-medium tracking-[-0.01em] text-[#E4E4E7]"
                    title={emailAddress}
                  >
                    {emailAddress ?? t("nav.account")}
                  </span>
                ) : (
                  <span
                    className="block h-3.5 w-28 animate-pulse rounded-sm bg-white/[0.08]"
                    aria-label={t("nav.account")}
                  />
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
