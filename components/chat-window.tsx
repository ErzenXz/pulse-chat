"use client"

import { useRef, useEffect } from "react"
import { MessageBubble } from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: string
}

interface ChatWindowProps {
  messages: Message[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onDeleteMessage: (messageId: string) => void
  onImageClick: (imageUrl: string) => void
  currentUserId: string
}

export function ChatWindow({
  messages,
  loading,
  hasMore,
  onLoadMore,
  onDeleteMessage,
  onImageClick,
  currentUserId,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false) // new flag

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Set up intersection observer using containerRef as root.
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    if (!containerRef.current) return
  
    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0]
      // Only trigger onLoadMore when container is near top,
      // at least one message exists, no current fetch in progress, and scrollTop is very small.
      if (
        entry.isIntersecting &&
        hasMore &&
        !loading &&
        !isFetchingRef.current &&
        containerRef.current!.scrollTop < 20 &&
        messages.length > 0
      ) {
        isFetchingRef.current = true
        onLoadMore()
      }
    }, { root: containerRef.current, threshold: 0.5 })
  
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
  
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [hasMore, loading, onLoadMore, messages])

  // Reset isFetching after messages change (fetch finished)
  useEffect(() => {
    if (!loading) {
      isFetchingRef.current = false
    }
  }, [loading])

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = new Date(message.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    },
    {} as Record<string, Message[]>,
  )

  // Sort dates
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col max-w-full">
      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-2 mb-4">
          {loading ? (
            <Button variant="ghost" disabled className="rounded-full whitespace-nowrap">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading older messages
            </Button>
          ) : (
            <Button variant="outline" onClick={onLoadMore} size="sm" className="rounded-full whitespace-nowrap">
              Load older messages
            </Button>
          )}
        </div>
      )}

      {/* Messages grouped by date */}
      {sortedDates.map((date) => (
        <div key={date} className="mb-6 max-w-full">
          <div className="flex items-center justify-center mb-4">
            <Separator className="flex-grow" />
            <span className="mx-4 text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-full whitespace-nowrap">
              {new Date(date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
            <Separator className="flex-grow" />
          </div>

          {groupedMessages[date].map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              onDelete={() => onDeleteMessage(message.id)}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      ))}

      {/* Empty state */}
      {!loading && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-primary"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="15" y2="10" />
              <line x1="12" y1="7" x2="12" y2="13" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Start the conversation by sending a message below
          </p>
        </motion.div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}

