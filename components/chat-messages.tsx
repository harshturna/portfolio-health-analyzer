import React, { RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessagesProps {
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

const ChatMessages = ({ messages, messagesEndRef }: ChatMessagesProps) => {
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
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
