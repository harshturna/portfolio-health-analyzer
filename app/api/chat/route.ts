// src/pages/api/chat.ts
import { NextResponse } from "next/server";
import {
  handleUserQuery,
  handleClarification,
  generateFinalResponse,
} from "@/lib/services/open-ai/chat-handler";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, newMessage, isClarification } = body;

    // Validate input
    if (!Array.isArray(messages) || !newMessage) {
      return NextResponse.json(
        { success: false, type: "client", message: "Invalid request body" },
        { status: 400 }
      );
    }

    let result;

    if (isClarification) {
      result = await handleClarification(
        messages as Message[],
        newMessage as string
      );
    } else {
      result = await handleUserQuery(
        messages as Message[],
        newMessage as string
      );
    }

    // Check if we need clarification
    if (!Array.isArray(result) && result.type === "clarification_needed") {
      return NextResponse.json({
        success: true,
        needsClarification: true,
        question: result.message,
      });
    }

    // If it's a direct response (from context analyzer)
    if (!Array.isArray(result) && result.type === "direct_response") {
      return NextResponse.json({
        success: true,
        answer: result.message,
        needsClarification: false,
      });
    }

    // For other types (query results), generate a comprehensive answer
    const finalAnswer = await generateFinalResponse(
      result as QueryResult | QueryResult[],
      [...messages, { role: "user", content: newMessage }]
    );

    console.log(result);

    return NextResponse.json({
      success: true,
      answer: finalAnswer,
      needsClarification: false,
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { success: false, type: "server", message: "Internal server error" },
      { status: 500 }
    );
  }
}
