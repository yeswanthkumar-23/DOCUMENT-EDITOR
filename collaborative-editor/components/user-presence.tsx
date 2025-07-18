"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  avatar?: string
  color: string
  isTyping?: boolean
}

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    color: "bg-blue-500",
    isTyping: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    color: "bg-green-500",
  },
  {
    id: "3",
    name: "Carol Davis",
    color: "bg-purple-500",
  },
]

export function UserPresence() {
  return (
    <div className="flex items-center gap-2">
      {/* Active users */}
      <div className="flex -space-x-2">
        {mockUsers.map((user) => (
          <div key={user.id} className="relative">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className={cn("text-white text-xs", user.color)}>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {user.isTyping && (
              <div className="absolute -bottom-1 -right-1">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Online count */}
      <Badge variant="secondary" className="text-xs">
        {mockUsers.length} online
      </Badge>
    </div>
  )
}
