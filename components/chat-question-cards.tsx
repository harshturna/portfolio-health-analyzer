import React from "react";
import { Button } from "@/components/ui/button";

interface ChatQuestionProps {
  questions: { title: string; description: string }[];
  handleQuestionClick: (question: string) => void;
}

const ChatQuestionCards = ({
  questions,
  handleQuestionClick,
}: ChatQuestionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-8">
      {questions.map((question) => (
        <Button
          key={question.title}
          variant="ghost"
          className="h-auto p-4 text-left justify-start bg-white"
          onClick={() =>
            handleQuestionClick(`${question.title} ${question.description}`)
          }
        >
          <div>
            <div className="font-medium">{question.title}</div>
            <div className="text-gray-500 text-xs">{question.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default ChatQuestionCards;
