import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// { name, symbol, logoUrl, industry }: Listing

const ListingCard = () => {
  return (
    <Card className="border-none mb-4">
      <CardContent className="flex items-center px-6 py-2 gap-4">
        <div>
          <img
            src="https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png"
            width={30}
            height={30}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Apple</h3>
          <h5 className="text-xs">
            NASDAQ/NMS (GLOBAL MARKET){" "}
            <span className="text-gray-500">AAPL</span>
          </h5>
        </div>
        <div className="ml-auto text-xs text-gray-300 font-bold">
          Technology
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
