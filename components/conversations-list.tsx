"use client"

import { formatRelativeTime, truncateText, getInitials } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface Conversation {
  id: string
  username: string
  profilePicture: string | null
  fullName: string
  lastChat: string
  lastMessage: string
  hasSeen: boolean
}

interface ConversationsListProps {
  conversations: Conversation[]
  loading: boolean
  onSelect: (id: string, username: string) => void
  selectedId?: string
}

export function ConversationsList({ conversations, loading, onSelect, selectedId }: ConversationsListProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-3 w-[180px]" />
            </div>
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
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
            <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
            <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Search for users to start messaging and connect with friends
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`p-3 hover:bg-accent/50 cursor-pointer transition-colors ${
            selectedId === conversation.id ? "bg-accent" : ""
          }`}
          onClick={() => onSelect(conversation.id, conversation.username)}
        >
          <div className="flex items-start space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border">
                {conversation.profilePicture ? (
                  <AvatarImage src={conversation.profilePicture} alt={conversation.fullName} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(conversation.fullName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium truncate">{conversation.fullName}</h3>
                {conversation.lastChat && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatRelativeTime(conversation.lastChat)}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground">@{conversation.username}</p>

              {conversation.lastMessage ? (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate max-w-[85%]">
                    {truncateText(conversation.lastMessage, 40)}
                  </p>
                  {!conversation.hasSeen && (
                    <Badge
                      variant="default"
                      className="ml-auto rounded-full h-5 w-5 p-0 flex items-center justify-center"
                    >
                      1
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-1">No messages yet</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

