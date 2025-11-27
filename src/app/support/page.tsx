'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Paperclip,
  Image,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  User,
  Bot,
  Clock,
  CheckCheck,
  FileText,
  X,
  Headphones,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Message {
  id: string
  type: 'user' | 'agent' | 'system'
  content: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
  attachment?: {
    type: 'image' | 'file'
    name: string
    url: string
  }
}

interface Agent {
  id: string
  name: string
  role: string
  avatar?: string
  status: 'online' | 'busy' | 'offline'
}

const mockAgent: Agent = {
  id: 'AGT-001',
  name: 'Alex Thompson',
  role: 'Support Specialist',
  status: 'online',
}

const mockMessages: Message[] = [
  {
    id: 'MSG-001',
    type: 'system',
    content: 'Chat started. You are now connected with Alex Thompson.',
    timestamp: '10:00 AM',
  },
  {
    id: 'MSG-002',
    type: 'agent',
    content: 'Hello! Welcome to Fox Support. How can I help you today?',
    timestamp: '10:01 AM',
  },
  {
    id: 'MSG-003',
    type: 'user',
    content: 'Hi! I have a question about the locker installation at Downtown Mall. When will it be completed?',
    timestamp: '10:02 AM',
    status: 'read',
  },
  {
    id: 'MSG-004',
    type: 'agent',
    content: 'Let me check on that for you. The Downtown Mall installation is currently at 65% completion. Based on our schedule, it should be fully completed by February 15th.',
    timestamp: '10:03 AM',
  },
  {
    id: 'MSG-005',
    type: 'user',
    content: 'That\'s great! Can I also get an update on the maintenance request I submitted yesterday?',
    timestamp: '10:04 AM',
    status: 'read',
  },
  {
    id: 'MSG-006',
    type: 'agent',
    content: 'Of course! I can see your maintenance request (REQ-003) for the Central Station location. It\'s been approved and a technician visit has been scheduled for January 22nd at 10:00 AM.',
    timestamp: '10:05 AM',
  },
]

const quickReplies = [
  'Schedule a visit',
  'Check request status',
  'Report an issue',
  'Contact account manager',
]

export default function ClientSupportPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: `MSG-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      status: 'sent',
    }

    setMessages([...messages, newMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate agent typing and response
    setTimeout(() => {
      setIsTyping(false)
      const agentResponse: Message = {
        id: `MSG-${Date.now() + 1}`,
        type: 'agent',
        content: 'Thank you for your message. Let me look into that for you.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, agentResponse])
    }, 2000)
  }

  const handleQuickReply = (reply: string) => {
    setInputValue(reply)
  }

  return (
    <div className="h-[calc(100vh-10rem)]">
      <div className={`h-full flex flex-col rounded-2xl border overflow-hidden ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
      }`}>
        {/* Chat Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                isDark ? 'border-slate-900' : 'border-white'
              } ${mockAgent.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>
            <div>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {mockAgent.name}
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {mockAgent.role} • <span className="text-emerald-400">Online</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-xl transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              <Phone className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-xl transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              <Video className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-xl transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : message.type === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              {message.type === 'system' ? (
                <div className={`px-4 py-2 rounded-full text-xs ${
                  isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'
                }`}>
                  {message.content}
                </div>
              ) : (
                <div className={`flex items-end gap-2 max-w-[75%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.type === 'agent' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-br-md'
                        : isDark
                        ? 'bg-white/10 text-white rounded-bl-md'
                        : 'bg-white text-slate-900 shadow-sm rounded-bl-md'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${message.type === 'user' ? 'justify-end' : ''}`}>
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {message.timestamp}
                      </span>
                      {message.type === 'user' && message.status && (
                        <CheckCheck className={`w-3.5 h-3.5 ${
                          message.status === 'read' ? 'text-blue-400' : 'text-slate-400'
                        }`} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-end gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${
                  isDark ? 'bg-white/10' : 'bg-white shadow-sm'
                }`}>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className={`px-4 py-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {quickReplies.map((reply) => (
              <motion.button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isDark
                    ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {reply}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <Paperclip className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <Image className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className={`w-full px-4 py-3 pr-12 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                }`}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </div>

            <motion.button
              onClick={handleSendMessage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!inputValue.trim()}
              className={`p-3 rounded-xl transition-all ${
                inputValue.trim()
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                  : isDark
                  ? 'bg-white/10 text-slate-500'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
