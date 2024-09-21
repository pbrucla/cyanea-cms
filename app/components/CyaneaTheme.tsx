"use client"

import { GlobalStyles, PaletteColorOptions, PaletteOptions, StyledEngineProvider } from "@mui/material"
import { toggleButtonClasses } from "@mui/material/ToggleButton"
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import type {} from "@mui/x-tree-view/themeAugmentation"
import { treeItemClasses } from "@mui/x-tree-view/TreeItem"
import { ConfirmProvider } from "material-ui-confirm"
import MUIThemeProvider from "@/app/components/MUIThemeProvider"

declare module "@mui/material" {
  interface TextFieldPropsColorOverrides {
    "cyber-gold": true
  }

  interface PaletteOptions {
    "cyber-gold": PaletteColorOptions
  }
}

export const palette = {
  mode: "dark",
  primary: {
    light: "#fab5cd",
    main: "#f44d8a",
    dark: "#f10b70",
    contrastText: "#fff",
  },
  ["cyber-gold"]: {
    main: "#ffba44",
  },
} satisfies PaletteOptions

export const theme = {
  palette,
  typography: {
    fontFamily: `var(--open-sans), "Segoe UI", Tahoma, Geneva, Verdana, sans-serif`,
    fontSize: 14,
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          "&:before": {
            display: "none",
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          display: "flex",
          flexDirection: "column",
          paddingBlock: "0 1.4rem",
          gap: "1.4rem",
        },
      },
    },
    MuiInputBase: {
      defaultProps: {
        disableInjectingGlobalStyles: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "unset",
          backgroundColor: "#0e1116",
        },
      },
    },
    MuiRichTreeView: {
      styleOverrides: {
        root: {
          [`.${treeItemClasses.content}`]: {
            borderTopLeftRadius: "0px",
            borderBottomLeftRadius: "0px",
            [`&:hover, &:active`]: {
              backgroundColor: `${palette.primary.main}55`,
            },
            [`&.${treeItemClasses.selected}`]: {
              [`&, &:active, &:not(:active), &:hover, &:not(:hover)`]: {
                backgroundColor: palette.primary.main,
              },
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          [`:not(.${toggleButtonClasses.selected}):not(.${toggleButtonClasses.disabled})`]: {
            color: "var(--organic-oranges)",
          },
        },
      },
    },
  },
} satisfies Parameters<typeof MUIThemeProvider>[0]["theme"]

// keep this sync'd with the breakpoint in DashboardClient.module.css
export const treeDrawerBreakpoint = 1110 /* px */

export default function CyaneaTheme({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <GlobalStyles
          styles={{
            "@keyframes mui-auto-fill": {
              from: {
                display: "block",
              },
            },
            "@keyframes mui-auto-fill-cancel": {
              from: {
                display: "block",
              },
            },
            ":root": {
              "--tree-drawer-breakpoint": treeDrawerBreakpoint,
              "--tree-drawer-display": "none",
            },
            [`@media screen and (max-width: ${treeDrawerBreakpoint}px)`]: {
              ":root": {
                "--tree-drawer-display": "block",
              },
            },
          }}
        />
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ConfirmProvider>{children}</ConfirmProvider>
        </LocalizationProvider>
      </MUIThemeProvider>
    </StyledEngineProvider>
  )
}
