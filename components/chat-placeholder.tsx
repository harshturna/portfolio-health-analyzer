import { ChartNoAxesColumnIncreasing } from "lucide-react";
import Link from "next/link";

interface ChatPlaceholderProps {
  description: string;
  title: string;
}

const ChatPlaceholder = ({ description, title }: ChatPlaceholderProps) => (
  <div className="text-center space-y-2">
    <div className="flex justify-center">
      <ChartNoAxesColumnIncreasing size={30} />
    </div>
    <h2 className="text-2xl font-semibold">{title}</h2>
    <div className="space-y-4 text-center max-w-lg mx-auto text-sm text-gray-600">
      <p>{description}</p>
      <p className="mt-4">
        Part of a job application for{" "}
        <Link
          href="https://finchat.io"
          className="underline text-gray-700 font-medium"
        >
          FinChat
        </Link>{" "}
      </p>
    </div>
  </div>
);

export default ChatPlaceholder;
