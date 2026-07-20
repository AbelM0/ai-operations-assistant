import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Operations Assistant — Intelligent Document Processing for SMEs",
  description:
    "Upload invoices, receipts, and business documents. Ask questions in English or Amharic. Get instant AI-powered insights for your Ethiopian business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#2DD4BF",
              colorBackground: "#111113",
              colorForeground: "#F4F4F5",
              colorMutedForeground: "#A1A1AA",
              colorInputForeground: "#F4F4F5",
              colorInput: "#0B0B0D",
              colorBorder: "rgba(255, 255, 255, 0.1)",
              borderRadius: "0.625rem",
              fontFamily: "var(--font-outfit)",
            },
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none",
              card: "w-full !bg-[#111113] border border-white/10 rounded-xl shadow-[0_28px_90px_rgba(0,0,0,0.42)]",
              header: "text-left",
              headerTitle: "font-sans !text-white text-3xl tracking-[-0.035em]",
              headerSubtitle: "!text-[#A1A1AA] leading-6",
              socialButtonsBlockButton: "border border-white/10 !bg-[#0B0B0D] hover:!bg-[#18181B] rounded-lg h-11",
              socialButtonsBlockButtonText: "font-sans !text-[#D4D4D8]",
              dividerLine: "!bg-white/8",
              dividerText: "!text-[#52525B] font-mono text-[10px] uppercase tracking-[0.14em]",
              formFieldLabel: "!text-[#D4D4D8] font-sans font-medium",
              formFieldInput: "!bg-[#0B0B0D] border !border-white/10 !text-white rounded-lg placeholder:!text-[#52525B] h-11 focus:!border-[#2DD4BF]/60",
              formButtonPrimary: "!bg-[#2DD4BF] !text-[#04100E] hover:!bg-[#5EEAD4] rounded-lg h-11 font-sans font-semibold shadow-none",
              footerActionText: "!text-[#A1A1AA]",
              footerActionLink: "!text-[#5EEAD4] hover:!text-[#99F6E4] font-sans font-semibold",
              footer: "!bg-[#111113]",
              userButtonPopoverCard: "!border !border-white/10 !bg-[#111113] shadow-[0_22px_70px_rgba(0,0,0,0.5)]",
              userButtonPopoverMain: "!bg-[#111113]",
              userPreviewMainIdentifier: "!text-white",
              userPreviewMainIdentifierText: "!text-white",
              userPreviewSecondaryIdentifier: "!text-[#A1A1AA]",
              userButtonPopoverActionButton: "!text-[#D4D4D8] hover:!bg-[#18181B]",
              userButtonPopoverActionButtonIconBox: "!text-[#71717A]",
              userButtonPopoverActionButtonIcon: "!text-[#71717A]",
              userButtonPopoverFooter: "!border-t !border-white/8 !bg-[#0B0B0D] [&_*]:!text-[#71717A]",
              userButtonPopoverFooterPagesLink: "!text-[#A1A1AA] hover:!text-white",
              modalBackdrop: "!bg-black/75 backdrop-blur-sm",
              modalContent: "!border !border-white/10 !bg-[#111113] shadow-[0_32px_120px_rgba(0,0,0,0.7)]",
              modalCloseButton: "!text-[#71717A] hover:!bg-[#18181B] hover:!text-white",
              scrollBox: "!bg-[#111113] !text-[#E4E4E7]",
              navbar: "!border-r !border-white/8 !bg-[#0B0B0D] [&_h1]:!text-white [&_p]:!text-[#71717A]",
              navbarButton: "!text-[#A1A1AA] hover:!bg-[#18181B] hover:!text-white [&.cl-active]:!bg-[#2DD4BF]/10 [&.cl-active]:!text-[#2DD4BF]",
              navbarButtonText: "!text-inherit",
              navbarButtonIcon: "!text-inherit",
              pageScrollBox: "!bg-[#111113] !text-[#E4E4E7] [&_h1]:!text-white [&_h2]:!text-white [&_.cl-lineItemsDescriptionText]:!text-[#E4E4E7] [&_.cl-lineItemsDescriptionInner]:!text-[#E4E4E7] [&_.cl-lineItemsDescriptionPrefix]:!text-[#E4E4E7] [&_.cl-lineItemsDescriptionSuffix]:!text-[#A1A1AA]",
              page: "!bg-[#111113] !text-[#E4E4E7]",
              profilePage: "!bg-[#111113] !text-[#E4E4E7]",
              profileSection: "!border-white/8",
              profileSectionHeader: "!border-white/8",
              profileSectionTitle: "!text-[#71717A]",
              profileSectionTitleText: "!text-[#71717A]",
              profileSectionSubtitle: "!text-[#71717A]",
              profileSectionSubtitleText: "!text-[#71717A]",
              profileSectionContent: "!text-[#D4D4D8]",
              profileSectionPrimaryButton: "!text-[#2DD4BF] hover:!bg-[#2DD4BF]/10",
              profileSectionButtonGroup: "gap-3",
              lineItemsTitle: "!text-white",
              lineItemsTitleDescription: "!text-[#71717A]",
              lineItemsDescription: "!text-[#E4E4E7]",
              lineItemsDescriptionInner: "!text-[#E4E4E7]",
              lineItemsDescriptionText: "!text-[#E4E4E7]",
              lineItemsDescriptionPrefix: "!text-[#E4E4E7]",
              lineItemsDescriptionSuffix: "!text-[#71717A]",
              lineItemsCopyButton: "!text-[#A1A1AA] hover:!text-white",
              badge: "!border !border-white/10 !bg-[#18181B] !text-[#D4D4D8]",
              menuButton: "!text-[#71717A] hover:!bg-[#18181B] hover:!text-white",
              menuButtonEllipsis: "!text-inherit",
              menuList: "!border !border-white/10 !bg-[#18181B]",
              menuItem: "!text-[#D4D4D8] hover:!bg-white/5",
              avatarBox: "rounded-xl",
              avatarImage: "rounded-xl",
              avatarImageActionsUpload: "!text-[#2DD4BF] hover:!bg-[#2DD4BF]/10",
              avatarImageActionsRemove: "!text-red-400 hover:!bg-red-500/10",
              formFieldRow: "gap-4",
              formFieldInputShowPasswordButton: "!text-[#A1A1AA] hover:!text-white",
              formFieldAction: "!text-[#5EEAD4] hover:!text-[#99F6E4]",
              formFieldHintText: "!text-[#71717A]",
              formFieldErrorText: "!text-red-400",
              formFieldWarningText: "!text-amber-300",
              formFieldSuccessText: "!text-[#5EEAD4]",
              formFieldInfoText: "!text-[#A1A1AA]",
              identityPreviewText: "!text-white",
              identityPreviewEditButton: "!text-[#5EEAD4]",
              formResendCodeLink: "!text-[#5EEAD4]",
              otpCodeFieldInput: "!border-white/10 !bg-[#0B0B0D] !text-white",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
