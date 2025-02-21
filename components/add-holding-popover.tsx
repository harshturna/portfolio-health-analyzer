"use client";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowLeftIcon, Plus } from "lucide-react";
import { useRef, useState, useEffect, useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListings } from "@/store/use-listings";
import useClickOutside from "@/hooks/use-click-outside";

const TRANSITION = {
  type: "spring",
  bounce: 0.05,
  duration: 0.3,
};

interface ListingResponse {
  success: boolean;
  type: "client" | "server";
  message?: string;
  data?: Listing;
}

const AddHoldingPopover = () => {
  const uniqueId = useId();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const addListing = useListings((store) => store.addListing);
  const listing = useListings((store) => store.listings);

  const openMenu = () => {
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!ticker) {
      setError("Missing ticker");
      return;
    }

    if (!shares) {
      setError("Missing shares");
      return;
    }

    const isExisting = listing.some((listing) => listing.ticker === ticker);

    if (isExisting) {
      setError("Listing already added");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const resp = await fetch("/api/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, shares }),
      });

      let data: ListingResponse;

      try {
        data = await resp.json();
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (!resp.ok || !data.success || !data.data) {
        throw new Error(data.message || "Unknown error occurred");
      }
      addListing(data.data);
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding listing:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
      setShares(1);
      setTicker("");
    }
  };

  const closeMenu = () => {
    setTicker("");
    setLoading(false);
    setError("");
    setShares(1);
    setIsOpen(false);
  };

  useClickOutside(formContainerRef, () => {
    closeMenu();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <MotionConfig transition={TRANSITION}>
      <div className="relative flex items-center justify-center">
        <motion.button
          key="button"
          layoutId={`popover-${uniqueId}`}
          className="flex items-center px-3 text-zinc-950"
          onClick={openMenu}
        >
          <span className="text-gray-300">--------</span>
          <motion.span
            layoutId={`popover-label-${uniqueId}`}
            className="text-sm border relative w-[40px] h-[40px] rounded-[50%] mx-2"
          >
            <Plus
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              width={20}
              height={20}
            />
          </motion.span>
          <span className="text-gray-300">--------</span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={formContainerRef}
              layoutId={`popover-${uniqueId}`}
              className="absolute h-[280px] w-[364px] overflow-hidden border bg-background outline-hidden"
              style={{
                borderRadius: 12,
              }}
            >
              <form
                className="flex h-full flex-col p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="ticker-input" className="mb-1">
                      Ticker
                    </Label>
                    <Input
                      id="ticker-input"
                      placeholder="AAPL"
                      required
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shares-input" className="mb-1">
                      Shares
                    </Label>
                    <Input
                      id="shares-input"
                      placeholder="1"
                      type="number"
                      min="1"
                      required
                      value={shares}
                      onChange={(e) => setShares(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                {error ? (
                  <div className="text-xs text-red-500 mt-2">{error}</div>
                ) : null}
                <div
                  key="close"
                  className="flex justify-between px-4 py-3 mt-auto"
                >
                  <button
                    type="button"
                    className="flex items-center"
                    onClick={closeMenu}
                    aria-label="Close popover"
                  >
                    <ArrowLeftIcon size={16} className="text-zinc-900" />
                  </button>
                  <button
                    disabled={loading}
                    className="relative ml-1 flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border bg-transparent px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    type="submit"
                    aria-label="Add to listing"
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    {loading ? "Adding listing..." : "Add to listing"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default AddHoldingPopover;
