"use client"

import { useRef, useEffect, useState } from "react"
import { MessageBubble } from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"

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
  const isFetchingRef = useRef(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [lastMessageId, setLastMessageId] = useState("")
  const lastMessageCountRef = useRef(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle scrolling based on different scenarios
  useEffect(() => {
    // Skip if refs aren't available
    if (!containerRef.current || !messagesEndRef.current) {
      return
    }

    const container = containerRef.current

    // Handle initial load - instant scroll without animation
    if (isInitialLoad && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" })
      setIsInitialLoad(false)
      return
    }

    // Check if new messages have been added
    if (messages.length !== lastMessageCountRef.current) {
      // Get current scroll position and container height
      const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight
      const isNearBottom = scrollBottom < 100
      
      // Track if this is a new message (vs older messages loaded at top)
      const isNewMessageAtBottom = 
        messages.length > lastMessageCountRef.current && 
        messages[messages.length - 1]?.id !== lastMessageId;
        
      // Auto-scroll for new messages when user is at bottom
      if (isNewMessageAtBottom && isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
      
      // Store the last message ID for comparison
      if (messages.length > 0) {
        setLastMessageId(messages[messages.length - 1].id)
      }
    }

    // Update last message count reference
    lastMessageCountRef.current = messages.length
    
    // Add handlers for image loading to ensure proper scrolling
    const imageLoadHandlers: (() => void)[] = []
    const images = container.querySelectorAll('img')
    
    const handleImageLoad = () => {
      // When images load, check if we should scroll
      if (isInitialLoad) {
        // Initial load - instant scroll
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      } else {
        // New message - smooth scroll if near bottom
        const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight
        const isNearBottom = scrollBottom < 100
        
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
    
    // Add load event listeners to any incomplete images
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', handleImageLoad)
        imageLoadHandlers.push(() => img.removeEventListener('load', handleImageLoad))
      }
    })
    
    // Clean up image load event listeners
    return () => {
      imageLoadHandlers.forEach(cleanup => cleanup())
    }
  }, [messages, isInitialLoad, lastMessageId])

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
            <Button variant="ghost" disabled className="rounded-full whitespace-nowrap flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
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
      <AnimatePresence initial={false} mode="popLayout">
        {sortedDates.map((date) => (
          <motion.div 
            key={date} 
            className="mb-6 max-w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
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

            <AnimatePresence initial={false} mode="popLayout">
              {groupedMessages[date].map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.15,
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                >
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === currentUserId}
                    onDelete={() => onDeleteMessage(message.id)}
                    onImageClick={onImageClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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

