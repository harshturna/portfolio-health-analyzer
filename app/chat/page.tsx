"use client";

import { CircleChevronRight } from "lucide-react";
import ChatMessages from "@/components/chat-messages";
import ChatPlaceholder from "@/components/chat-placeholder";
import ChatQuestionCards from "@/components/chat-question-cards";
import NavTabs from "@/components/ui/nav-tabs";
import { chatPlaceHolderQuestions } from "@/lib/constants";
import { FormEvent, useState, useEffect, useRef } from "react";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isClarification, setIsClarification] = useState(false);
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

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const currentMessages = [...messages];
    setNewMessage("");
    setMessages((prev) => [...prev, { role: "user", content: messageContent }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          newMessage: messageContent,
          isClarification,
        }),
      });
      const data = await res.json();

      setIsClarification(data.clarification);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      // Optionally add error handling UI here
    }
  };

  const handleSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessage(newMessage);
  };

  const handleChatQuestionCard = async (question: string) => {
    await sendMessage(question);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="m-4 md:mx-12">
        <NavTabs tabs={navTabs} />
      </div>
      <div className="flex-1 overflow-auto p-8">
        <div className="w-full max-w-4xl mx-auto h-full">
          {messages.length === 0 ? (
            <div className="mt-2 md:mt-8">
              <ChatPlaceholder />
            </div>
          ) : (
            <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <ChatQuestionCards
              questions={chatPlaceHolderQuestions}
              handleQuestionClick={handleChatQuestionCard}
            />
          ) : null}
          <form className="relative mt-4" onSubmit={handleSubmission}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="w-full rounded-xl border border-gray-200 bg-white/70 p-4 pr-12 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <CircleChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
