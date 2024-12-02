import "./App.css";

function App() {
  return (
    <>
      <div className="h-screen w-full flex flex-col bg-[#181A20]">
        {/* Header */}
        <div className="h-1/6 w-full bg-black flex justify-around items-center border-2 border-red-500">
          <h2>HEADER HEREE</h2>
        </div>

        <div className="w-full h-1/5 bg-[#1E1E24] flex justify-around items-center">
          <h2>SİDEBARR</h2>
        </div>

        <div className="h-4/5 flex flex-grow w-full">
          {/* işlemler + Haberler */}
          <div className="w-4/5 flex flex-col">
            <div className="flex-grow h-3/5 flex items-center justify-center bg-[#2D2F36]">
              <h2 className="text-white text-3xl">HABERLEERRRR</h2>
            </div>
            <div className="flex-grow h-1/5 flex items-center justify-center bg-red-300">
              <h2 className="text-white text-3xl">İŞLEMLEERRR</h2>
            </div>
          </div>

          {/* Terminal */}
          <div className="w-2/5 flex items-center justify-center bg-[#2D2F36] border-l-2 border-gray-500">
            <h2 className="text-white text-3xl">TERMINALLL</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
