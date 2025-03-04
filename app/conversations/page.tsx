"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getConversations, searchUsers } from "@/lib/api"
import { ConversationsList } from "@/components/conversations-list"
import { UserSearch } from "@/components/user-search"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, LogOut, Settings, Menu } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

interface Conversation {
  id: string
  username: string
  profilePicture: string | null
  fullName: string
  lastChat: string
  lastMessage: string
  hasSeen: boolean
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { user: authUser, logout } = useAuth()
  const user = useMemo(() => authUser, [authUser])
  const router = useRouter()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const data = await getConversations()
      setConversations(data || [])
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
      toast.error("Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const data = await searchUsers(query)
      setSearchResults(data || [])
    } catch (error) {
      console.error("Search failed:", error)
      toast.error("User search failed")
    } finally {
      setSearching(false)
    }
  }

  const handleCreateConversation = async (selectedConversationId: string, username: string) => {
    try {
      // Close search and navigate to the new conversation
      setShowSearch(false)
      setSearchQuery("")
      setSearchResults([])

      router.push(`/chat/${selectedConversationId}?username=${username}`)
    } catch (error) {
      console.error("Failed to create conversation:", error)
      toast.error("Failed to start conversation")
    }
  }

  const handleConversationSelect = (conversationId: string, username: string) => {
    router.push(`/chat/${conversationId}?username=${username}`)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b py-3 px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 p-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user ? getInitials(user.username) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{user?.username ?? "User"}</h3>
                      <p className="text-xs text-muted-foreground">@{user?.username ?? "username"}</p>
                    </div>
                  </div>
                  <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                      <li>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => router.push("/conversations")}
                        >
                          <svg
                            className="mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Messages
                        </Button>
                      </li>
                      <li>
                        <Button variant="ghost" className="w-full justify-start">
                          <svg
                            className="mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          Contacts
                        </Button>
                      </li>
                      <li>
                        <Button variant="ghost" className="w-full justify-start">
                          <svg
                            className="mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          Help & Support
                        </Button>
                      </li>
                    </ul>
                  </nav>
                  <div className="p-4 border-t">
                    <Button variant="outline" className="w-full" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-semibold">Messages</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowSearch(!showSearch)}>
              {showSearch ? <Plus className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 rounded-full border-muted"
              />
            </div>

            <UserSearch results={searchResults} loading={searching} onSelectUser={handleCreateConversation} />
          </motion.div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        <ConversationsList conversations={conversations} loading={loading} onSelect={handleConversationSelect} />
      </main>
    </div>
  )
}

