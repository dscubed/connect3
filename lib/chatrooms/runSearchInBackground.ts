import { searchMessage } from "./searchMessage";

export async function runSearchInBackground(messageId: string) {
  try {
    console.log("🔍 Starting background search for message:", messageId);

    // Call the function directly instead of API
    const result = await searchMessage(messageId);

    if (result.success) {
      console.log("✅ Background search completed for message:", messageId);
    } else {
      console.error("❌ Background search failed for message:", messageId);
    }
  } catch (error) {
    console.error("❌ Background search error for message:", messageId, error);
  }
}
