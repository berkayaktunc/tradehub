import React, { useState, useRef, useEffect } from "react";
import { allCommands } from "./commands";

const TerminalScreen = () => {
  const [inputValue, setInputValue] = useState("");
  const terminalRef = useRef(null);
  const effectRun = useRef(false);
  const helpCommand = "Available commands: help, clear, date, whoami";

  const [history, setHistory] = useState([
    {
      input: "Welcome to TradeHub",
      output: "Type help for available commands",
    },
  ]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    // Prevent double-calling in development
    if (effectRun.current === false) {
      const fetchData = async () => {
        try {
          const response = await fetch("/check");
          if (response.ok) {
            const data = await response.json();
            setHistory((prevHistory) => [
              ...prevHistory,
              { input: "GET /check", output: JSON.stringify(data) },
            ]);
          } else {
            setHistory((prevHistory) => [
              ...prevHistory,
              { input: "GET /check", output: `Error: ${response.statusText}` },
            ]);
          }
        } catch (error) {
          setHistory((prevHistory) => [
            ...prevHistory,
            { input: "GET /check", output: `Error: ${error.message}` },
          ]);
        }
      };

      fetchData();
    }

    // Cleanup function
    return () => {
      effectRun.current = true;
    };
  }, []);

  // Check if the submitted command filled or not
  const handleSubmit = async () => {
    if (inputValue.trim() === "") return;

    const output = await processCommand(inputValue);

    const newEntry = {
      input: inputValue,
      output: output,
    };

    setHistory((prevHistory) => [...prevHistory, newEntry]);
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
    let resp = "";
    if (command === "clear") {
      setHistory([]);
      return "";
    } else if (command === "help") {
      return helpCommand;
    } else if (command === "whoami") {
      return "user@localhost";
    }

    try {
      const [symbol, leverage] = command.split(" ");
      if (!symbol || !leverage) {
        return "Invalid command. Example: 'btc 10'";
      }

      // Backend'e POST isteği gönder
      const response = await fetch("http://localhost:5000/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol: symbol, leverage: leverage }), // JSON formatında backend'e gönder
      });

      if (response.ok) {
        const result = await response.json();
        resp = `Position opened: ${JSON.stringify(result)}`;
      } else {
        resp = `Error: ${response.statusText}`;
      }
    } catch (error) {
      resp = `Error: ${error.message}`;
    }

    return resp;
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
        {history.map((entry, index) => (
          <div key={index} className="mb-1">
            <div>
              <span className="text-green-500 text-sm">➜</span>
              <span className="ml-2 text-white text-sm">{entry.input}</span>
            </div>
            {entry.output && (
              <div className="ml-4 text-green-300 text-sm">{entry.output}</div>
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
