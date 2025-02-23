import React, { RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TextLoop } from "./ui/text-loop";

interface ChatMessagesProps {
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
}

const loopLoadingMessages = [
  "Thinking deeply...",
  "Processing your request...",
  "Analyzing context...",
  "Connecting the dots...",
  "Contemplating possibilities...",
  "Organizing thoughts...",
  "Harmonizing ideas...",
  "Mapping concepts...",
  "Almost there...",
];

const ChatMessages = ({
  messages,
  messagesEndRef,
  isLoading,
}: ChatMessagesProps) => {
  return (
    <div className="space-y-4 max-h-[calc(100vh-300px)] rounded-md chat-messages">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${
            m.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`rounded-lg px-4 py-2 max-w-[85%] ${
              m.role === "user" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {m.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
      {isLoading ? (
        <TextLoop interval={3}>
          {loopLoadingMessages.map((message) => (
            <span key={message} className="text-gray-400">
              {message}
            </span>
          ))}
        </TextLoop>
      ) : (
        ""
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
