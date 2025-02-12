import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ListingState {
  listings: Listing[];
  setListings: (listings: Listing[]) => void;
  addListing: (listing: Listing) => void;
}

export const useListings = create(
  persist<ListingState>(
    (set) => ({
      listings: [],
      setListings: (listings: Listing[]) => set({ listings }),
      addListing: (listing: Listing) =>
        set((state) => ({ listings: [...state.listings, listing] })),
    }),
    { name: "listings-storage" }
  )
);
