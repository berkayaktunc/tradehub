import React from "react";
import { useTradeContext } from "../context/TradeContext";

function shortenAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

const ConnectWallet = () => {
  const { 
    walletAddress, 
    isConnected, 
    subscriptionDays, 
    connectWallet, 
    disconnectWallet 
  } = useTradeContext();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          className="px-4 py-2 min-w-[160px] bg-orange-500 hover:bg-orange-700 rounded-md text-white text-sm font-mono flex items-center justify-center transition-all relative"
          style={{ cursor: isConnected ? "default" : "pointer" }}
          onClick={!isConnected ? connectWallet : undefined}
        >
          {isConnected ? (
            <>
              {shortenAddress(walletAddress)}
              <button
                onClick={disconnectWallet}
                className="ml-2 text-white hover:text-red-400 text-lg cursor-pointer select-none bg-transparent border-none p-0"
                title="Bağlantıyı Kes"
                tabIndex={0}
                style={{ lineHeight: 1 }}
              >
                ×
              </button>
            </>
          ) : (
            "Cüzdanı Bağla"
          )}
        </button>
      </div>
      <div className="text-xs text-gray-300">
        {isConnected && subscriptionDays !== null
          ? `Abonelik: ${subscriptionDays} gün kaldı`
          : isConnected ? "Bağlandı" : "Bağlanmadı"}
      </div>
    </div>
  );
};

export default ConnectWallet; 