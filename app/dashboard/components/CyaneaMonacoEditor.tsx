"use client"

import { Editor, EditorProps, Monaco } from "@monaco-editor/react"
import { EVENT_SCHEMA } from "@pbrucla/cyanea-core/event"
import _ from "lodash"
import githubDark from "monaco-themes/themes/GitHub Dark.json" with { type: "json" }
import { palette } from "@/app/components/CyaneaTheme"
import { useEffect } from "react"

export default function CyaneaMonacoEditor(
  props: Omit<EditorProps, "theme" | "options" | "beforeMount"> & { path: string },
) {
  useEffect(() => {
    window.location.hash = props.path
  })

  function editorWillMount(monaco: Monaco) {
    monaco.editor.defineTheme(
      "github-dark",
      _.merge(githubDark, {
        base: "vs-dark" as const,
        colors: { "editor.selectionBackground": `${palette.primary.main}55` },
      }),
    )

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      schemas: [
        {
          uri: "https://raw.githubusercontent.com/pbrucla/cyanea/main/packages/cyanea-core/event/events.schema.json",
          fileMatch: ["/**/*.json", "!cyanea.json"],
          schema: {
            type: "array",
            title: "Cyanea Events",
            description: "A list of Cyanea events.",
            items: EVENT_SCHEMA,
          },
        },
      ],
    })
  }

  return (
    <Editor
      theme="github-dark"
      options={{
        minimap: { enabled: false },
        fontFamily: "var(--ibm-plex-mono), monospace",
        codeLensFontFamily: "var(--ibm-plex-mono), monospace",
        fontSize: 16,
        codeLensFontSize: 16,
        lineHeight: 1.4,
        padding: { top: 4, bottom: 4 },
        automaticLayout: true,
      }}
      beforeMount={editorWillMount}
      {...props}
    />
  )
}
