import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export interface UserDetails {
  id: string;
  full_name: string;
  avatar_url: string;
}

export async function fetchUserDetails(
  userId: string
): Promise<UserDetails | null> {
  try {
    // Use Supabase directly instead of fetch
    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(`❌ Supabase error for user ${userId}:`, error);
      return null;
    }

    if (!user) {
      return null;
    }

    const userDetails = {
      id: user.id,
      full_name: `${user.first_name} ${user.last_name}`,
      avatar_url: user.avatar_url || "",
    };

    return userDetails;
  } catch (error) {
    console.error(`❌ Error fetching user details for ${userId}:`, error);
    return null;
  }
}

export async function fetchMultipleUsers(
  userIds: string[]
): Promise<Map<string, UserDetails>> {
  try {
    // Fetch all users in one query for better performance
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .in("id", userIds);

    if (error) {
      console.error("❌ Error fetching multiple users:", error);
      return new Map();
    }

    const userMap = new Map<string, UserDetails>();

    users?.forEach((user) => {
      userMap.set(user.id, {
        id: user.id,
        full_name: `${user.first_name} ${user.last_name}`,
        avatar_url: user.avatar_url || "/placeholder.png",
      });
    });

    return userMap;
  } catch (error) {
    console.error("❌ Error in fetchMultipleUsers:", error);
    return new Map();
  }
}
