import React, { createContext, useContext, useState } from 'react';

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
  };

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
}; 