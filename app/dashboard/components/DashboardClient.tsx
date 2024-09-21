"use client"

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { TreeViewBaseItem } from "@mui/x-tree-view/models"
import { RichTreeView } from "@mui/x-tree-view/RichTreeView"
import { createCallbackAuth } from "@octokit/auth-callback"
import CyaneaEvent, { validateEventsOrThrow } from "@pbrucla/cyanea-core/event"
import { Session } from "next-auth"
import { Octokit } from "octokit"
import { useEffect, useMemo, useState } from "react"
import { useErrorBoundary } from "react-error-boundary"
import { getRepo, RepoAndOwner } from "@/app/actions"
import { treeDrawerBreakpoint } from "@/app/components/CyaneaTheme"
import Loading from "@/app/components/Loading"
import UseThen from "@/app/components/UseThen"
import Toolbar from "@/app/dashboard/components/Toolbar"
import CyaneaEventsEditor from "@/app/dashboard/components/CyaneaEventsEditor"
import CyaneaMonacoEditor from "@/app/dashboard/components/CyaneaMonacoEditor"
import ResponsiveDrawer from "@/app/dashboard/components/ResponsiveDrawer"
import { commit, getFile, getHEAD, getTree } from "@/app/dashboard/utils/github"
import * as storage from "@/app/dashboard/utils/storage"
import { GitTreeFromGithub } from "@/app/dashboard/utils/storage"
import styles from "@/app/styles/dashboard/DashboardClient.module.css"

export default function DashboardClient({
  session: { token },
}: Readonly<{
  session: Session
}>) {
  const octokit = useMemo(
    () =>
      new Octokit({
        authStrategy: createCallbackAuth,
        auth: { callback: () => token },
      }),
    [token],
  )

  return (
    <UseThen
      fallback={<Loading>fetching event repo...</Loading>}
      use={getRepo}
      args={[]}
      then={repo => (
        <UseThen
          fallback={<Loading>fetching event repo HEAD...</Loading>}
          use={async (octokit, repo) => {
            const upstreamHeadWithRef = await getHEAD(octokit, repo)
            let currentHeadWithRef = storage.getLastHEAD()
            if (currentHeadWithRef === null) {
              storage.setLastHEAD(upstreamHeadWithRef)
              return [upstreamHeadWithRef, upstreamHeadWithRef] as const
            } else {
              return [currentHeadWithRef, upstreamHeadWithRef] as const
            }
          }}
          args={[octokit, repo] as const}
          then={([[currentHeadRef, currentHead], [_, upstreamHead]]: readonly [[string, string], [string, string]]) => (
            <UseThen
              fallback={<Loading>fetching event repo tree...</Loading>}
              use={storage.cache(storage.getLastTree, storage.setLastTree, getTree)}
              args={[octokit, repo, currentHead]}
              then={([sha, tree]: [string, GitTreeFromGithub[]]) => (
                <DashboardClientUI
                  octokit={octokit}
                  repo={repo}
                  currentHeadRef={currentHeadRef}
                  currentHead={currentHead}
                  upstreamHead={upstreamHead}
                  treeSha={sha}
                  tree={tree}
                />
              )}
            />
          )}
        />
      )}
    />
  )
}

