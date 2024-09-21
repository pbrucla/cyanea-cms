import { createCallbackAuth } from "@octokit/auth-callback"
import NextAuth from "next-auth"
import github from "next-auth/providers/github"
import { Octokit } from "octokit"
import * as env from "@/env"

declare module "@auth/core/types" {
  interface Session {
    token: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [github],
  session: {
    strategy: "jwt",
    maxAge: 2592000,
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      try {
        if (account == null || account.access_token == null) {
          return false
        }

        const octokit = new Octokit({
          authStrategy: createCallbackAuth,
          auth: { callback: () => account.access_token },
        })

        const cyanea = await octokit.rest.repos.getContent({
          owner: env.CYANEA_EVENTS_REPO_OWNER,
          repo: env.CYANEA_EVENTS_REPO_REPO,
          path: "cyanea.json",
        })

        if (!(cyanea.data instanceof Array) && cyanea.data.type === "file") {
          JSON.parse(atob(cyanea.data.content))
          console.log(`authenticated user ${user.name} (${user.id})`)
          return true
        } else {
          return false
        }
      } catch {
        return false
      }
    },
    jwt: async ({ token, account }) => {
      token.token ??= account?.access_token
      return token
    },
    session: async ({ session, token }) => {
      return { ...session, token: token.token }
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
})
