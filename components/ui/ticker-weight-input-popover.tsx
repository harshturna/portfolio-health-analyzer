"use client";
import useClickOutside from "@/hooks/use-click-outside";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowLeftIcon, Plus } from "lucide-react";
import { useRef, useState, useEffect, useId } from "react";
import { Input } from "./input";

const TRANSITION = {
  type: "spring",
  bounce: 0.05,
  duration: 0.3,
};

export default function TickerWeightInputPopover() {
  const uniqueId = useId();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState(0);

  const openMenu = () => {
    setIsOpen(true);
  };

  const closeMenu = () => {
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
              className="absolute h-[200px] w-[364px] overflow-hidden border bg-background outline-hidden"
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
                  <Input
                    placeholder="Ticker"
                    required
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                  />
                  <Input
                    placeholder="Shares"
                    type="number"
                    min="1"
                    required
                    onChange={(e) => setShares(parseInt(e.target.value))}
                  />
                </div>
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
                    className="relative ml-1 flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border bg-transparent px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    type="submit"
                    aria-label="Add to listing"
                    onClick={() => {
                      closeMenu();
                    }}
                  >
                    Add to listing
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
