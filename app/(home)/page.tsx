import Hero from "@/components/hero";
import PortfolioBuilder from "@/components/portfolio-builder";
import { analyzeQuery, processAnalyzedQuery } from "@/lib/services/open-ai";

const Home = async () => {
  const analysis = await analyzeQuery(
    "what was apple's profit for the year 2023?"
  );

  console.log({ analysis });

  if (analysis) {
    processAnalyzedQuery(
      analysis,
      "what was apple's profit for the year 2023?"
    );
  }

  return (
    <main className="h-full flex flex-col items-center mt-6 md:mt-32">
      <div>
        <Hero />
        <PortfolioBuilder />
      </div>
    </main>
  );
};

export default Home;
