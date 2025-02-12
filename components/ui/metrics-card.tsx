import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const MetricsCard = ({
  beta,
  netMargin,
  volatility,
  totalHoldings,
}: {
  beta: string;
  netMargin: string;
  volatility: string;
  totalHoldings: string;
}) => {
  return (
    <div>
      <Card className="border-none  md:h-[210px]">
        <CardHeader className="mb-2">
          <CardTitle className="text-center md:text-left">
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-col md:flex-row flex items-center justify-between pr-8 text-center md:text-right gap-6 md:gap-0">
          <div>
            <h2 className="text-lg text-gray-400">Beta</h2>
            <span className="text-2xl lg:text-4xl">{beta}</span>
          </div>
          <div>
            <h2 className="text-lg text-gray-400">Net Margin</h2>
            <span className="text-2xl lg:text-4xl">{netMargin}</span>
          </div>
          <div>
            <h2 className="text-lg text-gray-400">Volatility</h2>
            <span className="text-2xl lg:text-4xl">{volatility}</span>
          </div>
          <div>
            <h2 className=" text-lg text-gray-400">Total Holdings</h2>
            <span className="text-2xl lg:text-4xl">{totalHoldings}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCard;
