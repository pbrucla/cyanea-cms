import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@mui/material"
import { useRef, useState } from "react"
import styles from "@/app/styles/dashboard/CommitDialog.module.css"

export default function CommitDialog({
  open,
  divergent,
  numChanges,
  onCommit,
  onCancel,
}: Readonly<{
  open: boolean
  divergent: boolean
  numChanges: number
  onCommit: ({ message, force }: { message: string; force: boolean }) => void
  onCancel: () => void
}>) {
  const [message, setMessage] = useState("")
  const [description, setDescription] = useState("")
  const [forcePush, setForcePush] = useState(false)

  const messageInputRef = useRef<HTMLInputElement>(null)

  return (
    <Dialog
      open={open}
      maxWidth={"sm"}
      fullWidth
      TransitionProps={{
        onEntering: () => {
          if (messageInputRef.current !== null) {
            messageInputRef.current.querySelector("input")?.select()
          }
        },
      }}
    >
      <DialogTitle>Commit!</DialogTitle>
      <DialogContent className={styles.content}>
        {divergent ? (
          <p className={styles.divergent}>
            Warning: local state and upstream have <span className={styles.probably}>(probably)</span> diverged. <br />
            Cyanea CMS currently cannot handle merges. You will need to either discard your changes and rebase manually
            or do a force push.
          </p>
        ) : null}
        <TextField
          variant="standard"
          label="commit message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          ref={messageInputRef}
        />
        <TextField
          variant="standard"
          label="description"
          placeholder="(optional extended description)"
          value={description}
          multiline
          rows={7}
          onChange={e => setDescription(e.target.value)}
        />
        <FormControlLabel
          label={<>force push</>}
          control={<Checkbox checked={forcePush} onChange={() => setForcePush(!forcePush)} />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() =>
            onCommit({
              message: message + (description !== "" ? `\n\n${description}` : ""),
              force: forcePush,
            })
          }
        >
          Commit&nbsp;
          <span style={{ fontWeight: "bold" }}>{`${numChanges} file${numChanges === 1 ? "" : "s"}`}</span>
          &nbsp;and {forcePush ? "force push" : "push"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
