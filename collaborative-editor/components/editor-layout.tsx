"use client"

import { useState, useEffect } from "react"
import { DocumentSidebar } from "./document-sidebar"
import { CollaborativeEditor } from "./collaborative-editor"
import { UserPresence } from "./user-presence"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useAuth } from "./auth-provider"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Globe, Lock } from "lucide-react"

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

// Global document storage - simulates a database
const GLOBAL_DOCUMENTS_KEY = "collaborative_editor_all_documents"

// Helper functions for document storage
const saveAllDocuments = (documents: Document[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(GLOBAL_DOCUMENTS_KEY, JSON.stringify(documents))
  }
}

const loadAllDocuments = (): Document[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(GLOBAL_DOCUMENTS_KEY)
    if (stored) {
      const docs = JSON.parse(stored)
      // Convert date strings back to Date objects
      return docs.map((doc: any) => ({
        ...doc,
        lastEdited: new Date(doc.lastEdited),
        activeUsers:
          doc.activeUsers?.map((user: any) => ({
            ...user,
            lastSeen: new Date(user.lastSeen),
          })) || [],
      }))
    }
  } catch (error) {
    console.error("Error loading documents:", error)
  }

  return []
}

// Sample documents for demonstration
const getSampleDocuments = (): Document[] => [
  {
    id: "sample-1",
    title: "Welcome to Collaborative Editor",
    content:
      "<h1>Welcome to Collaborative Editor! 🎉</h1><p>This is a sample public document that everyone can see and edit.</p><h2>Features</h2><ul><li><strong>Real-time collaboration</strong> - See other users editing</li><li><em>Rich text formatting</em> - Bold, italic, headings, lists</li><li><u>Document sharing</u> - Make documents public or private</li><li>Auto-save functionality</li></ul><h2>Try These Features</h2><ol><li>Use the toolbar buttons to format text</li><li>Create a new document with the + button</li><li>Make your document public to share with others</li><li>Check out the different document tabs</li></ol><blockquote><p>💡 Tip: Use keyboard shortcuts like Ctrl+B for bold, Ctrl+I for italic!</p></blockquote>",
    lastEdited: new Date(Date.now() - 3600000),
    createdBy: "system",
    createdByName: "System",
    collaborators: [],
    isPublic: true,
    activeUsers: [],
  },
  {
    id: "sample-2",
    title: "Team Project Planning",
    content:
      "<h1>Team Project Planning</h1><p>This document outlines our upcoming project goals and timeline.</p><h2>Project Goals</h2><ul><li>Improve user experience</li><li>Add new collaboration features</li><li>Optimize performance</li><li>Enhance mobile support</li></ul><h2>Timeline</h2><ol><li><strong>Week 1-2:</strong> Research and planning</li><li><strong>Week 3-4:</strong> Design and prototyping</li><li><strong>Week 5-6:</strong> Development phase 1</li><li><strong>Week 7-8:</strong> Testing and refinement</li></ol><h2>Team Members</h2><ul><li>Alice Johnson - Project Lead</li><li>Bob Smith - Developer</li><li>Carol Davis - Designer</li></ul>",
    lastEdited: new Date(Date.now() - 1800000),
    createdBy: "alice-demo",
    createdByName: "Alice Johnson",
    collaborators: [],
    isPublic: true,
    activeUsers: [
      {
        id: "alice-demo",
        name: "Alice Johnson",
        color: "bg-blue-500",
        lastSeen: new Date(Date.now() - 300000),
      },
    ],
  },
  {
    id: "sample-3",
    title: "Code Review Guidelines",
    content:
      "<h1>Code Review Guidelines</h1><p>Best practices for conducting effective code reviews.</p><h2>Before Submitting Code</h2><ul><li>Run all tests locally</li><li>Check code formatting and linting</li><li>Add appropriate documentation</li><li>Test edge cases</li></ul><h2>Review Process</h2><ol><li>Create a pull request with clear description</li><li>Request reviewers from the team</li><li>Address all feedback promptly</li><li>Merge only after approval</li></ol><h2>What to Look For</h2><ul><li><strong>Functionality:</strong> Does the code work as intended?</li><li><strong>Readability:</strong> Is the code easy to understand?</li><li><strong>Performance:</strong> Are there any performance issues?</li><li><strong>Security:</strong> Are there any security vulnerabilities?</li></ul><blockquote><p>Remember: Code reviews are about improving code quality, not criticizing the author.</p></blockquote>",
    lastEdited: new Date(Date.now() - 7200000),
    createdBy: "bob-demo",
    createdByName: "Bob Smith",
    collaborators: [],
    isPublic: true,
    activeUsers: [],
  },
]

