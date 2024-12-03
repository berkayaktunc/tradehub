function PreDefined() {
  const data = [
    ["btc", "20", "50", "20", "50"],
    ["eth", "20", "50", "20", "50"],
    ["xrp", "20", "50", "20", "50"],
    ["xlm", "20", "50", "20", "50"],
    ["ada", "20", "50", "20", "50"],
    ["sol", "20", "50", "20", "50"],
    ["bnb", "20", "50", "20", "50"],
    ["hbar", "20", "50", "20", "50"],
  ];

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
    if (flag === "short") {
      // TODO: json ve istek atma birarada örnek olarak bırakıldı. backenden göre düzenle.
      const response = await fetch(
        `http://localhost:5000/short?coin=${currency}&leverage=${leverage}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symbol: symbol, leverage: leverage }), // JSON formatında backend'e gönder
        }
      );
      responseHandler(response);
    } else {
      const response = await fetch(
        `http://localhost:5000/long?coin=${currency}&leverage=${leverage}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symbol: symbol, leverage: leverage }), // JSON formatında backend'e gönder
        }
      );
      responseHandler(response);
    }
  };

  const responseHandler = (req) => {
    if (req.ok) {
      console.log("Success");
    } else {
      console.log("Error");
    }
  };

  const btred = "bg-[#490909]";
  const btgreen = "bg-green-950";
  return (
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
  );
}

export default PreDefined;
