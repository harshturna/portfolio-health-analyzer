"use client";

import { useListings } from "@/store/use-listings";
import ListingCard from "./listing-card";
import TickerWeightInput from "./ticker-weight-input";

const TickerWeight = () => {
  const listings = useListings((store) => store.listings);

  return (
    <div>
      <h2 className="mt-12 mb-6 text-xl md:text-2xl text-center font-medium">
        Add your portfolio listings
      </h2>
      {listings.map((listing) => (
        <ListingCard
          key={listing.ticker}
          ticker={listing.ticker}
          name={listing.name}
          industry={listing.industry}
          logoUrl={listing.logoUrl}
          exchange={listing.exchange}
          shares={listing.userShares}
        />
      ))}
      <TickerWeightInput />
    </div>
  );
};

export default TickerWeight;
