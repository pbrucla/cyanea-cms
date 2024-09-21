import { RepoAndOwner } from "@/app/actions"
import { Octokit } from "octokit"
import * as storage from "@/app/dashboard/utils/storage"
import { GitTreeFromGithub } from "@/app/dashboard/utils/storage"

export async function getHEAD(octokit: Octokit, repo: RepoAndOwner) {
  const defaultBranch = (await octokit.rest.repos.get(repo)).data.default_branch

  const resolvedDefaultBranch = (
    await octokit.rest.git.getRef({
      ...repo,
      ref: `heads/${defaultBranch}`,
    })
  ).data.object.sha

  return [defaultBranch, resolvedDefaultBranch] satisfies [string, string]
}

export async function getTree(
  octokit: Octokit,
  repo: RepoAndOwner,
  head: string,
): Promise<[string, GitTreeFromGithub[]]> {
  const res = (
    await octokit.rest.git.getTree({
      ...repo,
      tree_sha: head,
      recursive: "*cute dino noises*",
    })
  ).data

  if (res.truncated) {
    throw `failed to fetch event repo tree:
Github truncated the response.
This means that the *directory listing* of the events repo has either exceeded 7 MB or 100,000 entries.
If you're seeing this error, please open a bug in Cyanea CMS with a description of your usecase.`
  }

  return [res.sha, res.tree]
}

export async function getFile(octokit: Octokit, repo: RepoAndOwner, file: string) {
  try {
    const cyanea = await octokit.rest.repos.getContent({
      ...repo,
      path: file,
    })
    if (!(cyanea.data instanceof Array) && cyanea.data.type === "file") {
      try {
        return new TextDecoder("utf8", { fatal: true }).decode(Buffer.from(cyanea.data.content, "base64"))
      } catch {
        return null
      }
    } else {
      throw `${file} is not a file (???)`
    }
  } catch {
    throw `failed to fetch ${file}`
  }
}

export async function commit(
  octokit: Octokit,
  repo: RepoAndOwner,
  baseCommit: string,
  baseTreeRef: string,
  baseTreeSha: string,
  baseTree: GitTreeFromGithub[],
  message: string,
  force: boolean,
) {
  const newBlobs: { file: GitTreeFromGithub; content: string }[] = []
  baseTree.forEach(f => {
    const maybeNewContent = storage.getStagedFile(f.path!)
    if (maybeNewContent != null && maybeNewContent != storage.getOriginalFile(f.path!)) {
      newBlobs.push({ file: f, content: maybeNewContent })
    }
  })
  const newTreeSpec: GitTreeFromGithub[] = await Promise.all(
    newBlobs.map(async ({ file, content }) => {
      const res = await octokit.rest.git.createBlob({
        ...repo,
        content,
        encoding: "utf-8",
      })
      return {
        path: file.path,
        type: "blob",
        mode: file.mode,
        sha: res.data.sha,
      }
    }),
  )

  const tree = (
    await octokit.rest.git.createTree({
      ...repo,
      base_tree: baseTreeSha,
      // @ts-ignore-error mode: string and mode: (long enum) are incompatible
      //                  this is *probably* fine riiiight?
      tree: newTreeSpec,
    })
  ).data.sha

  const commit = (
    await octokit.rest.git.createCommit({
      ...repo,
      message,
      parents: [baseCommit],
      tree,
    })
  ).data.sha

  return (
    await octokit.rest.git.updateRef({
      ...repo,
      ref: `heads/${baseTreeRef}`,
      sha: commit,
      force,
    })
  ).data.object.sha
}
