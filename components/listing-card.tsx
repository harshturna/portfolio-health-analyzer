"use client";

import { Card, CardContent } from "@/components/ui/card";

import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "@/components/ui/disclosure";
import { calculatePositionRiskLevel } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useListings } from "@/store/use-listings";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const deleteListing = useListings((state) => state.deleteListing);

  return (
    <div className="relative group">
      <Card className="border-none mb-4 mx-auto w-[88%]">
        <CardContent className="px-6 py-2">
          <Disclosure>
            <DisclosureTrigger>
              <div className="flex items-center gap-4 justify-center">
                <div>
                  <img src={listing.logoUrl} width={30} height={30} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold">
                    {listing.name}{" "}
                    <span className="text-gray-400 font-light text-xs ml-1">
                      ({listing.userShares}{" "}
                      {listing.userShares === 1 ? "share" : "shares"})
                    </span>
                  </h3>
                  <h5 className="text-xs">
                    {listing.exchange}{" "}
                    <span className="text-gray-500">{listing.ticker}</span>
                  </h5>
                </div>
                <div className="ml-auto text-xs text-gray-300 font-bold">
                  {listing.industry}
                </div>
              </div>
            </DisclosureTrigger>
            <DisclosureContent className="w-[300px] sm-w-[350px] ml-1 sm:ml-4 md:ml-12">
              <h2 className="pt-4 mb-2 font-semibold text-md sm:text-lg">
                Statistics
              </h2>
              <ul className="listing-stats">
                <li>
                  <span>Beta</span>
                  <span>{listing.metrics.beta}</span>
                </li>
                <li>
                  <span>Year Return</span>
                  <span>
                    {listing.metrics["52WeekPriceReturnDaily"].toFixed(2)}%
                  </span>
                </li>
                <li>
                  <span>Risk Level</span>
                  <span>{calculatePositionRiskLevel(listing)}</span>
                </li>
                <li>
                  <span>Annual High</span>
                  <span>{listing.metrics["52WeekHigh"]}</span>
                </li>
                <li>
                  <span>Annual Low</span>
                  <span>{listing.metrics["52WeekLow"]}</span>
                </li>
              </ul>
            </DisclosureContent>
          </Disclosure>
        </CardContent>
      </Card>
      <Button
        className="absolute top-2 right-0 opacity-0 group-hover:opacity-100 transition"
        size="icon"
        variant="ghost"
        onClick={() => deleteListing(listing)}
      >
        <X />
      </Button>
    </div>
  );
};

export default ListingCard;
