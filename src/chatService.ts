import { supabase } from './lib/supabase';
import { ChatConversation, ChatParticipant, ChatMessage, ChatUserConversationSettings } from './types';

export const chatService = {
  // --- Conversations ---
  
  async getConversations(userId: string) {
    if (!supabase) return [];
    
    // Get conversations where the user is a participant
    const { data: participants, error: pError } = await supabase
      .from('chat_participants')
      .select('conversation_id')
      .eq('user_id', userId)
      .eq('active', true);
      
    if (pError || !participants) return [];
    
    const conversationIds = participants.map(p => p.conversation_id);
    
    if (conversationIds.length === 0) return [];
    
    const { data: conversations, error: cError } = await supabase
      .from('chat_conversations')
      .select('*')
      .in('id', conversationIds)
      .eq('active', true)
      .order('last_message_at', { ascending: false });
      
    if (cError) return [];
    
    // Get settings (archived, pinned) for these conversations
    const { data: settings } = await supabase
      .from('chat_user_conversation_settings')
      .select('*')
      .eq('user_id', userId)
      .in('conversation_id', conversationIds);
      
    // Merge conversations with settings
    return conversations.map(conv => {
      const convSetting = settings?.find(s => s.conversation_id === conv.id);
      return {
        ...conv,
        isArchived: convSetting?.is_archived ?? false,
        isPinned: convSetting?.is_pinned ?? false,
        unreadCount: 0, // Will be calculated after
      };
    });
  },

  async createPrivateChat(myUserId: string, otherUserId: string) {
    if (!supabase) return null;

    // Check if a private chat already exists between these two
    // This is complex in SQL without a composite unique, so we'll check it here
    const { data: myChats } = await supabase
      .from('chat_participants')
      .select('conversation_id')
      .eq('user_id', myUserId)
      .eq('active', true);

    if (myChats && myChats.length > 0) {
      const myConvIds = myChats.map(c => c.conversation_id);
      
      const { data: existing } = await supabase
        .from('chat_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', myConvIds)
        .eq('active', true);

      // Verify if it's a PRIVATE chat
      if (existing && existing.length > 0) {
        const { data: conv } = await supabase
          .from('chat_conversations')
          .select('*')
          .in('id', existing.map(e => e.conversation_id))
          .eq('type', 'PRIVATE')
          .single();
          
        if (conv) return conv;
      }
    }

    // Create new private chat
    const { data: newConv, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        type: 'PRIVATE',
        created_by_user_id: myUserId,
      })
      .select()
      .single();

    if (convError || !newConv) return null;

    // Add participants
    await supabase.from('chat_participants').insert([
      { conversation_id: newConv.id, user_id: myUserId },
      { conversation_id: newConv.id, user_id: otherUserId }
    ]);

    return newConv;
  },

  // --- Messages ---

  async getMessages(conversationId: string, limit = 50) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) return [];
    return data.reverse(); // Return in chronological order
  },

  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    type: 'TEXT' | 'IMAGE' | 'DOCUMENT';
    content?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  }) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: params.conversationId,
        sender_user_id: params.senderId,
        message_type: params.type,
        text_content: params.content,
        file_url: params.fileUrl,
        file_name: params.fileName,
        file_size: params.fileSize,
        mime_type: params.mimeType,
        status_envio: 'ENVIADA'
      })
      .select()
      .single();

    if (error) return null;

    // Update conversation last_message
    await supabase.from('chat_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: params.type === 'TEXT' ? params.content : `[${params.type}]`
      })
      .eq('id', params.conversationId);

    return data;
  },

  // --- Realtime ---

  subscribeToMessages(conversationId: string, onMessage: (msg: ChatMessage) => void) {
    if (!supabase) return () => {};

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
  
  subscribeToConversations(userId: string, onChange: () => void) {
    if (!supabase) return () => {};

    const channel = supabase
      .channel(`user_chats:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations'
        },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
