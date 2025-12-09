"use client";
import { useCallback, useRef } from "react";
import { ChatMessage, SearchProgress, SearchAction } from "../types";
import { SearchResponse } from "@/lib/search/type";
import { useAuthStore } from "@/stores/authStore";

type MessageUpdater = React.Dispatch<React.SetStateAction<ChatMessage[]>>;

export function useSearchStream(setMessages: MessageUpdater) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const { makeAuthenticatedRequest } = useAuthStore();

  const updateMessage = useCallback(
    (messageId: string, update: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...update } : msg))
      );
    },
    [setMessages]
  );

  const updateProgress = useCallback(
    (messageId: string, progressUpdate: Partial<SearchProgress>) => {
      console.log("Updating progress for message:", messageId, progressUpdate);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          return {
            ...msg,
            progress: {
              actions: msg.progress?.actions ?? [],
              generating: msg.progress?.generating ?? false,
              ...msg.progress,
              ...progressUpdate,
            },
          };
        })
      );
    },
    [setMessages]
  );

  const appendAction = useCallback(
    (messageId: string, action: SearchAction) => {
      console.log("Appending action for message:", messageId, action);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          return {
            ...msg,
            progress: {
              ...msg.progress,
              actions: [...(msg.progress?.actions ?? []), action],
              generating: msg.progress?.generating ?? false,
            },
          };
        })
      );
    },
    [setMessages]
  );

  const updateLastAction = useCallback(
    (messageId: string, actionUpdate: Partial<SearchAction>) => {
      console.log("Updating last action for message:", messageId, actionUpdate);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const actions = [...(msg.progress?.actions ?? [])];
          if (actions.length > 0) {
            actions[actions.length - 1] = {
              ...actions[actions.length - 1],
              ...actionUpdate,
            };
          }
          return {
            ...msg,
            progress: { ...msg.progress!, actions },
          };
        })
      );
    },
    [setMessages]
  );

  const handleEvent = useCallback(
    (messageId: string, data: { type: string; [key: string]: unknown }) => {
      switch (data.type) {
        case "status":
          const step = data.step as string;
          console.log("Handling status update:", step, data);

          if (step === "context") {
            updateProgress(messageId, { context: data.message as string });
          } else if (step === "searching") {
            appendAction(messageId, { searching: data.queries as string[] });
          } else if (step === "refining") {
            updateLastAction(messageId, { refining: data.message as string });
          } else if (step === "reasoning") {
            updateLastAction(messageId, { reasoning: data.message as string });
          } else if (step === "generating") {
            updateProgress(messageId, { generating: true });
          }
          break;

        case "response":
          if (data.partial) {
            updateMessage(messageId, {
              content: data.partial as SearchResponse,
            });
          }
          break;

        case "complete":
          updateMessage(messageId, {
            content: data.response as SearchResponse,
            status: "completed",
          });
          break;

        case "error":
          updateMessage(messageId, { status: "failed" });
          break;
      }
    },
    [updateMessage, updateProgress, appendAction, updateLastAction]
  );

  // Connect to stream with authenticated POST request
  const connectStream = useCallback(
    async (messageId: string) => {
      // Close existing connection if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Initialize progress
      updateMessage(messageId, {
        status: "processing",
        progress: { actions: [], generating: false },
      });

      try {
        const response = await makeAuthenticatedRequest(
          "/api/test/run-search",
          {
            method: "POST",
            body: JSON.stringify({ messageId }),
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Stream request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6); // Remove "data: " prefix
              if (jsonStr.trim()) {
                try {
                  const data = JSON.parse(jsonStr);
                  handleEvent(messageId, data);
                } catch (e) {
                  console.error("Failed to parse SSE data:", e);
                }
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          console.log("Stream aborted");
          return;
        }
        console.error("Stream error:", error);
        updateMessage(messageId, { status: "failed" });
      } finally {
        abortControllerRef.current = null;
      }
    },
    [makeAuthenticatedRequest, updateMessage, handleEvent]
  );

  const closeStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { connectStream, closeStream };
}
