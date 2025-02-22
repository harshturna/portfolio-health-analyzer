"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import Link from "next/link";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat();

  const handleQuestionClick = (question: string) => {
    setInput(question);
    handleSubmit(new Event("submit") as any, { input: question });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-8">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {messages.length === 0 && (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-black rotate-45" />
              <span className="text-2xl">+</span>
              <div className="w-8 h-8 rounded-full border-2 border-black" />
            </div>
            <div className="space-y-4 text-center max-w-lg mx-auto">
              <p className="text-gray-600">
                This is an{" "}
                <Link href="https://github.com/vercel/ai" className="underline">
                  open source
                </Link>{" "}
                chatbot template built with Next.js and the AI SDK by Vercel. It
                uses the{" "}
                <code className="bg-gray-100 rounded px-1">streamText</code>{" "}
                function in the server and the{" "}
                <code className="bg-gray-100 rounded px-1">useChat</code> hook
                on the client to create a seamless chat experience.
              </p>
              <p className="text-gray-600">
                You can learn more about the AI SDK by visiting the{" "}
                <Link href="https://sdk.vercel.ai/docs" className="underline">
                  docs
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[85%] ${
                  m.role === "user" ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-auto p-4 text-left justify-start"
            onClick={() =>
              handleQuestionClick("What are the advantages of using Next.js?")
            }
          >
            <div>
              <div className="font-medium">What are the advantages</div>
              <div className="text-gray-500 text-sm">of using Next.js?</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 text-left justify-start"
            onClick={() =>
              handleQuestionClick(
                "Write code to demonstrate dijkstra's algorithm"
              )
            }
          >
            <div>
              <div className="font-medium">Write code to</div>
              <div className="text-gray-500 text-sm">
                demonstrate dijkstra's algorithm
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 text-left justify-start"
            onClick={() =>
              handleQuestionClick("Help me write an essay about silicon valley")
            }
          >
            <div>
              <div className="font-medium">Help me write an essay</div>
              <div className="text-gray-500 text-sm">about silicon valley</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 text-left justify-start"
            onClick={() =>
              handleQuestionClick("What is the weather in San Francisco?")
            }
          >
            <div>
              <div className="font-medium">What is the weather</div>
              <div className="text-gray-500 text-sm">in San Francisco?</div>
            </div>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Send a message..."
            className="w-full rounded-xl border border-gray-200 p-4 pr-12 focus:outline-none focus:border-black"
          />
          <button
            type="button"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
