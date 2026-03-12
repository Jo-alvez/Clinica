import { supabase } from './lib/supabase';
import { ChatConversation, ChatParticipant, ChatMessage, ChatUserConversationSettings } from './types';

// Helpers to map snake_case from DB to camelCase for UI
const mapConversation = (conv: any): ChatConversation => ({
  id: conv.id,
  type: conv.type,
  nomeGroup: conv.nome_group,
  descricaoGroup: conv.descricao_group,
  avatarUrl: conv.avatar_url,
  createdByUserId: conv.created_by_user_id,
  isInstitutional: conv.is_institutional,
  active: conv.active,
  lastMessageAt: conv.last_message_at,
  lastMessagePreview: conv.last_message_preview,
  createdAt: conv.created_at,
  updatedAt: conv.updated_at,
  unreadCount: conv.unreadCount || 0,
});

const mapMessage = (msg: any): ChatMessage => ({
  id: msg.id,
  conversationId: msg.conversation_id,
  senderUserId: msg.sender_user_id,
  messageType: msg.message_type,
  textContent: msg.text_content,
  fileUrl: msg.file_url,
  fileName: msg.file_name,
  fileSize: msg.file_size,
  mimeType: msg.mime_type,
  thumbnailUrl: msg.thumbnail_url,
  replyToMessageId: msg.reply_to_message_id,
  statusEnvio: msg.status_envio,
  editedAt: msg.edited_at,
  removedAt: msg.removed_at,
  createdAt: msg.created_at,
  updatedAt: msg.updated_at,
});

export const chatService = {
  // --- Conversations ---
  
  async getConversations(userId: string) {
    if (!supabase) return [];
    
    // 1. Get conversations where the user is a participant
    const { data: participants, error: pError } = await supabase
      .from('chat_participants')
      .select('conversation_id')
      .eq('user_id', userId)
      .eq('active', true);
      
    if (pError || !participants) return [];
    
    const conversationIds = participants.map(p => p.conversation_id);
    if (conversationIds.length === 0) return [];
    
    // 2. Fetch conversations details
    const { data: conversations, error: cError } = await supabase
      .from('chat_conversations')
      .select('*')
      .in('id', conversationIds)
      .eq('active', true)
      .order('last_message_at', { ascending: false });
      
    if (cError || !conversations) return [];
    
    // 3. Fetch all participants for these conversations to get names/avatars in PRIVATE chats
    const { data: allParticipants } = await supabase
      .from('chat_participants')
      .select('conversation_id, user_id, profiles:user_id(name, avatar)')
      .in('conversation_id', conversationIds)
      .eq('active', true);

    // 4. Get individual user settings
    const { data: settings } = await supabase
      .from('chat_user_conversation_settings')
      .select('*')
      .eq('user_id', userId)
      .in('conversation_id', conversationIds);
      
    return conversations.map(conv => {
      const convSetting = settings?.find(s => s.conversation_id === conv.id);
      const mapped = mapConversation(conv);
      
      // If it's a private chat, find the OTHER user to use as Title/Avatar
      if (conv.type === 'PRIVATE' && allParticipants) {
        const otherParticipant = allParticipants.find(p => p.conversation_id === conv.id && p.user_id !== userId);
        if (otherParticipant && otherParticipant.profiles) {
          const profile = otherParticipant.profiles as any;
          mapped.nomeGroup = profile.name;
          mapped.avatarUrl = profile.avatar;
        }
      }

      // Format last message time for UI
      if (mapped.lastMessageAt) {
        const date = new Date(mapped.lastMessageAt);
        mapped.lastMessageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return {
        ...mapped,
        isArchived: convSetting?.is_archived ?? false,
        isPinned: convSetting?.is_pinned ?? false,
      };
    });
  },

  async createPrivateChat(myUserId: string, otherUserId: string) {
    if (!supabase) return null;

    // Check if a private chat already exists between these two
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
          
        if (conv) return mapConversation(conv);
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

    return mapConversation(newConv);
  },

  async createGroupChat(params: {
    nomeGroup: string;
    descricaoGroup?: string;
    avatarUrl?: string;
    myUserId: string;
    participantIds: string[];
    isInstitutional?: boolean;
  }) {
    if (!supabase) return null;

    // Create group conversation
    const { data: newConv, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        type: 'GROUP',
        nome_group: params.nomeGroup,
        descricao_group: params.descricaoGroup,
        avatar_url: params.avatarUrl,
        created_by_user_id: params.myUserId,
        is_institutional: params.isInstitutional ?? false
      })
      .select()
      .single();

    if (convError || !newConv) return null;

    // Add all participants including creator
    const participants = [params.myUserId, ...params.participantIds].map(uid => ({
      conversation_id: newConv.id,
      user_id: uid,
      role_in_group: uid === params.myUserId ? 'ADMIN_GROUP' : 'MEMBER'
    }));

    await supabase.from('chat_participants').insert(participants);

    // System message: group created
    await this.sendMessage({
      conversationId: newConv.id,
      senderId: params.myUserId,
      type: 'SYSTEM',
      content: 'Grupo criado'
    });

    return mapConversation(newConv);
  },

  async getConversationDetails(conversationId: string) {
    if (!supabase) return null;
    
    // Get conversation info
    const { data: conv } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
      
    if (!conv) return null;
    
    // Get participants with user profiles
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('*, profiles:user_id(*)')
      .eq('conversation_id', conversationId)
      .eq('active', true);
      
    return {
      ...mapConversation(conv),
      participants: participants || []
    };
  },

  // --- Storage & Files ---

  async uploadChatFile(file: File, path: string) {
    if (!supabase) return null;
    
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(`${path}/${fileName}`, file);
      
    if (error) {
      console.error('Erro no upload:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(data.path);
      
    return publicUrl;
  },

  async updateConversationSettings(userId: string, conversationId: string, updates: Partial<ChatUserConversationSettings>) {
    if (!supabase) return;

    const { error } = await supabase
      .from('chat_user_conversation_settings')
      .upsert({
        user_id: userId,
        conversation_id: conversationId,
        is_archived: updates.isArchived,
        is_pinned: updates.isPinned,
        muted_until: updates.mutedUntil,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,conversation_id' });

    if (error) console.error('Erro ao atualizar configurações:', error);
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
    return data.reverse().map(mapMessage); // Return in chronological order
  },

  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'SYSTEM';
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

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
      return null;
    }

    // Update conversation last_message
    await supabase.from('chat_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: params.type === 'TEXT' ? params.content : `[${params.type}]`
      })
      .eq('id', params.conversationId);

    return mapMessage(data);
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
          onMessage(mapMessage(payload.new));
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
