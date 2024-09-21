import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { EVENT_TYPE_ALLOW_ANY_INPUT, EVENT_TYPES } from "@/config"

export default function ChooseTypeDialog({
  open,
  onClose,
}: Readonly<{
  open: boolean
  onClose: (type: string | null) => void
}>) {
  const [type, setType] = useState("")
  useEffect(() => {
    if (!open) {
      setType("")
    }
  }, [open])

  const inputRef = useRef<HTMLInputElement>(null)

  const onCancel = () => onClose(null)
  const onSubmit = () => {
    if (type !== "") {
      onClose(type)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={"sm"}
      fullWidth
      TransitionProps={{
        onEntering: () => {
          if (inputRef.current !== null) {
            inputRef.current.querySelector("input")?.focus()
          }
        },
      }}
    >
      <DialogTitle>add event type</DialogTitle>
      <DialogContent>
        <form
          onSubmit={e => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <Autocomplete
            options={EVENT_TYPES}
            autoComplete
            freeSolo={EVENT_TYPE_ALLOW_ANY_INPUT}
            openOnFocus
            renderInput={params => <TextField ref={inputRef} {...params} />}
            onInputChange={(_, value) => setType(value ?? "")}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit} disabled={type === ""}>
          Add Type
        </Button>
      </DialogActions>
    </Dialog>
  )
}
