import { LucideIcon } from "lucide-react";

interface ValueCardProps {
  value: string;
  description: string;
  icon: LucideIcon;
}

const ValueCard = ({ value, description, icon: Icon }: ValueCardProps) => {
  return (
    <div className="w-full md:w-[32%] h-[200px] rounded-lg bg-white p-8 aspect">
      <div className="h-12">
        <Icon className="text-green-500" />
      </div>
      <div className="my-2">
        <h2 className="text-2xl lg:text-3xl font-medium">
          <span>{value}</span>
        </h2>
      </div>

      <div>
        <p className="mt-2 font-sans text-base text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default ValueCard;
