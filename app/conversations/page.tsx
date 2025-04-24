"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConversationsPage() {
  const router = useRouter()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar />

      {/* Empty state content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Select a conversation</h1>
          <p className="text-muted-foreground mb-6">
            Choose an existing conversation from the sidebar or start a new one by searching for users.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push("/chat/new")}
            >
              <Users className="w-4 h-4" />
              Find People
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                // Open sidebar on mobile - update the selector to match the aria-label
                const sidebarButton = document.querySelector("button[aria-label='Open sidebar']") as HTMLButtonElement
                if (sidebarButton) {
                  sidebarButton.click()
                }
              }}
            >
              <MessageCircle className="w-4 h-4" />
              View Conversations
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

