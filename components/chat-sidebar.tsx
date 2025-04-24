"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getConversations, searchUsers } from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { Separator } from "@/components/ui/separator"
import { Search, Settings, Menu, Users, Moon, Sun, LogOut } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { storeConversations, getConversationsFromDB } from "@/lib/indexeddb"
import { ThemeSelector } from "@/components/theme-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"

interface Conversation {
  id: string
  username: string
  fullName: string
  profilePicture: string
  lastMessage: string
  lastChat: string
  hasSeen: boolean
}

interface User {
  id: string
  username: string
  fullName: string
  profilePicture: string
}

interface ChatSidebarProps {
  currentChatId?: string
}

export function ChatSidebar({ currentChatId }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const fetchConversationsFromDB = useCallback(async () => {
    try {
      setIsLoadingFromCache(true)
      const cachedConversations = await getConversationsFromDB()
      
      if (cachedConversations.length > 0) {
        setConversations(cachedConversations as unknown as Conversation[])
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to load conversations from IndexedDB:", error)
      return false
    } finally {
      setIsLoadingFromCache(false)
    }
  }, [])

  const fetchConversationsFromAPI = useCallback(async () => {
    try {
      setIsFetching(true)
      const data = await getConversations()
      if (Array.isArray(data)) {
        setConversations(data)
        // Cache conversations to IndexedDB
        await storeConversations(data)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
      toast.error("Failed to load conversations")
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    // Try to load conversations from IndexedDB first
    fetchConversationsFromDB().then((hasCache) => {
      // Fetch from API regardless to update cache
      fetchConversationsFromAPI()
    })
  }, [fetchConversationsFromDB, fetchConversationsFromAPI])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      const data = await searchUsers(searchQuery)
      if (Array.isArray(data)) {
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Failed to search users:", error)
      toast.error("Failed to search users")
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear search results if query is empty
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleUserSelect = (username: string) => {
    router.push(`/chat/new?username=${username}`, { scroll: false })
    setSearchQuery("")
    setSearchResults([])
    setIsSearching(false)
  }

  const handleConversationSelect = (id: string, username: string) => {
    // Pass scroll: false as the second parameter to prevent page refresh effect
    router.push(`/chat/${id}?username=${username}`, { scroll: false })
    setIsMobileSidebarOpen(false)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return "Just now";
    }
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // Less than 24 hours, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // Less than 7 days, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const truncateMessage = (message: string, maxLength = 30) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden fixed left-4 top-4 z-50 rounded-full"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-20 w-80 flex-shrink-0 overflow-y-auto border-r bg-background transition-transform duration-200 md:relative md:translate-x-0",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3 px-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages</h2>
            <div className="flex items-center gap-1">
              <ThemeSelector />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <Users className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 pr-12"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 h-7 px-2 text-xs"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              )}
            </div>
          </div>

          {/* Search results */}
          {isSearching && searchResults.length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent cursor-pointer"
                    onClick={() => handleUserSelect(user.username)}
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={user.profilePicture} alt={user.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium">{user.fullName}</div>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Conversations</h3>
            {isFetching && isLoadingFromCache ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Search for users to start a chat
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-2 hover:bg-accent cursor-pointer relative transition-colors duration-200",
                      conversation.id === currentChatId && "bg-accent"
                    )}
                    onClick={() => handleConversationSelect(conversation.id, conversation.username)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={conversation.profilePicture} alt={conversation.fullName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(conversation.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      {!conversation.hasSeen && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground animate-pulse">
                          1
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{conversation.fullName}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.lastChat)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {truncateMessage(conversation.lastMessage)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User profile button */}
          <div className="sticky bottom-0 border-t bg-background p-4">
            {user && (
              <div
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent cursor-pointer"
                onClick={() => router.push('/profile')}
              >
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.name ? getInitials(user.name) : user.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium">{user.name || user.username}</div>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 