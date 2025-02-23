"use client";

import { ChartNoAxesColumnIncreasing } from "lucide-react";

import { METRICS } from "@/lib/constants";
import { useListings } from "@/store/use-listings";
import ValueCard from "@/components/value-card";
import HoldingCard from "@/components/holding-card";
import MetricsCard from "@/components/metrics-card";
import RiskScoreChart from "@/components/risk-score-chart";
import SectorAllocationChart from "@/components/sector-allocation-chart";
import {
  calculatePortfolioRiskLevel,
  generatePortfolioSummary,
} from "@/lib/services/portfolio/portfolio";

export default function PortfolioAnalysis() {
  const listings = useListings((store) => store.listings);

  if (!listings.length) {
    return (
      <div className="text-center text-xl text-gray-400 flex items-center justify-center h-full w-full">
        Add your portfolio listings to see dashboard
      </div>
    );
  }

  const { riskFactors, riskLevel, riskScore } =
    calculatePortfolioRiskLevel(listings);

  const portfolioSummary = generatePortfolioSummary(listings);

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
              value={`${portfolioSummary.riskiestPosition.beta.toFixed(
                3
              )} (Beta)`}
              description="Riskiest Position"
              holding={portfolioSummary.riskiestPosition.ticker}
              variant="error"
            />
          </div>
          <div>
            <MetricsCard
              metrics={METRICS.map((metric) => ({
                name: metric.name,
                value: metric.getValue(portfolioSummary.portfolioMetrics),
              }))}
            />
          </div>
        </div>
      </div>
      <SectorAllocationChart chartData={portfolioSummary.formattedSectorData} />
    </div>
  );
}
