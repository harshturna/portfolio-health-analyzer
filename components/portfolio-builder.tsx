"use client";

import { useRouter } from "next/navigation";

import { useListings } from "@/store/use-listings";
import ListingCard from "@/components/listing-card";
import AddHoldingPopover from "@/components/add-holding-popover";

const PortfolioBuilder = () => {
  const listings = useListings((store) => store.listings);
  const router = useRouter();

  return (
    <div>
      <h2 className="mt-8 mb-6 text-lg sm:text-xl md:text-2xl text-center font-medium">
        Add your portfolio listings
      </h2>
      {listings.map((listing) => (
        <ListingCard key={listing.ticker} listing={listing} />
      ))}
      <AddHoldingPopover />
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

export default PortfolioBuilder;
