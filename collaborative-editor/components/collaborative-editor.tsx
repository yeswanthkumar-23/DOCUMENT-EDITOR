"use client"

import { useEffect, useRef, useState } from "react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { EditorContent, useEditor } from "@tiptap/react"
import { EditorToolbar } from "./editor-toolbar"
import { useAuth } from "./auth-provider"
import { cn } from "@/lib/utils"

const lowlight = createLowlight(common)

interface Document {
  id: string
  title: string
  content: string
  lastEdited: Date
  createdBy: string
  createdByName: string
  collaborators: string[]
  isPublic: boolean
  activeUsers: Array<{
    id: string
    name: string
    color: string
    lastSeen: Date
  }>
}

interface CollaborativeEditorProps {
  document: Document
  onUpdateDocument: (updates: Partial<Document>) => void
}

export function CollaborativeEditor({ document, onUpdateDocument }: CollaborativeEditorProps) {
  const { user } = useAuth()
  const [isTyping, setIsTyping] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const presenceTimeoutRef = useRef<NodeJS.Timeout>()
  const [mounted, setMounted] = useState(false)

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          codeBlock: false,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline underline-offset-2 hover:text-primary/80",
          },
        }),
        Underline,
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: "bg-muted p-4 rounded-lg font-mono text-sm",
          },
        }),
      ],
      content: document.content,
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
            "dark:prose-invert prose-headings:font-bold prose-headings:text-foreground",
            "prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground",
            "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
            "prose-pre:bg-muted prose-pre:text-foreground",
            "prose-blockquote:text-muted-foreground prose-blockquote:border-l-border",
            "prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground",
            "min-h-[500px] p-8",
          ),
        },
      },
      onUpdate: ({ editor }) => {
        const content = editor.getHTML()

        // Show typing indicator
        setIsTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
        }, 1000)

        // Auto-save with debounce
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => {
          onUpdateDocument({ content })
          setLastSaved(new Date())

          // Update user presence
          updateUserPresence()
        }, 2000)
      },
    },
    [mounted ? document.content : null],
  )

  // Update user presence in the document
  const updateUserPresence = () => {
    if (!user) return

    const currentActiveUsers = document.activeUsers || []
    const userIndex = currentActiveUsers.findIndex((u) => u.id === user.id)

    const updatedActiveUsers = [...currentActiveUsers]

    if (userIndex >= 0) {
      // Update existing user's last seen time
      updatedActiveUsers[userIndex] = {
        ...updatedActiveUsers[userIndex],
        lastSeen: new Date(),
      }
    } else {
      // Add new active user
      updatedActiveUsers.push({
        id: user.id,
        name: user.name,
        color: getUserColor(user.id),
        lastSeen: new Date(),
      })
    }

    // Remove users who haven't been seen in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30000)
    const activeUsers = updatedActiveUsers.filter((u) => u.lastSeen > thirtySecondsAgo || u.id === user.id)

    onUpdateDocument({ activeUsers })
  }

  // Generate consistent color for user
  const getUserColor = (userId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ]
    const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (editor && document.content !== editor.getHTML()) {
      editor.commands.setContent(document.content)
    }
  }, [document.content, editor])

  // Update presence every 10 seconds
  useEffect(() => {
    if (!user || !mounted) return

    const interval = setInterval(() => {
      updateUserPresence()
    }, 10000)

    // Initial presence update
    updateUserPresence()

    return () => clearInterval(interval)
  }, [user, mounted, document.id])

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined" || !editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
            break
          case "i":
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
            break
          case "u":
            e.preventDefault()
            editor.chain().focus().toggleUnderline().run()
            break
          case "k":
            e.preventDefault()
            const url = window.prompt("Enter URL:")
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
            break
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              editor.chain().focus().redo().run()
            } else {
              editor.chain().focus().undo().run()
            }
            break
        }
      }
    }

    if (document && document.addEventListener) {
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        if (document && document.removeEventListener) {
          document.removeEventListener("keydown", handleKeyDown)
        }
      }
    }
  }, [editor, mounted])

  if (!mounted || !editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Document Info Bar */}
      <div className="px-8 py-2 text-xs text-muted-foreground border-b bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>
            Created by: <strong>{document.createdByName}</strong>
          </span>
          {lastSaved && <span>Last saved: {formatTime(lastSaved)}</span>}
          {document.isPublic && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Public</span>}
        </div>

        {/* Active collaborators */}
        <div className="flex items-center gap-2">
          {document.activeUsers && document.activeUsers.length > 0 && (
            <>
              <span>Active:</span>
              <div className="flex -space-x-1">
                {document.activeUsers.slice(0, 5).map((activeUser) => (
                  <div
                    key={activeUser.id}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-medium",
                      activeUser.color,
                    )}
                    title={`${activeUser.name} - ${formatTime(activeUser.lastSeen)}`}
                  >
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {document.activeUsers.length > 5 && (
                  <div className="w-6 h-6 rounded-full border-2 border-background bg-gray-500 flex items-center justify-center text-white text-xs">
                    +{document.activeUsers.length - 5}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-8 py-2 text-sm text-muted-foreground border-b">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span>Saving changes...</span>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-auto relative">
        <EditorContent editor={editor} className="h-full" />

        {/* Simulated collaborative cursors */}
        {document.activeUsers &&
          document.activeUsers
            .filter((u) => u.id !== user?.id)
            .slice(0, 3)
            .map((activeUser, index) => (
              <div
                key={activeUser.id}
                className="absolute pointer-events-none"
                style={{
                  top: `${120 + index * 60}px`,
                  left: `${300 + index * 40}px`,
                }}
              >
                <div className={cn("w-0.5 h-6 animate-pulse", activeUser.color)}>
                  <div
                    className={cn(
                      "absolute -top-6 -left-2 text-white text-xs px-2 py-1 rounded whitespace-nowrap",
                      activeUser.color,
                    )}
                  >
                    {activeUser.name}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
