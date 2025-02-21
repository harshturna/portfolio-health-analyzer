import Hero from "@/components/hero";
import PortfolioBuilder from "@/components/portfolio-builder";
import { analyzeQuery, processAnalyzedQuery } from "@/lib/services/open-ai";

const Home = async () => {
  const analysis = await analyzeQuery(
    "What has ServiceNow's management said about profitability over the last few earnings calls?"
  );

  if (analysis) {
    processAnalyzedQuery(
      analysis,
      "What has ServiceNow's management said about profitability over the last few earnings calls?"
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
