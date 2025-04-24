"use client"
import { formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Copy, Trash2, ExternalLink, Check } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: string
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  onDelete: () => void
  onImageClick: (imageUrl: string) => void
}

export function MessageBubble({ message, isOwn, onDelete, onImageClick }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false)

  // URL matching patterns
  const urlPattern = /https?:\/\/[^\s]+/
  const imagePattern = /https?:\/\/[^\s]+\.(jpeg|jpg|gif|png)$/i
  const videoPattern = /https?:\/\/[^\s]+\.(mp4|webm|ogg)$/i
  const isVideoCall = message.content.includes("Video call:")

  const isUrl = urlPattern.test(message.content)
  const isImage = imagePattern.test(message.content)
  const isVideo = videoPattern.test(message.content)

  // File message pattern
  const filePattern = /^----------\((.*?)\)>(.*?)\]\n(.*?)\n==========$/;
  const fileMatch = message.content.match(filePattern);

  const renderContent = () => {
    if (fileMatch) {
      const [_, fileName, fileType, url] = fileMatch

      switch (fileType) {
        case "image":
          return (
            <div className="space-y-1">
              <div 
                className="overflow-hidden rounded-xl max-w-[300px] md:max-w-[400px] cursor-pointer group relative"
                onClick={() => onImageClick(url)}
              >
                <img
                  src={url || "/placeholder.svg"}
                  alt={fileName}
                  className="block w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div className="flex justify-between items-center px-1 pt-1">
                <span className="text-xs text-muted-foreground">{fileName}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </div>
            </div>
          )

        case "video":
          return (
            <div className="space-y-1">
              <div className="overflow-hidden rounded-xl max-w-[300px] md:max-w-[400px] bg-black">
                <video src={url} controls className="block w-full h-auto" />
              </div>
              <div className="flex justify-between items-center px-1 pt-1">
                <span className="text-xs text-muted-foreground">{fileName}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </div>
            </div>
          )

        case "audio":
          return (
            <div className="space-y-2 py-2 px-3">
              <audio src={url} controls className="w-full h-10" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{fileName}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </div>
            </div>
          )

        default:
          if (!fileMatch) return null; 
          const [_, matchedFileName, matchedFileType, matchedUrl] = fileMatch;

          return (
            <div className="space-y-1">
              <a 
                href={matchedUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-secondary/50 hover:bg-secondary/70 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-background rounded-md shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{matchedFileName}</span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {matchedFileType.toUpperCase()} File • Click to open
                  </div>
                </div>
              </a>
            </div>
          )
      }
    }

    if (isVideoCall) {
      const callUrl = message.content.split("Video call: ")[1]
      return (
        <div className="space-y-2 p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="font-medium flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path>
              <path d="m22 8-6 4 6 4V8Z"></path>
            </svg>
            Video Call Link
          </div>
          <a
            href={callUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center text-sm font-medium"
          >
            Join call <ExternalLink className="ml-1.5 h-4 w-4" />
          </a>
        </div>
      )
    }

    if (isImage) {
      return (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg">
            <img
              src={message.content || "/placeholder.svg"}
              alt="Shared image"
              className="max-w-[300px] object-cover hover:scale-105 transition-transform cursor-pointer"
              onClick={() => onImageClick(message.content)}
            />
          </div>
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Open original
          </a>
        </div>
      )
    }

    if (isVideo) {
      return (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg">
            <video src={message.content} controls className="max-w-[300px]" />
          </div>
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Open original
          </a>
        </div>
      )
    }

    if (isUrl) {
      return (
        <a
          href={message.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {message.content}
        </a>
      )
    }

    return <span className="break-words">{message.content}</span>
  }

  const handleCopy = () => {
    let contentToCopy = message.content;
    if (fileMatch) {
      contentToCopy = fileMatch[3];
    } else if (isVideoCall) {
      contentToCopy = message.content.split("Video call: ")[1];
    }
    navigator.clipboard.writeText(contentToCopy)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"))
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          className={cn(
            "flex gap-2.5 my-3 relative group",
            isOwn ? "justify-end" : "justify-start"
          )}
          onMouseEnter={() => setShowTimestamp(true)}
          onMouseLeave={() => setShowTimestamp(false)}
        >
          <div 
            className={cn(
              "py-2 px-3 rounded-xl max-w-[75%] md:max-w-[65%] shadow-sm relative",
              isOwn 
                ? "bg-primary text-primary-foreground rounded-br-none" 
                : "bg-muted rounded-bl-none" 
            )}
          >
            {renderContent()}

            <div 
              className={cn(
                "absolute text-[10px] whitespace-nowrap transition-opacity duration-200",
                isOwn 
                  ? "-bottom-4 right-1 text-muted-foreground/80" 
                  : "-bottom-4 left-1 text-muted-foreground/80",
                showTimestamp ? "opacity-100" : "opacity-0"
              )}
              aria-hidden={!showTimestamp}
            >
              {formatRelativeTime(message.timestamp)}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" /> Copy
        </ContextMenuItem>
        {isOwn && (
          <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

