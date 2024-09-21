"use server"

import * as env from "@/env"

export type RepoAndOwner = {
  owner: string
  repo: string
}

export async function getRepo(): Promise<RepoAndOwner> {
  return {
    owner: env.CYANEA_EVENTS_REPO_OWNER,
    repo: env.CYANEA_EVENTS_REPO_REPO,
  }
}
