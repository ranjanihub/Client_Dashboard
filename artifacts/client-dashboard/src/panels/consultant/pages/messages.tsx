import { useState } from "react";
import { Send, Search, Circle, MessageSquare, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/format";

import { PageHeader } from "@/components/page-header";

interface Message {
  id: number;
  sender: "therapist" | "client";
  text: string;
  time: string;
}

interface Chat {
  id: number;
  name: string;
  avatar?: string;
  status: "online" | "offline";
  lastMessage: string;
  unreadCount: number;
  time: string;
  history: Message[];
}

export default function Messages() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      name: "Sarah Jenkins",
      status: "online",
      lastMessage: "I finished the worksheets. Looking forward to our session!",
      unreadCount: 2,
      time: "10:42 AM",
      history: [
        { id: 1, sender: "therapist", text: "Hi Sarah, how are you feeling after our last discussion on cognitive restructuring?", time: "Yesterday, 3:15 PM" },
        { id: 2, sender: "client", text: "Hi Dr. Alex, it was helpful. I tried catching my negative automatic thoughts this morning.", time: "Yesterday, 4:20 PM" },
        { id: 3, sender: "therapist", text: "That is fantastic progress! Remember to jot them down in your thought record template.", time: "Yesterday, 4:22 PM" },
        { id: 4, sender: "client", text: "I finished the worksheets. Looking forward to our session!", time: "10:42 AM" },
      ]
    },
    {
      id: 2,
      name: "Michael Chen",
      status: "online",
      lastMessage: "Could we reschedule our Friday session to 2:00 PM?",
      unreadCount: 1,
      time: "9:15 AM",
      history: [
        { id: 1, sender: "therapist", text: "Hi Michael, let me know if you need any adjustments to your ACT values session schedule.", time: "Yesterday, 1:00 PM" },
        { id: 2, sender: "client", text: "Could we reschedule our Friday session to 2:00 PM?", time: "9:15 AM" }
      ]
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      status: "offline",
      lastMessage: "Thank you for the grounding exercises resource.",
      unreadCount: 0,
      time: "Yesterday",
      history: [
        { id: 1, sender: "therapist", text: "Hi Emily, I have uploaded the DBT TIPP distress tolerance guide in your resources workspace.", time: "Yesterday, 10:00 AM" },
        { id: 2, sender: "client", text: "Thank you for the grounding exercises resource.", time: "Yesterday, 11:30 AM" }
      ]
    },
    {
      id: 4,
      name: "David Kim",
      status: "offline",
      lastMessage: "I practiced the 4-7-8 breathing technique before my presentation.",
      unreadCount: 0,
      time: "Jul 23",
      history: [
        { id: 1, sender: "client", text: "I practiced the 4-7-8 breathing technique before my presentation.", time: "Jul 23, 2:00 PM" }
      ]
    }
  ]);

  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: activeChat.history.length + 1,
      sender: "therapist",
      text: inputText,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    };

    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            lastMessage: inputText,
            time: "Just now",
            history: [...chat.history, newMessage]
          };
        }
        return chat;
      })
    );

    setInputText("");
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] min-h-[450px] flex border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      {/* Left Conversations Sidebar */}
      <div className={`w-full md:w-[320px] border-r border-border flex-col bg-white shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 w-full h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {filteredChats.map(chat => {
            const initials = getInitials(chat.name);
            const isSelected = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setMobileView('chat');
                  // Mark as read
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                }}
                className={`flex gap-3 p-4 cursor-pointer hover:bg-secondary/40 transition-colors relative ${isSelected ? 'bg-primary/5 hover:bg-primary/5' : ''}`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-primary/5 text-primary font-semibold text-sm">{initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-sm truncate text-foreground">{chat.name}</h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-1">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-[#5e2be2] text-[10px] font-bold text-white shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left Sidebar Footer with Hexpertify Logo */}
        <div className="p-3.5 border-t border-border bg-slate-50/70 flex items-center justify-start shrink-0 px-4">
          <img 
            src="/hexpertify-logo.png" 
            alt="Hexpertify Logo" 
            className="h-10 w-auto object-contain max-h-10" 
          />
        </div>
      </div>

      {/* Right Chat Window */}
      <div className={`flex-1 flex-col bg-secondary/10 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {/* Chat header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-border flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileView('list')}
              className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
              title="Back to Conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-border">
              <AvatarFallback className="bg-primary/5 text-primary font-semibold text-xs sm:text-sm">{getInitials(activeChat.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-xs sm:text-[15px] text-foreground leading-snug">{activeChat.name}</h4>
              <span className="text-[10px] text-emerald-600 font-semibold block">Online</span>
            </div>
          </div>
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeChat.history.map((msg) => {
            const isTherapist = msg.sender === "therapist";
            return (
              <div key={msg.id} className={`flex ${isTherapist ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] flex flex-col ${isTherapist ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-xs ${
                      isTherapist
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white text-foreground rounded-tl-none border border-border"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat input */}
        <div className="p-4 bg-white border-t border-border flex gap-3 items-center">
          <Input
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 rounded-xl"
          />
          <Button onClick={handleSend} className="bg-primary hover:bg-primary/90 text-white gap-2 h-10 px-5 shrink-0 rounded-xl font-bold">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
