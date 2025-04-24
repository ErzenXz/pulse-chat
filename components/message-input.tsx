"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Send, Smile, Mic, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void
  onFocus?: () => void
  onChange?: () => void
}

export function MessageInput({ onSendMessage, onFocus, onChange }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string>("")
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    onChange?.()
  }

  const handleSendMessage = () => {
    if (!message.trim() && !selectedFile) return

    onSendMessage(message, selectedFile || undefined)
    setMessage("")
    setSelectedFile(null)
    setSelectedFileName("")
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setSelectedFileName(file.name)
      onChange?.()
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    setSelectedFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="border-t bg-background p-3">
      {selectedFileName && (
        <div className="mb-2 flex items-center gap-2 p-2 rounded-lg bg-accent/50 text-sm">
          <Paperclip className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs truncate flex-1">{selectedFileName}</span>
          <Button
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 rounded-full"
            onClick={clearSelectedFile}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={handleMessageChange}
            onFocus={onFocus}
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[44px] max-h-[160px] overflow-y-auto resize-none py-3 pr-10 rounded-lg bg-accent/50 border-0 focus-visible:ring-1 focus-visible:ring-primary",
              "placeholder:text-muted-foreground text-sm"
            )}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*,application/pdf"
          />
          
          <div className="absolute bottom-2 right-3 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={triggerFileInput}
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
            >
              <Smile className="h-4 w-4" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
        </div>
        
        <Button
          size="icon"
          className="h-[44px] w-[44px] rounded-full shrink-0 bg-primary text-primary-foreground"
          onClick={handleSendMessage}
          disabled={(!message.trim() && !selectedFile) || isRecording}
        >
          {isRecording ? (
            <Mic className="h-5 w-5 text-red-500 animate-pulse" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  )
}

