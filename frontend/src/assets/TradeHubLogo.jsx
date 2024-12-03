import React from "react";

const TradeHubLogo = () => {
  return (
    <div className="flex items-center justify-center p-3 w-64 h-20 rounded-lg">
      {/* "Trade" Text */}
      <div className="text-white text-3xl font-bold mr-2">Trade</div>

      {/* "Hub" Background (Turuncu Kare) */}
      <div className="bg-orange-500 text-white text-3xl font-bold flex items-center justify-center w-20 h-10 rounded-md">
        Hub
      </div>
    </div>
  );
};

export default TradeHubLogo;
