"use client";

import { useListings } from "@/store/use-listings";
import ListingCard from "./listing-card";
import TickerWeightInput from "./ticker-weight-input";
import { useRouter } from "next/navigation";

const TickerWeight = () => {
  const listings = useListings((store) => store.listings);
  const router = useRouter();

  return (
    <div>
      <h2 className="mt-12 mb-6 text-lg sm:text-xl md:text-2xl text-center font-medium">
        Add your portfolio listings
      </h2>
      {listings.map((listing) => (
        <ListingCard key={listing.ticker} listing={listing} />
      ))}
      <TickerWeightInput />
      <div className="flex items-center justify-center">
        <button
          disabled={!listings.length}
          className="rounded-[100px] bg-black text-white px-14 py-2 mt-6 mb-4 disabled:bg-black/70"
          onClick={() => router.push("/dashboard")}
        >
          Analyze
        </button>
      </div>
    </div>
  );
};

export default TickerWeight;
