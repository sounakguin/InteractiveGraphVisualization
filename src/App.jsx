import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./components/store";
import GraphVisualization from "./components/pages/GraphVisualizer";
import Sidebar from "./components/pages/Sidebar";
import Header from "./components/pages/Header";
import { ThemeProvider } from "./components/contexts/ThemeContext";
import { MenuIcon } from "./components/icons/index";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        isSidebarOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".hamburger-menu")
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <div className="flex flex-col h-screen w-full">
          <Header />
          <div className="flex flex-1 overflow-hidden relative">
            {/* Hamburger menu for mobile - only shown when sidebar is closed */}
            {isMobile && !isSidebarOpen && (
              <button
                className="hamburger-menu absolute top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
                onClick={() => setIsSidebarOpen(true)}
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            )}

            {/* Sidebar - hidden by default on mobile */}
            <div
              className={`sidebar ${
                isMobile
                  ? "absolute left-0 top-0 h-full z-40 transform transition-transform duration-300 ease-in-out"
                  : ""
              } ${
                isMobile && !isSidebarOpen
                  ? "-translate-x-full"
                  : "translate-x-0"
              }`}
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isMobile && isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Main content */}
            <div className={`flex-1 ${isMobile ? "w-full" : ""}`}>
              <GraphVisualization />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
