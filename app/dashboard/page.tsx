"use client";

import dynamic from "next/dynamic";

const DynamicPortfolioAnalysis = dynamic(
  () => import("@/components/portfolio-analysis"),
  { ssr: false }
);

export default function Dashboard() {
  return <DynamicPortfolioAnalysis />;
}
