"use client"

import { z } from "zod"

function withLocalStorage(path: string): [() => string | null, (value: string) => void]
function withLocalStorage<Z extends z.ZodType<any, any, any>>(
  path: string,
  schema: Z,
): [() => z.infer<Z> | null, (value: z.infer<Z>) => void]
function withLocalStorage<Z extends z.ZodType<any, any, any>>(
  path: string,
  schema?: Z,
): [() => string | null, (value: string) => void] | [() => z.infer<Z> | null, (value: z.infer<Z>) => void] {
  if (schema === undefined) {
    return [() => localStorage.getItem(path), (value: string) => localStorage.setItem(path, value)]
  } else {
    return [
      () => {
        const inStorage = localStorage.getItem(path)
        if (inStorage === null) return null
        try {
          return schema.parse(JSON.parse(inStorage))
        } catch {
          return null
        }
      },
      (value: z.infer<Z>) => {
        localStorage.setItem(path, JSON.stringify(value))
      },
    ]
  }
}

export function cache<T, A extends readonly unknown[]>(
  get: () => T | null,
  set: (value: T) => void,
  init: (...args: A) => Promise<T>,
) {
  return async (...args: A) => {
    const cached = get()
    if (cached != null) return cached
    const computed = await init(...args)
    set(computed)
    return computed
  }
}

export const [getLastHEAD, setLastHEAD] = withLocalStorage("last-head", z.tuple([z.string(), z.string()]))

export const [getLastTree, setLastTree] = withLocalStorage(
  "last-tree",
  z.tuple([
    z.string(),
    z.array(
      z.object({
        path: z.string().optional(),
        mode: z.string().optional(),
        type: z.string().optional(),
        sha: z.string().optional(),
        size: z.number().optional(),
        url: z.string().optional(),
      }),
    ),
  ] as const),
)

export type GitTreeFromGithub = Parameters<typeof setLastTree>[0][1][number]

export const [getLastFile, setLastFile] = withLocalStorage("last-file")

export function getOriginalFile(path: string) {
  return localStorage.getItem("original/" + path)
}

export function setOriginalFile(path: string, contents: string) {
  localStorage.setItem("original/" + path, contents)
}

export function getStagedFile(path: string) {
  return localStorage.getItem("staged/" + path)
}

export function setStagedFile(path: string, contents: string) {
  localStorage.setItem("staged/" + path, contents)
}

export function cacheFile(path: string, contents: string) {
  setOriginalFile(path, contents)
  setStagedFile(path, contents)
}

export function resetFileOrThrow(path: string) {
  const originalFile = getOriginalFile(path)
  if (originalFile == null) {
    localStorage.removeItem("staged/" + path)
    throw `cached file ${path} missing, please reload!`
  } else {
    setStagedFile(path, originalFile)
  }
}

export function clearStorage() {
  localStorage.clear()
}
