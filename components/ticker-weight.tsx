"use client";

import { useListings } from "@/store/use-listings";
import ListingCard from "./listing-card";
import TickerWeightInput from "./ticker-weight-input";

const TickerWeight = () => {
  const listings = useListings((store) => store.listings);

  return (
    <div>
      <h2 className="mt-12 mb-6 text-lg sm:text-xl md:text-2xl text-center font-medium">
        Add your portfolio listings
      </h2>
      {listings.map((listing) => (
        <ListingCard key={listing.ticker} listing={listing} />
      ))}
      <TickerWeightInput />
    </div>
  );
};

export default TickerWeight;
