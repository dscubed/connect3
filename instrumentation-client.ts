import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    // Chatrooms (authenticated via authenticateRequest)
    { path: "/api/chatrooms/getChunks", method: "GET" },
    { path: "/api/chatrooms/runSearch", method: "POST" },

    // Profiles (authenticated via authenticateRequest)
    { path: "/api/profiles/getChunks", method: "GET" },
    { path: "/api/profiles/updateChunk", method: "PATCH" },
    { path: "/api/profiles/auto-generate-tldr", method: "POST" },
    { path: "/api/profiles/generate-tldr", method: "POST" },
    { path: "/api/profiles/enhance-field", method: "POST" },
    { path: "/api/profiles/resume", method: "POST" },

    // Vector store (authenticated via authenticateRequest)
    { path: "/api/vector-store/uploadChunk", method: "POST" },
    { path: "/api/vector-store/uploadProfile", method: "POST" },
    { path: "/api/vector-store/deleteChunk/*", method: "DELETE" },
    { path: "/api/vector-store/events/*", method: "POST" },
    { path: "/api/vector-store/events/*", method: "PATCH" },
    { path: "/api/vector-store/events/*", method: "DELETE" },

    // Events (mutations authenticated via authenticateRequest)
    { path: "/api/events/*", method: "POST" },
    { path: "/api/events/*", method: "PATCH" },
    { path: "/api/events/*", method: "DELETE" },

    // Validation (authenticated via authenticateRequest)
    { path: "/api/validate/chunks", method: "POST" },
    { path: "/api/validate/text", method: "POST" },

    // Onboarding
    { path: "/api/onboarding/chunkText", method: "POST" },
    { path: "/api/onboarding/humanitix/createSecret", method: "POST" },

    // Unauthenticated POST routes (checkBotId called directly)
    { path: "/api/blur", method: "POST" },
    { path: "/api/contact", method: "POST" },
    { path: "/api/resize", method: "POST" },
  ],
});
