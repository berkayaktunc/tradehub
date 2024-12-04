// src/commands.js

export const systemCommands = {
  help: () => {
    return "Aaaaaaaaaaaavailable system commands: help, clear, date, whoami";
  },
  whoami: () => {
    return "user@localhost";
  },
  sett: () => {
    return "set command";
  },
};

export const customCommands = {
  check: async () => {
    try {
      const response = await fetch("/check");
      if (response.ok) {
        const data = await response.json();
        return `GET /check: ${JSON.stringify(data)}`;
      } else {
        return `Error: ${response.statusText}`;
      }
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  // You can add more custom commands here
};

// Combine both command categories if needed
export const allCommands = {
  ...systemCommands,
  ...customCommands,
};
