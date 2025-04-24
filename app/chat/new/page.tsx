"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, ArrowLeft, Users } from "lucide-react"
import { searchUsers } from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { toast } from "sonner"

interface User {
  id: string
  username: string
  fullName: string
  profilePicture: string
}

export default function NewChatPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const data = await searchUsers(searchQuery)
      if (Array.isArray(data)) {
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Failed to search users:", error)
      toast.error("Failed to search users")
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleUserSelect = (username: string) => {
    router.push(`/chat/new?username=${username}`)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b py-3 px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/conversations")}
              className="mr-3 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-semibold">New Conversation</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            {/* Search bar */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-3">Find Users</h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or username..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Search results */}
            {searchResults.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Search Results</h3>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                      onClick={() => handleUserSelect(user.username)}
                    >
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={user.profilePicture} alt={user.fullName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                {isSearching ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {searchQuery ? (
                      <>
                        <div className="rounded-full bg-muted p-3 inline-flex mb-4">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">No users found</h3>
                        <p className="text-sm text-muted-foreground">
                          Try a different search term or check the spelling
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="rounded-full bg-primary/10 p-4 inline-flex mb-4">
                          <Search className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Search for users</h3>
                        <p className="text-sm text-muted-foreground">
                          Find people by name or username to start a conversation
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 