import React, { useState, useRef, useEffect } from "react";
import { allCommands } from "./commands";
import { useTradeContext } from "../../context/TradeContext";

const TerminalScreen = () => {
  const [inputValue, setInputValue] = useState("");
  const terminalRef = useRef(null);
  const effectRun = useRef(false);
  const { terminalHistory, addToTerminalHistory, clearTerminalHistory } = useTradeContext();
  
  const helpCommand = [
    "info",
    "test",
    "setleverage <int>: sets leverage value",
    "setmargin ISOLATED or CROSS",
    "setstoploss <float>: sets stop loss percent (0.02)",
    "setusdt <int>: sets usdt value to use in position",
    "<coin> <leverage> (create long position)",
    "deletekeys: clears binance keys to set again",
  ];

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  useEffect(() => {
    // Prevent double-calling in development
    if (effectRun.current === false) {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:5050/check", {
            method: "POST",
          });

          if (response.ok) {
            addToTerminalHistory("GET /check", "Binance bağlantı başarılı");
          } else {
            addToTerminalHistory("GET /check", "Error: keyleri kontrol et");
          }
        } catch (error) {
          addToTerminalHistory("GET /check", "Error: server hatası");
        }
      };

      fetchData();
    }

    // Cleanup function
    return () => {
      effectRun.current = true;
    };
  }, [addToTerminalHistory]);

  // Check if the submitted command filled or not
  const handleSubmit = async () => {
    if (inputValue.trim() === "") return;

    const output = await processCommand(inputValue);

    addToTerminalHistory(inputValue, output);
    setInputValue("");
  };

  /**
   * Process the given command.
   *
   * @param {string} command - The command given by the user.
   * @returns {string} The output of the command.
   *
   * Supported commands:
   * - clear: Clear the terminal history.
   * - help: Show the help message.
   * - whoami: Show the current user.
   */
  const processCommand = async (command) => {
    // Komutları yönetebileceğimiz bir nesne yapısı
    const commandHandlers = {
      clear: () => {
        clearTerminalHistory();
        return "";
      },
      help: () => {
        return helpCommand;
      },
      whoami: () => {
        return "user@localhost";
      },
      test: () => {
        const items = ["TESTED1", "TESTED2", "TESTED3", "TESTED4", "TESTED5"];
        return items;
      },
      info: async () => {
        return await handleServerCall("http://localhost:5050/info", "GET");
      },
      setleverage: (args) => {
        const leverage = args[0];

                  return handleServerCall("http://localhost:5050/_setLeverage", "POST", {
          leverage: leverage,
        });
      },
      setmargin: (args) => {
        const margin = args[0];

                  return handleServerCall("http://localhost:5050/_setMargin", "POST", {
          margin: margin,
        });
      },
      setstoploss: (args) => {
        const stoploss = args[0];

                  return handleServerCall("http://localhost:5050/_setStoploss", "POST", {
          stoploss: stoploss,
        });
      },
      deletekeys: () => {
                  return handleServerCall("http://localhost:5050/_deleteKeys", "POST");
      },
    };

    // Komutları kontrol et
    const commandParts = command.split(" ");
    const mainCommand = commandParts[0];
    const args = commandParts.slice(1); // Komutun geri kalan kısmı (args)

    // Komutlar nesnesinde ilgili komut var mı diye kontrol et
    if (commandHandlers[mainCommand]) {
      // Eğer varsa, ilgili handler'ı çalıştır
      return await commandHandlers[mainCommand](args);
    }

    // Genel komut işlemesi (örneğin, "btc 10" gibi)
    // Bu kısımda kullanıcı "btc 10" veya "xlm 15" gibi komutlar girerse, bunları burada işleyebilirsiniz
    const [symbol, leverage] = command.split(" ");
    let resp = "";
    if (symbol && leverage) {
      // Burada belirli bir işlem gerçekleştirebilirsiniz
              const response = await fetch("http://localhost:5050/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol: symbol, leverage: leverage }), // JSON formatında backend'e gönder
      });

      if (response.ok) {
        const result = await response.json();
        resp = result.message; // ${JSON.stringify(result)}`;
      } else {
        resp = response.error;
      }

      return resp;
    }

    return `Invalid command: ${command}`;
  };

  const handleServerCall = async (link, method, msg) => {
    try {
      const response = await fetch(link, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msg), // JSON formatında backend'e gönder
      });

      const data = await response.json();

      if (response.ok) {
        return data.message;
      } else {
        return data.error;
      }
    } catch (error) {
      return "Error: server hatası";
    }
  };

  /**
   * Handles the 'keydown' event on an input element.
   *
   * @param {Object} e - The event object containing information about the keypress.
   * @param {string} e.key - The key that was pressed.
   *
   * If the 'Enter' key is pressed, it triggers the handleSubmit function.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="w-full h-full bg-black text-green-400 font-mono p-4 rounded-lg shadow-2xl text-sm">
      {/* "Terminal"s name and logo */}
      <div className="flex items-center mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          text-xs
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 text-green-500"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <h2 className="text-sm font-bold">Terminal</h2>
      </div>

      {/* History part */}
      <div
        ref={terminalRef}
        className="history-section h-[75vh] overflow-y-auto bg-[#1a1a1a] p-2 rounded-lg mb-2 text-xs"
      >
        {terminalHistory.map((entry, index) => (
          <div key={index} className="mb-1">
            <div>
              <span className="text-green-500 text-sm">➜</span>
              <span className="ml-2 text-white text-sm">{entry.input}</span>
            </div>
            {entry.output && (
              <div className="ml-4 text-green-300 text-sm">
                {/* Eğer output bir dizi ise, her elemanı alt alta listele */}
                {Array.isArray(entry.output) ? (
                  <ul className="list-disc pl-5">
                    {entry.output.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-green-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>{entry.output}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enter command part */}
      <div className="flex items-center text-sm">
        <span className="text-green-500 mr-2 text-sm">➜</span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-b border-green-500 text-green-400 focus:outline-none text-sm"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
};

export default TerminalScreen;
