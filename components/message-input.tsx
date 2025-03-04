"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, Smile, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size exceeds 10MB limit")
        return
      }

      onSendMessage("", file)
      e.target.value = "" // Reset file input
    }
  }

  const handleMicClick = () => {
    // Toggle recording state for visual feedback
    setIsRecording(!isRecording)

    // In a real app, this would handle voice recording
    if (!isRecording) {
      toast.info("Voice recording is not implemented in this demo")
    }
  }

  return (
    <div className="border-t bg-background p-3 sticky bottom-0">
      <div className="flex items-end gap-2 relative">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Attach file</span>
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*"
        />

        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn(
              "resize-none py-3 pr-12 min-h-[56px] max-h-[160px] rounded-2xl",
              "focus-visible:ring-0 focus-visible:ring-offset-0 border-muted",
            )}
          />
          <Button variant="ghost" size="icon" className="absolute right-2 bottom-2 h-8 w-8 rounded-full">
            <Smile className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Add emoji</span>
          </Button>
        </div>

        {message.trim() ? (
          <Button
            onClick={handleSend}
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0 bg-primary hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        ) : (
          <Button
            onClick={handleMicClick}
            size="icon"
            className={cn(
              "rounded-full h-10 w-10 flex-shrink-0",
              isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90",
            )}
          >
            <Mic className="h-5 w-5" />
            <span className="sr-only">Voice message</span>
          </Button>
        )}
      </div>
    </div>
  )
}

