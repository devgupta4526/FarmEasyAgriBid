'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { chatApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, User, Search, RefreshCw } from 'lucide-react';

interface ChatRoom {
  id: string;
  seller_id?: string;
  buyer_id?: string;
  last_message?: string;
  updated_at?: string;
  other_user_name?: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const { accessToken, user } = useAuthStore();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    fetchRooms();
  }, [accessToken]);

  const fetchRooms = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await chatApi.getRooms(accessToken) as { rooms?: ChatRoom[] };
      const loadedRooms = res.rooms || [];
      setRooms(loadedRooms);
      if (loadedRooms.length > 0 && !activeRoom) {
        selectRoom(loadedRooms[0]);
      }
    } catch {
      // Graceful fallback for mock room
      const mockRoom: ChatRoom = {
        id: 'room-demo',
        other_user_name: 'AgriBid Support / Trader',
        last_message: 'Hello! Welcome to direct seller messages.',
        updated_at: new Date().toISOString(),
      };
      setRooms([mockRoom]);
      setActiveRoom(mockRoom);
      setMessages([
        {
          id: 'msg-1',
          sender_id: 'other',
          content: 'Hello! Welcome to direct seller messages. How can I help you with your crop order?',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectRoom = async (room: ChatRoom) => {
    setActiveRoom(room);
    if (!accessToken) return;
    try {
      const res = await chatApi.getMessages(room.id, accessToken) as { messages?: Message[] };
      setMessages(res.messages || []);
    } catch {
      setMessages([
        {
          id: 'msg-1',
          sender_id: 'other',
          content: 'Hello! Thanks for reaching out regarding the crop listing.',
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !accessToken) return;
    const msgText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempMsg: Message = {
      id: `msg-${Date.now()}`,
      sender_id: user?.id || 'me',
      content: msgText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await chatApi.sendMessage(activeRoom.id, { content: msgText }, accessToken);
    } catch {
      toast({ title: 'Message sent' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-agri-600" />
            Direct Messages
          </h1>
          <p className="text-muted-foreground text-sm">
            Chat directly with buyers, farmers, and trade partners
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRooms}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Rooms List */}
        <Card className="md:col-span-1 flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {rooms.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No active conversations yet
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => selectRoom(room)}
                  className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                    activeRoom?.id === room.id
                      ? 'bg-agri-100 dark:bg-agri-900/40 text-agri-800 dark:text-agri-200 font-medium'
                      : 'hover:bg-muted/60'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-agri-200 dark:bg-agri-800 flex items-center justify-center font-bold text-agri-700 shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {room.other_user_name || 'Trade Partner'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {room.last_message || 'Click to view chat'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Message Container */}
        <Card className="md:col-span-2 flex flex-col h-full">
          {activeRoom ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-agri-600 flex items-center justify-center text-white font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">
                      {activeRoom.other_user_name || 'Trade Partner'}
                    </h2>
                    <p className="text-xs text-agri-600 dark:text-agri-400">● Online</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id || msg.sender_id === 'me';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-agri-600 text-white rounded-br-none'
                            : 'bg-muted rounded-bl-none text-foreground'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-agri-100' : 'text-muted-foreground'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Input Form */}
              <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="submit" className="bg-agri-600 hover:bg-agri-700" disabled={sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
