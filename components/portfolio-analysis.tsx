"use client";

import RiskScoreChart from "./risk-score-chart";
import {
  calculatePortfolioRiskLevel,
  generatePortfolioSummary,
} from "@/lib/utils";
import { useListings } from "@/store/use-listings";
import ValueCard from "./ui/value-card";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import MetricsCard from "./ui/metrics-card";
import HoldingCard from "./ui/holding-card";
import SectorAllocationChart from "./sector-allocation-chart";

const PortfolioAnalysis = () => {
  const listings = useListings((store) => store.listings);

  const { riskFactors, riskLevel, riskScore } =
    calculatePortfolioRiskLevel(listings);

  const portfolioSummary = generatePortfolioSummary(listings);
  generatePortfolioSummary(listings);

  console.log(portfolioSummary);

  return (
    <div className="p-4 lg:p-8">
      <div className="flex-col lg:flex-row p-4 lg:p-8 pb-4 flex gap-4 flex-wrap justify-center">
        <div className="w-full lg:w-[30%]">
          <RiskScoreChart
            riskScore={riskScore}
            riskLevel={riskLevel}
            riskFactors={riskFactors}
          />
        </div>
        <div className="w-full lg:w-[60%] flex flex-col gap-4 flex-wrap">
          <div className="flex items-start gap-4 w-full flex-wrap flex-col md:flex-row">
            <ValueCard
              value={portfolioSummary.totalValue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
              })}
              description="Total portfolio value"
              icon={ChartNoAxesColumnIncreasing}
            />
            <HoldingCard
              value={`${portfolioSummary.largestHolding.allocation.toFixed(
                2
              )}%`}
              description="Largest Holding"
              holding={portfolioSummary.largestHolding.ticker}
              variant="success"
            />
            <HoldingCard
              value={portfolioSummary.riskiestPosition.beta.toFixed(3)}
              description="Riskiest Position"
              holding={portfolioSummary.riskiestPosition.ticker}
              variant="error"
            />
          </div>
          <div>
            <MetricsCard
              beta={portfolioSummary.portfolioMetrics.portfolioBeta.toFixed(3)}
              netMargin={`${(
                portfolioSummary.portfolioMetrics.portfolioNetMargin * 100
              ).toFixed(2)}%`}
              volatility={`${portfolioSummary.portfolioMetrics.portfolioVolatility.toFixed(
                3
              )}`}
              totalHoldings={`${portfolioSummary.numberOfHoldings}`}
            />
          </div>
        </div>
      </div>
      <SectorAllocationChart chartData={portfolioSummary.formattedSectorData} />
    </div>
  );
};

export default PortfolioAnalysis;
