import useSWR from "swr";
import type { InstagramPost } from "@/app/api/instagram-posts/[id]/route";

export type { InstagramPost };

export function useInstagramPostCache(postId: string | null) {
  const swrKey = postId ? `/api/instagram-posts/${postId}` : null;

  const { data, error, isLoading } = useSWR<{ post: InstagramPost }>(
    swrKey,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
      return res.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    },
  );

  return { post: data?.post ?? null, isLoading, error };
}
