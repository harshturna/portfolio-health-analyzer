"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  sectors: {
    label: "sectors",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface SectorAllocationChartProps {
  chartData: {
    sector: string;
    allocation: number;
  }[];
}

export default function SectorAllocationChart({
  chartData,
}: SectorAllocationChartProps) {
  return (
    <Card className="p-4 border-none mx-3 lg:mx-24">
      <CardHeader className="p-2">
        <CardTitle>Sector Diversification</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[420px] w-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="sector"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="allocation" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-xs">
        <div className="flex gap-2 font-medium leading-none">
          A breakdown of how your investment is distributed across different
          industries.
        </div>
        <div className="leading-none text-muted-foreground">
          High concentration in a single sector may increase portfolio risk
          during industry-specific downturns.
        </div>
      </CardFooter>
    </Card>
  );
}
