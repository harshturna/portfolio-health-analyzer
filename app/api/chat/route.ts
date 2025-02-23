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

    console.log({ messages, newMessage, isClarification });

    // Validate input
    if (!Array.isArray(messages) || !newMessage) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    let result;

    if (isClarification) {
      // if the new answer was a clarification
      result = await handleClarification(
        messages as Message[],
        newMessage as string
      );
    } else {
      // normal flow
      result = await handleUserQuery(
        messages as Message[],
        newMessage as string
      );
    }

    // if we need clarification from user
    if (!Array.isArray(result) && result.type === "clarification_needed") {
      return NextResponse.json({
        success: true,
        needsClarification: true,
        message: result.message,
      });
    }

    // If it's a direct response to existing context
    if (!Array.isArray(result) && result.type === "direct_response") {
      return NextResponse.json({
        success: true,
        message: result.message,
        needsClarification: false,
      });
    }

    // For other types (query results), generate a comprehensive answer
    const finalAnswer = await generateFinalResponse(
      result as QueryResult | QueryResult[],
      [...messages, { role: "user", content: newMessage }]
    );

    return NextResponse.json({
      success: true,
      message: finalAnswer,
      needsClarification: false,
    });
  } catch (error) {
    console.error("[CHAT_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
