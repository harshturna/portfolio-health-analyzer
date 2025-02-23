"use client";
import Chat from "@/components/chat";
import { portfolioPlaceholderQuestions } from "@/lib/constants";
import { useState } from "react";
import { useListings } from "@/store/use-listings";
import { generatePortfolioSummary, injectValuesIntoPrompt } from "@/lib/utils";
import { PORTFOLIO_ANALYZER } from "@/lib/prompts";

const PortfolioChat = () => {
  const listings = useListings((store) => store.listings);
  const portfolioSummary = generatePortfolioSummary(listings);
  const listingsWithSummary = {
    Listings: listings,
    "Portfolio Summary": portfolioSummary,
  };

  let portfolioPrompt = PORTFOLIO_ANALYZER.prompt;

  try {
    portfolioPrompt = injectValuesIntoPrompt(portfolioPrompt, {
      PORTFOLIO: JSON.stringify(listingsWithSummary),
    });
  } catch {}

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
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
      const res = await fetch("/api/portfolio-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          newMessage: messageContent,
          systemPrompt: portfolioPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
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
    <>
      <Chat
        error={error}
        isLoading={isLoading}
        messages={messages}
        newMessage={newMessage}
        sendMessage={sendMessage}
        setNewMessage={setNewMessage}
        placeHolderQuestions={portfolioPlaceholderQuestions}
        headerTitle="Your AI Portfolio Companion"
        headerDescription="Get instant insights about your investment portfolio through AI analysis. Ask questions about your holdings, sector allocation, concentration risks, and overall portfolio health."
      />
    </>
  );
};

export default PortfolioChat;
