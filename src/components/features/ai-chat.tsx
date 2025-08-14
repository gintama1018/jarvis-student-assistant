"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Copy, 
  RotateCcw, 
  Download, 
  Search,
  Trash2,
  MessageSquare,
  Clock,
  Check,
  X,
  ChevronLeft,
  Menu
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface ChatThread {
  id: string
  title: string
  messages: Message[]
  updatedAt: Date
}

interface AiChatProps {
  initialMessages?: Message[]
  onSendMessage?: (message: string) => void
  onRegenerateResponse?: (messageId: string) => void
  onExportChat?: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
  className?: string
}

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center space-x-1 p-4 bg-surface rounded-2xl rounded-bl-md max-w-xs"
  >
    <span className="text-sm text-text-secondary">AI is typing</span>
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-1 bg-text-muted rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  </motion.div>
)

const MessageBubble = ({ 
  message, 
  onCopy, 
  onRegenerate 
}: { 
  message: Message
  onCopy: (content: string) => void
  onRegenerate: (messageId: string) => void
}) => {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start space-x-3 group",
        message.isUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!message.isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src="/ai-avatar.png" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            AI
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col space-y-1 max-w-xs lg:max-w-md xl:max-w-lg",
        message.isUser && "items-end"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl relative group",
          message.isUser 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-surface text-text-primary rounded-bl-md"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {message.status && message.isUser && (
            <div className="absolute -bottom-1 -right-1">
              {message.status === 'sending' && (
                <Clock className="w-3 h-3 text-text-muted" />
              )}
              {message.status === 'sent' && (
                <Check className="w-3 h-3 text-primary" />
              )}
              {message.status === 'error' && (
                <X className="w-3 h-3 text-destructive" />
              )}
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center space-x-2 px-1",
          message.isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-xs text-text-muted font-mono">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-surface"
                  onClick={() => onCopy(message.content)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                
                {!message.isUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-surface"
                    onClick={() => onRegenerate(message.id)}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {message.isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src="/user-avatar.png" />
          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
}

const ChatHistory = ({ 
  threads, 
  activeThreadId, 
  onSelectThread, 
  onDeleteThread,
  onSearchHistory 
}: {
  threads: ChatThread[]
  activeThreadId: string | null
  onSelectThread: (threadId: string) => void
  onDeleteThread: (threadId: string) => void
  onSearchHistory: (query: string) => void
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  
  const groupedThreads = threads.reduce((groups, thread) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    let group = "Older"
    if (thread.updatedAt.toDateString() === today.toDateString()) {
      group = "Today"
    } else if (thread.updatedAt.toDateString() === yesterday.toDateString()) {
      group = "Yesterday"
    } else if (thread.updatedAt > lastWeek) {
      group = "Last Week"
    }
    
    if (!groups[group]) groups[group] = []
    groups[group].push(thread)
    return groups
  }, {} as Record<string, ChatThread[]>)

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              onSearchHistory(e.target.value)
            }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(groupedThreads).map(([group, groupThreads]) => (
            <div key={group}>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                {group}
              </h3>
              <div className="space-y-2">
                {groupThreads.map((thread) => (
                  <div key={thread.id} className="group relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left h-auto p-3 hover:bg-background",
                        activeThreadId === thread.id && "bg-background"
                      )}
                      onClick={() => onSelectThread(thread.id)}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <MessageSquare className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {thread.title}
                          </p>
                          <p className="text-xs text-text-muted">
                            {thread.messages.length} messages
                          </p>
                        </div>
                      </div>
                    </Button>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-1" align="end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteThread(thread.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default function AiChat({
  initialMessages = [],
  onSendMessage,
  onRegenerateResponse,
  onExportChat,
  onDeleteChat,
  className
}: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeThreadId, setActiveThreadId] = useState<string | null>("current")
  const [threads] = useState<ChatThread[]>([
    {
      id: "current",
      title: "Current Conversation",
      messages: messages,
      updatedAt: new Date()
    },
    {
      id: "thread-1",
      title: "Help with React Hooks",
      messages: [],
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: "thread-2", 
      title: "CSS Grid Layout Questions",
      messages: [],
      updatedAt: new Date(Date.now() - 172800000)
    }
  ])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    onSendMessage?.(inputValue)

    // Simulate message sent status
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      )
    }, 1000)

    // Simulate AI response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "This is a simulated AI response. In a real implementation, this would be replaced with actual AI-generated content based on the user's message.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleRegenerateResponse = (messageId: string) => {
    onRegenerateResponse?.(messageId)
    
    // Simulate regeneration
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const newResponse: Message = {
        id: Date.now().toString(),
        content: "This is a regenerated AI response with different content to demonstrate the regeneration feature.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== messageId),
        newResponse
      ])
    }, 2000)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleExportChat = () => {
    onExportChat?.(activeThreadId || "current")
  }

  const characterCount = inputValue.length
  const maxCharacters = 2000

  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 z-50 lg:static lg:z-0"
            >
              <ChatHistory
                threads={threads}
                activeThreadId={activeThreadId}
                onSelectThread={setActiveThreadId}
                onDeleteThread={(threadId) => onDeleteChat?.(threadId)}
                onSearchHistory={(query) => console.log("Search:", query)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-80 border-r border-border">
        <ChatHistory
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          onDeleteThread={(threadId) => onDeleteChat?.(threadId)}
          onSearchHistory={(query) => console.log("Search:", query)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowSidebar(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">
                AI Assistant
              </h1>
              <p className="text-sm text-text-secondary">
                Ask anything, get intelligent responses
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportChat}
            className="text-text-secondary hover:text-text-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 bg-background">
          <div className="p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageSquare className="w-12 h-12 text-text-muted mb-4" />
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Start a conversation
                </h2>
                <p className="text-text-secondary max-w-md">
                  Ask me anything! I'm here to help with questions, provide information, 
                  or just have a friendly chat.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onCopy={handleCopyMessage}
                    onRegenerate={handleRegenerateResponse}
                  />
                ))}
                
                {isTyping && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t border-border bg-surface">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Shift + Enter for new line)"
                className="min-h-[44px] max-h-[120px] resize-none pr-20 bg-background border-border focus:ring-ring"
                style={{ height: "auto" }}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFileUpload}
                  className="h-8 w-8 text-text-muted hover:text-text-primary hover:bg-background"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || characterCount > maxCharacters}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 px-1">
              <span 
                className={cn(
                  "text-xs",
                  characterCount > maxCharacters ? "text-destructive" : "text-text-muted"
                )}
              >
                {characterCount}/{maxCharacters}
              </span>
              
              <div className="text-xs text-text-muted">
                Press Enter to send, Shift + Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => console.log("Files selected:", e.target.files)}
        accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
      />
    </div>
  )
}