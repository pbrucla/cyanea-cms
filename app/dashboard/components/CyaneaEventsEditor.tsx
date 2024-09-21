"use client"

import AddIcon from "@mui/icons-material/Add"
import CopyIcon from "@mui/icons-material/ContentCopy"
import DeleteIcon from "@mui/icons-material/DeleteOutline"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  styled,
  TextField,
} from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import CyaneaEvent from "@pbrucla/cyanea-core/event"
import { produce, WritableDraft } from "immer"
import { DateTime } from "luxon"
import { ChangeEvent, Fragment, useEffect, useState } from "react"
import ChooseTypeDialog from "@/app/dashboard/components/ChooseTypeDialog"
import styles from "@/app/styles/dashboard/CyaneaEventsEditor.module.css"
import { LINK_TYPES, METADATA_CHECKBOXES, validateId } from "@/config"

const EventCardAccordian = styled(Accordion)({
  [`& > div.MuiAccordion-heading > div.MuiButtonBase-root,
    & > div.MuiCollapse-root > div > div > div > div.MuiAccordionDetails-root`]: {
    padding: "0",
  },
  "& > div.MuiAccordion-heading > div.MuiButtonBase-root > div.MuiAccordionSummary-content": {
    display: "flex",
    flexDirection: "column",
    margin: "0",
    padding: "0 16px 0 0",
    gap: "1.4rem",
  },
  "& > div.MuiCollapse-root > div > div > div > div.MuiAccordionDetails-root": {
    paddingTop: "1.4rem",
  },
  "& > div.MuiAccordion-heading > div.MuiButtonBase-root > div.MuiAccordionSummary-expandIconWrapper": {
    alignSelf: "start",
    padding: "4px 0px",
  },
  "& > div.MuiAccordion-heading > div.MuiButtonBase-root.Mui-focusVisible": {
    backgroundColor: "unset",
  },
})

const TitleTextFieldInner = styled(TextField)({
  "& input": {
    fontFamily: "var(--poppins), sans-serif",
    color: "var(--cyber-gold)",
  },
})
function TitleTextField(props: Parameters<typeof TextField>[0]) {
  return <TitleTextFieldInner color="cyber-gold" {...props} />
}

const CodeTextField = styled(TextField)({
  "& input": {
    fontFamily: "var(--ibm-plex-mono), monospace",
  },
})

function validateURL(x: string | null | undefined) {
  if (x === null || x === undefined) return {}
  try {
    new URL(x)
    return {}
  } catch {
    return { error: true, helperText: "invalid url" } as const
  }
}

function validateTimes(start: number, end: number, showMessage: boolean) {
  if (start > end) {
    return {
      slotProps: {
        textField: {
          error: true,
          ...(showMessage ? { helperText: "end time must be later than start time" } : {}),
        },
      },
    } as const
  } else {
    return {}
  }
}

export default function CyaneaEventsEditor({
  file,
  events,
  onChange,
}: Readonly<{
  file: string
  events: CyaneaEvent[]
  onChange: (events: CyaneaEvent[]) => void
}>) {
  const [expanded, setExpanded] = useState<number | null>(() => {
    const hashParts = window.location.hash.substring(1).split("&")
    if (hashParts.length >= 2) {
      const expandedEvent = events.findIndex(e => e.id === hashParts[1])
      return expandedEvent !== -1 ? expandedEvent : null
    }
    return null
  })
  useEffect(() => {
    if (expanded !== null && events[expanded] != null) {
      window.location.hash = `${file}&${events[expanded].id}`
    } else {
      window.location.hash = file
    }
  }, [expanded, events, file])

  let renderedEvents: CyaneaEvent[]
  if (expanded === null) {
    renderedEvents = events
  } else {
    renderedEvents = new Array(expanded + 1)
    renderedEvents[expanded] = events[expanded]
  }

  const [previousExpanded, setPreviousExpanded] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (previousExpanded !== null) {
      setPreviousExpanded(null)
      previousExpanded.parentElement!.scrollTo({ top: previousExpanded.offsetTop - 124.8 })
    }
  }, [previousExpanded])

  return (
    <div className={styles.eventsEditor}>
      {renderedEvents.map((e, i) => (
        <CyaneaEventCard
          events={events}
          onChange={onChange}
          expanded={expanded}
          setExpanded={setExpanded}
          setPreviousExpanded={setPreviousExpanded}
          e={e}
          i={i}
          key={i}
        />
      ))}
      {expanded === null ? (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className={styles.addButton}
          onClick={() => {
            const now = Date.now()
            setExpanded(events.length)
            onChange(
              produce(events, draft => {
                draft.push({
                  id: "untitled-event",
                  title: "Untitled Event",
                  description: "",
                  location: "",
                  start: now,
                  end: now,
                })
                return draft
              }),
            )
          }}
        >
          Add Event
        </Button>
      ) : null}
    </div>
  )
}

