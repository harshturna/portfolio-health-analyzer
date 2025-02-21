import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const RISK_COLORS = ["#22c55e", "#facc15", "#ef4444"];
const MAX_VALUE = 8;

const RiskScoreChart = ({ riskFactors, riskLevel, riskScore }: RiskSummary) => {
  const riskColor =
    riskScore <= 2
      ? RISK_COLORS[0]
      : riskScore <= 5
      ? RISK_COLORS[1]
      : RISK_COLORS[2];

  const size = 250;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const pathLength = Math.PI * radius;

  const progress = (riskScore / MAX_VALUE) * 100;
  const dashOffset = pathLength - (pathLength * progress) / 100;

  const pathD = [
    `M ${center - radius} ${center}`,
    `A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`,
  ].join(" ");

  return (
    <Card className="flex flex-col border-none h-[430px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Risk Score</CardTitle>
        <CardDescription>
          A composite measure of your portfolio&apos;s risk level
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <div className="mx-auto aspect-square w-full max-w-[250px]">
          <svg
            width={size}
            height={size / 2 + strokeWidth}
            className="transform translate-y-4"
          >
            <path
              d={pathD}
              fill="none"
              stroke="#f0f0f0"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            <path
              d={pathD}
              fill="none"
              stroke={riskColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={dashOffset}
            />

            <text
              x={center}
              y={center - 10}
              textAnchor="middle"
              className="fill-foreground text-2xl font-bold"
            >
              {riskScore.toLocaleString()}
            </text>
            <text
              x={center}
              y={center + 20}
              textAnchor="middle"
              className="fill-muted-foreground text-sm"
            >
              {riskLevel}
            </text>
          </svg>
        </div>
      </CardContent>
      {riskFactors && riskFactors.length ? (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Risk Factors
          </div>
          {riskFactors.map((factor, i) => (
            <div key={i} className="leading-none text-xs text-muted-foreground">
              {factor}
            </div>
          ))}
        </CardFooter>
      ) : null}
    </Card>
  );
};

export default RiskScoreChart;
