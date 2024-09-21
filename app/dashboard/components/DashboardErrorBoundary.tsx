"use client"

import { ErrorBoundary } from "react-error-boundary"
import Loading from "@/app/components/Loading"

export default function DashboardErrorBoundary({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <Loading error>
          failed to load event data
          {error ? (
            <>
              :<code>{error instanceof Error ? error.toString() : error}</code>
            </>
          ) : null}
        </Loading>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
