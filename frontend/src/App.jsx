import TradeHubLogo from "./assets/TradeHubLogo";
import PreDefined from "./components/PreDefined";
import TerminalScreen from "./components/terminal/TerminalScreen";
import { TradeProvider } from "./context/TradeContext";
import { useState } from "react";
import OpenOrders from "./components/OpenOrders";
import ConnectWallet from "./components/ConnectWallet";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [wallet, setWallet] = useState("");

  return (
    <TradeProvider>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="h-[7%] bg-black text-white flex items-center justify-center border-b-2 border-red-600 relative">
          <TradeHubLogo />
          <div className="absolute right-24 flex items-center">
            <ConnectWallet onConnected={(address) => setWallet(address)} />
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="absolute right-4 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
          >
            <span className="text-3xl text-red-500 hover:text-red-400">⚙️</span>
          </button>
        </header>

        {/* Sidebar */}
        <div className="h-[10%] bg-gray-800 text-white flex items-center justify-center ">
          <PreDefined showSettings={showSettings} setShowSettings={setShowSettings} />
        </div>

        <div className="flex flex-1">
          {/* Haber & Islem */}
          <main className="flex-1">
            {/* Haberler */}
            <section className="h-[70%] bg-gray-700 text-white flex items-center justify-center ">
              HABERLEERRRR
            </section>

            {/* Islemler */}
            <section className="h-[30%] bg-red-800 text-white flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <OpenOrders />
              </div>
            </section>
          </main>

          {/* Terminal */}
          <div className="h-full w-[30%] bg-gray-700 text-white flex items-center justify-center border-l-2 border-gray-600">
            <TerminalScreen />
          </div>
        </div>
      </div>
    </TradeProvider>
  );
}

export default App;
