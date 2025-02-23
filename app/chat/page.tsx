"use client";
import Chat from "@/components/chat";
import NavTabs from "@/components/ui/nav-tabs";
import { chatPlaceHolderQuestions } from "@/lib/constants";
import { useState } from "react";

const navTabs = [
  { name: "Home", link: "/" },
  { name: "Chat", link: "/chat" },
];

export default function AnalysisChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isClarification, setIsClarification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    setIsLoading(true);
    setError(null);
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

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setIsClarification(data.needsClarification);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setError("Failed to send message. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 md:mx-12">
        <NavTabs tabs={navTabs} />
      </div>
      <Chat
        error={error}
        isLoading={isLoading}
        messages={messages}
        newMessage={newMessage}
        sendMessage={sendMessage}
        setNewMessage={setNewMessage}
        placeHolderQuestions={chatPlaceHolderQuestions}
        headerTitle="Your AI financial companion"
        headerDescription="Analyze stocks, summarize earnings calls, compare companies, and explore
        financial metrics with AI-powered insights. Ask a question to get
        started"
      />
    </div>
  );
}
