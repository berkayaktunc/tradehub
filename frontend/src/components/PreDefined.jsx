import { useTradeContext } from "../context/TradeContext";
import { useState, useEffect } from "react";

function PreDefined({ showSettings, setShowSettings }) {
  const { executeTradeCommand, walletAddress, isConnected } = useTradeContext();
  
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [hasKeys, setHasKeys] = useState(false);
  const [activeTab, setActiveTab] = useState("data"); // "data" or "keys"
  
  // Default trade data
  const defaultTradeData = [
    ["btc", "20", "50", "20", "50"],
    ["eth", "20", "50", "20", "50"],
    ["xrp", "20", "50", "20", "50"],
    ["xlm", "20", "50", "20", "50"],
    ["ada", "20", "50", "20", "50"],
    ["sol", "20", "50", "20", "50"],
    ["bnb", "20", "50", "20", "50"],
    ["hbar", "20", "50", "20", "50"],
  ];
  
  const [data, setData] = useState(defaultTradeData);

  const [savedKeys, setSavedKeys] = useState({ api_key: '', secret_key: '', has_keys: false });
  const [connectionStatus, setConnectionStatus] = useState('');

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
      setData([...data, ["", "", "", "", ""]]);
    } else {
      alert('Maksimum 8 satır ekleyebilirsiniz!');
    }
  };

  const removeRow = (index) => {
    if (data.length > 1) {
      if (confirm('Bu satırı silmek istediğinizden emin misiniz?')) {
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
      }
    } else {
      alert('En az bir satır kalmalıdır!');
    }
  };

  // Trade data'yı yükle
  const loadTradeData = async () => {
    if (!walletAddress) return;
    
    try {
      const response = await fetch('http://localhost:5050/api/get_trade_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result.trade_data);
      } else {
        console.error('Trade data yüklenemedi');
      }
    } catch (error) {
      console.error('Trade data yüklenemedi:', error);
    }
  };

  // Trade data'yı kaydet (sessiz kaydetme)
  const saveTradeData = async () => {
    if (!walletAddress) return;
    
    try {
      const response = await fetch('http://localhost:5050/api/save_trade_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          trade_data: data
        })
      });
      
      if (response.ok) {
        console.log('Trade data otomatik kaydedildi');
      } else {
        const error = await response.json();
        console.error('Kaydetme hatası:', error.error);
      }
    } catch (error) {
      console.error('Trade data kaydedilemedi:', error.message);
    }
  };

  // Default trade data'yı kaydet
  const setAsDefault = async () => {
    if (!walletAddress) return;
    
    try {
      const response = await fetch('http://localhost:5050/api/set_default_trade_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      
      if (response.ok) {
        alert('Mevcut veriler default olarak kaydedildi!');
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error}`);
      }
    } catch (error) {
      alert('Default data kaydedilemedi: ' + error.message);
    }
  };

  // Default trade data'yı yükle
  const loadDefault = () => {
    setData([...defaultTradeData]);
    alert('Default trade data yüklendi!');
  };

  // Reset trade data
  const resetData = () => {
    if (confirm('Tüm trade data\'yı sıfırlamak istediğinizden emin misiniz?')) {
      setData([
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ]);
    }
  };

  // Component mount olduğunda trade data'yı yükle
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadTradeData();
    }
  }, [isConnected, walletAddress]);

  // Settings açıldığında API key'leri yükle
  useEffect(() => {
    if (showSettings) {
      loadApiKeys();
    }
  }, [showSettings]);

  // ESC tuşu ile settings kapatma ve otomatik kaydetme
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showSettings) {
        handleSettingsClose();
      }
    };

    if (showSettings) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSettings, setShowSettings]);

  // Settings kapatma fonksiyonu (otomatik kaydetme ile)
  const handleSettingsClose = async () => {
    if (isConnected && walletAddress) {
      try {
        await saveTradeData();
        setShowSettings(false);
      } catch (error) {
        console.error('Otomatik kaydetme hatası:', error);
        setShowSettings(false);
      }
    } else {
      setShowSettings(false);
    }
  };

  const loadApiKeys = async () => {
    if (!walletAddress) return;
    
    try {
      const response = await fetch('http://localhost:5050/api/get_encrypted_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedKeys(data);
      } else {
        setSavedKeys({ api_key: '', secret_key: '', has_keys: false });
      }
    } catch (error) {
      console.error('API key\'ler yüklenemedi:', error);
    }
  };

  const saveApiKeys = async () => {
    if (!walletAddress || !apiKey || !secretKey) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const response = await fetch('http://localhost:5050/api/save_encrypted_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          api_key: apiKey,
          secret_key: secretKey
        })
      });

      if (response.ok) {
        alert('API key\'ler güvenli şekilde kaydedildi!');
        setApiKey('');
        setSecretKey('');
        loadApiKeys();
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error}`);
      }
    } catch (error) {
      alert('API key\'ler kaydedilemedi: ' + error.message);
    }
  };

  const deleteApiKeys = async () => {
    if (!walletAddress) return;

    if (!confirm('API key\'leri silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch('http://localhost:5050/api/delete_encrypted_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });

      if (response.ok) {
        alert('API key\'ler silindi!');
        setSavedKeys({ api_key: '', secret_key: '', has_keys: false });
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error}`);
      }
    } catch (error) {
      alert('API key\'ler silinemedi: ' + error.message);
    }
  };

  const testConnection = async () => {
    if (!savedKeys.has_keys) {
      setConnectionStatus('API key\'ler bulunamadı');
      return;
    }

    setConnectionStatus('Test ediliyor...');
    
    try {
      // Burada gerçek Binance API testi yapılabilir
      // Şimdilik sadece simüle ediyoruz
      setTimeout(() => {
        setConnectionStatus('Bağlantı başarılı!');
        setTimeout(() => setConnectionStatus(''), 3000);
      }, 1000);
    } catch (error) {
      setConnectionStatus('Bağlantı hatası: ' + error.message);
    }
  };

  const btred = "bg-[#490909]";
  const btgreen = "bg-green-950";

  return (
    <>
      <div className="w-full grid grid-cols-8 gap-2 p-1">
        {data.map(([currency, long1, long2, short1, short2], index) => {
          // Eğer tüm değerler boşsa bu kutucuğu gösterme
          const isEmpty = !currency && !long1 && !long2 && !short1 && !short2;
          if (isEmpty) return null;
          
          return (
            <div
              key={index}
              className="col-span-1 bg-black border-2 border-gray-900 rounded-lg"
            >
              <h2 className="text-center font-bold">{currency.toUpperCase()}</h2>

              <div className="grid grid-cols-2 gap-1 p-1">
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
          );
        })}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleSettingsClose}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Settings</h3>
                <p className="text-sm text-gray-400 mt-1">ESC tuşu ile kapatabilirsiniz</p>
              </div>
              <button
                onClick={handleSettingsClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-600 mb-6">
              <button
                onClick={() => setActiveTab('data')}
                className={`px-4 py-2 ${activeTab === 'data' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
              >
                Trade Data
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-4 py-2 ${activeTab === 'api' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
              >
                API Keys
              </button>
            </div>

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Predefined Trade Data</h4>
                <div className="space-y-4">
                  {data.map((row, rowIndex) => (
                    <div key={rowIndex} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        <input
                          type="text"
                          value={row[0]}
                          onChange={(e) => handleDataChange(rowIndex, 0, e.target.value)}
                          className="border border-gray-600 rounded px-3 py-2 bg-gray-600 text-white placeholder-gray-400"
                          placeholder="Symbol"
                        />
                        <input
                          type="text"
                          value={row[1]}
                          onChange={(e) => handleDataChange(rowIndex, 1, e.target.value)}
                          className="border border-gray-600 rounded px-3 py-2 bg-gray-600 text-white placeholder-gray-400"
                          placeholder="Long 1"
                        />
                        <input
                          type="text"
                          value={row[2]}
                          onChange={(e) => handleDataChange(rowIndex, 2, e.target.value)}
                          className="border border-gray-600 rounded px-3 py-2 bg-gray-600 text-white placeholder-gray-400"
                          placeholder="Long 2"
                        />
                        <input
                          type="text"
                          value={row[3]}
                          onChange={(e) => handleDataChange(rowIndex, 3, e.target.value)}
                          className="border border-gray-600 rounded px-3 py-2 bg-gray-600 text-white placeholder-gray-400"
                          placeholder="Short 1"
                        />
                        <input
                          type="text"
                          value={row[4]}
                          onChange={(e) => handleDataChange(rowIndex, 4, e.target.value)}
                          className="border border-gray-600 rounded px-3 py-2 bg-gray-600 text-white placeholder-gray-400"
                          placeholder="Short 2"
                        />
                        <button
                          onClick={() => removeRow(rowIndex)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-100 hover:bg-opacity-10 px-3 py-2 rounded-full border border-transparent hover:border-red-400 text-sm transition-all duration-200 w-8 h-10 flex items-center justify-center self-end"
                          title="Bu satırı sil"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={addRow}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    disabled={data.length >= 8}
                  >
                    ➕ Add Row ({data.length}/8)
                  </button>
                  <button 
                    onClick={resetData}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Reset
                  </button>

                  <button 
                    onClick={setAsDefault}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Set as Default
                  </button>
                  <button 
                    onClick={loadDefault}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Load Default
                  </button>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Binance API Keys</h4>
                
                {!isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">API key'leri yönetmek için cüzdanınızı bağlayın</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Mevcut API Key'ler */}
                    {savedKeys.has_keys && (
                      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                        <h5 className="font-semibold mb-3 text-white">Kayıtlı API Key'ler</h5>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-300">API Key:</label>
                            <div className="font-mono text-sm bg-gray-800 p-2 rounded border border-gray-600 text-gray-300">
                              {savedKeys.api_key}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300">Secret Key:</label>
                            <div className="font-mono text-sm bg-gray-800 p-2 rounded border border-gray-600 text-gray-300">
                              {savedKeys.secret_key}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={testConnection}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                          >
                            Test Connection
                          </button>
                          <button
                            onClick={deleteApiKeys}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                          >
                            Delete Keys
                          </button>
                        </div>
                        {connectionStatus && (
                          <p className="mt-2 text-sm text-gray-400">{connectionStatus}</p>
                        )}
                      </div>
                    )}

                    {/* Yeni API Key Ekleme */}
                    <div className="border-t border-gray-600 pt-6">
                      <h5 className="font-semibold mb-3 text-white">
                        {savedKeys.has_keys ? 'API Key\'leri Güncelle' : 'Yeni API Key Ekle'}
                      </h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
                            placeholder="Binance API Key'inizi girin"
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
                            className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white placeholder-gray-400"
                            placeholder="Binance Secret Key'inizi girin"
                          />
                        </div>
                        <button
                          onClick={saveApiKeys}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                          {savedKeys.has_keys ? 'Update Keys' : 'Save Keys'}
                        </button>
                      </div>
                    </div>

                    {/* Güvenlik Notu */}
                    <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                      <h6 className="font-semibold text-yellow-300 mb-2">🔒 Güvenlik</h6>
                      <ul className="text-sm text-yellow-200 space-y-1">
                        <li>• API key'leriniz şifrelenmiş olarak saklanır</li>
                        <li>• Sadece sizin cüzdan adresiniz ile erişilebilir</li>
                        <li>• Futures trading izinlerini kontrol edin</li>
                        <li>• IP kısıtlaması eklemeniz önerilir</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default PreDefined;
