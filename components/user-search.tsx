"use client"

import { getInitials } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

interface User {
  id: string
  username: string
  profilePicture: string
}

interface UserSearchProps {
  results: User[]
  loading: boolean
  onSelectUser: (id: string, username: string) => void
}

export function UserSearch({ results, loading, onSelectUser }: UserSearchProps) {
  if (loading) {
    return (
      <div className="mt-3 space-y-2 border rounded-xl p-2 bg-background/80 backdrop-blur-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 border rounded-xl overflow-hidden shadow-lg bg-background/80 backdrop-blur-sm"
    >
      <div className="p-2 bg-muted/50 border-b">
        <h3 className="text-sm font-medium">Search Results</h3>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {results.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center p-3 hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => onSelectUser(user.id, user.username)}
          >
            <Avatar className="h-10 w-10 mr-3">
              {user.profilePicture ? (
                <AvatarImage src={user.profilePicture} alt={user.username} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.username)}</AvatarFallback>
              )}
            </Avatar>

            <div>
              <h4 className="font-medium">{user.username}</h4>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

