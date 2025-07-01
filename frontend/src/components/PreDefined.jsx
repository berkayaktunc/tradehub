import { useTradeContext } from "../context/TradeContext";
import { useState, useEffect } from "react";

function PreDefined({ showSettings, setShowSettings }) {
  const { executeTradeCommand } = useTradeContext();
  
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [hasKeys, setHasKeys] = useState(false);
  const [activeTab, setActiveTab] = useState("data"); // "data" or "keys"
  
  const [data, setData] = useState([
    ["btc", "20", "50", "20", "50"],
    ["eth", "20", "50", "20", "50"],
    ["xrp", "20", "50", "20", "50"],
    ["xlm", "20", "50", "20", "50"],
    ["ada", "20", "50", "20", "50"],
    ["sol", "20", "50", "20", "50"],
    ["bnb", "20", "50", "20", "50"],
    ["hbar", "20", "50", "20", "50"],
  ]);

  // Function to generate the button components
  const renderButton = (currency, leverage, flag) => (
    <button
      className={`flex items-center justify-center h-3 w-full rounded-lg`}
      onClick={() => handleClick(currency, leverage, flag)}
    >
      <h3>{`${leverage}x ${flag}`}</h3>
    </button>
  );

  const handleClick = async (currency, leverage, flag) => {
    // Context üzerinden trade command'ı çalıştır
    await executeTradeCommand(currency, leverage, flag);
  };

  const handleDataChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const addRow = () => {
    if (data.length < 8) {
      setData([...data, ["new", "20", "50", "20", "50"]]);
    }
  };

  const removeRow = (index) => {
    if (data.length > 1) {
      const newData = data.filter((_, i) => i !== index);
      setData(newData);
    }
  };

  // API key'leri yükle
  useEffect(() => {
    if (showSettings) {
      fetchKeys();
    }
  }, [showSettings]);

  const fetchKeys = async () => {
    try {
      const response = await fetch("http://localhost:5000/_getKeys");
      if (response.ok) {
        const result = await response.json();
        setApiKey(result.api_key || "");
        setSecretKey(result.secret_key || "");
        setHasKeys(result.has_keys);
      }
    } catch (error) {
      console.error("API key'ler yüklenemedi:", error);
    }
  };

  const saveKeys = async () => {
    try {
      const response = await fetch("http://localhost:5000/_saveKeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          secret_key: secretKey,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert("API key'ler başarıyla kaydedildi!");
        setHasKeys(true);
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error?.join(", ") || "Bilinmeyen hata"}`);
      }
    } catch (error) {
      alert(`Hata: ${error.message}`);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/check", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        alert("✅ Bağlantı başarılı! API key'ler doğru.");
      } else {
        const errorData = await response.json();
        alert(`❌ Bağlantı hatası: ${errorData.error || "API key'leri kontrol edin"}`);
      }
    } catch (error) {
      alert(`❌ Bağlantı hatası: ${error.message}`);
    }
  };

  const btred = "bg-[#490909]";
  const btgreen = "bg-green-950";

  return (
    <>
      <div className="w-full grid grid-cols-8 gap-2 p-1">
        {data.map(([currency, long1, long2, short1, short2], index) => (
          <div
            key={index}
            className="col-span-1 bg-black border-2 border-gray-900 rounded-lg"
          >
            <h2 className="text-center font-bold">{currency.toUpperCase()}</h2>

            <div className="grid grid-cols-2 gap-1 py-1">
              <div className={`p-2 ${btgreen}`}>
                {renderButton(currency, long1, "long")}
              </div>
              <div className={`p-2 ${btred}`}>
                {renderButton(currency, short1, "short")}
              </div>
              <div className={`p-2 ${btgreen}`}>
                {renderButton(currency, long2, "long")}
              </div>
              <div className={`p-2 ${btred}`}>
                {renderButton(currency, short2, "short")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Tab Buttons */}
            <div className="flex mb-4 border-b border-gray-600">
              <button
                onClick={() => setActiveTab("data")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "data"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                PreDefined Data
              </button>
              <button
                onClick={() => setActiveTab("keys")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "keys"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Binance API Keys
              </button>
            </div>

            {/* Data Tab */}
            {activeTab === "data" && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="p-2 text-left">Currency</th>
                        <th className="p-2 text-left">Long 1</th>
                        <th className="p-2 text-left">Long 2</th>
                        <th className="p-2 text-left">Short 1</th>
                        <th className="p-2 text-left">Short 2</th>
                        <th className="p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-700">
                          {row.map((value, colIndex) => (
                            <td key={colIndex} className="p-2">
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleDataChange(rowIndex, colIndex, e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 text-sm"
                              />
                            </td>
                          ))}
                          <td className="p-2">
                            <button
                              onClick={() => removeRow(rowIndex)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                              disabled={data.length <= 1}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={addRow}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                    disabled={data.length >= 8}
                  >
                    ➕ Add Row ({data.length}/8)
                  </button>
                </div>
              </>
            )}

            {/* Keys Tab */}
            {activeTab === "keys" && (
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4">Binance API Configuration</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Binance API Key"
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Secret Key
                      </label>
                      <input
                        type="password"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="Enter your Binance Secret Key"
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={saveKeys}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                    >
                      💾 Save Keys
                    </button>
                    <button
                      onClick={checkConnection}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm"
                    >
                      🔍 Check Connection
                    </button>
                    <button
                      onClick={fetchKeys}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {hasKeys && (
                    <div className="mt-3 p-2 bg-green-900 border border-green-600 rounded text-green-300 text-sm">
                      ✅ API keys are configured
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PreDefined;
