import { Provider } from "react-redux";
import { store } from "./components/store/index";
import GraphVisualization from "./components/pages/GraphVisualizer";
import Sidebar from "./components/pages/Sidebar";
import Header from "./components/pages/Header";
import { ThemeProvider } from "./components/contexts/ThemeContext";

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <div className="flex flex-col h-screen w-full">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <GraphVisualization />
          </div>
        </div>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
