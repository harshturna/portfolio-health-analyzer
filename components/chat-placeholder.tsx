import { ChartNoAxesColumnIncreasing } from "lucide-react";

interface ChatPlaceholderProps {
  description: string;
  title: string;
}

export default function ChatPlaceholder({
  description,
  title,
}: ChatPlaceholderProps) {
  return (
    <div className="text-center space-y-2">
      <div className="flex justify-center">
        <ChartNoAxesColumnIncreasing size={30} />
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="space-y-4 text-center max-w-lg mx-auto text-sm text-gray-600">
        <p>{description}</p>
      </div>
    </div>
  );
}
