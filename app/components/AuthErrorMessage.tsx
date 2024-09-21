"use client"

import { useSearchParams } from "next/navigation"

export default function AuthErrorMessage({ className }: { className?: string }) {
  return useSearchParams().has("error") ? <p className={className}>unauthorized or unable to access repo</p> : null
}
