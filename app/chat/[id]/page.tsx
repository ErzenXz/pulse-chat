"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getMessages, sendMessage, deleteMessage, uploadFile } from "@/lib/api"
import { ChatWindow } from "@/components/chat-window"
import { MessageInput } from "@/components/message-input"
import { ImageModal } from "@/components/image-modal"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Video, Phone, Info } from "lucide-react"
import { generateUUID } from "@/lib/utils"
import { toast } from "sonner"
import { getInitials } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import io from "socket.io-client"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: string
  username: string
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [recipientUsername, setRecipientUsername] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true) // Simulated online status
  const { user } = useAuth()
  const router = useRouter()
  const socketRef = useRef<any>(null)

  useEffect(() => {
    const username = searchParams.get("username")
    if (username) {
      setRecipientUsername(username)
    }

    // Initial fetch of messages
    fetchMessages()

    socketRef.current = io("https://apis.erzen.tk/messaging", {
      transports: ["websocket"],
      query: {
        token: document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*=\s*([^;]*).*$)|^.*$/, "$1"),
      },
    })

    socketRef.current.on("connect", () => {
      console.log("Socket connected")
      socketRef.current.emit("joinRoom", id)
    })

    // Only fetch all messages when receiving refreshMessages event
    socketRef.current.on("refreshMessages", () => {
      fetchMessages(1, true)
    })

    socketRef.current.on("error", (error: any) => {
      console.error("Socket error:", error)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [id, searchParams])

  const fetchMessages = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      const data = await getMessages(id, pageNum)

      // Transform the messages to match the Message interface
      const formattedMessages = Array.isArray(data)
        ? data.map((msg) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            timestamp: msg.timestamp,
            username: msg.username || "", // Add default value if username is missing
          }))
        : []

      if (reset) {
        setMessages(formattedMessages)
      } else {
        setMessages((prev) => [...formattedMessages, ...prev])
      }

      setHasMore(formattedMessages.length === 20) // Assuming 20 is your page size
      setPage(pageNum)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchMessages(page + 1)
    }
  }

  const handleSendMessage = async (content: string, file?: File) => {
    try {
      if (file) {
        const toastId = toast.loading(`Uploading ${file.name}...`)

        try {
          const { url } = await uploadFile(file, (progress) => {
            toast.loading(`Uploading ${file.name}...`, {
              description: `${progress}% complete`,
              id: toastId,
            })
          })

          // Format the message with file metadata
          const fileType = file.type.split("/")[0] // 'image', 'video', etc.
          const formattedContent = `----------(${file.name})>${fileType}]\n${url}\n==========`

          await sendMessage(recipientUsername, formattedContent)

          // Add the message locally
          const newMessage: Message = {
            id: Date.now().toString(),
            content: formattedContent,
            senderId: user?.id || "",
            receiverId: id,
            timestamp: new Date().toISOString(),
            username: user?.username || "",
          }

          setMessages((prev) => [...prev, newMessage])
          toast.success("File uploaded successfully", { id: toastId })
        } catch (error) {
          toast.error("File upload failed", {
            id: toastId,
          })
          throw error
        }
      } else {
        // Send regular message and update local state
        await sendMessage(recipientUsername, content)

        // Add the message locally
        const newMessage: Message = {
          id: Date.now().toString(), // Temporary ID
          content,
          senderId: user?.id || "",
          receiverId: id,
          timestamp: new Date().toISOString(),
          username: user?.username || "",
        }

        setMessages((prev) => [...prev, newMessage])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId)
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      toast.success("Message deleted")
    } catch (error) {
      console.error("Failed to delete message:", error)
      toast.error("Failed to delete message")
    }
  }

  const handleStartVideoCall = () => {
    const uuid = generateUUID()
    const callUrl = `https://call.erzen.tk/index.html?room=${uuid}`

    // Send the call link as a message
    handleSendMessage(`Video call: ${callUrl}`)

    // Open the call in a new window
    window.open(callUrl, "_blank", "width=800,height=600")
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b py-3 px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/conversations")}
              className="mr-3 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>

            <div className="flex items-center">
              <div className="relative">
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(recipientUsername)}
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
              </div>

              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{recipientUsername}</h2>
                  <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                    Online
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">@{recipientUsername}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="h-5 w-5" />
              <span className="sr-only">Voice call</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleStartVideoCall} className="rounded-full">
              <Video className="h-5 w-5" />
              <span className="sr-only">Video call</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Info className="h-5 w-5" />
              <span className="sr-only">Info</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <ChatWindow
          messages={messages}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onDeleteMessage={handleDeleteMessage}
          onImageClick={setSelectedImage}
          currentUserId={user?.id ?? ""}
        />

        <MessageInput onSendMessage={handleSendMessage} />
      </main>

      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  )
}

