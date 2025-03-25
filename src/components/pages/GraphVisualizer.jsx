import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { GraphChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "../contexts/ThemeContext";
import { ZoomInIcon, ZoomOutIcon, RefreshIcon } from "../icons";
import { resetHighlight, highlightNode } from "../store/graphSlice";

// Register the required components
echarts.use([GraphChart, CanvasRenderer]);

const GraphVisualization = () => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const { isDarkMode } = useTheme();
  const { nodes, edges, searchAddress, highlightedNode } = useSelector(
    (state) => state.graph
  );

  // Reset highlight after a delay
  useEffect(() => {
    if (highlightedNode) {
      const timer = setTimeout(() => {
        dispatch(resetHighlight());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedNode, dispatch]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prepare the ECharts option
  const getOption = () => {
    if (!nodes.length) return {};

    // Check if we're on a small screen
    const isSmallScreen = window.innerWidth < 768;

    // Separate nodes into categories: main, inflow, outflow
    const mainNode = nodes.find((node) => node.id === searchAddress);
    const inflowNodes = nodes.filter(
      (node) =>
        node.id !== searchAddress &&
        edges.some(
          (edge) => edge.target === searchAddress && edge.source === node.id
        )
    );
    const outflowNodes = nodes.filter(
      (node) =>
        node.id !== searchAddress &&
        edges.some(
          (edge) => edge.source === searchAddress && edge.target === node.id
        )
    );

    // Prepare nodes for ECharts
    const graphNodes = [];

    // Calculate center position based on screen size
    const centerX = isSmallScreen ? window.innerWidth / 2 : 500;
    const centerY = isSmallScreen ? window.innerHeight / 3 : 300;

    // Calculate spacing based on screen size
    const horizontalSpacing = isSmallScreen ? 120 : 200;
    const verticalSpacing = isSmallScreen ? 60 : 100;

    // Add main node
    if (mainNode) {
      graphNodes.push({
        id: mainNode.id,
        name: formatAddress(mainNode.id),
        value: mainNode.amount,
        category: 0, // Main node category
        symbolSize:
          highlightedNode === mainNode.id ? 60 : isSmallScreen ? 40 : 50,
        x: centerX, // Center position
        y: centerY,
        fixed: true, // Fix position
        label: {
          show: true,
          position: "bottom",
          formatter: [
            `{a|${formatAddress(mainNode.id)}}`,
            `{b|${mainNode.entity || "Unknown"}}`,
          ].join("\n"),
          rich: {
            a: {
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              fontSize: isSmallScreen ? 8 : 10,
              lineHeight: 16,
            },
            b: {
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              fontSize: isSmallScreen ? 7 : 9,
              lineHeight: 14,
            },
          },
        },
        itemStyle: {
          color: "#818cf8", // Purple for main node
          borderWidth: highlightedNode === mainNode.id ? 3 : 0,
          borderColor: "#facc15",
        },
      });
    }

    // Add inflow nodes (positioned to the left of main node)
    inflowNodes.forEach((node, index) => {
      graphNodes.push({
        id: node.id,
        name: formatAddress(node.id),
        value: node.amount,
        category: 1, // Inflow category
        symbolSize: highlightedNode === node.id ? 60 : isSmallScreen ? 30 : 40,
        x: centerX - horizontalSpacing, // Left of main node
        y:
          centerY -
          (inflowNodes.length * verticalSpacing) / 2 +
          index * verticalSpacing, // Staggered vertically
        label: {
          show: true,
          position: "left",
          formatter: [
            `{a|${formatAddress(node.id)}}`,
            `{b|${node.entity || "Unknown"}}`,
          ].join("\n"),
          rich: {
            a: {
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              fontSize: isSmallScreen ? 8 : 10,
              lineHeight: 16,
            },
            b: {
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              fontSize: isSmallScreen ? 7 : 9,
              lineHeight: 14,
            },
          },
        },
        itemStyle: {
          color: getNodeColor(node.type, node.entity),
          borderWidth: highlightedNode === node.id ? 3 : 0,
          borderColor: "#facc15",
        },
      });
    });

    // Add outflow nodes (positioned to the right of main node)
    outflowNodes.forEach((node, index) => {
      graphNodes.push({
        id: node.id,
        name: formatAddress(node.id),
        value: node.amount,
        category: 2, // Outflow category
        symbolSize: highlightedNode === node.id ? 60 : isSmallScreen ? 30 : 40,
        x: centerX + horizontalSpacing, // Right of main node
        y:
          centerY -
          (outflowNodes.length * verticalSpacing) / 2 +
          index * verticalSpacing, // Staggered vertically
        label: {
          show: true,
          position: "right",
          formatter: [
            `{a|${formatAddress(node.id)}}`,
            `{b|${node.entity || "Unknown"}}`,
          ].join("\n"),
          rich: {
            a: {
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              fontSize: isSmallScreen ? 8 : 10,
              lineHeight: 16,
            },
            b: {
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              fontSize: isSmallScreen ? 7 : 9,
              lineHeight: 14,
            },
          },
        },
        itemStyle: {
          color: getNodeColor(node.type, node.entity),
          borderWidth: highlightedNode === node.id ? 3 : 0,
          borderColor: "#facc15",
        },
      });
    });

    // Prepare edges for ECharts
    const graphLinks = edges.map((edge) => {
      const isHighlighted =
        highlightedNode &&
        (edge.source === highlightedNode || edge.target === highlightedNode);

      return {
        source: edge.source,
        target: edge.target,
        value: edge.amount,
        label: {
          show: !isSmallScreen, // Hide labels on small screens
          formatter: `${edge.amount.toFixed(4)} BTC`,
          fontSize: isSmallScreen ? 8 : 10,
          color: isDarkMode ? "#9ca3af" : "#6b7280",
        },
        lineStyle: {
          width: Math.max(
            1,
            Math.min(edge.amount * 0.5, isSmallScreen ? 3 : 5)
          ),
          color: isDarkMode ? "#4b5563" : "#9ca3af",
          curveness: 0.2,
          opacity: highlightedNode ? (isHighlighted ? 1 : 0.3) : 1,
        },
      };
    });

    // Define categories for legend
    const categories = [
      { name: "Main Wallet" },
      { name: "Inflow" },
      { name: "Outflow" },
    ];

    return {
      backgroundColor: isDarkMode ? "#111827" : "#ffffff",
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          if (params.dataType === "node") {
            const node = nodes.find((n) => n.id === params.data.id);
            return `
              <div style="font-weight: bold">${node.entity || "Unknown"}</div>
              <div style="font-size: 12px">${node.id}</div>
              <div style="margin-top: 5px">Amount: ${node.amount.toFixed(
                8
              )} BTC</div>
            `;
          } else if (params.dataType === "edge") {
            return `Transaction: ${params.data.value.toFixed(8)} BTC`;
          }
        },
      },
      legend: {
        show: !isSmallScreen, // Hide legend on small screens
        data: categories.map((a) => a.name),
        textStyle: {
          color: isDarkMode ? "#d1d5db" : "#4b5563",
        },
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: "quinticInOut",
      series: [
        {
          type: "graph",
          layout: "none", // Use our custom layout
          data: graphNodes,
          links: graphLinks,
          categories: categories,
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          edgeSymbol: ["none", "arrow"],
          edgeSymbolSize: isSmallScreen ? 6 : 8,
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: isSmallScreen ? 3 : 4,
            },
          },
        },
      ],
    };
  };

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

  const handleChartEvents = {
    click: (params) => {
      if (params.dataType === "node") {
        dispatch(highlightNode(params.data.id));
      }
    },
  };

  const handleZoomIn = () => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      const option = chartInstance.getOption();
      const zoom = option.series[0].zoom || 1;
      chartInstance.setOption({
        series: [
          {
            zoom: zoom * 1.2,
          },
        ],
      });
    }
  };

  const handleZoomOut = () => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      const option = chartInstance.getOption();
      const zoom = option.series[0].zoom || 1;
      chartInstance.setOption({
        series: [
          {
            zoom: zoom * 0.8,
          },
        ],
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
    <div className="relative flex-1 h-full overflow-hidden">
      <ReactECharts
        ref={chartRef}
        option={getOption()}
        style={{ height: "100%", width: "100%" }}
        className="echarts-for-react"
        opts={{ renderer: "svg" }}
        onEvents={handleChartEvents}
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
