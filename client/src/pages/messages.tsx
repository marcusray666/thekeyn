import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageCircle, Plus, Send, Search, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  isVerified?: boolean;
}

interface Conversation {
  id: string;
  title?: string;
  type: "direct" | "group";
  participants: { userId: number; username: string }[];
  lastMessage?: {
    content: string;
    createdAt: Date;
    senderName: string;
  };
  unreadCount: number;
  lastMessageAt?: Date;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  messageType: "text" | "image" | "file";
  attachmentUrl?: string;
  createdAt: Date;
  senderName: string;
  senderAvatar?: string;
  replyToMessageId?: string;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  // Search users for new conversations
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["/api/search/users", userSearchQuery],
    enabled: userSearchQuery.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(userSearchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      return response.json();
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      return apiRequest(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      setMessageContent("");
      scrollToBottom();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async ({ participants, title }: { participants: number[]; title?: string }) => {
      return apiRequest("/api/conversations", {
        method: "POST",
        body: { participants, title },
      });
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(conversation.id);
      setIsNewChatOpen(false);
      setSelectedUsers([]);
      setUserSearchQuery("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest(`/api/conversations/${conversationId}/messages/read`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!selectedConversation || !messageContent.trim()) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageContent.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return;
    
    const participantIds = selectedUsers.map(user => user.id);
    const title = selectedUsers.length > 1 ? 
      selectedUsers.map(u => u.displayName || u.username).join(", ") : undefined;
    
    createConversationMutation.mutate({ participants: participantIds, title });
  };

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedConv = conversations.find((conv: Conversation) => conv.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="mb-6 text-center pt-16">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <MessageCircle className="h-10 w-10 text-purple-400" />
            Messages
          </h1>
          <p className="text-slate-300">Connect and communicate with other creators</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="backdrop-blur-xl bg-black/40 border-white/10 shadow-2xl lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-semibold">Conversations</CardTitle>
                <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-lg">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="backdrop-blur-xl bg-black/40 border-white/10 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Start New Conversation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-200">Search users</Label>
                        <Input
                          placeholder="Search by username..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                        />
                      </div>
                      
                      {/* Selected Users */}
                      {selectedUsers.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-slate-200">Selected Users ({selectedUsers.length})</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedUsers.map((user) => (
                              <Badge
                                key={user.id}
                                variant="secondary"
                                className="bg-purple-600/20 text-purple-200 cursor-pointer"
                                onClick={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                              >
                                {user.displayName || user.username} ✕
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Results */}
                      {userSearchQuery && (
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {searchLoading ? (
                            <p className="text-slate-400 text-center py-4">Searching...</p>
                          ) : searchResults.length > 0 ? (
                            searchResults.map((user: User) => (
                              <div
                                key={user.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                                onClick={() => {
                                  if (!selectedUsers.find(u => u.id === user.id)) {
                                    setSelectedUsers(prev => [...prev, user]);
                                  }
                                }}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImageUrl} />
                                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                                    {(user.displayName || user.username)[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-white text-sm font-medium">
                                    {user.displayName || user.username}
                                    {user.isVerified && <span className="text-blue-400 ml-1">✓</span>}
                                  </p>
                                  {user.displayName && (
                                    <p className="text-slate-400 text-xs">@{user.username}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-center py-4">No users found</p>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={handleCreateConversation}
                        disabled={selectedUsers.length === 0 || createConversationMutation.isPending}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {createConversationMutation.isPending ? "Creating..." : "Start Conversation"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-slate-400">Loading conversations...</div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation: Conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
                        selectedConversation === conversation.id ? "bg-white/10" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-600 text-white">
                              {conversation.type === "group" ? (
                                <Users className="h-5 w-5" />
                              ) : (
                                conversation.participants[0]?.username[0].toUpperCase()
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {conversation.title || 
                             conversation.participants.map(p => p.username).join(", ")}
                          </p>
                          {conversation.lastMessage && (
                            <p className="text-slate-400 text-sm truncate">
                              {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new conversation to connect with creators</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="backdrop-blur-xl bg-black/40 border-white/10 shadow-2xl lg:col-span-2">
            {selectedConversation ? (
              <>
                {/* Header */}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-600 text-white">
                        {selectedConv?.type === "group" ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          selectedConv?.participants[0]?.username[0].toUpperCase()
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white">
                        {selectedConv?.title || 
                         selectedConv?.participants.map(p => p.username).join(", ")}
                      </CardTitle>
                      {selectedConv?.type === "group" && (
                        <p className="text-slate-400 text-sm">
                          {selectedConv.participants.length} participants
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <Separator className="bg-white/10" />

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <div className="h-[calc(100vh-400px)] overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="text-center text-slate-400 py-8">Loading messages...</div>
                    ) : messages.length > 0 ? (
                      messages.map((message: Message) => (
                        <div key={message.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={message.senderAvatar} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {message.senderName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium text-sm">
                                {message.senderName}
                              </span>
                              <span className="text-slate-400 text-xs">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="bg-white/10 rounded-lg px-3 py-2 max-w-md">
                              <p className="text-white text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-slate-400">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Welcome to Messages</p>
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}