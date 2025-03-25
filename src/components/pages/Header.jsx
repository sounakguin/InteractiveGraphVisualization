import { useTheme } from "../contexts/ThemeContext";
import { useSelector } from "react-redux";
import { MoonIcon, SunIcon, SaveIcon } from "../icons";

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const searchAddress = useSelector((state) => state.graph.searchAddress);

  const exportAsSVG = () => {
    const svgElement = document.querySelector(".echarts-for-react svg");
    if (!svgElement) return;

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true);

    // Set width and height attributes
    const bbox = svgElement.getBBox();
    svgClone.setAttribute("width", bbox.width);
    svgClone.setAttribute("height", bbox.height);
    svgClone.setAttribute(
      "viewBox",
      `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
    );

    // Convert SVG to string
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `wallet-graph-${searchAddress.substring(0, 8)}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <header className="flex justify-between items-center p-4 border-b dark:border-gray-700 dark:bg-gray-900 bg-white">
      <div className="flex items-center">
        <h1 className="text-xl font-bold dark:text-white truncate">
          <span className="hidden sm:inline">
            Wallet Transaction Visualizer
          </span>
          <span className="sm:hidden">Wallet Visualizer</span>
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-700" />
          )}
        </button>
        <button
          onClick={exportAsSVG}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
        >
          <SaveIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Save as SVG</span>
          <span className="sm:hidden">Save</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
