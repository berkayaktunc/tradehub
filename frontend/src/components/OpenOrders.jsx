import React from "react";

const sampleOrders = [
  {
    time: "2024-11-14 02:03:39",
    symbol: "SUIUSDT",
    type: "Stop Market",
    side: "Sell",
    price: "-",
    amount: "9.7030 USDT",
    filled: "0.0000 USDT",
    reduceOnly: "No",
    postOnly: "No",
    trigger: "Last Price <= 3.130000",
    tpsl: "--",
    tif: "GTC",
  },
];

const OpenOrders = ({ orders = sampleOrders }) => {
  return (
    <div className="w-full h-full bg-[#2a2d34] shadow p-4 overflow-x-auto">
      <div className="flex items-center mb-2">
        <h2 className="text-lg font-semibold text-white mr-4">Open Orders</h2>
        <span className="text-xs text-gray-400">Basic({orders.length})</span>
      </div>
      <table className="w-full text-sm text-left text-gray-300">
        <thead>
          <tr className="border-b border-gray-700 text-xs">
            <th className="p-2">Time</th>
            <th className="p-2">Symbol</th>
            <th className="p-2">Type</th>
            <th className="p-2">Side</th>
            <th className="p-2">Price</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Filled</th>
            <th className="p-2">Reduce Only</th>
            <th className="p-2">Post Only</th>
            <th className="p-2">Trigger Conditions</th>
            <th className="p-2">TP/SL</th>
            <th className="p-2">TIF</th>
            <th className="p-2 text-center">Cancel</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/40">
              <td className="p-2 whitespace-nowrap">{order.time}</td>
              <td className="p-2 whitespace-nowrap flex items-center gap-1">
                {order.symbol}
                <span className="bg-gray-700 text-xs px-2 py-0.5 ml-1">Perp</span>
              </td>
              <td className="p-2 whitespace-nowrap">{order.type}</td>
              <td className="p-2 whitespace-nowrap text-red-500 font-semibold">{order.side}</td>
              <td className="p-2 whitespace-nowrap">{order.price}</td>
              <td className="p-2 whitespace-nowrap">{order.amount}</td>
              <td className="p-2 whitespace-nowrap">{order.filled}</td>
              <td className="p-2 whitespace-nowrap">{order.reduceOnly}</td>
              <td className="p-2 whitespace-nowrap">{order.postOnly}</td>
              <td className="p-2 whitespace-nowrap">{order.trigger}</td>
              <td className="p-2 whitespace-nowrap">{order.tpsl}</td>
              <td className="p-2 whitespace-nowrap">{order.tif}</td>
              <td className="p-2 text-center">
                <button className="hover:text-red-400" title="Cancel Order">
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpenOrders; 