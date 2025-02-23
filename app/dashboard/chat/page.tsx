"use client";

import dynamic from "next/dynamic";

const DynamicPortfolioChat = dynamic(
  () => import("@/components/portfolio-chat"),
  { ssr: false }
);

export default function Dashboard() {
  return <DynamicPortfolioChat />;
}
