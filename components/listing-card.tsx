"use client";

import { Card, CardContent } from "@/components/ui/card";

import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "@/components/ui/disclosure";
import { calculatePositionRiskLevel } from "@/lib/utils";
import { X } from "lucide-react";

const ListingCard = ({ listing }: { listing: Listing }) => {
  return (
    <Card className="border-none mb-4 mx-auto">
      <CardContent className="px-6 py-2">
        <Disclosure>
          <DisclosureTrigger>
            <div className="flex items-center gap-4 justify-center">
              <div>
                <img src={listing.logoUrl} width={30} height={30} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
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
              <div>
                <X />
              </div>
            </div>
          </DisclosureTrigger>
          <DisclosureContent className="w-[330px] ml-12">
            <h2 className="mt-4 mb-2 font-semibold text-lg">Statistics</h2>
            <ul className="listing-stats">
              <li>
                <span>Beta</span>
                <span>{listing.metrics.beta}</span>
              </li>
              <li>
                <span>Year Return</span>
                <span>
                  {(listing.metrics["52WeekPriceReturnDaily"] * 100).toFixed(3)}
                  %
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
  );
};

export default ListingCard;
