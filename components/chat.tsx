"use client";

import { FormEvent, useEffect, useRef } from "react";
import { CircleChevronRight } from "lucide-react";

import NavTabs from "@/components/ui/nav-tabs";
import ChatMessages from "@/components/chat-messages";
import ChatPlaceholder from "@/components/chat-placeholder";
import ChatQuestionCards from "@/components/chat-question-cards";

interface ChatProps {
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: (messageContent: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  placeHolderQuestions: {
    title: string;
    description: string;
  }[];
  headerDescription: string;
  headerTitle: string;
}

export default function Chat({
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  isLoading,
  error,
  placeHolderQuestions,
  headerDescription,
  headerTitle,
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navTabs = [
    { name: "Home", link: "/" },
    { name: "Chat", link: "/chat" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessage(newMessage);
  };

  const handleChatQuestionCard = async (question: string) => {
    await sendMessage(question);
  };

  return (
    <div className="flex flex-col min-h-[90vh]">
      <div className="flex-1 overflow-auto p-8">
        <div className="w-full max-w-4xl mx-auto h-full">
          {messages.length === 0 ? (
            <div className="mt-2 md:mt-8">
              <ChatPlaceholder
                description={headerDescription}
                title={headerTitle}
              />
            </div>
          ) : (
            <ChatMessages
              messages={messages}
              messagesEndRef={messagesEndRef}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          {messages.length === 0 ? (
            <ChatQuestionCards
              questions={placeHolderQuestions}
              handleQuestionClick={handleChatQuestionCard}
            />
          ) : null}
          <form className="relative mt-4" onSubmit={handleSubmission}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="w-full rounded-xl border border-gray-200 bg-white/70 p-4 pr-12 focus:outline-none focus:border-black"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`absolute right-4 top-4 ${
                isLoading
                  ? "text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              disabled={isLoading}
            >
              <CircleChevronRight
                className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
