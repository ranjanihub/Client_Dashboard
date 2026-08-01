import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from '@workspace/api-client-react';
import { pageTransition, safeFormatDate } from '@/components/shared';
import { ExpertifyLogo } from '@/components/logo';
import { Send, Phone, Video, Search, User } from 'lucide-react';
import { format, isSameDay, formatRelative } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

export default function MessagesPage() {
  const { data: apiMessages, isLoading } = useGetMessages();

  const mockMessages = [
    {
      id: 1,
      type: "text",
      senderId: 2,
      senderName: "Dr. Sarah Jenkins",
      senderAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
      content: "Hi Alex! How are you feeling after our last session on Tuesday?",
      sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      isRead: true
    },
    {
      id: 2,
      type: "text",
      senderId: 1,
      senderName: "Alex Morgan",
      senderAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: "Hi Dr. Jenkins, I've been doing the breathing exercises whenever I notice tension. It really helped before my presentation yesterday!",
      sentAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
      isRead: true
    },
    {
      id: 3,
      type: "text",
      senderId: 2,
      senderName: "Dr. Sarah Jenkins",
      senderAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
      content: "That's fantastic news! Great work applying the techniques in real-world scenarios. We'll build on that success in our upcoming session.",
      sentAt: new Date(Date.now() - 86400000 + 7200000).toISOString(),
      isRead: false
    }
  ];

  const messages = (Array.isArray(apiMessages) && apiMessages.length > 0) ? apiMessages : mockMessages;
  const sendMutation = useSendMessage();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMutation.mutate({ data: { content: newMessage } }, {
      onSuccess: () => {
        setNewMessage('');
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
      }
    });
  };

  // The API doesn't group by threads, so we simulate a single primary therapist thread for now,
  // showing the therapist's generic info.
  const sortedMessages = messages?.slice().sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) || [];

  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      {/* Threads Sidebar (Simulated for aesthetics) */}
      <div className="w-full md:w-80 flex-shrink-0 hex-card !p-0 flex flex-col overflow-hidden h-[400px] md:h-full">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full bg-muted border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto flex flex-col justify-between">
          {/* Active Thread */}
          <div className="p-4 border-l-4 border-primary bg-accent/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold truncate text-sm">My Therapist</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">Just now</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].content : "No messages yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Branding Logo */}
          <div className="p-4 mt-auto border-t border-border/40 flex items-center justify-start">
            <ExpertifyLogo className="h-10 w-auto" />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 hex-card !p-0 flex flex-col overflow-hidden h-[500px] md:h-full relative shadow-xl border border-border">
        {/* Chat Header */}
        <div className="h-[72px] border-b border-border bg-white/80 backdrop-blur px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              T
            </div>
            <div>
              <h3 className="font-bold">Your Therapist</h3>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F6F7FB] space-y-6">
          {isLoading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-16 w-64 bg-muted rounded-2xl rounded-tl-sm"></div>
              <div className="h-12 w-48 bg-primary/20 rounded-2xl rounded-tr-sm self-end"></div>
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <p>No messages yet. Send a message to start the conversation.</p>
            </div>
          ) : (
            sortedMessages.map((msg, index) => {
              // Simulating client vs therapist based on senderId for UI display
              // Since API schema says senderId, we assume null or specific ID is therapist vs client
              // Let's assume senderName "You" or specific is user. Let's just alternate or use isRead/type
              const isMe = msg.senderName.toLowerCase() === 'you' || msg.senderId === null; // Fallback heuristic
              
              const prevMsg = index > 0 ? sortedMessages[index - 1] : null;
              const showDate = !prevMsg || !isSameDay(new Date(msg.sentAt), new Date(prevMsg.sentAt));

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs font-medium text-muted-foreground bg-white px-3 py-1 rounded-full shadow-sm">
                        {formatRelative(new Date(msg.sentAt), new Date())}
                      </span>
                    </div>
                  )}
                  
                  {msg.type === 'system' || msg.type === 'reminder' || msg.type === 'appointment' ? (
                    <div className="flex justify-center">
                      <div className="bg-accent text-primary text-sm font-medium px-4 py-2 rounded-xl text-center max-w-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-muted flex items-center justify-center mt-auto">
                            {msg.senderAvatarUrl ? (
                              <img src={msg.senderAvatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">{msg.senderName.charAt(0)}</span>
                            )}
                          </div>
                        )}
                        <div className={`p-4 rounded-2xl ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-white text-foreground shadow-sm rounded-bl-sm border border-border'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-[10px] mt-2 font-medium ${isMe ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                            {safeFormatDate(msg.sentAt, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-border shrink-0 z-10">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 bg-muted border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim() || sendMutation.isPending}
              className="w-12 h-12 shrink-0 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 transition-opacity hover:brightness-92"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
