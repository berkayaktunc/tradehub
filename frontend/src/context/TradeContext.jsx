import React, { createContext, useContext, useState, useEffect } from 'react';

const TradeContext = createContext();

export const useTradeContext = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTradeContext must be used within a TradeProvider');
  }
  return context;
};

export const TradeProvider = ({ children }) => {
  const [terminalHistory, setTerminalHistory] = useState([
    {
      input: "Welcome to TradeHub",
      output: ["Type help for available commands"],
    },
  ]);

  // Wallet state'leri
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptionDays, setSubscriptionDays] = useState(0);

  // Wallet bağlantısı
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        
        // Backend'e wallet adresini gönder
        await fetch('http://localhost:5050/api/connect_wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: address })
        });

        // Subscription bilgilerini al
        const subResponse = await fetch('http://localhost:5050/api/subscription_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: address })
        });

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscriptionDays(subData.days_left || 0);
        }

        localStorage.setItem('walletConnected', 'true');
      } catch (error) {
        console.error('Wallet bağlantı hatası:', error);
      }
    } else {
      alert('MetaMask yüklü değil!');
    }
  };

  // Wallet bağlantısını kes
  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
    setSubscriptionDays(0);
    localStorage.removeItem('walletConnected');
  };

  // Sayfa yüklendiğinde wallet durumunu kontrol et
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected && typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            // Subscription bilgilerini al
            fetch('http://localhost:5050/api/subscription_status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet_address: accounts[0] })
            })
            .then(response => response.json())
            .then(data => setSubscriptionDays(data.days_left || 0));
          }
        });
    }
  }, []);

  const addToTerminalHistory = (input, output) => {
    setTerminalHistory(prev => [...prev, { input, output }]);
  };

  const clearTerminalHistory = () => {
    setTerminalHistory([]);
  };

  const executeTradeCommand = async (currency, leverage, flag) => {
    const leverageValue = flag === "short" ? -parseInt(leverage) : parseInt(leverage);
    const command = `${currency} ${leverageValue}`;
    const input = `${currency} ${leverageValue}`;
    
    try {
      const response = await fetch("http://localhost:5000/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          symbol: currency, 
          leverage: leverageValue 
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        const positionType = flag === "short" ? "Short" : "Long";
        addToTerminalHistory(input, `${positionType} position opened: ${currency.toUpperCase()} ${Math.abs(leverageValue)}x - ${result.message || 'Success'}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        addToTerminalHistory(input, `Error: Failed to open ${flag} position - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      addToTerminalHistory(input, `Error: ${error.message}`);
    }
  };

  const value = {
    terminalHistory,
    addToTerminalHistory,
    clearTerminalHistory,
    executeTradeCommand,
    walletAddress,
    isConnected,
    subscriptionDays,
    connectWallet,
    disconnectWallet,
  };

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
}; 