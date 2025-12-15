import { EntityFilterOptions } from "@/components/home/hooks/useSearch";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export const createChatroom = async (query: string) => {
  const { user, getSupabaseClient } = useAuthStore.getState();

  if (!user) {
    toast.error("User not authenticated. Please log in.");
    return;
  }

  const userId = user.id;
  const supabase = getSupabaseClient();

  // Create chatroom
  const title = query.length > 50 ? query.substring(0, 50) + "..." : query;
  const { data: createData, error: createError } = await supabase
    .from("chatrooms")
    .insert({
      title: title,
      created_by: userId,
    })
    .select()
    .single();

  if (createError || !createData) {
    console.error("❌ Error creating chatroom:", createError);
    toast.error("Failed to create chatroom. Please try again.");
    return;
  }

  // Create initial message
  const { data: messageData, error: messageError } = await supabase
    .from("chatmessages")
    .insert({
      chatroom_id: createData.id,
      query: query,
      content: null,
      user_id: userId,
      status: "pending",
    })
    .select()
    .single();

  if (messageError || !messageData) {
    console.error("❌ Error creating initial message:", messageError);
    toast.error("Failed to create initial message. Please try again.");
    return;
  }

  return {
    chatroomId: createData.id,
    messageId: messageData.id,
  };
};
