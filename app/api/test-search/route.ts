import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { planSearch } from "@/lib/search/plan";
import { filterSearchResults, buildExcludeFilters } from "@/lib/search/filter";
import { ChatMessage } from "@/lib/search/types";
import { authenticateRequest } from "@/lib/api/auth-middleware";

export const config = {
  runtime: "edge",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const { query, testType, chatHistory = [], userInfo = "" } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    if (testType === "planner") {
      console.log("Testing planner with query:", query);
      
      const plan = await planSearch(
        query,
        userInfo || "Computer Science student at UniMelb",
        chatHistory as ChatMessage[],
        openai
      );

      return NextResponse.json({
        success: true,
        plan,
        explanation: {
          requiresSearch: plan.requiresSearch 
            ? "Will perform search" 
            : "No search needed - can answer without searching",
          filterSearch: plan.filterSearch 
            ? "Will filter previous results" 
            : "Fresh search",
          context: plan.context,
          searches: {
            user: plan.searches.user 
              ? `Searching users: "${plan.searches.user}"` 
              : "Not searching users",
            organisation: plan.searches.organisation 
              ? `Searching orgs: "${plan.searches.organisation}"` 
              : "Not searching orgs",
            event: plan.searches.event 
              ? `Searching events: "${plan.searches.event}"` 
              : "Not searching events",
          }
        }
      });
    }

    if (testType === "filter") {
      console.log("Testing filter with query:", query);
      
      // Mock searches based on chat history
      const searches = {
        user: null as string | null,
        organisation: null as string | null,
        event: null as string | null,
      };

      // Try to infer entity types from chat history
      const lastAssistantMessage = chatHistory
        .filter((m: ChatMessage) => m.role === "assistant")
        .slice(-1)[0];
      
      if (lastAssistantMessage?.content.includes("organisation")) {
        searches.organisation = "tech clubs";
      }
      if (lastAssistantMessage?.content.includes("user")) {
        searches.user = "students";
      }
      if (lastAssistantMessage?.content.includes("event")) {
        searches.event = "events";
      }

      const filterResponse = await filterSearchResults(
        query,
        chatHistory as ChatMessage[],
        searches,
        openai
      );

      const filters = filterResponse.include 
        ? null 
        : buildExcludeFilters(filterResponse);

      return NextResponse.json({
        success: true,
        filterResponse,
        filters,
        explanation: {
          mode: filterResponse.include 
            ? "INCLUDE specific entities (user wants details about these)" 
            : "EXCLUDE entities (pagination - show more results)",
          entityCount: filterResponse.entityIds.length,
          entities: filterResponse.entityIds,
          note: filterResponse.include
            ? "These entities should be fetched directly from database"
            : "These entities should be excluded from search results"
        }
      });
    }

    if (testType === "combined") {
      // Test planner + filter together (without actual search execution)
      console.log("Testing planner + filter combination with query:", query);

      // Step 1: Plan
      const plan = await planSearch(
        query, 
        userInfo || "", 
        chatHistory as ChatMessage[], 
        openai
      );
      
      if (!plan.requiresSearch) {
        return NextResponse.json({
          success: true,
          message: "No search required",
          plan,
          explanation: "This query can be answered without searching vector stores"
        });
      }

      // Step 2: Test filter if needed
      let filterResult = null;
      if (plan.filterSearch) {
        console.log("Filtering previous results...");
        const filterResponse = await filterSearchResults(
          query,
          chatHistory as ChatMessage[],
          plan.searches,
          openai
        );
        
        const filters = filterResponse.include 
          ? null 
          : buildExcludeFilters(filterResponse);
        
        filterResult = {
          filterResponse,
          filters,
          explanation: {
            mode: filterResponse.include 
              ? "INCLUDE specific entities" 
              : "EXCLUDE entities (pagination)",
            entityCount: filterResponse.entityIds.length,
            entities: filterResponse.entityIds
          }
        };
      }

      return NextResponse.json({
        success: true,
        plan,
        filterResult,
        note: "Search execution is handled by Achal's implementation"
      });
    }

    return NextResponse.json(
      { error: "Invalid testType. Use 'planner', 'filter', or 'combined'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