function DashboardClientUI({
  octokit,
  repo,
  currentHeadRef,
  currentHead,
  upstreamHead,
  treeSha,
  tree,
}: Readonly<{
  octokit: Octokit
  repo: RepoAndOwner
  currentHeadRef: string
  currentHead: string
  upstreamHead: string
  treeSha: string
  tree: GitTreeFromGithub[]
}>) {
  const [files, treeForDisplay] = useMemo(() => {
    type BuildOutTree = Map<string, [string, BuildOutTree]>
    const files: Map<string, (typeof tree)[number]> = new Map()
    const buildOutTree: BuildOutTree = new Map()
    for (const node of tree) {
      if (node.type === "blob") {
        files.set(node.path!, node)
        const pathParts = node.path!.split("/")
        let parents = ""
        let outNode = buildOutTree
        for (const pathPart of pathParts) {
          if (!outNode.has(pathPart)) {
            outNode.set(pathPart, [parents + pathPart, new Map()])
          }
          parents += pathPart + "/"
          outNode = outNode.get(pathPart)![1]
        }
      }
    }
    function assembleOutTree(build: BuildOutTree): TreeViewBaseItem[] {
      const outTree: TreeViewBaseItem[] = []
      build.forEach(([id, children], label) => {
        const outNode: TreeViewBaseItem = { id, label }
        if (children.size > 0) {
          outNode.children = assembleOutTree(children)
        }
        outTree.push(outNode)
      })
      return outTree
    }
    return [files, assembleOutTree(buildOutTree)]
  }, [tree])

  const setFileSideEffects = (f: string) => {
    let restOfHash = window.location.hash.substring(1).split("&").slice(1).join("&")
    window.location.hash = `${f}${restOfHash !== "" ? `&${restOfHash}` : ""}`
    storage.setLastFile(f)
  }
  const [file, setFileInner] = useState(() => {
    const requestedFileInHash = window.location.hash.substring(1).split("&")[0]
    const requestedFile = requestedFileInHash !== "" ? requestedFileInHash : storage.getLastFile()
    const hasRequstedFile = requestedFile != null && files.has(requestedFile)
    const initFile = hasRequstedFile ? requestedFile : "cyanea.json"
    setFileSideEffects(initFile)
    return initFile
  })
  const setFile = (f: string) => {
    setFileSideEffects(f)
    setFileInner(f)
  }

  const [commitSpinnerDialog, setCommitSpinnerDialog] = useState<React.ReactNode>()

  const [treeOpenState, setTreeOpenState] = useState(false)

  function onSelectedItemsChange(_event: React.SyntheticEvent, itemIds: string | null) {
    if (itemIds === null) return
    if (files.has(itemIds)) {
      setFile(itemIds)
    }
  }

  const defaultExpandedItems = useMemo(
    () => {
      let parents = ""
      let toExpand = []
      for (const pathPart of file.split("/")) {
        toExpand.push(parents + pathPart)
        parents += pathPart + "/"
      }
      return toExpand
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only set this on first mount
    [],
  )

  return (
    <div className={styles.dashboardClient}>
      {commitSpinnerDialog}
      <ResponsiveDrawer
        breakpoint={treeDrawerBreakpoint}
        open={treeOpenState}
        onClosing={() => {
          setTreeOpenState(false)
        }}
        className={styles.treeDrawer}
      >
        <section className={styles.tree}>
          <RichTreeView
            items={treeForDisplay}
            selectedItems={file}
            onSelectedItemsChange={onSelectedItemsChange}
            defaultExpandedItems={defaultExpandedItems}
          />
        </section>
      </ResponsiveDrawer>
      <div className={styles.editor}>
        <UseThen
          fallback={
            <Loading>
              fetching <code>{file}</code>...
            </Loading>
          }
          use={storage.cache(
            () => storage.getStagedFile(file),
            contents => {
              if (contents !== null) {
                storage.cacheFile(file, contents)
              }
            },
            getFile,
          )}
          args={[octokit, repo, file]}
          then={(contents: string | null) => (
            <DashboardClientEditor
              key={file}
              currentHead={currentHead}
              upstreamHead={upstreamHead}
              files={files}
              file={file}
              initialContents={contents}
              toggleTreeOpenState={() => {
                setTreeOpenState(!treeOpenState)
              }}
              onCommit={({ message, force }) => {
                setCommitSpinnerDialog(
                  <Dialog open maxWidth={"sm"} fullWidth>
                    <DialogContent>
                      <Loading>Committing...</Loading>
                    </DialogContent>
                  </Dialog>,
                )
                commit(octokit, repo, currentHead, currentHeadRef, treeSha, tree, message, force).then(
                  commitSha => {
                    const onClose = () => {
                      storage.clearStorage()
                      window.location.reload()
                    }
                    setCommitSpinnerDialog(
                      <Dialog open onClose={onClose} maxWidth={"sm"} fullWidth>
                        <DialogTitle>Committed!</DialogTitle>
                        <DialogContent>
                          <code>{commitSha}</code>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={onClose}>Ok</Button>
                        </DialogActions>
                      </Dialog>,
                    )
                  },
                  error => {
                    const onClose = () => {
                      setCommitSpinnerDialog(null)
                    }
                    setCommitSpinnerDialog(
                      <Dialog open onClose={onClose} maxWidth={"sm"} fullWidth>
                        <DialogTitle>Commit failed :(</DialogTitle>
                        <DialogContent>
                          <Loading error>
                            <code>{error instanceof Error ? error.toString() : error}</code>
                          </Loading>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={onClose}>Ok</Button>
                        </DialogActions>
                      </Dialog>,
                    )
                  },
                )
              }}
            />
          )}
        />
      </div>
    </div>
  )
}

function DashboardClientEditor({
  currentHead,
  upstreamHead,
  files,
  file,
  initialContents,
  toggleTreeOpenState,
  onCommit,
}: Readonly<{
  currentHead: string
  upstreamHead: string
  files: Map<string, GitTreeFromGithub>
  file: string
  initialContents: string | null
  toggleTreeOpenState: () => void
  onCommit: ({ message, force }: { message: string; force: boolean }) => void
}>) {
  const { showBoundary } = useErrorBoundary()

  const [contents, setContentsInner] = useState(initialContents)
  const setContents = (contents: string) => {
    storage.setStagedFile(file, contents)
    setContentsInner(contents)
  }
  const setEvents = (events: CyaneaEvent[]) => {
    setContents(JSON.stringify(events, undefined, 2))
  }

  const [maybeEvents, initialEditorType] = useMemo<[CyaneaEvent[] | undefined, "code" | "events"]>(() => {
    if (contents === null) return [undefined, "code"]
    try {
      let maybeEvents = JSON.parse(contents)
      validateEventsOrThrow(maybeEvents)
      return [maybeEvents, "events"]
    } catch {
      return [undefined, "code"]
    }
  }, [contents])

  const calculateNumChanges = useMemo(
    () => () => {
      let newNumChanges = 0
      files.forEach((_, f) => {
        const staged = storage.getStagedFile(f)
        if (staged !== null && staged != storage.getOriginalFile(f)) {
          newNumChanges++
        }
      })
      return newNumChanges
    },
    [files],
  )
  const [numChanges, setNumChanges] = useState(calculateNumChanges())
  useEffect(() => {
    setNumChanges(calculateNumChanges())
  }, [calculateNumChanges, contents])

  const [editorType, setEditorType] = useState(initialEditorType)

  return (
    <>
      <Toolbar
        currentHead={currentHead}
        upstreamHead={upstreamHead}
        toggleTreeOpenState={toggleTreeOpenState}
        editorType={editorType}
        onToggleEditorType={setEditorType}
        disableEventsTab={maybeEvents === undefined}
        numChanges={numChanges}
        file={file}
        isFileEditable={contents !== null}
        onCommit={onCommit}
        onRevertFile={() => {
          try {
            storage.resetFileOrThrow(file)
          } catch (e) {
            showBoundary(e)
          }
          setContentsInner(storage.getStagedFile(file))
        }}
        onDiscardAllChanges={() => {
          storage.clearStorage()
          window.location.reload()
        }}
      />
      {contents === null ? (
        <Loading error>editing binary files is unsupported</Loading>
      ) : editorType === "code" || maybeEvents == null ? (
        <CyaneaMonacoEditor
          path={file}
          value={contents}
          onChange={c => {
            if (c !== undefined) setContents(c)
          }}
          className={styles.monaco}
        />
      ) : (
        <CyaneaEventsEditor file={file} events={maybeEvents} onChange={setEvents} />
      )}
    </>
  )
}
