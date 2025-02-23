import Hero from "@/components/hero";
import PortfolioBuilder from "@/components/portfolio-builder";
import CopilotButton from "@/components/copilot-button";
import { MessageCircle } from "lucide-react";

const Home = async () => (
  <main className="h-full max-w-7xl mx-auto">
    <div className="flex justify-end pt-12 px-6 md:px-12">
      <CopilotButton />
    </div>
    <div className="flex flex-col items-center mt-6 md:mt-28 px-4">
      <div>
        <Hero />
        <PortfolioBuilder />
      </div>
    </div>
  </main>
);

export default Home;
