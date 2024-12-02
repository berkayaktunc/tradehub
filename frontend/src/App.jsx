import "./App.css";

function App() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-[10%] bg-black text-white flex items-center justify-center border-b-2 border-red-600">
        HEADER HEREE
      </header>

      {/* Sidebar */}
      <div className="h-[20%] bg-gray-800 text-white flex items-center justify-center ">
        SIDEBARR
      </div>

      <div className="flex flex-1">
        {/* Haber & Islem */}
        <main className="flex-1">
          {/* Haberler */}
          <section className="h-[70%] bg-gray-700 text-white flex items-center justify-center ">
            HABERLEERRRR
          </section>

          {/* Islemler */}
          <section className="h-[30%] bg-red-800 text-white flex items-center justify-center">
            İŞLEMLEERRRR
          </section>
        </main>

        {/* Terminal */}
        <div className="w-[30%] bg-gray-700 text-white flex items-center justify-center border-l-2 border-gray-600">
          TERMINALLL
        </div>
      </div>
    </div>
  );
}

export default App;
