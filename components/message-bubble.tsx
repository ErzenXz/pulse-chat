"use client"
import { formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Copy, Trash2, ExternalLink, Check } from "lucide-react"
import { toast } from "sonner"
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
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={url || "/placeholder.svg"}
                  alt={fileName}
                  className="max-w-[300px] object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => onImageClick(url)}
                />
              </div>
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

        case "video":
          return (
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg">
                <video src={url} controls className="max-w-[300px]" />
              </div>
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

        case "audio":
          return (
            <div className="space-y-2">
              <audio src={url} controls className="w-full" />
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
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <div className="p-2 bg-background rounded-md">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H9H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">{fileName}</span>
                  <div className="text-xs text-muted-foreground mt-1">File • Click to download</div>
                </div>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
              >
                <ExternalLink className="h-3 w-3" />
                Download file
              </a>
            </div>
          )
      }
    }

    if (isVideoCall) {
      const callUrl = message.content.split("Video call: ")[1]
      return (
        <div className="space-y-2 p-3 bg-accent/50 rounded-lg">
          <div className="font-medium flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 10L19.5528 7.72361C19.8343 7.58281 20 7.30339 20 7V17C20 17.3034 19.8343 17.5828 19.5528 17.7236L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Video Call
          </div>
          <a
            href={callUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center text-sm"
          >
            Join call <ExternalLink className="ml-1 h-4 w-4" />
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

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}
        >
          <div
            className={cn(
              "max-w-[85%] px-4 py-2 rounded-2xl shadow-sm",
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-accent text-accent-foreground rounded-bl-none",
            )}
          >
            {renderContent()}
            <div className="flex items-center justify-end gap-1 mt-1">
              <div className={cn("text-xs", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {formatRelativeTime(message.timestamp)}
              </div>

              {isOwn && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Check className="h-3 w-3 text-primary-foreground/70" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Delivered</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            navigator.clipboard.writeText(message.content)
            toast.success("Copied to clipboard")
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </ContextMenuItem>
        {isOwn && (
          <ContextMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