function CyaneaEventCard({
  events,
  onChange,
  expanded,
  setExpanded,
  setPreviousExpanded,
  e,
  i,
}: Readonly<{
  events: CyaneaEvent[]
  onChange: (events: CyaneaEvent[]) => void
  expanded: number | null
  setExpanded: (expanded: number | null) => void
  setPreviousExpanded: (element: HTMLElement | null) => void
  e: CyaneaEvent
  i: number
}>) {
  function updateEventString(updater: (draft: WritableDraft<CyaneaEvent>, value: string) => any) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(
        produce(events, draft => {
          updater(draft[i], e.target.value)
          return draft
        }),
      )
  }

  function updateEventMeta(
    section: "meta" | "links",
    updater: (draft: WritableDraft<Record<string, any>>, value: string) => any,
  ) {
    return updateEventString((draft, value) => {
      if (!draft[section]) draft[section] = {}
      updater(draft[section], value)
      if (Object.keys(draft[section]).length === 0) {
        delete draft[section]
      }
    })
  }

  function updateEventDate(updater: (draft: WritableDraft<CyaneaEvent>, value: DateTime) => any) {
    return (value: DateTime<true> | DateTime<false> | null) => {
      if (value !== null && value.isValid) {
        onChange(
          produce(events, draft => {
            updater(draft[i], value)
            return draft
          }),
        )
      }
    }
  }

  const type = e.type == null ? [] : typeof e.type === "string" ? [e.type] : e.type
  const [chooseTypeDialogOpen, setChooseTypeDialogOpen] = useState(false)

  return (
    <article className={styles.event}>
      <EventCardAccordian
        slotProps={{ heading: { component: "div" }, transition: { mountOnEnter: true, unmountOnExit: true } }}
        expanded={expanded === i}
        onChange={e => {
          if (expanded !== i) {
            setExpanded(i)
          } else {
            setPreviousExpanded(e.currentTarget!.parentElement!.parentElement!.parentElement!)
            setExpanded(null)
          }
        }}
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <h3>{e.title}</h3>
          <code>{e.id}</code>
        </AccordionSummary>
        <AccordionDetails>
          <TitleTextField
            variant="standard"
            label="title"
            value={e.title}
            onChange={updateEventString((draft, value) => (draft.title = value))}
          />
          <CodeTextField
            variant="standard"
            label="id"
            value={e.id}
            {...(validateId ? validateId(e.id) : {})}
            onChange={updateEventString((draft, value) => (draft.id = value))}
          />
          <FormControl variant="standard">
            <FormHelperText>types</FormHelperText>
            <div className={styles.typeChips}>
              {type.map((t, i2) => (
                <Fragment key={t}>
                  <Chip
                    label={t}
                    onDelete={() =>
                      onChange(
                        produce(events, draft => {
                          draft[i].type = type.toSpliced(i2, 1)
                          if (draft[i].type.length === 0) {
                            delete draft[i].type
                          }
                          return draft
                        }),
                      )
                    }
                  />
                </Fragment>
              ))}
              <IconButton size="small" aria-label="add event type" onClick={() => setChooseTypeDialogOpen(true)}>
                <AddIcon />
              </IconButton>
              <ChooseTypeDialog
                open={chooseTypeDialogOpen}
                onClose={value => {
                  setChooseTypeDialogOpen(false)
                  if (value) {
                    onChange(
                      produce(events, draft => {
                        draft[i].type = [...type, value]
                      }),
                    )
                  }
                }}
              />
            </div>
          </FormControl>
          <TextField
            variant="standard"
            label="description"
            value={e.description}
            onChange={updateEventString((draft, value) => (draft.description = value))}
            multiline
          />
          <TextField
            variant="standard"
            label="location"
            value={e.location}
            onChange={updateEventString((draft, value) => (draft.location = value))}
          />
          <CodeTextField
            variant="standard"
            label="banner"
            value={e.banner ?? ""}
            {...validateURL(e.banner)}
            onChange={updateEventString((draft, value) => {
              if (value !== "") {
                draft.banner = value
              } else {
                delete draft.banner
              }
            })}
          />
          <div className={styles.dates}>
            <DateTimePicker
              label="start"
              value={DateTime.fromMillis(e.start)}
              {...validateTimes(e.start, e.end, false)}
              onChange={updateEventDate((draft, value) => (draft.start = value.toMillis()))}
            />
            <DateTimePicker
              label="end"
              value={DateTime.fromMillis(e.end)}
              {...validateTimes(e.start, e.end, true)}
              onChange={updateEventDate((draft, value) => (draft.end = value.toMillis()))}
            />
          </div>
          <Accordion slotProps={{ heading: { component: "div" } }} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FormHelperText>links & metadata</FormHelperText>
            </AccordionSummary>
            <AccordionDetails>
              {Object.entries(LINK_TYPES).map(([linkType, label]) => (
                <Fragment key={linkType}>
                  <CodeTextField
                    variant="standard"
                    label={label}
                    value={e.links?.[linkType] ?? ""}
                    {...validateURL(e.links?.[linkType])}
                    onChange={updateEventMeta("links", (draft, value) => {
                      if (value !== "") {
                        draft[linkType] = value
                      } else {
                        delete draft[linkType]
                      }
                    })}
                    fullWidth
                  />
                </Fragment>
              ))}
              {Object.entries(METADATA_CHECKBOXES).map(([metaType, label]) => (
                <Fragment key={metaType}>
                  <FormControlLabel
                    label={label}
                    control={
                      <Checkbox
                        checked={!!e.meta?.[metaType]}
                        onChange={updateEventMeta("meta", draft => {
                          if (!e.meta?.[metaType]) {
                            draft[metaType] = true
                          } else {
                            delete draft[metaType]
                          }
                        })}
                      />
                    }
                  />
                </Fragment>
              ))}
            </AccordionDetails>
          </Accordion>
          <div className={styles.dates}>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={() => {
                onChange(
                  produce(events, draft => {
                    draft.splice(i + 1, 0, {
                      ...e,
                      id: `${e.id}-copy`,
                      title: `${e.title} Copy`,
                    })
                    return draft
                  }),
                )
                setExpanded(i + 1)
              }}
            >
              Copy Event
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => {
                onChange(
                  produce(events, draft => {
                    draft.splice(i, 1)
                    return draft
                  }),
                )
                setExpanded(null)
              }}
            >
              Delete Event
            </Button>
          </div>
        </AccordionDetails>
      </EventCardAccordian>
    </article>
  )
}