export function EditorLayout() {
  const { user, logout } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeDocument, setActiveDocument] = useState<Document | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize documents when component mounts
  useEffect(() => {
    if (!mounted) return

    // Load all documents from storage
    let allDocs = loadAllDocuments()

    // If no documents exist, add sample documents
    if (allDocs.length === 0) {
      allDocs = getSampleDocuments()
      saveAllDocuments(allDocs)
    }

    setDocuments(allDocs)

    // Set active document to first available document
    if (allDocs.length > 0) {
      // Try to find user's first document, otherwise use first public document
      const userDoc = allDocs.find((doc) => doc.createdBy === user?.id)
      const firstDoc = userDoc || allDocs.find((doc) => doc.isPublic) || allDocs[0]
      setActiveDocument(firstDoc)
    }
  }, [mounted, user])

  // Save documents whenever they change
  useEffect(() => {
    if (mounted && documents.length > 0) {
      saveAllDocuments(documents)
    }
  }, [documents, mounted])

  const createNewDocument = (title: string, isPublic: boolean) => {
    if (!user) return

    const newDoc: Document = {
      id: `doc_${Date.now()}_${user.id}`,
      title: title,
      content: "<p>Start writing your document here...</p>",
      lastEdited: new Date(),
      createdBy: user.id,
      createdByName: user.name,
      collaborators: [],
      isPublic: isPublic,
      activeUsers: [],
    }

    setDocuments((prev) => {
      const updated = [newDoc, ...prev]
      return updated
    })
    setActiveDocument(newDoc)
  }

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments((prev) => {
      const updated = prev.map((doc) => (doc.id === id ? { ...doc, ...updates, lastEdited: new Date() } : doc))
      return updated
    })

    if (activeDocument?.id === id) {
      setActiveDocument((prev) => (prev ? { ...prev, ...updates, lastEdited: new Date() } : null))
    }
  }

  const deleteDocument = (id: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((doc) => doc.id !== id)
      return updated
    })

    if (activeDocument?.id === id) {
      const remainingDocs = documents.filter((doc) => doc.id !== id)
      setActiveDocument(remainingDocs[0] || null)
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative z-50 lg:z-0 h-full transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          !sidebarOpen && "lg:w-0 lg:overflow-hidden",
        )}
      >
        <DocumentSidebar
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={setActiveDocument}
          onCreateDocument={createNewDocument}
          onUpdateDocument={updateDocument}
          onDeleteDocument={deleteDocument}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              {sidebarOpen ? <span className="text-sm">✕</span> : <span className="text-sm">☰</span>}
            </Button>
            <h1 className="text-lg font-semibold truncate">{activeDocument?.title || "No Document Selected"}</h1>
            {activeDocument && (
              <div className="flex items-center gap-2">
                {activeDocument.isPublic ? (
                  <Badge variant="secondary" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <UserPresence />
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <span className="text-sm">☀️</span> : <span className="text-sm">🌙</span>}
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
              <span className="text-sm">🚪</span>
            </Button>
          </div>
        </header>

        {/* Editor */}
        <main className="flex-1 overflow-hidden">
          {activeDocument ? (
            <CollaborativeEditor
              document={activeDocument}
              onUpdateDocument={(updates) => updateDocument(activeDocument.id, updates)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">No Document Selected</h2>
                <p>Select a document from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
