"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, MoreHorizontal, Edit, Trash2, X, Users, Globe, Lock, Save } from "lucide-react"
import { useAuth } from "./auth-provider"
import { cn } from "@/lib/utils"

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

interface DocumentSidebarProps {
  documents: Document[]
  activeDocument: Document | null
  onSelectDocument: (doc: Document) => void
  onCreateDocument: (title: string, isPublic: boolean) => void
  onUpdateDocument: (id: string, updates: Partial<Document>) => void
  onDeleteDocument: (id: string) => void
  onClose: () => void
}

export function DocumentSidebar({
  documents,
  activeDocument,
  onSelectDocument,
  onCreateDocument,
  onUpdateDocument,
  onDeleteDocument,
  onClose,
}: DocumentSidebarProps) {
  const { user } = useAuth()
  const [createDialog, setCreateDialog] = useState(false)
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; document: Document | null }>({
    open: false,
    document: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; document: Document | null }>({
    open: false,
    document: null,
  })
  const [shareDialog, setShareDialog] = useState<{ open: boolean; document: Document | null }>({
    open: false,
    document: null,
  })
  const [newTitle, setNewTitle] = useState("")
  const [newDocTitle, setNewDocTitle] = useState("")
  const [newDocIsPublic, setNewDocIsPublic] = useState(false)

  const handleCreateDocument = () => {
    if (newDocTitle.trim()) {
      onCreateDocument(newDocTitle.trim(), newDocIsPublic)
      setCreateDialog(false)
      setNewDocTitle("")
      setNewDocIsPublic(false)
    }
  }

  const handleRename = () => {
    if (renameDialog.document && newTitle.trim()) {
      onUpdateDocument(renameDialog.document.id, { title: newTitle.trim() })
      setRenameDialog({ open: false, document: null })
      setNewTitle("")
    }
  }

  const handleDelete = () => {
    if (deleteDialog.document) {
      onDeleteDocument(deleteDialog.document.id)
      setDeleteDialog({ open: false, document: null })
    }
  }

  const handleTogglePublic = (document: Document, isPublic: boolean) => {
    onUpdateDocument(document.id, { isPublic })
    setShareDialog({ open: false, document: null })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // Filter documents
  const myDocuments = documents.filter((doc) => doc.createdBy === user?.id)
  const sharedDocuments = documents.filter(
    (doc) => doc.createdBy !== user?.id && (doc.isPublic || doc.collaborators.includes(user?.id || "")),
  )
  const publicDocuments = documents.filter((doc) => doc.isPublic && doc.createdBy !== user?.id)

  const DocumentList = ({ docs, showOwner = false }: { docs: Document[]; showOwner?: boolean }) => (
    <div className="space-y-1">
      {docs.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">No documents found</p>
          <p className="text-xs">
            {showOwner ? "Documents shared with you will appear here" : "Create your first document"}
          </p>
        </div>
      ) : (
        docs.map((doc) => (
          <div
            key={doc.id}
            className={cn(
              "group relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
              activeDocument?.id === doc.id && "bg-accent",
            )}
            onClick={() => onSelectDocument(doc)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{doc.title}</h3>
                  {doc.isPublic && <Globe className="h-3 w-3 text-green-500" title="Public document" />}
                  {!doc.isPublic && <Lock className="h-3 w-3 text-muted-foreground" title="Private document" />}
                  {doc.activeUsers && doc.activeUsers.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {doc.activeUsers.length} online
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatDate(doc.lastEdited)}</span>
                  {showOwner && (
                    <>
                      <span>•</span>
                      <span>by {doc.createdByName}</span>
                    </>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {doc.createdBy === user?.id && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setRenameDialog({ open: true, document: doc })
                          setNewTitle(doc.title)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setShareDialog({ open: true, document: doc })
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Share Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteDialog({ open: true, document: doc })
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  {doc.createdBy !== user?.id && (
                    <DropdownMenuItem disabled>
                      <Users className="h-4 w-4 mr-2" />
                      {doc.isPublic ? "Public document" : "Shared with you"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <>
      <div className="w-80 h-full bg-muted/30 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Documents</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setCreateDialog(true)} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </div>

        {/* Document Lists */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <Tabs defaultValue="my-docs" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="my-docs" className="text-xs">
                  My Docs ({myDocuments.length})
                </TabsTrigger>
                <TabsTrigger value="shared" className="text-xs">
                  Shared ({sharedDocuments.length})
                </TabsTrigger>
                <TabsTrigger value="public" className="text-xs">
                  Public ({publicDocuments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-docs" className="mt-0">
                <DocumentList docs={myDocuments} />
              </TabsContent>

              <TabsContent value="shared" className="mt-0">
                <DocumentList docs={sharedDocuments} showOwner />
              </TabsContent>

              <TabsContent value="public" className="mt-0">
                <DocumentList docs={publicDocuments} showOwner />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* Create Document Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Document Title</Label>
              <Input
                id="doc-title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Enter document title"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateDocument()
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-new">Make Public</Label>
                <p className="text-sm text-muted-foreground">Anyone can view and edit this document</p>
              </div>
              <Switch id="public-new" checked={newDocIsPublic} onCheckedChange={setNewDocIsPublic} />
            </div>
            {newDocIsPublic && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🌍 This document will be visible to all users
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDocument} disabled={!newDocTitle.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open, document: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Document title"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, document: null })}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog.open} onOpenChange={(open) => setShareDialog({ open, document: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-toggle">Public Document</Label>
                <p className="text-sm text-muted-foreground">Anyone can view and edit this document</p>
              </div>
              <Switch
                id="public-toggle"
                checked={shareDialog.document?.isPublic || false}
                onCheckedChange={(checked) => {
                  if (shareDialog.document) {
                    handleTogglePublic(shareDialog.document, checked)
                  }
                }}
              />
            </div>

            {shareDialog.document?.isPublic ? (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🌍 This document is public and visible to all users
                </p>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">🔒 This document is private</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialog({ open: false, document: null })}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, document: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{deleteDialog.document?.title}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, document: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
