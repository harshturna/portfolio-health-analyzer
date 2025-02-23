import { NextResponse } from "next/server";
import { analyzeAndProcessPortfolioQuery } from "@/lib/services/open-ai/query-analyzer";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, newMessage, systemPrompt } = body;

    if (!Array.isArray(messages) || !newMessage || !systemPrompt) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const result = await analyzeAndProcessPortfolioQuery(systemPrompt, [
      ...messages,
      { role: "user", content: newMessage },
    ]);

    return NextResponse.json({
      success: true,
      message: result,
    });
  } catch (error) {
    console.error("[CHAT_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
