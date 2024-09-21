"use client"

import { useEffect, useState } from "react"
import { useErrorBoundary } from "react-error-boundary"

// React's real Suspense element is still in canary and has really odd infinite-remounting issues
// (see https://github.com/facebook/react/issues/30799 and https://github.com/facebook/react/issues/24634)
// Until then, we'll fall back on the ol' useEffect.

export default function UseThen<A extends readonly unknown[], T>({
  fallback,
  use,
  args,
  then,
}: Readonly<{
  fallback: React.ReactNode
  use: (...args: A) => Promise<T>
  args: A
  then: (t: T) => React.ReactNode
}>) {
  const { showBoundary } = useErrorBoundary()
  const [loaded, setLoaded] = useState(false)
  const [children, setChildren] = useState<React.ReactNode>()
  useEffect(() => {
    use(...args).then(t => {
      const result = then(t)
      try {
        setChildren(result)
        setLoaded(true)
      } catch (e) {
        showBoundary(e)
      }
    }, showBoundary)

    return () => setLoaded(false)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [use, ...args, then, showBoundary])
  return loaded ? children : fallback
}
