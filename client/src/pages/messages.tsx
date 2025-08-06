import { useState } from "react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video,
  MessageCircle,
  User,
  Users,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: number;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function Messages() {
  const [, setLocation] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const { isAuthenticated } = useAuth();

  // Check URL parameters for direct conversation access
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    const userId = urlParams.get('user');
    
    if (conversationId && userId) {
      setSelectedConversation(parseInt(conversationId));
      
      // Fetch user info for the conversation
      fetch(`/api/users/${userId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(user => {
          setActiveConversation({
            id: parseInt(conversationId),
            participantName: user.username || `User ${userId}`,
            participantId: parseInt(userId),
            isOnline: true,
            currentUserId: 31 // This should be dynamic in a real app
          });
        })
        .catch(() => {
          // Fallback if user fetch fails
          setActiveConversation({
            id: parseInt(conversationId),
            participantName: `User ${userId}`,
            participantId: parseInt(userId),
            isOnline: true,
            currentUserId: 31
          });
        });
    }
  }, []);

  // Fetch conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    enabled: isAuthenticated,
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedConversation],
    enabled: isAuthenticated && !!selectedConversation,
  });

  // Show no data state if user has no conversations and no active conversation
  if (!loadingConversations && (!conversations || conversations.length === 0) && !activeConversation) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
        
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Messages Yet</h3>
            <p className="text-white/60 text-sm mb-8">Connect with other creators to start messaging and build your network.</p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/social')} 
                className="w-full bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] hover:from-[#FE3F5E]/90 hover:to-[#FF6B8A]/90 text-white font-semibold px-6 py-3 rounded-xl border-0"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find People to Connect
              </Button>
              
              <Button 
                onClick={() => setLocation('/dashboard')} 
                className="w-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 px-6 py-3 rounded-xl"
              >
                <Users className="h-4 w-4 mr-2" />
                Explore Community
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingConversations) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
        
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-[#FE3F5E]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#FE3F5E] rounded-full animate-spin"></div>
            </div>
            <p className="text-white/60 text-sm">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations?.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedConv = conversations?.find(c => c.id === selectedConversation) || activeConversation;

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage
        })
      });
      
      if (response.ok) {
        const message = await response.json();
        
        // Add the message to local state immediately for instant feedback
        setLocalMessages(prev => [...prev, message]);
        setNewMessage("");
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="flex h-screen relative z-10">
        {/* Sidebar - Conversations List */}
        <div className="w-full md:w-80 border-r border-white/10 bg-black/20 backdrop-blur-sm">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 md:hidden"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-white hidden md:block">Messages</h1>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/20 backdrop-blur-sm border-white/10 text-white placeholder:text-white/50"
              />
            </div>
          </div>
          
          {/* Conversations */}
          <div className="overflow-y-auto h-full pb-20">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FE3F5E]/20 to-[#FFD200]/20 rounded-full flex items-center justify-center border border-white/10">
                      <User className="h-6 w-6 text-white/70" />
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0F0F0F]"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white truncate">
                        {conversation.participantName}
                      </p>
                      <span className="text-xs text-white/50">
                        {conversation.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-[#FE3F5E] rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-semibold">
                        {conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${selectedConversation ? 'block' : 'hidden md:flex'}`}>
          {selectedConversation && selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => setSelectedConversation(null)}
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10 md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FE3F5E]/20 to-[#FFD200]/20 rounded-full flex items-center justify-center border border-white/10">
                        <User className="h-5 w-5 text-white/70" />
                      </div>
                      {selectedConv.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-[#0F0F0F]"></div>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-semibold text-white">{selectedConv.participantName}</p>
                      <p className="text-xs text-white/50">
                        {selectedConv.isOnline ? 'Online' : 'Last seen recently'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 relative">
                        <div className="absolute inset-0 border-2 border-[#FE3F5E]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-t-[#FE3F5E] rounded-full animate-spin"></div>
                      </div>
                      <p className="text-white/60 text-sm">Loading messages...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show API messages if available, otherwise show local messages */}
                    {(messages && messages.length > 0 ? messages : localMessages).map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === activeConversation?.currentUserId || message.senderId === 31 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            message.senderId === activeConversation?.currentUserId || message.senderId === 31
                              ? 'bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white'
                              : 'bg-white/10 backdrop-blur-sm text-white border border-white/10'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === activeConversation?.currentUserId || message.senderId === 31 ? 'text-white/70' : 'text-white/50'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show welcome message for new conversations */}
                    {localMessages.length === 0 && (!messages || messages.length === 0) && (
                      <div className="flex justify-center">
                        <div className="bg-white/5 backdrop-blur-sm text-white/60 px-4 py-2 rounded-full text-sm">
                          Start a conversation with {selectedConv?.participantName}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-black/20 backdrop-blur-sm border-white/10 text-white placeholder:text-white/50"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] hover:from-[#FE3F5E]/90 hover:to-[#FF6B8A]/90 text-white font-semibold px-4 py-2 rounded-xl border-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-white/60 text-sm">Choose a conversation from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}