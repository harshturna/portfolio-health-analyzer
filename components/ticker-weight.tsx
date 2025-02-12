import ListingCard from "./listing-card";
import TickerWeightInput from "./ticker-weight-input";

const TickerWeight = () => {
  return (
    <div>
      <h2 className="mt-12 mb-6 text-xl md:text-2xl text-center font-medium">
        Add your portfolio listings
      </h2>
      <ListingCard />
      <TickerWeightInput />
    </div>
  );
};

export default TickerWeight;
