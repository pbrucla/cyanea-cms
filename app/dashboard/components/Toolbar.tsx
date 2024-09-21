import MenuIcon from "@mui/icons-material/Menu"
import { Button, IconButton, Tab, Tabs } from "@mui/material"
import { useConfirm } from "material-ui-confirm"
import { useState } from "react"
import CommitDialog from "@/app/dashboard/components/CommitDialog"
import styles from "@/app/styles/dashboard/Toolbar.module.css"

export default function Toolbar({
  currentHead,
  upstreamHead,
  toggleTreeOpenState,
  editorType,
  onToggleEditorType,
  disableCodeTab,
  disableEventsTab,
  numChanges,
  file,
  isFileEditable,
  onCommit,
  onRevertFile,
  onDiscardAllChanges,
}: Readonly<{
  currentHead: string
  upstreamHead: string
  toggleTreeOpenState: () => void
  editorType: "code" | "events"
  onToggleEditorType: (editorType: "code" | "events") => void
  disableCodeTab?: boolean
  disableEventsTab?: boolean
  numChanges: number
  file: string
  isFileEditable: boolean
  onCommit: ({ message, force }: { message: string; force: boolean }) => void
  onRevertFile: () => void
  onDiscardAllChanges: () => void
}>) {
  const confirm = useConfirm()
  const [commitDialogOpen, setCommitDialogOpen] = useState(false)
  const divergent = currentHead !== upstreamHead

  return (
    <div className={styles.toolbar}>
      <IconButton color="inherit" aria-label="open drawer" onClick={toggleTreeOpenState} className={styles.treeToggle}>
        <MenuIcon />
      </IconButton>
      <Tabs
        value={editorType}
        onChange={(_, v) => {
          if (v === "code" || v === "events") onToggleEditorType(v)
        }}
        aria-label="Editor tabs"
        color="primary"
        className={styles.toolbarTabs}
      >
        <Tab value="code" label="Code" disabled={disableCodeTab} />
        <Tab value="events" label="Events" disabled={disableEventsTab} />
      </Tabs>
      <div className={styles.toolbarHeadsInfo}>
        <span>
          {numChanges} file{numChanges === 1 ? "" : "s"} edited
        </span>
        <span>
          on <code>{currentHead.substring(0, 7)}</code>{" "}
          {divergent ? <span className={styles.divergent}>(out of date!)</span> : null}
        </span>
        <span>
          upstream <code>{upstreamHead.substring(0, 7)}</code>
        </span>
      </div>
      <div className={styles.toolbarButtonsScroll}>
        <div className={styles.toolbarButtons}>
          <Button variant="contained" onClick={() => setCommitDialogOpen(true)}>
            Commit!
          </Button>
          <CommitDialog
            open={commitDialogOpen}
            divergent={divergent}
            numChanges={numChanges}
            onCommit={p => {
              setCommitDialogOpen(false)
              onCommit(p)
            }}
            onCancel={() => setCommitDialogOpen(false)}
          />
          <Button
            variant="outlined"
            disabled={!isFileEditable}
            onClick={() => {
              if (isFileEditable) {
                confirm({
                  title: (
                    <>
                      Revert all changes to <code>{file}</code>?
                    </>
                  ),
                  description: "This cannot be undone.",
                }).then(() => onRevertFile())
              }
            }}
          >
            Revert File
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              confirm({
                title: (
                  <>
                    Discard <em>ALL</em> changes and reload?
                  </>
                ),
                description: "This will reset the state of Cyanea CMS to the latest upstream!",
              }).then(() => onDiscardAllChanges())
            }}
          >
            Discard All Changes and Reload
          </Button>
        </div>
      </div>
    </div>
  )
}
