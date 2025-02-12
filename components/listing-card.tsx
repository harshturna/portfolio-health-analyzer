import { Card, CardContent } from "@/components/ui/card";

const ListingCard = ({
  name,
  ticker,
  logoUrl,
  industry,
  exchange,
  shares,
}: {
  name: string;
  ticker: string;
  logoUrl: string;
  industry: string;
  exchange: string;
  shares: number;
}) => {
  return (
    <Card className="border-none mb-4">
      <CardContent className="flex items-center px-6 py-2 gap-4">
        <div>
          <img src={logoUrl} width={30} height={30} />
        </div>
        <div>
          <h3 className="text-sm font-semibold">
            {name}{" "}
            <span className="text-gray-400 font-light text-xs ml-1">
              ({shares} {shares === 1 ? "share" : "shares"})
            </span>
          </h3>
          <h5 className="text-xs">
            {exchange} <span className="text-gray-500">{ticker}</span>
          </h5>
        </div>
        <div className="ml-auto text-xs text-gray-300 font-bold">
          {industry}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
