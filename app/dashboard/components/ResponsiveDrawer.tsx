"use client"

import { Drawer, styled } from "@mui/material"
import { useEffect, useMemo, useState } from "react"

const InlineDrawer = styled(Drawer)({
  "& > .MuiPaper-root": {
    position: "unset",
    top: "unset",
    left: "unset",
    width: "min-content",
    border: "none",
    backgroundImage: "unset",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
})

export default function ResponsiveDrawer({
  breakpoint,
  open,
  onClosing,
  onClosed,
  onUpdateVariant,
  className,
  children,
}: Readonly<{
  breakpoint: number
  open: boolean
  onClosing?: () => void
  onClosed?: () => void
  onUpdateVariant?: (variant: "temporary" | "permanent") => void
  className?: string
  children: React.ReactNode
}>) {
  const calculateVariant = useMemo(
    () => () => (document.documentElement.clientWidth <= breakpoint ? "temporary" : "permanent"),
    [breakpoint],
  )
  const [variant, setVariant] = useState<"temporary" | "permanent">(calculateVariant())
  useEffect(() => {
    const listener = () => {
      setVariant(calculateVariant())
    }
    window.addEventListener("resize", listener)

    return () => {
      window.removeEventListener("resize", listener)
    }
  })
  useEffect(() => {
    onUpdateVariant?.(variant)
  }, [onUpdateVariant, variant])

  return (
    <InlineDrawer
      variant={variant}
      open={variant === "permanent" || open}
      onClose={() => onClosing?.()}
      onTransitionEnd={() => onClosed?.()}
      className={className}
    >
      {children}
    </InlineDrawer>
  )
}
