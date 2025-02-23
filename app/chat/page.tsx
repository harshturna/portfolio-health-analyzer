"use client";
import Chat from "@/components/chat";
import { chatPlaceHolderQuestions } from "@/lib/constants";
import { useState } from "react";

const AnalysisChat = () => {
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
      // Remove the last user message since the request failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Chat
        error={error}
        isLoading={isLoading}
        messages={messages}
        newMessage={newMessage}
        sendMessage={sendMessage}
        setNewMessage={setNewMessage}
        placeHolderQuestions={chatPlaceHolderQuestions}
      />
    </>
  );
};

export default AnalysisChat;
