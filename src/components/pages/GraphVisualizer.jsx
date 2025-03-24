import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { GraphChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "../contexts/ThemeContext";
import { ZoomInIcon, ZoomOutIcon, RefreshIcon } from "../icons";
import { resetHighlight } from "../store/graphSlice";

// Register the required components
echarts.use([GraphChart, CanvasRenderer]);

const GraphVisualization = () => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const { isDarkMode } = useTheme();
  const { nodes, edges, searchAddress, highlightedNode } = useSelector(
    (state) => state.graph
  );

  const [option, setOption] = useState({});

  useEffect(() => {
    if (!nodes.length) return;

    // Reset highlight when component re-renders
    if (highlightedNode) {
      setTimeout(() => {
        dispatch(resetHighlight());
      }, 3000);
    }

    // Prepare nodes and edges for ECharts
    const graphNodes = nodes.map((node) => {
      const isMain = node.id === searchAddress;
      const isHighlighted = node.id === highlightedNode;

      let symbolSize = 40;
      if (isMain) symbolSize = 50;
      if (isHighlighted) symbolSize = 60;

      const itemStyle = {
        color: getNodeColor(node.type, node.entity),
        borderWidth: isHighlighted ? 3 : 0,
        borderColor: "#facc15",
      };

      return {
        id: node.id,
        name: formatAddress(node.id),
        value: node.amount,
        symbolSize,
        itemStyle,
        label: {
          show: true,
          position: "bottom",
          formatter: (params) => {
            return [
              `{a|${formatAddress(params.name)}}`,
              `{b|${node.entity || "Unknown"}}`,
            ].join("\n");
          },
          rich: {
            a: {
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              fontSize: 10,
              lineHeight: 16,
            },
            b: {
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              fontSize: 9,
              lineHeight: 14,
            },
          },
        },
      };
    });

    const graphEdges = edges.map((edge) => {
      return {
        source: edge.source,
        target: edge.target,
        value: edge.amount,
        label: {
          show: true,
          formatter: `${edge.amount.toFixed(4)} BTC`,
          fontSize: 10,
          color: isDarkMode ? "#9ca3af" : "#6b7280",
        },
        lineStyle: {
          width: Math.max(1, Math.min(edge.amount * 0.5, 5)),
          color: isDarkMode ? "#4b5563" : "#9ca3af",
          curveness: 0.2,
        },
      };
    });

    const newOption = {
      backgroundColor: isDarkMode ? "#111827" : "#ffffff",
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          if (params.dataType === "node") {
            const node = nodes.find((n) => n.id === params.data.id);
            return `
              <div class="font-medium">${node.entity || "Unknown"}</div>
              <div class="text-xs">${node.id}</div>
              <div class="mt-1">Amount: ${node.amount.toFixed(8)} BTC</div>
            `;
          } else if (params.dataType === "edge") {
            return `Transaction: ${params.data.value.toFixed(8)} BTC`;
          }
        },
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: "quinticInOut",
      series: [
        {
          type: "graph",
          layout: "force",
          data: graphNodes,
          edges: graphEdges,
          roam: true,
          draggable: true,
          label: {
            show: true,
          },
          force: {
            repulsion: 500,
            gravity: 0.1,
            edgeLength: 200,
            friction: 0.6,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: 4,
            },
          },
        },
      ],
    };

    setOption(newOption);
  }, [nodes, edges, isDarkMode, highlightedNode, searchAddress, dispatch]);

  const getNodeColor = (type, entity) => {
    if (type === "main") return "#818cf8"; // Main node (purple)
    if (type === "inflow") return "#f97316"; // Inflow node (orange)
    if (type === "outflow") return "#10b981"; // Outflow node (green)
    if (entity === "Changenow") return "#f59e0b"; // Changenow (amber)
    if (entity === "Whitebit") return "#3b82f6"; // Whitebit (blue)
    return "#9ca3af"; // Unknown (gray)
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const handleZoomIn = () => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      chartInstance.dispatchAction({
        type: "dataZoom",
        start: 20,
        end: 80,
      });
    }
  };

  const handleZoomOut = () => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      chartInstance.dispatchAction({
        type: "dataZoom",
        start: 0,
        end: 100,
      });
    }
  };

  const handleReset = () => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      chartInstance.dispatchAction({
        type: "restore",
      });
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: "100%", width: "100%" }}
        className="echarts-for-react"
        opts={{ renderer: "svg" }}
      />

      <div className="zoom-controls">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
        >
          <ZoomInIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
        >
          <ZoomOutIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
        >
          <RefreshIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GraphVisualization;
