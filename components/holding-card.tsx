interface HoldingCardProps {
  value: string;
  description: string;
  holding: string;
  variant: "success" | "warning" | "error";
}

const HoldingCard = ({
  value,
  description,
  holding,
  variant,
}: HoldingCardProps) => {
  return (
    <div className="w-full md:w-[40%] lg:w-[32%] h-[200px] rounded-lg bg-white p-8 aspect">
      <div className="h-12">{holding}</div>
      <div className="my-2">
        <h2 className="text-2xl lg:text-3xl font-medium">
          <span
            className={`${
              variant === "success"
                ? "text-green-500"
                : variant === "warning"
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {value}
          </span>
        </h2>
      </div>

      <div>
        <p className="mt-2 font-sans text-base text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default HoldingCard;
