import { useEffect, useState, useRef } from "react";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, CreditCard, FileText, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PaymentDialog } from "@/components/PaymentDialog";
import { CreateContractDialog } from "@/components/contracts/CreateContractDialog";
import { ContractList } from "@/components/contracts/ContractList";
import { Contract } from "@/types/contract";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  updated_at: string;
  opportunity_id: string | null;
  pitch_id: string | null;
  otherUser: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    user_type: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
  opportunityTitle?: string;
  pitchTitle?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

const Messages = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ user_type: string } | null>(null);
  const [existingContract, setExistingContract] = useState<Contract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Get user profile to determine type
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();
      
      setUserProfile(profile);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data: convos, error } = await supabase
        .from("conversations")
        .select(`
          id,
          participant_1,
          participant_2,
          updated_at,
          opportunity_id,
          pitch_id
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des conversations");
        return;
      }

      if (!convos) return;

      // Fetch other user details and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        convos.map(async (convo) => {
          const otherUserId = convo.participant_1 === user.id ? convo.participant_2 : convo.participant_1;
          
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, user_type")
            .eq("id", otherUserId)
            .single();

          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Fetch opportunity or pitch title if applicable
          let opportunityTitle: string | undefined;
          let pitchTitle: string | undefined;

          if (convo.opportunity_id) {
            const { data: opp } = await supabase
              .from("brand_opportunities")
              .select("title")
              .eq("id", convo.opportunity_id)
              .maybeSingle();
            opportunityTitle = opp?.title;
          }

          if (convo.pitch_id) {
            const { data: pitch } = await supabase
              .from("pitches")
              .select("title")
              .eq("id", convo.pitch_id)
              .maybeSingle();
            pitchTitle = pitch?.title;
          }

          return {
            ...convo,
            otherUser: profile || { id: otherUserId, full_name: "Utilisateur", avatar_url: null, user_type: "creator" },
            lastMessage: lastMsg || undefined,
            opportunityTitle,
            pitchTitle,
          };
        })
      );

      setConversations(conversationsWithDetails);
    };

    fetchConversations();
  }, [user]);

  // Fetch existing contract for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setExistingContract(null);
      return;
    }

    const fetchContract = async () => {
      setLoadingContract(true);
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("conversation_id", selectedConversation)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setExistingContract(data as Contract);
      } else {
        setExistingContract(null);
      }
      setLoadingContract(false);
    };

    fetchContract();

    // Subscribe to contract changes
    const contractChannel = supabase
      .channel(`contract-for-convo:${selectedConversation}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contracts",
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        () => {
          fetchContract();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contractChannel);
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("Erreur lors du chargement des messages");
        return;
      }

      setMessages(data || []);

      // Mark messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", selectedConversation)
          .neq("sender_id", user.id)
          .eq("read", false);
      }
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          
          // Mark as read if not from current user
          if (user && newMsg.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMsg.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: newMessage.trim(),
      });

    if (error) {
      toast.error("Erreur lors de l'envoi du message");
    } else {
      setNewMessage("");
      
      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConversation);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  const selectedConvo = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Messages | Partnery" description="Discutez avec vos partenaires potentiels et gérez vos conversations sur Partnery." />
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Conversations list */}
          <Card className="md:col-span-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-y-auto h-full">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground px-4">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Aucune conversation</p>
                  </div>
                ) : (
                  conversations.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedConversation(convo.id)}
                      className={`w-full p-4 border-b hover:bg-accent/50 text-left transition-colors ${
                        selectedConversation === convo.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={convo.otherUser.avatar_url || undefined} />
                          <AvatarFallback>
                            {convo.otherUser.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <p className="font-medium truncate">
                              {convo.otherUser.full_name || "Utilisateur"}
                            </p>
                            {convo.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(convo.lastMessage.created_at), "HH:mm", { locale: fr })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {convo.otherUser.user_type === "creator" ? "Créateur" : "Marque"}
                          </p>
                          {convo.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {convo.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages area */}
          <Card className="md:col-span-2 overflow-hidden flex flex-col">
            {selectedConversation && selectedConvo ? (
              <>
                 <div className="p-4 border-b bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                      onClick={() => navigate(`/profile/${selectedConvo.otherUser.id}`)}
                    >
                      <AvatarImage src={selectedConvo.otherUser.avatar_url || undefined} />
                      <AvatarFallback>
                        {selectedConvo.otherUser.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p 
                        className="font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/profile/${selectedConvo.otherUser.id}`)}
                      >
                        {selectedConvo.otherUser.full_name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {selectedConvo.otherUser.user_type === "creator" ? "Créateur" : "Marque"}
                      </p>
                      {(selectedConvo.opportunityTitle || selectedConvo.pitchTitle) && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            A répondu à: {selectedConvo.opportunityTitle || selectedConvo.pitchTitle}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-auto">
                      {/* Contract button - visible for both parties if exists, or create for brand */}
                      {existingContract ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/contract/${existingContract.id}`)}
                          disabled={loadingContract}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir le contrat
                        </Button>
                      ) : userProfile?.user_type === 'brand' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setContractDialogOpen(true)}
                          disabled={loadingContract}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer contrat
                        </Button>
                      )}
                      {userProfile?.user_type === 'brand' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaymentDialogOpen(true)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-sm">Aucun message. Commencez la conversation !</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === user?.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(message.created_at), "HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message input */}
                <div className="p-4 border-t bg-card">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Sélectionnez une conversation</p>
                  <p className="text-sm">
                    Choisissez une conversation à gauche pour commencer à discuter
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Payment Dialog */}
        {selectedConvo && (
          <PaymentDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            payeeId={selectedConvo.otherUser.id}
            payeeName={selectedConvo.otherUser.full_name || "Utilisateur"}
            conversationId={selectedConvo.id}
          />
        )}

        {/* Contract Dialog */}
        {selectedConvo && user && (
          <CreateContractDialog
            open={contractDialogOpen}
            onOpenChange={setContractDialogOpen}
            conversationId={selectedConvo.id}
            brandId={user.id}
            creatorId={selectedConvo.otherUser.id}
            brandName={user.user_metadata?.full_name}
            creatorName={selectedConvo.otherUser.full_name || undefined}
            contextTitle={selectedConvo.opportunityTitle || selectedConvo.pitchTitle}
          />
        )}
      </main>
    </div>
  );
};

export default Messages;
