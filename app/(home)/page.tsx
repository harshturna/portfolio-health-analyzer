import Hero from "@/components/hero";
import PortfolioBuilder from "@/components/portfolio-builder";

const Home = () => (
  <main className="h-full flex flex-col items-center mt-6 md:mt-32">
    <div>
      <Hero />
      <PortfolioBuilder />
    </div>
  </main>
);

export default Home;
