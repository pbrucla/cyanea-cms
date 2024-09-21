"use client"

import { createTheme, ThemeProvider } from "@mui/material"
import _ from "lodash"
import { theme as cyaneaTheme } from "@/app/components/CyaneaTheme"

export default function MUIThemeProvider({
  children,
  theme,
  extend,
}: Readonly<{
  children: React.ReactNode
  theme: Parameters<typeof createTheme>[0]
  extend?: boolean
}>) {
  return (
    <ThemeProvider theme={extend ? createTheme(_.merge(cyaneaTheme, theme)) : createTheme(theme)}>
      {children}
    </ThemeProvider>
  )
}
