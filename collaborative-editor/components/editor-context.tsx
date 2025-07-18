"use client"

import type React from "react"
import type { Editor } from "@tiptap/react"
import { createContext, useContext } from "react"

interface EditorContextType {
  editor: Editor | null
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children, editor }: { children: React.ReactNode; editor: Editor | null }) {
  return <EditorContext.Provider value={{ editor }}>{children}</EditorContext.Provider>
}

export function useEditorContext() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditorContext must be used within an EditorProvider")
  }
  return context
}
