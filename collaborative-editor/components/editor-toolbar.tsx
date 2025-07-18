"use client"

import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null
  }

  const toolbarButtons = [
    {
      icon: "↶",
      label: "Undo",
      shortcut: "Ctrl+Z",
      action: () => editor.chain().focus().undo().run(),
      isActive: false,
      isDisabled: !editor.can().undo(),
    },
    {
      icon: "↷",
      label: "Redo",
      shortcut: "Ctrl+Shift+Z",
      action: () => editor.chain().focus().redo().run(),
      isActive: false,
      isDisabled: !editor.can().redo(),
    },
  ]

  const formatButtons = [
    {
      icon: "𝐁",
      label: "Bold",
      shortcut: "Ctrl+B",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      isDisabled: false,
    },
    {
      icon: "𝐼",
      label: "Italic",
      shortcut: "Ctrl+I",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      isDisabled: false,
    },
    {
      icon: "U̲",
      label: "Underline",
      shortcut: "Ctrl+U",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
      isDisabled: false,
    },
  ]

  const headingButtons = [
    {
      icon: "H1",
      label: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
      isDisabled: false,
    },
    {
      icon: "H2",
      label: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      isDisabled: false,
    },
    {
      icon: "H3",
      label: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
      isDisabled: false,
    },
  ]

  const listButtons = [
    {
      icon: "•",
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      isDisabled: false,
    },
    {
      icon: "1.",
      label: "Numbered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      isDisabled: false,
    },
    {
      icon: "❝",
      label: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
      isDisabled: false,
    },
  ]

  const insertButtons = [
    {
      icon: "🔗",
      label: "Link",
      shortcut: "Ctrl+K",
      action: () => {
        const url = window.prompt("Enter URL:")
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
      },
      isActive: editor.isActive("link"),
      isDisabled: false,
    },
    {
      icon: "{ }",
      label: "Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
      isDisabled: false,
    },
  ]

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-1 p-2 overflow-x-auto">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          {toolbarButtons.map((button) => (
            <Button
              key={button.label}
              variant={button.isActive ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 text-xs"
              title={`${button.label} (${button.shortcut})`}
              onClick={button.action}
              disabled={button.isDisabled}
            >
              {button.icon}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          {formatButtons.map((button) => (
            <Button
              key={button.label}
              variant={button.isActive ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 text-xs"
              title={`${button.label} (${button.shortcut})`}
              onClick={button.action}
              disabled={button.isDisabled}
            >
              {button.icon}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          {headingButtons.map((button) => (
            <Button
              key={button.label}
              variant={button.isActive ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 text-xs"
              title={button.label}
              onClick={button.action}
              disabled={button.isDisabled}
            >
              {button.icon}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          {listButtons.map((button) => (
            <Button
              key={button.label}
              variant={button.isActive ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 text-xs"
              title={button.label}
              onClick={button.action}
              disabled={button.isDisabled}
            >
              {button.icon}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Insert */}
        <div className="flex items-center gap-1">
          {insertButtons.map((button) => (
            <Button
              key={button.label}
              variant={button.isActive ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 text-xs"
              title={button.shortcut ? `${button.label} (${button.shortcut})` : button.label}
              onClick={button.action}
              disabled={button.isDisabled}
            >
              {button.icon}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
