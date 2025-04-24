"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getMessages, sendMessage, deleteMessage, uploadFile, getUserStatus } from "@/lib/api"
import { ChatWindow } from "@/components/chat-window"
import { MessageInput } from "@/components/message-input"
import { ImageModal } from "@/components/image-modal"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Video, Phone, Info, Loader2 } from "lucide-react"
import { generateUUID } from "@/lib/utils"
import { toast } from "sonner"
import { getInitials } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { storeMessages, getMessagesFromDB, addMessageToDB, deleteMessageFromDB } from "@/lib/indexeddb"
import io from "socket.io-client"
import AuthGuard from "@/app/middlewares/auth.guard"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: string
  username: string
}

// Interface that matches the DBMessage type from indexeddb.ts
interface DBMessage extends Message {
  conversationId: string
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [recipientUsername, setRecipientUsername] = useState<string>("")
  const [recipientFullname, setRecipientFullname] = useState<string>("")
  const [recipientPicture, setRecipientPicture] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [typingStatus, setTypingStatus] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const socketRef = useRef<any>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchMessagesFromDB = useCallback(async () => {
    try {
      setIsLoadingFromCache(true)
      const cachedMessages = await getMessagesFromDB(id.toString())
      
      if (cachedMessages.length > 0) {
        // Transform cached messages to match Message interface
        const formattedCachedMessages = cachedMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          timestamp: msg.timestamp,
          username: msg.username
        }))
        
        setMessages(formattedCachedMessages)
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to load messages from IndexedDB:", error)
      return false
    } finally {
      setIsLoadingFromCache(false)
    }
  }, [id])

  const fetchMessagesFromAPI = useCallback(async (pageNum = 1, reset = false) => {
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
            username: msg.username || "",
          }))
        : []

      if (reset) {
        setMessages(formattedMessages)
        // Cache messages to IndexedDB
        const messagesForDB: DBMessage[] = formattedMessages.map(msg => ({
          ...msg,
          conversationId: id.toString()
        }));
        await storeMessages(id.toString(), messagesForDB)
      } else {
        setMessages((prev) => [...formattedMessages, ...prev])
        // Cache only if this is the first page
        if (pageNum === 1) {
          const messagesForDB: DBMessage[] = formattedMessages.map(msg => ({
            ...msg,
            conversationId: id.toString()
          }));
          await storeMessages(id.toString(), messagesForDB)
        }
      }

      setHasMore(formattedMessages.length === 20) // Assuming 20 is your page size
      setPage(pageNum)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const initialize = async (username: string) => {
      setRecipientUsername(username)
      
      try {
        const data = await getUserStatus(username)
        setIsOnline(data.activityStatus)
        setRecipientFullname(data.fullName)
        setRecipientUsername(data.username)
        setRecipientPicture(data.profilePicture)
      } catch (error) {
        console.error("Failed to get user status:", error)
      }
    }

    const username = searchParams.get("username")
    if (username) {
      initialize(username)
    }

    // Try to load messages from IndexedDB first
    fetchMessagesFromDB().then((hasCache) => {
      // Initialize socket connection
      socketRef.current = io("wss://apis.erzen.tk/messaging", {
        transports: ["websocket"],
        query: {
          token: localStorage.getItem("accessToken"),
        },
      })

      socketRef.current.on("connect", () => {
        console.log("Socket connected")
        // Fetch messages from API after socket connection
        fetchMessagesFromAPI(1, true)
        setIsReconnecting(false)
      })

      socketRef.current.on("refreshMessages", () => {
        fetchMessagesFromAPI(1, true)
      })

      socketRef.current.on("typing", (data: { username: string, isTyping: boolean }) => {
        if (data.username === recipientUsername) {
          setTypingStatus(data.isTyping)
        }
      })

      socketRef.current.on("connect_error", () => {
        setIsReconnecting(true)
      })

      socketRef.current.on("reconnect_attempt", () => {
        setIsReconnecting(true)
      })

      socketRef.current.on("reconnect", () => {
        setIsReconnecting(false)
      })

      socketRef.current.on("error", (error: any) => {
        console.error("Socket error:", error)
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [id, searchParams, fetchMessagesFromDB, fetchMessagesFromAPI, recipientUsername])

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchMessagesFromAPI(page + 1)
    }
  }

  const emitTypingStatus = (isTyping: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("typing", {
        recipient: recipientUsername,
        isTyping
      })
    }
  }

  const handleInputFocus = () => {
    emitTypingStatus(true)
    
    // Clear previous timeout if exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStatus(false)
    }, 3000)
  }

  const handleInputChange = () => {
    // Reset the typing timeout when user continues typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStatus(false)
    }, 3000)
  }

  // Ensure all message objects have a conversationId property when interfacing with IndexedDB
  const createDBMessage = (message: Message): DBMessage => {
    return {
      ...message,
      conversationId: id.toString()
    };
  };

  const handleSendMessage = async (content: string, file?: File) => {
    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        emitTypingStatus(false)
      }
      
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
            senderId: user?.id ?? "",
            receiverId: id.toString(),
            timestamp: new Date().toISOString(),
            username: user?.username ?? "",
          }

          setMessages((prev) => [...prev, newMessage])
          
          // Store in IndexedDB using the helper function
          await addMessageToDB(id.toString(), createDBMessage(newMessage))
          
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
          senderId: user?.id ?? "",
          receiverId: id.toString(),
          timestamp: new Date().toISOString(),
          username: user?.username ?? "",
        }

        setMessages((prev) => [...prev, newMessage])
        
        // Store in IndexedDB using the helper function
        await addMessageToDB(id.toString(), createDBMessage(newMessage))
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
      
      // Remove from IndexedDB
      await deleteMessageFromDB(messageId)
      
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar currentChatId={id.toString()} />

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="border-b py-3 px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/conversations")}
                className="md:hidden mr-3 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>

              <div className="flex items-center">
                <div className="relative">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={recipientPicture}
                      alt={recipientFullname}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(recipientFullname)}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                  )}
                </div>

                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium">{recipientFullname}</h2>
                    {isOnline && (
                      <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                        Online
                      </Badge>
                    )}
                  </div>
                  <AnimatePresence>
                    {typingStatus ? (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-primary animate-pulse"
                      >
                        typing...
                      </motion.p>
                    ) : (
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-muted-foreground"
                      >
                        @{recipientUsername}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isReconnecting && (
                <Badge variant="outline" className="mr-2 gap-1 px-2 py-1 text-amber-500 border-amber-200">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Reconnecting...</span>
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="rounded-full">
                <Phone className="h-5 w-5" />
                <span className="sr-only">Voice call</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleStartVideoCall} className="rounded-full">
                <Video className="h-5 w-5" />
                <span className="sr-only">Video call</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setShowInfo(!showInfo)}
              >
                <Info className="h-5 w-5" />
                <span className="sr-only">Info</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-hidden flex flex-col">
            {isLoadingFromCache && messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : (
              <ChatWindow
                messages={messages}
                loading={loading && !isLoadingFromCache}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                onDeleteMessage={handleDeleteMessage}
                onImageClick={setSelectedImage}
                currentUserId={user?.id ?? ""}
              />
            )}

            <MessageInput 
              onSendMessage={handleSendMessage} 
              onFocus={handleInputFocus}
              onChange={handleInputChange}
            />
          </main>

          {/* Info sidebar */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-l bg-background overflow-y-auto"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Contact Info</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowInfo(false)}>
                      Close
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-24 w-24 border mb-3">
                      <AvatarImage
                        src={recipientPicture}
                        alt={recipientFullname}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {getInitials(recipientFullname)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{recipientFullname}</h2>
                    <p className="text-sm text-muted-foreground">@{recipientUsername}</p>
                    {isOnline && (
                      <Badge variant="default" className="mt-2">
                        Online
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Actions</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 p-2"
                          onClick={handleStartVideoCall}
                        >
                          <Video className="h-5 w-5 mb-1" />
                          <span className="text-xs">Video Call</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 p-2"
                        >
                          <Phone className="h-5 w-5 mb-1" />
                          <span className="text-xs">Voice Call</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 p-2"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="mb-1"
                          >
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                          </svg>
                          <span className="text-xs">Forward</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Media</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {messages
                          .filter(msg => msg.content.includes('image') || msg.content.includes('.jpg') || msg.content.includes('.png'))
                          .slice(0, 3)
                          .map((msg, idx) => {
                            const mediaUrlMatch = msg.content.match(/https?:\/\/[^\s]+/);
                            const mediaUrl = mediaUrlMatch ? mediaUrlMatch[0] : '';
                            
                            return (
                              <div 
                                key={idx} 
                                className="aspect-square rounded-md overflow-hidden bg-accent cursor-pointer"
                                onClick={() => setSelectedImage(mediaUrl)}
                              >
                                <img src={mediaUrl} alt="Media" className="h-full w-full object-cover" />
                              </div>
                            );
                          })}
                        {messages.filter(msg => msg.content.includes('image') || msg.content.includes('.jpg') || msg.content.includes('.png')).length > 3 && (
                          <Button variant="ghost" className="aspect-square flex items-center justify-center">
                            <span className="text-sm font-medium">View All</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      </div>
    </div>
  )
}

