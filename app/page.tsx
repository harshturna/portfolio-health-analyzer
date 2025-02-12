import Hero from "@/components/hero";
import Link from "next/link";

export default function Home() {
  return (
    <main className="h-full flex flex-col items-center mt-6 md:mt-32">
      <Hero />
      <button
        disabled
        className="rounded-[100px] bg-black text-white px-12 py-2 mt-6 mb-4 disabled:bg-black/70"
      >
        Analyze
      </button>
    </main>
  );
}
