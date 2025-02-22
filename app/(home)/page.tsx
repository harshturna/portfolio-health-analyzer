import Hero from "@/components/hero";
import PortfolioBuilder from "@/components/portfolio-builder";
import { analyzeQuery, processAnalyzedQuery } from "@/lib/services/open-ai";

const Home = async () => {
  const analysis = await analyzeQuery(
    [
      {
        role: "user",
        content:
          "What's amazon's rev for 2023 and what did andy jassy say about AWS growth?",
      },
    ],
    true
  );

  console.log({ analysis });

  if (analysis) {
    processAnalyzedQuery(
      analysis,
      "What's Amazon's revenue for 2023 and what did Andy Jassy say about AWS growth?"
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
