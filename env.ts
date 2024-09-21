import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    AUTH_GITHUB_ID: z.string().min(1),
    AUTH_GITHUB_SECRET: z.string().min(1),
    CYANEA_EVENTS_REPO: z.string().regex(/.*?\/.*?/),
  },
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    CYANEA_EVENTS_REPO: process.env.CYANEA_EVENTS_REPO,
  },
})

let repoSplit = env.CYANEA_EVENTS_REPO.split("/")
export const CYANEA_EVENTS_REPO_OWNER = repoSplit[0]
export const CYANEA_EVENTS_REPO_REPO = repoSplit[1]
