import Hero from "@/components/hero";
import PortfolioBuilder from "@/components/portfolio-builder";
import CopilotButton from "@/components/copilot-button";

export default async function Home() {
  return (
    <main className="h-[calc(100vh+50px)] max-w-7xl mx-auto">
      <div className="flex justify-end pt-12 px-6 md:px-12">
        <CopilotButton />
      </div>
      <div className="flex flex-col items-center px-4">
        <div>
          <Hero />
          <PortfolioBuilder />
        </div>
      </div>
    </main>
  );
}
