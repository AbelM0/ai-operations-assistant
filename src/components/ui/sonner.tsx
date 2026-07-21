"use client"

import {
  CheckCircle,
  Info,
  SpinnerGap,
  Warning,
  XCircle,
} from "@phosphor-icons/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      className="toaster group"
      icons={{
        success: (
          <CheckCircle className="size-4 text-[#5EEAD4]" weight="fill" />
        ),
        info: (
          <Info className="size-4 text-sky-300" weight="fill" />
        ),
        warning: (
          <Warning className="size-4 text-amber-300" weight="fill" />
        ),
        error: (
          <XCircle className="size-4 text-red-400" weight="fill" />
        ),
        loading: (
          <SpinnerGap className="size-4 animate-spin text-[#5EEAD4] motion-reduce:animate-none" />
        ),
      }}
      style={
        {
          "--normal-bg": "#111113",
          "--normal-text": "#F4F4F5",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--border-radius": "0.625rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
          title: "text-sm font-semibold tracking-[-0.01em]",
          description: "text-sm text-[#A1A1AA]",
          closeButton: "border-white/10 bg-[#18181B] text-[#A1A1AA] hover:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
