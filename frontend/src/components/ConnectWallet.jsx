import React, { useState, useEffect } from "react";

function shortenAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

const BACKEND_URL = "http://localhost:5050";

const ConnectWallet = ({ onConnected }) => {
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [daysLeft, setDaysLeft] = useState(null);

  // Sayfa yüklendiğinde otomatik cüzdan kontrolü ve abonelik sorgulama
  useEffect(() => {
    async function checkConnection() {
      if (window.ethereum) {
        if (localStorage.getItem('walletDisconnected') === '1') return;
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("Bağlandı: " + accounts[0]);
          if (onConnected) onConnected(accounts[0]);
          // Abonelik sorgula
          try {
            const res = await fetch(`${BACKEND_URL}/api/subscription_status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ wallet_address: accounts[0] }),
            });
            const data = await res.json();
            if (data.active && data.subscription_end) {
              const end = new Date(data.subscription_end);
              const now = new Date();
              const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
              setDaysLeft(diff);
            } else {
              setDaysLeft(0);
            }
          } catch (e) {
            setDaysLeft(null);
          }
        }
      }
    }
    checkConnection();
  }, [onConnected]);

  const connectWallet = async () => {
    localStorage.removeItem('walletDisconnected');
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const walletAddress = accounts[0];
        setWallet(walletAddress);
        setStatus("Bağlandı: " + walletAddress);

        // Backend'e gönder
        const res = await fetch(`${BACKEND_URL}/api/connect_wallet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet_address: walletAddress }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("Kayıt başarılı! Kullanıcı ID: " + data.user_id);
          if (onConnected) onConnected(walletAddress, data.user_id);
        } else {
          setStatus("Hata: " + (data.error || "Bilinmeyen hata"));
        }
        // Abonelik sorgula
        try {
          const res2 = await fetch(`${BACKEND_URL}/api/subscription_status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet_address: walletAddress }),
          });
          const data2 = await res2.json();
          if (data2.active && data2.subscription_end) {
            const end = new Date(data2.subscription_end);
            const now = new Date();
            const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            setDaysLeft(diff);
          } else {
            setDaysLeft(0);
          }
        } catch (e) {
          setDaysLeft(null);
        }
      } catch (err) {
        setStatus("Bağlantı hatası: " + err.message);
      }
    } else {
      setStatus("MetaMask yüklü değil!");
    }
  };

  const disconnectWallet = (e) => {
    e.stopPropagation();
    setWallet("");
    setStatus("Bağlantı kesildi.");
    setDaysLeft(null);
    localStorage.setItem('walletDisconnected', '1');
    if (onConnected) onConnected("");
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          className="px-4 py-2 min-w-[160px] bg-yellow-600 hover:bg-yellow-700 rounded-md text-white text-sm font-mono flex items-center justify-center transition-all relative"
          style={{ cursor: wallet ? "default" : "pointer" }}
          onClick={!wallet ? connectWallet : undefined}
        >
          {wallet ? (
            <>
              {shortenAddress(wallet)}
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
        {wallet && daysLeft !== null
          ? `Abonelik: ${daysLeft} gün kaldı`
          : status}
      </div>
    </div>
  );
};

export default ConnectWallet; 