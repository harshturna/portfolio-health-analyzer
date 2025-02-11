import React from "react";
import TickerWeightInputPopover from "./ui/ticker-weight-input-popover";

const TickerWeightInput = () => {
  return (
    <div>
      <h2 className="my-6 text-xl md:text-2xl text-center font-medium">
        Add your portfolio listings
      </h2>
      <TickerWeightInputPopover />
    </div>
  );
};

export default TickerWeightInput;
