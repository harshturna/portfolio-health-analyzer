import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsCardProps {
  metrics: {
    name: string;
    value: string;
  }[];
}

export default function MetricsCard({ metrics }: MetricsCardProps) {
  return (
    <div>
      <Card className="border-none  md:h-[210px]">
        <CardHeader className="mb-2">
          <CardTitle className="text-center md:text-left">
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex-col md:flex-row flex items-center justify-between pr-8 text-center md:text-right gap-6 md:gap-0">
            {metrics.map((metric) => (
              <li key={metric.name}>
                <h2 className="text-lg text-gray-400">{metric.name}</h2>
                <span className="text-2xl lg:text-4xl">{metric.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
